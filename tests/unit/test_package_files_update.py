from splunk_add_on_ucc_framework.package_files_update import (
    handle_package_files_update,
)


LEGACY_BASE_HTML = """\
<%!
from splunk.appserver.mrsparkle.lib import util

app_name = cherrypy.request.path_info.split('/')[3]
%>\
<!DOCTYPE html>
<html class="no-js" lang="">
    <head></head>
    <body>
        <script src="${make_url('/config?autoload=1')}" crossorigin="use-credentials"></script>
        <script>
            __splunkd_partials__ = ${json_decode(splunkd)};
        </script>
        <% page_path = "/static/app/" + app_name + "/js/build/entry_page.js" %>
        <script type="module" src="${make_url(page_path)}"></script>
    </body>
</html>
"""


LEGACY_REDIRECT_HTML = """\
<%! app_name = cherrypy.request.path_info.split('/')[3] %>\
<!DOCTYPE html>
<html class="no-js" lang="">
    <head></head>
    <body>
        <script src="${make_url('/config?autoload=1')}" crossorigin="use-credentials"></script>
        <script>
            __splunkd_partials__ = ${json_decode(splunkd)};
        </script>
        <% page_path = "/static/app/" + app_name + "/js/build/${ta.name}_redirect_page.${ta.version}.js" %>
        <script type="module" src="${make_url(page_path)}"></script>
    </body>
</html>
"""


def test_package_files_update_replaces_legacy_base_template(tmp_path, caplog):
    template_path = tmp_path / "appserver" / "templates" / "base.html"
    template_path.parent.mkdir(parents=True)
    template_path.write_text(LEGACY_BASE_HTML)

    handle_package_files_update(str(tmp_path))

    assert '<base href="../../" />' in template_path.read_text()
    assert (
        '<script type="module" src="static/app/__APP_NAME__/js/build/entry_page.js"></script>'
        in template_path.read_text()
    )
    assert "cherrypy.request.path_info" not in template_path.read_text()
    assert "${make_url(" not in template_path.read_text()
    assert caplog.messages == [
        "File 'appserver/templates/base.html' exists in the package directory "
        "and was updated to the current static UCC template to remove legacy "
        "Mako/CherryPy usage."
    ]


def test_package_files_update_replaces_legacy_redirect_template(tmp_path, caplog):
    template_path = tmp_path / "appserver" / "templates" / "redirect.html"
    template_path.parent.mkdir(parents=True)
    template_path.write_text(LEGACY_REDIRECT_HTML)

    handle_package_files_update(str(tmp_path))

    assert '<base href="../../" />' in template_path.read_text()
    assert "__TA_NAME___redirect_page.__TA_VERSION__.js" in template_path.read_text()
    assert "cherrypy.request.path_info" not in template_path.read_text()
    assert "${make_url(" not in template_path.read_text()
    assert caplog.messages == [
        "File 'appserver/templates/redirect.html' exists in the package "
        "directory and was updated to the current static UCC template to "
        "remove legacy Mako/CherryPy usage."
    ]


def test_package_files_update_leaves_custom_template_unchanged(tmp_path, caplog):
    template_path = tmp_path / "appserver" / "templates" / "base.html"
    template_path.parent.mkdir(parents=True)
    template_path.write_text("<html><body>totally custom</body></html>")

    handle_package_files_update(str(tmp_path))

    assert template_path.read_text() == "<html><body>totally custom</body></html>"
    assert caplog.messages == [
        "File 'appserver/templates/base.html' exists in the package directory "
        "and uses a custom template. UCC left it unchanged because it could "
        "not be safely migrated automatically."
    ]


def test_package_files_update_noop_when_templates_are_absent(tmp_path):
    handle_package_files_update(str(tmp_path))
