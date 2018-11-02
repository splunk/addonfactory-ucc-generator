import os.path as op


class AlertActionsTemplateMgr(object):
    CURRENT_DIR = op.dirname(op.abspath(__file__))
    DEFAULT_TEMPLATE_DIR = op.join(CURRENT_DIR, "arf_template")
    DEFAULT_HTML_LOOKUP_DIR = op.join(DEFAULT_TEMPLATE_DIR, "default_html_theme")

    def __init__(self, template_dir=None, html_theme=None):
        self._template_dir = template_dir or \
            AlertActionsTemplateMgr.DEFAULT_TEMPLATE_DIR
        self._html_theme = html_theme or \
            AlertActionsTemplateMgr.DEFAULT_HTML_LOOKUP_DIR

    def get_template_dir(self):
        return self._template_dir

    def get_html_lookup_dir(self):
        return self._html_theme
