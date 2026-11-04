import os
import tempfile

import pytest

from splunk_add_on_ucc_framework.commands import build
from splunk_add_on_ucc_framework.commands import init
from splunk_add_on_ucc_framework.commands import package


def test_ucc_package():
    """
    Checks the complete from initializing the add-on, building it and then packaging it.
    """
    addon_name = "init_addon_for_ucc_package"
    generated_addon_path = init.init(
        addon_name,
        "Demo Add-on for Splunk",
        "demo_input",
        "1.0.0",
        overwrite=True,
    )
    with tempfile.TemporaryDirectory() as temp_dir_for_build:
        build.generate(
            os.path.join(generated_addon_path, "package"),
            os.path.join(generated_addon_path, "globalConfig.json"),
            "1.0.0",
            output_directory=temp_dir_for_build,
        )

        path_to_built_addon = os.path.join(
            temp_dir_for_build,
            addon_name,
        )
        with tempfile.TemporaryDirectory() as temp_dir_for_package:
            package.package(path_to_built_addon, output_directory=temp_dir_for_package)

            found_files = os.listdir(temp_dir_for_package)
            if "init_addon_for_ucc_package-1.0.0.tar.gz" not in found_files:
                assert False, "No archive found where it should be"


@pytest.mark.parametrize(
    "mutation", ["chunk", "add_metadata", "remove_metadata", "wheel", "go", "identity"]
)
def test_package_verifies_inventory_inputs(tmp_path, mutation):
    from tests.unit.test_dependency_manifest import (
        frontend_chunk,
        identity,
        write_dist_info,
        write_go_binary,
    )
    from splunk_add_on_ucc_framework.dependency_manifest import write_manifest

    root = tmp_path / "addon"
    root.mkdir()
    identity(root)
    chunk = frontend_chunk(root)
    metadata = write_dist_info(root, "", "kept", "1.0.0", ["py3-none-any"])
    write_manifest(root, "Splunk_TA_Test", "1.0.0", [], "3.9.20")
    if mutation == "chunk":
        chunk.write_text("changed")
    elif mutation == "add_metadata":
        write_dist_info(root, "", "new", "1.0.0", ["py3-none-any"])
    elif mutation == "remove_metadata":
        (metadata / "METADATA").unlink()
    elif mutation == "wheel":
        (metadata / "WHEEL").write_text("Tag: cp313-cp313-win_amd64\n")
    elif mutation == "go":
        write_go_binary(root, "new-go-program")
    else:
        identity(root, version="2.0.0")
    archive_directory = tmp_path / "archives"
    archive_directory.mkdir()
    with pytest.raises(SystemExit) as error:
        package.package(str(root), str(archive_directory))
    assert error.value.code == 1
    assert not list(archive_directory.iterdir())


@pytest.mark.parametrize("legacy", [False, True])
def test_package_legacy_directory_and_matching_inventory(tmp_path, legacy):
    import json
    import tarfile
    from tests.unit.test_dependency_manifest import frontend_chunk, identity
    from splunk_add_on_ucc_framework.dependency_manifest import write_manifest

    root = tmp_path / "addon"
    root.mkdir()
    identity(root)
    if not legacy:
        frontend_chunk(root)
        write_manifest(root, "Splunk_TA_Test", "1.0.0", [], "3.9.20")
    package.package(str(root), str(tmp_path))
    with tarfile.open(tmp_path / "Splunk_TA_Test-1.0.0.tar.gz") as archive:
        name = "Splunk_TA_Test/dependency-manifest.json"
        assert (name in archive.getnames()) is (not legacy)
        if not legacy:
            stream = archive.extractfile(name)
            assert stream is not None
            assert json.load(stream) == json.loads(
                (root / "dependency-manifest.json").read_text()
            )


def test_package_ignores_documentation_changes(tmp_path):
    from tests.unit.test_dependency_manifest import identity
    from splunk_add_on_ucc_framework.dependency_manifest import write_manifest

    identity(tmp_path)
    write_manifest(tmp_path, "Splunk_TA_Test", "1.0.0", [], "3.9.20")
    (tmp_path / "README.txt").write_text("Documentation changed after build")
    archive_directory = tmp_path / "archives"
    archive_directory.mkdir()
    package.package(str(tmp_path), str(archive_directory))
    assert (archive_directory / "Splunk_TA_Test-1.0.0.tar.gz").exists()
