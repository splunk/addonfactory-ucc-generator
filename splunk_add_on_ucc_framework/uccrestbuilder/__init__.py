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

"""
REST Builder.
"""
import collections

from splunk_add_on_ucc_framework.uccrestbuilder.builder import (
    RestBuilder,
    RestBuilderError,
)

__all__ = [
    "RestBuilder",
    "RestBuilderError",
    "RestHandlerClass",
    "build",
]

RestHandlerClass = collections.namedtuple(
    "RestHandlerClass",
    ("module", "name"),
)


def build(
    schema,
    rest_handler_module,
    rest_handler_class,
    output_path,
    post_process=None,
    *args,
    **kwargs
):
    builder_obj = RestBuilder(
        schema, RestHandlerClass(rest_handler_module, rest_handler_class), output_path
    )
    builder_obj.build()
    if post_process is not None:
        post_process(builder_obj, schema, *args, **kwargs)
    return builder_obj
