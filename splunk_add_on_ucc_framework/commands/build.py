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
import configparser
import json
import logging
import os
import shutil
import sys
from typing import Optional

from jinja2 import Environment, FileSystemLoader
from openapi3 import OpenAPI

from splunk_add_on_ucc_framework import (
    __version__,
    exceptions,
    global_config_update,
    global_config_validator,
    utils,
)
from splunk_add_on_ucc_framework import app_conf as app_conf_lib
from splunk_add_on_ucc_framework import meta_conf as meta_conf_lib
from splunk_add_on_ucc_framework import server_conf as server_conf_lib
from splunk_add_on_ucc_framework import app_manifest as app_manifest_lib
from splunk_add_on_ucc_framework import global_config as global_config_lib
from splunk_add_on_ucc_framework import normalize
from splunk_add_on_ucc_framework.modular_alert_builder.build_core import generate_alerts
from splunk_add_on_ucc_framework.commands.rest_builder import (
    global_config_builder_schema,
    global_config_post_processor,
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

PARENT_DIR = ".."
internal_root_dir = os.path.dirname(os.path.dirname(__file__))
# nosemgrep: splunk.autoescape-disabled
j2_env = Environment(
    loader=FileSystemLoader(os.path.join(internal_root_dir, "templates"))
)


def _recursive_overwrite(src, dest, ignore_list=None):
    """
    Method to copy from src to dest recursively.

    Args:
        src (str): Source of copy
        dest (str): Destination to copy
        ignore_list (list): List of files/folder to ignore while copying
    """

    if os.path.isdir(src):
        if not os.path.isdir(dest):
            os.makedirs(dest)
        files = os.listdir(src)
        for f in files:
            if not ignore_list or not os.path.join(dest, f) in ignore_list:
                _recursive_overwrite(
                    os.path.join(src, f), os.path.join(dest, f), ignore_list
                )
            else:
                logger.info(f"Excluding : {os.path.join(dest, f)}")
    else:
        if os.path.exists(dest):
            os.remove(dest)
        shutil.copy(src, dest)


def _replace_token(ta_name, outputdir):
    """
    Replace token with addon name in inputs.xml, configuration.xml, redirect.xml.
    Replace token with addon version in redirect.xml.

    Args:
        ta_name (str): Name of TA.
        outputdir (str): output directory.
    """

    # replace token in template
    logger.info("Replace tokens in views")
    views = ["inputs.xml", "configuration.xml", "redirect.xml"]
    for view in views:
        template_dir = os.path.join(
            outputdir, ta_name, "default", "data", "ui", "views"
        )
        with open(os.path.join(template_dir, view)) as f:
            s = f.read()

        # Safely write the changed content, if found in the file
        with open(os.path.join(template_dir, view), "w") as f:
            s = s.replace("${package.name}", ta_name)
            if view == "redirect.xml":
                s = s.replace("${ta.name}", ta_name.lower())
            f.write(s)


def _generate_rest(
    ta_name,
    scheme: global_config_builder_schema.GlobalConfigBuilderSchema,
    outputdir,
):
    """
    Build REST for Add-on.

    Args:
        ta_name (str): Name of TA.
        scheme (GlobalConfigBuilderSchema): REST schema.
        outputdir (str): output directory.
    """
    builder_obj = RestBuilder(scheme, os.path.join(outputdir, ta_name))
    builder_obj.build()
    post_process = global_config_post_processor.GlobalConfigPostProcessor()
    post_process(builder_obj, scheme)
    return builder_obj


def _is_oauth_configured(ta_tabs):
    """
    Check if oauth is configured in globalConfig file.

    Args:
        ta_tabs (list): List of tabs mentioned in globalConfig file.

    Returns:
        bool: True if oauth is configured, False otherwise.
    """

    for tab in ta_tabs:
        if tab["name"] == "account":
            for elements in tab["entity"]:
                if elements["type"] == "oauth":
                    return True
            break
    return False


def _replace_oauth_html_template_token(ta_name, ta_version, outputdir):
    """
    Replace tokens with addon name and version in redirect.html.

    Args:
        ta_name (str): Name of TA.
        ta_version (str): Version of TA.
        outputdir (str): output directory.
    """

    html_template_path = os.path.join(outputdir, ta_name, "appserver", "templates")
    with open(os.path.join(html_template_path, "redirect.html")) as f:
        s = f.read()

    # Safely write the changed content, if found in the file
    with open(os.path.join(html_template_path, "redirect.html"), "w") as f:
        # replace addon name in html template
        s = s.replace("${ta.name}", ta_name.lower())
        # replace addon version in html template
        s = s.replace("${ta.version}", ta_version)
        f.write(s)


def _modify_and_replace_token_for_oauth_templates(
    ta_name: str, global_config: global_config_lib.GlobalConfig, outputdir: str
):
    """
    Rename templates with respect to addon name if OAuth is configured.

    Args:
        ta_name: Add-on name.
        global_config: Object representing globalConfig.
        outputdir: output directory.
    """
    redirect_xml_src = os.path.join(
        outputdir, ta_name, "default", "data", "ui", "views", "redirect.xml"
    )
    redirect_js_src = os.path.join(
        outputdir, ta_name, "appserver", "static", "js", "build", "redirect_page.js"
    )
    redirect_html_src = os.path.join(
        outputdir, ta_name, "appserver", "templates", "redirect.html"
    )

    if _is_oauth_configured(global_config.tabs):
        _replace_oauth_html_template_token(ta_name, global_config.version, outputdir)

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
        redirect_xml_dest = os.path.join(
            outputdir,
            ta_name,
            "default",
            "data",
            "ui",
            "views",
            ta_name.lower() + "_redirect.xml",
        )
        os.rename(redirect_js_src, redirect_js_dest)
        os.rename(redirect_html_src, redirect_html_dest)
        os.rename(redirect_xml_src, redirect_xml_dest)

    # if oauth is not configured remove the extra template
    else:
        os.remove(redirect_xml_src)
        os.remove(redirect_html_src)
        os.remove(redirect_js_src)


def _add_modular_input(
    ta_name: str, global_config: global_config_lib.GlobalConfig, outputdir: str
):
    """
    Generate Modular input for addon.

    Args:
        ta_name: Add-on name.
        global_config: Object representing globalConfig.
        outputdir: output directory.
    """
    for service in global_config.inputs:
        input_name = service.get("name")
        class_name = input_name.upper()
        description = service.get("title")
        entity = service.get("entity")
        field_allow_list = ["name", "index", "sourcetype"]
        template = "input.template"
        # if the service has a template specified, use it.  Otherwise keep the default
        if "template" in service:
            template = service.get("template") + ".template"

        # filter fields in allow list
        entity = [x for x in entity if x.get("field") not in field_allow_list]
        import_declare = "import import_declare_test"

        content = j2_env.get_template(template).render(
            import_declare=import_declare,
            input_name=input_name,
            class_name=class_name,
            description=description,
            entity=entity,
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


def _make_modular_alerts(
    ta_name: str, global_config: global_config_lib.GlobalConfig, outputdir: str
):
    """
    Generate the alert schema with required structure.

    Args:
        ta_name: Add-on name.
        global_config: Object representing globalConfig.
        outputdir: Output directory.
    """
    if global_config.has_alerts():
        envs = normalize.normalize(
            {
                "alerts": global_config.alerts,
            },
            ta_name,
            global_config.namespace,
        )
        logger.info("Generating alerts code")
        generate_alerts(internal_root_dir, outputdir, envs)


def _get_ignore_list(ta_name, path):
    """
    Return path of files/folders to be removed.

    Args:
        ta_name (str): Name of TA.
        path (str): Path of '.uccignore'.

    Returns:
        list: List of paths to be removed from output directory.
    """
    if not os.path.exists(path):
        return []
    else:
        with open(path) as ignore_file:
            ignore_list = ignore_file.readlines()
        ignore_list = [
            (os.path.join("output", ta_name, _get_os_path(path))).strip()
            for path in ignore_list
        ]
        return ignore_list


def _remove_listed_files(ignore_list):
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
            logger.info(
                "While ignoring the files mentioned in .uccignore {} was not found".format(
                    path
                )
            )


def _handle_no_inputs(ta_name, outputdir):
    """
    Handle for configuration without input page.

    Args:
        ta_name (str): Name of TA.
        outputdir (str): output directory.
    """
    default_xml_file = os.path.join(
        outputdir, ta_name, "default", "data", "ui", "nav", "default.xml"
    )
    default_no_input_xml_file = os.path.join(
        outputdir, ta_name, "default", "data", "ui", "nav", "default_no_input.xml"
    )
    os.remove(default_xml_file)
    os.rename(
        default_no_input_xml_file,
        default_xml_file,
    )
    file_remove_list = [
        os.path.join(
            outputdir, ta_name, "default", "data", "ui", "views", "inputs.xml"
        ),
        os.path.join(outputdir, ta_name, "appserver", "static", "css", "inputs.css"),
        os.path.join(
            outputdir, ta_name, "appserver", "static", "css", "createInput.css"
        ),
    ]
    for fl in file_remove_list:
        try:
            os.remove(fl)
        except OSError:
            pass


def _get_os_path(path):
    """
    Returns a path which will be os compatible.

    Args:
        path (str): Path in string

    Return:
        string: Path which will be os compatible.
    """

    if "\\\\" in path:
        path = path.replace("\\\\", os.sep)
    else:
        path = path.replace("\\", os.sep)
    path = path.replace("/", os.sep)
    return path.strip(os.sep)


def _get_addon_version(addon_version: Optional[str]) -> str:
    if not addon_version:
        try:
            return utils.get_version_from_git()
        except exceptions.CouldNotVersionFromGitException:
            logger.error(
                "Could not find the proper version from git tags. "
                "Check out "
                "https://github.com/splunk/addonfactory-ucc-generator/issues/404"
            )
            exit(1)
    return addon_version.strip()


def generate(
    source,
    config_path,
    addon_version,
    outputdir=None,
    python_binary_name="python3",
):
    logger.info(f"ucc-gen version {__version__} is used")
    logger.info(f"Python binary name to use: {python_binary_name}")
    if outputdir is None:
        outputdir = os.path.join(os.getcwd(), "output")
    addon_version = _get_addon_version(addon_version)
    logger.info(f"Add-on will be built with version '{addon_version}'")
    if not os.path.exists(source):
        raise NotADirectoryError(f"{os.path.abspath(source)} not found.")
    shutil.rmtree(os.path.join(outputdir), ignore_errors=True)
    os.makedirs(os.path.join(outputdir))
    logger.info(f"Cleaned out directory {outputdir}")
    app_manifest_path = os.path.abspath(
        os.path.join(source, app_manifest_lib.APP_MANIFEST_FILE_NAME),
    )
    with open(app_manifest_path) as manifest_file:
        app_manifest_content = manifest_file.read()
    app_manifest = app_manifest_lib.AppManifest()
    try:
        app_manifest.read(app_manifest_content)
    except app_manifest_lib.AppManifestFormatException:
        logger.error(
            f"Manifest file @ {app_manifest_path} has invalid format.\n"
            f"Please refer to {app_manifest_lib.APP_MANIFEST_WEBSITE}.\n"
            f'Lines with comments are supported if they start with "#".\n'
        )
        sys.exit(1)
    ta_name = app_manifest.get_addon_name()
    if not config_path:
        is_global_config_yaml = False
        config_path = os.path.abspath(os.path.join(source, "..", "globalConfig.json"))
        if not os.path.isfile(config_path):
            config_path = os.path.abspath(
                os.path.join(source, "..", "globalConfig.yaml")
            )
            is_global_config_yaml = True
    else:
        is_global_config_yaml = True if config_path.endswith(".yaml") else False

    if os.path.isfile(config_path):
        logger.info(f"Using globalConfig file located @ {config_path}")
        global_config = global_config_lib.GlobalConfig()
        global_config.parse(config_path, is_global_config_yaml)
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
        global_config.dump(global_config.original_path)
        logger.info(
            f"Updated and saved add-on version in the globalConfig file to {addon_version}"
        )
        global_config_update.handle_global_config_update(global_config)
        scheme = global_config_builder_schema.GlobalConfigBuilderSchema(
            global_config, j2_env
        )
        _recursive_overwrite(
            os.path.join(internal_root_dir, "package"), os.path.join(outputdir, ta_name)
        )
        logger.info("Copied UCC template directory")
        global_config_file = (
            "globalConfig.yaml" if is_global_config_yaml else "globalConfig.json"
        )
        output_global_config_path = os.path.join(
            outputdir,
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
        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")
        try:
            install_python_libraries(
                source, ucc_lib_target, python_binary_name, includes_ui=True
            )
        except SplunktaucclibNotFound as e:
            logger.error(str(e))
            sys.exit(1)
        logger.info(
            f"Installed add-on requirements into {ucc_lib_target} from {source}"
        )
        _replace_token(ta_name, outputdir)
        _generate_rest(ta_name, scheme, outputdir)
        _modify_and_replace_token_for_oauth_templates(
            ta_name,
            global_config,
            outputdir,
        )
        if global_config.has_inputs():
            default_no_input_xml_file = os.path.join(
                outputdir,
                ta_name,
                "default",
                "data",
                "ui",
                "nav",
                "default_no_input.xml",
            )
            os.remove(default_no_input_xml_file)
            _add_modular_input(ta_name, global_config, outputdir)
        else:
            _handle_no_inputs(ta_name, outputdir)
        _make_modular_alerts(ta_name, global_config, outputdir)

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
                outputdir, ta_name, "default", server_conf_lib.SERVER_CONF_FILE_NAME
            )
            server_conf.write(output_server_conf_path)
            logger.info(
                f"Created default {server_conf_lib.SERVER_CONF_FILE_NAME} file in the output folder"
            )
    else:
        global_config = None
        conf_file_names = []
        logger.warning(
            "Skipped generating UI components as globalConfig file does not exist"
        )
        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")
        install_python_libraries(source, ucc_lib_target, python_binary_name)
        logger.info(
            f"Installed add-on requirements into {ucc_lib_target} from {source}"
        )

    ignore_list = _get_ignore_list(
        ta_name, os.path.abspath(os.path.join(source, PARENT_DIR, ".uccignore"))
    )
    _remove_listed_files(ignore_list)
    logger.info(f"Removed {ignore_list} files")
    _recursive_overwrite(source, os.path.join(outputdir, ta_name))
    logger.info("Copied package directory")

    default_meta_conf_path = os.path.join(
        outputdir, ta_name, "metadata", meta_conf_lib.DEFAULT_META_FILE_NAME
    )
    if not os.path.exists(default_meta_conf_path):
        os.makedirs(os.path.join(outputdir, ta_name, "metadata"), exist_ok=True)
        meta_conf = meta_conf_lib.MetaConf()
        meta_conf.create_default()
        meta_conf.write(default_meta_conf_path)
        logger.info(
            f"Created default {meta_conf_lib.DEFAULT_META_FILE_NAME} file in the output folder"
        )

    with open(os.path.join(outputdir, ta_name, "VERSION"), "w") as version_file:
        version_file.write(addon_version)
        version_file.write("\n")
        version_file.write(addon_version)
        logger.info("Updated VERSION file")

    app_manifest.update_addon_version(addon_version)
    output_manifest_path = os.path.abspath(
        os.path.join(outputdir, ta_name, app_manifest_lib.APP_MANIFEST_FILE_NAME)
    )
    with open(output_manifest_path, "w") as manifest_file:
        manifest_file.write(str(app_manifest))
        logger.info(
            f"Updated {app_manifest_lib.APP_MANIFEST_FILE_NAME} file in the output folder"
        )

    app_conf = app_conf_lib.AppConf()
    output_app_conf_path = os.path.join(
        outputdir, ta_name, "default", app_conf_lib.APP_CONF_FILE_NAME
    )
    app_conf.read(output_app_conf_path)
    app_conf.update(addon_version, app_manifest, conf_file_names)
    app_conf.write(output_app_conf_path)
    logger.info(f"Updated {app_conf_lib.APP_CONF_FILE_NAME} file in the output folder")

    license_dir = os.path.abspath(os.path.join(source, PARENT_DIR, "LICENSES"))
    if os.path.exists(license_dir):
        logger.info("Copy LICENSES directory")
        _recursive_overwrite(license_dir, os.path.join(outputdir, ta_name, "LICENSES"))

    if os.path.exists(
        os.path.abspath(os.path.join(source, PARENT_DIR, "additional_packaging.py"))
    ):
        sys.path.insert(0, os.path.abspath(os.path.join(source, PARENT_DIR)))
        from additional_packaging import additional_packaging

        additional_packaging(ta_name)

    if global_config:
        logger.info("Generating OpenAPI file")
        open_api_object = ucc_to_oas.transform(global_config, app_manifest)
        open_api = OpenAPI(open_api_object.json)

        output_openapi_folder = os.path.abspath(
            os.path.join(outputdir, ta_name, "static")
        )
        output_openapi_path = os.path.join(output_openapi_folder, "openapi.json")
        if not os.path.isdir(output_openapi_folder):
            os.makedirs(os.path.join(output_openapi_folder))
            logger.info(f"Creating {output_openapi_folder} folder")
        with open(output_openapi_path, "w") as openapi_file:
            json.dump(open_api.raw_element, openapi_file, indent=4)
