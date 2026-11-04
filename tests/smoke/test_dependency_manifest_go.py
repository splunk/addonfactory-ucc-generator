"""Inspect real cross-built binaries without executing foreign code."""

import os
import shutil
import subprocess

import pytest

from splunk_add_on_ucc_framework.dependency_manifest import collect_go


def test_go_cross_platform_binary_inventory(tmp_path):
    go = shutil.which("go")
    if not go:
        if os.environ.get("UCC_REQUIRE_GO_TEST") == "1":
            pytest.fail(
                "The targeted Go inventory gate requires an installed Go toolchain"
            )
        pytest.skip("Go is not installed")
    assert go is not None
    (tmp_path / "go.mod").write_text(
        "module example.com/ucc-inventory-test\n\ngo 1.20\n\nrequire github.com/zeebo/xxh3 v1.0.2\n"
    )
    (tmp_path / "main.go").write_text(
        'package main\nimport ("fmt"; "github.com/zeebo/xxh3")\n'
        'func main() { fmt.Println(xxh3.HashString("ucc")) }\n'
    )
    output = tmp_path / "addon"
    output.mkdir()
    subprocess.run([go, "mod", "tidy"], cwd=tmp_path, check=True, capture_output=True)
    for system in ("linux", "darwin", "windows"):
        environment = dict(os.environ, CGO_ENABLED="0", GOOS=system, GOARCH="amd64")
        subprocess.run(
            [go, "build", "-o", str(output / f"program-{system}"), "."],
            cwd=tmp_path,
            env=environment,
            check=True,
            capture_output=True,
        )
    rows = collect_go(output)
    modules = [row for row in rows if row.name == "github.com/zeebo/xxh3"]
    assert {row.version for row in modules} == {"v1.0.2"}
    assert {row.target["GOOS"] for row in modules if row.target} == {
        "linux",
        "darwin",
        "windows",
    }
    assert len({row.path for row in modules}) == 3
