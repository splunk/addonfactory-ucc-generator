import shutil
import errno
import json
import os
import subprocess


from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from uccrestbuilder.global_config import GlobalConfigSchema
from uccrestbuilder import build

basedir = os.path.dirname(os.path.abspath(__file__))

# read schema from globalConfig.json
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(root_path, 'globalConfig.json')) as f:
    json_schema = ''.join([l for l in f])

schema_content = json.loads(json_schema)
scheme = GlobalConfigSchema(schema_content)


def clean_before_build():
    shutil.rmtree(basedir + "/output")


def generate_rest():
    build(
        scheme,
        AdminExternalHandler,
        './output/' + schema_content.get("meta").get("name")
    )


def copy_directory(src, dest):
    try:
        shutil.copytree(src, dest)
    except OSError as exc:
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dest)
        else:
            print'Directory %s not copied. Error: %s' % (src, exc)


def generate_ui():
    subprocess.call("npm run build", shell=True)
    ui_lib_dir = os.path.dirname(basedir) + "/UCC-UI-lib/build"

    # copy appserver folder
    copy_directory(
            ui_lib_dir + "/appserver",
            basedir + "/output/" + schema_content.get("meta").get("name") + "/appserver"
        )

    # copy locale folder
    copy_directory(
        ui_lib_dir + "/locale",
        basedir + "/output/" + schema_content.get("meta").get("name") + "/locale"
    )

    # copy default/data folder
    copy_directory(
        ui_lib_dir + "/default/data",
        basedir + "/output/" + schema_content.get("meta").get("name") + "/default/data"
    )


def replace_token():
    # replace token in template
    views = ["inputs.xml", "configuration.xml"]
    for view in views:
        template_dir = basedir + "/output/" + schema_content.get("meta").get("name") + "/default/data/ui/views"
        with open(template_dir + "/" + view) as f:
            s = f.read()

        # Safely write the changed content, if found in the file
        with open(template_dir + "/" + view, 'w') as f:
            s = s.replace("${package.name}", schema_content.get("meta").get("name"))
            f.write(s)


def copy_libs():
    libs = ["splunktaucclib", "solnlib", "splunklib"]

    for lib in libs:
        copy_directory(
            basedir + "/" + lib,
            basedir + "/output/" + schema_content.get("meta").get("name") + "/bin/" + lib
        )


def copy_res():
    shutil.copy(
        basedir + "/res/app.conf",
        basedir + "/output/" + schema_content.get("meta").get("name") + "/default"
    )
    shutil.copy(
        basedir + "/res/inputs_01.py",
        basedir + "/output/" + schema_content.get("meta").get("name") + "/bin"
    )
    shutil.copy(
        basedir + "/res/inputs_02.py",
        basedir + "/output/" + schema_content.get("meta").get("name") + "/bin"
    )


def copy_global_config():
    shutil.copy(
        root_path + "/globalConfig.json",
        basedir + "/output/" + schema_content.get("meta").get("name") + "/appserver/static/js/build"
    )


generate_rest()
generate_ui()
copy_libs()
replace_token()
copy_res()
copy_global_config()
