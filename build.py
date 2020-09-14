from splunk_add_on_ucc_framework import logger, sourcedir, recursive_overwrite

import os
import shutil

def setup_env():
    logger.info("Setting up Environment")
    install_npm_dependencies = "npm install -g bower"
    os.system(install_npm_dependencies)
    os.chdir(os.path.join(sourcedir, "UCC-UI-lib", "bower_components", "SplunkWebCore"))
    os.system("npm install")
    


def generate_static_files():
    logger.info("Generating Static files")
    os.chdir(os.path.join(sourcedir, "UCC-UI-lib"))
    os.system("npm install")
    os.system("bower install")
    os.system("npm run build")
    src = os.path.join(sourcedir, "UCC-UI-lib", "package", "appserver", "templates", "redirect.html")
    dest = os.path.join(sourcedir, "UCC-UI-lib", "build", "appserver", "templates", "redirect.html")
    shutil.copy(src, dest)
    src = os.path.join(sourcedir, "UCC-UI-lib", "data", "redirect_page.js")
    dest = os.path.join(sourcedir, "UCC-UI-lib", "build", "appserver", "static", "js", "build", "redirect_page.js")
    shutil.copy(src, dest)


def migrate_package():
    logger.info("Exporting generated Package.")
    src = os.path.join(os.path.join(sourcedir, "UCC-UI-lib", "build"))
    dest = os.path.join(os.path.join(sourcedir, "package"))
    if os.path.exists(dest):
        shutil.rmtree(dest, ignore_errors=True)
    os.makedirs(dest)
    recursive_overwrite(src, dest)


def build_ucc():
    setup_env()
    generate_static_files()
    migrate_package()