import shutil
import errno
import json
import os
import subprocess
from StringIO import StringIO


from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from uccrestbuilder.global_config import GlobalConfigSchema
from uccrestbuilder import build

_input_template = '''
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


def add_modular_input():
    services = schema_content.get("pages").get("inputs").get("services")
    for service in services:
        input_name = service.get("name")
        class_name = input_name.upper()
        description = service.get("title")
        entity = service.get("entity")
        argument_list = []
        field_white_list = ["name", "index"]
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
        content = _input_template.format(
            input_name=input_name,
            class_name=class_name,
            description=description,
            argument_list=indent(argument_lines, spaces=0)
        )
        input_file_name = basedir + "/output/" + schema_content.get("meta").get("name") + "/bin/" + input_name + ".py"
        with open(input_file_name, "w") as input_file:
            input_file.write(content)


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
add_modular_input()
