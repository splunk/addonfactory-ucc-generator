#! /usr/bin/python
# -*- coding: UTF-8 -*-

#  Copyright 2013 Luiko Czub, TestLink-API-Python-client developers
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
# ------------------------------------------------------------------------

import xmlrpclib
import testlinkerrors
from .testlinkhelper import TestLinkHelper, VERSION
from .testlinkargs import getMethodsWithPositionalArgs, getArgsForMethod
from .testlinkdecorators import decoApiCallAddAttachment,\
decoApiCallAddDevKey, decoApiCallWithoutArgs, \
decoMakerApiCallReplaceTLResponseError, decoMakerApiCallWithArgs 


class TestlinkAPIGeneric(object): 
    """ client for XML-RPC communication between Python and TestLink 
        Implements the TestLink API methods as generic PY methods with 
        error handling.
        
        Allows the configuration of arguments for these API method as positional
        or optional arguments.
        
        Changes of TestLink API methods should be implemented in this base class.
        Service Methods like "countProjects" should be implemented on subclasses
        like TestlinkAPIClient
    """   
    
    __slots__ = ['server', 'devKey', '_server_url', '_positionalArgNames']
 
    __version__ = VERSION
    __author__ = 'Luiko Czub, TestLink-API-Python-client developers'

    def __init__(self, server_url, devKey, **args):
        transport=args.get('transport')
        encoding=args.get('encoding')
        verbose=args.get('verbose',0)
        allow_none=args.get('allow_none',0)
        self.server = xmlrpclib.Server(server_url, transport, encoding, 
                                       verbose, allow_none)
        self.devKey = devKey
        self._server_url = server_url
        self._positionalArgNames = getMethodsWithPositionalArgs()
        
        
        
    # GENERIC API CALLS - using decorators
    # http://stackoverflow.com/questions/1015307/python-bind-an-unbound-method
    
    # Method definitions should be build either with 
    # @decoMakerApiCallWithArgs(argNamesPositional, argNamesOptional)
    #    for calling a server method with arguments 
    #    - argNamesPositional = list default positional args
    #    - argNamesOptional   = list additional optional args
    #    to check the server response, if it includes TestLink Error Codes or 
    #    an empty result (which raise a TLResponseError) 
    # or   
    # @decoApiCallWithoutArgs
    #    for calling server methods without arguments
    #    to check the server response, if it includes TestLink Error Codes or 
    #    an empty result (which raise a TLResponseError)
    #  
    # Additional behavior could be added with
    #    
    # @decoApiCallAddDevKey
    #    - to expand the parameter list with devKey key/value pair
    #      before calling the server method
    # @decoMakerApiCallReplaceTLResponseError(replaceCode)
    #    - to catch an TLResponseError after calling the server method and 
    #      with an empty list
    #      - replaceCode : TestLink Error Code, which should be handled 
    #                      default is None for "Empty Results"
    # @decoApiCallAddAttachment(methodAPI):
    #     - to add an mandatory argument 'attachmentfile'
    #       - attachmentfile is a python file descriptor pointing to the file 
    #     - to expand parameter list with key/value pairs
    #          'filename', 'filetype', 'content'
    #       from 'attachmentfile' before calling the server method


    @decoApiCallAddDevKey            
    @decoMakerApiCallWithArgs(['testplanid'])
    def getLatestBuildForTestPlan(self):
        """ Gets the latest build by choosing the maximum build id for a specific test plan """
    
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanid'], 
                              ['testcaseid', 'testcaseexternalid'])
    def getLastExecutionResult(self):
        """ Gets the result of LAST EXECUTION for a particular testcase on a test plan, 
 but WITHOUT checking for a particular build """

    @decoApiCallWithoutArgs
    def sayHello(self):
        """ Lets you see if the server is up and running """

    def ping(self):
        """ alias for methodAPI sayHello """ 
        return self.sayHello()
    
    @decoMakerApiCallWithArgs(['str'])
    def repeat(self):
        """ Repeats a message back """
    
    @decoApiCallWithoutArgs
    def about(self):
        """ Gives basic information about the API """

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanid', 'buildname'], 
                              ['buildnotes'])
    def createBuild(self):
        """ Creates a new build for a specific test plan """

    @decoApiCallAddDevKey            
    @decoMakerApiCallWithArgs()
    def getProjects(self):
        """ Gets a list of all projects """

    @decoMakerApiCallReplaceTLResponseError()            
    @decoApiCallAddDevKey
    @decoMakerApiCallWithArgs(['testprojectid'])
    def getProjectTestPlans(self):
        """ Gets a list of test plans within a project   
        
        returns an empty list, if no testplan is assigned """

    @decoMakerApiCallReplaceTLResponseError()          
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanid'])
    def getBuildsForTestPlan(self):
        """ Gets a list of builds within a test plan 
        
        returns an empty list, if no build is assigned """

    @decoMakerApiCallReplaceTLResponseError()          
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanid'])
    def getTestSuitesForTestPlan(self):
        """ List test suites within a test plan alphabetically
        
        returns an empty list, if no build is assigned """
        
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testprojectname', 'testcaseprefix'],
                              ['notes', 'active', 'public', 'options'])
    def createTestProject(self):
        """ Create a test project  
        
        options : dictionary with keys
                    requirementsEnabled, testPriorityEnabled, 
                    automationEnabled,inventoryEnabled
                 and values 0 (false) and 1 (true)     """
        
    @decoMakerApiCallReplaceTLResponseError()          
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testsuiteid'], ['deep', 'details'])
    def getTestCasesForTestSuite(self):
        """ List test suites within a test plan alphabetically
        
        details - default is 'simple', 
                  use 'full' if you want to get summary,steps & expected_results
                  or 'only_id', if you just need an ID list
        
        returns an empty list, if no build is assigned """

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testcasename'], 
                    ['testsuitename', 'testprojectname', 'testcasepathname'])
    def getTestCaseIDByName(self):
        """ Find a test case by its name 
        
        testcasepathname : Full test case path name, 
                starts with test project name , pieces separator -> ::   
        server return can be a list or a dictionary 
        - optional arg testprojectname seems to create a dictionary response """
 
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testcasename', 'testsuiteid', 'testprojectid', 
                               'authorlogin', 'summary', 'steps'], 
                ['preconditions', 'importance', 'execution', 'order', 
                 'internalid', 'checkduplicatedname', 'actiononduplicatedname'])
    def createTestCase(self):
        """ Create a test case
                        
            steps is a list with dictionaries , example
            [{'step_number' : 1, 'actions' : "action A" , 
                'expected_results' : "result A", 'execution_type' : 0},
                 {'step_number' : 2, 'actions' : "action B" , 
                'expected_results' : "result B", 'execution_type' : 1},
                 {'step_number' : 3, 'actions' : "action C" , 
                'expected_results' : "result C", 'execution_type' : 0}]
            """

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanid', 'status'], 
                ['testcaseid', 'testcaseexternalid', 'buildid', 'buildname', 
                 'platformid', 'platformname', 'notes', 'guess', 'bugid', 
                 'customfields', 'overwrite'])
    def reportTCResult(self):
        """ Reports a result for a single test case

        args variations: testcaseid - testcaseexternalid
                         buildid - buildname
                         platformid - platformname
        
        customfields : dictionary with customfields names + values
            VERY IMPORTANT: value must be formatted in the way it's written to db
             """

#   /**
#    * turn on/off testMode
#    *
#    * This method is meant primarily for testing and debugging during development
#    * @param struct $args
#    * @return boolean
#    * @access protected
#    */  
#   public function setTestMode($args)

    @decoMakerApiCallReplaceTLResponseError()          
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanid'], 
                ['testcaseid', 'keywordid', 'keywords', 'executed', 'assignedto', 
                 'executestatus', 'executiontype', 'getstepinfo', 'details'])
    def getTestCasesForTestPlan(self):
        """ List test cases linked to a test plan
        
        details - default is 'full', 
                  'simple', 'details' ??
        
        returns an empty list, if no build is assigned """

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testcaseexternalid', 'version', 'testprojectid', 
                               'customfieldname'], ['details'])
    def getTestCaseCustomFieldDesignValue(self):
        """ Gets value of a Custom Field with scope='design' for a given Test case
        
        details =  changes output information
            null or 'value' => just value
            'full' => a map with all custom field definition
                          plus value and internal test case id
            'simple' => value plus custom field name, label, and type (as code).
            
        attention - be careful with testcaseexternalid - it must include an '-'. 
        otherwise TL (<=1.9.8) returns 
        <ProtocolError for xmlrpc.php: 500 Internal Server Error>  """

#    /**
#     * Add a test case version to a test plan 
#     *
#     * @param args['testprojectid']
#     * @param args['testplanid']
#     * @param args['testcaseexternalid']
#     * @param args['version']
#     * @param args['platformid'] - OPTIONAL Only if  test plan has no platforms
#     * @param args['executionorder'] - OPTIONAL
#     * @param args['urgency'] - OPTIONAL
#     *
#     */
#   public function addTestCaseToTestPlan($args)

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testprojectid',
                               'testplanid', 'testcaseexternalid', 'version'],
                              ['platformid', 'executionorder', 'urgency'])
    def addTestCaseToTestPlan(self):
        """ Add a test case version to a test plan """
        
    @decoMakerApiCallReplaceTLResponseError(7008)            
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testprojectid'])
    def getFirstLevelTestSuitesForTestProject(self):
        """ get set of test suites AT TOP LEVEL of tree on a Test Project
                            
        returns an empty list, if no suite is assigned (api error 7008) 
        - details see comments for decoMakerApiCallReplaceTLResponseError """

#    /**
#     *  Assign Requirements to a test case 
#     *  we can assign multiple requirements.
#     *  Requirements can belong to different Requirement Spec
#     *         
#   *  @param struct $args
#   *  @param string $args["devKey"]
#   *  @param int $args["testcaseexternalid"]
#   *  @param int $args["testprojectid"] 
#     *  @param string $args["requirements"] 
#     *                array(array('req_spec' => 1,'requirements' => array(2,4)),
#     *                array('req_spec' => 3,'requirements' => array(22,42))
#     *
#     */
#    public function assignRequirements($args)

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs([], ['testcaseid', 'testcaseexternalid'])
    def getTestCaseAttachments(self):
        """ Gets attachments for specified test case.
        The attachment file content is Base64 encoded. To save the file to disk 
        in client, Base64 decode the content and write file in binary mode.  """

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testprojectid', 'testsuitename', 'details'], 
                              ['parentid', 'order', 'checkduplicatedname', 
                               'actiononduplicatedname'])
    def createTestSuite(self):
        """ create a test suite """

    @decoApiCallAddDevKey            
    @decoMakerApiCallWithArgs(['testprojectname'])
    def getTestProjectByName(self):
        """ Gets info about target test project """

    @decoApiCallAddDevKey            
    @decoMakerApiCallWithArgs(['testprojectname', 'testplanname'])
    def getTestPlanByName(self):
        """ Gets info about target test project """


    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs([], ['testcaseid', 'testcaseexternalid', 'version'])
    def getTestCase(self):
        """ get test case specification using external or internal id
        
        attention - be careful with testcaseexternalid - it must include an '-'. 
        otherwise TL (<=1.9.8) returns 
        <ProtocolError for xmlrpc.php: 500 Internal Server Error>"""

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanname', 'testprojectname'], 
                              ['note', 'active', 'public'])
    def createTestPlan(self):
        """ create a test plan """


    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['nodeid'])
    def getFullPath(self):
        """ Gets full path from the given node till the top using nodes_hierarchy_table
        
        nodeid = can be just a single id or a list with ids 
                 ATTENTION: id must be an integer. """

#    /**
#    * delete an execution
#    *
#    * @param struct $args
#    * @param string $args["devKey"]
#    * @param int $args["executionid"]
#    *
#    * @return mixed $resultInfo 
#    *         [status]  => true/false of success
#    *         [id]      => result id or error code
#    *         [message]  => optional message for error message string
#    * @access public
#    */  
#    public function deleteExecution($args)


    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testsuiteid'])
    def getTestSuiteByID(self):
        """ Return a TestSuite by ID """

    @decoMakerApiCallReplaceTLResponseError()            
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testsuiteid'])
    def getTestSuitesForTestSuite(self):
        """ get list of TestSuites which are DIRECT children of a given TestSuite
        
        returns an empty list, if no TestSuite is assigned """

    @decoMakerApiCallReplaceTLResponseError(3041)            
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanid'])
    def getTestPlanPlatforms(self):
        """ Returns the list of platforms associated to a given test plan
        
        returns an empty list, if no platform is assigned (api error 3041) 
        - details see comments for decoMakerApiCallReplaceTLResponseError """

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testplanid'])
    def getTotalsForTestPlan(self):
        """ Gets the summarized results grouped by platform. """

    @decoMakerApiCallWithArgs(['user'])
    def doesUserExist(self):
        """ Checks if user name exists 
        returns true if everything OK, otherwise error structure """
               
    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['devKey'])
    def checkDevKey(self):
        """ check if Developer Key exists 
        returns true if everything OK, otherwise error structure """
        
# /**
#  * Uploads an attachment for a Requirement Specification.
#  * 
#  * The attachment content must be Base64 encoded by the client before sending it.
#  * 
#  * @param struct $args
#  * @param string $args["devKey"] Developer key
#  * @param int $args["reqspecid"] The Requirement Specification ID
#  * @param string $args["title"] (Optional) The title of the Attachment 
#  * @param string $args["description"] (Optional) The description of the Attachment
#  * @param string $args["filename"] The file name of the Attachment (e.g.:notes.txt)
#  * @param string $args["filetype"] The file type of the Attachment (e.g.: text/plain)
#  * @param string $args["content"] The content (Base64 encoded) of the Attachment
#  * 
#  * @since 1.9beta6
#  * @return mixed $resultInfo an array containing the fk_id, fk_table, title, 
#  * description, file_name, file_size and file_type. If any errors occur it 
#  * returns the error map.
#  */
# public function uploadRequirementSpecificationAttachment($args)

    @decoApiCallAddAttachment            
    @decoMakerApiCallWithArgs(['reqspecid'], 
                    ['title', 'description', 'filename', 'filetype', 'content'])
    def uploadRequirementSpecificationAttachment(self):
        """ Uploads an attachment for a Requirement Specification.
        
        reqspecid - The Requirement Specification ID
        
        mandatory non api args: attachmentfile
        - python file descriptor pointing to the file
        - !Attention - on WINDOWS use binary mode for none text file
          see http://docs.python.org/2/tutorial/inputoutput.html#reading-and-writing-files
        
        default values for filename, filetype, content are determine from 
        ATTACHMENTFILE, but user could overwrite it, if user want to store the
        attachment with a different name 
        """
        
    @decoApiCallAddAttachment            
    @decoMakerApiCallWithArgs(['requirementid'], 
                    ['title', 'description', 'filename', 'filetype', 'content'])
    def uploadRequirementAttachment(self):
        """ Uploads an attachment for a Requirement.
        
        requirementid - The Requirement ID
        
        mandatory non api args: attachmentfile
        - python file descriptor pointing to the file
        - !Attention - on WINDOWS use binary mode for none text file
          see http://docs.python.org/2/tutorial/inputoutput.html#reading-and-writing-files
        
        default values for filename, filetype, content are determine from 
        ATTACHMENTFILE, but user could overwrite it, if user want to store the
        attachment with a different name 
        """
        
    @decoApiCallAddAttachment            
    @decoMakerApiCallWithArgs(['testprojectid'], 
                    ['title', 'description', 'filename', 'filetype', 'content'])
    def uploadTestProjectAttachment(self):
        """ Uploads an attachment for a Test Project.
        
        testprojectid - The Test Project ID
        
        mandatory non api args: attachmentfile
        - python file descriptor pointing to the file
        - !Attention - on WINDOWS use binary mode for none text file
          see http://docs.python.org/2/tutorial/inputoutput.html#reading-and-writing-files
        
        default values for filename, filetype, content are determine from 
        ATTACHMENTFILE, but user could overwrite it, if user want to store the
        attachment with a different name 
        """
        
    @decoApiCallAddAttachment            
    @decoMakerApiCallWithArgs(['testsuiteid'], 
                    ['title', 'description', 'filename', 'filetype', 'content'])
    def uploadTestSuiteAttachment(self):
        """ Uploads an attachment for a Test Suite.
        
        testsuiteid - The Test Suite ID
        
        mandatory non api args: attachmentfile
        - python file descriptor pointing to the file
        - !Attention - on WINDOWS use binary mode for none text file
          see http://docs.python.org/2/tutorial/inputoutput.html#reading-and-writing-files
        
        default values for filename, filetype, content are determine from 
        ATTACHMENTFILE, but user could overwrite it, if user want to store the
        attachment with a different name 
        """

    @decoApiCallAddAttachment            
    @decoMakerApiCallWithArgs(['testcaseid'], 
                    ['title', 'description', 'filename', 'filetype', 'content'])
    def uploadTestCaseAttachment(self):
        """ Uploads an attachment for a Test Case.
        
        testcaseid - Test Case INTERNAL ID
        
        mandatory non api args: attachmentfile
        - python file descriptor pointing to the file
        - !Attention - on WINDOWS use binary mode for none text file
          see http://docs.python.org/2/tutorial/inputoutput.html#reading-and-writing-files
        
        default values for filename, filetype, content are determine from 
        ATTACHMENTFILE, but user could overwrite it, if user want to store the
        attachment with a different name 
        """

    @decoApiCallAddAttachment            
    @decoMakerApiCallWithArgs(['executionid'], 
                    ['title', 'description', 'filename', 'filetype', 'content'])
    def uploadExecutionAttachment(self):
        """ Uploads an attachment for an execution
        
        executionid - execution ID
        
        mandatory non api args: attachmentfile
        - python file descriptor pointing to the file
        - !Attention - on WINDOWS use binary mode for none text file
          see http://docs.python.org/2/tutorial/inputoutput.html#reading-and-writing-files
        
        default values for filename, filetype, content are determine from 
        ATTACHMENTFILE, but user could overwrite it, if user want to store the
        attachment with a different name 
        """


    @decoApiCallAddAttachment            
    @decoMakerApiCallWithArgs(['fkid', 'fktable'], 
                    ['title', 'description', 'filename', 'filetype', 'content'])
    def uploadAttachment(self):
        """ Uploads an attachment for an execution
        
        fkid    - The Attachment Foreign Key ID
        fktable - The Attachment Foreign Key Table

        mandatory non api args: attachmentfile
        - python file descriptor pointing to the file
        - !Attention - on WINDOWS use binary mode for none text file
          see http://docs.python.org/2/tutorial/inputoutput.html#reading-and-writing-files
        
        default values for filename, filetype, content are determine from 
        ATTACHMENTFILE, but user could overwrite it, if user want to store the
        attachment with a different name 
        """

#     /**
#      * Gets value of a Custom Field for a entity in a given scope (e.g.: a custom
#      * field for a test case in design scope).
#      *
#      * BUGID-4188: feature request - new method - getTestSuiteCustomFieldValue
#      *
#      * @param struct $args
#      * @param string $args["devKey"]: used to check if operation can be done.
#      *                                if devKey is not valid => abort.
#      *
#      * @param string $args["customfieldname"]: custom field name
#      * @param int     $args["tprojectid"]: project id
#      * @param string $args["nodetype"]: note type (testcase, testsuite, ...)
#      * @param int    $args["nodeid"]: node id (test case version id, project id, ...)
#      * @param string $args["scope"]: cf scope (execution, design or testplan_design)
#      * @param int    $args["executionid"]: execution id
#      * @param int    $args["testplanid"]: test plan id
#      * @param int    $args["linkid"]: link id for nodes linked at test plan design scope
#      *
#      * @return mixed $resultInfo
#      *
#      * @access protected
#      */
#     protected function getCustomFieldValue($args)

#     /**
#      * Gets a Custom Field of a Test Case in Execution Scope.
#      * 
#      * @param struct $args
#    * @param string $args["devKey"]: used to check if operation can be done.
#    *                                if devKey is not valid => abort.
#    *
#    * @param string $args["customfieldname"]: custom field name
#    * @param int    $args["tprojectid"]: project id
#    * @param int    $args["version"]: test case version id
#    * @param int    $args["executionid"]: execution id
#    * @param int    $args["testplanid"]: test plan id
#    *
#    * @return mixed $resultInfo
#    *
#    * @access public
#      */
#   public function getTestCaseCustomFieldExecutionValue($args)
     
#   /**
#     * Gets a Custom Field of a Test Case in Test Plan Design Scope.
#    *
#    * @param struct $args
#    * @param string $args["devKey"]: used to check if operation can be done.
#    *                                 if devKey is not valid => abort.
#    *
#    * @param string $args["customfieldname"]: custom field name
#    * @param int    $args["testcaseid"]: project id
#    * @param int    $args["version"]: test case version id
#    * @param int    $args["testplanid"]: test plan id
#    * @param int    $args["linkid"]: link id (important!)
#    *
#    * @return mixed $resultInfo
#    *
#    * @access public
#    */
#   public function getTestCaseCustomFieldTestPlanDesignValue($args)
               
#   /**
#    * Gets a Custom Field of a Test Suite in Design Scope.
#    *
#    * @param struct $args
#     * @param string $args["devKey"]: used to check if operation can be done.
#     *                                 if devKey is not valid => abort.
#    *
#    * @param string $args["customfieldname"]: custom field name
#    * @param int   $args["tprojectid"]: project id
#     * @param int    $args["testsuiteid"]: test suite id
#    * 
#    * @return mixed $resultInfo
#    *
#    * @access public
#    */
#   public function getTestSuiteCustomFieldDesignValue($args)
               
#   /**
#    * Gets a Custom Field of a Test Plan in Design Scope.
#    *
#    * @param struct $args
#    * @param string $args["devKey"]: used to check if operation can be done.
#    *                                if devKey is not valid => abort.
#    *
#    * @param string $args["customfieldname"]: custom field name
#    * @param int    $args["tprojectid"]: project id
#    * @param int    $args["testplanid"]: test plan id
#    *
#    * @return mixed $resultInfo
#    *
#    * @access public
#    */
#   public function getTestPlanCustomFieldDesignValue($args)

#     /**
#      * Gets a Custom Field of a Requirement Specification in Design Scope.
#      * 
#      * @param struct $args
#      * @param string $args["devKey"]: used to check if operation can be done.
#      *                                if devKey is not valid => abort.
#      *
#      * @param string $args["customfieldname"]: custom field name
#      * @param int    $args["tprojectid"]: project id
#      * @param int    $args["reqspecid"]: requirement specification id
#      * 
#      * @return mixed $resultInfo
#      * 
#      * @access public
#      */
#     public function getReqSpecCustomFieldDesignValue($args)
               
#     /**
#      * Gets a Custom Field of a Requirement in Design Scope.
#      * 
#      * @param struct $args
#      * @param string $args["devKey"]: used to check if operation can be done.
#      *                                if devKey is not valid => abort.
#      *
#      * @param string $args["customfieldname"]: custom field name
#      * @param int    $args["tprojectid"]: project id
#      * @param int    $args["requirementid"]: requirement id
#      * 
#      * @return mixed $resultInfo
#      * 
#      * @access public
#      */
#     public function getRequirementCustomFieldDesignValue($args)

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['action', 'steps'], 
                              ['testcaseexternalid', 'testcaseid', 'version'])
    def createTestCaseSteps(self):
        """ creates new test steps or updates existing test steps 
        
        action - possible values: 'create','update','push'
            create: if step exist NOTHING WILL BE DONE
            update: if step DOES NOT EXIST will be created else will be updated.
            push: NOT IMPLEMENTED YET (TL 1.9.9)
                  shift down all steps with step number >= step number provided
                  and use provided data to create step number requested.
        steps - each element is a hash with following keys
            step_number,actions,expected_results,execution_type
        args variations: testcaseid - testcaseexternalid
        version - optional if not provided LAST ACTIVE version will be used
                  if all versions are INACTIVE, then latest version will be used. 
        """

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testcaseexternalid', 'steps'], 
                              ['version'])
    def deleteTestCaseSteps(self):
        """ deletes test cases steps
        
        steps - each element is a step_number
        version - optional if not provided LAST ACTIVE version will be used
        """

#   /**
#    * Update value of Custom Field with scope='design' for a given Test case
#    *
#    * @param struct $args
#    * @param string $args["devKey"]: used to check if operation can be done.
#    *                                if devKey is not valid => abort.
#    *
#    * @param string $args["testcaseexternalid"]:  
#    * @param string $args["version"]: version number  
#    * @param string $args["testprojectid"]: 
#    * @param string $args["customfields"] - optional
#    *               contains an map with key:Custom Field Name, value: value for CF.
#    *               VERY IMPORTANT: value must be formatted in the way it's written to db,
#    *               this is important for types like:
#    *
#    *               DATE: strtotime()
#    *               DATETIME: mktime()
#    *               MULTISELECTION LIST / CHECKBOX / RADIO: se multipli selezione ! come separatore
#    *
#    *
#    *               these custom fields must be configured to be writte during execution.
#    *               If custom field do not meet condition value will not be written
#    *
#    * @return mixed null if everything ok, else array of IXR_Error objects
#    *         
#    * @access public
#    */    
#   public function updateTestCaseCustomFieldDesignValue($args)

#   /**
#    * Update execution type for a test case version
#    *
#    * @param struct $args
#    * @param string $args["devKey"]: used to check if operation can be done.
#    *                                if devKey is not valid => abort.
#    *
#    * @param string $args["testcaseexternalid"]:  
#    * @param string $args["version"]: version number  
#    * @param string $args["testprojectid"]: 
#      * @param string $args["executiontype"]: TESTCASE_EXECUTION_TYPE_MANUAL,
#      *                     TESTCASE_EXECUTION_TYPE_AUTOMATIC
#      *
#      * @return mixed null if everything ok, else array of IXR_Error objects
#    *         
#    * @access public
#    */    
#   public function setTestCaseExecutionType($args)

#   /**
#    *
#    */
#   public function getExecCountersByBuild($args)

    @decoApiCallAddDevKey               
    @decoMakerApiCallWithArgs(['testprojectname', 'platformname'], 
                              ['notes'])
    def createPlatform(self):
        """ Creates a platform for test project """


    @decoMakerApiCallReplaceTLResponseError(replaceValue={})            
    @decoApiCallAddDevKey
    @decoMakerApiCallWithArgs(['testprojectid'])
    def getProjectPlatforms(self):
        """ Gets a dictionary of platforms for a project   
        
        returns an empty dictionary, if no platform is assigned """

    @decoApiCallAddDevKey
    @decoMakerApiCallWithArgs(['testplanid', 'platformname'])
    def addPlatformToTestPlan(self):
        """ Adds a platform to a test plan """

    @decoApiCallAddDevKey
    @decoMakerApiCallWithArgs(['testplanid', 'platformname'])
    def removePlatformFromTestPlan(self):
        """ Removes a platform from a test plan """

#   /**
#    * if everything ok returns an array on just one element with following user data
#    *
#    * firstName,lastName,emailAddress,locale,isActive,defaultTestprojectID,
#    * globalRoleID 
#    * globalRole    array with role info
#    * tprojectRoles array  
#    * tplanRoles    array
#    * login 
#    * dbID
#    * loginRegExp
#    *
#    * ATTENTION: userApiKey will be set to NULL, because is worst that access to user password
#    * 
#    * @param struct $args
#    * @param string $args["devKey"]   
#    * @param string $args["user"]   Login Name   
#    * 
#    * @return mixed $ret
#    * 
#    */
#   public function getUserByLogin($args)


#   /**
#    * if everything ok returns an array on just one element with following user data
#    *
#    * firstName,lastName,emailAddress,locale,isActive,defaultTestprojectID,
#    * globalRoleID 
#    * globalRole    array with role info
#    * tprojectRoles array  
#    * tplanRoles    array
#    * login 
#    * dbID
#    * loginRegExp
#    *
#    * ATTENTION: userApiKey will be set to NULL, because is worst that access to user password
#    * 
#    * @param struct $args
#    * @param string $args["devKey"]   
#    * @param string $args["userid"]   user ID as present on users table, column ID
#    * 
#    * @return mixed $ret
#    * 
#    */
#   public function getUserByID($args)

    @decoApiCallAddDevKey
    @decoMakerApiCallWithArgs(['testcaseexternalid'], 
            ['version', 'testcasename','summary', 'preconditions', 'steps', 
             'importance', 'executiontype', 'status', 'estimatedexecduration', 
             'user'])
    def updateTestCase(self):
        """ Update an existing test case
        
        steps     array - each element is a hash with following keys
                  step_number,actions,expected_results,execution_type
        user      login name used as updater - optional
                  if not provided will be set to user that request update

        Not all test case attributes will be able to be updated using this method
 """

    
    #
    #  public methods for general server calls
    #                                   

    def callServerWithPosArgs(self, methodNameAPI, *argsPositional, **argsOptional):
        """ concat argsPositional and argsOptional before calling 
        server method methodNameAPI """

        if argsPositional:
            # search keys for values and store these pairs in a dictionary
            dictPos = self._convertPostionalArgs(methodNameAPI, argsPositional)
            # extent optional keys+values with positional keys+vales  
            argsOptional.update(dictPos)
        # now, start calling the server with basic error handling
        response = self._callServer(methodNameAPI, argsOptional)
        # check if response is not empyt and not includes error code
        self._checkResponse(response, methodNameAPI, argsOptional) 
        # seams to be ok, so let give them the data
        return response

    #
    #  internal methods for general server calls
    #                                   

    def _callServer(self, methodNameAPI, argsAPI=None):
        """ call server method METHODNAMEAPI with error handling and 
        returns the responds
        internal method - should not be called directly """
        
        response = None
        try:
            if argsAPI is None:
                response = getattr(self.server.tl, methodNameAPI)()
            else:
                response = getattr(self.server.tl, methodNameAPI)(argsAPI)
        except (IOError, xmlrpclib.ProtocolError), msg:
            new_msg = 'problems connecting the TestLink Server %s\n%s' %\
            (self._server_url, msg) 
            raise testlinkerrors.TLConnectionError(new_msg)
        except xmlrpclib.Fault, msg:
            new_msg = 'problems calling the API method %s\n%s' %\
            (methodNameAPI, msg) 
            raise testlinkerrors.TLAPIError(new_msg)

        return response
    
        
    def _convertPostionalArgs(self, methodName, valueList):        
        """ Returns a dictionary with values from VALUELIST and keys for 
            the expected positional argumenst of selfs method METHODNAME 
            
            if VALUELIST does not match the expectation, an error
            testlinkerrors.TLArgError is raised             """
            
        if not methodName in self._positionalArgNames:
            new_msg = '%s - missing positional args configuration' %\
            (methodName)
            raise testlinkerrors.TLArgError(new_msg)
            
        nameList = self._positionalArgNames[methodName]
        length_NameList = len(nameList)
        length_ValueList = len(valueList)
        
        if length_NameList != length_ValueList:
            new_msg = '%s - mismatching number of positional args %i vs %i' %\
            (methodName, length_NameList, length_ValueList)
            new_msg = '%s\n expected args: %s' % (new_msg, ', '.join(nameList))
            raise testlinkerrors.TLArgError(new_msg)
        return {nameList[x] : valueList[x] for x in range(len(nameList)) }
    
    def _getAttachmentArgs(self, attachmentfile):
        """ returns dictionary with key/value pairs needed, to transfer 
            ATTACHMENTFILE via the api to into TL
            ATTACHMENTFILE: python file descriptor pointing to the file """
        import mimetypes
        import base64
        import os.path
        return {'filename':os.path.basename(attachmentfile.name),
                'filetype':mimetypes.guess_type(attachmentfile.name)[0],
                'content':base64.encodestring(attachmentfile.read())
                }

    
    def _checkResponse(self, response, methodNameAPI, argsOptional):
        """ Checks if RESPONSE is empty or includes Error Messages
            Will raise TLRepsonseError in this case """
        if response:
            try:
                if 'code' in response[0]:
                    raise testlinkerrors.TLResponseError(
                                    methodNameAPI, argsOptional,
                                    response[0]['message'], response[0]['code'])
            except (TypeError, KeyError):
                # if the reponse has not a [{..}] structure, the check
                #    'code' in response[0]
                # raise an error. Following causes are ok
                # TypeError: raised from doesUserExist, cause the postiv 
                #            response is simply 'True'
                # KeyError: raise from uploadExecutionAttachment, cause the 
                #           positiv response is directly a dictionary
                pass
        else:
            raise testlinkerrors.TLResponseError(methodNameAPI, argsOptional,
                                                 'Empty Response! ')
            
            
        
            
    
    #
    #  ADDITIONNAL FUNCTIONS
    #                                   

    def _apiMethodArgNames(self, methodNameAPI):
        """ returns triple with arg name lists for api METHODNAME
            1. positional api arg names
            2. optional api arg names
            3. other (non api) name
        """
        # collect arg names 
        posArgNames = self._positionalArgNames.get(methodNameAPI, [])
        otherArgs = ([],[])
        try:
            otherArgs = getArgsForMethod(methodNameAPI, posArgNames)
        except testlinkerrors.TLArgError:
            # no API args registered for methodName 
            pass
        return (posArgNames, otherArgs[0], otherArgs[1])
        
    def whatArgs(self, methodNameAPI):
        """ returns for METHODNAME a description with 
            - positional, optional and other (non api) mandatory args
            - methods doc/help string
        """
        
        # collect arg names 
        (posArgNames, optArgNames, manArgNames) = \
                        self._apiMethodArgNames(methodNameAPI)
            
        # get method doc string
        ownMethod = True
        docString = None
        argSeparator = ''
        try:
            apiMethod = self.__getattribute__(methodNameAPI)
            docString = apiMethod.__doc__
        except AttributeError:
            # no real method defined for methodNameAPI
            ownMethod = False
            
        # now we start to build the description
        # first the method name
        methDescr = ''
        if not ownMethod:
            methDescr = "callServerWithPosArgs('%s'" % methodNameAPI
            argSeparator = ', '
            if not optArgNames:
                optArgNames = ['apiArg']
        else:
            methDescr = "%s(" % methodNameAPI

        # description pos and mandatory args
        manArgNames.extend(posArgNames) 
        if manArgNames:
            tmp_l = ['<%s>' % x for x in manArgNames]
            methDescr += '%s%s' % (argSeparator, ", ".join(tmp_l))
            argSeparator = ', '
        # description optional args
        if optArgNames:
            tmp_l = ['%s=<%s>' % (x,x) for x in optArgNames]
            methDescr += '%s[%s]' % (argSeparator, "], [".join(tmp_l))
            
        # closing the method call
        methDescr += ")" 

        # now append methods docstring
        if docString:
            methDescr += "\n%s" % docString 
                        
        return methDescr

    def __str__(self):
        message = """
TestLink API - class %s - version %s
@authors: %s

Current connection settings
 Server URL: %s
 DevKey    : %s
"""
        return message % (self.__class__.__name__, self.__version__, 
                          self.__author__, self._server_url, self.devKey)

    
if __name__ == "__main__":
    tl_helper = TestLinkHelper()
    tl_helper.setParamsFromArgs()
    myTestLink = tl_helper.connect(TestlinkAPIGeneric)
    print myTestLink
    print myTestLink.about()



