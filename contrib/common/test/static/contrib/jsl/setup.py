#!/usr/bin/python
# vim: ts=4 sw=4 expandtab
from distutils.core import setup, Extension
import distutils.command.build
import distutils.command.clean
import os
import subprocess
import sys

class _BuildError(Exception):
    pass

def _getrevnum():
    path = os.path.dirname(os.path.abspath(__file__))
    p = subprocess.Popen(['svnversion', path], stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate()
    if p.returncode != 0:
        raise _BuildError, 'Error running svnversion: %s' % stderr
    version = stdout.strip().rstrip('M')
    return int(version)

def _runmakefiles(distutils_dir, build_opt=1, target=None):
    args = ['BUILD_OPT=%i' % build_opt]
    if distutils_dir:
        args.append('DISTUTILS_DIR=%s' % distutils_dir)
    if target:
        args.append(target)

    # First build SpiderMonkey. Force it to link statically against the CRT to
    # make deployment easier.
    if os.name == 'nt':
        args.append('XCFLAGS=-MT')

    ret = subprocess.call(['make', '-f', 'Makefile.ref', '-C',
                           'spidermonkey/src'] + args)
    if ret != 0:
        raise _BuildError, 'Error running make.'

    # Then copy the files to the build directory.
    ret = subprocess.call(['make', '-f', 'Makefile.SpiderMonkey'] + args)
    if ret != 0:
        raise _BuildError, 'Error running make.'

class _MyBuild(distutils.command.build.build):
    def run(self):
        # py2exe is calling reinitialize_command without finalizing.
        self.ensure_finalized()

        _runmakefiles(self.build_platlib)
        distutils.command.build.build.run(self)

class _MyClean(distutils.command.clean.clean):
    def run(self):
        _runmakefiles(None, target='clean')
        distutils.command.clean.clean.run(self)

if __name__ == '__main__':
    if os.name == 'nt':
        library = 'js32'
    else:
        library = 'js'
    pyspidermonkey = Extension(
            'javascriptlint.pyspidermonkey',
            include_dirs = ['spidermonkey/src', 'build/spidermonkey'],
            library_dirs = ['build/spidermonkey'],
            libraries = [library],
            sources = [
                'javascriptlint/pyspidermonkey/pyspidermonkey.c',
                'javascriptlint/pyspidermonkey/nodepos.c'
            ]
        )
    cmdclass = {
        'build': _MyBuild,
        'clean': _MyClean,
    }
    args = {}
    args.update(
        name = 'javascriptlint',
        version = '0.0.0.%i' % _getrevnum(),
        author = 'Matthias Miller',
        author_email = 'info@javascriptlint.com',
        url = 'http://www.javascriptlint.com/',
        cmdclass = cmdclass,
        description = 'JavaScript Lint (pyjsl beta r%i)' % _getrevnum(),
        ext_modules = [pyspidermonkey],
        packages = ['javascriptlint'],
        scripts = ['jsl']
    )
    try:
        import py2exe
    except ImportError:
        pass
    else:
        class _MyPy2Exe(py2exe.build_exe.py2exe):
            def run(self):
                py2exe.build_exe.py2exe.run(self)
                for exe in self.console_exe_files:
                    ret = subprocess.call(['upx', '-9', exe])
                    if ret != 0:
                        raise _BuildError, 'Error running upx on %s' % exe
        args['cmdclass']['py2exe'] = _MyPy2Exe

        args.update(
            console = ['jsl'],
            options = {
                'py2exe': {
                    'excludes': ['javascriptlint.spidermonkey_'],
                    'bundle_files': 1,
                    'optimize': 1, # requires 1 to preserve docstrings
                }
            },
            zipfile = None
        )
    setup(**args)

