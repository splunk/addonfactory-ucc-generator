import shutil
import errno
import json
import os
import subprocess

from uccrestbuilder.global_config import GlobalConfigBuilderSchema, GlobalConfigPostProcessor
from uccrestbuilder import build
from jinja2 import Environment, FileSystemLoader


basedir = os.path.dirname(os.path.abspath(__file__))
top_dir = os.path.dirname(basedir)
j2_env = Environment(loader=FileSystemLoader(top_dir))

# read schema from globalConfig.json
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(root_path, 'globalConfig.json')) as f:
    json_schema = ''.join([l for l in f])

schema_content = json.loads(json_schema)
scheme = GlobalConfigBuilderSchema(schema_content)
ta_name = schema_content.get("meta").get("name")
ta_namespace = schema_content.get("meta").get("restRoot")
import_declare_name = 'import_declare_test'


def clean_before_build():
    shutil.rmtree(os.path.join(basedir, 'output'), ignore_errors=True)


def generate_rest():
    build(
        scheme,
        'splunktaucclib.rest_handler.admin_external.AdminExternalHandler',
        os.path.join('.', 'output', ta_name),
        post_process=GlobalConfigPostProcessor(),
        import_declare_name=import_declare_name
    )


def copy_directory(src, dest):
    try:
        shutil.copytree(src, dest)
    except OSError as exc:
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dest)
        else:
            print 'Directory %s not copied. Error: %s' % (src, exc)


def generate_ui():
    subprocess.call("cd ../UCC-UI-lib;npm run build", shell=True)
    ui_lib_dir = os.path.join(os.path.dirname(basedir), 'UCC-UI-lib', 'build')

    # copy appserver folder
    copy_directory(
            os.path.join(ui_lib_dir, 'appserver'),
            os.path.join(basedir, 'output', ta_name, 'appserver')
        )

    # copy locale folder
    copy_directory(
        os.path.join(ui_lib_dir, 'locale'),
        os.path.join(basedir, 'output', ta_name, 'locale')
    )

    # copy default/data folder
    copy_directory(
        os.path.join(ui_lib_dir, 'default', 'data'),
        os.path.join(basedir, 'output', ta_name, 'default', 'data')
    )


def replace_token():
    # replace token in template
    views = ["inputs.xml", "configuration.xml"]
    for view in views:
        template_dir = os.path.join(
            basedir,
            'output',
            ta_name,
            'default/data/ui/views'
        )
        with open(os.path.join(template_dir, view)) as f:
            s = f.read()

        # Safely write the changed content, if found in the file
        with open(template_dir + "/" + view, 'w') as f:
            s = s.replace("${package.name}", ta_name)
            f.write(s)


def copy_libs():
    libs = ["splunktaucclib", "solnlib", "splunklib"]

    for lib in libs:
        lib_dest = os.path.join(
            'output',
            ta_name,
            'bin',
            ta_namespace,
            lib
        )
        copy_directory(
            os.path.join(basedir, lib),
            lib_dest
        )


def copy_res():
    shutil.copy(
        os.path.join(basedir, 'res/app.conf'),
        os.path.join(basedir, 'output', ta_name, 'default')
    )


def add_modular_input():
    services = schema_content.get("pages").get("inputs").get("services")
    for service in services:
        input_name = service.get("name")
        class_name = input_name.upper()
        description = service.get("title")
        entity = service.get("entity")
        field_white_list = ["name", "index", "sourcetype"]
        # filter fields in white list
        entity = filter(lambda x: x.get("field") not in field_white_list, entity)
        import_declare = 'import ' + import_declare_name

        content = j2_env.get_template(os.path.join('templates', 'input.template')).render(
            import_declare=import_declare,
            input_name=input_name,
            class_name=class_name,
            description=description,
            entity=entity
        )
        input_file_name = os.path.join(
            basedir,
            'output',
            ta_name,
            'bin',
            input_name + '.py'
        )
        with open(input_file_name, "w") as input_file:
            input_file.write(content)


def copy_global_config():
    shutil.copy(
        os.path.join(root_path, 'globalConfig.json'),
        os.path.join(basedir, 'output', ta_name, 'appserver/static/js/build')
    )


def move_local_to_default():
    local_dir = os.path.join(
        basedir,
        'output',
        ta_name,
        'local'
    )
    default_dir = os.path.join(
        basedir,
        'output',
        ta_name,
        'default'
    )
    # copy from local to default
    for conf in os.listdir(local_dir):
        shutil.copy(os.path.join(local_dir, conf), default_dir)

    # remove local
    shutil.rmtree(local_dir, ignore_errors=True)


def add_executable_attr_to_files_under_bin():
    # add executable permission to files under bin folder
    bin_path = os.path.join(
        basedir,
        'output',
        ta_name,
        'bin'
    )
    subprocess.check_output('chmod -R +x ' + bin_path, shell=True)


clean_before_build()
generate_rest()
generate_ui()
copy_libs()
replace_token()
copy_res()
copy_global_config()
add_modular_input()
move_local_to_default()
add_executable_attr_to_files_under_bin()
