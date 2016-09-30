"""
This module provides various schema management.
"""

import json
from splunktaucclib.ucc_server import UCCServerException


class SchemaManagerException(UCCServerException):
    """
    Schema manager exception.
    """
    pass


class SchemaManager(object):
    """
    Base schema manager.
    """

    # Schemma keys.
    PRODUCT = "_product"
    VERSION = "_version"
    PROTOCOL_VERSION = "_protocol_version"
    REST_NAMESPACE = "_rest_namespace"
    REST_PREFIX = "_rest_prefix"

    def __init__(self, schema):
        """
        @schema: schema to load.
        """

        # Check schema are json compatible
        json.dumps(schema)

        self._product = schema[self.PRODUCT]
        self._version = schema[self.VERSION]
        self._protocol_version = schema[self.PROTOCOL_VERSION]
        self._rest_namespace = schema[self.REST_NAMESPACE]
        self._rest_prefix = schema[self.REST_PREFIX]

    @property
    def product(self):
        """
        Get product property.
        """

        return self._product

    @property
    def version(self):
        """
        Get product version property.
        """

        return self._version

    @property
    def protocol_version(self):
        """
        Get protocol version property.
        """

        return self._protocol_version

    @property
    def rest_namespace(self):
        """
        Get rest namespace property.
        """

        return self._rest_namespace

    @property
    def rest_prefix(self):
        """
        Get rest prefix property.
        """

        return self._rest_prefix

    def check_settings_are_valid(self, settings):
        """
        Check settings are valid.
        """

        try:
            # Check settings are json compatible
            json.dumps(settings)

            assert settings[self.PRODUCT] == self._product
            assert settings[self.VERSION] == self._version
            assert settings[self.PROTOCOL_VERSION] == self._protocol_version
        except Exception as e:
            raise SchemaManagerException(e)

        # Reset rest namespace and prefix
        settings[self.REST_NAMESPACE] = self._rest_namespace
        settings[self.REST_PREFIX] = self._rest_prefix


class DivisionSchema(object):
    """
    Division schema.
    """

    def __init__(self, name1, name3, value3, refer, score):
        """
        DivisionSchema init.

        @name1: schema level 1 name.
        @name3: schema level 3 name.
        @value3: schema level 3 value.
        @refer: schema refer.
        @score: schema score.
        """

        self._name1 = name1
        self._name3 = name3
        self._value3 = value3
        self._refer = refer
        self._score = score

    @property
    def name1(self):
        """
        Get name1.
        """

        return self._name1

    @property
    def name3(self):
        """
        Get name3.
        """

        return self._name3

    @property
    def value3(self):
        """
        Get value3.
        """

        return self._value3

    @property
    def refer(self):
        """
        Get refer.
        """

        return self._refer

    @property
    def score(self):
        """
        Get score.
        """

        return self._score

    @score.setter
    def score(self, score):
        """
        Set score.
        """

        self._score = score

    def __cmp__(self, other):
        assert isinstance(other, DivisionSchema), \
            "Invalid type to compare: {}.".format(type(other))
        return cmp(self._score, other.score)

    def __str__(self):
        return "({}, {}, {}, {}, {})".format(self._name1, self._name3,
                                             self._value3, self._refer,
                                             self._score)

    def __repr__(self):
        return self.__str__()


class DivisionSchemaManager(SchemaManager):
    """
    Division schema manager.
    """

    # Division schema keys.
    TYPE = "type"

    TYPE_REGEX = "regex"
    PATTERN = "pattern"
    REPLACE = "replace"

    TYPE_SINGLE = "single"
    TYPE_MULTI = "multi"
    REFER = "refer"
    SEPARATOR = "separator"

    def __init__(self, division_schema):
        """
        @division_schema: division schema to load.
        """

        super(DivisionSchemaManager, self).__init__(division_schema)

        self._renaming_schemas = []

        # Extract schemas
        tmp = []
        for name1, value1 in division_schema.iteritems():
            if isinstance(value1, dict):
                for name3, value3 in value1.iteritems():
                    if name3 == "_renaming":
                        try:
                            assert self.TYPE in value3 and \
                                value3[self.TYPE] in \
                                [self.TYPE_REGEX] and \
                                self.PATTERN in value3 and \
                                self.REPLACE in value3
                        except Exception as e:
                            raise SchemaManagerException(
                                "Invalid division schema: {}.".format(e))
                        self._renaming_schemas.append((name1,
                                                       value3[self.PATTERN],
                                                       value3[self.REPLACE]))
                    else:
                        try:
                            assert self.TYPE in value3 and \
                                value3[self.TYPE] in \
                                [self.TYPE_SINGLE, self.TYPE_MULTI] and \
                                self.SEPARATOR in value3 if \
                                value3[self.TYPE] == self.TYPE_MULTI else True
                        except Exception as e:
                            raise SchemaManagerException(
                                "Invalid division schema: {}.".format(e))

                        if self.REFER not in value3:
                            tmp.append(DivisionSchema(
                                name1, name3, value3, None, 0))
                        else:
                            if value3[self.REFER] in division_schema:
                                tmp.append(DivisionSchema(
                                    name1, name3, value3,
                                    value3[self.REFER], 1024))
                            else:
                                tmp.append(DivisionSchema(name1, name3, value3,
                                                          value3[self.REFER],
                                                          1))

        # Sort schemas based on refer and score
        self._ordered_schemas = []
        while tmp:
            tmp.sort(reverse=True)
            min_schema = tmp.pop()
            self._ordered_schemas.append(min_schema)
            for schema in tmp:
                if schema.refer and schema.refer == min_schema.name1:
                    schema.score = min_schema.score + 1

        # Set division schema
        self._division_schema = division_schema

    def check_settings_are_valid(self, settings):
        """
        Check division settings are valid.

        @settings: division settings to check.
        """

        try:
            super(DivisionSchemaManager, self).check_settings_are_valid(
                settings)
            for schema in self._ordered_schemas:
                assert schema.name1 in settings
                for _, value2 in settings[schema.name1].iteritems():
                    assert schema.name3 in value2
        except Exception as e:
            raise SchemaManagerException(e)

    def get_ordered_schemas(self):
        """
        Get ordered schemas info.
        """

        return [(schema.name1, schema.name3) for
                schema in self._ordered_schemas]

    def get_ordered_refer_schemas(self):
        """
        Get ordered refer schemas info.
        """

        return [(schema.name1, schema.name3, schema.refer) for
                schema in self._ordered_schemas if schema.refer]

    def get_renaming_schemas(self):
        """
        Get renaming schemas info.
        """

        return self._renaming_schemas

    def get_separator(self, name1, name3):
        """
        Get schema separator.
        """

        for schema in self._ordered_schemas:
            if schema.name1 == name1 and schema.name3 == name3:
                return schema.value3[self.SEPARATOR] if self.SEPARATOR in \
                    schema.value3 else None

        raise SchemaManagerException(
            "Non exits separator for {}:{}.".format(name1, name3))

    def get_refer(self, name1, name3):
        """
        Get schema refer.
        """

        for schema in self._ordered_schemas:
            if schema.name1 == name1 and schema.name3 == name3:
                return schema.refer

        raise SchemaManagerException(
            "Non exits refer for {}:{}.".format(name1, name3))

    def get_score(self, name1, name3):
        """
        Get schema score.
        """

        for schema in self._ordered_schemas:
            if schema.name1 == name1 and schema.name3 == name3:
                return schema.score

        raise SchemaManagerException(
            "Non exits score for {}:{}.".format(name1, name3))


class DispatchSchemaManager(SchemaManager):
    """
    Dispatch schema manager.
    """

    # Dispatch schemma keys.
    RESET_ENDPOINT = "reset_endpoint"
    ENDPOINT = "endpoint"
    ROLE = "role"
    ROLE_FOWARDER = "forwarder"
    ROLE_GLOBAL_SETTING = "global_setting"
    ROLE_INPUT = "input"
    FORWARDER_FIELDS = "fields"
    FORWARDER_FIELDS_DISABLED = "disabled"
    FORWARDER_FIELDS_TYPE = "type"
    FORWARDER_FIELDS_TYPE_LOCAL = "local"
    FORWARDER_FIELDS_TYPE_REMOTE = "remote"
    FORWARDER_FIELDS_HOST = "host"
    FORWARDER_FIELDS_PORT = "port"
    FORWARDER_FIELDS_USERNAME = "username"
    FORWARDER_FIELDS_PASSWORD = "password"
    GLOBAL_SETTING_PRIORITY = "priority"
    INPUT_DEFAULT_LOAD_CORE = "default_load_score"

    def __init__(self, dispatch_schema):
        """
        @dispatch_schema: dispatch schema to load.
        """

        super(DispatchSchemaManager, self).__init__(dispatch_schema)

        self._global_setting_schemas = set()
        self._input_schemas = set()
        tmp = []
        for key, value in dispatch_schema.iteritems():
            if isinstance(value, dict):
                assert self.ROLE in value, \
                    SchemaManagerException(
                        "Invalid dispatch schema: {} has "
                        "no field: {}.".format(key, self.ROLE))

                if value[self.ROLE] == self.ROLE_FOWARDER:
                    tmp.append(key)
                elif value[self.ROLE] == self.ROLE_GLOBAL_SETTING:
                    self._global_setting_schemas.add(key)
                elif value[self.ROLE] == self.ROLE_INPUT:
                    self._input_schemas.add(key)
                else:
                    raise SchemaManagerException(
                        "Invalid dispatch schema role: {}.".format(
                            value[self.ROLE]))

        assert len(tmp) == 1, SchemaManagerException(
            "Invalid dispatch schema: must and only have one "
            "forwarder schema.")
        self._forwarder_schema = tmp[0]

        assert self._global_setting_schemas, SchemaManagerException(
            "Invalid dispatch schema: has no global setting schema.")

        assert self._input_schemas, SchemaManagerException(
            "Invalid dispatch schema: has no input schema.")

        forwarder_setting = dispatch_schema[self._forwarder_schema]
        try:
            assert self.RESET_ENDPOINT in forwarder_setting and \
                self.ROLE in forwarder_setting and \
                self.FORWARDER_FIELDS in forwarder_setting
        except Exception as e:
            raise SchemaManagerException(
                "Invalid forwarder schema: {} setting: {}.".format(
                    self._forwarder_schema, e))

        forwarder_fields = \
            dispatch_schema[self._forwarder_schema][self.FORWARDER_FIELDS]
        try:
            assert self.FORWARDER_FIELDS_TYPE in forwarder_fields and \
                self.FORWARDER_FIELDS_HOST in forwarder_fields and \
                self.FORWARDER_FIELDS_PORT in forwarder_fields and \
                self.FORWARDER_FIELDS_USERNAME in forwarder_fields and \
                self.FORWARDER_FIELDS_PASSWORD in forwarder_fields
        except Exception as e:
            raise SchemaManagerException(
                "Invalid forwarder schema: {} fields setting: {}".format(
                    self._forwarder_schema, e))
        self._forwarder_field_type = \
            forwarder_fields[self.FORWARDER_FIELDS_TYPE]
        self._forwarder_field_host = \
            forwarder_fields[self.FORWARDER_FIELDS_HOST]
        self._forwarder_field_port = \
            forwarder_fields[self.FORWARDER_FIELDS_PORT]
        self._forwarder_field_username = \
            forwarder_fields[self.FORWARDER_FIELDS_USERNAME]
        self._forwarder_field_password = \
            forwarder_fields[self.FORWARDER_FIELDS_PASSWORD]

        for global_setting_schema in self._global_setting_schemas:
            global_setting_setting = dispatch_schema[global_setting_schema]
            try:
                assert self.ENDPOINT in global_setting_setting and \
                    self.ROLE in global_setting_setting and \
                    self.GLOBAL_SETTING_PRIORITY in global_setting_setting
            except Exception as e:
                raise SchemaManagerException(
                    "Invalid global setting schema: {} setting: {}".format(
                        global_setting_schema, e))

        for input_schema in self._input_schemas:
            input_setting = dispatch_schema[input_schema]
            try:
                assert self.ENDPOINT in input_setting and \
                    self.ROLE in input_setting and \
                    self.INPUT_DEFAULT_LOAD_CORE in input_setting
            except Exception as e:
                raise SchemaManagerException(
                    "Invalid input schema: {} settings: {}".format(
                        input_schema, e))

        self._dispatch_schema = dispatch_schema

    def check_settings_are_valid(self, settings):
        """
        Check dispatch settings are valid.

        @settings: dispatch settings to check.
        """

        try:
            super(DispatchSchemaManager, self).check_settings_are_valid(
                settings)
            valid_schemas = set.union(self._global_setting_schemas,
                                      self._input_schemas)
            valid_schemas.add(self._forwarder_schema)
            for schema in settings.keys():
                assert schema in valid_schemas if \
                    not schema.startswith("_") else True
        except Exception as e:
            raise SchemaManagerException(e)

    def get_forwarder_schema(self):
        """
        Get forwarder schema.
        """
        return self._forwarder_schema

    def forwarder_is_disabled(self, forwarder_setting):
        """
        Get forwarder info.

        @return: True if forwarder is disabled else False
        """

        return forwarder_setting[self.FORWARDER_FIELDS_DISABLED]

    def get_forwarder_info(self, forwarder_setting):
        """
        Get forwarder info.

        @return: (host, port, username, password)
        """

        if forwarder_setting[self._forwarder_field_type] == \
           self.FORWARDER_FIELDS_TYPE_LOCAL:
            return (None, None, None, None)
        else:
            return (forwarder_setting[self._forwarder_field_host],
                    forwarder_setting[self._forwarder_field_port],
                    forwarder_setting[self._forwarder_field_username],
                    forwarder_setting[self._forwarder_field_password])

    def forwarder_is_local(self, forwarder_setting):
        """
        Check forwarder is local.
        """

        return forwarder_setting[self._forwarder_field_type] == \
            self.FORWARDER_FIELDS_TYPE_LOCAL

    def get_global_setting_schemas(self):
        """
        Get global setting schemas.
        """
        return self._global_setting_schemas

    def get_ordered_global_setting_schemas(self):
        """
        Get ordered global setting schemas based on each global setting
        priority.
        """
        tmp = [(schema,
                self._dispatch_schema[schema][self.GLOBAL_SETTING_PRIORITY])
               for schema in self._global_setting_schemas]
        return [entry[0] for entry in sorted(tmp, key=lambda x: x[1])]

    def get_input_schemas(self):
        """
        Get input schemas.
        """

        return self._input_schemas

    def get_endpoint(self, schema):
        """
        Get schema endpoint.
        """

        if schema == self._forwarder_schema:
            endpoint = self._dispatch_schema[schema][self.RESET_ENDPOINT]
        else:
            endpoint = self._dispatch_schema[schema][self.ENDPOINT]

        return "{}/{}/{}{}".format(self.rest_namespace, self.protocol_version,
                                   self.rest_prefix, endpoint)
