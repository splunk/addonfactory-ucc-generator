import splunk

try:
    from splunk.clilib.bundle_paths import make_splunkhome_path
except ImportError:
    from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path

def get_inputcsv_path(filename=None):
    # Return a version-specific path for use with "inputcsv" and "outputcsv"
    # search commands.

    GALAXY = [6, 4]
    version = [int(i) for i in splunk.getReleaseVersion().split(".")[0:2]]

    components = ['var', 'run', 'splunk', 'csv']
    if version < GALAXY:
        components.remove('csv')
    if filename:
        components.append(filename)

    return make_splunkhome_path(components)


