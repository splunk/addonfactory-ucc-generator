#
# Copyright 2026 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
"""Inventory evidence from the final add-on tree; never resolve dependencies."""

import hashlib
import re
import shutil
import subprocess
from collections.abc import Sequence
from dataclasses import dataclass
from email.parser import BytesParser
from pathlib import Path
from typing import Any, Optional

from packaging.tags import Tag, compatible_tags, cpython_tags, mac_platforms, parse_tag
from packaging.utils import canonicalize_name

from splunk_add_on_ucc_framework.global_config import OSDependentLibraryConfig


class InventoryError(Exception):
    """A shipped dependency cannot be identified or verified from its evidence."""


@dataclass(frozen=True)
class DependencyRow:
    ecosystem: str
    name: str
    version: str
    path: str
    sha256: str
    target: Optional[dict[str, Any]] = None


def _sha256(path: Path) -> str:
    with path.open("rb") as stream:
        digest = hashlib.sha256()
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _python_version(value: str) -> tuple[int, int]:
    if re.fullmatch(r"\d{2,3}", value):
        return int(value[0]), int(value[1:])
    match = re.fullmatch(r"(\d+)\.(\d+)(?:\.\d+)?", value)
    if not match:
        raise InventoryError(f"Unsupported target Python version: {value}")
    return int(match[1]), int(match[2])


def _target_tags(config: OSDependentLibraryConfig) -> set[Tag]:
    version = _python_version(config.python_version)
    platform = config.platform
    mac = re.fullmatch(r"macosx_(\d+)_(\d+)_(.+)", platform)
    if mac:
        platforms = list(mac_platforms((int(mac[1]), int(mac[2])), mac[3]))
    else:
        platforms = [platform]
        for old, new in (("manylinux2014_", "manylinux_2_17_"),):
            if platform.startswith(old):
                platforms.append(new + platform.removeprefix(old))
            elif platform.startswith(new):
                platforms.append(old + platform.removeprefix(new))
    interpreter = f"cp{version[0]}{version[1]}"
    abi = interpreter + ("m" if version < (3, 8) else "")
    return set(
        cpython_tags(version, abis=[abi, "abi3", "none"], platforms=platforms)
    ) | set(compatible_tags(version, interpreter=interpreter, platforms=platforms))


def _under(root: Path, relative: str) -> Path:
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise InventoryError(f"Inventory path leaves its root: {relative}")
    return path


def collect_python(
    root: Path,
    targets: Sequence[OSDependentLibraryConfig],
    installer_version: str,
) -> list[DependencyRow]:
    """Read final distribution identities and check foreign wheel target tags."""
    lib = root / "lib"
    configurations: dict[Path, OSDependentLibraryConfig] = {}
    for config in targets:
        path = _under(lib, config.target)
        if not path.is_dir():
            raise InventoryError(
                f"Missing configured Python target: lib/{config.target}"
            )
        previous = configurations.get(path)
        if previous and (
            previous.platform,
            _python_version(previous.python_version),
            previous.os,
        ) != (config.platform, _python_version(config.python_version), config.os):
            raise InventoryError(
                f"Conflicting Python target descriptions: {config.target}"
            )
        configurations[path] = config

    rows = []
    found: dict[Path, set[tuple[str, str]]] = {path: set() for path in configurations}
    ordered_roots = sorted(
        configurations, key=lambda path: len(path.parts), reverse=True
    )
    for folder in sorted(lib.rglob("*.dist-info")):
        metadata_path = folder / "METADATA"
        if not metadata_path.is_file():
            raise InventoryError(
                f"Missing installed METADATA: {folder.relative_to(root)}"
            )
        metadata = BytesParser().parsebytes(metadata_path.read_bytes())
        name, version = metadata.get("Name"), metadata.get("Version")
        if not name or not version:
            raise InventoryError(
                f"Missing Name/Version: {metadata_path.relative_to(root)}"
            )
        name = canonicalize_name(name)
        wheel = folder / "WHEEL"
        tags = (
            BytesParser().parsebytes(wheel.read_bytes()).get_all("Tag", [])
            if wheel.is_file()
            else []
        )
        owner = next(
            (path for path in ordered_roots if folder.resolve().is_relative_to(path)),
            None,
        )
        details: dict[str, Any] = {
            "placement": "platform" if owner else "common",
            "wheel_tags": sorted(tags),
            "python_version": installer_version,
        }
        if owner:
            config = configurations[owner]
            details.update(
                os=config.os,
                platform=config.platform,
                python_version=config.python_version,
            )
            try:
                installed_tags = set().union(*(parse_tag(tag) for tag in tags))
            except ValueError as error:
                raise InventoryError(
                    f"Invalid WHEEL tags: {wheel.relative_to(root)}"
                ) from error
            if not installed_tags or not installed_tags.intersection(
                _target_tags(config)
            ):
                raise InventoryError(
                    f"Missing or incompatible WHEEL tags: {wheel.relative_to(root)}"
                )
            found[owner].add((name, version))
        rows.append(
            DependencyRow(
                "pypi",
                name,
                version,
                metadata_path.relative_to(root).as_posix(),
                _sha256(metadata_path),
                details,
            )
        )
    for config in targets:
        if (canonicalize_name(config.name), config.version) not in found[
            _under(lib, config.target)
        ]:
            raise InventoryError(
                f"Missing configured distribution: {config.name}=={config.version} in {config.target}"
            )
    return rows


_NATIVE_HEADERS = (
    b"\x7fELF",
    b"MZ",
    b"\xcf\xfa\xed\xfe",
    b"\xce\xfa\xed\xfe",
    b"\xfe\xed\xfa\xcf",
    b"\xfe\xed\xfa\xce",
    b"\xca\xfe\xba\xbe",
    b"\xbe\xba\xfe\xca",
    b"\xca\xfe\xba\xbf",
    b"\xbf\xba\xfe\xca",
)
_GO_MAGIC = b"\xff Go buildinf:"


def _go_binaries(root: Path) -> list[Path]:
    result = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        with path.open("rb") as stream:
            header = stream.read(4)
            if any(header.startswith(prefix) for prefix in _NATIVE_HEADERS):
                if _GO_MAGIC in header + stream.read():
                    result.append(path)
    return result


def parse_go_info(text: str, path: str, sha256: str) -> list[DependencyRow]:
    """Parse go version -m output; dependencies come from this binary only."""
    lines = text.splitlines()
    toolchain = re.search(r"\b(go\d+\.\d+[^\s]*)$", lines[0]) if lines else None
    if not toolchain:
        raise InventoryError(f"Unreadable Go build information: {path}")
    details = {"toolchain": toolchain[1]}
    dependencies: list[dict[str, Any]] = []
    has_path = False
    current: Optional[dict[str, Any]] = None
    for line in lines[1:]:
        fields = line.strip().split("\t")
        if fields[0] == "path" and len(fields) >= 2:
            has_path = bool(fields[1])
        elif fields[0] == "dep" and len(fields) >= 3:
            current = {"name": fields[1], "version": fields[2]}
            dependencies.append(current)
        elif fields[0] == "mod":
            current = None  # The main program is not its own dependency.
        elif fields[0] == "=>" and current is not None:
            if len(fields) < 3:
                raise InventoryError(f"Unversioned Go replacement: {path}")
            current["replaces"] = {
                "name": current["name"],
                "version": current["version"],
            }
            current.update(name=fields[1], version=fields[2])
        elif fields[0] == "build" and len(fields) >= 2:
            key, _, value = fields[1].partition("=")
            if key in ("GOOS", "GOARCH"):
                details[key] = value
    if not has_path:
        raise InventoryError(f"Unreadable Go module information: {path}")
    rows = []
    for dependency in dependencies:
        if not dependency["version"] or dependency["version"] == "(devel)":
            raise InventoryError(f"Unversioned Go dependency or replacement: {path}")
        target: dict[str, Any] = dict(details)
        if "replaces" in dependency:
            target["replaces"] = dependency["replaces"]
        rows.append(
            DependencyRow(
                "golang",
                dependency["name"],
                dependency["version"],
                path,
                sha256,
                target,
            )
        )
    return rows


def collect_go(root: Path) -> list[DependencyRow]:
    binaries = _go_binaries(root)
    if not binaries:
        return []
    go = shutil.which("go")
    if not go:
        raise InventoryError(
            "Go CLI is required to inspect packaged Go binaries (go version -m)"
        )
    rows = []
    for binary in binaries:
        relative = binary.relative_to(root).as_posix()
        try:
            result = subprocess.run(
                [go, "version", "-m", str(binary)],
                check=True,
                capture_output=True,
                text=True,
            )
        except (OSError, subprocess.CalledProcessError) as error:
            raise InventoryError(f"Could not inspect Go binary: {relative}") from error
        rows.extend(parse_go_info(result.stdout, relative, _sha256(binary)))
    return rows
