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

__version__ = "5.10.3"

import argparse
import configparser
import json
import logging
import os
import shutil
import stat
import sys
from pathlib import Path

from defusedxml import ElementTree as defused_et
from dunamai import Style, Version
from jinja2 import Environment, FileSystemLoader

from .app_conf import AppConf
from .app_manifest import (
    APP_MANIFEST_FILE_NAME,
    APP_MANIFEST_WEBSITE,
    AppManifest,
    AppManifestFormatException,
)
from .global_config_validator import (
    GlobalConfigValidator,
    GlobalConfigValidatorException,
)
from .meta_conf import MetaConf
from .start_alert_build import alert_build
from .uccrestbuilder import build
from .uccrestbuilder.global_config import (
    GlobalConfigBuilderSchema,
    GlobalConfigPostProcessor,
)

sourcedir = os.path.dirname(os.path.realpath(__file__))

j2_env = Environment(loader=FileSystemLoader(os.path.join(sourcedir, "templates")))

logger = logging.getLogger("UCC")
logger.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s [%(name)s] %(levelname)s: %(message)s")
shandler = logging.StreamHandler()
shandler.setLevel(logging.INFO)
shandler.setFormatter(formatter)
logger.addHandler(shandler)

PARENT_DIR = ".."


def get_os_path(path):
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


def recursive_overwrite(src, dest, ignore_list=None):
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
                recursive_overwrite(
                    os.path.join(src, f), os.path.join(dest, f), ignore_list
                )
            else:
                logger.info(f"Excluding : {os.path.join(dest, f)}")
    else:
        if os.path.exists(dest):
            os.remove(dest)
        shutil.copy(src, dest)


def clean_before_build(outputdir):
    """
    Clean output directory before build process.

    Args:
        outputdir (str): output directory.
    """

    logger.info("Cleaning out directory " + outputdir)
    shutil.rmtree(os.path.join(outputdir), ignore_errors=True)
    os.makedirs(os.path.join(outputdir))
    logger.info("Cleaned out directory " + outputdir)


def version_tuple(version_str):
    """
    convert string into tuple to compare version

    Args:
        version_str : raw string
    Returns:
        tuple : version into tupleformat
    """
    filled = []
    for point in version_str.split("."):
        filled.append(point.zfill(8))
    return tuple(filled)


def _handle_biased_terms(conf_entities: dict) -> dict:
    for entity in conf_entities:
        entity_option = entity.get("options")
        if entity_option and "whiteList" in entity_option:
            entity_option["allowList"] = entity_option.get("whiteList")
            del entity_option["whiteList"]
        if entity_option and "blackList" in entity_option:
            entity_option["denyList"] = entity_option.get("blackList")
            del entity_option["blackList"]
    return conf_entities


def handle_biased_terms_update(schema_content: dict) -> dict:
    pages = schema_content.get("pages", {})
    ta_tabs = pages.get("configuration", {}).get("tabs", {})

    for tab in ta_tabs:
        conf_entities = tab.get("entity")
        tab["entity"] = _handle_biased_terms(conf_entities)

    if "inputs" in pages:
        services = pages.get("inputs", {}).get("services", {})
        for service in services:
            conf_entities = service.get("entity")
            service["entity"] = _handle_biased_terms(conf_entities)

    schema_content["meta"]["schemaVersion"] = "0.0.1"
    return schema_content


def handle_dropping_api_version_update(schema_content: dict) -> dict:
    if schema_content["meta"].get("apiVersion"):
        del schema_content["meta"]["apiVersion"]
    schema_content["meta"]["schemaVersion"] = "0.0.3"
    return schema_content


def handle_update(config_path):
    """
    handle changes in globalConfig.json

    Args:
        config_path : path to globalConfig.json

    Returns:
        dictionary : schema_content (globalConfig.json)
    """
    with open(config_path) as config_file:
        schema_content = json.load(config_file)

    version = schema_content.get("meta").get("schemaVersion", "0.0.0")

    if version_tuple(version) < version_tuple("0.0.1"):
        schema_content = handle_biased_terms_update(schema_content)
        with open(config_path, "w") as config_file:
            json.dump(schema_content, config_file, ensure_ascii=False, indent=4)

    if version_tuple(version) < version_tuple("0.0.2"):
        ta_tabs = schema_content.get("pages").get("configuration", {}).get("tabs", {})

        for tab in ta_tabs:
            if tab["name"] == "account":
                conf_entities = tab.get("entity")
                oauth_state_enabled_entity = {}
                for entity in conf_entities:
                    if entity.get("field") == "oauth_state_enabled":
                        logger.warning(
                            "oauth_state_enabled field is no longer a separate "
                            "entity since UCC version 5.0.0. It is now an "
                            "option in the oauth field. Please update the "
                            "globalconfig.json file accordingly."
                        )
                        oauth_state_enabled_entity = entity

                    if entity.get("field") == "oauth" and not entity.get(
                        "options", {}
                    ).get("oauth_state_enabled"):
                        entity["options"]["oauth_state_enabled"] = False

                if oauth_state_enabled_entity:
                    conf_entities.remove(oauth_state_enabled_entity)

            tab_options = tab.get("options", {})
            if tab_options.get("onChange"):
                logger.error(
                    "The onChange option is no longer supported since UCC "
                    "version 5.0.0. You can use custom hooks to implement "
                    "these actions."
                )
                del tab_options["onChange"]
            if tab_options.get("onLoad"):
                logger.error(
                    "The onLoad option is no longer supported since UCC "
                    "version 5.0.0. You can use custom hooks to implement "
                    "these actions."
                )
                del tab_options["onLoad"]

        is_inputs = "inputs" in schema_content.get("pages")
        if is_inputs:
            services = schema_content.get("pages").get("inputs", {}).get("services", {})
            for service in services:
                service_options = service.get("options", {})
                if service_options.get("onChange"):
                    logger.error(
                        "The onChange option is no longer supported since UCC "
                        "version 5.0.0. You can use custom hooks to implement "
                        "these actions."
                    )
                    del service_options["onChange"]
                if service_options.get("onLoad"):
                    logger.error(
                        "The onLoad option is no longer supported since UCC "
                        "version 5.0.0. You can use custom hooks to implement "
                        "these actions."
                    )
                    del service_options["onLoad"]

        schema_content["meta"]["schemaVersion"] = "0.0.2"
        with open(config_path, "w") as config_file:
            json.dump(schema_content, config_file, ensure_ascii=False, indent=4)

    if version_tuple(version) < version_tuple("0.0.3"):
        schema_content = handle_dropping_api_version_update(schema_content)
        with open(config_path, "w") as config_file:
            json.dump(schema_content, config_file, ensure_ascii=False, indent=4)

    return schema_content


def replace_token(ta_name, outputdir):
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


def install_libs(path, ucc_lib_target):
    """
    Install 3rd Party libraries in addon.

    Args:
        parent_path (str): Path of parent directory.
        ucc_lib_target (str): Target path to install libraries.
    """

    def _install_libs(requirements, ucc_target, installer="python3"):
        """
        Install 3rd Party libraries using pip2/pip3

        Args:
            requirements (str): Path to requirements file.
            ucc_target (str): Target path to install libraries.
            installer (str): Pip version(pip2/pip3).
        """
        if not os.path.exists(requirements):
            logger.warning(f"Unable to find requirements file. {requirements}")
        else:
            if not os.path.exists(ucc_target):
                os.makedirs(ucc_target)
            install_cmd = (
                installer
                + ' -m pip install -r "'
                + requirements
                + '" --no-compile --prefer-binary --ignore-installed --use-deprecated=legacy-resolver --target "'
                + ucc_target
                + '"'
            )
            os.system(installer + " -m pip install pip --upgrade")
            os.system(install_cmd)

    logger.info(f"  Checking for requirements in {path}")
    if os.path.exists(os.path.join(path, "lib", "requirements.txt")):
        logger.info("  Uses common requirements")
        _install_libs(
            requirements=os.path.join(path, "lib", "requirements.txt"),
            ucc_target=ucc_lib_target,
        )
    elif os.path.exists(
        os.path.join(os.path.abspath(os.path.join(path, os.pardir)), "requirements.txt")
    ):
        logger.info("  Uses common requirements")
        _install_libs(
            requirements=os.path.join(
                os.path.abspath(os.path.join(path, os.pardir)), "requirements.txt"
            ),
            ucc_target=ucc_lib_target,
        )
    else:
        logger.info("  Not using common requirements")

    # Prevent certain packages from being included pip could be dangerous others are just wasted space
    noshipdirs = ["setuptools", "bin", "pip", "distribute", "wheel"]
    p = Path(ucc_lib_target)
    for nsd in noshipdirs:
        try:
            # Glob can return FileNotFoundError exception if no match
            for o in p.glob(nsd + "*"):
                if o.is_dir():
                    logging.info(f"  removing directory {o} from output must not ship")
                    shutil.rmtree(o)
        except FileNotFoundError:
            pass

    # Remove execute bit from any object in lib
    NO_USER_EXEC = ~stat.S_IEXEC
    NO_GROUP_EXEC = ~stat.S_IXGRP
    NO_OTHER_EXEC = ~stat.S_IXOTH
    NO_EXEC = NO_USER_EXEC & NO_GROUP_EXEC & NO_OTHER_EXEC

    for o in p.rglob("*"):
        if not o.is_dir() and os.access(o, os.X_OK):
            logging.info(f"  fixing {o} execute bit")
            current_permissions = stat.S_IMODE(os.lstat(o).st_mode)
            os.chmod(o, current_permissions & NO_EXEC)


def generate_rest(ta_name, scheme, import_declare_name, outputdir):
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
        post_process=GlobalConfigPostProcessor(),
        import_declare_name=import_declare_name,
    )


def is_oauth_configured(ta_tabs):
    """
    Check if oauth is configured in globalConfig.json.

    Args:
        ta_tabs (list): List of tabs mentioned in globalConfig.json.

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


def replace_oauth_html_template_token(ta_name, ta_version, outputdir):
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


def modify_and_replace_token_for_oauth_templates(
    ta_name, ta_tabs, ta_version, outputdir
):
    """
    Rename templates with respect to addon name if OAuth is configured.

    Args:
        ta_name (str): Name of TA.
        ta_version (str): Version of TA.
        ta_tabs (list): List of tabs mentioned in globalConfig.json.
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

    if is_oauth_configured(ta_tabs):
        replace_oauth_html_template_token(ta_name, ta_version, outputdir)

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


def add_modular_input(ta_name, schema_content, import_declare_name, outputdir):
    """
    Generate Modular input for addon.

    Args:
        ta_name (str): Name of TA.
        schema_content (dict): JSON schema of globalConfig.json.
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


def make_modular_alerts(ta_name, ta_namespace, schema_content, outputdir):
    """
    Generate the alert schema with required structure.

    Args:
        ta_name (str): Name of TA.
        ta_namespace (str): restRoot of TA.
        schema_content (dict): JSON schema of globalConfig.json.
        outputdir (str): output directory.
    """

    if schema_content.get("alerts"):
        alert_build(
            {"alerts": schema_content["alerts"]},
            ta_name,
            ta_namespace,
            outputdir,
            sourcedir,
        )


def get_ignore_list(ta_name, path):
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
            (os.path.join("output", ta_name, get_os_path(path))).strip()
            for path in ignore_list
        ]
        return ignore_list


def remove_listed_files(ignore_list):
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


def update_ta_version(config, ta_version):
    """
    Update version of TA in globalConfig.json.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
    """

    with open(config) as config_file:
        schema_content = json.load(config_file)
    schema_content.setdefault("meta", {})["version"] = ta_version
    with open(config, "w") as config_file:
        json.dump(schema_content, config_file, indent=4)


def handle_no_inputs(ta_name, outputdir):
    """
    Handle for configuration without input page.

    Args:
        ta_name (str): Name of TA.
        outputdir (str): output directory.
    """

    def _removeinput(path):
        """
        Remove "inputs" view from default.xml

        Args:
            path (str) : path to default.xml
        """
        tree = defused_et.parse(path)
        root = tree.getroot()

        for element in root:
            if element.tag == "view" and element.get("name") == "inputs":
                root.remove(element)

        tree.write(path)

    default_xml_file = os.path.join(
        outputdir, ta_name, "default", "data", "ui", "nav", "default.xml"
    )
    # Remove "inputs" view from default.xml
    _removeinput(default_xml_file)

    file_remove_list = []
    file_remove_list.append(
        os.path.join(outputdir, ta_name, "default", "data", "ui", "views", "inputs.xml")
    )
    file_remove_list.append(
        os.path.join(outputdir, ta_name, "appserver", "static", "css", "inputs.css")
    )
    file_remove_list.append(
        os.path.join(
            outputdir, ta_name, "appserver", "static", "css", "createInput.css"
        )
    )
    # Remove unnecessary files
    for fl in file_remove_list:
        try:
            os.remove(fl)
        except OSError:
            pass


def _generate(source, config, ta_version, outputdir=None):
    logger.info(f"ucc-gen version {__version__} is used")
    if outputdir is None:
        outputdir = os.path.join(os.getcwd(), "output")
    if not ta_version:
        version = Version.from_git()
        if not version.stage:
            stage = "R"
        else:
            stage = version.stage[:1]

        version_str = version.serialize(metadata=True, style=Style.SemVer)
        version_splunk = f"{version.base}{stage}{version.commit}"
        ta_version = version_splunk
    else:
        ta_version = ta_version.strip()
        version_str = ta_version

    if not os.path.exists(source):
        raise NotADirectoryError(f"{os.path.abspath(source)} not Found.")

    # Setting default value to Config argument
    if not config:
        config = os.path.abspath(os.path.join(source, PARENT_DIR, "globalConfig.json"))

    clean_before_build(outputdir)

    app_manifest_path = os.path.abspath(
        os.path.join(source, APP_MANIFEST_FILE_NAME),
    )
    with open(app_manifest_path) as manifest_file:
        app_manifest_content = manifest_file.read()
    manifest = AppManifest()
    try:
        manifest.read(app_manifest_content)
    except AppManifestFormatException:
        logger.error(
            f"Manifest file @ {app_manifest_path} has invalid format.\n"
            f"Please refer to {APP_MANIFEST_WEBSITE}.\n"
            f'Lines with comments are supported if they start with "#".\n'
        )
        sys.exit(1)
    ta_name = manifest.get_addon_name()

    if os.path.exists(config):
        try:
            with open(config) as f_config:
                config_raw = f_config.read()
            validator = GlobalConfigValidator(sourcedir, json.loads(config_raw))
            validator.validate()
            logger.info("Config is valid")
        except GlobalConfigValidatorException as e:
            logger.error(f"Config is not valid. Error: {e}")
            sys.exit(1)

        update_ta_version(config, ta_version)

        # handle_update check schemaVersion and update globalConfig.json if required and return schema
        schema_content = handle_update(config)

        scheme = GlobalConfigBuilderSchema(schema_content, j2_env)

        ta_version = schema_content.get("meta").get("version")
        logger.info("Addon Version : " + ta_version)
        ta_tabs = schema_content.get("pages").get("configuration").get("tabs")
        ta_namespace = schema_content.get("meta").get("restRoot")
        import_declare_name = "import_declare_test"
        is_inputs = "inputs" in schema_content.get("pages")

        logger.info("Package ID is " + ta_name)

        logger.info("Copy UCC template directory")
        recursive_overwrite(
            os.path.join(sourcedir, "package"), os.path.join(outputdir, ta_name)
        )

        logger.info("Copy globalConfig to output")
        shutil.copyfile(
            config,
            os.path.join(
                outputdir,
                ta_name,
                "appserver",
                "static",
                "js",
                "build",
                "globalConfig.json",
            ),
        )
        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")
        logger.info(f"Install add-on requirements into {ucc_lib_target} from {source}")
        install_libs(source, ucc_lib_target)

        replace_token(ta_name, outputdir)

        generate_rest(ta_name, scheme, import_declare_name, outputdir)

        modify_and_replace_token_for_oauth_templates(
            ta_name, ta_tabs, schema_content.get("meta").get("version"), outputdir
        )
        if is_inputs:
            add_modular_input(ta_name, schema_content, import_declare_name, outputdir)
        else:
            handle_no_inputs(ta_name, outputdir)

        make_modular_alerts(ta_name, ta_namespace, schema_content, outputdir)

    else:
        logger.info("Addon Version : " + ta_version)
        logger.warning(
            "Skipped generating UI components as globalConfig.json does not exist."
        )
        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")

        logger.info(f"Install add-on requirements into {ucc_lib_target} from {source}")
        install_libs(source, ucc_lib_target=ucc_lib_target)

    ignore_list = get_ignore_list(
        ta_name, os.path.abspath(os.path.join(source, PARENT_DIR, ".uccignore"))
    )
    remove_listed_files(ignore_list)
    logger.info("Copy package directory")
    recursive_overwrite(source, os.path.join(outputdir, ta_name))

    default_meta_conf_path = os.path.join(
        outputdir, ta_name, "metadata", "default.meta"
    )
    if not os.path.exists(default_meta_conf_path):
        os.makedirs(os.path.join(outputdir, ta_name, "metadata"), exist_ok=True)
        with open(default_meta_conf_path, "w") as default_meta_conf_fd:
            MetaConf().create_default(default_meta_conf_fd)

    # Update app.manifest
    with open(os.path.join(outputdir, ta_name, "VERSION"), "w") as version_file:
        version_file.write(version_str)
        version_file.write("\n")
        version_file.write(ta_version)

    manifest.update_addon_version(ta_version)
    output_manifest_path = os.path.abspath(
        os.path.join(outputdir, ta_name, APP_MANIFEST_FILE_NAME)
    )
    with open(output_manifest_path, "w") as manifest_file:
        manifest_file.write(str(manifest))

    app_config = AppConf()
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
        logger.info("Copy LICENSES directory ")
        recursive_overwrite(license_dir, os.path.join(outputdir, ta_name, "LICENSES"))

    if os.path.exists(
        os.path.abspath(os.path.join(source, PARENT_DIR, "additional_packaging.py"))
    ):
        sys.path.insert(0, os.path.abspath(os.path.join(source, PARENT_DIR)))
        from additional_packaging import additional_packaging

        additional_packaging(ta_name)


def generate(source="package", config=None, ta_version=None, outputdir=None):
    _generate(source, config, ta_version, outputdir)


def main():
    parser = argparse.ArgumentParser(description="Build the add-on")
    parser.add_argument(
        "--source",
        type=str,
        nargs="?",
        help="Folder containing the app.manifest and app source",
        default="package",
    )
    parser.add_argument(
        "--config",
        type=str,
        nargs="?",
        help="Path to configuration file, defaults to GlobalConfig.json in parent directory of source provided",
        default=None,
    )
    parser.add_argument(
        "--ta-version",
        type=str,
        help="Version of TA, default version is version specified in the "
        "package such as app.manifest, app.conf, and globalConfig.json",
        default=None,
    )
    args = parser.parse_args()
    _generate(args.source, args.config, args.ta_version)
