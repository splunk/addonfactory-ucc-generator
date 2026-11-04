"""Inventory evidence from the final add-on tree; never resolve dependencies."""

import hashlib
import re
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
