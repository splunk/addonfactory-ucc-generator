from typing import Dict, Any

from splunk_add_on_ucc_framework.tabs.logging_tab import LoggingTab
from splunk_add_on_ucc_framework.tabs.tab import Tab


TAB_TYPES = [
    LoggingTab,
]


def resolve_tab(definition: Dict[Any, Any]) -> Tab:
    for tab_type in TAB_TYPES:
        tab_obj = tab_type.from_definition(definition)

        if tab_obj is not None:
            return tab_obj

    return Tab(definition)
