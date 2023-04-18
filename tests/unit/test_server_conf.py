import os
import tempfile

from splunk_add_on_ucc_framework import server_conf as server_conf_lib
from tests.unit import helpers


def test_create_default():
    server_conf = server_conf_lib.ServerConf()
    with tempfile.TemporaryDirectory() as temp_dir:
        server_conf.create_default(
            [
                "splunk_ta_ucc_example_settings",
                "splunk_ta_ucc_example_account",
                "splunk_ta_ucc_example_oauth",
            ]
        )
        output_default_server_conf_path = os.path.join(
            temp_dir, server_conf_lib.SERVER_CONF_FILE_NAME
        )
        server_conf.write(output_default_server_conf_path)
        server_conf_expected = helpers.get_testdata_file("server.conf.generated")
        with open(output_default_server_conf_path) as output_server_conf_fd:
            assert server_conf_expected == output_server_conf_fd.read()
