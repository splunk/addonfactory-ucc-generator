#!/usr/bin/python
# vim: ts=4 sw=4 expandtab
import os
import re
import sys

import javascriptlint.conf
import javascriptlint.lint

_DEFAULT_CONF = """
# This warning triggers a lot of warnings in many of the tests, so only enable
# it when specifically testing it.
-unreferenced_argument
-unreferenced_function
-unreferenced_variable
"""

class TestError(Exception):
    pass

def _get_conf(script):
    regexp = re.compile(r"/\*conf:([^*]*)\*/")
    text = '\n'.join(regexp.findall(script))
    conf = javascriptlint.conf.Conf()
    conf.loadtext(_DEFAULT_CONF)
    conf.loadtext(text)
    return conf

def _get_expected_warnings(script):
    "returns an array of tuples -- line, warning"
    warnings = []

    regexp = re.compile(r"/\*warning:([^*]*)\*/")

    lines = script.splitlines()
    for i in range(0, len(lines)):
        for warning in regexp.findall(lines[i]):
            # TODO: implement these
            unimpl_warnings = ('dup_option_explicit',)
            if not warning in unimpl_warnings:
                warnings.append((i, warning))
    return warnings

def _testfile(path):
    # Parse the script and find the expected warnings.
    script = open(path).read()
    expected_warnings = _get_expected_warnings(script)
    unexpected_warnings = []
    conf = _get_conf(script)

    def lint_error(path, line, col, errname, errdesc):
        warning = (line, errname)

        # Bad hack to fix line numbers on ambiguous else statements
        # TODO: Fix tests.
        if errname == 'ambiguous_else_stmt' and not warning in expected_warnings:
            warning = (line-1, errname)

        if warning in expected_warnings:
            expected_warnings.remove(warning)
        else:
            unexpected_warnings.append(warning)

    javascriptlint.lint.lint_files([path], lint_error, conf=conf)

    errors = []
    if expected_warnings:
        errors.append('Expected warnings:')
        for line, warning in expected_warnings:
            errors.append('\tline %i: %s' % (line+1, warning))
    if unexpected_warnings:
        errors.append('Unexpected warnings:')
        for line, warning in unexpected_warnings:
            errors.append('\tline %i: %s' % (line+1, warning))
    if errors:
        raise TestError, '\n'.join(errors)

def _get_test_files():
    # Get a list of test files.
    dir_ = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tests')

    all_files = []
    for root, dirs, files in os.walk(dir_):
        all_files += [os.path.join(dir_, root, file) for file in files]
        if '.svn' in dirs:
            dirs.remove('.svn')
        # TODO
        if 'conf' in dirs:
            dirs.remove('conf')
    all_files.sort()
    return all_files

def main():
    haderrors = False
    for file in _get_test_files():
        ext = os.path.splitext(file)[1]
        if ext in ('.htm', '.html', '.js'):
            try:
                _testfile(file)
            except TestError, error:
                haderrors = True
                print error
    sys.exit(haderrors)

if __name__  == '__main__':
    main()

