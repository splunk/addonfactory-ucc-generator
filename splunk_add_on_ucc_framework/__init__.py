__version__ = "0.1.0"

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
    if "\\\\" in path:
        path = path.replace("\\\\", os.sep)
    else:
        path = path.replace("\\", os.sep)
    path = path.replace("/", os.sep)
    return path.strip(os.sep)

def recursive_overwrite(src, dest, ignore_list=None):
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

    logger.info("Cleaning out directory " + outputdir)
    shutil.rmtree(os.path.join(outputdir), ignore_errors=True)
    os.makedirs(os.path.join(outputdir))
    logger.info("Cleaned out directory " + outputdir)


def copy_package_source(args, ta_name):
    logger.info("Copy package directory ")
    recursive_overwrite(args.source, os.path.join(outputdir, ta_name))


def export_package(args, ta_name, ignore_list=None):
    logger.info("Exporting package")
    recursive_overwrite(os.path.join(outputdir, ta_name), args.source, ignore_list)
    logger.info("Final build ready at: {}".format(args.source))


def copy_package_template(args, ta_name):
    logger.info("Copy UCC template directory")
    recursive_overwrite(
        os.path.join(sourcedir, "package"), os.path.join(outputdir, ta_name)
    )


def replace_token(args, ta_name):
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

def install_libs(parent_path, ucc_lib_target):

    def _install_libs(requirements, ucc_target, installer="python3"):
        
        if not os.path.exists(requirements):
            logging.warning("Unable to find requirements file. {}".format(requirements))
        else:
            if not os.path.exists(ucc_target):
                os.makedirs(ucc_target)
            install_cmd = (
                installer +" -m pip install -r \""
                + requirements
                + "\" --no-compile --no-binary :all: --target \""
                + ucc_target
                + "\""
            )
            os.system(install_cmd)
            remove_files(ucc_target)

    if os.path.exists(os.path.join(parent_path, "requirements.txt")):
        _install_libs(requirements=os.path.join(parent_path, "requirements.txt"), ucc_target=ucc_lib_target)

    if os.path.exists(os.path.join(parent_path, "requirements_py2.txt")):
        _install_libs(requirements=os.path.join(parent_path, "requirements_py2.txt"), installer="python2", ucc_target=os.path.join(ucc_lib_target, "py2"))

    if os.path.exists(os.path.join(parent_path, "requirements_py3.txt")):
        _install_libs(requirements=os.path.join(parent_path, "requirements_py3.txt"), ucc_target=os.path.join(ucc_lib_target, "py3"))


def remove_files(path):
    rmdirs = glob.glob(os.path.join(path, "*.egg-info")) + glob.glob(os.path.join(path, "*.dist-info"))
    for rmdir in rmdirs:
        shutil.rmtree(rmdir)

def copy_splunktaucclib(args, ta_name):
    logger.info("Copy splunktaucclib directory")
    recursive_overwrite(
        os.path.join(sourcedir, "splunktaucclib"),
        os.path.join(outputdir, ta_name, "lib", "splunktaucclib"),
    )


def generate_rest(args, ta_name, scheme, import_declare_name):
    build(
        scheme,
        "splunktaucclib.rest_handler.admin_external.AdminExternalHandler",
        os.path.join(outputdir, ta_name),
        j2_env,
        post_process=GlobalConfigPostProcessor(),
        import_declare_name=import_declare_name,
    )


def is_oauth_configured(ta_tabs):
    # check if oauth is configured in globalConfig.json
    for tab in ta_tabs:
        if tab["name"] == "account":
            for elements in tab["entity"]:
                if elements["type"] == "oauth":
                    return True
            break
    return False


def replace_oauth_html_template_token(args, ta_name, ta_version):
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
    redirect_xml_src = os.path.join(
        outputdir, ta_name, "default", "data", "ui", "views", "redirect.xml"
    )
    redirect_js_src = os.path.join(
        outputdir, ta_name, "appserver", "static", "js", "build", "redirect_page.js"
    )
    redirect_html_src = os.path.join(
        outputdir, ta_name, "appserver", "templates", "redirect.html"
    )
    # if oauth is configured replace token in html template and rename the templates with respect to addon name
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
    args, ta_name, schema_content, import_declare_name, j2_env
):

    services = schema_content.get("pages").get("inputs").get("services")
    for service in services:
        input_name = service.get("name")
        class_name = input_name.upper()
        description = service.get("title")
        entity = service.get("entity")
        field_white_list = ["name", "index", "sourcetype"]
        # filter fields in white list
        entity = [x for x in entity if x.get("field") not in field_white_list]
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
    if schema_content.get("alerts"):

        alert_build(
            {"alerts": schema_content["alerts"]},
            ta_name,
            ta_namespace,
            outputdir,
            sourcedir,
        )
        
def get_ignore_list(args, path):
    if not os.path.exists(path):
        return []
    else:
        with open(path) as ignore_file:
            ignore_list = ignore_file.readlines()
        ignore_list = [(os.path.join(args.source, get_os_path(path))).strip() for path in ignore_list]
        return ignore_list


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
    args = parser.parse_args()
    
    if not os.path.exists(args.source):
        raise NotADirectoryError("{} not Found.".format(os.path.abspath(args.source)))

    # Setting default value to Config argument
    if not args.config:
        args.config = os.path.abspath(os.path.join(args.source, PARENT_DIR, "globalConfig.json"))

    clean_before_build()

    if os.path.exists(args.config):

        with open(args.config, "r") as config_file:
            schema_content = json.load(config_file)

        scheme = GlobalConfigBuilderSchema(schema_content, j2_env)
        ta_name = schema_content.get("meta").get("name")
        ta_version = schema_content.get("meta").get("version")
        ta_tabs = schema_content.get("pages").get("configuration").get("tabs")
        ta_namespace = schema_content.get("meta").get("restRoot")
        import_declare_name = "import_declare_test"

        logger.info("Package ID is " + ta_name)

        copy_package_template(args, ta_name)

        shutil.copyfile(
            args.config,
            os.path.join(outputdir, ta_name, "appserver", "static", "js", "build", "globalConfig.json"),
        )
        ucc_lib_target = os.path.join(outputdir, ta_name, "lib")
        ignore_list = get_ignore_list(args, os.path.abspath(os.path.join(args.source, PARENT_DIR, ".uccignore")))

        install_libs(
            parent_path=os.path.abspath(os.path.join(args.source, PARENT_DIR)),
            ucc_lib_target=ucc_lib_target
        )

        install_libs(
            parent_path=sourcedir,
            ucc_lib_target=ucc_lib_target
        )
        copy_splunktaucclib(args, ta_name)


        replace_token(args, ta_name)

        generate_rest(args, ta_name, scheme, import_declare_name)

        modify_and_replace_token_for_oauth_templates(
                args, ta_name, ta_tabs, schema_content.get('meta').get('version')
            )

        add_modular_input(
                args, ta_name, schema_content, import_declare_name, j2_env
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
    export_package(args, ta_name, ignore_list)