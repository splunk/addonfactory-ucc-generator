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
import configparser
import json
import logging
import os
import shutil
import sys
from typing import Optional, List
import subprocess
import colorama as c
import fnmatch
import filecmp

from openapi3 import OpenAPI

from splunk_add_on_ucc_framework import (
    __version__,
    exceptions,
    global_config_update,
    global_config_validator,
    utils,
)
from splunk_add_on_ucc_framework import dashboard
from splunk_add_on_ucc_framework import app_conf as app_conf_lib
from splunk_add_on_ucc_framework import meta_conf as meta_conf_lib
from splunk_add_on_ucc_framework import server_conf as server_conf_lib
from splunk_add_on_ucc_framework import app_manifest as app_manifest_lib
from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework import data_ui_generator
from splunk_add_on_ucc_framework.commands.modular_alert_builder import (
    builder as alert_builder,
)
from splunk_add_on_ucc_framework.commands.rest_builder import (
    global_config_builder_schema,
)
from splunk_add_on_ucc_framework.commands.rest_builder.builder import RestBuilder
from splunk_add_on_ucc_framework.install_python_libraries import (
    SplunktaucclibNotFound,
    install_python_libraries,
)
from splunk_add_on_ucc_framework.commands.openapi_generator import (
    ucc_to_oas,
)


logger = logging.getLogger("ucc_gen")

internal_root_dir = os.path.dirname(os.path.dirname(__file__))


def _modify_and_replace_token_for_oauth_templates(
    ta_name: str, global_config: global_config_lib.GlobalConfig, outputdir: str
) -> None:
    """
    Rename templates with respect to addon name if OAuth is configured.

    Args:
        ta_name: Add-on name.
        global_config: Object representing globalConfig.
        outputdir: output directory.
    """
    redirect_js_src = os.path.join(
        outputdir, ta_name, "appserver", "static", "js", "build", "redirect_page.js"
    )
    redirect_html_src = os.path.join(
        outputdir, ta_name, "appserver", "templates", "redirect.html"
    )

    if global_config.has_oauth():
        html_template_path = os.path.join(outputdir, ta_name, "appserver", "templates")
        with open(os.path.join(html_template_path, "redirect.html")) as f:
            s = f.read()

        with open(os.path.join(html_template_path, "redirect.html"), "w") as f:
            s = s.replace("${ta.name}", ta_name.lower())
            s = s.replace("${ta.version}", global_config.version)
            f.write(s)

        redirect_js_dest = (
            os.path.join(outputdir, ta_name, "appserver", "static", "js", "build", "")
            + ta_name.lower()
            + "_redirect_page."
            + global_config.version
            + ".js"
        )
        redirect_html_dest = os.path.join(
            outputdir,
            ta_name,
            "appserver",
            "templates",
            ta_name.lower() + "_redirect.html",
        )
        with open(
            os.path.join(
                outputdir,
                ta_name,
                "default",
                "data",
                "ui",
                "views",
                f"{ta_name.lower()}_redirect.xml",
            ),
            "w",
        ) as addon_redirect_xml_file:
            addon_redirect_xml_content = data_ui_generator.generate_views_redirect_xml(
                ta_name,
            )
            addon_redirect_xml_file.write(addon_redirect_xml_content)
        os.rename(redirect_js_src, redirect_js_dest)
        os.rename(redirect_html_src, redirect_html_dest)
    else:
        os.remove(redirect_html_src)
        os.remove(redirect_js_src)


def _add_modular_input(
    ta_name: str, global_config: global_config_lib.GlobalConfig, outputdir: str
) -> None:
    for service in global_config.inputs:
        input_name = service.get("name")
        class_name = input_name.upper()
        description = service.get("title")
        entity = service.get("entity")
        field_allow_list = frozenset(["name", "interval", "index", "sourcetype"])
        template = "input.template"
        if "template" in service:
            template = service.get("template") + ".template"

        # filter fields in allow list
        entity = [x for x in entity if x.get("field") not in field_allow_list]

        content = (
            utils.get_j2_env()
            .get_template(template)
            .render(
                input_name=input_name,
                class_name=class_name,
                description=description,
                entity=entity,
            )
        )
        input_file_name = os.path.join(outputdir, ta_name, "bin", input_name + ".py")
        with open(input_file_name, "w") as input_file:
            input_file.write(content)

        input_default = os.path.join(outputdir, ta_name, "default", "inputs.conf")
        config = configparser.ConfigParser()
        if os.path.exists(input_default):
            config.read(input_default)

        if config.has_section(input_name):
            config[input_name]["python.version"] = "python3"
        else:
            config[input_name] = {"python.version": "python3"}

        with open(input_default, "w") as configfile:
            config.write(configfile)


def _get_ignore_list(
    addon_name: str, ucc_ignore_path: str, output_directory: str
) -> List[str]:
    """
    Return path of files/folders to be removed.

    Args:
        addon_name: Add-on name.
        ucc_ignore_path: Path to '.uccignore'.
        output_directory: Output directory path.

    Returns:
        list: List of paths to be removed from output directory.
    """
    if not os.path.exists(ucc_ignore_path):
        return []
    else:
        with open(ucc_ignore_path) as ignore_file:
            ignore_list = ignore_file.readlines()
        ignore_list = [
            (
                os.path.join(output_directory, addon_name, utils.get_os_path(path))
            ).strip()
            for path in ignore_list
        ]
        return ignore_list


def _remove_listed_files(ignore_list: List[str]) -> None:
    """
    Return path of files/folders to removed in output folder.

    Args:
        ignore_list (list): List of files/folder to removed in output directory.

    """
    for path in ignore_list:
        if os.path.exists(path):
            if os.path.isfile(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path, ignore_errors=True)
        else:
            logger.warning(
                "While ignoring the files mentioned in .uccignore {} was not found".format(
                    path
                )
            )


def generate_data_ui(
    output_directory: str,
    addon_name: str,
    include_inputs: bool,
    include_dashboard: bool,
) -> None:
    # Create directories in the output folder for add-on's UI nav and views.
    os.makedirs(
        os.path.join(output_directory, addon_name, "default", "data", "ui", "nav"),
        exist_ok=True,
    )
    os.makedirs(
        os.path.join(output_directory, addon_name, "default", "data", "ui", "views"),
        exist_ok=True,
    )
    default_ui_path = os.path.join(
        output_directory, addon_name, "default", "data", "ui"
    )
    default_xml_path = os.path.join(default_ui_path, "nav", "default.xml")
    if os.path.exists(default_xml_path):
        logger.info(
            "Skipping generating data/ui/nav/default.xml because file already exists."
        )
    else:
        with open(default_xml_path, "w") as default_xml_file:
            default_xml_content = data_ui_generator.generate_nav_default_xml(
                include_inputs=include_inputs,
                include_dashboard=include_dashboard,
            )
            default_xml_file.write(default_xml_content)
    with open(
        os.path.join(default_ui_path, "views", "configuration.xml"), "w"
    ) as configuration_xml_file:
        configuration_xml_content = data_ui_generator.generate_views_configuration_xml(
            addon_name,
        )
        configuration_xml_file.write(configuration_xml_content)
    if include_inputs:
        with open(
            os.path.join(default_ui_path, "views", "inputs.xml"), "w"
        ) as input_xml_file:
            inputs_xml_content = data_ui_generator.generate_views_inputs_xml(
                addon_name,
            )
            input_xml_file.write(inputs_xml_content)


def _get_addon_version(addon_version: Optional[str]) -> str:
    if not addon_version:
        try:
            return utils.get_version_from_git()
        except exceptions.IsNotAGitRepo:
            logger.error(
                "Could not determine a version using Git (maybe not a Git "
                "repository?). Use `--ta-version` to specify the version you "
                "want."
            )
            exit(1)
        except exceptions.CouldNotVersionFromGitException:
            logger.error(
                "Could not find the proper version from git tags. "
                "Check out "
                "https://github.com/splunk/addonfactory-ucc-generator/issues/404"
            )
            exit(1)
    return addon_version.strip()


def _get_app_manifest(source: str) -> app_manifest_lib.AppManifest:
    app_manifest_path = os.path.abspath(
        os.path.join(source, app_manifest_lib.APP_MANIFEST_FILE_NAME),
    )
    with open(app_manifest_path) as manifest_file:
        app_manifest_content = manifest_file.read()
    try:
        app_manifest = app_manifest_lib.AppManifest(app_manifest_content)
        app_manifest.validate()
        return app_manifest
    except app_manifest_lib.AppManifestFormatException as e:
        logger.error(
            f"Manifest file @ {app_manifest_path} has invalid format.\n"
            f"Please refer to {app_manifest_lib.APP_MANIFEST_WEBSITE}.\n"
            f"Error message: {e}.\n"
        )
        sys.exit(1)


def _get_build_output_path(output_directory: Optional[str] = None) -> str:
    if output_directory is None:
        return os.path.join(os.getcwd(), "output")
    else:
        if not os.path.isabs(output_directory):
            return os.path.join(os.getcwd(), output_directory)
        return output_directory


def _get_python_version_from_executable(python_binary_name: str) -> str:
    try:
        python_binary_version = subprocess.run(
            [python_binary_name, "--version"], stdout=subprocess.PIPE
        ).stdout.decode("utf-8")

        return python_binary_version.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        raise exceptions.CouldNotIdentifyPythonVersionException(
            f"Failed to identify python version for binary {python_binary_name}"
        )


def summary_report(
    source: str,
    ta_name: str,
    output_directory: str,
    verbose_file_summary_report: bool,
) -> None:
    # initialising colorama to handle ASCII color in windows cmd
    c.init()
    color_palette = {
        "copied": c.Fore.GREEN,
        "conflict": c.Fore.RED,
        "modified": c.Fore.YELLOW,
    }

    # conflicting files from ucc-gen package folder
    conflict_path = os.path.join(internal_root_dir, "package")
    # conflict files generated through-out the process
    conflict_static_list = frozenset(
        [
            "import_declare_test.py",
            f"{ta_name}_rh_*.py",
            "app.conf",
            "inputs.conf*",
            "restmap.conf",
            "server.conf",
            f"{ta_name}_*.conf*",
            "web.conf",
            "default.xml",
            "configuration.xml",
            "dashboard.xml",
            "inputs.xml",
            "openapi.json",
        ]
    )

    def line_print(print_path: str, mod_type: str) -> None:
        if verbose_file_summary_report:
            logger.info(
                color_palette.get(mod_type, "")
                + str(print_path).ljust(80)
                + mod_type
                + c.Style.RESET_ALL,
            )
        summary[mod_type] += 1

    def check_for_conflict(file: str, relative_file_path: str) -> bool:
        conflict_path_file = os.path.join(conflict_path, relative_file_path)
        if os.path.isfile(conflict_path_file):
            return True
        for pattern in conflict_static_list:
            if fnmatch.fnmatch(file, pattern):
                return True
        return False

    def file_check(
        file: str, output_directory: str, relative_file_path: str, source: str
    ) -> None:
        source_path = os.path.join(source, relative_file_path)

        if os.path.isfile(source_path):
            # file is present in package
            output_path = os.path.join(output_directory, relative_file_path)

            is_conflict = check_for_conflict(file, relative_file_path)

            if not is_conflict:
                files_are_same = filecmp.cmp(source_path, output_path)
                if not files_are_same:
                    # output file was modified
                    line_print(relative_file_path, "modified")
                else:
                    # files are the same
                    line_print(relative_file_path, "copied")
            else:
                line_print(relative_file_path, "conflict")
        else:
            # file does not exist in package
            line_print(relative_file_path, "created")

    summary = {"created": 0, "copied": 0, "modified": 0, "conflict": 0}

    path_len = len(output_directory) + 1

    if verbose_file_summary_report:
        logger.info("Detailed information about created/copied/modified/conflict files")
        logger.info(
            "Read more about it here: "
            "https://splunk.github.io/addonfactory-ucc-generator/quickstart/#verbose-mode"
        )

    for path, dir, files in os.walk(output_directory):
        relative_path = path[path_len:]
        # skipping lib directory
        if relative_path[:3] == "lib":
            if relative_path == "lib":
                line_print("lib", "created")
            continue

        files = sorted(files, key=str.casefold)

        for file in files:
            relative_file_path = os.path.join(relative_path, file)
            file_check(file, output_directory, relative_file_path, source)

    summary_combined = ", ".join(
        [
            f"{file_type}: {amount_of_files}"
            for file_type, amount_of_files in summary.items()
        ]
    )
    logger.info(f"File creation summary: {summary_combined}")


def generate(
    source: str,
    config_path: Optional[str] = None,
    addon_version: Optional[str] = None,
    output_directory: Optional[str] = None,
    python_binary_name: str = "python3",
    verbose_file_summary_report: bool = False,
) -> None:
    logger.info(f"ucc-gen version {__version__} is used")
    logger.info(f"Python binary name to use: {python_binary_name}")

    try:
        python_binary_version = _get_python_version_from_executable(python_binary_name)
        logger.info(f"Python Version: {python_binary_version}")
    except exceptions.CouldNotIdentifyPythonVersionException as e:
        logger.error(
            f"Failed to identify Python version for library installation. Error: {e}"
        )
        sys.exit(1)

    output_directory = _get_build_output_path(output_directory)
    logger.info(f"Output folder is {output_directory}")
    addon_version = _get_addon_version(addon_version)
    logger.info(f"Add-on will be built with version '{addon_version}'")
    if not os.path.exists(source):
        raise NotADirectoryError(f"{os.path.abspath(source)} not found.")
    shutil.rmtree(os.path.join(output_directory), ignore_errors=True)
    os.makedirs(os.path.join(output_directory))
    logger.info(f"Cleaned out directory {output_directory}")
    app_manifest = _get_app_manifest(source)
    ta_name = app_manifest.get_addon_name()
    if not config_path:
        is_global_config_yaml = False
        config_path = os.path.abspath(
            os.path.join(source, os.pardir, "globalConfig.json")
        )
        if not os.path.isfile(config_path):
            config_path = os.path.abspath(
                os.path.join(source, os.pardir, "globalConfig.yaml")
            )
            is_global_config_yaml = True
    else:
        is_global_config_yaml = True if config_path.endswith(".yaml") else False

    if os.path.isfile(config_path):
        logger.info(f"Using globalConfig file located @ {config_path}")
        global_config = global_config_lib.GlobalConfig(
            config_path, is_global_config_yaml
        )
        try:
            validator = global_config_validator.GlobalConfigValidator(
                internal_root_dir, global_config
            )
            validator.validate()
            logger.info("globalConfig file is valid")
        except global_config_validator.GlobalConfigValidatorException as e:
            logger.error(f"globalConfig file is not valid. Error: {e}")
            sys.exit(1)
        global_config.update_addon_version(addon_version)
        global_config.add_ucc_version(__version__)
        global_config.dump(global_config.original_path)
        logger.info(
            f"Updated and saved add-on version in the globalConfig file to {addon_version}"
        )
        global_config_update.handle_global_config_update(global_config)
        scheme = global_config_builder_schema.GlobalConfigBuilderSchema(global_config)
        utils.recursive_overwrite(
            os.path.join(internal_root_dir, "package"),
            os.path.join(output_directory, ta_name),
        )
        generate_data_ui(
            output_directory,
            ta_name,
            global_config.has_inputs(),
            global_config.has_dashboard(),
        )
        logger.info("Copied UCC template directory")
        global_config_file = (
            "globalConfig.yaml" if is_global_config_yaml else "globalConfig.json"
        )
        output_global_config_path = os.path.join(
            output_directory,
            ta_name,
            "appserver",
            "static",
            "js",
            "build",
            global_config_file,
        )
        shutil.copyfile(
            config_path,
            output_global_config_path,
        )
        logger.info("Copied globalConfig to output")
        ucc_lib_target = os.path.join(output_directory, ta_name, "lib")
        try:
            install_python_libraries(
                source,
                ucc_lib_target,
                python_binary_name,
                includes_ui=True,
                os_libraries=global_config.os_libraries,
            )
        except SplunktaucclibNotFound as e:
            logger.error(str(e))
            sys.exit(1)
        logger.info(
            f"Installed add-on requirements into {ucc_lib_target} from {source}"
        )
        builder_obj = RestBuilder(scheme, os.path.join(output_directory, ta_name))
        builder_obj.build()
        _modify_and_replace_token_for_oauth_templates(
            ta_name,
            global_config,
            output_directory,
        )
        if global_config.has_inputs():
            logger.info("Generating inputs code")
            _add_modular_input(ta_name, global_config, output_directory)
        if global_config.has_alerts():
            logger.info("Generating alerts code")
            alert_builder.generate_alerts(
                global_config, ta_name, internal_root_dir, output_directory
            )

        conf_file_names = []
        conf_file_names.extend(list(scheme.settings_conf_file_names))
        conf_file_names.extend(list(scheme.configs_conf_file_names))
        conf_file_names.extend(list(scheme.oauth_conf_file_names))

        source_server_conf_path = os.path.join(source, "default", "server.conf")
        # For now, only create server.conf only if no server.conf is present in
        # the source package.
        if not os.path.isfile(source_server_conf_path):
            server_conf = server_conf_lib.ServerConf()
            server_conf.create_default(conf_file_names)
            output_server_conf_path = os.path.join(
                output_directory,
                ta_name,
                "default",
                server_conf_lib.SERVER_CONF_FILE_NAME,
            )
            server_conf.write(output_server_conf_path)
            logger.info(
                f"Created default {server_conf_lib.SERVER_CONF_FILE_NAME} file in the output folder"
            )
        if global_config.has_dashboard():
            logger.info("Including dashboard")
            dashboard_xml_path = os.path.join(
                output_directory,
                ta_name,
                "default",
                "data",
                "ui",
                "views",
                "dashboard.xml",
            )
            dashboard.generate_dashboard(global_config, ta_name, dashboard_xml_path)

    else:
        global_config = None
        conf_file_names = []
        logger.warning(
            "Skipped generating UI components as globalConfig file does not exist"
        )
        ucc_lib_target = os.path.join(output_directory, ta_name, "lib")
        install_python_libraries(source, ucc_lib_target, python_binary_name)
        logger.info(
            f"Installed add-on requirements into {ucc_lib_target} from {source}"
        )

    ignore_list = _get_ignore_list(
        ta_name,
        os.path.abspath(os.path.join(source, os.pardir, ".uccignore")),
        output_directory,
    )
    _remove_listed_files(ignore_list)
    if ignore_list:
        logger.info(f"Removed {ignore_list} files")
    utils.recursive_overwrite(source, os.path.join(output_directory, ta_name))
    logger.info("Copied package directory")

    default_meta_conf_path = os.path.join(
        output_directory, ta_name, "metadata", meta_conf_lib.DEFAULT_META_FILE_NAME
    )
    if not os.path.exists(default_meta_conf_path):
        os.makedirs(os.path.join(output_directory, ta_name, "metadata"), exist_ok=True)
        meta_conf = meta_conf_lib.MetaConf()
        meta_conf.create_default()
        meta_conf.write(default_meta_conf_path)
        logger.info(
            f"Created default {meta_conf_lib.DEFAULT_META_FILE_NAME} file in the output folder"
        )

    with open(os.path.join(output_directory, ta_name, "VERSION"), "w") as version_file:
        version_file.write(addon_version)
        version_file.write("\n")
        version_file.write(addon_version)
        logger.info("Updated VERSION file")

    app_manifest.update_addon_version(addon_version)
    output_manifest_path = os.path.abspath(
        os.path.join(output_directory, ta_name, app_manifest_lib.APP_MANIFEST_FILE_NAME)
    )
    with open(output_manifest_path, "w") as manifest_file:
        manifest_file.write(str(app_manifest))
        logger.info(
            f"Updated {app_manifest_lib.APP_MANIFEST_FILE_NAME} file in the output folder"
        )

    app_conf = app_conf_lib.AppConf()
    output_app_conf_path = os.path.join(
        output_directory, ta_name, "default", app_conf_lib.APP_CONF_FILE_NAME
    )
    app_conf.read(output_app_conf_path)
    should_be_visible = True if global_config else False
    if global_config and global_config.meta.get("checkForUpdates") is False:
        check_for_updates = False
    else:
        check_for_updates = True
    app_conf.update(
        addon_version,
        app_manifest,
        conf_file_names,
        should_be_visible,
        check_for_updates,
    )
    app_conf.write(output_app_conf_path)
    logger.info(f"Updated {app_conf_lib.APP_CONF_FILE_NAME} file in the output folder")

    license_dir = os.path.abspath(os.path.join(source, os.pardir, "LICENSES"))
    if os.path.exists(license_dir):
        logger.info("Copy LICENSES directory")
        utils.recursive_overwrite(
            license_dir, os.path.join(output_directory, ta_name, "LICENSES")
        )

    if os.path.exists(
        os.path.abspath(os.path.join(source, os.pardir, "additional_packaging.py"))
    ):
        sys.path.insert(0, os.path.abspath(os.path.join(source, os.pardir)))
        try:
            from additional_packaging import additional_packaging

            additional_packaging(ta_name)
        except ImportError as e:
            logger.exception(
                "additional_packaging.py is present but not importable.", e
            )
            raise e

    if global_config:
        logger.info("Generating OpenAPI file")
        open_api_object = ucc_to_oas.transform(global_config, app_manifest)
        open_api = OpenAPI(open_api_object.json)

        output_openapi_folder = os.path.abspath(
            os.path.join(output_directory, ta_name, "appserver", "static")
        )
        output_openapi_path = os.path.join(output_openapi_folder, "openapi.json")
        if not os.path.isdir(output_openapi_folder):
            os.makedirs(os.path.join(output_openapi_folder))
            logger.info(f"Creating {output_openapi_folder} folder")
        with open(output_openapi_path, "w") as openapi_file:
            json.dump(open_api.raw_element, openapi_file, indent=4)

    summary_report(
        source,
        ta_name,
        os.path.join(output_directory, ta_name),
        verbose_file_summary_report,
    )


# TODO remove below
if __name__ == "__main__":
    path_package = "/Users/mmacalik/Documents/Ucc-Gen_webinar/repos/addonfactory-ucc-generator/tests/testdata/test_addons/package_global_config_everything/package"

    generate(source=path_package)
