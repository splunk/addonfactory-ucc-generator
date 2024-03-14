from typing import Dict, Any, Optional, List


class Tab(Dict[str, Any]):
    @property
    def name(self) -> str:
        return self["name"]

    @property
    def title(self) -> str:
        return self["title"]

    @property
    def entity(self) -> List[Dict[str, Any]]:
        return self["entity"]

    @property
    def tab_type(self) -> Optional[str]:
        return self.get("type")

    def render(self) -> Dict[str, Any]:
        return dict(self)

    @classmethod
    def from_definition(cls, definition: Dict[str, Any]) -> Optional["Tab"]:
        return cls(definition)
