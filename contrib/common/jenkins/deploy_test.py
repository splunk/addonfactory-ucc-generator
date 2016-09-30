#!/usr/bin/env python

################################################################################
# A wrapper utility script for running app builds & tests inside of Bamboo
# Copyright 2012 Splunk, Inc.
################################################################################
from glob import glob
from optparse import OptionParser
import errno
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
import zipfile

is_windows_host = (platform.system() == 'Windows')
app_panda_dir = os.getcwd()
log = None

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
    parser.add_option('--install_license', dest='install_license', action='store_true')
    #parser.add_option('--forwarder_version', dest='forwarder_version')
    _txt ="Fetch a pkg for a particular platform (defaults to 'linux-2.6-x86_64.rpm')"
    parser.add_option('--plat_pkg', dest='plat_pkg', help=_txt, default='Linux-x86_64.tgz')
    _txt ="Don't wipe splunk indexes"
    parser.add_option('--preserve_indexes', dest='preserve_indexes', help=_txt, action='store_true')
    _txt = 'Use an existing installation of Splunk to run tests'
    parser.add_option('--preserve_splunk', dest='preserve_splunk', help=_txt, action='store_true')
    #parser.add_option('--pyconf', dest='pyconf')
    _txt = 'where pytest is or should be installed (<pytest_dir>/bin/py.test)'
    parser.add_option('--pytest_dir', dest='pytest_dir', help=_txt)
    _txt = 'where Splunk is or should be installed. This needs to be specified here or in the runtime env.'
    parser.add_option('--splunk_home', dest='splunk_home', help=_txt)
    parser.add_option('--testdir', dest='testdir')
    parser.add_option('--testscript', dest='testscript')
    parser.add_option('--notest', dest='notest', action='store_true')
    parser.add_option('--leave_running', dest='leave_running', action='store_true')
    _txt = 'test type to run: py.test or make_test'
    #parser.add_option('--test_type', dest='test_type', help=_txt, default='py.test')
    _txt = 'emit extra runtime info'
    parser.add_option('--verbose', dest='debug', help=_txt, action='store_true')
    _txt = 'The Splunk version to download & install.'
    _txt += ' Note that "--version" takes precedence over "--branch"'
    _txt += ' and "--version" is ignored if "--preserve_splunk" is supplied.'
    parser.add_option('--version', dest='version', help=_txt)
    return parser

def main():
    (opts, args) = get_optargs().parse_args()

    if opts.debug == True:
        config_logger(logging.DEBUG)
    else:
        config_logger(logging.INFO)

    log.debug('CMD: %s', ' '.join(sys.argv))
    log.debug('PWD: %s', os.getcwd())

    try:
        opts.splunk_node_type = os.environ['SPLUNK_NODE_TYPE']
    except:
        log.error('SPLUNK_NODE_TYPE unset in env: exiting')
        sys.exit(1)

    opts.splunk_home = get_splunk_home(opts)
    opts.p4_bin = get_p4_bin()

    for _m in re.findall("'([^']+?)': (?!None)([^,]+)", str(opts)):
        log.debug('option: --%s = %s' % (_m[0], _m[1]))

    for _m in re.findall("'([^']+?)': (?!None)([^,]+)", str(os.environ)):
        log.debug('env: %s=%s' % (_m[0], _m[1]))

    if not opts.preserve_splunk:
        install_splunk(opts)
    
    if not opts.notest:
        run_tests(opts)
    else:
        log.debug('Skipping tests since --notest flag was specified')

    if not opts.leave_running:
        stop_splunk(opts)
    else:
        start_splunk(opts)

    sys.exit()

def install_splunk(opts):
    if opts.splunk_node_type == 'forwarder':
        opts.preserve_indexes = False

    if opts.preserve_indexes:
        if os.path.exists('%s/var/lib/splunk' % opts.splunk_home):
            index_backup_dir = tempfile.mkdtemp()
            for _g in glob('%s/var/lib/splunk/*' % opts.splunk_home):
                shutil.move(_g, index_backup_dir)
        else:
            opts.preserve_indexes = False

    # delete pre-existing splunk_home
    if os.path.lexists(opts.splunk_home):
        log.info('splunk_home = %s' % opts.splunk_home)
        remove_recursive(opts.splunk_home)

    # Determine which pkg we need & get the pkg from releases.splunk.com
    splunk_pkg_url = get_splunk_pkg_url(opts)
    log.info('Splunk package url: %s' % splunk_pkg_url)
    try:
        pkg_file_data = urllib2.urlopen(splunk_pkg_url)

        # determine the pkg file name & write the file to disk
        _tmp = pkg_file_data.info()['content-disposition']
        pkg_file_name = re.search('filename=(.+)$', _tmp).group(1)
        log.info('Splunk package name: %s' % pkg_file_name)
        _file = open(pkg_file_name, 'wb')
        _file.write(pkg_file_data.read())
        _file.close()
    except:
        sys.exit('Error fetching %s' % splunk_pkg_url)

    # extract the pkg & move it to splunk_home
    _tmpdir = tempfile.mkdtemp()

    if pkg_file_name.endswith('.Z'):
        _cmd = ['gtar', 'xzf', os.path.join(os.getcwd(), pkg_file_name), '--delay-directory-restore']
        _ret = run_cmd(_cmd, required=False, cwd=_tmpdir)
        log.info('STDOUT: %s' % _ret['STDOUT'])
        log.info('STDERR: %s' % _ret['STDERR'])
    elif pkg_file_name.endswith('.zip'):
        zipfile.ZipFile(pkg_file_name).extractall(_tmpdir)
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

    # Windows sux, un-limit maxThreads & maxSockets
    server_conf_file = os.path.join(opts.splunk_home,'etc','system','local', 'server.conf')
    if not os.path.exists(os.path.dirname(server_conf_file)):
        os.makedirs(os.path.dirname(server_conf_file))
    _conf = open(server_conf_file,'a')
    _conf.write('\n[httpServer]\nmaxThreads=-1\nmaxSockets=-1\n')
    _conf.close()
    log.info('un-limit maxThreads & maxSockets in %s' % server_conf_file)

    # set "allowRemoteLogin" to "always"
    server_conf_file = os.path.join(opts.splunk_home,'etc','system','local', 'server.conf')
    if not os.path.exists(os.path.dirname(server_conf_file)):
        os.makedirs(os.path.dirname(server_conf_file))
    _conf = open(server_conf_file,'a')
    _conf.write('\n[general]\nallowRemoteLogin=always\n')
    _conf.close()
    log.info('"allowRemoteLogin=always" set in %s' % server_conf_file)

    # optionally restore indexes
    if opts.preserve_indexes:
        os.makedirs('%s/var/lib/splunk' % opts.splunk_home)
        for _g in glob('%s/*' % index_backup_dir):
            shutil.move(_g, '%s/var/lib/splunk' % opts.splunk_home)
        remove_recursive(index_backup_dir)

    # optionally install a license
    if opts.install_license and not opts.splunk_node_type == 'forwarder':
        start_splunk(opts)
        _tmpdir = tempfile.mkdtemp()
        lic_depot_path = '//splunk/current/test/data/licenses/5TB-1.lic'
        _cmd = [opts.p4_bin, 'print', '-o', '%s/license' % _tmpdir, '-q', lic_depot_path]
        run_cmd(_cmd, required=True)
        _cmd = ['%s/bin/splunk' % opts.splunk_home, 'add', 'licenses', '%s/license' % _tmpdir]
        _cmd.extend(['-auth', 'admin:changeme', '--accept-license', '--no-prompt', '--answer-yes'])
        run_cmd(_cmd, required=True)
        remove_recursive(_tmpdir)
        stop_splunk(opts)

def run_tests(opts):
    pytest_args = "-v"
    pytest_dir = get_pytest_dir(opts)
    pytest_bin = '%s/bin/py.test' % pytest_dir
    #os.environ['SOLN_ROOT'] = '%s/splunk/solutions' % app_panda_dir
    os.environ['SPLUNK_HOME'] = opts.splunk_home

    if not opts.disable_splunk:
        start_splunk(opts)

    _cmd = ['%s/bin/splunk' % opts.splunk_home, 'cmd', 'python', pytest_bin, '-v', '--junitxml', 'test-result.xml']
    
    if opts.testscript != None:
        _cmd.append(opts.testscript)

    _ret = run_cmd(_cmd, required=False, cwd=opts.testdir)
    log.info('STDOUT: %s' % _ret['STDOUT'])
    log.info('STDERR: %s' % _ret['STDERR'])

def stop_splunk(opts):
    if os.path.exists('%s/bin/splunk' % opts.splunk_home):
        run_cmd(['%s/bin/splunk' % opts.splunk_home, 'stop'], required=False)

def start_splunk(opts):
    if os.path.exists('%s/bin/splunk' % opts.splunk_home):
        _cmd = ['%s/bin/splunk' % opts.splunk_home, 'restart']
        _cmd.extend(['--accept-license', '--no-prompt', '--answer-yes'])
        opts.auto_ports and _cmd.extend(['--auto-ports'])
        run_cmd(_cmd, required=True)

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

def get_splunk_home(opts):
    if opts.splunk_home:
        return opts.splunk_home
    elif 'SPLUNK_HOME' in os.environ:
        return os.environ['SPLUNK_HOME']
    else:
        sys.exit("splunk_home not set")

def get_pytest_dir(opts):
    _py = 'py-1.2.1'
    if opts.pytest_dir:
        if os.path.exists(opts.pytest_dir):
            return opts.pytest_dir
    elif 'PYTEST_DIR' in os.environ:
        if os.path.exists(os.environ['PYTEST_DIR']):
            return os.environ['PYTEST_DIR']
    elif os.path.exists('%s/%s' % (app_panda_dir, _py)):
        return '%s/%s' % (app_panda_dir, _py)
    else:
        # gotta go get it
        py_depot_path = '//splunk/solutions/common/test/%s.tar.gz' % _py
        _tmpdir = tempfile.mkdtemp()
        pkg_file_path = '%s/%s.tar.gz' % (_tmpdir, _py)
        _cmd = [opts.p4_bin, 'print', '-o', pkg_file_path, '-q', py_depot_path]
        run_cmd(_cmd, required=True)
        tarfile.open(pkg_file_path, 'r:gz').extractall()

        # conditionally apply a patch (see //splunk/current/contrib/py-1.2.1-conftesthandle.patch)
        if _py == 'py-1.2.1':
            patch_txt = ' or py.path.local()'
            for line in fileinput.FileInput('%s/py/_test/conftesthandle.py' % _py, inplace=1):
                if re.search('^\s+self._confcutdir = confcutdir', line):
                    sys.stdout.write('%s%s' % (line.rstrip(), patch_txt))
                else:
                    sys.stdout.write(line)

        return '%s/%s' % (app_panda_dir, _py)


# compose the url that should return the pkg we need.
def get_splunk_pkg_url(opts):
    fetcher_url = 'http://releases.splunk.com/cgi-bin/splunk_build_fetcher.py'

    if opts.plat_pkg:
        plat_pkg_arg = 'PLAT_PKG=%s' % opts.plat_pkg
    else:
        plat_pkg_arg = 'PLAT_PKG=Linux-x86_64.tgz'

    if opts.splunk_node_type == 'forwarder':
        forwarder_arg = '&UF=1'
    else:
        forwarder_arg = ''

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
                    return ''.join((fetcher_url, '?', plat_pkg_arg, '&DELIVER_AS=file&', branch_arg, forwarder_arg))
                else:
                    version_arg = 'VERSION=%s' % _ver
                    return ''.join((fetcher_url, '?', plat_pkg_arg, '&DELIVER_AS=file&', version_arg, forwarder_arg))

        # no, it's not a special version...
        version_arg = 'VERSION=%s' % opts.version
        return ''.join((fetcher_url, '?', plat_pkg_arg, '&DELIVER_AS=file&', version_arg, forwarder_arg))
    elif opts.branch:
        branch_arg = 'BRANCH=%s' % opts.branch
        return ''.join((fetcher_url, '?', plat_pkg_arg, '&DELIVER_AS=file&', branch_arg, forwarder_arg))
    else:
        sys.exit('"--branch" or "--version" arg required: exiting')

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

def config_logger(_level):
    global log
    _format = logging.Formatter('%(asctime)s %(levelname)8s: %(message)s')
    _log_file_path = os.path.abspath('%s.log' % sys.argv[0])
    log = logging.getLogger()
    log.setLevel(logging.DEBUG)

    _sh = logging.StreamHandler(sys.stdout)
    _sh.setLevel(_level)
    _sh.setFormatter(_format)
    log.addHandler(_sh)

    _fh = logging.FileHandler(_log_file_path)
    _fh.setLevel(logging.DEBUG)
    _fh.setFormatter(_format)
    log.addHandler(_fh)

    log.info('Debug log set to %s', _log_file_path)
    
def remove_recursive(_dir):
    for root, dirs, files in os.walk(_dir, topdown=False):
        if dirs:
            for dir in dirs:
                remove_recursive('%s/%s' % (root, dir))

        if files:
            try:
                for file in files:
                    os.remove('%s/%s' % (root, file))
            except:
                os.chmod('%s/%s' % (root, file), stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)
                os.remove('%s/%s' % (root, file))

        try:
            os.rmdir(root)
        except:
            os.chmod(root, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO)
            os.rmdir(root)

def remove_recursive2(_dir):
    def remove_readonly(func, path, exc):
        if func is os.remove and exc[1].errno == errno.EACCES:
            os.chmod(path, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO) # 0777
            func(path)
        if func is os.rmdir and exc[1].errno == errno.EACCES:
            os.chmod(path, stat.S_IRWXU | stat.S_IRWXG | stat.S_IRWXO) # 0777
            shutil.rmtree(path, onerror=remove_readonly)
        else:
            raise

    if os.path.isdir(_dir):
        shutil.rmtree(_dir, onerror=remove_readonly)
        if os.path.lexists(_dir):
            log.info('could not delete dir: "%s". Exiting...' % _dir)
            sys.exit(1)
    else:
        log.info('"%s" is not a directory: will not delete', _dir)
        sys.exit(1)

if __name__ == '__main__':
    # require Python ver. > 2.4 and < 3.0"
    (_maj, _min) = sys.version_info[:2]
    if _maj != 2 or (_maj == 2 and _min < 5):
        _bn = os.path.basename(sys.argv[0])
        sys.exit("%s requires Python ver. > 2.4 and < 3.0, found %d.%d: exiting" % (_bn, _maj, _min))

    main()

