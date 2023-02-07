import json as json_lib
import pytest
from splunk_add_on_ucc_framework.commands.openapi_generator.json_to_object import DataClasses


class TestDataClasses:
    def test_simple_key_value_pair(self):
        j = json_lib.loads('{"k":"v"}')
        cd = DataClasses(json=j)
        assert hasattr(cd,"k")
        assert hasattr(cd,"v")==False
        assert cd.k == "v"
        with pytest.raises(AttributeError):
            cd.v == "k"
    
    def test_empty_json(self):
        j = json_lib.loads('{}')
        cd = DataClasses(json=j)
        with pytest.raises(AttributeError):
            cd.v == "k"
        assert cd._json == {}
        
    def test_none_json(self):
        with pytest.raises(TypeError):
            DataClasses(json="")
            
    def test_list_json(self):
        with pytest.raises(TypeError):
            DataClasses(json=json_lib.loads('[]'))
        
        j = json_lib.loads('[{"k1":"v1"},{"k2":"v2"}]')
        
        with pytest.raises(TypeError):
            DataClasses(json=j)
        
        for i in range(len(j)):
            cd = DataClasses(json=j[i])
            k = list(j[i])[0]
            assert hasattr(cd,k)
            assert getattr(cd,k) == j[i][k]
        
    def test_json_from_file(self, tmp_path):
        
        CONTENT = '''{"k":
            [
                "v"
            ]
        }
        '''
        d = tmp_path / "sub"
        d.mkdir()
        p = d / "hello.json"
        p.write_text(CONTENT)
        cd = DataClasses(json_path=p)
        assert cd.k == ['v']
        
        CONTENT = '''{"k":
            [
                {"k1":1},
                {"k1":"1"}
            ]
        }
        '''
        p.write_text(CONTENT)
        cd = DataClasses(json_path=p)
        assert cd.k[0].k1 == 1
        assert cd.k[1].k1 == "1"
        
        CONTENT = '''{"k":
                {
                    "k1":1,
                    "k2":null
                }
        }
        '''
        p.write_text(CONTENT)
        cd = DataClasses(json_path=p)
        assert cd.k.k1 == 1
        assert cd.k.k2 == None