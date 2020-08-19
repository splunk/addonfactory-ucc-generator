"""
REST Builder.
"""

from __future__ import absolute_import

import collections
from splunk_add_on_ucc_framework.splunktaucclib.rest_handler.schema import RestSchema

from .builder import (
    RestBuilder,
    RestBuilderError,
)

__all__ = [
    "RestBuilder",
    "RestBuilderError",
    "RestHandlerClass",
    "build",
]

__version__ = "3.6.3"


RestHandlerClass = collections.namedtuple("RestHandlerClass", ("module", "name"),)


def build(schema, handler, output_path, j2_env, post_process=None, *args, **kwargs):
    """
    Build REST for Add-on.

    :param schema: REST schema.
    :type schema: RestSchema
    :param handler: REST handler class import path:
            ``module.sub_module.RestHandlerClass``.
        The HandlerClass must be subclass of
        splunktaucclib.rest_handler.admin_external.AdminExternalHandler.
    :type handler: str
    :param output_path: path for output.
    :param post_process:
    :param args: args for post_process.
    :param kwargs: kwargs for post_process.
    :return:
    """

    def _parse_handler(handler_path):
        parts = handler_path.split(".")
        if len(parts) <= 1:
            raise RestBuilderError(
                "Invalid handler specified. "
                'It should be in form "module.sub_module.RestHandlerClass".'
            )
        return RestHandlerClass(module=".".join(parts[:-1]), name=parts[-1],)

    builder_obj = RestBuilder(schema, _parse_handler(handler), output_path)
    builder_obj.build()
    if post_process is not None:
        post_process(builder_obj, schema, *args, **kwargs)
    return builder_obj
