from textwrap import dedent

import pytest

from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.multiple_model import (
    MultipleModelEndpointBuilder,
)
from splunk_add_on_ucc_framework.commands.rest_builder.endpoint.single_model import (
    SingleModelEndpointBuilder,
    SingleModelEntityBuilder,
)


@pytest.mark.parametrize("need_reload", [True, False])
def test_multiple_model_endpoint_builder_need_reload(need_reload):
    endpoint = MultipleModelEndpointBuilder("test", "test", need_reload=need_reload)
    assert endpoint.generate_rh() == dedent(
        f"""
        import import_declare_test

        from splunktaucclib.rest_handler.endpoint import (
            field,
            validator,
            RestModel,
            MultipleModel,
        )
        from splunktaucclib.rest_handler import admin_external, util
        from None import None
        import logging

        util.remove_http_proxy_env_vars()



        endpoint = MultipleModel(
            'test_test',
            models=[

            ],
            need_reload={need_reload},
        )


        if __name__ == '__main__':
            logging.getLogger().addHandler(logging.NullHandler())
            admin_external.handle(
                endpoint,
                handler=None,
            )
        """
    )


@pytest.mark.parametrize("need_reload", [True, False])
def test_single_model_endpoint_builder_need_reload(need_reload):
    endpoint = SingleModelEndpointBuilder("test", "test", need_reload=need_reload)
    endpoint.add_entity(SingleModelEntityBuilder("test_entity", []))
    assert endpoint.generate_rh() == dedent(
        f"""
        import import_declare_test

        from splunktaucclib.rest_handler.endpoint import (
            field,
            validator,
            RestModel,
            SingleModel,
        )
        from splunktaucclib.rest_handler import admin_external, util
        from None import None
        import logging

        util.remove_http_proxy_env_vars()


        fields = [

        ]
        model = RestModel(fields, name='test_entity')


        endpoint = SingleModel(
            'test_test',
            model,
            config_name='test',
            need_reload={need_reload},
        )


        if __name__ == '__main__':
            logging.getLogger().addHandler(logging.NullHandler())
            admin_external.handle(
                endpoint,
                handler=None,
            )
        """
    )
