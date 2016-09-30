import csv

class MisconfigurationError(Exception):
    pass

class CSVParser(object):
    '''
    CSV Parser to read in CSV file containing settings for server deployment
    '''
    FIELDS = ["host", "role", "username", "splunk_home"]
    ROLES = ["conf_deployer", "indexer", "forwarder", "license_master", "master", "search_head", "deployment_server", "deployment_client"]

    def __init__(self, csv_file, logger, arg_parser):
        self.csv_file = csv_file
        self.logger = logger
        self.arg_parser = arg_parser
        self.servers = []  # List of dictionaries storing the settings for each host

        self.logger.info("Parsing the CSV file %s", self.csv_file)

    def read(self):
        if len(self.servers) != 0:
            return self.servers

        self.check_headers()
        self.logger.info("Reading the values from the CSV file.")
        with open(self.csv_file, 'rU') as f:
            reader = csv.DictReader(f)
            self.logger.info("The values in the CSV file are %s", reader)
            for server in reader:
                row_to_append = self.verify_row(server)
                if row_to_append:
                    self.servers.append(server)
                else:
                    self.logger.info("Invalid row: %s", server)
                    raise MisconfigurationError("Invalid row %s" % server)
            return self.servers

    def check_headers(self):
        self.logger.info("Checking the CSV file headers")
        with open(self.csv_file, 'rU') as f:
            header = f.readline().rstrip().split(',')
            if self.arg_parser.sites:
                if 'site' not in header:
                    self.logger.info("Headers in the CSV file mismatch expected values.")
                    raise MisconfigurationError("Multi-site specified on command line, but 'site' is missing from header of csv")
            for field in self.FIELDS:
                if field not in header:
                    self.logger.info("Headers in the CSV file mismatch expected values.")
                    raise MisconfigurationError("%s missing from header of csv" % field)

    def verify_row(self, row):
        if None in (row['host'], row['role'], row['username'], row['splunk_home']):
            self.logger.info('One or more of the required fields in this row is missing')
            return None
        if row['splunk_home'].startswith('~') or row['splunk_home'].startswith('http'):
            self.logger.info('The splunk_home path cannot start with "~" or "http"')
            return None
        else:
            row['splunk_home'] = row['splunk_home'].rstrip('/')
            row['splunk_home'] = row['splunk_home'].rstrip('\\')
    
        server_roles = row['role'].split(' ')

        for role in server_roles:
            if role not in self.ROLES:
                self.logger.info('%s is not a valid role', role)
                return None

        if 'deployment_server' in server_roles and 'deployment_client' in server_roles:
            self.logger.info("An instance %s cannot be both - deployment server and a deployment client")
            return None
        
        return row