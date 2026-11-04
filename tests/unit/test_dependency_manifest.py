from pathlib import Path

import pytest

from splunk_add_on_ucc_framework.dependency_manifest import (
    InventoryError,
    collect_python,
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
