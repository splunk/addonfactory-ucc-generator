from servicenow import ServiceNow
from servicenow import Connection


class EMEvent(ServiceNow.Base):
    __table__ = 'em_event.do'


class SYSEvent(ServiceNow.Base):
    __table__ = 'sysevent.do'


class SnowEventGen(object):
    def __init__(self, username, password, instance, api='JSONv2'):
        self.conn = Connection.Auth(username=username,
                                    password=password,
                                    instance=instance,
                                    api=api)
        self.inc = ServiceNow.Incident(self.conn)
        self.srv = ServiceNow.Server(self.conn)
        self.grp = ServiceNow.Group(self.conn)
        self.chg = ServiceNow.Change(self.conn)
        self.tkt = ServiceNow.Ticket(self.conn)
        self.tsk = ServiceNow.Task(self.conn)
        self.prb = ServiceNow.Problem(self.conn)
        self.eme = EMEvent(self.conn)
        self.sye = SYSEvent(self.conn)
        self.default_config = {'short_description': 'create by sdk',
                               'description': 'auto test',
                               'descriptive_name': 'auto test'}
        self.server_list = [
            self.inc, self.srv, self.grp, self.chg, self.tkt, self.tsk, self.prb, self.eme, self.sye
        ]
        for server in self.server_list:
            server.created_id_list = []

    def clean(self):
        for server in self.server_list:
            for created_id in server.created_id_list:
                server.delete(created_id)

    def _create_and_mark(self, service, config):
        if config is None:
            config = self.default_config
        created_res = service.create(config)
        records = created_res['records']
        sys_id = records[0]['sys_id']
        service.created_id_list.append(sys_id)

    def create_incident(self, config=None):
        self._create_and_mark(self.inc, config)

    def create_change(self, config=None):
        self._create_and_mark(self.chg, config)

    def create_server(self, config=None):
        self._create_and_mark(self.srv, config)

    def create_ticket(self, config=None):
        self._create_and_mark(self.tkt, config)

    def create_task(self, config=None):
        self._create_and_mark(self.tsk, config)

    def create_problem(self, config=None):
        self._create_and_mark(self.prb, config)

    def create_em_event(self, config=None):
        self._create_and_mark(self.eme, config)

    def create_em_sysevent(self, config=None):
        self._create_and_mark(self.sye, config)

    def gen(self, type='incident', number=1, config=None):
        for i in xrange(number):
            method_name = 'create_' + type
            getattr(self, method_name)(config)


if __name__ == '__main__':
    username = 'admin'
    password = 'splunk123'
    instance = 'https://ven01449.service-now.com'

    eg = SnowEventGen(username, password, instance)
    eg.create_em_event()
