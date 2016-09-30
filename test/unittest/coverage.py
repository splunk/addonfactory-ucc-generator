import unittest

from test_falcon_host_data_client import TestFalconHostClient
from test_falcon_host_stream_api import TestFalconHostStreamAPI

if __name__ == "__main__":
    print TestFalconHostClient.__name__
    print TestFalconHostStreamAPI.__name__
    unittest.main()
