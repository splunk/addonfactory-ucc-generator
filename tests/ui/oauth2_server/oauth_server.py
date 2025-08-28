"""Simple OAuth2 test server using only standard library."""

import json
import logging
import os
import re
import secrets
import ssl
import sys
import subprocess
import tempfile
import threading
import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
from string import Template
from typing import Dict, Optional, Any


logger = logging.getLogger("oauth2_test_server")
logger.setLevel(logging.DEBUG)

handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

authorize_url_pattern = re.compile(r".*/authorize(\?.*|$)")
token_url_pattern = re.compile(r".*/token(\?.*|$)")


class OAuth2RequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler for OAuth2 test server."""

    auth_codes: Dict[str, Dict[str, Any]] = {}
    access_tokens: Dict[str, Dict[str, Any]] = {}

    def do_GET(self) -> None:
        logger.debug("GET REQUEST: %s", self.path)
        if self.path.startswith("/favicon.ico"):
            # To avoid unnecessary 404 errors in logs
            self._send_response(204, "image/x-icon", "")
        elif authorize_url_pattern.match(self.path):
            self._handle_authorize_get()
        else:
            self._send_response(404, "text/plain", "Not Found")

    def do_POST(self) -> None:
        logger.debug("POST REQUEST: %s", self.path)
        if authorize_url_pattern.match(self.path):
            self._handle_authorize_post()
        elif token_url_pattern.match(self.path):
            self._handle_token_post()
        else:
            self._send_response(404, "text/plain", "Not Found")

    def _handle_authorize_get(self) -> None:
        """Show login form."""
        parsed_url = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed_url.query)

        # Load and format HTML template
        template_path = os.path.join(os.path.dirname(__file__), "login_form.html")
        with open(template_path) as f:
            html = f.read()

        formatted_html = Template(html).substitute(
            client_id=params.get("client_id", [""])[0],
            redirect_uri=params.get("redirect_uri", [""])[0],
            state=params.get("state", [""])[0],
            response_type=params.get("response_type", [""])[0],
        )

        self._send_response(200, "text/html", formatted_html)

    def _handle_authorize_post(self) -> None:
        """Process login form."""
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8")
        form_data = urllib.parse.parse_qs(post_data)

        def get_form_value(key: str) -> str:
            return form_data.get(key, [""])[0]

        email = get_form_value("email")
        password = get_form_value("password")
        client_id = get_form_value("client_id")
        redirect_uri = get_form_value("redirect_uri")
        state = get_form_value("state")

        if password == "good":
            # Generate authorization code
            auth_code = secrets.token_urlsafe(32)
            self.auth_codes[auth_code] = {
                "client_id": client_id,
                "redirect_uri": redirect_uri,
                "email": email,
                "created_at": time.time(),
                "state": state,
            }

            # Build redirect URL with authorization code
            redirect_params = {"code": auth_code}
            if state:
                redirect_params["state"] = state

            self._send_redirect(redirect_uri, redirect_params)
        else:
            # Send error redirect
            error_params = {
                "error": "access_denied",
                "error_description": "Invalid credentials",
            }
            if state:
                error_params["state"] = state

            self._send_redirect(redirect_uri, error_params)

    def _handle_token_post(self) -> None:
        """Exchange code for token."""
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8")

        try:
            if self.headers.get("Content-Type", "").startswith("application/json"):
                token_data = json.loads(post_data)
            else:
                token_data = urllib.parse.parse_qs(post_data)
                token_data = {
                    k: v[0] if isinstance(v, list) and v else v
                    for k, v in token_data.items()
                }
        except (json.JSONDecodeError, ValueError):
            return self._send_json_error(
                400, "invalid_request", "Invalid request format"
            )

        auth_code = token_data.get("code", "")
        client_id = token_data.get("client_id", "")
        grant_type = token_data.get("grant_type", "")

        if grant_type != "authorization_code":
            return self._send_json_error(
                400, "unsupported_grant_type", "Only authorization_code supported"
            )

        if auth_code not in self.auth_codes:
            return self._send_json_error(
                400, "invalid_grant", "Invalid or expired authorization code"
            )

        code_data = self.auth_codes[auth_code]

        if code_data["client_id"] != client_id:
            return self._send_json_error(
                400, "invalid_client", "Client ID does not match"
            )

        # Validate redirect_uri if provided
        redirect_uri = token_data.get("redirect_uri", "")
        if redirect_uri and code_data.get("redirect_uri") != redirect_uri:
            return self._send_json_error(
                400, "invalid_grant", "Redirect URI does not match"
            )

        if time.time() - code_data["created_at"] > 600:  # 10 minutes
            del self.auth_codes[auth_code]
            return self._send_json_error(
                400, "invalid_grant", "Authorization code expired"
            )

        # Generate tokens
        access_token = secrets.token_urlsafe(32)
        refresh_token = secrets.token_urlsafe(32)

        self.access_tokens[access_token] = {
            "client_id": client_id,
            "email": code_data["email"],
            "created_at": time.time(),
            "refresh_token": refresh_token,
        }

        del self.auth_codes[auth_code]

        token_response = {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": refresh_token,
            "scope": "read",
        }

        self._send_response(
            200, "application/json", json.dumps(token_response, indent=2)
        )

    def _send_redirect(self, redirect_uri: str, params: Dict[str, str]) -> None:
        """Send OAuth2 redirect response."""
        if not redirect_uri:
            return self._send_response(400, "text/plain", "Missing redirect_uri")

        # Build redirect URL with parameters
        if "?" in redirect_uri:
            separator = "&"
        else:
            separator = "?"

        query_string = urllib.parse.urlencode(params)
        redirect_url = f"{redirect_uri}{separator}{query_string}"

        # Send 302 redirect
        self.send_response(302)
        self.send_header("Location", redirect_url)
        self.end_headers()

    def _send_json_error(self, status_code: int, error: str, description: str) -> None:
        """Send JSON error response."""
        error_data = {"error": error, "error_description": description}
        self._send_response(
            status_code, "application/json", json.dumps(error_data, indent=2)
        )

    def _send_response(self, status_code: int, content_type: str, content: str) -> None:
        """Send HTTP response."""
        self.send_response(status_code)
        self.send_header("Content-Type", f"{content_type}; charset=utf-8")
        self.send_header("Content-Length", str(len(content.encode("utf-8"))))
        self.end_headers()
        self.wfile.write(content.encode("utf-8"))

    def log_message(self, format: str, *args: Any) -> None:
        """Suppress logging."""


def _generate_self_signed_cert() -> tuple[str, str]:
    """Generate self-signed certificate. Returns (cert_file, key_file)."""
    temp_dir = tempfile.mkdtemp()
    cert_file = os.path.join(temp_dir, "cert.pem")
    key_file = os.path.join(temp_dir, "key.pem")

    cmd = [
        "openssl",
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-keyout",
        key_file,
        "-out",
        cert_file,
        "-days",
        "1",
        "-nodes",
        "-subj",
        "/CN=localhost",
    ]
    proc = subprocess.run(cmd, capture_output=True)
    assert proc.returncode == 0, f"OpenSSL error: {proc.stderr.decode()}"
    return cert_file, key_file


class OAuth2TestServer:
    """OAuth2 test server that can be run in a thread."""

    def __init__(self, host: str = "localhost", port: int = 0, use_https: bool = True):
        self.host = host
        self.port = port
        self.use_https = use_https
        self.server: Optional[HTTPServer] = None
        self.thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._cert_dir: Optional[str] = None

    def start(self) -> None:
        """Start the server in a separate thread."""
        if self.server is not None:
            raise RuntimeError("Server is already running")

        self.server = HTTPServer((self.host, self.port), OAuth2RequestHandler)

        if self.port == 0:
            self.port = self.server.server_address[1]

        if self.use_https:
            cert_file, key_file = _generate_self_signed_cert()
            self._cert_dir = os.path.dirname(cert_file)
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain(cert_file, key_file)
            self.server.socket = context.wrap_socket(
                self.server.socket, server_side=True
            )

        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        time.sleep(0.1)  # Wait for server to be ready

    def stop(self) -> None:
        """Stop the server."""
        if self.server is None:
            return

        self._stop_event.set()
        self.server.shutdown()
        self.server.server_close()

        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=5.0)

        # Clean up certificates
        if self._cert_dir:
            try:
                import shutil

                shutil.rmtree(self._cert_dir)
            except Exception:
                pass
            self._cert_dir = None

        self.server = None
        self.thread = None
        self._stop_event.clear()

    @property
    def host_port(self) -> str:
        """Get the host:port string."""
        return f"{self.host}:{self.port}"

    @property
    def base_url(self) -> str:
        """Get the base URL of the server."""
        scheme = "https" if self.use_https else "http"
        return f"{scheme}://{self.host_port}"

    @property
    def authorize_url(self) -> str:
        """Get the authorization endpoint URL."""
        return f"{self.base_url}/oauth/authorize"

    def is_running(self) -> bool:
        """Check if the server is running."""
        return self.server is not None and not self._stop_event.is_set()

    def clear_data(self) -> None:
        """Clear all stored authorization codes and tokens."""
        OAuth2RequestHandler.auth_codes.clear()
        OAuth2RequestHandler.access_tokens.clear()

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()


if __name__ == "__main__":
    logger.info("Starting OAuth2 Test Server (HTTPS)...")

    with OAuth2TestServer(port=8888, use_https=True) as server:
        logger.info(f"Server running at: {server.base_url}")
        logger.info(
            f"Visit: {server.authorize_url}?client_id=demo&redirect_uri=http://localhost/callback&response_type=code"
        )
        logger.info("Credentials: email=any@example.com, password=good")
        logger.info("Note: Self-signed certificate will show security warnings.")
        logger.info("Press Ctrl+C to stop...")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Stopping server...")
