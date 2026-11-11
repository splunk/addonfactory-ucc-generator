# Copyright 2026 Splunk Inc.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
import importlib.metadata
import json
import platform
import subprocess
import sys
from types import SimpleNamespace
from dataclasses import asdict
from pathlib import Path

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
    assert profile["path"].startswith("3rdparty/ucc/linux39-")


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


def test_module_discovery_handles_wheels_without_top_level_file(tmp_path):
    make_distribution(tmp_path, "probe", "1.0", "probe")
    info = tmp_path / "probe-1.0.dist-info"
    (info / "top_level.txt").unlink()
    (info / "RECORD").write_text(
        "probe/__init__.py,,\n_native.cpython-39.so,,\nprobe-1.0.dist-info/METADATA,,\n"
    )
    (tmp_path / "probe").mkdir()
    (tmp_path / "probe/__init__.py").touch()
    (tmp_path / "_native.cpython-39.so").touch()
    distribution = next(iter(importlib.metadata.distributions(path=[str(tmp_path)])))
    assert deps._modules(distribution) == {"probe", "_native"}


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
def test_build_integrates_profiles_and_keeps_generated_handlers(
    source, monkeypatch, pages
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
    content["meta"]["dependencyProfiles"] = config().meta["dependencyProfiles"]
    configuration = GlobalConfig(content, False)
    (source.parent / "globalConfig.json").write_text(json.dumps(content))
    write_lock(source, configuration)
    checks = []

    def install(command, cwd=None):
        destination = Path(command[command.index("--target") + 1])
        make_distribution(destination, "probe", "1.0", "probe")

    monkeypatch.setattr(deps, "_run", install)
    monkeypatch.setattr(
        build, "_check_libraries_required_for_ui", lambda *args: checks.append(args)
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
    assert bool(checks) == pages
    for path in (app / "bin").glob("*.py"):
        if path.stem != "import_declare_test":
            assert path.stem in manifest["source_modules"]["bin"]
