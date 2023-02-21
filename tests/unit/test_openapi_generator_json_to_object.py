import json as json_lib
import pytest
from splunk_add_on_ucc_framework.commands.openapi_generator.json_to_object import (
    DataClasses,
)


def test_simple_key_value_pair():
    j = json_lib.loads('{"k":"v"}')
    cd = DataClasses(json=j)
    assert hasattr(cd, "k")
    assert hasattr(cd, "v") is False
    assert cd.k == "v"
    with pytest.raises(AttributeError):
        cd.v == "k"


def test_empty_json():
    j = json_lib.loads("{}")
    cd = DataClasses(json=j)
    with pytest.raises(AttributeError):
        cd.v == "k"
    assert cd._json == {}


def test_list_json():
    j = json_lib.loads('[{"k1":"v1"},{"k2":"v2"}]')

    for i in range(len(j)):
        cd = DataClasses(json=j[i])
        k = list(j[i])[0]
        assert hasattr(cd, k)
        assert getattr(cd, k) == j[i][k]
