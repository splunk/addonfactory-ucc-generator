from SplunkRole import SplunkRole


class DeploymentClient(SplunkRole):
    '''
    Set-up a deployment Client.
    '''
    def __init__(self, instance, logger, exceptions):
        
        SplunkRole.__init__(self, instance, logger, exceptions)
    
    def setup(self, deployment_server):
        '''
        Set up the deployment client to connect to the deployment server.
        '''
        try:
            self.logger.info("Setting up Deployment Client %s for Deployment Server %s", self.instance, deployment_server)
            
            cmd = "set deploy-poll " + deployment_server +":8089"+ " -auth admin:changeme"
            err_msg = "Couldn't set-up deployment client for {0} to deployment server: {1}.".format(self.instance, deployment_server)
            self.utils.run_cmd(self.instance, cmd, err_msg, self.splunk)
            self.splunk.restart()
        except Exception, e:
            self.exceptions.append(["Exception found in setup for host:" + self.host, 'Message: ' + e.message])
