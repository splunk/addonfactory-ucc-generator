"""
This module provides discovery engine object to divide settings.
"""

import traceback
import re

from copy import deepcopy

from splunktaucclib.ucc_server.schema_manager import DivisionSchemaManager
from splunktaucclib.ucc_server import UCCServerException


class DiscoveryEngineException(UCCServerException):
    pass


class DiscoveryEngine(object):
    """
    Discovery engine.
    """

    # For internal
    SOURCE_MAPPING = "__source_mapping__"

    def __init__(self, division_schema, ucc_server_id):
        """
        @division_schema: division schema.
        @ucc_server_id: ucc server id.
        """

        assert division_schema, "division_schema is None."

        self._division_schema_manager = DivisionSchemaManager(division_schema)
        self._ucc_server_id = ucc_server_id

    def get_refer_schemas(self):
        """
        Get refer schemas.
        """

        return self._division_schema_manager.get_refer_schemas()

    def divide_settings(self, settings):
        """
        Divide settings.
        """

        # Check settings
        self._division_schema_manager.check_settings_are_valid(settings)

        # Divide settings
        # Handle split settings
        for name1, name3 in \
                self._division_schema_manager.get_ordered_schemas():
            value1 = settings[name1]
            value1_copy = deepcopy(value1)
            for name2, value2 in value1.items():
                if not name2 == self.SOURCE_MAPPING:
                    assert name3 in value2, \
                        DiscoveryEngineException(
                            "Invalid discovery input settings:"
                            " {} has no {}.".format(name2, name3))
                    sep = self._division_schema_manager.get_separator(name1,
                                                                      name3)
                    if sep:
                        if self.SOURCE_MAPPING not in value1_copy:
                            value1_copy[self.SOURCE_MAPPING] = {}
                        if name2.split("_")[0] not in \
                           value1_copy[self.SOURCE_MAPPING]:
                            value1_copy[self.SOURCE_MAPPING][name2.split("_")[0]] = \
                                []

                        value3s = [value3.strip() for
                                   value3 in value2[name3].split(sep)]
                        del value1_copy[name2]
                        for value3 in value3s:
                            value2_copy = deepcopy(value2)
                            value2_copy[name3] = value3
                            value1_copy[name2 + "_" + value3] = value2_copy
                            value1_copy[self.SOURCE_MAPPING][name2.split("_")[0]].\
                                append(name2 + "_" + value3)
                        if name2 in value1_copy[
                                self.SOURCE_MAPPING][name2.split("_")[0]]:
                            value1_copy[
                                self.SOURCE_MAPPING][name2.split("_")[0]].\
                                remove(name2)
            settings[name1] = value1_copy

        # Handle refer settings
        for name1, name3 in \
                self._division_schema_manager.get_ordered_schemas():
            refer = self._division_schema_manager.get_refer(name1, name3)
            if refer:
                assert refer in settings, \
                    DiscoveryEngineException(
                        "Invalid discovery input settings: "
                        "has no {}.".format(refer))
                value1 = settings[name1]
                value1_copy = deepcopy(value1)
                refer_value = settings[refer]

                for name2, value2 in value1.items():
                    if not name2 == self.SOURCE_MAPPING:
                        value3 = value2[name3]
                        if value3 not in refer_value:
                            try:
                                assert self.SOURCE_MAPPING in refer_value and \
                                    value3 in refer_value[self.SOURCE_MAPPING]
                            except Exception as e:
                                raise DiscoveryEngineException(
                                    "Invalid discovery input settings: "
                                    "{}.".format(traceback.format_exc(e)))
                            del value1_copy[name2]
                            for new_value3 in \
                                    refer_value[self.SOURCE_MAPPING][value3]:
                                value2_copy = deepcopy(value2)
                                value2_copy[name3] = new_value3
                                new_name2 = name2.split("_")
                                new_name2.remove(value3)
                                new_name2.append(new_value3)
                                new_name2 = "_".join(new_name2)
                                value1_copy[new_name2] = value2_copy
                                value1_copy[self.SOURCE_MAPPING][name2.split("_")[0]].\
                                    append(name2 + "_" + new_value3)
                            if name2 in value1_copy[
                                    self.SOURCE_MAPPING][name2.split("_")[0]]:
                                value1_copy[
                                    self.SOURCE_MAPPING][name2.split("_")[0]].\
                                    remove(name2)
                    settings[name1] = value1_copy

        # Remove SOURCE_MAPPING
        for name1, _ in self._division_schema_manager.get_ordered_schemas():
            value1 = settings[name1]
            if self.SOURCE_MAPPING in value1:
                del value1[self.SOURCE_MAPPING]

        # Add ucc_server_id prefix
        refer_schemas = self._division_schema_manager.\
            get_ordered_refer_schemas()
        for name1, name3, refer in refer_schemas:
            value1 = settings[refer]
            for name2, value2 in deepcopy(value1).items():
                if not name2.startswith(self._ucc_server_id):
                    del value1[name2]
                    value1[self._ucc_server_id + "_" + name2] = value2

            value1 = settings[name1]
            for name2, value2 in deepcopy(value1).items():
                if not value2[name3].startswith(self._ucc_server_id):
                    value2[name3] = self._ucc_server_id + "_" + value2[name3]

                if not name2.startswith(self._ucc_server_id):
                    del value1[name2]
                    value1[self._ucc_server_id + "_" + name2] = value2

        # Renaming settings
        for name1, pattern, replace in self._division_schema_manager.\
                get_renaming_schemas():
            value1 = settings[name1]
            for name2, value2 in deepcopy(value1).items():
                del value1[name2]
                new_name = re.compile(pattern).sub(replace, name2)
                value1[new_name] = value2

        return settings
