
'''
Compares Test Results before ITSI updgrade and after.
Asserts if they are not identical.
To run this -> Invoke compare_files.py results1.xml result2.xml
'''

import sys
import filecmp

result = filecmp.cmp(sys.argv[1], sys.argv[2]) 
assert result == True

