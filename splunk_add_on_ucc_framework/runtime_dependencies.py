# Copyright 2026 Splunk Inc.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software distributed
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
# CONDITIONS OF ANY KIND, either express or implied. See the License for the
# specific language governing permissions and limitations under the License.
"""Export and install complete, frozen dependency graphs for add-on runtimes."""

import hashlib
import importlib.metadata
import json
import logging
import os
import re
import subprocess
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Optional

from packaging.markers import default_environment
from packaging.requirements import InvalidRequirement, Requirement
from packaging.utils import canonicalize_name
from packaging.version import Version

from splunk_add_on_ucc_framework.global_config import GlobalConfig

logger = logging.getLogger("ucc_gen")
LOCK_NAME = "ucc-dependencies.lock.json"
MANIFEST_NAME = "ucc-runtime-dependencies.json"


class DependencyProfileError(ValueError):
    """An explicitly configured runtime cannot be built reproducibly."""


@dataclass(frozen=True)
class DependencyProfile:
    name: str
    python_version: str
    os: str
    platform: str
    provided: tuple[str, ...] = ()
    minimum_openssl: Optional[str] = None

    @property
    def architecture(self) -> str:
        if self.platform.endswith(("_x86_64", "_amd64")):
            return "x86_64"
        if self.platform.endswith(("_aarch64", "_arm64")):
            return "arm64"
        raise DependencyProfileError(f"Unsupported wheel platform: {self.platform}")

    @property
    def python_family(self) -> tuple[int, int]:
        major, minor, _ = self.python_version.split(".")
        return int(major), int(minor)

    def marker_environment(self) -> dict[str, str]:
        environment = default_environment()
        environment.update(
            python_version=".".join(self.python_version.split(".")[:2]),
            python_full_version=self.python_version,
            implementation_name="cpython",
            implementation_version=self.python_version,
            platform_python_implementation="CPython",
            sys_platform={"linux": "linux", "windows": "win32", "darwin": "darwin"}[
                self.os
            ],
            os_name="nt" if self.os == "windows" else "posix",
            platform_system={
                "linux": "Linux",
                "windows": "Windows",
                "darwin": "Darwin",
            }[self.os],
            platform_machine=(
                ("AMD64" if self.os == "windows" else "x86_64")
                if self.architecture == "x86_64"
                else ("aarch64" if self.os == "linux" else "arm64")
            ),
            platform_release="",
            platform_version="",
            extra="",
        )
        return environment


def profiles_from_config(config: GlobalConfig) -> list[DependencyProfile]:
    profiles = []
    seen_names: set[str] = set()
    seen_runtimes: set[tuple[str, str, tuple[int, int]]] = set()
    raw_profiles = config.meta.get("dependencyProfiles", [])
    if not isinstance(raw_profiles, list):
        raise DependencyProfileError("meta.dependencyProfiles must be a list")
    if raw_profiles and config.meta.get("os-dependentLibraries"):
        raise DependencyProfileError(
            "dependencyProfiles cannot be combined with os-dependentLibraries"
        )
    for raw in raw_profiles:
        if not isinstance(raw, dict):
            raise DependencyProfileError("Each dependency profile must be an object")
        if not isinstance(raw.get("provided", []), list):
            raise DependencyProfileError(
                "provided must be a list of distribution names"
            )
        try:
            profile = DependencyProfile(
                **{**raw, "provided": tuple(raw.get("provided", []))}
            )
        except (TypeError, ValueError) as error:
            raise DependencyProfileError(
                f"Invalid dependency profile: {error}"
            ) from error
        if (
            not isinstance(profile.name, str)
            or len(profile.name) > 64
            or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", profile.name)
        ):
            raise DependencyProfileError(
                "Profile names must be safe, unique directory names"
            )
        if not isinstance(profile.python_version, str) or not re.fullmatch(
            r"3\.\d+\.\d+", profile.python_version
        ):
            raise DependencyProfileError(
                "python_version must include major, minor and patch, for example 3.13.4"
            )
        prefixes = {
            "linux": ("manylinux", "musllinux"),
            "windows": ("win_",),
            "darwin": ("macosx_",),
        }
        if (
            not isinstance(profile.os, str)
            or profile.os not in prefixes
            or not isinstance(profile.platform, str)
            or not profile.platform.startswith(prefixes[profile.os])
        ):
            raise DependencyProfileError("Profile os and wheel platform must agree")
        if profile.minimum_openssl is not None and (
            not isinstance(profile.minimum_openssl, str)
            or not re.fullmatch(r"\d+\.\d+\.\d+", profile.minimum_openssl)
        ):
            raise DependencyProfileError(
                "minimum_openssl must have three numeric components"
            )
        if any(
            not isinstance(name, str)
            or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", name)
            for name in profile.provided
        ):
            raise DependencyProfileError(
                "provided must contain distribution names without version specifiers"
            )
        runtime = (profile.os, profile.architecture, profile.python_family)
        if profile.name in seen_names or runtime in seen_runtimes:
            raise DependencyProfileError(
                "Profiles must have unique names and OS/architecture/Python runtimes"
            )
        seen_names.add(profile.name)
        seen_runtimes.add(runtime)
        profiles.append(profile)
    return profiles


def _fingerprint(source: Path, profiles: list[DependencyProfile]) -> str:
    try:
        contents = [
            (source.parent / name).read_text()
            for name in ("pyproject.toml", "poetry.lock")
        ]
    except OSError as error:
        raise DependencyProfileError(
            "Dependency profiles require pyproject.toml and poetry.lock beside globalConfig"
        ) from error
    data = json.dumps(
        [contents, [asdict(profile) for profile in profiles]], sort_keys=True
    )
    return hashlib.sha256(data.encode()).hexdigest()


def _requirement_record(line: str) -> dict[str, Any]:
    hashes = re.findall(r"--hash=sha256:([a-fA-F0-9]{64})(?=\s|$)", line)
    raw = line.split(" --hash=", 1)[0].strip()
    try:
        requirement = Requirement(raw)
    except InvalidRequirement as error:
        raise DependencyProfileError(f"Invalid exported requirement: {raw}") from error
    versions = list(requirement.specifier)
    if (
        requirement.url
        or len(versions) != 1
        or versions[0].operator != "=="
        or "*" in versions[0].version
    ):
        raise DependencyProfileError(
            f"{requirement.name} must be pinned to one published wheel version; VCS/source dependencies are unsupported"
        )
    if not hashes or len(re.findall(r"--hash=", line)) != len(hashes):
        raise DependencyProfileError(
            f"{requirement.name} requires SHA-256 wheel hashes"
        )
    return {
        "requirement": requirement,
        "name": canonicalize_name(requirement.name),
        "version": versions[0].version,
        "hashes": sorted({h.lower() for h in hashes}),
    }


def select_requirements(
    exported: str, profile: DependencyProfile
) -> list[dict[str, Any]]:
    requirements: dict[str, dict[str, Any]] = {}
    logical_lines = exported.replace("\\\r\n", " ").replace("\\\n", " ").splitlines()
    for line in logical_lines:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("-"):
            raise DependencyProfileError(
                "Poetry export must not contain index URLs, includes or pip options"
            )
        record = _requirement_record(line)
        requirement = record["requirement"]
        if requirement.marker and re.search(
            r"\bplatform_(release|version)\b", str(requirement.marker)
        ):
            raise DependencyProfileError(
                "OS release/version markers require additional target metadata and are unsupported"
            )
        if requirement.marker and not requirement.marker.evaluate(
            profile.marker_environment()
        ):
            continue
        requirement.marker = None
        record["requirement"] = str(requirement)
        if record["name"] in requirements:
            raise DependencyProfileError(
                f"Conflicting exported requirements for {record['name']} in {profile.name}"
            )
        requirements[record["name"]] = record
    if not requirements:
        raise DependencyProfileError(
            f"No runtime requirements selected for {profile.name}"
        )
    provided = {canonicalize_name(name) for name in profile.provided}
    if not provided.issubset(requirements):
        raise DependencyProfileError(
            f"Every provided distribution must be present in the Poetry graph for {profile.name}"
        )
    return [requirements[name] for name in sorted(requirements)]


def _run(command: list[str], cwd: Optional[Path] = None) -> None:
    try:
        process = subprocess.run(command, cwd=cwd, capture_output=True, text=True)
    except OSError as error:
        raise DependencyProfileError(f"Unable to run {command[0]}: {error}") from error
    if process.returncode:
        raise DependencyProfileError(
            f"{command[0]} failed: {process.stderr.strip() or process.stdout.strip()}"
        )


def lock_dependencies(
    source: str,
    config_path: Optional[str] = None,
    poetry_binary_name: str = "poetry",
    update: bool = False,
) -> None:
    package = Path(source).resolve()
    config_file = (
        Path(config_path)
        if config_path
        else next(
            (
                package.parent / name
                for name in ("globalConfig.json", "globalConfig.yaml")
                if (package.parent / name).exists()
            ),
            package.parent / "globalConfig.json",
        )
    )
    config = GlobalConfig.from_file(str(config_file))
    profiles = profiles_from_config(config)
    if not profiles:
        raise DependencyProfileError(
            "Configure meta.dependencyProfiles before running ucc-gen lock"
        )
    project = package.parent
    if update:
        _run([poetry_binary_name, "--no-interaction", "lock"], project)
    _run([poetry_binary_name, "--no-interaction", "check", "--lock"], project)
    with tempfile.TemporaryDirectory(prefix="ucc-poetry-") as temporary:
        exported = Path(temporary) / "requirements.txt"
        _run(
            [
                poetry_binary_name,
                "--no-interaction",
                "export",
                "--only",
                "main",
                "--format",
                "requirements.txt",
                "--without-urls",
                "--output",
                str(exported),
            ],
            project,
        )
        text = exported.read_text()
        records = [
            {
                "configuration": asdict(profile),
                "requirements": select_requirements(text, profile),
            }
            for profile in profiles
        ]
    lock = {
        "version": 1,
        "fingerprint": _fingerprint(package, profiles),
        "profiles": records,
    }
    destination = package / "lib" / LOCK_NAME
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        mode="w", dir=destination.parent, delete=False
    ) as writer:
        temporary_path = Path(writer.name)
        json.dump(lock, writer, indent=2, sort_keys=True)
        writer.write("\n")
    try:
        os.replace(temporary_path, destination)
    finally:
        temporary_path.unlink(missing_ok=True)
    logger.info("Wrote locked runtime dependencies to %s", destination)


def _load_lock(source: Path, profiles: list[DependencyProfile]) -> dict[str, Any]:
    try:
        lock = json.loads((source / "lib" / LOCK_NAME).read_text())
        if lock["version"] != 1 or lock["fingerprint"] != _fingerprint(
            source, profiles
        ):
            raise ValueError("outdated fingerprint or unsupported version")
        if [record["configuration"] for record in lock["profiles"]] != json.loads(
            json.dumps([asdict(p) for p in profiles])
        ):
            raise ValueError("profile declarations changed")
        for profile, record in zip(profiles, lock["profiles"]):
            exported = "\n".join(
                row["requirement"]
                + " "
                + " ".join("--hash=sha256:" + h for h in row["hashes"])
                for row in record["requirements"]
            )
            if select_requirements(exported, profile) != record["requirements"]:
                raise ValueError("inconsistent requirement records")
    except (OSError, ValueError, TypeError, KeyError) as error:
        raise DependencyProfileError(
            f"Missing, invalid or stale {LOCK_NAME}; run ucc-gen lock: {error}"
        ) from error
    return lock


def _modules(distribution: importlib.metadata.Distribution) -> set[str]:
    top_level = distribution.read_text("top_level.txt")
    if top_level:
        return {name for name in top_level.splitlines() if name.isidentifier()}
    return {
        str(path).split("/")[0].split(".")[0]
        for path in (distribution.files or [])
        if str(path).split("/")[0].split(".")[0].isidentifier()
        and ".dist-info" not in str(path)
        and ".data/" not in str(path)
    }


def install_profiles(
    source: str, target: str, config: GlobalConfig, python_binary_name: str
) -> dict[str, Any]:
    from splunk_add_on_ucc_framework.install_python_libraries import parse_excludes

    package, output = Path(source).resolve(), Path(target)
    profiles = profiles_from_config(config)
    if (package / "bin" / "import_declare_test.py").exists():
        raise DependencyProfileError(
            "dependencyProfiles requires a UCC-generated bootstrap; migrate the source bin/import_declare_test.py first"
        )
    if (package / "lib" / "3rdparty" / "ucc").exists():
        raise DependencyProfileError(
            "lib/3rdparty/ucc is generated; remove it from package source"
        )
    lock = _load_lock(package, profiles)
    excludes = {
        canonicalize_name(name)
        for name in (parse_excludes(str(package / "lib" / "exclude.txt")) or [])
    }
    manifest: dict[str, Any] = {"version": 1, "profiles": []}
    for profile, record in zip(profiles, lock["profiles"]):
        provided = {canonicalize_name(name) for name in profile.provided}
        if not excludes.issubset(provided):
            raise DependencyProfileError(
                f"Declare excluded distributions in every profile's provided list: {sorted(excludes - provided)}"
            )
        graph_hash = hashlib.sha256(
            json.dumps(record, sort_keys=True).encode()
        ).hexdigest()[:16]
        relative = Path("3rdparty") / "ucc" / (profile.name + "-" + graph_hash)
        destination = output / relative
        destination.mkdir(parents=True, exist_ok=True)
        rows = [row for row in record["requirements"] if row["name"] not in provided]
        with tempfile.TemporaryDirectory(prefix="ucc-locked-") as temporary:
            requirements = Path(temporary) / "requirements.txt"
            requirements.write_text(
                "\n".join(
                    row["requirement"]
                    + " "
                    + " ".join("--hash=sha256:" + h for h in row["hashes"])
                    for row in rows
                )
                + "\n"
            )
            if rows:
                family = "".join(profile.python_version.split(".")[:2])
                _run(
                    [
                        python_binary_name,
                        "-m",
                        "pip",
                        "install",
                        "--require-hashes",
                        "--no-deps",
                        "--ignore-installed",
                        "--no-compile",
                        "--only-binary=:all:",
                        "--platform",
                        profile.platform,
                        "--python-version",
                        profile.python_version,
                        "--implementation",
                        "cp",
                        "--abi",
                        "cp" + family,
                        "--abi",
                        "abi3",
                        "--abi",
                        "none",
                        "--target",
                        str(destination),
                        "-r",
                        str(requirements),
                    ]
                )
        expected = {row["name"]: row["version"] for row in rows}
        installed = {
            canonicalize_name(dist.metadata["Name"]): dist
            for dist in importlib.metadata.distributions(path=[str(destination)])
        }
        if set(installed) != set(expected) or any(
            Version(installed[name].version) != Version(version)
            for name, version in expected.items()
        ):
            raise DependencyProfileError(
                f"Installed distributions do not match the lock for {profile.name}"
            )
        modules = (
            set().union(*(_modules(dist) for dist in installed.values()))
            if installed
            else set()
        )
        manifest["profiles"].append(
            {
                "name": profile.name,
                "os": profile.os,
                "architecture": profile.architecture,
                "python": profile.python_family,
                "python_full_version": profile.python_version,
                "path": relative.as_posix(),
                "modules": sorted(modules),
                "distributions": expected,
                "provided": {
                    row["name"]: row["version"]
                    for row in record["requirements"]
                    if row["name"] in provided
                },
                "minimum_openssl": (
                    [int(n) for n in profile.minimum_openssl.split(".")]
                    if profile.minimum_openssl
                    else None
                ),
            }
        )
    return manifest


def generate_bootstrap(addon_path: str, manifest: dict[str, Any]) -> None:
    output = Path(addon_path)
    directories = {
        "lib": output / "lib",
        "bin": output / "bin",
        "namespace": output / "bin" / output.name,
    }
    manifest["source_modules"] = {}
    for key, directory in directories.items():
        manifest["source_modules"][key] = (
            sorted(
                {
                    path.stem if path.is_file() else path.name
                    for path in directory.iterdir()
                    if (
                        path.is_dir()
                        and path.name.isidentifier()
                        and path.name != "__pycache__"
                    )
                    or (path.suffix == ".py" and path.stem.isidentifier())
                }
            )
            if directory.exists()
            else []
        )
    (output / "lib").mkdir(parents=True, exist_ok=True)
    (output / "lib" / MANIFEST_NAME).write_text(
        json.dumps(manifest, sort_keys=True, indent=2) + "\n"
    )
    (output / "bin").mkdir(parents=True, exist_ok=True)
    template = Path(__file__).parent / "templates" / "runtime_dependencies.py.template"
    (output / "bin" / "import_declare_test.py").write_text(template.read_text())
