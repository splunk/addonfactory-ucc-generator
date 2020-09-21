from __future__ import print_function
import shutil
import errno
import json
import os
from jinja2 import Environment, FileSystemLoader

from uccrestbuilder.global_config import GlobalConfigBuilderSchema, GlobalConfigPostProcessor
from uccrestbuilder import build


basedir = os.path.dirname(os.path.abspath(__file__))
top_dir = os.path.dirname(basedir)

# jinja2 environment
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
    shutil.rmtree(os.path.join(basedir, 'build'), ignore_errors=True)


def generate_rest():
    build(
        scheme,
        'splunktaucclib.rest_handler.admin_external.AdminExternalHandler',
        os.path.join('.', 'build'),
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
            print('Directory %s not copied. Error: %s' % (src, exc))


def add_modular_input():
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

        content = j2_env.get_template(os.path.join('templates', 'input.template')).render(
            import_declare=import_declare,
            input_name=input_name,
            class_name=class_name,
            description=description,
            entity=entity
        )
        input_file_name = os.path.join(
            basedir,
            'build',
            'bin',
            input_name + '.py'
        )
        with open(input_file_name, "w") as input_file:
            input_file.write(content)


clean_before_build()
generate_rest()
add_modular_input()
