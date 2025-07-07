import unittest
from unittest.mock import patch, MagicMock, mock_open
import io
import urllib.error
import json

from http.client import HTTPMessage
from splunk_add_on_ucc_framework.commands.publish import (
    upload_package,
    check_package_validation,
)


class TestPackageUpload(unittest.TestCase):
    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    @patch("builtins.open", new_callable=mock_open, read_data=b"file binary content")
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
            username="user",
            password="pass",
        )
        self.assertEqual(pkg_id, "pkg123")
        mock_file.assert_called_once_with("tests/test_package.tgz", "rb")
        mock_logger.info.assert_called_with(
            "Package uploaded successfully. Package ID: pkg123"
        )

    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    @patch("builtins.open", new_callable=mock_open, read_data=b"file binary content")
    def test_upload_package_no_id(self, mock_file, mock_urlopen, mock_logger):
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({}).encode("utf-8")
        mock_urlopen.return_value = mock_response
        mock_urlopen.return_value.__enter__ = MagicMock(return_value=mock_response)
        mock_urlopen.return_value.__exit__ = MagicMock(return_value=None)

        pkg_id = upload_package(
            1001, "tests/test_package.tgz", "9.5", "6.x", True, "user", "pass"
        )
        self.assertEqual(pkg_id, "")
        mock_file.assert_called_once_with("tests/test_package.tgz", "rb")
        mock_logger.info.assert_called_with(
            "Package uploaded but no package ID returned. {}"
        )

    @patch("splunk_add_on_ucc_framework.commands.publish.logger")
    @patch("urllib.request.urlopen")
    @patch("builtins.open", new_callable=mock_open, read_data=b"file binary content")
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

        with self.assertRaises(urllib.error.HTTPError):
            upload_package(
                1001, "tests/test_package.tgz", "9.5", "6.x", True, "user", "pass"
            )
            mock_file.assert_called_once_with("tests/test_package.tgz", "rb")
            mock_logger.error.assert_called_with(
                f"Failed to upload package. {mock_error.read().decode()}"
            )


class TestPackageValidation(unittest.TestCase):
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

        check_package_validation("pkg123", "user", "pass")  # should not raise
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

        with self.assertRaises(urllib.error.HTTPError):
            check_package_validation("pkg123", "user", "pass")
            mock_logger.error.assert_called_with(
                f"Failed to retrieve package validation status. {mock_error.read().decode()}"
            )
