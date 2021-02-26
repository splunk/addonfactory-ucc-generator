# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

from splunk_add_on_ucc_framework import logger, sourcedir, recursive_overwrite

import os
import shutil


def generate_static_files():
    logger.info("Generating Static files")
    os.chdir(os.path.join(sourcedir, "ucc_ui_lib"))
    os.system("yarn run setup")


def migrate_package():
    logger.info("Exporting generated Package.")
    src = os.path.join(os.path.join(sourcedir, "ucc_ui_lib", "stage"))
    dest = os.path.join(os.path.join(sourcedir, "package"))
    if os.path.exists(dest):
        shutil.rmtree(dest, ignore_errors=True)
    os.makedirs(dest)
    recursive_overwrite(src, dest)


def build_ucc():
    generate_static_files()
    migrate_package()