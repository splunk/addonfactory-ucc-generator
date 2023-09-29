import pytest
from splunk_add_on_ucc_framework.commands.openapi_generator.json_to_object import (
    DataClasses,
)


def test_simple_key_value_pair():
    dc = DataClasses({"k": "v"})

    assert hasattr(dc, "k")
    assert hasattr(dc, "v") is False
    assert dc.k == "v"
    with pytest.raises(AttributeError):
        dc.v == "k"  # type: ignore


def test_empty_json():
    cd = DataClasses({})

    assert cd.__dict__ == {}


def test_list_json():
    j = [
        {"k1": "v1"},
        {"k2": "v2"},
    ]

    for i in range(2):
        cd = DataClasses(json=j[i])
        k = list(j[i])[0]
        assert hasattr(cd, k)
        assert getattr(cd, k) == j[i][k]


def test_getattr_list():
    dc = DataClasses({"k": ["v1", "v2"]})

    assert dc.k == ["v1", "v2"]  # type: ignore


def test_getattr_dict():
    dc = DataClasses({"k": {"k1": "v1"}})

    assert dc.k == DataClasses({"k1": "v1"})  # type: ignore
