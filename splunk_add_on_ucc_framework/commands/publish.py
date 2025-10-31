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
import certifi
import urllib.request
import base64
import mimetypes
import os
import ssl
import uuid
import json
import logging


logger = logging.getLogger("ucc_gen")


def encode_multipart_formdata(
    fields: dict[str, str], files: dict[str, str]
) -> tuple[str, bytes]:
    """Encodes fields and files for multipart/form-data"""
    boundary = uuid.uuid4().hex
    lines = []

    for name, value in fields.items():
        lines.append(f"--{boundary}".encode())
        lines.append(f'Content-Disposition: form-data; name="{name}"'.encode())
        lines.append(b"")
        lines.append(str(value).encode("utf-8"))

    for name, filepath in files.items():
        filename = filepath.split("/")[-1]
        with open(filepath, "rb") as f:
            file_content = f.read()
        content_type = mimetypes.guess_type(filepath)[0] or "application/octet-stream"
        lines.append(f"--{boundary}".encode())
        lines.append(
            f'Content-Disposition: form-data; name="{name}"; filename="{filename}"'.encode()
        )
        lines.append(f"Content-Type: {content_type}".encode())
        lines.append(b"")
        lines.append(file_content)

    lines.append(f"--{boundary}--".encode())
    lines.append(b"")

    body = b"\r\n".join(lines)
    content_type = f"multipart/form-data; boundary={boundary}"
    return content_type, body


def upload_package(
    base_url: str,
    app_id: int,
    package_path: str,
    splunk_versions: str,
    cim_versions: str,
    visibility: bool,
    username: str,
    password: str,
) -> str:
    upload_url = f"{base_url}/app/{app_id}/new_release/"

    fields = {
        "filename": os.path.basename(package_path),
        "cim_versions": cim_versions,
        "splunk_versions": splunk_versions,
        "visibility": str(visibility).lower(),
    }

    files = {
        "files[]": package_path,
    }

    content_type, body = encode_multipart_formdata(fields, files)
    auth_header = base64.b64encode(f"{username}:{password}".encode()).decode("utf-8")
    context = ssl.create_default_context(cafile=certifi.where())

    request = urllib.request.Request(upload_url, data=body, method="POST")
    request.add_header("Content-Type", content_type)
    request.add_header("Authorization", f"Basic {auth_header}")
    try:
        with urllib.request.urlopen(request, context=context) as response:
            response_data = response.read().decode("utf-8")
            json_data = json.loads(response_data)
            package_id = json_data.get("id", "")
            if package_id:
                logger.info(f"Package uploaded successfully. Package ID: {package_id}")
            else:
                logger.info(
                    f"Package uploaded but no package ID returned. {response_data}"
                )
            return package_id
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode()
        logger.error(f"Failed to upload package. {error_msg}")
        raise


def check_package_validation(
    base_url: str, package_upload_id: str, username: str, password: str
) -> None:
    url = f"{base_url}/package/{package_upload_id}/"
    auth_header = base64.b64encode(f"{username}:{password}".encode()).decode("utf-8")
    context = ssl.create_default_context(cafile=certifi.where())

    request = urllib.request.Request(url, method="GET")
    request.add_header("Authorization", f"Basic {auth_header}")

    try:
        with urllib.request.urlopen(request, context=context) as response:
            response_data = json.loads(response.read().decode("utf-8"))
            if response_data.get("result") == "pass":
                logger.info(
                    "Validation status: {}".format(response_data.get("message"))
                )
            else:
                raise Exception(response_data.get("message"))
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode()
        logger.error(f"Failed to retrieve package validation status. {error_msg}")
        raise


def publish_package(
    use_stage: bool,
    app_id: int,
    package_path: str,
    splunk_versions: str,
    cim_versions: str,
    visibility: bool,
    username: str,
    password: str,
) -> None:
    if use_stage:
        API_BASEURL = "https://classic.stage.splunkbase.splunk.com/api/v1"
    else:
        API_BASEURL = "https://splunkbase.splunk.com/api/v1"
    package_upload_id = upload_package(
        API_BASEURL,
        app_id,
        package_path,
        splunk_versions,
        cim_versions,
        visibility,
        username,
        password,
    )
    if package_upload_id:
        check_package_validation(API_BASEURL, package_upload_id, username, password)
