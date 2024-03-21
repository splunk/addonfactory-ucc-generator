from contextlib import nullcontext as does_not_raise

import pytest

import tests.unit.helpers as helpers
from splunk_add_on_ucc_framework import dashboard
from splunk_add_on_ucc_framework.global_config_validator import (
    GlobalConfigValidator,
    GlobalConfigValidatorException,
)
from splunk_add_on_ucc_framework import global_config as global_config_lib


@pytest.mark.parametrize(
    "filename,is_yaml",
    [
        ("valid_config.json", False),
        ("valid_config.yaml", True),
        ("valid_config_only_logging.json", False),
    ],
)
def test_config_validation_when_valid(filename, is_yaml):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig(global_config_path, is_yaml)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with does_not_raise():
        validator.validate()


def test_autocompletefields_support_integer_values():
    # Regression unit test: https://github.com/splunk/addonfactory-ucc-generator/issues/794
    global_config_path = helpers.get_testdata_file_path(
        "invalid_config_configuration_autoCompleteFields_integer_values.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path, False)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with does_not_raise():
        validator.validate()


def test_autocompletefields_children_support_integer_values():
    # Regression unit test: https://github.com/splunk/addonfactory-ucc-generator/issues/794
    global_config_path = helpers.get_testdata_file_path(
        "invalid_config_configuration_autoCompleteFields_children_integer_values.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path, False)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with does_not_raise():
        validator.validate()


def test_config_validation_when_deprecated_placeholder_is_used(caplog):
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_deprecated_placeholder_usage.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path, False)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)
    validator.validate()

    expected_warning_message = (
        "`placeholder` option found for input service 'example_input_one' -> entity field 'name'. "
        "Please take a look at https://github.com/splunk/addonfactory-ucc-generator/issues/831."
    )
    assert expected_warning_message in caplog.text


@pytest.mark.parametrize(
    "filename,is_yaml,exception_message",
    [
        (
            "invalid_config_no_configuration_tabs.json",
            False,
            "[] is too short",
        ),
        (
            "invalid_config_no_name_field_in_configuration_tab_table.json",
            False,
            "Tab 'account' should have entity with field 'name'",
        ),
        # restHandlerName and restHandlerModule are present in the
        # "example_input_one" input
        (
            "invalid_config_both_rest_handler_name_module_are_present.json",
            False,
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
            False,
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
            False,
            (
                "Input 'example_input_one' should have both 'restHandlerModule'"
                " and 'restHandlerClass' fields present, only 1 of them was found."
            ),
        ),
        # Only restHandlerClass is present in the "example_input_one" input
        (
            "invalid_config_only_rest_handler_class_is_present.json",
            False,
            (
                "Input 'example_input_one' should have both 'restHandlerModule'"
                " and 'restHandlerClass' fields present, only 1 of them was found."
            ),
        ),
        (
            "invalid_config_options_missing_for_file_input.json",
            False,
            (
                "Options field for the file type should be present for 'service_account' field."
            ),
        ),
        (
            "invalid_config_supported_file_types_field_is_missing.json",
            False,
            (
                "You should define your supported file types in "
                "the `supportedFileTypes` field for the "
                "'service_account' field."
            ),
        ),
        (
            "invalid_config_file_is_encrypted_but_not_required.json",
            False,
            (
                "Field service_account uses type 'file' which is encrypted and not required, this is not supported"
            ),
        ),
        (
            "invalid_config_configuration_string_validator_maxLength_less_than_minLength.json",
            False,
            (
                "Entity 'name' has incorrect string validator, "
                "'maxLength' should be greater or equal than 'minLength'."
            ),
        ),
        (
            "invalid_config_configuration_number_validator_range_should_have_2_elements.json",
            False,
            (
                "Entity 'interval' has incorrect number validator, "
                "it should have 2 elements under 'range' field."
            ),
        ),
        (
            "invalid_config_configuration_number_validator_range_second_element_smaller_than_first.json",
            False,
            (
                "Entity 'interval' has incorrect number validator, "
                "second element should be greater or equal than first element."
            ),
        ),
        (
            "invalid_config_configuration_regex_validator_non_compilable_pattern.json",
            False,
            (
                "Entity 'name' has incorrect regex validator, "
                "pattern provided in the 'pattern' field is not compilable."
            ),
        ),
        (
            "invalid_config_inputs_string_validator_maxLength_less_than_minLength.json",
            False,
            (
                "Entity 'name' has incorrect string validator, "
                "'maxLength' should be greater or equal than 'minLength'."
            ),
        ),
        (
            "invalid_config_inputs_number_validator_range_should_have_2_elements.json",
            False,
            (
                "Entity 'port' has incorrect number validator, "
                "it should have 2 elements under 'range' field."
            ),
        ),
        (
            "invalid_config_inputs_number_validator_range_second_element_smaller_than_first.json",
            False,
            (
                "Entity 'port' has incorrect number validator, "
                "second element should be greater or equal than first element."
            ),
        ),
        (
            "invalid_config_inputs_regex_validator_non_compilable_pattern.json",
            False,
            (
                "Entity 'name' has incorrect regex validator, "
                "pattern provided in the 'pattern' field is not compilable."
            ),
        ),
        (
            "invalid_config_no_configuration_tabs.yaml",
            True,
            "[] is too short",
        ),
        (
            "invalid_config_no_name_field_in_configuration_tab_table.yaml",
            True,
            "Tab 'account' should have entity with field 'name'",
        ),
        (
            "invalid_config_configuration_autoCompleteFields_duplicates.json",
            False,
            "Duplicates found for autoCompleteFields: 'Duplicate'",
        ),
        (
            "invalid_config_configuration_children_duplicates.json",
            False,
            "Duplicates found for autoCompleteFields children in entity 'Duplicate'",
        ),
        (
            "invalid_config_configuration_entity_duplicates.json",
            False,
            "Duplicates found for entity field or label",
        ),
        (
            "invalid_config_configuration_tabs_duplicates.json",
            False,
            "Duplicates found for tabs names, titles or types",
        ),
        (
            "invalid_config_configuration_tabs_type_duplicates.json",
            False,
            "Duplicates found for tabs names, titles or types",
        ),
        (
            "invalid_config_inputs_services_duplicates.json",
            False,
            "Duplicates found for inputs (services) names or titles",
        ),
        (
            "invalid_config_inputs_entity_duplicates.json",
            False,
            "Duplicates found for entity field or label",
        ),
        (
            "invalid_config_inputs_children_duplicates.json",
            False,
            "Duplicates found for autoCompleteFields children in entity 'Single Select'",
        ),
        (
            "invalid_config_inputs_autoCompleteFields_duplicates.json",
            False,
            "Duplicates found for autoCompleteFields: 'Single Select'",
        ),
        (
            "invalid_config_inputs_multilevel_menu_duplicate_groups.json",
            False,
            "Duplicates found for multi-level menu groups' names or titles.",
        ),
        (
            "invalid_config_inputs_multilevel_menu_invalid_groupservices.json",
            False,
            (
                "example_input_three ServiceName in the multi-level menu does "
                "not match any services name."
            ),
        ),
        (
            "invalid_config_inputs_multilevel_menu_invalid_groupname_or_grouptitle.json",
            False,
            (
                "example_input_three groupName or Example Input Three "
                "groupTitle in the multi-level menu does not match any "
                "services name or title."
            ),
        ),
        (
            "invalid_config_unsupported_name_in_dashboard_panel.json",
            False,
            (
                f"'unsupported_panel_name' is not a supported panel name. "
                f"Supported panel names: {dashboard.SUPPORTED_PANEL_NAMES_READABLE}"
            ),
        ),
        (
            "invalid_config_checkbox_groups_duplicate_fields_in_options_rows.json",
            False,
            (
                "Entity test_checkbox_group has duplicate field (collectFolderCollaboration) in options.rows"
            ),
        ),
        (
            "invalid_config_checkbox_groups_undefined_field_used_in_groups.json",
            False,
            (
                "Entity test_checkbox_group uses field (undefined_field_foo) which is not defined in options.rows"
            ),
        ),
        (
            "invalid_config_checkbox_groups_duplicate_field_in_options_groups.json",
            False,
            (
                "Entity test_checkbox_group has duplicate field (collectTasksAndComments) in options.groups"
            ),
        ),
        (
            "invalid_config_group_has_duplicate_labels.json",
            False,
            (
                "Service input_with_duplicate_group_labels has duplicate labels in groups"
            ),
        ),
        (
            "invalid_config_group_uses_fields_not_defined_in_entity.json",
            False,
            (
                "Service input_with_undefined_group_field uses group field "
                "undefined_entity_field_name which is not defined in entity"
            ),
        ),
    ],
)
def test_config_validation_when_error(filename, is_yaml, exception_message):
    global_config_path = helpers.get_testdata_file_path(filename)
    global_config = global_config_lib.GlobalConfig(global_config_path, is_yaml)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)
    with pytest.raises(GlobalConfigValidatorException) as exc_info:
        validator.validate()

    (msg,) = exc_info.value.args
    assert msg == exception_message


def test_config_validation_modifications_on_change():
    global_config_path = helpers.get_testdata_file_path(
        "valid_config_with_modification_on_value_change.json"
    )
    global_config = global_config_lib.GlobalConfig(global_config_path, False)

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
    global_config = global_config_lib.GlobalConfig(global_config_path, False)

    validator = GlobalConfigValidator(helpers.get_path_to_source_dir(), global_config)

    with pytest.raises(GlobalConfigValidatorException) as exc_info:
        validator.validate()

    (msg,) = exc_info.value.args
    assert msg == raise_message
