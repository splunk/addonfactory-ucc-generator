__version__ = "0.0.0"

import logging
import os
import glob
from os import system
import shutil
import argparse
import json
from .uccrestbuilder.global_config import (
    GlobalConfigBuilderSchema,
    GlobalConfigPostProcessor,
)
from .uccrestbuilder import build
from .start_alert_build import alert_build

from jinja2 import Environment, FileSystemLoader

outputdir = os.path.join(os.getcwd(), "output")
sourcedir = os.path.dirname(os.path.realpath(__file__))

j2_env = Environment(
    loader=FileSystemLoader(os.path.join(sourcedir, "templates"))
)

logger = logging.getLogger('UCC')
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s [%(name)s] %(levelname)s: %(message)s')
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
                logger.info("Excluding : {}".format(os.path.join(dest, f)))
    else:
        if os.path.exists(dest):
            os.remove(dest)
        shutil.copy(src, dest)


def clean_before_build():
    """
    Clean output directory before build process.
    """

    logger.info("Cleaning out directory " + outputdir)
    shutil.rmtree(os.path.join(outputdir), ignore_errors=True)
    os.makedirs(os.path.join(outputdir))
    logger.info("Cleaned out directory " + outputdir)

def versiontuple(version_str):
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

def handle_update(config_path):
    """
    handle changes in globalConfig.json

    Args:
        config_path : path to globalConfig.json

    Returns:
        dictionary : schema_content (globalConfig.json)     
    """
    with open(config_path, "r") as config_file:
        schema_content = json.load(config_file)
    version = schema_content.get("meta").get("schemaVersion","0.0.0")

    if versiontuple(version) < versiontuple("0.0.1"):
        ta_tabs = schema_content.get("pages").get("configuration").get("tabs")

        for tab in ta_tabs:
            conf_entitties= tab.get("entity")
            for entity in conf_entitties:
                entity_option = entity.get("options")
                if entity_option and "whiteList" in entity_option:
                    entity_option["allowList"] = entity_option.get("whiteList")
                    del entity_option["whiteList"]
                if entity_option and "blackList" in entity_option:
                    entity_option["denyList"] = entity_option.get("blackList")
                    del entity_option["blackList"]
        
        services = schema_content.get("pages").get("inputs").get("services")
        for service in services:
            conf_entitties= service.get("entity")
            for entity in conf_entitties:
                entity_option = entity.get("options")
                if entity_option and "whiteList" in entity_option:
                    entity_option["allowList"] = entity_option.get("whiteList")
                    del entity_option["whiteList"]
                if entity_option and "blackList" in entity_option:
                    entity_option["denyList"] = entity_option.get("blackList")
                    del entity_option["blackList"]

        schema_content["meta"]["schemaVersion"]="0.0.1"
        with open(config_path, "w") as config_file:
            json.dump(schema_content,config_file, ensure_ascii=False, indent=4)
    return schema_content
    

def copy_package_source(args, ta_name):
    """
    Copy source package to output directory.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        ta_name (str): Name of TA.
    """

    logger.info("Copy package directory ")
    recursive_overwrite(args.source, os.path.join(outputdir, ta_name))


def export_package(args, ta_name, ignore_list=None):
    """
    Export package from output directory to source directory.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        ta_name (str): Name of TA.
        ignore_list (list): List of files/folder to ignore while copying.

    """

    logger.info("Exporting package")
    recursive_overwrite(os.path.join(outputdir, ta_name), args.source, ignore_list)
    logger.info("Final build ready at: {}".format(outputdir))


def replace_token(args, ta_name):
    """
    Replace token with addon name in inputs.xml, configuration.xml, redirect.xml.
    Replace token with addon version in redirect.xml.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        ta_name (str): Name of TA.
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

    def _install_libs(requirements, ucc_target, installer="pip3"):
        """
        Install 3rd Party libraries using pip2/pip3

        Args:
            requirements (str): Path to requirements file.
            ucc_target (str): Target path to install libraries.
            installer (str): Pip version(pip2/pip3).
        """
        if not os.path.exists(requirements):
            logging.warning("Unable to find requirements file. {}".format(requirements))
        else:
            if not os.path.exists(ucc_target):
                os.makedirs(ucc_target)
            install_cmd = (
                installer +" install -r \""
                + requirements
                + "\" --no-compile --prefer-binary --ignore-installed --target \""
                + ucc_target
                + "\""
            )
            os.system(install_cmd)
            remove_files(ucc_target)
    logging.info(f"  Checking for requirements in {path}")
    if os.path.exists(os.path.join(path, "requirements.txt")):
        logging.info(f"  Uses common requirements")    
        _install_libs(requirements=os.path.join(path, "requirements.txt"), ucc_target=ucc_lib_target)
    else:
        logging.info(f"  Not using common requirements")    

    if os.path.exists(os.path.join(path, "requirements_py2.txt")):
        logging.info(f"  Uses py2 requirements")    
        _install_libs(requirements=os.path.join(path, "requirements_py2.txt"), installer="pip2", ucc_target=os.path.join(ucc_lib_target, "py2"))
    else:
        logging.info(f"  Not using py2 requirements")    

    if os.path.exists(os.path.join(path, "requirements_py3.txt")):
        logging.info(f"  Uses py3 requirements")            
        _install_libs(requirements=os.path.join(path, "requirements_py3.txt"), ucc_target=os.path.join(ucc_lib_target, "py3"))
    else:
        logging.info(f"  Not using py3 requirements")    


def remove_files(path):
    """
    Remove *.egg-info and *.dist-info files in given path.

    Args:
        path (str): Path to remove *.egg-info and *.dist-info files.
    """

    rmdirs = glob.glob(os.path.join(path, "*.egg-info")) + glob.glob(os.path.join(path, "*.dist-info"))
    for rmdir in rmdirs:
        shutil.rmtree(rmdir)

def generate_rest(args, ta_name, scheme, import_declare_name):
    """
    Build REST for Add-on.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        ta_name (str): Name of TA.
        scheme (GlobalConfigBuilderSchema): REST schema.
        import_declare_name (str): Name of import_declare_* file.
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


def replace_oauth_html_template_token(args, ta_name, ta_version):
    """
    Replace tokens with addon name and version in redirect.html.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        ta_name (str): Name of TA.
        ta_version (str): Version of TA.
    """

    html_template_path = os.path.join(
        outputdir, ta_name, "appserver", "templates"
    )
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
    args, ta_name, ta_tabs, ta_version
):
    """
    Rename templates with respect to addon name if OAuth is configured.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        ta_name (str): Name of TA.
        ta_version (str): Version of TA.
        ta_tabs (list): List of tabs mentioned in globalConfig.json.

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
        replace_oauth_html_template_token(args, ta_name, ta_version)

        redirect_js_dest = (
            os.path.join(outputdir, ta_name, "appserver", "static", "js", "build", "")
            + ta_name.lower()
            + "_redirect_page."
            + ta_version
            + ".js"
        )
        redirect_html_dest = (
            os.path.join(outputdir, ta_name, "appserver", "templates", ta_name.lower() + "_redirect.html")
        )
        redirect_xml_dest = (
            os.path.join(outputdir, ta_name, "default", "data", "ui", "views", ta_name.lower() + "_redirect.xml")
        )
        os.rename(redirect_js_src, redirect_js_dest)
        os.rename(redirect_html_src, redirect_html_dest)
        os.rename(redirect_xml_src, redirect_xml_dest)

    # if oauth is not configured remove the extra template
    else:
        os.remove(redirect_xml_src)
        os.remove(redirect_html_src)
        os.remove(redirect_js_src)

def add_modular_input(
    args, ta_name, schema_content, import_declare_name
):
    """
    Generate Modular input for addon.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        ta_name (str): Name of TA.
        schema_content (dict): JSON schema of globalConfig.json
    """

    services = schema_content.get("pages").get("inputs").get("services")
    for service in services:
        input_name = service.get("name")
        class_name = input_name.upper()
        description = service.get("title")
        entity = service.get("entity")
        field_allow_list = ["name", "index", "sourcetype"]
        # filter fields in allow list
        entity = [x for x in entity if x.get("field") not in field_allow_list]
        import_declare = "import " + import_declare_name

        content = j2_env.get_template("input.template").render(
            import_declare=import_declare,
            input_name=input_name,
            class_name=class_name,
            description=description,
            entity=entity,
        )
        input_file_name = os.path.join(
            outputdir, ta_name, "bin", input_name + ".py"
        )
        with open(input_file_name, "w") as input_file:
            input_file.write(content)


def make_modular_alerts(args, ta_name, ta_namespace, schema_content):
    """
    Generate the alert schema with required structure.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        ta_name (str): Name of TA.
        ta_namespace (str): restRoot of TA.
        schema_content (dict): JSON schema of globalConfig.json.

    """

    if schema_content.get("alerts"):
        alert_build(
            {"alerts": schema_content["alerts"]},
            ta_name,
            ta_namespace,
            outputdir,
            sourcedir,
        )

def get_ignore_list(args, path):
    """
    Return path of files/folders to ignore while copying to package.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
        path (str): Path of '.uccignore'.

    Returns:
        list: List of paths to ignore while copying to package.
    """

    if not os.path.exists(path):
        return []
    else:
        with open(path) as ignore_file:
            ignore_list = ignore_file.readlines()
        ignore_list = [(os.path.join(args.source, get_os_path(path))).strip() for path in ignore_list]
        return ignore_list

def update_ta_version(args):
    """
    Update version of TA in globalConfig.json.

    Args:
        args (argparse.Namespace): Object with command-line arguments.
    """

    with open(args.config, "r") as config_file:
        schema_content = json.load(config_file)
    schema_content.setdefault("meta", {})["version"] = args.ta_version
    with open(args.config, "w") as config_file:
        json.dump(schema_content, config_file, indent=4)

def main():
    parser = argparse.ArgumentParser(description="Build the add-on")
    parser.add_argument(
        "--source",
        type=str,
        nargs='?',
        help="Folder containing the app.manifest and app source",
        default="package",
    )
    parser.add_argument(
        "--config",
        type=str,
        nargs='?',
        help="Path to configuration file, Defaults to GlobalConfig.json in parent directory of source provided",
        default=None
    )
    parser.add_argument(
        "--ta-version",
        type=str,
        help="Version of TA, Deafult version is version specified in globalConfig.json",
    )
    args = parser.parse_args()

    if not os.path.exists(args.source):
        raise NotADirectoryError("{} not Found.".format(os.path.abspath(args.source)))

    # Setting default value to Config argument
    if not args.config:
        args.config = os.path.abspath(os.path.join(args.source, PARENT_DIR, "globalConfig.json"))

    clean_before_build()

    ignore_list = get_ignore_list(args, os.path.abspath(os.path.join(args.source, PARENT_DIR, ".uccignore")))
    if os.path.exists(args.config):

        if args.ta_version:
            update_ta_version(args)

        schema_content = handle_update(args.config)

        scheme = GlobalConfigBuilderSchema(schema_content, j2_env)
        ta_name = schema_content.get("meta").get("name")
        ta_version = schema_content.get("meta").get("version")
        ta_tabs = schema_content.get("pages").get("configuration").get("tabs")
        ta_namespace = schema_content.get("meta").get("restRoot")
        import_declare_name = "import_declare_test"

        logger.info("Package ID is " + ta_name)

        logger.info("Copy UCC template directory")
        recursive_overwrite(
            os.path.join(sourcedir,"package"), os.path.join(outputdir, ta_name)
        )

        logger.info("Copy globalConfig to output")
        shutil.copyfile(
            args.config,
            os.path.join(outputdir, ta_name, "appserver", "static", "js", "build", "globalConfig.json"),
        )

        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")
        logger.info(f"Install UCC Requirements into {ucc_lib_target} from {sourcedir}")
        install_libs(
            sourcedir,
            ucc_lib_target
        )

        talibs = os.path.abspath(os.path.join(args.source, os.pardir))
        logger.info(f"Install Addon Requirements into {ucc_lib_target} from {talibs}")
        install_libs(
            talibs ,
            ucc_lib_target
        )

        replace_token(args, ta_name)

        generate_rest(args, ta_name, scheme, import_declare_name)

        modify_and_replace_token_for_oauth_templates(
                args, ta_name, ta_tabs, schema_content.get('meta').get('version')
            )

        add_modular_input(
                args, ta_name, schema_content, import_declare_name
            )

        make_modular_alerts(args, ta_name, ta_namespace, schema_content)

    else:
        logger.warning("Skipped installing UCC required python modules as GlobalConfig.json does not exist.")
        logger.warning("Skipped Generating UI components as GlobalConfig.json does not exist.")
        logger.info("Setting TA name as generic")

        ta_name = "TA-generic"
        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")

        install_libs(
            parent_path=os.path.abspath(os.path.join(args.source, PARENT_DIR)),
            ucc_lib_target=ucc_lib_target
        )

    copy_package_source(args, ta_name)
    # export_package(args, ta_name, ignore_list)
