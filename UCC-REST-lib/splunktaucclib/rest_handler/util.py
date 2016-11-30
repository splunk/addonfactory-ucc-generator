from __future__ import absolute_import

import os.path

from .error import RestError
from splunk.appserver.mrsparkle.lib import i18n


__all__ = [
    'get_base_app_name',
]


def get_base_app_name():
    """
    Base App name, which this script belongs to.
    """
    import __main__
    main_name = __main__.__file__
    absolute_path = os.path.normpath(main_name)
    parts = absolute_path.split(os.path.sep)
    parts.reverse()
    for key in ("apps", "slave-apps", "master-apps"):
        try:
            idx = parts.index(key)
            if parts[idx + 1] == "etc":
                return parts[idx - 1]
        except (ValueError, IndexError):
            pass
    raise RestError(
        status=500,
        message=sprintf(_('Cannot get app name from file: %s') % main_name)
    )
