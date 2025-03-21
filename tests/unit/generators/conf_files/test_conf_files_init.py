def test___init__conf():
    expected_classes = [
        "ConfGenerator",
        "ServerConf",
        "RestMapConf",
        "WebConf",
        "AlertActionsConf",
        "EventtypesConf",
        "TagsConf",
        "AppConf",
        "InputsConf",
        "AccountConf",
        "SettingsConf",
        "SearchbnfConf",
        "CommandsConf",
    ]
    expected_modules = [
        "conf_generator",
        "create_alert_actions_conf",
        "create_app_conf",
        "create_eventtypes_conf",
        "create_inputs_conf",
        "create_restmap_conf",
        "create_server_conf",
        "create_tags_conf",
        "create_web_conf",
        "create_account_conf",
        "create_settings_conf",
        "create_searchbnf_conf",
        "create_commands_conf",
    ]
    import splunk_add_on_ucc_framework.generators.conf_files as conf

    assert conf.__all__ == expected_classes

    for attrib in dir(conf):
        if attrib.startswith("__") and attrib.endswith("__"):
            # ignore the builtin modules
            continue
        assert attrib in expected_classes or attrib in expected_modules
