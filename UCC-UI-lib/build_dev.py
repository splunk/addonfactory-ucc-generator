import shutil
import errno
import json
import os
import subprocess
from StringIO import StringIO

from uccrestbuilder.global_config import GlobalConfigBuilderSchema, GlobalConfigPostProcessor
from uccrestbuilder import build

_input_template = '''
{import_declare}
import sys
import json

from splunklib import modularinput as smi


class {class_name}(smi.Script):

    def __init__(self):
        super({class_name}, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('{input_name}')
        scheme.description = '{description}'
        scheme.use_external_validation = True
        scheme.streaming_mode_xml = True
        scheme.use_single_instance = True

        scheme.add_argument(
            smi.Argument(
                'name',
                title='Name',
                description='Name',
                required_on_create=True
            )
        )
        {argument_list}
        return scheme

    def validate_input(self, definition):
        return

    def stream_events(self, inputs, ew):
        input_items = [{{'count': len(inputs.inputs)}}]
        for input_name, input_item in inputs.inputs.iteritems():
            input_item['name'] = input_name
            input_items.append(input_item)
        event = smi.Event(
            data=json.dumps(input_items),
            sourcetype='{input_name}',
        )
        ew.write_event(event)

if __name__ == '__main__':
    exit_code = {class_name}().run(sys.argv)
    sys.exit(exit_code)
'''

_argument_template = '''
        scheme.add_argument(
            smi.Argument(
                '{field}',
                required_on_create={required},
            )
        )
'''


basedir = os.path.dirname(os.path.abspath(__file__))

# read schema from globalConfig.json
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(root_path, 'globalConfig.json')) as f:
    json_schema = ''.join([l for l in f])

schema_content = json.loads(json_schema)
scheme = GlobalConfigBuilderSchema(schema_content)
ta_name = schema_content.get("meta").get("name")
ta_namespace = schema_content.get("meta").get("restRoot")
import_declare_name = 'import_declare_test'


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
            print 'Directory %s not copied. Error: %s' % (src, exc)


def indent(lines, spaces=1):
    """
    Indent code block.

    :param lines:
    :type lines: str
    :param spaces: times of four
    :return:
    """
    string_io = StringIO(lines)
    indentation = spaces * 4
    prefix = ' ' * indentation
    lines = []
    for line in string_io:
        if line != '\n':
            line = prefix + line
        lines.append(line)
    return ''.join(lines)


def copy_libs():
    libs = ["splunktaucclib", "solnlib", "splunklib"]

    for lib in libs:
        lib_dest = os.path.join(
            'build',
            'bin',
            ta_namespace,
            lib
        )
        copy_directory(
            os.path.join(basedir, lib),
            lib_dest
        )


def add_modular_input():
    services = schema_content.get("pages").get("inputs").get("services")
    for service in services:
        input_name = service.get("name")
        class_name = input_name.upper()
        description = service.get("title")
        entity = service.get("entity")
        argument_list = []
        field_white_list = ["name", "index", "sourcetype"]
        for ent in entity:
            if ent.get("field") in field_white_list:
                continue
            if ent.get("required"):
                argument_list.append(_argument_template.format(
                    field=ent.get("field"),
                    required=True
                ))
            else:
                argument_list.append(_argument_template.format(
                    field=ent.get("field"),
                    required=False
                ))
        argument_lines = ''.join(argument_list)
        import_declare = 'import ' + import_declare_name
        content = _input_template.format(
            import_declare=import_declare,
            input_name=input_name,
            class_name=class_name,
            description=description,
            argument_list=indent(argument_lines, spaces=0)
        )
        input_file_name = os.path.join(
            basedir,
            'build',
            'bin',
            input_name + '.py'
        )
        with open(input_file_name, "w") as input_file:
            input_file.write(content)


generate_rest()
copy_libs()
add_modular_input()
