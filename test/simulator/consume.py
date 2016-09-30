import sys
import os
folder_path = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(folder_path, '../../package/bin/splunk_ta_crowdstrike'))
from falcon_host_stream_api import consume


def main():
    stream, gen, closer = consume('315986b0-3199-4aaf-83e6-2a7af2fce818',
                                  'MGI3OTlmMTEtZjc1OS00ZjlmLWJjNTctN2QwNWU0MTkzMDli',
                                  app_id='315986b0-3199-4aaf-83e6-2a7afce8',
                                  fire_host="http://127.0.0.1:8080/discover")
    for g in gen:
        print g


if __name__ == '__main__':
    main()
