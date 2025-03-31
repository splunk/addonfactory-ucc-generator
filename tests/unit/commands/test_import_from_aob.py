import os
import tarfile
import shutil
import pytest
import json
import collections
from splunk_add_on_ucc_framework.commands import import_from_aob
from splunk_add_on_ucc_framework import app_manifest as am


@pytest.mark.parametrize(
    "app_manifest",
    [
        (
            "app.manifest_incorrect_schema_version",
            am.APP_MANIFEST_TARGET_WORKLOADS,
            am.APP_MANIFEST_SUPPORTED_DEPLOYMENTS,
        ),
        (
            "app.manifest_with_comments",
            am.APP_MANIFEST_TARGET_WORKLOADS,
            ["_standalone", "_distributed"],
        ),
        (
            "app.manifest_no_supported_deplyments",
            ["_indexers"],
            am.APP_MANIFEST_SUPPORTED_DEPLOYMENTS,
        ),
    ],
)
class TestImportFromAob:
    test_root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    aob_addon_path = os.path.join(test_root_path, "Splunk_TA_Dynatrace")
    ucc_addon_path = os.path.join(test_root_path, "Splunk_TA_Dynatrace_ucc")
    ucc_app_manifest_path = os.path.join(ucc_addon_path, "package", "app.manifest")
    test_files = os.path.abspath(os.path.join(test_root_path, "testdata"))

    @classmethod
    def setup_class(cls):
        aob_addon_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "..",
                "..",
                "smoke",
                "dynatrace-add-on-for-splunk_214_modified.tar.gz",
            )
        )
        with tarfile.open(aob_addon_path, "r:gz") as tar:
            tar.extractall()

    @classmethod
    def teardown_class(cls):
        pass

    def setup_method(self):
        pass

    def teardown_method(self):
        shutil.rmtree(self.ucc_addon_path)

    def test_import_from_aob_invalid_app_manifest(self, app_manifest):
        with open(os.path.join(self.test_files, app_manifest[0])) as f:
            data = f.read()

        with open(os.path.join(self.aob_addon_path, "app.manifest"), "w") as f:
            f.write(data)

        import_from_aob.import_from_aob("Splunk_TA_Dynatrace")
        app_manifest_data = json.loads(open(self.ucc_app_manifest_path).read())
        target_wl = app_manifest_data.get("targetWorkloads")
        supp_dep = app_manifest_data.get("supportedDeployments")

        assert app_manifest_data["schemaVersion"] == "2.0.0"
        assert app_manifest_data["supportedDeployments"] is not None
        assert app_manifest_data["targetWorkloads"] is not None

        assert collections.Counter(target_wl) == collections.Counter(app_manifest[1])
        assert collections.Counter(supp_dep) == collections.Counter(app_manifest[2])
