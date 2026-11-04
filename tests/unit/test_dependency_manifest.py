from pathlib import Path

import pytest

from splunk_add_on_ucc_framework.dependency_manifest import (
    InventoryError,
    collect_python,
    collect_go,
    parse_go_info,
    collect_frontend,
    write_manifest,
    snapshot_inputs,
)
from splunk_add_on_ucc_framework.global_config import OSDependentLibraryConfig


def write_dist_info(root, relative_dir, name, version, tags):
    folder = root / "lib" / relative_dir / f"{name}-{version}.dist-info"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "METADATA").write_text(
        f"Metadata-Version: 2.1\nName: {name}\nVersion: {version}\n"
    )
    if tags is not None:
        (folder / "WHEEL").write_text(
            "Wheel-Version: 1.0\n" + "".join(f"Tag: {tag}\n" for tag in tags)
        )
    return folder


def target(
    os="windows",
    platform="win_amd64",
    python="3.9.20",
    name="cffi",
    version="2.0.0",
    path=None,
):
    return OSDependentLibraryConfig(
        name=name,
        version=version,
        platform=platform,
        python_version=python,
        target=path or f"3rdparty/{os}",
        os=os,
        deps_flag="",
    )


def test_final_python_variants(tmp_path):
    configs = [
        target("darwin", "macosx_10_12_x86_64", version="1.17.1"),
        target("linux", "manylinux2014_x86_64"),
        target(),
    ]
    tags = [
        "cp39-cp39-macosx_10_9_x86_64",
        "cp39-cp39-manylinux_2_17_x86_64",
        "cp39-cp39-win_amd64",
    ]
    for config, tag in zip(configs, tags):
        write_dist_info(tmp_path, config.target, "cffi", config.version, [tag])
        write_dist_info(tmp_path, config.target, "pycparser", "2.23", ["py3-none-any"])
    write_dist_info(tmp_path, "", "Python_Dateutil", "2.9.0.post0", None)

    rows = collect_python(tmp_path, configs, "3.9.20")

    assert {
        (r.name, r.version, r.target["os"])
        for r in rows
        if r.name == "cffi" and r.target is not None
    } == {
        ("cffi", "1.17.1", "darwin"),
        ("cffi", "2.0.0", "linux"),
        ("cffi", "2.0.0", "windows"),
    }
    assert len([r for r in rows if r.name == "pycparser"]) == 3
    common = next(r for r in rows if r.name == "python-dateutil")
    assert common.target is not None
    assert common.target["placement"] == "common"
    assert "os" not in common.target
    assert Path(common.path).as_posix().startswith("lib/")
    assert len(common.sha256) == 64


@pytest.mark.parametrize(
    "missing", ["directory", "name", "version", "wheel", "metadata"]
)
def test_missing_configured_distribution(tmp_path, missing):
    config = target()
    if missing != "directory":
        folder = write_dist_info(
            tmp_path,
            config.target,
            "other" if missing == "name" else "cffi",
            "1.0.0" if missing == "version" else "2.0.0",
            None if missing == "wheel" else ["cp39-cp39-win_amd64"],
        )
        if missing == "metadata":
            (folder / "METADATA").unlink()
    with pytest.raises(InventoryError):
        collect_python(tmp_path, [config], "3.9.20")


@pytest.mark.parametrize(
    "platform,tag,accepted",
    [
        ("win_amd64", "cp37-abi3-win_amd64", True),
        ("win_amd64", "py3-none-any", True),
        ("macosx_10_12_x86_64", "cp39-cp39-macosx_10_9_x86_64", True),
        ("macosx_10_12_x86_64", "cp37-abi3-macosx_10_9_universal2", True),
        ("manylinux2014_x86_64", "cp39-cp39-manylinux_2_17_x86_64", True),
        ("manylinux_2_17_x86_64", "cp39-cp39-manylinux2014_x86_64", True),
        ("manylinux2014_x86_64", "cp39-cp39-win_amd64", False),
        ("win_amd64", "cp313-cp313-win_amd64", False),
    ],
)
def test_foreign_wheel_compatibility(tmp_path, platform, tag, accepted):
    config = target(platform=platform)
    write_dist_info(tmp_path, config.target, "cffi", "2.0.0", [tag])
    if accepted:
        assert len(collect_python(tmp_path, [config], "3.13.5")) == 1
    else:
        with pytest.raises(InventoryError, match="incompatible"):
            collect_python(tmp_path, [config], "3.13.5")


@pytest.mark.parametrize(
    "version,tag", [("37", "cp37-cp37m-win_amd64"), ("3.9.20", "cp39-cp39-win_amd64")]
)
def test_python_version_forms(tmp_path, version, tag):
    config = target(python=version)
    write_dist_info(tmp_path, config.target, "cffi", "2.0.0", [tag])
    assert len(collect_python(tmp_path, [config], "3.13.5")) == 1


def test_shared_target_roots(tmp_path):
    config = target()
    other = target(name="pycparser", version="2.23")
    write_dist_info(tmp_path, config.target, "cffi", "2.0.0", ["cp39-cp39-win_amd64"])
    write_dist_info(tmp_path, other.target, "pycparser", "2.23", ["py3-none-any"])
    assert len(collect_python(tmp_path, [config, other], "3.9.20")) == 2
    with pytest.raises(InventoryError, match="Conflicting"):
        collect_python(tmp_path, [config, target(python="3.13")], "3.9.20")


def test_deepest_configured_target(tmp_path):
    outer = target(path="3rdparty")
    inner = target(path="3rdparty/nested", name="pycparser", version="2.23")
    write_dist_info(tmp_path, outer.target, "cffi", "2.0.0", ["py3-none-any"])
    write_dist_info(tmp_path, inner.target, "pycparser", "2.23", ["py3-none-any"])
    rows = collect_python(tmp_path, [outer, inner], "3.9.20")
    assert len(rows) == 2
    assert all(row.target and row.target["placement"] == "platform" for row in rows)


GO_INFO = """/tmp/program: go1.24.3
    path\tcompany.example/program
    mod\tcompany.example/program\t(devel)
    dep\tgithub.com/zeebo/xxh3\tv1.0.2\th1:checksum
    dep\texample.com/original\tv1.0.0\th1:original
    =>\texample.com/replacement\tv1.1.0\th1:replacement
    build\tGOOS=linux
    build\tGOARCH=amd64
"""


def test_go_records_and_replacements():
    rows = parse_go_info(GO_INFO, "bin/program", "a" * 64)
    assert [(r.name, r.version) for r in rows] == [
        ("github.com/zeebo/xxh3", "v1.0.2"),
        ("example.com/replacement", "v1.1.0"),
    ]
    assert all(r.path == "bin/program" and r.sha256 == "a" * 64 for r in rows)
    assert rows[1].target == {
        "toolchain": "go1.24.3",
        "GOOS": "linux",
        "GOARCH": "amd64",
        "replaces": {"name": "example.com/original", "version": "v1.0.0"},
    }


@pytest.mark.parametrize(
    "text",
    [
        "/tmp/program: go1.24.3\n",
        "not Go module data",
        GO_INFO.replace("example.com/replacement\tv1.1.0", "../local\t(devel)"),
    ],
)
def test_unreadable_or_unversioned_go_info(text):
    with pytest.raises(InventoryError):
        parse_go_info(text, "bin/program", "a" * 64)


def write_go_binary(root, name, header=b"\x7fELF"):
    binary = root / "bin" / name
    binary.parent.mkdir(parents=True, exist_ok=True)
    binary.write_bytes(header + b"\0" * 32 + b"\xff Go buildinf:" + b"fixture")
    return binary


@pytest.mark.parametrize("header", [b"\x7fELF", b"MZ", b"\xcf\xfa\xed\xfe"])
def test_go_detection(tmp_path, monkeypatch, header):
    import subprocess
    from splunk_add_on_ucc_framework import dependency_manifest as inventory

    binaries = [
        write_go_binary(tmp_path, "first", header),
        write_go_binary(tmp_path, "second", header),
    ]
    (tmp_path / "go.mod").write_text("require github.com/zeebo/xxh3 v9.0.0")
    monkeypatch.setattr(inventory.shutil, "which", lambda name: "/tool/go")
    calls = []

    def run(argv, **kwargs):
        calls.append(argv)
        return subprocess.CompletedProcess(argv, 0, GO_INFO, "")

    monkeypatch.setattr(inventory.subprocess, "run", run)
    rows = collect_go(tmp_path)
    assert len(rows) == 4
    assert {r.path for r in rows} == {"bin/first", "bin/second"}
    assert all(r.version != "v9.0.0" for r in rows)
    assert calls == [["/tool/go", "version", "-m", str(binary)] for binary in binaries]


def test_no_go_does_not_require_tooling(tmp_path, monkeypatch):
    from splunk_add_on_ucc_framework import dependency_manifest as inventory

    (tmp_path / "readme").write_text("Go buildinf: is not a binary")
    monkeypatch.setattr(
        inventory.shutil, "which", lambda name: pytest.fail("Go lookup unnecessary")
    )
    assert collect_go(tmp_path) == []


def test_missing_go_tool(tmp_path, monkeypatch):
    from splunk_add_on_ucc_framework import dependency_manifest as inventory

    write_go_binary(tmp_path, "program")
    monkeypatch.setattr(inventory.shutil, "which", lambda name: None)
    with pytest.raises(InventoryError, match="Go"):
        collect_go(tmp_path)


def frontend_chunk(root, file="entry_page.js", packages=None, producer="ucc-ui"):
    import hashlib
    import json

    directory = root / "appserver/static/js/build"
    path = directory / file
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("console.log('shipped');\n")
    fragment = path.parent / "dependency-chunks.json"
    record = {
        "path": path.name,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "packages": (
            packages if packages is not None else [{"name": "used", "version": "1.0.0"}]
        ),
    }
    if fragment.exists():
        data = json.loads(fragment.read_text())
        data["chunks"].append(record)
    else:
        data = {"schema_version": 1, "producer": producer, "chunks": [record]}
    fragment.write_text(json.dumps(data))
    return path


def identity(root, name="Splunk_TA_Test", version="1.0.0"):
    import json

    (root / "app.manifest").write_text(
        json.dumps({"info": {"id": {"name": name, "version": version}}})
    )


def test_final_frontend_reconciliation(tmp_path):
    retained = frontend_chunk(tmp_path)
    removed = frontend_chunk(
        tmp_path,
        "Dashboard.omitted.js",
        [{"name": "dashboard-only", "version": "1.0.0"}],
    )
    removed.unlink()
    rows = collect_frontend(tmp_path, "Splunk_TA_Test", "1.0.0")
    assert [(row.name, row.version) for row in rows] == [("used", "1.0.0")]
    retained.write_text("overwritten custom context entry")
    with pytest.raises(InventoryError, match="hash"):
        collect_frontend(tmp_path, "Splunk_TA_Test", "1.0.0")


@pytest.mark.parametrize("oauth", [True, False])
def test_oauth_redirect_evidence(tmp_path, oauth):
    directory = tmp_path / "appserver/static/js/build"
    directory.mkdir(parents=True)
    if oauth:
        (directory / "splunk_ta_test_redirect_page.1.0.0.js").write_text(
            "own generated code"
        )
    assert collect_frontend(tmp_path, "Splunk_TA_Test", "1.0.0") == []
    (directory / "redirect_page.js").write_text("unrecognized leftover")
    with pytest.raises(InventoryError, match="record"):
        collect_frontend(tmp_path, "Splunk_TA_Test", "1.0.0")


def test_custom_code_still_needs_a_record(tmp_path):
    path = frontend_chunk(tmp_path, "custom/own.js", [])
    assert collect_frontend(tmp_path, "Splunk_TA_Test", "1.0.0") == []
    path.with_name("dependency-chunks.json").unlink()
    with pytest.raises(InventoryError, match="record"):
        collect_frontend(tmp_path, "Splunk_TA_Test", "1.0.0")


def test_manifest_merges_occurrences_and_preserves_versions(tmp_path):
    import json

    identity(tmp_path)
    frontend_chunk(tmp_path)
    frontend_chunk(tmp_path, "custom/second.js", producer="custom-ui")
    frontend_chunk(
        tmp_path, "custom/third.js", [{"name": "used", "version": "2.0.0"}], "custom-ui"
    )
    write_dist_info(tmp_path, "", "Python_Dateutil", "2.9.0.post0", ["py3-none-any"])
    result = json.loads(
        write_manifest(tmp_path, "Splunk_TA_Test", "1.0.0", [], "3.9.20").read_text()
    )
    assert [
        (c["ecosystem"], c["name"], c["version"]) for c in result["components"]
    ] == [
        ("npm", "used", "1.0.0"),
        ("npm", "used", "2.0.0"),
        ("pypi", "python-dateutil", "2.9.0.post0"),
    ]
    assert len(result["components"][0]["occurrences"]) == 2
    assert result["inputs"] == snapshot_inputs(tmp_path)
    assert "app.manifest" in result["inputs"]


def test_manifest_is_deterministic(tmp_path):
    import shutil

    first, second = tmp_path / "first", tmp_path / "second"
    first.mkdir()
    identity(first)
    frontend_chunk(first)
    shutil.copytree(first, second)
    one = write_manifest(first, "Splunk_TA_Test", "1.0.0", [], "3.9.20").read_bytes()
    two = write_manifest(second, "Splunk_TA_Test", "1.0.0", [], "3.9.20").read_bytes()
    assert one == two
    assert str(tmp_path).encode() not in one
    assert one.endswith(b"\n")


def test_manifest_rejects_different_archive_identity(tmp_path):
    identity(tmp_path, version="2.0.0")
    with pytest.raises(InventoryError, match="identity"):
        write_manifest(tmp_path, "Splunk_TA_Test", "1.0.0", [], "3.9.20")
