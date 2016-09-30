import os
import time
import re
import py
import sys
import time
try:
    import requests
except:
    pass
from helmut.manager.confs import Confs


class StanzaUtil:

    def __init__(self, splunk_home, splunk_cli, logger, is_cloud=False):
        '''
        The constructor of StanzaUtil.

        @param splunk_home: path to splunk_home.
        @type splunk_home: String 
        @param splunk_cli: LocalSplunk instance.
        @type splunk_cli: LocalSplunk
        @param logger: logging object to write the log.
        @type logger: Logging 
        '''
        self.logger = logger
        self.splunk_home = splunk_home
        self.splunk_cli = splunk_cli
        self.is_cloud = is_cloud

    def update_stanza(self, conf_name, stanza_name, namespace, **kvargs):
        '''
        The function is called when updating stanza under a namespace
        @param conf_name: name of the conf file.
        @type conf_name: Connector
        @param stanza_name: name of the stanza.
        @type stanza_name: String 
        @param namespace: namespace.
        @type namespace: String
        @param kvargs: stanza values to update.
        '''
        if self.is_cloud:
            self.add_cloud_stanza(conf_name=conf_name, stanza_name=stanza_name, namespace=namespace, **kvargs)
            
        else:
            if (namespace is not None):
                namespace1 = "admin:" + namespace
            else:
                namespace1 = None

            self.splunk_cli.create_logged_in_connector(
                set_as_default=True, username='admin', password='changeme', sharing='app', owner='admin', app=namespace, namespace=namespace1)
            stanza = self.splunk_cli.confs()[conf_name][stanza_name]

            self.logger.info("in update_stanza")
            for k, v in kvargs.iteritems():
                self.logger.info(" key '%s', value '%s'", k, v)
                stanza[k] = v

    def add_stanza(self, conf_name, stanza_name, namespace, **kvargs):
        '''
        The function is called when creating a new stanza under a namespace
        @param conf_name: name of the confi file.
        @type conf_name: Connector
        @param stanza_name: name of the stanza.
        @type stanza_name: String 
        @param namespace: namespace.
        @type namespace: String
        @param kvargs: stanza values to update.
        '''

        if self.is_cloud:
            self.add_cloud_stanza(conf_name=conf_name, stanza_name=stanza_name, namespace=namespace, **kvargs)
        else:
            if (namespace is not None):
                namespace1 = "admin:" + namespace
            else:
                namespace1 = None

            self.splunk_cli.create_logged_in_connector(
                set_as_default=True, username='admin', password='changeme', sharing='app', owner='admin', app=namespace, namespace=namespace1)
            stanza = self.splunk_cli.confs()[conf_name].create_stanza(stanza_name)
            for k, v in kvargs.iteritems():
                stanza[k] = v

    def update_stanza_2(self, conf_name, stanza_name, namespace, **kvargs):
        '''
        Workaround for the helmut issue  AUTO-1051
        The function is called when updating stanza under a namespace
        @param conf_name: name of the confi file.
        @type conf_name: Connector
        @param stanza_name: name of the stanza.
        @type stanza_name: String 
        @param namespace: namespace.
        @type namespace: String
        @param kvargs: stanza values to update.
        '''

        if self.is_cloud:
            self.add_cloud_stanza(conf_name=conf_name, stanza_name=stanza_name, namespace=namespace, **kvargs)
        else:
            if (namespace is not None):
                namespace1 = "admin:" + namespace
            else:
                namespace1 = None

            conn = self.splunk_cli.create_logged_in_connector(
                    set_as_default=True, username='admin', password='changeme', sharing='app', owner='admin', app=namespace, namespace=namespace1)
            config = Confs(conn)
            stanza = config[conf_name][stanza_name]
            self.logger.info("in update_stanza")
            for k, v in kvargs.iteritems():
                self.logger.info(" key '%s', value '%s'", k, v)
                stanza[k] = v

    def clear_stanza(self, conf_name, stanza_name, namespace, *value):
        '''
        The function is called when updating stanza under a namespace
        @param conf_name: name of the confi file.
        @type conf_name: Connector
        @param stanza_name: name of the stanza.
        @type stanza_name: String 
        @param namespace: namespace.
        @type namespace: String
        @param value: stanza keys to remove.
        @type value: String
        '''
        if self.is_cloud:
            self.clear_cloud_stanza(conf_name, stanza_name, namespace, *value)
            return

        if (namespace is not None):
            namespace1 = "admin:" + namespace
        else:
            namespace1 = None

        self.logger.info("In Remove Stanza")
        self.splunk_cli.create_logged_in_connector(
            set_as_default=True, username='admin', password='changeme', sharing='app', owner='admin', app=namespace, namespace=namespace1)
        stanza = self.splunk_cli.confs()[conf_name][stanza_name]

        for key in value:
            self.logger.info("Removing %s", key)
            stanza.delete_value(key)

    def update_file(self, file_path, file_name, append_text, write=False):
        '''
        Update any file.
        '''
        self.logger.info("CLI : In Update File.")
        file_update = os.path.join(file_path, file_name)
        if not os.path.exists(os.path.dirname(file_update)):
            os.makedirs(os.path.dirname(file_update))

        if write:
            with open(file_update, 'w') as file_opened:
                file_opened.write(append_text)
        else:
            with open(file_update, 'a') as file_opened:
                file_opened.write(append_text)

    def delete_stanza(self, conf_name, stanza_name, namespace):
        '''
        The function is called when creating a new stanza under a namespace
        @param conf_name: name of the confi file.
        @type conf_name: Connector
        @param stanza_name: name of the stanza.
        @type stanza_name: String 
        @param namespace: namespace.
        @type namespace: String
        @param kvargs: stanza values to update.
        '''

        if (namespace is not None):
            namespace1 = "admin:" + namespace
        else:
            namespace1 = None

        self.splunk_cli.create_logged_in_connector(
            set_as_default=True, username='admin', password='changeme', sharing='app', owner='admin', app=namespace, namespace=namespace1)
        self.splunk_cli.confs()[conf_name].delete_stanza(stanza_name)
    
    def add_cloud_stanza(self, conf_name, stanza_name, namespace, **kvargs):
        '''
        Use REST API to create a stanza on Cloud Instance.
        '''
        #STEP 1 is to Create a Stanza Name if it does not Exist.
        url = "https://es-cloud-nightly-test.splunkcloud.com:8089/servicesNS/nobody/"+namespace+'/configs/conf-'+conf_name
        self.logger.info("CREATING A STANZA and the REST URL is %s", url)
        
        r = requests.post(url=url, data={'name':stanza_name}, auth=('admin', 'WhisperAdmin250'), verify=False)
        self.logger.info("The Add Cloud Stanza Response is %s", r.text)
        assert r.status_code == 409 or r.status_code == 201
        
        #STEP 2 is to add the values to the Stanza.
        url = "https://es-cloud-nightly-test.splunkcloud.com:8089/servicesNS/nobody/"+namespace+'/configs/conf-'+conf_name+'/'+stanza_name
        self.logger.info("The REST URL is %s", url)
            
        r = requests.post(url=url, data=kvargs, auth=('admin', 'WhisperAdmin250'), verify=False)
        assert r.status_code == 200
    
    def clear_cloud_stanza(self, conf_name, stanza_name, namespace, *value):
        '''
        Clear the stanza using REST API on Cloud.
        '''
        settings = {}
        for val in value:
            settings[val] = ''
        
        self.add_cloud_stanza(conf_name, stanza_name, namespace, **settings)