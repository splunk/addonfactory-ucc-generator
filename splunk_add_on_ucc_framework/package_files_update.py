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
import logging
from pathlib import Path
from typing import Callable

logger = logging.getLogger("ucc_gen")

internal_root_dir = Path(__file__).resolve().parent


def _load_canonical_template(template_name: str) -> str:
    return (
        internal_root_dir / "package" / "appserver" / "templates" / template_name
    ).read_text()


def _is_legacy_base_html(content: str) -> bool:
    legacy_markers = (
        "cherrypy.request.path_info",
        "${make_url('/config?autoload=1')}",
        "__splunkd_partials__ = ${json_decode(splunkd)};",
        '<script type="module" src="${make_url(page_path)}"></script>',
        '<script src="${make_url(page_path)}"></script>',
        'page_path = "/static/app/" + app_name + "/js/build/entry_page.js"',
    )
    return any(marker in content for marker in legacy_markers)


def _is_legacy_redirect_html(content: str) -> bool:
    legacy_markers = (
        "cherrypy.request.path_info",
        "${make_url('/config?autoload=1')}",
        "__splunkd_partials__ = ${json_decode(splunkd)};",
        "${ta.name}",
        "${ta.version}",
        'page_path = "/static/app/" + app_name + "/js/build/${ta.name}_redirect_page.${ta.version}.js"',
    )
    return any(marker in content for marker in legacy_markers)


def _migrate_template_if_needed(
    package_dir: str,
    relative_path: str,
    template_name: str,
    detector: Callable[[str], bool],
) -> None:
    file_path = Path(package_dir) / relative_path
    if not file_path.is_file():
        return

    current_content = file_path.read_text()
    if current_content == _load_canonical_template(template_name):
        return

    if detector(current_content):
        file_path.write_text(_load_canonical_template(template_name))
        logger.info(
            "File '%s' exists in the package directory and was updated to the "
            "current static UCC template to remove legacy Mako/CherryPy usage.",
            relative_path,
        )
        return

    logger.warning(
        "File '%s' exists in the package directory and uses a custom template. "
        "UCC left it unchanged because it could not be safely migrated "
        "automatically.",
        relative_path,
    )


def handle_package_files_update(path: str) -> None:
    _migrate_template_if_needed(
        path,
        "appserver/templates/base.html",
        "base.html",
        _is_legacy_base_html,
    )
    _migrate_template_if_needed(
        path,
        "appserver/templates/redirect.html",
        "redirect.html",
        _is_legacy_redirect_html,
    )
