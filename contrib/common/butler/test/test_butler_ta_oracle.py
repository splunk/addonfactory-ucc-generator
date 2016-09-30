import os
import sys
import logging

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from butler import CodeGenerator
from butler import Paths

class TestClass:

    logger = logging.getLogger('Test Butler')

    def setup_class(self):
        self.p = Paths(os.path.join(os.path.dirname(__file__), 'TA-oracle'), '3.3.2')
        self.c = ''
        self.c += CodeGenerator.gen_eventtype_test(self.p)
        self.c += CodeGenerator.gen_eventtype_tag_test(self.p)
        self.c += CodeGenerator.gen_props_test(self.p)
        
    def test_eventtype_oracle__maxSessionExceeded(self):
        self.logger.debug("Testing eventtype oracle:maxSessionExceeded.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:maxSessionExceeded\\""')
        assert result >= 0
        
    def test_eventtype_oracle__auth(self):
        self.logger.debug("Testing eventtype oracle:auth.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:auth\\""')
        assert result >= 0
        
    def test_eventtype_oracle__accountManagement(self):
        self.logger.debug("Testing eventtype oracle:accountManagement.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:accountManagement\\""')
        assert result >= 0
        
    def test_eventtype_oracle__memPerf(self):
        self.logger.debug("Testing eventtype oracle:memPerf.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:memPerf\\""')
        assert result >= 0
        
    def test_eventtype_oracle__deadLock(self):
        self.logger.debug("Testing eventtype oracle:deadLock.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:deadLock\\""')
        assert result >= 0
        
    def test_eventtype_oracle__instanceReadWrite(self):
        self.logger.debug("Testing eventtype oracle:instanceReadWrite.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:instanceReadWrite\\""')
        assert result >= 0
        
    def test_eventtype_oracle__database(self):
        self.logger.debug("Testing eventtype oracle:database.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:database\\""')
        assert result >= 0
        
    def test_eventtype_oracle__avgExecutions(self):
        self.logger.debug("Testing eventtype oracle:avgExecutions.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:avgExecutions\\""')
        assert result >= 0
        
    def test_eventtype_oracle__maxProcessExceeded(self):
        self.logger.debug("Testing eventtype oracle:maxProcessExceeded.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:maxProcessExceeded\\""')
        assert result >= 0
        
    def test_eventtype_oracle__internalError(self):
        self.logger.debug("Testing eventtype oracle:internalError.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:internalError\\""')
        assert result >= 0
        
    def test_eventtype_oracle__traceError(self):
        self.logger.debug("Testing eventtype oracle:traceError.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:traceError\\""')
        assert result >= 0
        
    def test_eventtype_oracle__dbIoPerf(self):
        self.logger.debug("Testing eventtype oracle:dbIoPerf.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:dbIoPerf\\""')
        assert result >= 0
        
    def test_eventtype_oracle__libraryCachePerf(self):
        self.logger.debug("Testing eventtype oracle:libraryCachePerf.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:libraryCachePerf\\""')
        assert result >= 0
        
    def test_eventtype_oracle__blockCorrupted(self):
        self.logger.debug("Testing eventtype oracle:blockCorrupted.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:blockCorrupted\\""')
        assert result >= 0
        
    def test_eventtype_oracle__networkPerf(self):
        self.logger.debug("Testing eventtype oracle:networkPerf.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:networkPerf\\""')
        assert result >= 0
        
    def test_eventtype_oracle__oraError(self):
        self.logger.debug("Testing eventtype oracle:oraError.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:oraError\\""')
        assert result >= 0
        
    def test_eventtype_oracle__sga(self):
        self.logger.debug("Testing eventtype oracle:sga.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:sga\\""')
        assert result >= 0
        
    def test_eventtype_oracle__dbFileIoPerf(self):
        self.logger.debug("Testing eventtype oracle:dbFileIoPerf.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:dbFileIoPerf\\""')
        assert result >= 0
        
    def test_eventtype_oracle__tablespaceMetrics(self):
        self.logger.debug("Testing eventtype oracle:tablespaceMetrics.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:tablespaceMetrics\\""')
        assert result >= 0
        
    def test_eventtype_oracle__alertError(self):
        self.logger.debug("Testing eventtype oracle:alertError.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:alertError\\""')
        assert result >= 0
        
    def test_eventtype_oracle__session(self):
        self.logger.debug("Testing eventtype oracle:session.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:session\\""')
        assert result >= 0
        
    def test_eventtype_oracle__connect(self):
        self.logger.debug("Testing eventtype oracle:connect.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:connect\\""')
        assert result >= 0
        
    def test_eventtype_oracle__cpuTimePerf(self):
        self.logger.debug("Testing eventtype oracle:cpuTimePerf.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:cpuTimePerf\\""')
        assert result >= 0
        
    def test_eventtype_oracle__cpuLoadPerf(self):
        self.logger.debug("Testing eventtype oracle:cpuLoadPerf.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:cpuLoadPerf\\""')
        assert result >= 0
        
    def test_eventtype_oracle__instance(self):
        self.logger.debug("Testing eventtype oracle:instance.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:instance\\""')
        assert result >= 0
        
    def test_eventtype_oracle(self):
        self.logger.debug("Testing eventtype oracle.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle\\""')
        assert result >= 0
        
    def test_eventtype_oracle__listenerError(self):
        self.logger.debug("Testing eventtype oracle:listenerError.")

        # run search
        result = self.c.find('"search eventtype=\\"oracle:listenerError\\""')
        assert result >= 0
        
    def test_PRIVILEGE_SYSDBA_tag_privileged(self):
        self.logger.debug("Testing PRIVILEGE SYSDBA tag=privileged.")

        # run search
        result = self.c.find('"search PRIVILEGE=\\"SYSDBA\\" tag=\\"privileged\\"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__database_field_dest(self):
        self.logger.debug("Testing sourcetype oracle:database field=dest.")

        # run search
        result = self.c.find('"search sourcetype=oracle:database dest=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__database_field_dest_regex(self):
        self.logger.debug("Testing sourcetype oracle:database field=dest against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:database dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__database_field_object(self):
        self.logger.debug("Testing sourcetype oracle:database field=object.")

        # run search
        result = self.c.find('"search sourcetype=oracle:database object=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_ORGID(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=ORGID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml ORGID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_COMPID(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=COMPID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml COMPID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_TYPE(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=TYPE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml TYPE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_LEVEL(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=LEVEL.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml LEVEL=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_HOSTID(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=HOSTID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml HOSTID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_MSG(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=MSG.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml MSG=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_ORACODE(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=ORACODE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml ORACODE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_CLIENTIP(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=CLIENTIP.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml CLIENTIP=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_DESTIP(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=DESTIP.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml DESTIP=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_DESTIP_regex(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=DESTIP against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml DESTIP!=\\"\\" | table DESTIP", \'DESTIP\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_dest(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=dest.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml dest=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_dest_regex(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=dest against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_DESTPORT(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=DESTPORT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml DESTPORT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_CLIENT_USER(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=CLIENT_USER.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml CLIENT_USER=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_PROGRAM(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=PROGRAM.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml PROGRAM=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_app(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=app.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml app=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_STATUS(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=STATUS.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml STATUS=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_dest(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=dest.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml dest=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_dest_regex(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=dest against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__xml_field_app(self):
        self.logger.debug("Testing sourcetype oracle:listener:xml field=app.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:xml app=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__xml_field_ORGID(self):
        self.logger.debug("Testing sourcetype oracle:alert:xml field=ORGID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:xml ORGID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__xml_field_COMPID(self):
        self.logger.debug("Testing sourcetype oracle:alert:xml field=COMPID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:xml COMPID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__xml_field_TYPE(self):
        self.logger.debug("Testing sourcetype oracle:alert:xml field=TYPE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:xml TYPE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__xml_field_LEVEL(self):
        self.logger.debug("Testing sourcetype oracle:alert:xml field=LEVEL.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:xml LEVEL=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__xml_field_HOSTID(self):
        self.logger.debug("Testing sourcetype oracle:alert:xml field=HOSTID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:xml HOSTID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__xml_field_MSG(self):
        self.logger.debug("Testing sourcetype oracle:alert:xml field=MSG.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:xml MSG=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__xml_field_MSGID(self):
        self.logger.debug("Testing sourcetype oracle:alert:xml field=MSGID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:xml MSGID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__xml_field_ORACODE(self):
        self.logger.debug("Testing sourcetype oracle:alert:xml field=ORACODE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:xml ORACODE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__sysPerf_field_dest(self):
        self.logger.debug("Testing sourcetype oracle:sysPerf field=dest.")

        # run search
        result = self.c.find('"search sourcetype=oracle:sysPerf dest=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_ORACODE(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=ORACODE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text ORACODE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_CLIENTIP(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=CLIENTIP.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text CLIENTIP=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_DESTIP(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=DESTIP.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text DESTIP=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_DESTIP_regex(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=DESTIP against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text DESTIP!=\\"\\" | table DESTIP", \'DESTIP\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_dest(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=dest.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text dest=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_dest_regex(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=dest against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_DESTPORT(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=DESTPORT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text DESTPORT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_CLIENT_USER(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=CLIENT_USER.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text CLIENT_USER=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_PROGRAM(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=PROGRAM.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text PROGRAM=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_app(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=app.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text app=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_STATUS(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=STATUS.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text STATUS=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_dest(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=dest.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text dest=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_dest_regex(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=dest against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__listener__text_field_app(self):
        self.logger.debug("Testing sourcetype oracle:listener:text field=app.")

        # run search
        result = self.c.find('"search sourcetype=oracle:listener:text app=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_AUDITTYPE(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=AUDITTYPE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml AUDITTYPE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_SESSIONID(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=SESSIONID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml SESSIONID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_STATEMENT(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=STATEMENT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml STATEMENT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_ENTRYID(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=ENTRYID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml ENTRYID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_USERID(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=USERID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml USERID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_DATABASE_USER(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=DATABASE_USER.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml DATABASE_USER=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_OSUSERID(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=OSUSERID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml OSUSERID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_USERHOST(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=USERHOST.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml USERHOST=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_OSPROCESS(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=OSPROCESS.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml OSPROCESS=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_CLIENT_TERMINAL(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=CLIENT_TERMINAL.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml CLIENT_TERMINAL=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_INSTANCE_NUM(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=INSTANCE_NUM.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml INSTANCE_NUM=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_OBJCREATOR(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=OBJCREATOR.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml OBJCREATOR=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_OBJNAME(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=OBJNAME.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml OBJNAME=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_POLICYNAME(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=POLICYNAME.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml POLICYNAME=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_NEWOWNER(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=NEWOWNER.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml NEWOWNER=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_ACTION(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=ACTION.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml ACTION=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_STMTTYPE(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=STMTTYPE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml STMTTYPE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_RETURNCODE(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=RETURNCODE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml RETURNCODE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_AUTHPRIVILEGE(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=AUTHPRIVILEGE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml AUTHPRIVILEGE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_OSPRIVILEGE(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=OSPRIVILEGE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml OSPRIVILEGE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_GRANTEE(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=GRANTEE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml GRANTEE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_PRIVUSED(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=PRIVUSED.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml PRIVUSED=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_PRIVGRANTED(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=PRIVGRANTED.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml PRIVGRANTED=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_DBID(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=DBID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml DBID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_SQLTEXT(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=SQLTEXT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml SQLTEXT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_COMMENTTEXT(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=COMMENTTEXT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml COMMENTTEXT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_CLIENTIP(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=CLIENTIP.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml CLIENTIP=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_CLIENTPORT(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=CLIENTPORT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml CLIENTPORT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_dest(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=dest.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml dest=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_dest_regex(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=dest against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__xml_field_DATABASE_USER(self):
        self.logger.debug("Testing sourcetype oracle:audit:xml field=DATABASE_USER.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:xml DATABASE_USER=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__instance_field_instance_name(self):
        self.logger.debug("Testing sourcetype oracle:instance field=instance_name.")

        # run search
        result = self.c.find('"search sourcetype=oracle:instance instance_name=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__instance_field_instance_version(self):
        self.logger.debug("Testing sourcetype oracle:instance field=instance_version.")

        # run search
        result = self.c.find('"search sourcetype=oracle:instance instance_version=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__alert__text_field_ORACODE(self):
        self.logger.debug("Testing sourcetype oracle:alert:text field=ORACODE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:alert:text ORACODE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_SESSIONID(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=SESSIONID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text SESSIONID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_ACTION(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=ACTION.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text ACTION=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_CLIENT_TERMINAL(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=CLIENT_TERMINAL.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text CLIENT_TERMINAL=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_CLIENT_USER(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=CLIENT_USER.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text CLIENT_USER=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_DATABASE_USER(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=DATABASE_USER.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text DATABASE_USER=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_PRIVILEGE(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=PRIVILEGE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text PRIVILEGE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_STATUS(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=STATUS.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text STATUS=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_ENTRYID(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=ENTRYID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text ENTRYID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_STATEMENT(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=STATEMENT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text STATEMENT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_USERHOST(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=USERHOST.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text USERHOST=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_USERID(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=USERID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text USERID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_RETURNCODE(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=RETURNCODE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text RETURNCODE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_OBJNAME(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=OBJNAME.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text OBJNAME=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_OBJCREATOR(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=OBJCREATOR.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text OBJCREATOR=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_OSUSERID(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=OSUSERID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text OSUSERID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_PRIVUSED(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=PRIVUSED.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text PRIVUSED=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_LOGOFFPREAD(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=LOGOFFPREAD.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text LOGOFFPREAD=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_LOGOFFLWRITE(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=LOGOFFLWRITE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text LOGOFFLWRITE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_LOGOFFDEAD(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=LOGOFFDEAD.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text LOGOFFDEAD=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_SESSIONCPU(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=SESSIONCPU.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text SESSIONCPU=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_DBID(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=DBID.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text DBID=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_COMMENTTEXT(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=COMMENTTEXT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text COMMENTTEXT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_CLIENTIP(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=CLIENTIP.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text CLIENTIP=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_CLIENTPORT(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=CLIENTPORT.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text CLIENTPORT=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_dest(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=dest.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text dest=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__audit__text_field_dest_regex(self):
        self.logger.debug("Testing sourcetype oracle:audit:text field=dest against regex: ^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$.")

        # run search
        result = self.c.find('"search sourcetype=oracle:audit:text dest!=\\"\\" | table dest", \'dest\', \'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$\'')
        assert result >= 0
        
    def test_props_sourcetype_oracle__session_field_session_status(self):
        self.logger.debug("Testing sourcetype oracle:session field=session_status.")

        # run search
        result = self.c.find('"search sourcetype=oracle:session session_status=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__session_field_user(self):
        self.logger.debug("Testing sourcetype oracle:session field=user.")

        # run search
        result = self.c.find('"search sourcetype=oracle:session user=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__session_field_machine(self):
        self.logger.debug("Testing sourcetype oracle:session field=machine.")

        # run search
        result = self.c.find('"search sourcetype=oracle:session machine=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__session_field_wait_state(self):
        self.logger.debug("Testing sourcetype oracle:session field=wait_state.")

        # run search
        result = self.c.find('"search sourcetype=oracle:session wait_state=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__session_field_wait_time(self):
        self.logger.debug("Testing sourcetype oracle:session field=wait_time.")

        # run search
        result = self.c.find('"search sourcetype=oracle:session wait_time=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__session_field_seconds_in_wait(self):
        self.logger.debug("Testing sourcetype oracle:session field=seconds_in_wait.")

        # run search
        result = self.c.find('"search sourcetype=oracle:session seconds_in_wait=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__session_field_last_call_minute(self):
        self.logger.debug("Testing sourcetype oracle:session field=last_call_minute.")

        # run search
        result = self.c.find('"search sourcetype=oracle:session last_call_minute=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__session_field_session_id(self):
        self.logger.debug("Testing sourcetype oracle:session field=session_id.")

        # run search
        result = self.c.find('"search sourcetype=oracle:session session_id=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__trace_field_ORACODE(self):
        self.logger.debug("Testing sourcetype oracle:trace field=ORACODE.")

        # run search
        result = self.c.find('"search sourcetype=oracle:trace ORACODE=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__tablespaceMetrics_field_free_bytes(self):
        self.logger.debug("Testing sourcetype oracle:tablespaceMetrics field=free_bytes.")

        # run search
        result = self.c.find('"search sourcetype=oracle:tablespaceMetrics free_bytes=*"')
        assert result >= 0
        
    def test_props_sourcetype_oracle__tablespaceMetrics_field_tablespace_name(self):
        self.logger.debug("Testing sourcetype oracle:tablespaceMetrics field=tablespace_name.")

        # run search
        result = self.c.find('"search sourcetype=oracle:tablespaceMetrics tablespace_name=*"')
        assert result >= 0
