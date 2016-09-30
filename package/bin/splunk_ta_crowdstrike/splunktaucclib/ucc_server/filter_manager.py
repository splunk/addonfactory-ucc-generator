"""
This module provides filter management.
"""

from splunktaucclib.ucc_server import UCCServerException
from collections import Iterable
import re


class FilterException(UCCServerException):
    pass


class FilterManager(object):
    """
    Filter manager.
    """

    FILTER_SETTINGS_SEPARATOR = ">"

    @staticmethod
    def _parse_filter(filters, separator):
        """
        @filters:
                  [
                      "test_global_setting>logging_server",
                      "test_forwarder>*>description"
                  ]

                  Note: "node>*>*" will be translated to "note>*". continually * in the end will be merged.
        """
        # Check filters type
        assert not isinstance(filters, basestring) and isinstance(filters, Iterable), \
            FilterException("Invalid filters type: {}. expected: non-string and iterable".format(str(type(filters))))

        # Check each filter type
        for _filter in filters:
            assert isinstance(_filter, basestring), \
                FilterException("Invalid filter type: {}".format(_filter))

        # Split each filter by FILTER_SETTINGS_SEPARATOR
        ptn1 = r"\s*{sep}\s*".format(sep=separator)
        ptn2 = r"(?:{sep}\*)+$".format(sep=separator)
        clean_fn1 = lambda s: re.sub(ptn1, separator, s.strip())
        clean_fn2 = lambda s: re.sub(ptn2, "{}*".format(separator), clean_fn1(s))
        return [clean_fn2(_filter).split(separator) for _filter in filters]

    def __init__(self, filters):
        """
        @filters:
                  [
                      "test_global_setting>logging_server",
                      "test_forwarder>*>description"
                  ]
        """
        filters = filters or []
        self._filters = self._parse_filter(filters, self.FILTER_SETTINGS_SEPARATOR)

    def _do_filter(self, settings, filters, index):
        if not isinstance(settings, dict):
            return

        for item in settings.keys():
            if filters[index] == '*' or item == filters[index]:
                if index >= len(filters)-1:
                    del settings[item]
                else:
                    self._do_filter(settings[item], filters, index+1)

    def filter_settings(self, settings):
        """
        Filter settings.
        """
        assert isinstance(settings, dict), FilterException("setting passed is not dict type: {}", type(settings))
        for _filter in self._filters:
            if _filter:
                self._do_filter(settings, _filter, 0)

        return settings
