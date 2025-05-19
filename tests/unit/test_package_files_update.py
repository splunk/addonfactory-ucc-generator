import pytest

from splunk_add_on_ucc_framework.package_files_update import (
    _handle_base_html_update,
    handle_package_files_update,
)

base_html_template = """
    <%! app_name = cherrypy.request.path_info.split('/')[3] %>\\
    <!DOCTYPE html>
    <html class="no-js" lang="">
        <head>
        </head>

        <body>
            <script>
                __splunkd_partials__ = $${json_decode(splunkd)};
            </script>

            <% page_path = "/static/app/" + app_name + "/js/build/entry_page.js" %>

            $value
        </body>
    </html>
"""


def test_base_html_update():
    expected = base_html_template.replace(
        "$value", '<script type="module" src="${make_url(page_path)}"></script>'
    )

    for value in [
        '<script src="${make_url(page_path)}"></script>',
        '<script src="${make_url(page_path)}">\n</script>',
        '<script    src="${make_url(page_path)}">    </script>',
    ]:
        content = base_html_template.replace("$value", value)
        assert _handle_base_html_update(content) == expected


def test_base_html_update_not_needed():
    for value in [
        '<script type="module" src="${make_url(page_path)}"></script>',
        '<script type="module" src="${make_url(page_path)}">\n</script>',
        '<script   type="module"   src="${make_url(page_path)}">    </script>',
        '<script src="${make_url(page_path)}" type="module"></script>',
    ]:
        content = base_html_template.replace("$value", value)
        assert _handle_base_html_update(content) is None


@pytest.mark.parametrize("update_needed", [True, False])
def test_package_files_update(tmp_path, update_needed, caplog):
    path = tmp_path / "appserver" / "templates" / "base.html"
    path.parent.mkdir(parents=True)

    if update_needed:
        content = base_html_template.replace(
            "$value", '<script src="${make_url(page_path)}"></script>'
        )
    else:
        content = base_html_template.replace(
            "$value", '<script type="module" src="${make_url(page_path)}"></script>'
        )

    path.write_text(content)

    handle_package_files_update(str(tmp_path))

    current_content = path.read_text()
    assert (
        '<script type="module" src="${make_url(page_path)}"></script>'
        in current_content
    )

    if update_needed:
        assert (
            caplog.messages[0]
            == "File 'appserver/templates/base.html' exists in the package directory "
            "and its content needed to be updated by UCC."
        )
    else:
        assert not caplog.messages
