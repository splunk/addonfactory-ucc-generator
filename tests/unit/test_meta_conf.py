#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import tempfile

from splunk_add_on_ucc_framework import meta_conf as meta_conf_lib


def test_create_default():
    meta_conf = meta_conf_lib.MetaConf()
    with tempfile.TemporaryDirectory() as temp_dir:
        meta_conf.create_default()
        output_default_meta_path = os.path.join(
            temp_dir, meta_conf_lib.DEFAULT_META_FILE_NAME
        )
        meta_conf.write(output_default_meta_path)
        expected_output = meta_conf_lib.DEFAULT
        with open(output_default_meta_path) as output_app_conf_fd:
            assert expected_output == output_app_conf_fd.read()
