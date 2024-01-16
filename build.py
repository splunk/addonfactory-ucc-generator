""" build script that ensures that yarn is run before install"""

import subprocess
import shutil


def run_yarn():
    if shutil.which("yarn") is None:
        print("yarn command not found, please install yarn to build the ui")
        exit(1)
    print("Running yarn to build the UI")
    subprocess.run(["./build-ui.sh"])


if __name__ == "__main__":
    run_yarn()
