#
# Copyright 2025 Splunk Inc.
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
import logging
import requests


logger = logging.getLogger("ucc_gen")


def upload_package(
    app_id: int,
    package_path: str,
    package_name: str,
    splunk_versions: str,
    cim_versions: str,
    visibility: bool,
    username: str,
    password: str,
) -> str:
    upload_url = (
        f"https://classic.stage.splunkbase.splunk.com/api/v1/app/{app_id}/new_release/"
    )

    files = {
        "files[]": open(package_path, "rb"),
    }
    data = {
        "filename": package_name,
        "cim_versions": cim_versions,
        "splunk_versions": splunk_versions,
        "visibility": visibility,
    }
    response = requests.post(
        upload_url, auth=(username, password), files=files, data=data
    )

    if response.status_code == 200:
        package_id = response.json().get("id", "")
        if package_id == "":
            logger.info(f"Package uploaded but no package ID returned. {response.text}")
        logger.info(f"Package uploaded successfully. Package ID: {package_id}")
    else:
        logger.error(f"Failed to upload package. {response.text}")
        response.raise_for_status()
    return package_id


def check_package_validation(
    package_upload_id: str, username: str, password: str
) -> None:
    upload_status_url = f"https://classic.stage.splunkbase.splunk.com/api/v1/package/{package_upload_id}/"
    validation_response = requests.get(upload_status_url, auth=(username, password))
    if validation_response.status_code == 200:
        logger.info(
            "Validation status: {}".format(validation_response.json().get("message"))
        )
    else:
        logger.error(
            "Failed to retrieve package validation status. {}".format(
                validation_response.text
            )
        )
        validation_response.raise_for_status()


def publish_package(
    app_id: int,
    package_path: str,
    package_name: str,
    splunk_versions: str,
    cim_versions: str,
    visibility: bool,
    username: str,
    password: str,
) -> None:
    package_upload_id = upload_package(
        app_id,
        package_path,
        package_name,
        splunk_versions,
        cim_versions,
        visibility,
        username,
        password,
    )
    if package_upload_id:
        check_package_validation(package_upload_id, username, password)
