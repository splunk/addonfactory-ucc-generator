'''
SSLUtil class
It's singleton class, used to disable/enable ssl, currently, the default setting: ssl is enabled
when we disable ssl, we simply add a ssl stanza from server.conf to disable the ssl, and copy the server.conf into local.
however, server.conf is already in local directory, so when we enable ssl, we can't simply delete the server.conf from local,
we will have to copy back original server.conf.
'''
import os
import shutil
import sys
from helmut.splunk.local import LocalSplunk
from ITSIModule.lib.singleton import singleton

@singleton
class SSLUtil(object):
    def __init__(self):
        self.splunk_home = os.environ["SPLUNK_HOME"]
        # check $Splunk_home/etc/system/local to see if it's exist
        system_local = os.path.join(self.splunk_home, 'etc/system/local')

        if (not os.path.exists(system_local)):
            os.mkdir(system_local)

        # check server.conf
        self.local_server_conf = os.path.join(system_local, 'server.conf')
        self.local_server_conf_backup = os.path.join(system_local, 'server.conf_backup')

    def disable_ssl(self):
            
        # If it's already disabled before, simply return
        if (os.path.exists(self.local_server_conf_backup)):
            return

        #If local/server.conf does not exist
        if (not os.path.exists(self.local_server_conf)):
            with open(self.local_server_conf,'w') as f:
                f.writelines('[sslConfig]\n')
                f.writelines('enableSplunkdSSL = False\n')
            with open(self.local_server_conf_backup,'w') as f:
                f.writelines('[sslConfig]\n')
                f.writelines('enableSplunkdSSL = True\n')
        else:
            # backup first
            shutil.copy(self.local_server_conf, self.local_server_conf_backup)

            with open(self.local_server_conf,'a') as f:
                f.writelines('[sslConfig]\n')
                f.writelines('enableSplunkdSSL = False\n')


        # restart splunk
        splunk_cli = LocalSplunk(self.splunk_home)
        splunk_cli.restart()

    def enable_ssl(self):

        # The logic: if backup file is there, then just copy backup file, then delete the backup file,
        # else we don't need to do anything, it's already enabled
        if (os.path.exists(self.local_server_conf_backup)):
            shutil.copy(self.local_server_conf_backup, self.local_server_conf)
            os.remove(self.local_server_conf_backup)

        # restart splunk
        splunk_cli = LocalSplunk(self.splunk_home)
        splunk_cli.restart()
