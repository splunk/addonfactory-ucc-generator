#
# Copyright 2024 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from typing import Dict, Any, List, Optional

from splunk_add_on_ucc_framework.entity.entity import Entity
from splunk_add_on_ucc_framework.entity.interval_entity import IntervalEntity
from splunk_add_on_ucc_framework.entity.index_entity import IndexEntity

ENTITY_TYPES = [
    IntervalEntity,
    IndexEntity,
]


def resolve_entity(
    entity_definition: Dict[str, Any],
    entity_types: Optional[List[Any]] = None,
) -> Entity:
    entity_types = entity_types if entity_types else ENTITY_TYPES
    for entity_type in entity_types:
        entity = entity_type.from_definition(entity_definition)

        if entity is not None:
            return entity

    return Entity(entity_definition)


def expand_entity(entity_definition: Dict[str, Any]) -> Dict[str, Any]:
    return resolve_entity(entity_definition).long_form()


def collapse_entity(
    entity_definition: Dict[str, Any],
    entity_types: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    return resolve_entity(entity_definition, entity_types).short_form()
