import os
import re
import subprocess
from optparse import OptionParser

class Chauffeur():
    def __init__(self, app_path, splunk_home, codeline):
        self.splunk_home = splunk_home
        self.app_path = os.path.abspath(app_path)
        self.codeline = codeline
        self.current_path = self.find_current()
        self.solutions_path = self.find_solutions()
        self.app_test_common_path = self.find_app_test_common()
        self.generated_test_path = self.find_generated_test()

    def find_current(self):
        print "finding current directory"
        app_path = self.app_path
        while app_path != '/':
            print app_path
            for dirname, dirnames, filenames in os.walk(app_path):
                if 'current' not in dirname:
                    continue
                for subdir in dirnames:
                    path = os.path.join(dirname, subdir)
                    if 'current/new_test' in path and 'new_test' not in dirname:
                        return dirname
            app_path = os.path.dirname(app_path)

    def find_solutions(self):
        print "finding solutions directory"
        app_path = self.app_path
        while app_path != '/':
            for dirname, dirnames, filenames in os.walk(app_path):
                for subdir in dirnames:
                    path = os.path.join(dirname, subdir)
                    if 'solutions/SA-Eventgen' in path and "SA-Eventgen" not in dirname:
                        return dirname
            app_path = os.path.dirname(app_path)

    def find_app_test_common(self):
        print "finding test directory"
        app_path = self.app_path
        while app_path != '/':
            for dirname, dirnames, filenames in os.walk(app_path):
                for subdir in dirnames:
                    path = os.path.join(dirname, subdir)
                    if '%s/test/common' %(self.codeline) in path:
                        return path

    def find_generated_test(self):
        regex = re.compile(".*_gen\.py")
        print "finding generated test"
        test_folder = os.path.dirname(self.app_test_common_path)
        for dirname, dirnames, filenames in os.walk(test_folder):
            for filename in filenames:
                path = os.path.join(dirname, filename)
                if regex.match(path):
                    return path

    def build_python_path(self):
        line1 = os.path.join(self.current_path, "new_test/lib")
        line2 = os.path.join(self.current_path, "new_test/lib/pytest/plugin")
        line3 = os.path.join(self.splunk_home, "lib/python2.7/site-packages/")
        line4 = os.path.join(self.solutions_path, "common/test")
        line5 = self.app_test_common_path
        line6 = os.path.join(self.solutions_path, "shared/bin/mainline")
        line7 = os.path.join(self.current_path, "new_test")
        old_p_path = os.getenv('PYTHONPATH', '').strip(':')
        os.environ['PYTHONPATH'] = "%s:%s:%s:%s:%s:%s:%s:%s" %(line1, line2, line3, line4, line5, line6, line7, old_p_path)

    def build_env(self):
        os.environ['SPLUNK_HOME'] = self.splunk_home
        os.environ['SOLN_ROOT'] = self.solutions_path
        self.build_python_path()

    def run_test(self):
        self.build_env()
        new_test_path = os.path.join(self.current_path, 'new_test')
        subprocess.call("python %s/bin/pytest/pytest.py %s --junitxml test-result.xml" %(new_test_path, self.generated_test_path), shell=True)

def main():
    parser = OptionParser(usage="usage: python %prog [DIRECTORY]", version="%prog 1.0")
    parser.add_option("-d", "--directory", default=None, help="the directory of the TA")
    parser.add_option('-s', '--splunk_home', default=os.getenv('SPLUNK_HOME'), help="Splunk installation directory")
    parser.add_option("-c", "--codeline", default='mainline', help="the codeline, default is mainline")
    (options, args) = parser.parse_args()
    directory = args[0] if len(args) > 0 else options.directory
    if directory == None:
        print "No Directory given!"
        return
    chauffeur = Chauffeur(directory, options.splunk_home, options.codeline)
    chauffeur.run_test()

if __name__ == "__main__":
    main()
