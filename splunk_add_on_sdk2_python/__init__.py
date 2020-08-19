__version__ = "0.1.0"

import logging
import os
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

j2_env = Environment(loader=FileSystemLoader(os.path.join(sourcedir, "templates")))


def recursive_overwrite(src, dest, ignore=None):
    if os.path.isdir(src):
        if not os.path.isdir(dest):
            os.makedirs(dest)
        files = os.listdir(src)
        if ignore is not None:
            ignored = ignore(src, files)
        else:
            ignored = set()
        for f in files:
            if f not in ignored:
                recursive_overwrite(os.path.join(src, f), os.path.join(dest, f), ignore)
    else:
        shutil.copyfile(src, dest)


def clean_before_build(args):

    logging.warning("Cleaning out directory " + outputdir)
    shutil.rmtree(os.path.join(outputdir), ignore_errors=True)
    os.mkdir(outputdir)
    logging.warning("Cleaned out directory " + outputdir)


def copy_package_source(args, ta_name):
    logging.warning("Copy package directory " + args.source)
    recursive_overwrite(args.source, os.path.join(outputdir, ta_name))


def copy_package_template(args, ta_name):
    logging.warning("Copy template directory ")
    recursive_overwrite(
        os.path.join(sourcedir, "package"), os.path.join(outputdir, ta_name)
    )


def replace_token(args, ta_name):
    # replace token in template
    logging.warning("Replace tokens in views")
    views = ["inputs.xml", "configuration.xml", "redirect.xml"]
    for view in views:
        template_dir = os.path.join(outputdir, ta_name, "default/data/ui/views")
        with open(os.path.join(template_dir, view)) as f:
            s = f.read()

        # Safely write the changed content, if found in the file
        with open(os.path.join(template_dir, view), "w") as f:
            s = s.replace("${package.name}", ta_name)
            if view == "redirect.xml":
                s = s.replace("${ta.name}", ta_name.lower())
            f.write(s)


def install_libs(args, ta_name):

    lib_dest = os.path.join(outputdir, ta_name, "lib")
    os.makedirs(lib_dest)
    install_cmd = (
        "pip3 install -r"
        + os.path.join(sourcedir, "requirements.txt")
        + " --no-compile --no-binary :all: --target "
        + lib_dest
    )

    os.system(install_cmd)
    os.system("rm -rf " + lib_dest + "/*.egg-info")
    os.system("rm -rf " + lib_dest + "/*.dist-info")


def install_libs_py2(args, ta_name):

    lib_dest = os.path.join(outputdir, ta_name, "lib/ucc_py2")
    os.makedirs(lib_dest)
    os.system(
        "pip2 install future" + " --no-compile --no-binary :all: --target " + lib_dest
    )
    os.system(
        "pip2 install six" + " --no-compile --no-binary :all: --target " + lib_dest
    )

    os.system("rm -rf " + lib_dest + "/*.egg-info")
    os.system("rm -rf " + lib_dest + "/*.dist-info")


def copy_splunktaucclib(args, ta_name):
    logging.warning("Copy splunktaucclib directory ")
    recursive_overwrite(
        os.path.join(sourcedir, "splunktaucclib"),
        os.path.join(outputdir, ta_name, "lib/splunktaucclib"),
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
        if tab['name'] == 'account':
            for elements in tab['entity']:
                if elements['type'] == 'oauth':
                    return True
            break
        return False

def replace_oauth_html_template_token(args, ta_name,ta_version):
    html_template_path = os.path.join(outputdir, ta_name, 'appserver/templates')
    with open(os.path.join(html_template_path, 'redirect.html')) as f:
        s = f.read()

    # Safely write the changed content, if found in the file
    with open(html_template_path + "/" + 'redirect.html', 'w') as f:
        # replace addon name in html template
        s = s.replace("${ta.name}", ta_name.lower())
        # replace addon version in html template
        s = s.replace("${ta.version}", ta_version)
        f.write(s)

def modify_and_replace_token_for_oauth_templates(args, ta_name,ta_tabs, ta_version):
    redirect_xml_src = os.path.join(outputdir, ta_name, 'default/data/ui/views/redirect.xml')
    # if oauth is configured replace token in html template and rename the templates with respect to addon name
    if is_oauth_configured(ta_tabs):
        replace_oauth_html_template_token(args, ta_name,ta_version)

        redirect_js_src = os.path.join(outputdir, ta_name, 'appserver/static/js/build/redirect_page.js')
        redirect_js_dest = os.path.join(outputdir, ta_name,
                                        'appserver/static/js/build/') + ta_name.lower() + '_redirect_page.' + ta_version + '.js'
        redirect_html_src = os.path.join(outputdir, ta_name, 'appserver/templates/redirect.html')
        redirect_html_dest = os.path.join(outputdir, ta_name,
                                          'appserver/templates/') + ta_name.lower() + '_redirect.html'
        redirect_xml_dest = os.path.join(outputdir, ta_name,
                                         'default/data/ui/views/') + ta_name.lower() + '_redirect.xml'

        os.rename(redirect_js_src, redirect_js_dest)
        os.rename(redirect_html_src, redirect_html_dest)
        os.rename(redirect_xml_src, redirect_xml_dest)
    # if oauth is not configured remove the redirect.xml template
    else:
        os.remove(redirect_xml_src)

def add_modular_input(args, ta_name,schema_content,import_declare_name, j2_env):
    
    services = schema_content.get("pages").get("inputs").get("services")
    for service in services:
        input_name = service.get("name")
        class_name = input_name.upper()
        description = service.get("title")
        entity = service.get("entity")
        field_white_list = ["name", "index", "sourcetype"]
        # filter fields in white list
        entity = [x for x in entity if x.get("field") not in field_white_list]
        import_declare = 'import ' + import_declare_name

        content = j2_env.get_template('input.template').render(
            import_declare=import_declare,
            input_name=input_name,
            class_name=class_name,
            description=description,
            entity=entity
        )
        input_file_name = os.path.join(
            outputdir, ta_name,
            'bin',
            input_name + '.py'
        )
        with open(input_file_name, "w") as input_file:
            input_file.write(content)

def make_modular_alerts(args, ta_name,ta_namespace,schema_content):
    if schema_content.get("alerts"):
        
        alert_build({"alerts" : schema_content["alerts"]}, ta_name, ta_namespace, outputdir,sourcedir)


def main():
    parser = argparse.ArgumentParser(description="Build the add-on")
    parser.add_argument(
        "--source",
        type=str,
        help="Folder containing the app.manifest and app source",
        default="package",
    )
    parser.add_argument(
        "--config", type=str, help="Path to configuration file", required=True,
    )
    args = parser.parse_args()

    clean_before_build(args)

    with open(os.path.join(args.source, "app.manifest"),"r") as f:
        data = json.load(f)
    with open(args.config,"r") as f:
        schema_content = json.load(f)

    scheme = GlobalConfigBuilderSchema(schema_content, j2_env)
    ta_name = schema_content.get("meta").get("name")
    ta_version = schema_content.get("meta").get("version")
    ta_tabs = schema_content.get("pages").get("configuration").get("tabs")
    ta_namespace = schema_content.get("meta").get("restRoot")
    import_declare_name = "import_declare_test"

    logging.warning("Package ID is " + ta_name)

    copy_package_template(args, ta_name)
    copy_package_source(args, ta_name)
    shutil.copyfile(args.config,(os.path.join(outputdir, ta_name, 'appserver/static/js/build/globalConfig.json')))
    replace_token(args, ta_name)

    generate_rest(args, ta_name, scheme, import_declare_name)
    modify_and_replace_token_for_oauth_templates(args, ta_name, ta_tabs, "1.0.0")
    add_modular_input(args, ta_name,schema_content,import_declare_name,j2_env )
    make_modular_alerts(args, ta_name,ta_namespace,schema_content)
    # install_libs(args, ta_name)
    # install_libs_py2(args, ta_name)
    # copy_splunktaucclib(args, ta_name)
