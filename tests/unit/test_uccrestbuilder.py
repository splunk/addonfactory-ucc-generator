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
import pytest

from splunk_add_on_ucc_framework.uccrestbuilder.endpoint import base


@pytest.mark.parametrize(
    "lines,expected",
    [
        (None, "    None"),
        (
            "\nmax_len=4096,\nmin_len=0,\n",
            "\n    max_len=4096,\n    min_len=0,\n",
        ),
        (
            "validator.String(\n    max_len=4096,\n    min_len=0,\n)",
            "    validator.String(\n        max_len=4096,\n        min_len=0,\n    )",
        ),
    ],
)
def test_indent(lines, expected):
    assert base.indent(lines) == expected
