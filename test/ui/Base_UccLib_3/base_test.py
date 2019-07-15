from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.login import LoginPage
from utils import get_orca_deployment_urls, backend_retry
import pytest
import requests
import time
import traceback
import logging
import os
# requests.urllib3.disable_warnings()
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

def customize_fixture(
        browser="firefox", urls=None,
        debug=False, cred=("admin", "Chang3d!"), scope="function" ):
    """
    Customize the fixture. Call the function from the test case file to customize the testcase.
    The parameter provided to the function will only be effective if no pytest args were provided while execution
        :param browsers: list of browser for which all the testcases should be executed
        :param urls: urls of the Splunk instance. {"web": ..., "mgmt": ... } 
        :param debug: True -> the browser should be found from local machine. False -> RemoteDrivers.
        :param cred: Splunk credentials as tuple (username, password)
        :param scope: scope of the fixture. possible_values: [function, class, module]. Handles when the browser should be started and exited
    """
    global splunk_urls, local_run, username, password, driver
    # Parameter closure

    driver = browser
    splunk_urls = urls or dict()
    local_run = debug
    username, password = cred
    logger.debug("custom_fixture args:: browser={browser}, urls={urls}, debug={debug}, cred={cred}, scope={scope}".format(
        browser=browser, urls=urls, debug=debug, cred=cred, scope=scope
    ))

    # Fixture
    @pytest.fixture(
        scope=scope
    )
    def test_helper(request):

        global splunk_urls, local_run, username, password, driver
        # Configure pytest parameters, if provided

        if request.config.getoption("--browser"):
            driver = request.config.getoption("--browser")
            logger.debug("--browser={}".format(driver))

        if request.config.getoption("--web_url") and request.config.getoption("--mgmt_url"):
            splunk_urls["web"] = request.config.getoption("--web_url")
            logger.debug("--web_url={}".format(splunk_urls["web"]))

            splunk_urls["mgmt"] = request.config.getoption("--mgmt_url")
            logger.debug("--mgmt_url={}".format(splunk_urls["mgmt"]))
        elif not splunk_urls:
            logger.debug("--web_url & --mgmt_url not provided. Reading orca deployment")
            splunk_urls = get_orca_deployment_urls()
            
        if request.config.getoption("--local"):
            local_run = True
            logger.debug("--debug")

        if request.config.getoption("--user") and request.config.getoption("--password"):
            username = request.config.getoption("--user")
            password = request.config.getoption("--password")
            logger.debug("--user={}".format(username))
            logger.debug("--password={}".format(password))

        test_case = driver + "_" + request.node.nodeid.split("::")[-1]

        logger.info("Calling SeleniumHelper for test_case={test_case} with:: browser={driver}, urls={splunk_urls}, debug={local_run}, cred=({username},{password})".format(
            driver=driver, splunk_urls=splunk_urls, local_run=local_run, username=username, password=password, test_case=test_case
        ))

        # 3 Try to configure selenium & Login to splunk instance
        for try_number in range(3):
            last_exc = Exception()
            try:
                helper = SeleniumHelper(driver, urls=splunk_urls, debug=local_run, cred=(username, password), test_case=test_case)
                request.node.selenium_helper = helper
                break
            except Exception as e:
                last_exc = e
                logger.warn("Failed to configure the browser or login to Splunk instance for - Try={} \nTRACEBACK::{}".format(try_number, traceback.format_exc()))
        else:
            logger.error("Could not connect to Browser or login to Splunk instance. Please check the logs for detailed error of each retry")
            raise(last_exc)

        def fin():
            logger.info("Quiting browser..")
            helper.browser.quit()

            if not local_run:
                logger.debug("Notifying the status of the testcase to SauceLabs...")
                try:
                    if hasattr(request.node, 'report'):
                        helper.update_saucelab_job(request.node.report.failed)
                    else:
                        logger.info("Could not notify to sauce labs because scope of fixture is not set to function")
                except:
                    logger.warn("Could not notify to Saucelabs \nTRACEBACK::{}".format(traceback.format_exc()))
 
        request.addfinalizer(fin)
        return helper
    
    return test_helper

class SeleniumHelper(object):
    """
    The helper class provides the Remote Browser
    """

    def __init__(self, browser, urls=None, debug=False, cred=("admin", "Chang3d!"), test_case=None):
        self.urls = urls
        self.web_url = urls["web"]
        self.mgmt_url = urls["mgmt"]
        self.cred = cred
        self.test_case = test_case
        if not debug:
            # Using Saucelabs
            self.init_sauce_env_variables()

        try:
            if browser == "firefox":
                if debug:
                    self.browser = webdriver.Firefox()
                else:
                    self.browser = webdriver.Remote(
                    command_executor='https://ondemand.saucelabs.com:443/wd/hub',
                    desired_capabilities=self.get_sauce_firefox_opts()) 

            elif browser == "chrome":
                if debug:
                    self.browser = webdriver.Chrome()
                else:
                    self.browser = webdriver.Remote(
                    command_executor = 'https://ondemand.saucelabs.com:443/wd/hub',
                    desired_capabilities = self.get_sauce_chrome_opts())

            elif browser == "IE":
                if debug:
                    self.browser = webdriver.Ie(capabilities=self.get_local_ie_opts())
                else:
                    self.browser = webdriver.Remote(
                    command_executor = 'https://ondemand.saucelabs.com:443/wd/hub',
                    desired_capabilities = self.get_sauce_ie_opts())
            elif browser == "safari":
                if debug:
                    self.browser = webdriver.Safari()
                else:
                    self.browser = webdriver.Remote(
                    command_executor = 'https://ondemand.saucelabs.com:443/wd/hub',
                    desired_capabilities = self.get_sauce_safari_opts())
            else:
                raise Exception("No valid browser found.! expected=[firefox, chrome, safari], got={}".format(browser))
        except Exception as e:
            raise e

        try:
            self.browser_session = self.browser.session_id
            self.login_to_splunk(*self.cred)
            self.session_key = self.start_session(*self.cred)
        except:
            self.browser.quit()
            self.update_saucelab_job(False)
            raise

    def init_sauce_env_variables(self):
        # Read Environment variables to fetch saucelab credentials
        try:
            self.sauce_username = os.environ['SAUCE_USERNAME']
            self.sauce_access_key = os.environ['SAUCE_PASSWORD']
            try:
                # If the execution is in local env with Saucelabs but without Jenkins
                self.jenkins_build = os.environ['JENKINS_JOB_ID']
            except:
                self.jenkins_build = "Local Run"
        except:
            raise Exception("SauceLabs Credentials not found in the environment. Please recheck Jenkins withCredentials block.")

    def get_sauce_opts(self):
        # Get saucelab default options
        sauce_options = {
            'screenResolution': '1280x768',
            'seleniumVersion': '3.141.0',
            # best practices involve setting a build number for version control
            'build': self.jenkins_build,
            'name': self.test_case,
            'username': self.sauce_username,
            'accessKey': self.sauce_access_key,
            # setting sauce-runner specific parameters such as timeouts helps
            # manage test execution speed.
            'maxDuration': 1800,
            'commandTimeout': 300,
            'idleTimeout': 1000,
            'tunnelIdentifier': 'sauce-ha-tunnel',
            'parenttunnel':'qtidev'
        }
        return sauce_options

    def get_sauce_ie_opts(self):
        sauce_options = {
            'build': self.jenkins_build,
            'name': self.test_case,
            'username': self.sauce_username,
            'accessKey': self.sauce_access_key,
            'tunnelIdentifier': 'sauce-ha-tunnel',
            'parenttunnel':'qtidev',
            'platformName': 'Windows 10',
            'browserName': 'internet explorer',
            'seleniumVersion': '3.141.0',
            'iedriverVersion': '3.141.0',
            'maxDuration': 1800,
            'commandTimeout': 300,
            'idleTimeout': 1000
        }
        ie_opts = {
            'platformName': 'Windows 10',
            'browserName': 'internet explorer',
            'browserversion': '11.285',
            'iedriverVersion': "3.141.0",
            'sauce:options': sauce_options 
        }
        return ie_opts

    def get_local_ie_opts(self):
        capabilities = DesiredCapabilities.INTERNETEXPLORER
        capabilities['se:ieOptions'] = {}
        capabilities['ignoreZoomSetting'] = True
        capabilities['se:ieOptions']['ie.ensureCleanSession'] = True
        capabilities['requireWindowFocus'] = True
        capabilities['nativeEvent'] = False
        return capabilities

    def get_sauce_firefox_opts(self):
        firefox_opts = {
            'platformName': 'Windows 10',
            'browserName': 'firefox',
            'browserVersion': 'latest',
            'sauce:options': self.get_sauce_opts()
        }
        return firefox_opts

    def get_sauce_chrome_opts(self):
        chrome_opts = {
            'platformName': 'Windows 10',
            'browserName': 'chrome',
            'browserVersion': 'latest',
            'goog:chromeOptions': {'w3c': True},
            'sauce:options': self.get_sauce_opts()
        }
        return chrome_opts

    def get_sauce_safari_opts(self):
        sauce_opts = self.get_sauce_opts()
        sauce_opts["screenResolution"] = "1024x768"
        safari_opts = {
            'platformName': 'macOS 10.12',
            'browserName': 'safari',
            'browserVersion': 'latest',
            'sauce:options': sauce_opts
        }
        return safari_opts

    def login_to_splunk(self, *cred):
        try:
            login_page = LoginPage(self.browser, self.urls)
            login_page.login.login(*cred)
        except:
            self.browser.save_screenshot("login_error.png")
            raise

    @backend_retry(3)
    def start_session(self, username, password):
        res = requests.post(self.mgmt_url + '/services/auth/login?output_mode=json',
                            data={'username': username, 'password': password }, verify=False)
        try:
            res = res.json()
        except:
            raise Exception("Could not parse the content returned from Management Port. Recheck the mgmt url.")
        if (len(res.get("messages", [])) > 0) and (res["messages"][0].get("type") == "WARN"):
            raise Exception("Could not connect to the Splunk instance, verify credentials")

        session_key = str(res["sessionKey"])
        return session_key

    def update_saucelab_job(self, status):
        data = '{"passed": false}' if status else '{"passed": true}'
        response = requests.put('https://saucelabs.com/rest/v1/{}/jobs/{}'.format(
                        self.sauce_username, self.browser_session), 
                        data=data, 
                        auth=(self.sauce_username, self.sauce_access_key))
        response = response.json()
        logger.info("SauceLabs job_id={}".format(response.get("id")))
        logger.info("SauceLabs Video_url={}".format(response.get("video_url")))


class UccTester(object):
    """
    The default setup and teardown methods can be added here.
    Use in case if some additional configuration should be added to all the test cases
    """
