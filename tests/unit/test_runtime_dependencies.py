# Copyright 2026 Splunk Inc.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
import importlib.machinery
import importlib.metadata
import json
import platform
import subprocess
import sys
from types import SimpleNamespace
from dataclasses import asdict
from pathlib import Path
from typing import Any

import pytest

from splunk_add_on_ucc_framework import main
from splunk_add_on_ucc_framework import runtime_dependencies as deps
from splunk_add_on_ucc_framework.global_config import GlobalConfig


HASH = "a" * 64


def config(profiles=None, **meta):
    if profiles is None:
        profiles = [
            {
                "name": "linux39",
                "python_version": "3.9.20",
                "os": "linux",
                "platform": "manylinux2014_x86_64",
            }
        ]
    return GlobalConfig({"meta": {"dependencyProfiles": profiles, **meta}}, False)


@pytest.fixture
def source(tmp_path):
    package = tmp_path / "package"
    (package / "lib").mkdir(parents=True)
    (tmp_path / "pyproject.toml").write_text("[tool.poetry]\n")
    (tmp_path / "poetry.lock").write_text("lock content\n")
    return package


def write_lock(source, configuration=None, exported=None):
    configuration = configuration or config()
    profiles = deps.profiles_from_config(configuration)
    exported = exported or f"probe==1.0 --hash=sha256:{HASH}"
    lock = {
        "version": 1,
        "fingerprint": deps._fingerprint(source, profiles),
        "profiles": [
            {
                "configuration": asdict(profile),
                "requirements": deps.select_requirements(exported, profile),
            }
            for profile in profiles
        ],
    }
    (source / "lib" / deps.LOCK_NAME).write_text(json.dumps(lock))
    return lock


def test_selects_complete_graph_by_python_and_os():
    exported = f"""urllib3==2.6.3 ; python_version < "3.10" \\
        --hash=sha256:{HASH}
urllib3==2.7.0 ; python_version >= "3.13" --hash=sha256:{HASH}
azure-core==1.0 --hash=sha256:{HASH}
windows-only==1.0 ; sys_platform == "win32" --hash=sha256:{HASH}
"""
    linux = deps.profiles_from_config(config())[0]
    windows = deps.DependencyProfile("windows313", "3.13.4", "windows", "win_amd64")
    old = deps.select_requirements(exported, linux)
    new = deps.select_requirements(exported, windows)
    assert {row["name"]: row["version"] for row in old} == {
        "azure-core": "1.0",
        "urllib3": "2.6.3",
    }
    assert {row["name"]: row["version"] for row in new} == {
        "azure-core": "1.0",
        "urllib3": "2.7.0",
        "windows-only": "1.0",
    }
    assert all(";" not in row["requirement"] for row in old + new)


@pytest.mark.parametrize(
    "requirement",
    [
        "urllib3>=2",
        "urllib3==2.*",
        "urllib3==2.0",
        "urllib3 @ git+https://example.invalid/repo",
        "--extra-index-url https://example.invalid",
        f"urllib3==2.0 --hash=md5:{HASH}",
    ],
)
def test_rejects_unfrozen_or_executable_exports(requirement):
    with pytest.raises(deps.DependencyProfileError):
        deps.select_requirements(requirement, deps.profiles_from_config(config())[0])


@pytest.mark.parametrize(
    "change",
    [
        {"name": "../outside"},
        {"python_version": "3.13"},
        {"os": "windows"},
        {"platform": "manylinux2014_unknown"},
        {"provided": "requests"},
        {"provided": ["requests>=2"]},
        {"minimum_openssl": "old"},
        {"unexpected": True},
    ],
)
def test_rejects_invalid_profiles(change):
    profile = {**config().meta["dependencyProfiles"][0], **change}
    with pytest.raises(deps.DependencyProfileError):
        deps.profiles_from_config(config([profile]))


def test_grouped_profiles_expand_to_the_same_lock_as_flat_profiles(source):
    targets = [
        {"os": "linux", "platform": "manylinux2014_x86_64"},
        {"os": "windows", "platform": "win_amd64"},
        {"os": "darwin", "platform": "macosx_11_0_arm64"},
    ]
    groups = [
        {"name": "py39", "python_version": "3.9.20", "targets": targets},
        {
            "name": "py313",
            "python_version": "3.13.4",
            "targets": targets,
            "provided": ["requests"],
            "minimum_openssl": "3.0.0",
        },
    ]
    flat = [
        {"name": "py39-linux-x86_64", "python_version": "3.9.20", **targets[0]},
        {"name": "py39-windows-x86_64", "python_version": "3.9.20", **targets[1]},
        {"name": "py39-darwin-arm64", "python_version": "3.9.20", **targets[2]},
        *[
            {
                "name": name,
                "python_version": "3.13.4",
                "provided": ["requests"],
                "minimum_openssl": "3.0.0",
                **target,
            }
            for name, target in zip(
                ["py313-linux-x86_64", "py313-windows-x86_64", "py313-darwin-arm64"],
                targets,
            )
        ],
    ]
    exported = f"probe==1.0 --hash=sha256:{HASH}\nrequests==2.32.5 --hash=sha256:{HASH}"
    assert write_lock(source, config(groups), exported) == write_lock(
        source, config(flat), exported
    )


@pytest.mark.parametrize(
    "change, message",
    [
        ({"targets": []}, "non-empty targets"),
        ({"os": "windows"}, "only inside targets"),
        ({"targets": [{"os": "windows"}]}, "must specify os and platform"),
        (
            {"targets": [{"os": "windows", "platform": "manylinux2014_x86_64"}]},
            "must agree",
        ),
        ({"name": "a" * 64}, "too long"),
        (
            {"targets": [{"os": "windows", "platform": "win_amd64"}] * 33},
            "at most 32",
        ),
    ],
)
def test_rejects_invalid_grouped_profiles(change, message):
    group = {
        "name": "py39",
        "python_version": "3.9.20",
        "targets": [{"os": "linux", "platform": "manylinux2014_x86_64"}],
        **change,
    }
    with pytest.raises(deps.DependencyProfileError, match=message):
        deps.profiles_from_config(config([group]))


@pytest.mark.parametrize(
    "flat_changes",
    [
        {"name": "py39"},
        {"name": "py39-linux-x86_64", "python_version": "3.13.4"},
        {"python_version": "3.9.25"},
    ],
)
def test_grouped_profiles_reject_conflicting_flat_profiles(flat_changes):
    group = {
        "name": "py39",
        "python_version": "3.9.20",
        "targets": [{"os": "linux", "platform": "manylinux2014_x86_64"}],
    }
    flat = {**config().meta["dependencyProfiles"][0], **flat_changes}
    with pytest.raises(deps.DependencyProfileError, match="unique"):
        deps.profiles_from_config(config([group, flat]))


def test_rejects_ambiguous_runtimes_and_legacy_mixing():
    profile = config().meta["dependencyProfiles"][0]
    with pytest.raises(deps.DependencyProfileError, match="unique"):
        deps.profiles_from_config(
            config([profile, {**profile, "name": "other", "python_version": "3.9.25"}])
        )
    with pytest.raises(deps.DependencyProfileError, match="combined"):
        deps.profiles_from_config(config(**{"os-dependentLibraries": [{}]}))


@pytest.mark.parametrize("filename", ["pyproject.toml", "poetry.lock"])
def test_build_rejects_stale_lock_before_install(source, filename, monkeypatch):
    write_lock(source)
    (source.parent / filename).write_text("changed")
    monkeypatch.setattr(
        deps, "_run", lambda *args: pytest.fail("must not download with stale lock")
    )
    with pytest.raises(deps.DependencyProfileError, match="ucc-gen lock"):
        deps.install_profiles(
            str(source), str(source.parent / "output"), config(), sys.executable
        )


def test_build_rejects_changed_profiles(source):
    write_lock(source)
    profile = {**config().meta["dependencyProfiles"][0], "minimum_openssl": "1.1.1"}
    with pytest.raises(deps.DependencyProfileError, match="stale"):
        deps._load_lock(source, deps.profiles_from_config(config([profile])))


def test_lock_exports_main_graph_atomically(source, monkeypatch):
    (source.parent / "globalConfig.json").write_text(json.dumps(config().content))
    commands = []

    def run(command, cwd=None):
        commands.append(command)
        if "export" in command:
            Path(command[command.index("--output") + 1]).write_text(
                f"probe==1.0 --hash=sha256:{HASH}"
            )

    monkeypatch.setattr(deps, "_run", run)
    deps.lock_dependencies(str(source), update=True)
    lock = json.loads((source / "lib" / deps.LOCK_NAME).read_text())
    assert [command[2] for command in commands] == ["lock", "check", "export"]
    assert "main" in commands[-1] and "--without-urls" in commands[-1]
    assert lock["profiles"][0]["requirements"][0]["name"] == "probe"
    before = (source / "lib" / deps.LOCK_NAME).read_bytes()

    def fail(*args):
        raise deps.DependencyProfileError("export failed")

    monkeypatch.setattr(deps, "_run", fail)
    with pytest.raises(deps.DependencyProfileError):
        deps.lock_dependencies(str(source))
    assert (source / "lib" / deps.LOCK_NAME).read_bytes() == before


def test_cli_dispatches_explicit_lock(monkeypatch):
    calls = []
    monkeypatch.setattr(deps, "lock_dependencies", lambda *args: calls.append(args))
    assert main.main(["lock", "--source", "source", "--update"]) == 0
    assert calls == [("source", None, "poetry", True)]


def test_cli_fails_for_invalid_lock(monkeypatch):
    def fail(*args):
        raise deps.DependencyProfileError("missing lock")

    monkeypatch.setattr(deps, "lock_dependencies", fail)
    with pytest.raises(SystemExit) as error:
        main.main(["lock"])
    assert error.value.code == 1


def make_distribution(path, name, version, module=None):
    metadata = path / (name + "-" + version + ".dist-info")
    metadata.mkdir(parents=True)
    (metadata / "METADATA").write_text(
        f"Metadata-Version: 2.1\nName: {name}\nVersion: {version}\n"
    )
    if module:
        (metadata / "top_level.txt").write_text(module + "\n")
        (path / (module + ".py")).write_text("VALUE = 'locked'\n")


def test_installs_complete_frozen_graph_and_omits_provided(source, monkeypatch):
    configuration = config(
        [{**config().meta["dependencyProfiles"][0], "provided": ["requests"]}]
    )
    write_lock(
        source,
        configuration,
        f"probe==1.0 --hash=sha256:{HASH}\nrequests==2.32.5 --hash=sha256:{HASH}",
    )
    commands = []

    def install(command):
        commands.append(command)
        requirements = Path(command[-1]).read_text()
        assert "probe==1.0" in requirements and "requests" not in requirements
        assert "--hash=sha256:" in requirements
        destination = Path(command[command.index("--target") + 1])
        make_distribution(destination, "probe", "1.0", "probe")

    monkeypatch.setattr(deps, "_run", install)
    manifest = deps.install_profiles(
        str(source), str(source.parent / "output"), configuration, sys.executable
    )
    command = commands[0]
    for flag in [
        "--no-deps",
        "--require-hashes",
        "--only-binary=:all:",
        "--platform",
        "--python-version",
    ]:
        assert flag in command
    profile = manifest["profiles"][0]
    assert profile["provided"] == {"requests": "2.32.5"}
    assert profile["modules"] == ["probe"]
    assert profile["path"] == "3rdparty/ucc/linux39/linux-x86_64"


def test_directory_names_preserve_profile_labels_and_are_portable(source, monkeypatch):
    configuration = config(
        [
            {
                "name": "Py39",
                "python_version": "3.9.20",
                "targets": [
                    {"os": "linux", "platform": "manylinux2014_x86_64"},
                    {"os": "windows", "platform": "win_amd64"},
                ],
            },
            {
                "name": "py39",
                "python_version": "3.13.4",
                "os": "linux",
                "platform": "manylinux2014_x86_64",
            },
            {
                "name": "NUL",
                "python_version": "3.13.4",
                "os": "windows",
                "platform": "win_amd64",
            },
        ]
    )
    write_lock(source, configuration)

    def install(command):
        destination = Path(command[command.index("--target") + 1])
        make_distribution(destination, "probe", "1.0", "probe")

    monkeypatch.setattr(deps, "_run", install)
    manifest = deps.install_profiles(
        str(source), str(source.parent / "output"), configuration, sys.executable
    )
    assert {profile["name"]: profile["path"] for profile in manifest["profiles"]} == {
        "Py39-linux-x86_64": "3rdparty/ucc/Py39/linux-x86_64",
        "Py39-windows-x86_64": "3rdparty/ucc/Py39/windows-x86_64",
        "py39": "3rdparty/ucc/py39~2/linux-x86_64",
        "NUL": "3rdparty/ucc/NUL~1/windows-x86_64",
    }


def make_recorded_wheel(path, name, version, files, tag="py3-none-any"):
    make_distribution(path, name, version)
    metadata = path / f"{name}-{version}.dist-info"
    (metadata / "WHEEL").write_text(
        f"Wheel-Version: 1.0\nRoot-Is-Purelib: true\nTag: {tag}\n"
    )
    for filename, contents in files.items():
        dest = path / filename
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(contents)
    records = [
        *files,
        *(f"{metadata.name}/{name}" for name in ("METADATA", "WHEEL", "RECORD")),
    ]
    (metadata / "RECORD").write_text("\n".join(f"{record},," for record in records))


def test_places_common_profile_and_native_dependencies(tmp_path):
    root = tmp_path / "lib"
    profiles: list[dict[str, Any]] = [
        {"path": f"3rdparty/ucc/{python}/{system}-x86_64"}
        for python in ("py39", "py313")
        for system in ("linux", "windows", "darwin")
    ]
    for index, profile in enumerate(profiles):
        dest = root / profile["path"]
        dest.mkdir(parents=True)
        version = "1.0" if index < 3 else "2.0"
        make_recorded_wheel(
            dest, "requests", version, {"requests/__init__.py": version}
        )
        make_recorded_wheel(dest, "namespace-a", "1.0", {"namespace/a.py": "same"})
        make_recorded_wheel(dest, "namespace-b", "1.0", {"namespace/b.py": "same"})
        make_recorded_wheel(
            dest, "target_wheel", "1.0", {"target_wheel/__init__.py": str(index)}
        )
        make_recorded_wheel(dest, "google-common", "1.0", {"google/common.py": "same"})
        make_recorded_wheel(
            dest,
            "google-native",
            "1.0",
            {"google/native.so": "same"},
            "cp39-cp39-manylinux2014_x86_64",
        )
        make_recorded_wheel(
            dest, "mislabelled", "1.0", {"mislabelled/native.so": "same"}
        )
        make_recorded_wheel(
            dest, "incomplete", "1.0", {"incomplete/__init__.py": "same"}
        )
        (dest / "incomplete/extra.py").write_text("not in RECORD")
        make_recorded_wheel(
            dest, "source_lib", "1.0", {"source_lib/__init__.py": "wheel"}
        )
    (root / "source_lib.py").write_text("source")

    manifest = {"profiles": profiles}
    deps.share_profile_wheels(str(root), manifest)

    assert manifest["common_distributions"] == ["namespace-a", "namespace-b"]
    assert manifest["common_modules"] == ["namespace"]
    assert (root / "namespace/a.py").read_text() == "same"
    assert (root / "namespace/b.py").read_text() == "same"
    assert (root / "namespace-a-1.0.dist-info/RECORD").is_file()
    assert (root / "source_lib.py").read_text() == "source"

    for index, profile in enumerate(profiles):
        dest = root / profile["path"]
        shared = f"3rdparty/ucc/{'py39' if index < 3 else 'py313'}"
        assert profile["shared_paths"] == [shared]
        assert (root / shared / "requests/__init__.py").read_text() == (
            "1.0" if index < 3 else "2.0"
        )
        assert (root / shared / "source_lib/__init__.py").read_text() == "wheel"
        assert not (dest / "namespace").exists()
        assert not (dest / "requests").exists()
        assert (dest / "target_wheel/__init__.py").is_file()
        assert (dest / "google/common.py").is_file()
        assert (dest / "google/native.so").is_file()
        assert (dest / "mislabelled/native.so").is_file()
        assert (dest / "incomplete/extra.py").is_file()


@pytest.mark.parametrize("outside_script_exists", [False, True])
def test_profile_layout_ignores_only_missing_console_script_records(
    tmp_path, monkeypatch, outside_script_exists
):
    profiles = [
        {"path": f"3rdparty/ucc/py39/{system}-x86_64"}
        for system in ("linux", "windows")
    ]
    for profile in profiles:
        target = tmp_path / profile["path"]
        make_recorded_wheel(target, "probe", "1.0", {"probe.py": "wheel"})
        record = target / "probe-1.0.dist-info/RECORD"
        record.write_text(record.read_text() + "\n../../bin/probe,,")
        (target / "bin").mkdir()
        (target / "bin/probe").write_text("relocated script")

    if outside_script_exists:
        outside_script = tmp_path / "3rdparty/ucc/bin/probe"
        outside_script.parent.mkdir()
        outside_script.write_text("external script")

    # Expose all recorded paths as importlib.metadata does on Python 3.9.
    def recorded_files(distribution):
        return [
            Path(line.split(",", 1)[0])
            for line in distribution.read_text("RECORD").splitlines()
        ]

    monkeypatch.setattr(
        importlib.metadata.PathDistribution, "files", property(recorded_files)
    )
    manifest = {"profiles": profiles}
    deps.share_profile_wheels(str(tmp_path), manifest)

    assert (tmp_path / "probe.py").exists() == (not outside_script_exists)
    for profile in profiles:
        target = tmp_path / profile["path"]
        assert (target / "probe.py").exists() == outside_script_exists
        assert (target / "bin/probe").read_text() == "relocated script"


def test_omits_empty_target_directories(tmp_path):
    profiles = [
        {"path": f"3rdparty/ucc/{python}/{system}-x86_64"}
        for python in ("py39", "py313")
        for system in ("linux", "windows")
    ]
    for target in profiles:
        dest = tmp_path / target["path"]
        version = "1.0" if "/py39/" in target["path"] else "2.0"
        make_recorded_wheel(dest, "requests", version, {"requests.py": version})
        make_recorded_wheel(dest, "common", "1.0", {"common.py": "common"})

    deps.share_profile_wheels(str(tmp_path), {"profiles": profiles})

    groups = tmp_path / "3rdparty/ucc"
    assert {path.name for path in groups.iterdir()} == {"py39", "py313"}
    for target in profiles:
        assert "path" not in target
    for group in groups.iterdir():
        assert all(child.name.startswith("requests") for child in group.iterdir())
    assert (tmp_path / "common.py").is_file()


def test_rejects_exclusions_not_declared_as_provided(source):
    write_lock(source)
    (source / "lib" / "exclude.txt").write_text("requests\n")
    with pytest.raises(deps.DependencyProfileError, match="provided"):
        deps.install_profiles(
            str(source), str(source.parent / "output"), config(), sys.executable
        )


def test_refuses_custom_bootstrap(source):
    (source / "bin").mkdir()
    (source / "bin" / "import_declare_test.py").write_text(
        "# existing custom startup\n"
    )
    with pytest.raises(deps.DependencyProfileError, match="migrate"):
        deps.install_profiles(
            str(source), str(source.parent / "output"), config(), sys.executable
        )


@pytest.fixture
def runtime(source):
    app = source.parent / "output" / "Splunk_TA_ProfileTest"
    library = app / "lib" / "3rdparty" / "ucc" / "selected-graph"
    library.mkdir(parents=True)
    make_distribution(library, "ucc_probe", "1.0", "ucc_probe")
    (source / "lib" / "ta_collector.py").write_text("VALUE = 'custom'\n")
    (app / "lib" / "ta_collector.py").write_text("VALUE = 'custom'\n")
    machine = platform.machine().lower()
    architecture = {"amd64": "x86_64", "aarch64": "arm64"}.get(machine, machine)
    manifest = {
        "version": 1,
        "profiles": [
            {
                "name": "test",
                "os": "windows" if sys.platform.startswith("win") else sys.platform,
                "architecture": architecture,
                "python": list(sys.version_info[:2]),
                "python_full_version": platform.python_version(),
                "path": "3rdparty/ucc/selected-graph",
                "modules": ["ucc_probe"],
                "distributions": {"ucc-probe": "1.0"},
                "provided": {},
                "minimum_openssl": None,
            }
        ],
    }
    deps.generate_bootstrap(str(app), manifest)
    return app, library, manifest


def run_runtime(app, code="", before=""):
    script = (
        f"import sys,types\nsys.path.insert(0,{str(app / 'bin')!r})\n"
        f"{before}\nimport import_declare_test\n{code}"
    )
    return subprocess.run(
        [sys.executable, "-B", "-c", script], text=True, capture_output=True
    )


def test_runtime_loads_only_its_shared_wheels(runtime):
    app, library, manifest = runtime
    profile = manifest["profiles"][0]
    shared = "3rdparty/ucc/shared/active"
    inactive = "3rdparty/ucc/shared/inactive"
    make_distribution(app / "lib" / shared, "shared_probe", "1.0", "shared_probe")
    make_distribution(app / "lib" / inactive, "shared_probe", "2.0", "shared_probe")
    profile["shared_paths"] = [shared, profile.pop("path")]
    profile["modules"].append("shared_probe")
    profile["distributions"]["shared-probe"] = "1.0"
    manifest["profiles"].append(
        {**profile, "name": "inactive", "python": [3, 99], "shared_paths": [inactive]}
    )
    deps.generate_bootstrap(str(app), manifest)

    result = run_runtime(
        app,
        f"import shared_probe, ucc_probe\n"
        f"assert shared_probe.__file__ == {str(app / 'lib' / shared / 'shared_probe.py')!r}\n"
        f"assert ucc_probe.__file__ == {str(library / 'ucc_probe.py')!r}\n"
        f"assert {str(app / 'lib' / inactive)!r} not in sys.path",
    )
    assert result.returncode == 0, result.stderr


def test_runtime_validates_common_distributions_in_lib(runtime):
    app, library, manifest = runtime
    profile = manifest["profiles"][0]
    lib = app / "lib"
    make_distribution(lib, "common_probe", "1.0", "common_probe")
    make_distribution(lib, "source_dist", "1.0", "source_dist")
    manifest["common_distributions"] = ["common-probe"]
    manifest["common_modules"] = ["common_probe"]
    profile["distributions"]["common-probe"] = "1.0"
    profile["modules"].append("common_probe")
    deps.generate_bootstrap(str(app), manifest)

    result = run_runtime(app, "import common_probe, ucc_probe, source_dist")
    assert result.returncode == 0, result.stderr

    profile["distributions"]["common-probe"] = "2.0"
    deps.generate_bootstrap(str(app), manifest)
    result = run_runtime(app)
    assert result.returncode != 0
    assert "UCC dependency common-probe must be 2.0" in result.stderr


def test_runtime_selects_dependencies_preserves_helpers_and_ignores_upgrade_leftovers(
    runtime,
):
    app, selected, _ = runtime
    for directory in [app / "lib", app / "bin", selected]:
        (directory / "configparser.py").write_text(
            "raise AssertionError('stale module loaded')\n"
        )
    result = run_runtime(
        app,
        "import ucc_probe,ta_collector,configparser\n"
        "assert ucc_probe.VALUE=='locked'\nassert ta_collector.VALUE=='custom'\n"
        "print(configparser.__file__)",
    )
    assert result.returncode == 0, result.stderr
    assert str(app) not in result.stdout


def test_runtime_rejects_cached_conflicting_dependency(runtime):
    app, _, _ = runtime
    result = run_runtime(
        app,
        before="m=types.ModuleType('ucc_probe');m.__file__='/wrong/ucc_probe.py';sys.modules['ucc_probe']=m",
    )
    assert result.returncode != 0 and "imported before" in result.stderr


def test_runtime_can_probe_for_missing_optional_modules(runtime):
    app, _, _ = runtime
    result = run_runtime(
        app,
        "import importlib.util\n"
        "assert importlib.util.find_spec('ucc_missing_optional_module') is None\n"
        "class OptionalFinder:\n"
        "    def find_spec(self, fullname, path=None, target=None):\n"
        "        if fullname == 'ucc_optional_plugin':\n"
        "            return importlib.machinery.ModuleSpec(fullname, loader=None)\n"
        "sys.meta_path.append(OptionalFinder())\n"
        "assert importlib.util.find_spec('ucc_optional_plugin') is not None",
    )
    assert result.returncode == 0, result.stderr


def test_runtime_rejects_probe_for_undeclared_module_in_addon_path(runtime):
    app, _, _ = runtime
    (app / "lib" / "ucc_undeclared_module.py").write_text("VALUE = 'undeclared'\n")
    result = run_runtime(
        app, "import importlib.util\nimportlib.util.find_spec('ucc_undeclared_module')"
    )
    assert result.returncode != 0
    assert "ModuleNotFoundError: No declared runtime dependency named" in result.stderr


def test_runtime_ignores_other_addon_libraries_and_old_profile_paths(runtime):
    app, selected, _ = runtime
    foreign = app.parent / "etc/apps/OtherTA/lib"
    old = selected.parent / "old-graph"
    for directory in [foreign, old]:
        directory.mkdir(parents=True)
        (directory / "stale_only.py").write_text(
            "raise AssertionError('stale dependency')\n"
        )
    result = run_runtime(
        app,
        "try:\n import stale_only\nexcept ModuleNotFoundError:\n pass\n"
        "else:\n raise AssertionError('undeclared dependency was importable')",
        before=f"sys.path.extend([{str(foreign)!r},{str(old)!r}])",
    )
    assert result.returncode == 0, result.stderr


@pytest.mark.parametrize(
    "change,message",
    [
        ("python", "No unique"),
        ("python_full_version", "regenerate the lock"),
        ("minimum_openssl", "requires OpenSSL"),
        ("path", "Missing or invalid"),
    ],
)
def test_runtime_rejects_unsupported_runtime(runtime, change, message):
    app, _, manifest = runtime
    manifest["profiles"][0][change] = {
        "python": [0, 0],
        "python_full_version": "3.0.0",
        "minimum_openssl": [999, 0, 0],
        "path": "../outside",
    }[change]
    (app / "lib" / deps.MANIFEST_NAME).write_text(json.dumps(manifest))
    result = run_runtime(app)
    assert result.returncode != 0 and message in result.stderr


def test_runtime_rejects_wrong_installed_version(runtime):
    app, selected, _ = runtime
    metadata = selected / "ucc_probe-1.0.dist-info" / "METADATA"
    metadata.write_text(metadata.read_text().replace("Version: 1.0", "Version: 9.0"))
    result = run_runtime(app)
    assert result.returncode != 0 and "must be 1.0" in result.stderr


def test_runtime_validates_splunk_provided_contract(runtime):
    app, _, manifest = runtime
    manifest["profiles"][0]["provided"] = {"six": importlib.metadata.version("six")}
    (app / "lib" / deps.MANIFEST_NAME).write_text(json.dumps(manifest))
    assert run_runtime(app).returncode == 0
    manifest["profiles"][0]["provided"]["six"] = "0.0"
    (app / "lib" / deps.MANIFEST_NAME).write_text(json.dumps(manifest))
    result = run_runtime(app)
    assert result.returncode != 0 and "Splunk-provided six" in result.stderr


def test_runtime_skips_host_distribution_without_name(runtime):
    app, _, manifest = runtime
    host = app.parent / "host"
    unnamed = host / "incomplete-1.0.dist-info"
    unnamed.mkdir(parents=True)
    (unnamed / "METADATA").write_text("Version: 1.0\n")
    make_distribution(host, "ucc_host_probe", "1.0", "ucc_host_probe")
    manifest["profiles"][0]["provided"] = {"ucc-host-probe": "1.0"}
    deps.generate_bootstrap(str(app), manifest)

    result = run_runtime(
        app, "import ucc_host_probe", before=f"sys.path.append({str(host)!r})"
    )

    assert result.returncode == 0, result.stderr


@pytest.mark.parametrize("expected", ["1.0", "2.0"])
def test_runtime_checks_first_host_distribution_on_import_path(runtime, expected):
    app, _, manifest = runtime
    first = app.parent / "host-first"
    second = app.parent / "host-second"
    make_distribution(first, "ucc_host_probe", "1.0", "ucc_host_probe")
    make_distribution(second, "ucc_host_probe", "2.0", "ucc_host_probe")
    manifest["profiles"][0]["provided"] = {"ucc-host-probe": expected}
    deps.generate_bootstrap(str(app), manifest)
    result = run_runtime(
        app,
        f"import ucc_host_probe\nassert ucc_host_probe.__file__.startswith({str(first)!r})",
        before=f"sys.path.extend([{str(first)!r}, {str(second)!r}])",
    )
    if expected == "1.0":
        assert result.returncode == 0, result.stderr
    else:
        assert result.returncode != 0
        assert (
            "Splunk-provided ucc-host-probe must match locked version 2.0"
            in result.stderr
        )


@pytest.fixture
def shared_runtime(runtime):
    app, selected, manifest = runtime
    host = app.parent / "host"
    for root, distribution, child in [
        (host, "azure_core", "core"),
        (selected, "azure_identity", "identity"),
    ]:
        make_distribution(root, distribution, "1.0")
        package = root / "azure" / child
        package.mkdir(parents=True)
        (package / "__init__.py").write_text(f"VALUE = {child!r}\n")
        nested = root / "azure" / "shared" / child
        nested.mkdir(parents=True)
        (nested / "__init__.py").write_text(f"VALUE = {child!r}\n")
        (root / f"{distribution}-1.0.dist-info" / "RECORD").write_text(
            f"azure/{child}/__init__.py,,\nazure/shared/{child}/__init__.py,,\n"
        )
    profile = manifest["profiles"][0]
    profile["modules"].append("azure")
    profile["distributions"]["azure-identity"] = "1.0"
    profile["provided"] = {"azure-core": "1.0"}
    (app / "lib" / deps.MANIFEST_NAME).write_text(json.dumps(manifest))
    # A source-owned copy must not mask the shared namespace either.
    (app / "lib" / "azure.py").write_text("raise AssertionError('stale Azure')\n")
    return app, selected, host


@pytest.mark.parametrize("preloaded", [False, True])
def test_runtime_combines_bundled_and_provided_namespace_packages(
    shared_runtime, preloaded
):
    app, selected, host = shared_runtime
    before = f"sys.path.append({str(host)!r})\n"
    if preloaded:
        before += "import azure.core, azure.shared.core\n"
    result = run_runtime(
        app,
        "from azure import core, identity\n"
        "assert core.VALUE == 'core'\nassert identity.VALUE == 'identity'\n"
        f"assert core.__file__.startswith({str(host)!r})\n"
        f"assert identity.__file__.startswith({str(selected)!r})\n"
        "from azure.shared import core as shared_core, identity as shared_identity\n"
        f"assert shared_core.__file__.startswith({str(host)!r})\n"
        f"assert shared_identity.__file__.startswith({str(selected)!r})\n",
        before=before,
    )
    assert result.returncode == 0, result.stderr


@pytest.mark.parametrize("module_name", ["azure.identity", "azure.shared.identity"])
def test_runtime_rejects_conflicting_cached_namespace_children(
    shared_runtime, module_name
):
    app, _, host = shared_runtime
    package = host.joinpath(*module_name.split("."))
    package.mkdir(parents=True)
    (package / "__init__.py").write_text("VALUE = 'older copy'\n")
    result = run_runtime(
        app,
        before=f"sys.path.append({str(host)!r})\nimport {module_name}\n",
    )
    assert result.returncode != 0
    assert f"Dependency {module_name} was imported" in result.stderr


def test_bootstrap_includes_native_source_modules_for_target_platforms(runtime):
    app, _, manifest = runtime
    lib, bindir = app / "lib", app / "bin"
    namespace = bindir / app.name
    namespace.mkdir()
    extension = "_ucc_native" + importlib.machinery.EXTENSION_SUFFIXES[0]
    (lib / extension).touch()
    (bindir / "_linux.cpython-313-x86_64-linux-gnu.so").touch()
    (namespace / "_windows.cp313-win_amd64.pyd").touch()
    (namespace / "_portable.abi3.so").touch()
    (lib / "native.resource.so").touch()
    deps.generate_bootstrap(str(app), manifest)
    assert "_ucc_native" in manifest["source_modules"]["lib"]
    assert "_linux" in manifest["source_modules"]["bin"]
    assert manifest["source_modules"]["namespace"] == ["_portable", "_windows"]
    assert "native" not in manifest["source_modules"]["lib"]
    result = run_runtime(
        app,
        "import importlib.util\n"
        "spec = importlib.util.find_spec('_ucc_native')\n"
        f"assert spec.origin == {str(lib / extension)!r}",
    )
    assert result.returncode == 0, result.stderr


@pytest.mark.parametrize("profiles", [{}, [None], [{"name": "incomplete"}]])
def test_lock_reports_malformed_profile_declarations(profiles):
    with pytest.raises(deps.DependencyProfileError):
        deps.profiles_from_config(config(profiles))


def test_arm64_marker_environment():
    profile = deps.DependencyProfile("arm", "3.13.4", "linux", "manylinux2014_aarch64")
    assert profile.marker_environment()["platform_machine"] == "aarch64"


@pytest.mark.parametrize(
    "exported,profile,message",
    [
        ("???", {}, "Invalid exported"),
        (
            f'probe==1.0 ; platform_release == "6" --hash=sha256:{HASH}',
            {},
            "OS release",
        ),
        (f'probe==1.0 ; python_version < "3" --hash=sha256:{HASH}', {}, "No runtime"),
        (
            f"probe==1.0 --hash=sha256:{HASH}\nprobe==2.0 --hash=sha256:{HASH}",
            {},
            "Conflicting",
        ),
        (
            f"probe==1.0 --hash=sha256:{HASH}",
            {"provided": ["missing"]},
            "Every provided",
        ),
    ],
)
def test_unusable_exports_fail_before_writing_lock(exported, profile, message):
    target = deps.profiles_from_config(
        config([{**config().meta["dependencyProfiles"][0], **profile}])
    )[0]
    with pytest.raises(deps.DependencyProfileError, match=message):
        deps.select_requirements(exported, target)


def test_missing_project_or_profiles_reports_actionable_error(source):
    (source.parent / "pyproject.toml").unlink()
    with pytest.raises(deps.DependencyProfileError, match="require pyproject"):
        deps._fingerprint(source, deps.profiles_from_config(config()))
    config_file = source.parent / "globalConfig.json"
    config_file.write_text(json.dumps(config([]).content))
    with pytest.raises(deps.DependencyProfileError, match="Configure meta"):
        deps.lock_dependencies(str(source))


@pytest.mark.parametrize("change", ["configuration", "requirements", "missing"])
def test_corrupted_lock_is_rejected(source, change):
    lock = write_lock(source)
    if change == "missing":
        del lock["profiles"]
    else:
        key = lock["profiles"][0]
        if change == "configuration":
            key[change]["name"] = "unexpected"
        else:
            key[change][0]["name"] = "unexpected"
    (source / "lib" / deps.LOCK_NAME).write_text(json.dumps(lock))
    with pytest.raises(deps.DependencyProfileError, match="ucc-gen lock"):
        deps._load_lock(source, deps.profiles_from_config(config()))


@pytest.mark.parametrize(
    "result",
    [
        OSError("not found"),
        SimpleNamespace(returncode=1, stderr="resolution failed", stdout=""),
    ],
)
def test_subprocess_failures_include_cause(monkeypatch, result):
    def run(*args, **kwargs):
        if isinstance(result, OSError):
            raise result
        return result

    monkeypatch.setattr(deps.subprocess, "run", run)
    with pytest.raises(
        deps.DependencyProfileError, match="not found|resolution failed"
    ):
        deps._run(["poetry", "check"])


@pytest.mark.parametrize("has_top_level", [False, True])
def test_module_discovery_keeps_digit_prefixed_native_modules(tmp_path, has_top_level):
    make_distribution(tmp_path, "probe", "1.0", "probe")
    info = tmp_path / "probe-1.0.dist-info"
    if has_top_level:
        (info / "top_level.txt").write_text(
            "probe\n_native\n81d243bd__mypyc\nignored-name\n"
        )
    else:
        (info / "top_level.txt").unlink()
    (info / "RECORD").write_text(
        "probe/__init__.py,,\n_native.cpython-39.so,,\n"
        "81d243bd__mypyc.cpython-39-x86_64-linux-gnu.so,,\n"
        "ignored-name.py,,\nprobe-1.0.dist-info/METADATA,,\n"
    )
    (tmp_path / "probe").mkdir()
    (tmp_path / "probe/__init__.py").touch()
    (tmp_path / "_native.cpython-39.so").touch()
    (tmp_path / "81d243bd__mypyc.cpython-39-x86_64-linux-gnu.so").touch()
    (tmp_path / "ignored-name.py").touch()
    distribution = next(iter(importlib.metadata.distributions(path=[str(tmp_path)])))
    assert deps._modules(distribution) == {"probe", "_native", "81d243bd__mypyc"}


def test_build_rejects_unexpected_installed_versions(source, monkeypatch):
    write_lock(source)
    monkeypatch.setattr(deps, "_run", lambda *args: None)
    with pytest.raises(deps.DependencyProfileError, match="do not match"):
        deps.install_profiles(
            str(source), str(source.parent / "output"), config(), sys.executable
        )


def test_provided_only_graph_skips_pip_and_generated_source_is_rejected(
    source, monkeypatch
):
    configuration = config(
        [{**config().meta["dependencyProfiles"][0], "provided": ["probe"]}]
    )
    write_lock(source, configuration)
    monkeypatch.setattr(deps, "_run", lambda *args: pytest.fail("nothing to install"))
    manifest = deps.install_profiles(
        str(source), str(source.parent / "output"), configuration, sys.executable
    )
    assert manifest["profiles"][0]["distributions"] == {}
    (source / "lib/3rdparty/ucc").mkdir(parents=True)
    with pytest.raises(deps.DependencyProfileError, match="generated"):
        deps.install_profiles(
            str(source), str(source.parent / "output"), configuration, sys.executable
        )


@pytest.mark.parametrize("pages", [False, True])
@pytest.mark.parametrize("grouped", [False, True])
def test_build_integrates_profiles_and_keeps_generated_handlers(
    source, monkeypatch, pages, grouped
):
    from splunk_add_on_ucc_framework.commands import build

    fixtures = Path(__file__).parent / "testdata"
    (source / "app.manifest").write_bytes((fixtures / "app.manifest").read_bytes())
    content = json.loads(
        (fixtures / "valid_config_only_configuration.json").read_text()
    )
    if not pages:
        content.pop("pages")
        content["meta"].pop("defaultView", None)
    if grouped:
        content["meta"]["dependencyProfiles"] = [
            {
                "name": "py39",
                "python_version": "3.9.20",
                "targets": [{"os": "linux", "platform": "manylinux2014_x86_64"}],
            }
        ]
        profile_name = "py39-linux-x86_64"
    else:
        content["meta"]["dependencyProfiles"] = config().meta["dependencyProfiles"]
        profile_name = "linux39"
    configuration = GlobalConfig(content, False)
    (source.parent / "globalConfig.json").write_text(json.dumps(content))
    write_lock(source, configuration)
    checks = []

    def install(command, cwd=None):
        destination = Path(command[command.index("--target") + 1])
        make_distribution(destination, "probe", "1.0", "probe")

    monkeypatch.setattr(deps, "_run", install)
    monkeypatch.setattr(
        build,
        "finalize_python_libraries",
        lambda *args, **kwargs: checks.append((args, kwargs)),
    )
    build.generate(
        source=str(source),
        addon_version="1.0.0",
        output_directory=str(source.parent / "output"),
    )
    app = source.parent / "output" / content["meta"]["name"]
    manifest = json.loads((app / "lib" / deps.MANIFEST_NAME).read_text())
    assert (app / "bin/import_declare_test.py").is_file()
    assert manifest["profiles"][0]["distributions"] == {"probe": "1.0"}
    assert len(checks) == 1
    arguments, options = checks[0]
    assert arguments[1] == str(app / "lib" / manifest["profiles"][0]["path"])
    assert arguments[2] == f"{source / 'lib' / deps.LOCK_NAME} (profile {profile_name})"
    assert options == {
        "includes_ui": pages,
        "includes_oauth": False,
        "profile_versions": {"probe": "1.0"},
    }
    browser_config = GlobalConfig.from_file(
        str(app / "appserver/static/js/build/globalConfig.json")
    )
    assert "dependencyProfiles" not in browser_config.meta
    assert (
        GlobalConfig.from_file(str(source.parent / "globalConfig.json")).meta[
            "dependencyProfiles"
        ]
        == configuration.meta["dependencyProfiles"]
    )
    for path in (app / "bin").glob("*.py"):
        if path.stem != "import_declare_test":
            assert path.stem in manifest["source_modules"]["bin"]


@pytest.mark.parametrize(
    "version,provided,error",
    [
        (None, False, "was not found"),
        ("8.1.0", False, "must be at least version 8.2.0"),
        ("8.2.0", False, None),
        ("8.2.0", True, None),
    ],
)
def test_alert_only_profile_checks_required_library(
    source, monkeypatch, caplog, version, provided, error
):
    from splunk_add_on_ucc_framework.commands import build

    fixtures = Path(__file__).parent / "testdata"
    (source / "app.manifest").write_bytes((fixtures / "app.manifest").read_bytes())
    content = json.loads((fixtures / "valid_config_all_alerts.json").read_text())
    content.pop("pages")
    profile = config().meta["dependencyProfiles"][0]
    if provided:
        profile["provided"] = ["splunktaucclib"]
    content["meta"]["dependencyProfiles"] = [profile]
    (source.parent / "globalConfig.json").write_text(json.dumps(content))
    exported = f"probe==1.0 --hash=sha256:{HASH}"
    if version:
        exported += f"\nsplunktaucclib=={version} --hash=sha256:{HASH}"
    write_lock(source, GlobalConfig(content, False), exported)

    def install(command):
        destination = Path(command[command.index("--target") + 1])
        make_distribution(destination, "probe", "1.0", "probe")
        if version and not provided:
            make_distribution(destination, "splunktaucclib", version, "splunktaucclib")

    monkeypatch.setattr(deps, "_run", install)
    output = source.parent / "output"
    build_options = {
        "source": str(source),
        "addon_version": "1.0.0",
        "output_directory": str(output),
    }
    if error:
        with pytest.raises(SystemExit) as exc:
            build.generate(**build_options)
        assert exc.value.code == 1
        assert "splunktaucclib" in caplog.text and error in caplog.text
        assert f"{deps.LOCK_NAME} (profile linux39)" in caplog.text
    else:
        build.generate(**build_options)
        alert_module = output / content["meta"]["name"] / "bin/test_alert_default.py"
        assert "from splunktaucclib.alert_actions_base" in alert_module.read_text()
