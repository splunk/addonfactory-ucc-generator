import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

import pytest


@pytest.fixture(scope="session")
def ucc_build():
    tmp_dir = tempfile.mkdtemp()
    subprocess.check_call(["poetry", "build", "-o", tmp_dir])

    yield Path(tmp_dir)

    shutil.rmtree(tmp_dir)


@pytest.fixture(scope="session")
def ucc_wheel(ucc_build: Path) -> Path:
    return next(ucc_build.glob("splunk_add_on_ucc_framework-*.whl"))


def test_build_package_check_ui_files(tmp_path, ucc_wheel):
    files_to_check = [
        "NOTICE",
        "splunk_add_on_ucc_framework/package/appserver/static/js/build/entry_page.js",
        "splunk_add_on_ucc_framework/package/appserver/static/js/build/redirect_page.js",
    ]

    wheel_dir = tmp_path / "wheel"

    with zipfile.ZipFile(ucc_wheel) as zp:
        zp.extractall(path=wheel_dir)
    for file in files_to_check:
        assert (wheel_dir / file).exists(), f"{file} not found in the package"
