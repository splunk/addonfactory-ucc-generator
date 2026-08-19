#!/usr/bin/env python3
"""Bootstrap a docs venv and proxy arguments to mkdocs.

Usage:
    python3 mkdocs.py serve -a localhost:8001
    python3.10 mkdocs.py build --strict
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

VENV = Path(".docs-venv")
BIN = "Scripts" if sys.platform == "win32" else "bin"


def _pip(*args: str) -> None:
    subprocess.run([str(VENV / BIN / "pip"), *args], check=True)


if not VENV.exists():
    try:
        subprocess.run([sys.executable, "-m", "venv", str(VENV)], check=True)
        _pip("install", "--quiet", "--upgrade", "pip")
        _pip("install", "--quiet", ".")
        _pip("install", "--quiet", "-r", "docs/requirements.txt")
    except Exception:
        shutil.rmtree(VENV, ignore_errors=True)
        raise

mkdocs = str(VENV / BIN / "mkdocs")
os.execv(mkdocs, [mkdocs, *sys.argv[1:]])
