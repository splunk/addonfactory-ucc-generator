import os
import sys
import stat
import pytest
from helmut_lib.StanzaUtil import StanzaUtil
from helmut.ssh.connection import SSHConnection
from helmut.ssh.utils import SSHFileUtils
from helmut.splunk_factory.splunkfactory import SplunkFactory
from helmut.util.ymlparser import YMLParser


class SShUtil(StanzaUtil):

    def __init__(self, logger):
        """
        Constructor of the SShUtil object.
        """
        self.logger = logger

        """ Parse the yml file to find the remote host, splunk home etc."""
        self.logger.info(
            "pytest.config.conf_file: '%s'", pytest.config.conf_file)

        self.splunk_home = YMLParser.extract_key_values(
            pytest.config.conf_file)['splunk_home']
        self.logger.info("self.splunk_home: '%s' ", self.splunk_home)

        splunk_web = pytest.config.getvalue('splunkweb')
        self.logger.info("The Splunk Web is %s", splunk_web)

        self.hosts = YMLParser.get_hosts(pytest.config.conf_file)
        self.hosts = [item for item in self.hosts.hosts]
        self.logger.info("The HOSTS ARE %s", self.hosts)

        self.host = [
            host for host in self.hosts if host.host_name in splunk_web][0]
        self.host_name = self.host.host_name
        self.logger.info("The HOST NAME is %s", self.host_name)

        self.cloud_instance = False

        if self.host_name.find('splunkcloud') != -1:
            key_path = os.path.join(
                os.environ['SOLN_ROOT'], 'common', 'test', 'helmut_lib', 'infra_whisper.key')
            cmd = "chmod 400 " + key_path
            os.system(cmd)
            self.conn = SSHConnection(host=self.host_name, port=22,
                                      user=self.host.ssh_user, password=self.host.ssh_password,
                                      domain=self.host.ssh_domain, identity=key_path)
            self.cloud_instance = True
            self.logger.info("This is running on a CLOUD instance")

        else:
            self.conn = SSHConnection(host=self.host_name, port=22,
                                      user=self.host.ssh_user, password=self.host.ssh_password,
                                      domain=self.host.ssh_domain, identity=None)
            self.logger.info("This is running on an ON-PREM instance")

        self.connect()

        self.splunk_conn = SplunkFactory.getSplunk(
            self.splunk_home, connection=self.conn)
        self.ssh_file_utils = SSHFileUtils(self.conn)

        StanzaUtil.__init__(
            self, self.splunk_home, self.splunk_conn, self.logger, self.cloud_instance)

    def connect(self):
        '''
        Make an SSH connection.
        '''
        self.conn.connect()

        if self.cloud_instance:
            self.conn.execute('sudo su splunk')

    def disconnect(self):
        '''
        Disconnect an SSH Connection.
        '''
        # If it is a cloud instance, we need to exit
        # as splunk user.
        if self.cloud_instance:
            self.conn.execute("exit")
        self.conn.disconnect()

    def copy_file(self, browser, app, from_file, to_file=None, directory="local"):

        self.logger.info("In copy_file")
        self.logger.debug("Running on this platform: " + sys.platform)

        if ("system" in app):
            path = os.path.join(self.splunk_home, "etc")
        else:
            path = os.path.join(self.splunk_home, "etc", "apps")

        copyto_dir = os.path.join(path,  app, directory)

        if to_file is None:
            to_file = from_file
        self.logger.info(
            "Copying" + to_file + "to this directory: " + copyto_dir)
        self.logger.info(
            "Copying" + from_file + "from this directory: " + os.getcwd())
        # grab the latest file from builds dir
        file_tocopy = os.path.join(os.getcwd(), "data", from_file)
        os.chmod(file_tocopy, stat.S_IRWXU)

        if file_tocopy == None:
            self.logger.error(
                "glob.glob returned None for " + os.path.join(os.getcwd(), "data", from_file))
            return None
        else:
            self.logger.debug("glob.glob returned " + str(file_tocopy))

        self.logger.debug("Copying file: " + str(file_tocopy[0]))

        cmd = 'python -c  "import os;import sys;sys.stdout.write(str(os.path.isdir(\'' + \
            copyto_dir + '\')))"'
        (code, stdout, stderr) = self.conn.execute(cmd)
        if 'True' not in (stdout):
            cmd = 'python -c  "import os;import sys;sys.stdout.write(str(os.mkdir(\'' + \
                copyto_dir + '\', 0755)))"'
            (code, stdout, stderr) = self.conn.execute(cmd)
            if 'True' in stdout:
                self.logger.info("created folder : " + copyto_dir)
            else:
                self.logger.info("folder creation failed : " + copyto_dir)

        #os.mkdir(copyto_dir, 0755)
        cmd = 'python -c  "import os;import sys;sys.stdout.write(str(os.chmod(\'' + \
            copyto_dir + '\', stat.S_IRWXU)))"'
        (code, stdout, stderr) = self.conn.execute(cmd)

        copyto_dir = os.path.join(copyto_dir, to_file)

        if self.cloud_instance:
            # Step 1. Login as ubuntu user

            self.logger.info(
                "Exiting as Splunk user on Cloud %s", self.conn.execute("exit"))

            # Step 2: Copy the file as Ubuntu user and change permissions
            # to copy as Splunk user to SplunkHome destination.
            temp_dest = "/home/ubuntu"
            self.ssh_file_utils.send(file_tocopy, temp_dest)
            self.logger.info("Changing the Permissions of File %s", self.conn.execute(
                "chmod 777 /home/ubuntu/" + from_file))

            # Step3: Login as Splunk user and copy the file to destination.
            # Then reset the permissions on the file.
            file_src = "/home/ubuntu/" + from_file
            file_dest = copyto_dir
            self.logger.info(
                "Logging in as Splunk User %s", self.conn.execute("sudo su splunk"))
            cmd = "cp " + file_src + " " + file_dest
            self.logger.info(
                "Copying the file to destination. Result is: %s", self.conn.execute(cmd))
            self.logger.info("Changing the permissions back %s", self.conn.execute(
                "chmod 00700 " + copyto_dir))
            return

        # get solution on local machine
        self.ssh_file_utils.send(file_tocopy, copyto_dir)

        self.logger.info("Done copy_file")

    def move_file(self, app, from_file, to_file=None, directory="local", directory2="local"):
        self.logger.info("In move_file")
        self.logger.debug("Running on this platform: " + sys.platform)
        if ("system" in app):
            path = os.path.join(self.splunk_home, "etc")
        else:
            path = os.path.join(self.splunk_home, "etc", "apps")

        moveto_dir = os.path.join(path,  app, directory)
        file_tomove = os.path.join(path,  app, directory2, from_file)
        if to_file is None:
            to_file = from_file
        self.logger.info(
            "Moving" + to_file + "to this directory: " + moveto_dir)
        self.logger.info(
            "Moving" + from_file + "from this directory: " + file_tomove)

        moveto_dir = os.path.join(moveto_dir, to_file)
        self.ssh_file_utils.move_file(file_tomove, moveto_dir)

    def get_list_of_files_in_dir_by_date(self, browser, app, directory="local"):
        self.logger.info("In get_content")
        self.logger.debug("Running on this platform: " + sys.platform)

        if ("system" in app):
            path = os.path.join(self.splunk_home, "etc")
        else:
            path = os.path.join(self.splunk_home, "etc", "apps")

        dir_path = os.path.join(path,  app, directory)

        self.logger.info("getting list of files from : " + dir_path)
        return self.ssh_file_utils.get_list_of_files_in_dir_by_date(dir_path)

    def get_file_contents(self, browser, app, file, directory="local"):
        self.logger.info("In get_content")
        self.logger.debug("Running on this platform: " + sys.platform)

        if ("system" in app):
            path = os.path.join(self.splunk_home, "etc")
        else:
            path = os.path.join(self.splunk_home, "etc", "apps")

        file = os.path.join(path,  app, directory, file)

        self.logger.info("file to get content from " + file)
        return self.ssh_file_utils.get_file_contents(file)

    def restart_splunk(self, browser):

        self.logger.info("In restart_splunk")
        self.splunk_conn.restart()
        self.logger.info("Done restart_splunk")

    def remove_file(self, browser, app, filename, directory="local"):
        self.logger.info("In remove_dir")

        self.logger.info("Running on this platform: " + sys.platform)

        if ("system" in app):
            path = os.path.join(self.splunk_home, "etc")
        else:
            path = os.path.join(self.splunk_home, "etc", "apps")

        rm_file = os.path.join(path, app,  directory,  filename)

        if sys.platform.startswith("win"):
            cmd = 'python -c  "import os;import sys;sys.stdout.write(str(os.remove(rm_file)))"'
            (code, stdout, stderr) = self.conn.execute(cmd)
            self.logger.info(
                "Removing file on windows code:'%s', stdout:'%s', stderr:'%s'", code, stdout, stderr)
        else:
            self.ssh_file_utils.delete_file(rm_file)

    def remove_splunk_db_file(self, browser, db_path="/usr/local/bamboo/splunk-db/modinputs/threatlist", file_name=None):
        self.logger.info("In remove_splunk_db_file")

        self.logger.info("Running on this platform: " + sys.platform)

        if (db_path):
            rm_file = os.path.join(db_path, file_name)

        if sys.platform.startswith("win"):
            cmd = 'python -c  "import os;import sys;sys.stdout.write(str(os.remove(rm_file)))"'
            (code, stdout, stderr) = self.conn.execute(cmd)
            self.logger.info(
                "Removing file on windows code:'%s', stdout:'%s', stderr:'%s'", code, stdout, stderr)
        else:
            try:
                self.ssh_file_utils.delete_file(rm_file)
            except:
                self.logger.info(
                    "Unable to delete file:'%s'", rm_file)
