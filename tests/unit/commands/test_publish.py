import pytest
from unittest.mock import patch, MagicMock, mock_open
import io
import urllib.error
import json

from http.client import HTTPMessage
from splunk_add_on_ucc_framework.commands.publish import (
    get_auth_token,
    upload_package,
    check_package_validation,
    publish_package,
)


class TestPackageUpload:
    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    @patch(
        "splunk_add_on_ucc_framework.commands.publish.open",
        new_callable=mock_open,
        read_data=b"file binary content",
    )
    def test_upload_package_success(self, mock_file, mock_urlopen, mock_logger):
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({"id": "pkg123"}).encode("utf-8")
        mock_urlopen.return_value = mock_response
        mock_urlopen.return_value.__enter__ = MagicMock(return_value=mock_response)
        mock_urlopen.return_value.__exit__ = MagicMock(return_value=None)

        pkg_id = upload_package(
            app_id=1001,
            package_path="tests/test_package.tgz",
            splunk_versions="9.5",
            cim_versions="6.x",
            visibility=True,
            token="jwt",
        )
        assert pkg_id == "pkg123"
        request = mock_urlopen.call_args[0][0]
        assert request.get_header("Authorization") == "Bearer jwt"
        mock_file.assert_called_once_with("tests/test_package.tgz", "rb")
        mock_logger.info.assert_called_with(
            "Package uploaded successfully. Package ID: pkg123"
        )

    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    @patch(
        "splunk_add_on_ucc_framework.commands.publish.open",
        new_callable=mock_open,
        read_data=b"file binary content",
    )
    def test_upload_package_no_id(self, mock_file, mock_urlopen, mock_logger):
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({}).encode("utf-8")
        mock_urlopen.return_value = mock_response
        mock_urlopen.return_value.__enter__ = MagicMock(return_value=mock_response)
        mock_urlopen.return_value.__exit__ = MagicMock(return_value=None)

        pkg_id = upload_package(
            1001, "tests/test_package.tgz", "9.5", "6.x", True, "jwt"
        )
        assert pkg_id == ""
        mock_file.assert_called_once_with("tests/test_package.tgz", "rb")
        mock_logger.info.assert_called_with(
            "Package uploaded but no package ID returned. {}"
        )

    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    @patch(
        "splunk_add_on_ucc_framework.commands.publish.open",
        new_callable=mock_open,
        read_data=b"file binary content",
    )
    def test_upload_package_http_error(self, mock_file, mock_urlopen, mock_logger):
        headers = HTTPMessage()
        headers.add_header("Content-Type", "application/json")
        mock_error = urllib.error.HTTPError(
            url="url",
            code=400,
            msg="Bad Request",
            hdrs=headers,
            fp=io.BytesIO(b'{"error":"Bad data"}'),
        )
        mock_urlopen.side_effect = mock_error
        mock_urlopen.return_value.__enter__ = MagicMock(return_value=mock_error)
        mock_urlopen.return_value.__exit__ = MagicMock(return_value=None)

        with pytest.raises(urllib.error.HTTPError):
            upload_package(1001, "tests/test_package.tgz", "9.5", "6.x", True, "jwt")
            mock_file.assert_called_once_with("tests/test_package.tgz", "rb")
            mock_logger.error.assert_called_with(
                f"Failed to upload package. {mock_error.read().decode()}"
            )


class TestPackageValidation:
    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    def test_check_package_validation_success(self, mock_urlopen, mock_logger):
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(
            {"message": "Validation passed"}
        ).encode("utf-8")
        mock_urlopen.return_value = mock_response
        mock_urlopen.return_value.__enter__ = MagicMock(return_value=mock_response)
        mock_urlopen.return_value.__exit__ = MagicMock(return_value=None)

        check_package_validation("pkg123", "jwt")  # should not raise
        request = mock_urlopen.call_args[0][0]
        assert request.get_header("Authorization") == "Bearer jwt"
        mock_logger.info.assert_called_with("Validation status: Validation passed")

    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    def test_check_package_validation_http_error(self, mock_urlopen, mock_logger):
        headers = HTTPMessage()
        headers.add_header("Content-Type", "application/json")
        mock_error = urllib.error.HTTPError(
            url="url",
            code=500,
            msg="Internal Server Error",
            hdrs=headers,
            fp=io.BytesIO(b"Server error"),
        )
        mock_urlopen.side_effect = mock_error
        mock_urlopen.return_value.__enter__ = MagicMock(return_value=mock_error)
        mock_urlopen.return_value.__exit__ = MagicMock(return_value=None)

        with pytest.raises(urllib.error.HTTPError):
            check_package_validation("pkg123", "jwt")
            mock_logger.error.assert_called_with(
                f"Failed to retrieve package validation status. {mock_error.read().decode()}"
            )


def _mock_json_response(mock_urlopen, payload):
    mock_response = MagicMock()
    mock_response.read.return_value = json.dumps(payload).encode("utf-8")
    mock_urlopen.return_value.__enter__ = MagicMock(return_value=mock_response)
    mock_urlopen.return_value.__exit__ = MagicMock(return_value=None)


class TestGetAuthToken:
    @patch("urllib.request.urlopen")
    def test_get_auth_token_success(self, mock_urlopen):
        _mock_json_response(mock_urlopen, {"data": {"token": "jwt"}})

        assert get_auth_token("user", "pass") == "jwt"
        request = mock_urlopen.call_args[0][0]
        assert request.full_url == "https://api.splunk.com/2.0/rest/login/splunk"
        assert request.get_header("Authorization") == "Basic dXNlcjpwYXNz"

    @pytest.mark.parametrize("payload", [{}, {"data": {}}, {"data": {"token": ""}}])
    @patch("urllib.request.urlopen")
    def test_get_auth_token_missing_token(self, mock_urlopen, payload):
        _mock_json_response(mock_urlopen, payload)

        with pytest.raises(ValueError):
            get_auth_token("user", "pass")

    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    def test_get_auth_token_http_error(self, mock_urlopen, mock_logger):
        mock_urlopen.side_effect = urllib.error.HTTPError(
            url="url",
            code=400,
            msg="Bad Request",
            hdrs=HTTPMessage(),
            fp=io.BytesIO(b"invalid credentials"),
        )

        with pytest.raises(urllib.error.HTTPError):
            get_auth_token("user", "pass")
        mock_logger.error.assert_called_with(
            "Failed to authenticate with Splunk API. invalid credentials"
        )


class TestPublishPackage:
    @patch("splunk_add_on_ucc_framework.commands.publish.check_package_validation")
    @patch(
        "splunk_add_on_ucc_framework.commands.publish.upload_package",
        return_value="pkg123",
    )
    @patch(
        "splunk_add_on_ucc_framework.commands.publish.get_auth_token",
        return_value="jwt",
    )
    def test_publish_package_uses_token(self, mock_token, mock_upload, mock_check):
        publish_package(1001, "pkg.tgz", "9.5", "6.x", False, "user", "pass")

        mock_token.assert_called_once_with("user", "pass")
        mock_upload.assert_called_once_with(1001, "pkg.tgz", "9.5", "6.x", False, "jwt")
        mock_check.assert_called_once_with("pkg123", "jwt")

    @patch("splunk_add_on_ucc_framework.commands.publish.check_package_validation")
    @patch(
        "splunk_add_on_ucc_framework.commands.publish.upload_package",
        return_value="",
    )
    @patch(
        "splunk_add_on_ucc_framework.commands.publish.get_auth_token",
        return_value="jwt",
    )
    def test_publish_package_skips_validation_without_id(
        self, mock_token, mock_upload, mock_check
    ):
        publish_package(1001, "pkg.tgz", "9.5", "6.x", False, "user", "pass")

        mock_check.assert_not_called()
