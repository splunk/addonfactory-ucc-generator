import builtins
import re
from contextlib import nullcontext as does_not_raise
from copy import deepcopy
from typing import Dict, Any

import pytest

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework import dashboard
from splunk_add_on_ucc_framework.global_config_validator import (
    GlobalConfigValidator,
    GlobalConfigValidatorException,
    ENTITY_TYPES_WITHOUT_VALIDATORS,
    should_warn_on_empty_validators,
)
from splunk_add_on_ucc_framework import global_config as global_config_lib


@pytest.mark.parametrize(
    "filename",
    [
        "valid_config.json",
        "valid_config.yaml",
        "valid_config_only_logging.json",
    ],
)
def test_config_validation_when_valid(filename):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig(global_config_path)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with does_not_raise():
        validator.validate()


def test_autocompletefields_support_integer_values():
    # Regression unit test: https://github.com/splunk/addonfactory-ucc-generator/issues/794
    global_config_path = helpers.get_testdata_file_path(
        "invalid_config_configuration_autoCompleteFields_integer_values.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with does_not_raise():
        validator.validate()


def test_autocompletefields_children_support_integer_values():
    # Regression unit test: https://github.com/splunk/addonfactory-ucc-generator/issues/794
    global_config_path = helpers.get_testdata_file_path(
        "invalid_config_configuration_autoCompleteFields_children_integer_values.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with does_not_raise():
        validator.validate()


@pytest.mark.parametrize(
    "filename,exception_message",
    [
        (
            "invalid_config_no_configuration_tabs.json",
            "[] is too short",
        ),
        (
            "invalid_config_no_name_field_in_configuration_tab_table.json",
            "Tab 'account' should have entity with field 'name'",
        ),
        # restHandlerName and restHandlerModule are present in the
        # "example_input_one" input
        (
            "invalid_config_both_rest_handler_name_module_are_present.json",
            (
                "Input 'example_input_one' has both 'restHandlerName' and "
                "'restHandlerModule' or 'restHandlerClass' fields present. "
                "Please use only 'restHandlerName' or 'restHandlerModule' "
                "and 'restHandlerClass'."
            ),
        ),
        # restHandlerName and restHandlerClass are present in the
        # "example_input_one" input
        (
            "invalid_config_both_rest_handler_name_class_are_present.json",
            (
                "Input 'example_input_one' has both 'restHandlerName' and "
                "'restHandlerModule' or 'restHandlerClass' fields present. "
                "Please use only 'restHandlerName' or 'restHandlerModule' "
                "and 'restHandlerClass'."
            ),
        ),
        # Only restHandlerModule is present in the "example_input_one" input
        (
            "invalid_config_only_rest_handler_module_is_present.json",
            (
                "Input 'example_input_one' should have both 'restHandlerModule'"
                " and 'restHandlerClass' fields present, only 1 of them was found."
            ),
        ),
        # Only restHandlerClass is present in the "example_input_one" input
        (
            "invalid_config_only_rest_handler_class_is_present.json",
            (
                "Input 'example_input_one' should have both 'restHandlerModule'"
                " and 'restHandlerClass' fields present, only 1 of them was found."
            ),
        ),
        (
            "invalid_config_options_missing_for_file_input.json",
            (
                "Options field for the file type should be present for 'service_account' field."
            ),
        ),
        (
            "invalid_config_supported_file_types_field_is_missing.json",
            (
                "You should define your supported file types in "
                "the `supportedFileTypes` field for the "
                "'service_account' field."
            ),
        ),
        (
            "invalid_config_file_is_encrypted_but_not_required.json",
            (
                "Field service_account uses type 'file' which is encrypted and not required, this is not supported"
            ),
        ),
        (
            "invalid_config_configuration_string_validator_maxLength_less_than_minLength.json",
            (
                "Entity 'name' has incorrect string validator, "
                "'maxLength' should be greater or equal than 'minLength'."
            ),
        ),
        (
            "invalid_config_configuration_number_validator_range_should_have_2_elements.json",
            (
                "Entity 'interval' has incorrect number validator, "
                "it should have 2 elements under 'range' field."
            ),
        ),
        (
            "invalid_config_configuration_number_validator_interval_range.json",
            (
                "Entity 'interval' has incorrect number validator, "
                "it should have 2 elements under 'range' field."
            ),
        ),
        (
            "invalid_config_configuration_number_validator_range_second_element_smaller_than_first.json",
            (
                "Entity 'interval' has incorrect number validator, "
                "second element should be greater or equal than first element."
            ),
        ),
        (
            "invalid_config_configuration_regex_validator_non_compilable_pattern.json",
            (
                "Entity 'name' has incorrect regex validator, "
                "pattern provided in the 'pattern' field is not compilable."
            ),
        ),
        (
            "invalid_config_inputs_string_validator_maxLength_less_than_minLength.json",
            (
                "Entity 'name' has incorrect string validator, "
                "'maxLength' should be greater or equal than 'minLength'."
            ),
        ),
        (
            "invalid_config_inputs_number_validator_range_should_have_2_elements.json",
            (
                "Entity 'port' has incorrect number validator, "
                "it should have 2 elements under 'range' field."
            ),
        ),
        (
            "invalid_config_inputs_number_validator_range_second_element_smaller_than_first.json",
            (
                "Entity 'port' has incorrect number validator, "
                "second element should be greater or equal than first element."
            ),
        ),
        (
            "invalid_config_inputs_regex_validator_non_compilable_pattern.json",
            (
                "Entity 'name' has incorrect regex validator, "
                "pattern provided in the 'pattern' field is not compilable."
            ),
        ),
        (
            "invalid_config_no_configuration_tabs.yaml",
            "[] is too short",
        ),
        (
            "invalid_config_no_name_field_in_configuration_tab_table.yaml",
            "Tab 'account' should have entity with field 'name'",
        ),
        (
            "invalid_config_configuration_autoCompleteFields_duplicates.json",
            "Duplicates found for autoCompleteFields: 'Duplicate'",
        ),
        (
            "invalid_config_configuration_children_duplicates.json",
            "Duplicates found for autoCompleteFields children in entity 'Duplicate'",
        ),
        (
            "invalid_config_configuration_entity_duplicates.json",
            "Duplicates found for entity field or label",
        ),
        (
            "invalid_config_configuration_tabs_duplicates.json",
            "Duplicates found for tabs names, titles or types",
        ),
        (
            "invalid_config_configuration_tabs_type_duplicates.json",
            "Duplicates found for tabs names, titles or types",
        ),
        (
            "invalid_config_inputs_services_duplicates.json",
            "Duplicates found for inputs (services) names or titles",
        ),
        (
            "invalid_config_inputs_entity_duplicates.json",
            "Duplicates found for entity field or label",
        ),
        (
            "invalid_config_inputs_children_duplicates.json",
            "Duplicates found for autoCompleteFields children in entity 'Single Select'",
        ),
        (
            "invalid_config_inputs_autoCompleteFields_duplicates.json",
            "Duplicates found for autoCompleteFields: 'Single Select'",
        ),
        (
            "invalid_config_inputs_multilevel_menu_duplicate_groups.json",
            "Duplicates found for multi-level menu groups' names or titles.",
        ),
        (
            "invalid_config_inputs_multilevel_menu_invalid_groupservices.json",
            (
                "example_input_three ServiceName in the multi-level menu does "
                "not match any services name."
            ),
        ),
        (
            "invalid_config_inputs_multilevel_menu_invalid_groupname_or_grouptitle.json",
            (
                "example_input_three groupName or Example Input Three "
                "groupTitle in the multi-level menu does not match any "
                "services name or title."
            ),
        ),
        (
            "invalid_config_unsupported_name_in_dashboard_panel.json",
            (
                f"'unsupported_panel_name' is not a supported panel name. "
                f"Supported panel names: {dashboard.SUPPORTED_PANEL_NAMES_READABLE}"
            ),
        ),
        (
            "invalid_config_checkbox_groups_duplicate_fields_in_options_rows.json",
            (
                "Entity test_checkbox_group has duplicate field (collectFolderCollaboration) in options.rows"
            ),
        ),
        (
            "invalid_config_checkbox_groups_undefined_field_used_in_groups.json",
            (
                "Entity test_checkbox_group uses field (undefined_field_foo) which is not defined in options.rows"
            ),
        ),
        (
            "invalid_config_checkbox_groups_duplicate_field_in_options_groups.json",
            (
                "Entity test_checkbox_group has duplicate field (collectTasksAndComments) in options.groups"
            ),
        ),
        (
            "invalid_config_group_has_duplicate_labels.json",
            (
                "Service input_with_duplicate_group_labels has duplicate labels in groups"
            ),
        ),
        (
            "invalid_config_group_uses_fields_not_defined_in_entity.json",
            (
                "Service input_with_undefined_group_field uses group field "
                "undefined_entity_field_name which is not defined in entity"
            ),
        ),
        (
            "invalid_config_meta_default_inputs_page_but_no_inputs_defined.json",
            (
                'meta.defaultView == "inputs" but there is no inputs defined in globalConfig'
            ),
        ),
        (
            "invalid_config_meta_default_dashboard_page_but_no_dashboard_defined.json",
            (
                'meta.defaultView == "dashboard" but there is no dashboard defined in globalConfig'
            ),
        ),
    ],
)
def test_config_validation_when_error(filename, exception_message):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig(global_config_path)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)
    with pytest.raises(GlobalConfigValidatorException) as exc_info:
        validator.validate()

    (msg,) = exc_info.value.args
    assert msg == exception_message


def test_config_validation_modifications_on_change():
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_with_modification_on_value_change.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with does_not_raise():
        validator.validate()


@pytest.mark.parametrize(
    "filename,raise_message",
    [
        (
            "invalid_config_with_modification_for_field_itself.json",
            "Field 'text1' tries to modify itself",
        ),
        (
            "invalid_config_with_modification_for_unexisiting_fields.json",
            "Modification in field 'text1' for not existing field 'text2'",
        ),
        (
            "invalid_config_with_modification_circular_modifications.json",
            "Circular modifications for field 'text1' in field 'text7'",
        ),
    ],
)
def test_invalid_config_modifications_correct_raises(filename, raise_message):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig(global_config_path)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with pytest.raises(GlobalConfigValidatorException) as exc_info:
        validator.validate()

    (msg,) = exc_info.value.args
    assert msg == raise_message


@pytest.mark.parametrize(
    "encoding",
    ["utf-8", "cp1250", "ascii"],
)
def test_validate_against_schema_regardless_of_the_default_encoding(
    encoding, monkeypatch
):
    @monkeypatch.function(builtins)
    def open(*args, **kwargs):
        kwargs.setdefault("encoding", encoding)
        return open._old(*args, **kwargs)

    global_config_path = helpers.get_testdata_file_path("valid_config.json")
    global_config = global_config_lib.GlobalConfig(global_config_path)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)
    validator._validate_config_against_schema()


def test_check_list_of_entities_to_skip_empty_validators_check(schema_json):
    # This test checks if the ENTITY_TYPES_WITHOUT_VALIDATORS set is up to date with the schema
    def_pattern = re.compile(r"#/definitions/(\w+)")

    any_of_entity_types = set()

    for any_of in schema_json["definitions"]["AnyOfEntity"]["items"]["anyOf"]:
        match = def_pattern.search(any_of["$ref"])
        assert match, any_of

        any_of_entity_types.add(match.group(1))

    types_with_validators = set()

    for tp in any_of_entity_types:
        entity_props = schema_json["definitions"][tp]["properties"]

        if "validators" not in entity_props:
            types_with_validators.add(entity_props["type"]["const"])

    special_case_entities = {"oauth", "checkboxGroup"}

    assert (
        ENTITY_TYPES_WITHOUT_VALIDATORS == types_with_validators - special_case_entities
    )


def test_should_warn_on_empty_validators(schema_json):
    # Radio cannot have validators at all, so no warning should be raised
    assert not should_warn_on_empty_validators(
        {
            "type": "radio",
            "label": "Example Radio",
            "field": "input_one_radio",
            "defaultValue": "yes",
            "help": "This is an example radio button for the input one entity",
            "required": False,
            "options": {
                "items": [
                    {"value": "yes", "label": "Yes"},
                    {"value": "no", "label": "No"},
                ],
                "display": True,
            },
        }
    )

    # Text should have validators, so a warning should be raised
    assert should_warn_on_empty_validators(
        {
            "type": "text",
            "label": "Name",
            "field": "name",
            "help": "Enter a unique name for this account.",
            "required": True,
        }
    )
    # empty list, so a warning should be suppressed
    assert not should_warn_on_empty_validators(
        {
            "type": "text",
            "label": "Name",
            "field": "name",
            "help": "Enter a unique name for this account.",
            "required": True,
            "validators": [],
        }
    )
    assert not should_warn_on_empty_validators(
        {
            "type": "text",
            "label": "Name",
            "field": "name",
            "help": "Enter a unique name for this account.",
            "required": True,
            "validators": [
                {
                    "type": "regex",
                    "errorMsg": "Input Name must begin with a letter and consist exclusively of alphanumeric "
                    "characters and underscores.",
                    "pattern": "^[a-zA-Z]\\w*$",
                },
                {
                    "type": "string",
                    "errorMsg": "Length of input name should be between 1 and 100",
                    "minLength": 1,
                    "maxLength": 100,
                },
            ],
        }
    )

    # Special handling for checkbox group
    checkbox_group: Dict[str, Any] = {
        "field": "apis",
        "label": "APIs/Interval (in seconds)",
        "type": "checkboxGroup",
        "options": {
            "groups": [
                {
                    "label": "EC2",
                    "options": {"isExpandable": True},
                    "fields": [
                        "ec2_volumes",
                        "ec2_instances",
                        "ec2_reserved_instances",
                    ],
                },
            ],
            "rows": [
                {
                    "field": "ec2_volumes",
                    "checkbox": {"defaultValue": True},
                    "input": {"defaultValue": 3600, "required": True},
                },
                {
                    "field": "ec2_instances",
                    "input": {"defaultValue": 3600, "required": True},
                },
                {
                    "field": "ec2_reserved_instances",
                    "input": {"defaultValue": 3600, "required": True},
                },
            ],
        },
    }

    assert should_warn_on_empty_validators(checkbox_group)

    # the group has validators now but the warning should still be raised as the rows don't have validators
    checkbox_group["validators"] = [
        {
            "type": "regex",
            "pattern": "^\\w+$",
            "errorMsg": "Characters of Name should match regex ^\\w+$ .",
        }
    ]
    assert should_warn_on_empty_validators(checkbox_group)

    number_validator = {"type": "number", "range": [1, 65535], "isInteger": True}

    for row in checkbox_group["options"]["rows"]:
        row["input"]["validators"] = [number_validator]

    assert not should_warn_on_empty_validators(checkbox_group)

    oauth_fields = [
        {
            "oauth_field": "username",
            "label": "Username",
            "help": "Enter the username for this account.",
            "field": "username",
        },
        {
            "oauth_field": "password",
            "label": "Password",
            "encrypted": True,
            "help": "Enter the password for this account.",
            "field": "password",
        },
        {
            "oauth_field": "security_token",
            "label": "Security Token",
            "encrypted": True,
            "help": "Enter the security token.",
            "field": "token",
        },
    ]
    oauth_entity: Dict[str, Any] = {
        "type": "oauth",
        "field": "oauth",
        "label": "Not used",
        "options": {
            "auth_type": ["basic", "oauth"],
            "basic": deepcopy(oauth_fields),
            "oauth": deepcopy(oauth_fields),
            "auth_code_endpoint": "/services/oauth2/authorize",
            "access_token_endpoint": "/services/oauth2/token",
            "oauth_timeout": 30,
            "oauth_state_enabled": False,
        },
    }

    assert should_warn_on_empty_validators(oauth_entity)

    for auth_type in ("basic", "oauth"):
        entity = deepcopy(oauth_entity)

        for field in entity["options"][auth_type]:
            field["validators"] = [number_validator]

        assert should_warn_on_empty_validators(entity)

    for auth_type in ("basic", "oauth"):
        for field in oauth_entity["options"][auth_type]:
            field["validators"] = [number_validator]

    assert not should_warn_on_empty_validators(oauth_entity)
