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
import functools
import json
import logging
import os
import shutil
import sys

import yaml
from jinja2 import Environment, FileSystemLoader

from splunk_add_on_ucc_framework import (
    __version__,
    app_conf,
    app_manifest,
    exceptions,
    global_config_update,
    global_config_validator,
    meta_conf,
    utils,
)
from splunk_add_on_ucc_framework.install_python_libraries import (
    install_python_libraries,
)
from splunk_add_on_ucc_framework.start_alert_build import alert_build
from splunk_add_on_ucc_framework.uccrestbuilder import build, global_config

logger = logging.getLogger("ucc_gen")

PARENT_DIR = ".."
internal_root_dir = os.path.dirname(os.path.dirname(__file__))
j2_env = Environment(
    loader=FileSystemLoader(os.path.join(internal_root_dir, "templates"))
)

Loader = getattr(yaml, "CSafeLoader", yaml.SafeLoader)
yaml_load = functools.partial(yaml.load, Loader=Loader)


def _update_ta_version(config, ta_version, is_global_config_yaml):
    """
    Update version of TA in globalConfig file.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
    """

    with open(config) as config_file:
        if is_global_config_yaml:
            schema_content = yaml_load(config_file)
        else:
            schema_content = json.load(config_file)
    schema_content.setdefault("meta", {})["version"] = ta_version
    with open(config, "w") as config_file:
        if is_global_config_yaml:
            yaml.dump(schema_content, config_file)
        else:
            json.dump(schema_content, config_file, ensure_ascii=False, indent=4)


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


def _generate_rest(ta_name, scheme, import_declare_name, outputdir):
    """
    Build REST for Add-on.

    Args:
        ta_name (str): Name of TA.
        scheme (GlobalConfigBuilderSchema): REST schema.
        import_declare_name (str): Name of import_declare_* file.
        outputdir (str): output directory.
    """

    build(
        scheme,
        "splunktaucclib.rest_handler.admin_external.AdminExternalHandler",
        os.path.join(outputdir, ta_name),
        j2_env,
        post_process=global_config.GlobalConfigPostProcessor(),
        import_declare_name=import_declare_name,
    )


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
    ta_name, ta_tabs, ta_version, outputdir
):
    """
    Rename templates with respect to addon name if OAuth is configured.

    Args:
        ta_name (str): Name of TA.
        ta_version (str): Version of TA.
        ta_tabs (list): List of tabs mentioned in globalConfig file.
        outputdir (str): output directory.
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

    if _is_oauth_configured(ta_tabs):
        _replace_oauth_html_template_token(ta_name, ta_version, outputdir)

        redirect_js_dest = (
            os.path.join(outputdir, ta_name, "appserver", "static", "js", "build", "")
            + ta_name.lower()
            + "_redirect_page."
            + ta_version
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


def _add_modular_input(ta_name, schema_content, import_declare_name, outputdir):
    """
    Generate Modular input for addon.

    Args:
        ta_name (str): Name of TA.
        schema_content (dict): schema of globalConfig file.
        outputdir (str): output directory.
    """

    services = schema_content.get("pages").get("inputs").get("services")
    for service in services:
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
        import_declare = "import " + import_declare_name

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


def _make_modular_alerts(ta_name, ta_namespace, schema_content, outputdir):
    """
    Generate the alert schema with required structure.

    Args:
        ta_name (str): Name of TA.
        ta_namespace (str): restRoot of TA.
        schema_content (dict): schema of globalConfig file.
        outputdir (str): output directory.
    """

    if schema_content.get("alerts"):
        alert_build(
            {"alerts": schema_content["alerts"]},
            ta_name,
            ta_namespace,
            outputdir,
            internal_root_dir,
        )


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


def generate(source, config, ta_version, outputdir=None, python_binary_name="python3"):
    logger.info(f"ucc-gen version {__version__} is used")
    logger.info(f"Python binary name to use: {python_binary_name}")
    if outputdir is None:
        outputdir = os.path.join(os.getcwd(), "output")
    if not ta_version:
        try:
            ta_version = utils.get_version_from_git()
        except exceptions.CouldNotVersionFromGitException:
            logger.error(
                "Could not find the proper version from git tags. "
                "Check out "
                "https://github.com/splunk/addonfactory-ucc-generator/issues/404"
            )
            exit(1)
    else:
        ta_version = ta_version.strip()

    if not os.path.exists(source):
        raise NotADirectoryError(f"{os.path.abspath(source)} not found.")

    # Setting default value to Config argument
    if not config:
        is_global_config_yaml = False
        config = os.path.abspath(os.path.join(source, PARENT_DIR, "globalConfig.json"))
        if not os.path.isfile(config):
            config = os.path.abspath(
                os.path.join(source, PARENT_DIR, "globalConfig.yaml")
            )
            is_global_config_yaml = True

    logger.info(f"Cleaning out directory {outputdir}")
    shutil.rmtree(os.path.join(outputdir), ignore_errors=True)
    os.makedirs(os.path.join(outputdir))
    logger.info(f"Cleaned out directory {outputdir}")

    app_manifest_path = os.path.abspath(
        os.path.join(source, app_manifest.APP_MANIFEST_FILE_NAME),
    )
    with open(app_manifest_path) as manifest_file:
        app_manifest_content = manifest_file.read()
    manifest = app_manifest.AppManifest()
    try:
        manifest.read(app_manifest_content)
    except app_manifest.AppManifestFormatException:
        logger.error(
            f"Manifest file @ {app_manifest_path} has invalid format.\n"
            f"Please refer to {app_manifest.APP_MANIFEST_WEBSITE}.\n"
            f'Lines with comments are supported if they start with "#".\n'
        )
        sys.exit(1)
    ta_name = manifest.get_addon_name()

    if os.path.isfile(config):
        try:
            with open(config) as f_config:
                config_raw = f_config.read()

            if is_global_config_yaml:
                validator = global_config_validator.GlobalConfigValidator(
                    internal_root_dir, yaml_load(config_raw)
                )
            else:
                validator = global_config_validator.GlobalConfigValidator(
                    internal_root_dir, json.loads(config_raw)
                )

            validator.validate()
            logger.info("Config is valid")
        except global_config_validator.GlobalConfigValidatorException as e:
            logger.error(f"Config is not valid. Error: {e}")
            sys.exit(1)

        _update_ta_version(config, ta_version, is_global_config_yaml)

        schema_content = global_config_update.handle_global_config_update(
            config, is_global_config_yaml
        )

        scheme = global_config.GlobalConfigBuilderSchema(schema_content, j2_env)

        ta_version = schema_content.get("meta").get("version")
        logger.info("Addon Version : " + ta_version)
        ta_tabs = schema_content.get("pages").get("configuration").get("tabs")
        ta_namespace = schema_content.get("meta").get("restRoot")
        import_declare_name = "import_declare_test"
        is_inputs = "inputs" in schema_content.get("pages")

        logger.info("Package ID is " + ta_name)

        logger.info("Copy UCC template directory")
        _recursive_overwrite(
            os.path.join(internal_root_dir, "package"), os.path.join(outputdir, ta_name)
        )

        logger.info("Copy globalConfig to output")
        global_config_file = (
            "globalConfig.yaml" if is_global_config_yaml else "globalConfig.json"
        )
        shutil.copyfile(
            config,
            os.path.join(
                outputdir,
                ta_name,
                "appserver",
                "static",
                "js",
                "build",
                global_config_file,
            ),
        )
        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")
        logger.info(f"Install add-on requirements into {ucc_lib_target} from {source}")
        install_python_libraries(source, ucc_lib_target, python_binary_name)

        _replace_token(ta_name, outputdir)

        _generate_rest(ta_name, scheme, import_declare_name, outputdir)

        _modify_and_replace_token_for_oauth_templates(
            ta_name, ta_tabs, schema_content.get("meta").get("version"), outputdir
        )
        if is_inputs:
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
            _add_modular_input(ta_name, schema_content, import_declare_name, outputdir)
        else:
            _handle_no_inputs(ta_name, outputdir)

        _make_modular_alerts(ta_name, ta_namespace, schema_content, outputdir)

    else:
        logger.info("Addon Version : " + ta_version)
        logger.warning(
            "Skipped generating UI components as globalConfig file does not exist."
        )
        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")

        logger.info(f"Install add-on requirements into {ucc_lib_target} from {source}")
        install_python_libraries(source, ucc_lib_target, python_binary_name)

    ignore_list = _get_ignore_list(
        ta_name, os.path.abspath(os.path.join(source, PARENT_DIR, ".uccignore"))
    )
    _remove_listed_files(ignore_list)
    logger.info("Copy package directory")
    _recursive_overwrite(source, os.path.join(outputdir, ta_name))

    default_meta_conf_path = os.path.join(
        outputdir, ta_name, "metadata", "default.meta"
    )
    if not os.path.exists(default_meta_conf_path):
        os.makedirs(os.path.join(outputdir, ta_name, "metadata"), exist_ok=True)
        with open(default_meta_conf_path, "w") as default_meta_conf_fd:
            meta_conf.MetaConf().create_default(default_meta_conf_fd)

    # Update app.manifest
    with open(os.path.join(outputdir, ta_name, "VERSION"), "w") as version_file:
        version_file.write(ta_version)
        version_file.write("\n")
        version_file.write(ta_version)

    manifest.update_addon_version(ta_version)
    output_manifest_path = os.path.abspath(
        os.path.join(outputdir, ta_name, app_manifest.APP_MANIFEST_FILE_NAME)
    )
    with open(output_manifest_path, "w") as manifest_file:
        manifest_file.write(str(manifest))

    app_config = app_conf.AppConf()
    path = os.path.join(outputdir, ta_name, "default", "app.conf")
    app_config.read(path)
    app_config.update(
        ta_version, ta_name, manifest.get_description(), manifest.get_title()
    )
    with open(path, "w") as app_conf_fd:
        app_config.write(app_conf_fd)

    # Copy Licenses
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
