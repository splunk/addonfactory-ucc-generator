import unittest
from unittest.mock import patch

from splunk_add_on_ucc_framework.generators import doc_generator


def test_generate_docs():
    expected_content = """---
title: UCC framework generated files
---

The following table describes the files generated by UCC framework.

| File Name  | File Location | File Description |
| ------------ | ------------ | ----------------- |
| app.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `app.conf` with the details mentioned in globalConfig[meta] |
| inputs.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `inputs.conf` and `inputs.conf.spec` file for the services mentioned in globalConfig |
| server.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `server.conf` for the custom conf files created as per configurations in globalConfig |
| restmap.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `restmap.conf` for the custom REST handlers that are generated based on configs from globalConfig |
| web.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `web.conf` to expose the endpoints generated in `restmap.conf` which is generated based on configurations from globalConfig. |
| alert_actions.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `alert_actions.conf` and `alert_actions.conf.spec` file for the custom alert actions defined in globalConfig |
| eventtypes.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `eventtypes.conf` file if the sourcetype is mentioned in Adaptive Response of custom alert action in globalConfig |
| tags.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `tags.conf` file based on the `eventtypes.conf` created for custom alert actions. |
| commands.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `commands.conf` for custom commands provided in the globalConfig. |
| searchbnf.conf | output/&lt;YOUR_ADDON_NAME&gt;/default | Generates `searchbnf.conf` for custom search commands provided in the globalConfig. |
| _account.conf | output/&lt;YOUR_ADDON_NAME&gt;/README | Generates `<YOUR_ADDON_NAME>_account.conf.spec` file for the configuration mentioned in globalConfig |
| _settings.conf | output/&lt;YOUR_ADDON_NAME&gt;/README | Generates `<YOUR_ADDON_NAME>_settings.conf.spec` file for the Proxy, Logging or Custom Tab mentioned in globalConfig |
| configuration.xml | output/&lt;YOUR_ADDON_NAME&gt;/default/data/ui/views | Generates configuration.xml file in `default/data/ui/views/` folder if configuration is defined in globalConfig. |
| dashboard.xml | output/&lt;YOUR_ADDON_NAME&gt;/default/data/ui/views | Generates dashboard.xml file based on dashboard configuration present in globalConfig, in `default/data/ui/views` folder. |
| default.xml | output/&lt;YOUR_ADDON_NAME&gt;/default/data/ui/nav | Generates default.xml file based on configs present in globalConfig, in `default/data/ui/nav` folder. |
| inputs.xml | output/&lt;YOUR_ADDON_NAME&gt;/default/data/ui/views | Generates inputs.xml based on inputs configuration present in globalConfig, in `default/data/ui/views/inputs.xml` folder |
| _redirect.xml | output/&lt;YOUR_ADDON_NAME&gt;/default/data/ui/views | Generates ta_name_redirect.xml file, if oauth is mentioned in globalConfig, in `default/data/ui/views/` folder. |
| _.html | output/&lt;YOUR_ADDON_NAME&gt;/default/data/ui/alerts | Generates `alert_name.html` file based on alerts configuration present in globalConfig, in `default/data/ui/alerts` folder. |
| _.py | output/&lt;YOUR_ADDON_NAME&gt;/bin | Generates Python files for custom search commands provided in the globalConfig. |
| globalConfig.json | &lt;source_dir&gt; | Generates globalConfig.json file in the source code if globalConfig is not present in source directory at build time. |

"""
    content = doc_generator.generate_docs()

    assert expected_content == content


@patch("splunk_add_on_ucc_framework.generators.doc_generator.generate_docs")
def test_main(mock_generate_docs):
    mock_generate_docs.return_value = "content\n"

    with patch("builtins.open", unittest.mock.mock_open()) as _mock_open:
        doc_generator.main()

        mock_generate_docs.assert_called_once()
        handle = _mock_open()
        handle.write.assert_called_once_with("content\n")
