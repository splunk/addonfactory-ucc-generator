from dataclasses import dataclass
from typing import List, Optional
from splunk_add_on_ucc_framework.commands.openapi_generator.object_to_json import Init


class TestObjectToJson:
    def test_single_level(self):
        @dataclass
        class DC1(Init):
            v1: str

        dc1 = DC1(v1="str1")
        assert dc1.json["v1"] == "str1"

    def test_class_encapsulation(self):
        @dataclass
        class In(Init):
            v_in: str

        @dataclass
        class Out(Init):
            v_out: str
            in_out: In

        in_obj = In(v_in="internal")
        out = Out(v_out="external", in_out=in_obj)

        j = out.json
        assert j["v_out"] == "external"
        assert j["in_out"]["v_in"] == "internal"

    def test_list_element(self):
        @dataclass
        class In(Init):
            v_in: str

        @dataclass
        class Out(Init):
            v_out: List[str]
            in_out: List[In]

        in1 = In(v_in="in1v")
        in2 = In(v_in="in2v")
        out = Out(v_out=["out1v", "out2v"], in_out=[in1, in2])

        j = out.json

        assert j["v_out"][0] == "out1v"
        assert j["v_out"][1] == "out2v"

        assert j["in_out"][0]["v_in"] == "in1v"
        assert j["in_out"][1]["v_in"] == "in2v"

    def test_optional_fields(self):
        @dataclass
        class In(Init):
            v_in: str
            o_in: Optional[str] = None

        in1 = In(v_in="in1v")
        j = in1.get_json()

        assert j["v_in"] == "in1v"
        assert j["o_in"] is None

    def test_ignore_optional_fields(self):
        @dataclass
        class In(Init):
            v_in: str
            o_in: Optional[str] = None

        in1 = In(v_in="in1v")
        j = in1.json
        assert j["v_in"] == "in1v"
        assert "o_in" not in j
