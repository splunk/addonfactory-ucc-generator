import os

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework.commands.rest_builder.global_config_builder_schema import (
    GlobalConfigBuilderSchema,
)
from splunk_add_on_ucc_framework import global_config as gc
from splunk_add_on_ucc_framework.commands.rest_builder.builder import RestBuilder

base_file_content = [
    "\n",
    "import os\n",
    "import sys\n",
    "import re\n",
    "from os.path import dirname\n",
    "\n",
    "ta_name = 'Splunk_TA_UCCExample'\n",
    "pattern = re.compile(r'[\\\\/]etc[\\\\/]apps[\\\\/][^\\\\/]+[\\\\/]bin[\\\\/]?$')\n",
    "new_paths = [path for path in sys.path if not pattern.search(path) or ta_name in path]\n",
    'new_paths.insert(0, os.path.join(dirname(dirname(__file__)), "lib"))\n',
    "new_paths.insert(0, os.path.sep.join([os.path.dirname(__file__), ta_name]))\n",
    "sys.path = new_paths\n",
]

file_content_with_os_lib = base_file_content + [
    "\n",
    "bindir = os.path.dirname(os.path.realpath(os.path.dirname(__file__)))\n",
    'libdir = os.path.join(bindir, "lib")\n',
    "platform = sys.platform\n",
    'if platform.startswith("win"):\n',
    '\tsys.path.insert(0, os.path.join(libdir, "3rdparty/windows"))\n',
    'if platform.startswith("darwin"):\n',
    '\tsys.path.insert(0, os.path.join(libdir, "3rdparty/darwin"))\n',
    'if platform.startswith("linux"):\n',
    '\tsys.path.insert(0, os.path.join(libdir, "3rdparty/linux"))\n',
]


def test_generate_import_declare_test_with_os_lib(tmp_path):
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_with_os_libraries.json"
    )
    global_config = gc.GlobalConfig(global_config_path, False)

    tmp_lib_path = tmp_path / "output"
    run_rest_builder_build(global_config, tmp_lib_path)

    with open(os.path.join(tmp_lib_path, "bin", "import_declare_test.py")) as file:
        content = file.readlines()
        assert content == file_content_with_os_lib


def test_generate_import_declare_test_without_os_lib(tmp_path):
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_only_configuration.json"
    )
    global_config = gc.GlobalConfig(global_config_path, False)

    tmp_lib_path = tmp_path / "output"
    run_rest_builder_build(global_config, tmp_lib_path)

    with open(os.path.join(tmp_lib_path, "bin", "import_declare_test.py")) as file:
        content = file.readlines()
        assert content == base_file_content


def run_rest_builder_build(global_config, tmp_lib_path):
    global_config_builder_schema = GlobalConfigBuilderSchema(global_config)

    tmp_lib_path.mkdir()

    RestBuilder(global_config_builder_schema, str(tmp_lib_path)).build()

    os.listdir(tmp_lib_path)
    os.walk(tmp_lib_path)
