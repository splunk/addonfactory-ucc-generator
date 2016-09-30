#!/usr/bin/env python


################################################################################









# THIS IS NOW DEPRECATED.
#PLEASE DO NOT USE THIS TOOL.
#WE REPLACED THIS WITH A BETTER AND A NEW TOOL AppPandaNew under:
#https://git.splunk.com/projects/SOLN/repos/common/browse/AppPandaNew











################################################################################


################################################################################
# A wrapper utility script for running app builds & tests inside of Bamboo
# Copyright 2012 Splunk, Inc.
################################################################################
# $Id$
# $Revision$
# $Author$
################################################################################
from glob import glob
from optparse import OptionParser
import fileinput
import logging
import os
import platform
import re
import shutil
import stat
import subprocess as SP
import sys
import tarfile
import tempfile
import urllib2

is_windows_host =   (platform.system() == 'Windows')
is_darwin_host  =   (platform.system() == 'Darwin')
app_panda_dir   =   os.getcwd()
log             =   None
bamboo_dir      =   "/usr/local/bamboo"

#####################################################
#Parse command line arguments using optparse module.
#Possible arguments for app-panda.py:
#--auto-ports
#--branch : To select the branch you need to install.
#--bootstrap
#--disable_splunk 
#--disable_splunkweb 
#--enable_FIPS 
#--PRODUCT 
#--splunkd_port 
#--splunkweb_port 
#--install_license 
#--plat_pkg  :  The platform package that you need to install.
#--preserve_indexes 
#--preserve_splunk : Using this will not re-install Splunk.
#--pytest_dir 
#--splunk_home : This the location where Splunk is instlled. 
#--splunk_db 
#--appdir : This path is used to install apps. Eg: /usr/local/bamboo/splunk/solutions/ess/mainline/test/demo_lighthttpd
#--testdir : Use this to specify the directory(s) or file(s) where your tests exist and to run these tests using pytest.
#Use --testdir ONLY if you want this script also to run UI tests! 
#--pytest_args  
#--testscript
#--install_apps : Using this will install Splunk and also apps( ES, Stream).
#--leave_running
#--verbose 
#--version : Use this select the version of Splunk you need to install.
#--clean_splunkdb
#Examples of using app-panda.py:
#Windows: Install Splunk ONLY:  app-panda.py --splunk_home C:\bamboo\splunk_install --version current_nightly --install_apps --enable_FIPS 
#Windows Install Splunk and APPS: app-panda.py --splunk_home C:\bamboo\splunk_install --version current_nightly --enable_FIPS --appdir /foob/bar
#Linux: Install Splunk ONLY : app-panda.py --splunk_home /usr/local/bamboo/splunk_install --version current_nightly --install_apps --enable_FIPS
#Linux: Install Splunk and APPS : app-panda.py --splunk_home /usr/local/bamboo/splunk_install --version current_nightly --enable_FIPS --appdir /foo/bar
#####################################################

def get_optargs():
    parser = OptionParser()

    _txt = 'pass "--auto-ports" to splunk on startup'
    parser.add_option('--auto-ports', dest='auto_ports', help=_txt, action='store_true')

    _txt = 'Download & install the latest Splunk pkg built from this branch.'
    _txt += ' Note that "--version" takes precedence over "--branch"'
    _txt += ' and "--branch" is ignored if "--preserve_splunk" is supplied.'
    parser.add_option('--branch', dest='branch', help=_txt, default='current')

    _txt = '"--bootstrap" is ignored since all app plans are bootstrapped'
    parser.add_option('--bootstrap', dest='bootstrap', help=_txt, action='store_true')

    _txt = 'Don\'t start splunk before running tests'
    parser.add_option('--disable_splunk', dest='disable_splunk', help=_txt, action='store_true')

    parser.add_option('--disable_splunkweb', dest='disable_splunkweb', action='store_true')
    parser.add_option('--enable_FIPS', dest='enable_FIPS', action='store_true')
    parser.add_option('--PRODUCT', dest='PRODUCT', default='splunk')
    parser.add_option('--splunkd_port', dest='splunkd_port', help=_txt)
    parser.add_option('--splunkweb_port', dest='splunkweb_port', help=_txt)
    parser.add_option('--install_license', dest='install_license', action='store_true')
    #parser.add_option('--forwarder_version', dest='forwarder_version')

    _txt ="Fetch a pkg for a particular platform"
    parser.add_option('--plat_pkg', dest='plat_pkg', help=_txt)

    _txt ="Don't wipe splunk indexes"
    parser.add_option('--preserve_indexes', dest='preserve_indexes', help=_txt, action='store_true')

    _txt = 'Use an existing installation of Splunk to install apps'
    parser.add_option('--preserve_splunk', dest='preserve_splunk', help=_txt, action='store_true')
    
    _text = "Clean splunk_db."
    parser.add_option('--clean_splunkdb', dest='clean_splunkdb', help=_txt, action='store_true')

    _txt = 'where pytest is or should be installed (<pytest_dir>/bin/py.test)'
    parser.add_option('--pytest_dir', dest='pytest_dir', help=_txt)

    _txt = 'where Splunk is or should be installed. This needs to be specified here or in the runtime env.'
    parser.add_option('--splunk_home', dest='splunk_home', help=_txt)

    parser.add_option('--splunk_db', dest='splunk_db', help=_txt)
    parser.add_option('--appdir', dest='appdir')
    parser.add_option('--testdir', dest='testdir')
    parser.add_option('--pytest_args', dest='pytest_args')
    parser.add_option('--testscript', dest='testscript')
    parser.add_option('--install_apps', dest='install_apps', action='store_true')
    parser.add_option('--leave_running', dest='leave_running', action='store_true')

    _txt = 'emit extra runtime info'
    parser.add_option('--verbose', dest='debug', help=_txt, action='store_true')

    _txt = 'The Splunk version to download & install.'
    _txt += ' Note that "--version" takes precedence over "--branch"'
    _txt += ' and "--version" is ignored if "--preserve_splunk" is supplied.'
    parser.add_option('--version', dest='version', help=_txt)

    return parser

#####################################################
#Main function that calls other helper functions.
#####################################################

def main():

    print "THIS IS NOW DEPRECATED. WE REPLACED THIS WITH A BETTER AND NEW TOOL - AppPandaNew under https://git.splunk.com/projects/SOLN/repos/common/browse/AppPandaNew"
    sys.exit(0)
    (opts, args) = get_optargs().parse_args()

    if opts.debug == True:
        config_logger(logging.DEBUG)
    else:
        config_logger(logging.INFO)

    log.debug('CMD: %s', ' '.join(sys.argv))
    log.debug('PWD: %s', os.getcwd())

    opts.splunk_home = get_splunk_home(opts)
    opts.p4_bin      = get_p4_bin()

    for _m in re.findall("'([^']+?)': (?!None)([^,]+)", str(opts)):
        log.debug('option: --%s = %s' % (_m[0], _m[1]))

    for _m in re.findall("'([^']+?)': (?!None)([^,]+)", str(os.environ)):
        log.debug('env: %s=%s' % (_m[0], _m[1]))
    
    #Maybe Splunk is running, Stop it!
    stop_splunk(opts)
    
    if opts.clean_splunkdb:
        log.info("Removing splunk_db=%s", opts.splunk_db)
        if os.path.exists(opts.splunk_db):
            remove_recursive(opts.splunk_db)
    
    if not opts.preserve_splunk:
        install_splunk(opts)
    
    if opts.appdir:
        install_splunk_apps(opts)
    else:
        log.debug("Not installing apps as --appdir is not specified.")

    if not opts.leave_running:
        stop_splunk(opts)
    else:
        start_splunk(opts)
    
    #Run tests that are in opts.dir directory using pytest.
    if opts.testdir:
	   run_tests(opts)
    
    sys.exit()

#####################################################
#Responsible for installing Splunk Enterprise.
#####################################################

def install_splunk(opts):
    if opts.preserve_indexes:
        if is_windows_host:
            splunk_path = os.path.join(opts.splunk_home, "var", "lib", "splunk")
            splunk_path = '\\\\'.join(splunk_path.split("\\"))
            all_splunk_path = splunk_path +'\\\\'+'*'
        else:
            splunk_path = os.path.join(opts.splunk_home, "var", "lib", "splunk")
            all_splunk_path = os.path.join(splunk_path,'*')

        if os.path.exists(splunk_path):
            index_backup_dir = tempfile.mkdtemp()
            for _g in glob(all_splunk_path):
                shutil.move(_g, index_backup_dir)
        else:
            opts.preserve_indexes = False

    #If splunk_home exists, then uninstall splunk completely.
    if os.path.lexists(opts.splunk_home):
        uninstall_splunk(opts)

    #Install Splunk Enterprise.
    # Determine which pkg we need & get the pkg from releases.splunk.com
    splunk_pkg_url = get_splunk_pkg_url(opts)
    log.info('Splunk package url: %s' % splunk_pkg_url)
    
    try:
        pkg_file_data = urllib2.urlopen(splunk_pkg_url)

        # Determine the pkg file name & write the file to disk
        _tmp = pkg_file_data.info()['content-disposition']
        pkg_file_name = re.search('filename=(.+)$', _tmp).group(1)
        log.info('Splunk package name: %s' % pkg_file_name)
        
        _file = open(pkg_file_name, 'wb')
        _file.write(pkg_file_data.read())
        _file.close()
    except:
        sys.exit('Error fetching %s' % splunk_pkg_url)

    #Install Splunk using the installer downloaded.
    if is_windows_host:
        _cmd = "msiexec /i "+os.path.join(os.getcwd(), pkg_file_name)+" AGREETOLICENSE=yes"+" INSTALLDIR="+opts.splunk_home+" LAUNCHSPLUNK=0 /qn"
        _ret = run_cmd_shell(_cmd, required=True)
        log.info('STDOUT: %s' % _ret['STDOUT'])
        log.info('STDERR: %s' % _ret['STDERR'])

    #Move the msi file to splunk_home to use it to uninstall Splunk when
    # we need to clean install newer splunk build.
        shutil.copyfile(pkg_file_name,os.path.join(opts.splunk_home,"Uninstaller.msi"))
        os.remove(pkg_file_name)
    else:
        #For non-windows OS.
        #Create a temp directory to move the installer file.    
        _tmpdir = tempfile.mkdtemp()

        if pkg_file_name.endswith(".Z"):
            _cmd = ['gtar', 'xzf', os.path.join(os.getcwd(), pkg_file_name), '--delay-directory-restore']
            _ret = run_cmd(_cmd, required=False, cwd=_tmpdir)
            log.info('STDOUT: %s' % _ret['STDOUT'])
            log.info('STDERR: %s' % _ret['STDERR'])
        else:
            tarfile.open(pkg_file_name, 'r:gz').extractall(path=_tmpdir)

        shutil.copytree(glob('%s/*' % _tmpdir)[0], opts.splunk_home)
        remove_recursive(_tmpdir)
        os.remove(pkg_file_name)

    # optionally disable splunkweb
    if opts.disable_splunkweb:
        web_conf_file = os.path.join(opts.splunk_home, 'etc', 'system', 'local', 'web.conf')
        if not os.path.exists(os.path.dirname(web_conf_file)):
            os.makedirs(os.path.dirname(web_conf_file))
        _conf = open(web_conf_file,'a')
        _conf.write('[settings]\nstartwebserver = 0\n')
        _conf.close()
        log.info('"startwebserver = 0" set in %s' % web_conf_file)

    if opts.enable_FIPS:
        if not is_darwin_host:           
            launch_conf_file = os.path.join(opts.splunk_home, 'etc', 'splunk-launch.conf')
            if not os.path.exists(os.path.dirname(launch_conf_file)):
                os.makedirs(os.path.dirname(launch_conf_file))
            _conf = open(launch_conf_file,'a')
            _conf.write('\nSPLUNK_FIPS=1\n')
            _conf.close()
            log.info('" SPLUNK_FIPS=1 " set in %s' % launch_conf_file)

    if opts.splunk_db:
        launch_conf_file = os.path.join(opts.splunk_home, 'etc', 'splunk-launch.conf')
        if not os.path.exists(os.path.dirname(launch_conf_file)):
            os.makedirs(os.path.dirname(launch_conf_file))
        _conf = open(launch_conf_file,'a')
        _conf.write('\nSPLUNK_DB=%s\n' % opts.splunk_db)
        _conf.close()
        log.info('SPLUNK_DB=%s  set in %s' % (opts.splunk_db, launch_conf_file))

    if opts.splunkd_port:
        web_conf_file = os.path.join(opts.splunk_home, 'etc', 'system', 'local', 'web.conf')
        if not os.path.exists(os.path.dirname(web_conf_file)):
            os.makedirs(os.path.dirname(web_conf_file))
        _conf = open(web_conf_file,'a')
        _conf.write('[settings]\nmgmtHostPort = 127.0.0.1:' + opts.splunkd_port + '\n')
        _conf.close()
        log.info('Splunk mgmtHostPort is set to %s' % opts.splunkd_port)

    if opts.splunkweb_port:
        web_conf_file = os.path.join(opts.splunk_home, 'etc', 'system', 'local', 'web.conf')
        if not os.path.exists(os.path.dirname(web_conf_file)):
            os.makedirs(os.path.dirname(web_conf_file))
        _conf = open(web_conf_file,'a')
        _conf.write('[settings]\nhttpport = ' + opts.splunkweb_port + '\n')
        _conf.close()
        log.info('Splunk httpport is set to %s' % opts.splunkweb_port)

    # set "allowRemoteLogin" to "always"
    server_conf_file = os.path.join(opts.splunk_home,'etc','system','local', 'server.conf')
    if not os.path.exists(os.path.dirname(server_conf_file)):
        os.makedirs(os.path.dirname(server_conf_file))
    _conf = open(server_conf_file,'a')
    _conf.write('[general]\nallowRemoteLogin=always\n')
    _conf.close()
    log.info('"allowRemoteLogin=always" set in %s' % server_conf_file)
    
    # optionally restore indexes
    if opts.preserve_indexes:
        if is_windows_host:
            splunk_path = os.path.join(opts.splunk_home, "var", "lib", "splunk")
            splunk_path = '\\\\'.join(splunk_path.split("\\"))  
        else:
            splunk_path = os.path.join(opts.splunk_home, "var", "lib", "splunk")  

        if not os.path.exists(splunk_path):    
            os.makedirs(splunk_path)

        for _g in glob('%s/*' % index_backup_dir):
            shutil.move(_g, splunk_path)
        remove_recursive(index_backup_dir)
    
    # optionally install a license
    if opts.install_license:
        start_splunk(opts)
        _tmpdir = tempfile.mkdtemp()
        lic_depot_path = '//splunk/current/test/data/licenses/5TB-1.lic'
        _cmd = [opts.p4_bin, 'print', '-o', os.path.join(_tempdir,'license'), '-q', lic_depot_path]
        run_cmd(_cmd, required=True)

        if is_windows_host:
            splunk_path = os.path.join(opts.splunk_home, "var", "lib", "splunk")
            splunk_path = '\\\\'.join(splunk_path.split("\\"))
        else:
            splunk_path = os.path.join(opts.splunk_home, "var", "lib", "splunk")

        _cmd = [splunk_path, 'add', 'licenses', os.path.join(_tempdir,'license')]
        _cmd.extend(['-auth', 'admin:changeme', '--accept-license', '--no-prompt', '--answer-yes'])
        run_cmd(_cmd, required=True)
        remove_recursive(_tmpdir)
        start_splunk(opts)

#####################################################
#Responsible for installing Splunk apps.
#Uses the appdir, the directory where the tests/script
# exist to install apps. 
#We use py.test to run these scripts.
#####################################################

def install_splunk_apps(opts):
    pytest_args = ['-v', '--junitxml', 'test-result.xml']
    
    # optionally run py.test with additional flags
    if opts.pytest_args:
        pytest_args = opts.pytest_args.split() + pytest_args 
    log.info("running with pytest args: %s" % pytest_args)
     
    #Gets py.test.   
    pytest_dir = get_pytest_dir(opts)   
    pytest_bin = os.path.join(pytest_dir, 'bin', 'py.test')
    os.environ['SPLUNK_HOME'] = opts.splunk_home

    if not opts.disable_splunk:
        start_splunk(opts)
    
    if is_windows_host:
        splunk_bin_path = os.path.join(opts.splunk_home,"bin","splunk.exe")
        splunk_bin_path = '\\\\'.join(splunk_bin_path.split("\\"))
    else:
        splunk_bin_path = os.path.join(opts.splunk_home,"bin","splunk")

    #The command to execute py.test.
    _cmd = [splunk_bin_path, 'cmd', 'python', pytest_bin]
    _cmd.extend(pytest_args)
    
    if opts.testscript != None:
        _cmd.append(opts.testscript)

    #Run py.test in appdir directory
    _ret = run_cmd(_cmd, required=False, cwd=opts.appdir)
    log.info('STDOUT: %s' % _ret['STDOUT'])
    log.info('STDERR: %s' % _ret['STDERR'])

#####################################################
#Stop Splunk on Windows or Linux OS.
#####################################################

def stop_splunk(opts):
    #If Windows, converts path to python understandable 
    #format to run command.
    # Eg C:\\foo\\bar\\ 
    if is_windows_host:
        splunk_bin_path = os.path.join(opts.splunk_home,"bin","splunk.exe")
        splunk_bin_path = '\\\\'.join(splunk_bin_path.split("\\"))
    else:
        splunk_bin_path = os.path.join(opts.splunk_home,"bin","splunk")
    
    if os.path.exists(splunk_bin_path):
        run_cmd([splunk_bin_path, 'stop'], required=True)

#####################################################
#Start Splunk on Windows or Linux OS.
#####################################################

def start_splunk(opts):
    if is_windows_host:
        splunk_bin_path = os.path.join(opts.splunk_home,"bin","splunk.exe")
    else:
        splunk_bin_path = os.path.join(opts.splunk_home,"bin","splunk")

    if os.path.exists(splunk_bin_path):
        _cmd = [splunk_bin_path, 'restart']

    #For Windows OS we accept the license while installation using .msi file. So the below
    #step is not needed on Windows.
        if not is_windows_host:
            _cmd.extend(['--accept-license', '--no-prompt', '--answer-yes'])
            opts.auto_ports and _cmd.extend(['--auto-ports'])
        
        run_cmd(_cmd, required=True)

#####################################################
#Run a command not using shell
#####################################################

def run_cmd(cmd, required=False, cwd=None):
    log.info('running cmd: %s' % ' '.join(cmd))
    _proc = SP.Popen(cmd, stderr=SP.PIPE, stdout=SP.PIPE, cwd=cwd)
    (so, se) = _proc.communicate()
    _ret = {'STDOUT' : so, 'STDERR' : se, 'RETURN_CODE' : _proc.returncode}

    if required:
        if _ret['RETURN_CODE'] != 0:
            log.info('STDOUT: %s' % _ret['STDOUT'])
            log.info('STDERR: %s' % _ret['STDERR'])
            _txt = ' '.join(cmd)
            sys.exit('Error running cmd: "%s", returned: %s' % (_txt, _ret['RETURN_CODE']))

    return _ret

#####################################################
#Run a command using shell
#####################################################

def run_cmd_shell(cmd, required=False):
    log.info('running cmd: %s' % cmd)
    _proc = SP.Popen(cmd, stderr=SP.PIPE, stdout=SP.PIPE, shell=True)
    (so, se) = _proc.communicate()

    _ret = {'STDOUT' : so, 'STDERR' : se, 'RETURN_CODE' : _proc.returncode}    
    
    if required:
        if _ret['RETURN_CODE'] != 0:
            log.info('STDOUT: %s' % _ret['STDOUT'])
            log.info('STDERR: %s' % _ret['STDERR'])
            _txt = ' '.join(cmd)
            sys.exit('Error running cmd: "%s", returned: %s' % (_txt, _ret['RETURN_CODE']))

    return _ret

#####################################################
#Returns splunk_home path.
#####################################################

def get_splunk_home(opts):
    if opts.splunk_home:
        os.environ['SPLUNK_HOME'] = opts.splunk_home
        return opts.splunk_home
    elif 'SPLUNK_HOME' in os.environ:
        return os.environ['SPLUNK_HOME']
    else:
        sys.exit("Splunk_Home is not set.")

#####################################################
#Get the test dir.
#####################################################

def get_pytest_dir(opts):
    _py = 'py-1.2.1'
    if opts.pytest_dir:
        if os.path.exists(opts.pytest_dir):
            return opts.pytest_dir
    elif 'PYTEST_DIR' in os.environ:
        if os.path.exists(os.environ['PYTEST_DIR']):
            return os.environ['PYTEST_DIR']
    elif os.path.exists(os.path.join(app_panda_dir, _py)):
        return os.path.join(app_panda_dir, _py)
    else:
        # gotta go get it
        py_depot_path = '//splunk/solutions/common/test/%s.tar.gz' % _py
        _tmpdir = tempfile.mkdtemp()
        pkg_file_path = os.path.join(_tmpdir, _py)
        _cmd = [opts.p4_bin, 'print', '-o', pkg_file_path, '-q', py_depot_path]
        run_cmd(_cmd, required=True)
        tarfile.open(pkg_file_path, 'r:gz').extractall()

        # conditionally apply a patch (see //splunk/current/contrib/py-1.2.1-conftesthandle.patch)
        if _py == 'py-1.2.1':
            patch_txt = ' or py.path.local()'
            for line in fileinput.FileInput(os.path.join(_py,'py','_test','conftesthandle.py'), inplace=1):
                if re.search('^\s+self._confcutdir = confcutdir', line):
                    sys.stdout.write('%s%s' % (line.rstrip(), patch_txt))
                else:
                    sys.stdout.write(line)

        return os.path.join(app_panda_dir, _py)

#####################################################
# Compose the url that should return the pkg we need.
#####################################################

def get_splunk_pkg_url(opts):
    fetcher_url = 'http://releases.splunk.com/cgi-bin/splunk_build_fetcher.py'

    #Sets the Platform and pkg type.
    #If Windows we select msi, .tgz otherwise.
    if opts.plat_pkg:
        plat_pkg_arg = 'PLAT_PKG=%s' % opts.plat_pkg
    else:
        architecture = platform.architecture()

        if architecture == '64bit':
            if is_windows_host:
                plat_pkg_arg = 'PLAT_PKG=x64-release.msi'
            elif is_darwin_host:
                plat_pkg_arg = 'PLAT_PKG=darwin-64.tgz'
            else:
                plat_pkg_arg = 'PLAT_PKG=Linux-x86_64.tgz'
        else:
            if is_windows_host:
                plat_pkg_arg = 'PLAT_PKG=x86-release.msi'
            elif is_darwin_host:
                plat_pkg_arg = 'PLAT_PKG=darwin-64.tgz'
            else:
                plat_pkg_arg = 'PLAT_PKG=Linux-x86_64.tgz'            

    #Sets the Product field.
    if opts.PRODUCT: 
        PRODUCT_arg = 'PRODUCT=%s' % opts.PRODUCT
    else:
        PRODUCT_arg = 'PRODUCT=splunk'

    #Version is converted to appropriate branch by 
    #looking at pseudo_branch_mapping.txt.
    #Eg: --version current_nightly, --version next.
    if opts.version:
        version_map_depot_path = '//splunk/qa/bamboo/panda/pseudo_branch_mapping.txt'
        _cmd = [opts.p4_bin, 'print', '-q', version_map_depot_path]
        _ret = run_cmd(_cmd, required=True)

        # check to see if this is a special* version (* appears in "version_map_depot_path")
        for line in _ret['STDOUT'].split('\n'):
            if re.match('^%s\s+' % opts.version, line):
                _ver = re.match('^%s\s+(\S+)' % opts.version, line).group(1)
                if _ver.startswith('{'):
                    branch_arg = 'BRANCH=%s' % re.search('{(\S+)}', _ver).group(1)
                    return ''.join((fetcher_url, '?', PRODUCT_arg,'&',plat_pkg_arg, '&DELIVER_AS=file&', branch_arg))
                else:
                    version_arg = 'VERSION=%s' % _ver
                    return ''.join((fetcher_url, '?', plat_pkg_arg, '&DELIVER_AS=file&', version_arg))

        # no, it's not a special version...
        version_arg = 'VERSION=%s' % opts.version
        return ''.join((fetcher_url, '?', plat_pkg_arg, '&DELIVER_AS=file&', version_arg))

    #Sets the branch of the required installer.
    #Eg:--branch dash, --branch current.
    #All branch names are in pseudo_branch_mapping.txt
    elif opts.branch:
        branch_arg = 'BRANCH=%s' % opts.branch
        return ''.join((fetcher_url, '?', PRODUCT_arg,'&',plat_pkg_arg, '&DELIVER_AS=file&', branch_arg))
    else:
        sys.exit('"--branch" or "--version" arg required: exiting')

#####################################################
#Returns the path to p4.
#####################################################

def get_p4_bin():
    if os.path.exists('C:/progra~1/perforce/p4.exe'):
        return 'C:/progra~1/perforce/p4.exe'
    elif os.path.exists('/usr/local/bin/p4'):
        return '/usr/local/bin/p4'
    else: # Maybe it's in our PATH
        try:
            NUL = open(os.devnull, 'wb')
            SP.check_call(['p4'], stdout=NUL, stderr=NUL)
            return 'p4'
        except:
            sys.exit('"p4" not found in path: exiting')

#####################################################
#Setup logger.
#####################################################

def config_logger(_level):
    global log
    _format = logging.Formatter('%(asctime)s %(levelname)8s: %(message)s')
    _log_file_path = os.path.abspath('%s.log' % sys.argv[0])
    log = logging.getLogger()
    log.setLevel(_level)

    _sh = logging.StreamHandler(sys.stdout)
    _sh.setLevel(_level)
    _sh.setFormatter(_format)
    log.addHandler(_sh)

    _fh = logging.FileHandler(_log_file_path)
    _fh.setLevel(_level)
    _fh.setFormatter(_format)
    log.addHandler(_fh)

    log.info('Debug log set to %s', _log_file_path)
    
#####################################################
#Remove Splunk directories recursively.
#####################################################

def remove_recursive(_dir):
    if os.path.isdir(_dir):
        if not is_windows_host:
            for root, dirs, files in os.walk(_dir, topdown=True):
                os.chmod(root, 0777)
                for file in files:
                    os.chmod(os.path.join(root, file), 0777)

                for dir in dirs:
                    os.chmod(os.path.join(root, dir), 0777)

        shutil.rmtree(_dir)

        if os.path.lexists(_dir):
            log.info('could not delete dir: "%s". Exiting...' % _dir)
            sys.exit(1)
    else:
        log.info('"%s" is not a directory: will not delete', _dir)
        sys.exit(1)

#####################################################
#Uninstall splunk completely on Windows and Linux OS.
#####################################################

def uninstall_splunk(opts):
    if is_windows_host:
        _cmd = "msiexec /x "+os.path.join(os.environ['SPLUNK_HOME'],'Uninstaller.msi')+" /qn REMOVE=all RebootYesNo=No"
        _ret = run_cmd_shell(_cmd, required=True)
        log.info('STDOUT: %s' % _ret['STDOUT'])
        log.info('STDERR: %s' % _ret['STDERR'])
    else:
        # Delete pre-existing splunk_home
        if os.path.exists(opts.splunk_home):
            log.info('splunk_home = %s' % opts.splunk_home)
            remove_recursive(opts.splunk_home)

#####################################################
#Run tests using pytest passing testdir arguments. 
#Some part of this is from panda.py.
#####################################################  
def run_tests(opts):
    if opts.branch == 'current':
        build_dir = os.path.join(bamboo_dir, 'src', 'splunk', opts.branch)
    else:
        build_dir = os.path.join(bamboo_dir, 'src', 'splunk', 'branches', opts.branch)

    log.info("BUILD DIR IS %s" % build_dir)

    #Pytest_args consists of the arguments for pytest.py. We assume using pytest.py
    splunk_home = opts.splunk_home
    splunk_bin = os.path.join(splunk_home, 'bin', 'splunk')

    #PYTEST_ARGS come from bamboo plan's Enviroment variables.
    pytest_args = os.environ.get('PYTEST_ARGS','')

    pytest_bin = os.path.join(build_dir, 'new_test', 'bin', 'pytest', 'pytest.py')
    pytest_cmd = ' '.join([splunk_bin, 'cmd', 'python', pytest_bin, pytest_args])

    #List of all the tests directories to run the tests from!
    testlist = opts.testdir.split(',')

    for test in testlist:
        abs_test_dir = os.path.join(build_dir, test)

        #Run the pytest.py command. 
        saved_dir = os.getcwd()
        os.chdir(abs_test_dir)
        os.system(pytest_cmd)
        os.chdir(saved_dir)

#####################################################
#Invoke this script.
#####################################################

if __name__ == '__main__':
    # require Python ver. > 2.4 and < 3.0"
    (_maj, _min) = sys.version_info[:2]
    if _maj != 2 or (_maj == 2 and _min < 5):
        _bn = os.path.basename(sys.argv[0])
        sys.exit("%s requires Python ver. > 2.4 and < 3.0, found %d.%d: exiting" % (_bn, _maj, _min))

    main()
