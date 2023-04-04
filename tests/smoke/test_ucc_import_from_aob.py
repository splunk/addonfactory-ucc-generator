import os
import tarfile
from splunk_add_on_ucc_framework.commands import import_from_aob
from splunk_add_on_ucc_framework.commands import build


def test_ucc_import_from_aob():
    """
    This is a very high-level test just to verify that the script is running
    until the end and the result folder is "ucc-gen-able".
    The archive that exists in `tests/smoke` folder is downloaded from
    Splunkbase directly and moved to this folder, so it will be easier to
    execute tests.
    """
    with tarfile.open("dynatrace-add-on-for-splunk_122.tgz", "r:gz") as tar:
        tar.extractall()
    import_from_aob.import_from_aob("Splunk_TA_Dynatrace")
    build.generate(source=os.path.join("Splunk_TA_Dynatrace_ucc", "package"))
