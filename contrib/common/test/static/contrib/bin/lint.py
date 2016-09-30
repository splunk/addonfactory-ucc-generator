import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from pylint import lint
lint.Run(sys.argv[1:])

