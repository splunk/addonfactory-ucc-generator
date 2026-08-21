#!/usr/bin/env python3
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
