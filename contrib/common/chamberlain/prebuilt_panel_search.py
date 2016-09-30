__author__ = 'Zimo'

import sys
import getopt

from CaseGenerator import CaseGenerator
from PrebuiltPanelSearch import PrebuiltPanelSearch

def main(argv):
    try:
        panel_search = PrebuiltPanelSearch(argv)
        searches = panel_search.parse()
        caseGenerator = CaseGenerator(panel_search.get_TA_name())
        code = caseGenerator.gen_prebuilt_panel_search_test_suite(searches)
        caseGenerator.write_to_file(code,
        "test_" + caseGenerator.get_TA_name().lower().replace('-', '_') + "_prebuilt_panel_search.py")
    except:
        print 'Usage: python prebuilt_panel_string.py <TA_installation_path>'
    print 'done'



if __name__ == '__main__':
    main(sys.argv[1])