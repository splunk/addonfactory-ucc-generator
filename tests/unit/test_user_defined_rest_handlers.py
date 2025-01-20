import pytest

from splunk_add_on_ucc_framework.commands.openapi_generator import oas
from splunk_add_on_ucc_framework.commands.rest_builder.user_defined_rest_handlers import (
    RestHandlerConfig,
    UserDefinedRestHandlers,
    EndpointRegistrationEntry,
)


@pytest.fixture
def cfg_minimal():
    return RestHandlerConfig(
        name="test",
        endpoint="test",
        handlerType="EAI",
    )


def test_rest_handler_config_minimal(cfg_minimal):
    assert not cfg_minimal.supported_actions
    assert not cfg_minimal.request_parameters
    assert not cfg_minimal.response_parameters
    assert not cfg_minimal.oas_paths
    assert not cfg_minimal.endpoint_registration_entry


def test_rest_handler_config_unsupported_handler_type(cfg_minimal):
    cfg_minimal.handlerType = "unsupported"

    with pytest.raises(ValueError):
        print(cfg_minimal.oas_paths)


def test_rest_handler_config_openapi_only_specified():
    cfg = RestHandlerConfig(
        name="test_name",
        endpoint="test_endpoint",
        handlerType="EAI",
        requestParameters={
            "edit": {
                "edit_param1": {"schema": {"type": "string"}, "required": True},
            }
        },
        responseParameters={
            "edit": {
                "edit_param2": {"schema": {"type": "string"}, "required": True},
            }
        },
    )

    assert cfg.supported_actions == {"edit"}
    assert cfg.oas_paths.keys() == {"/test_endpoint/{name}"}
    assert cfg.oas_paths["/test_endpoint/{name}"] == oas.PathItemObject(
        post=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Update test_name item",
                    content={
                        "application/json": oas.MediaTypeObject(
                            schema={
                                "type": "object",
                                "properties": {
                                    "entry": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {"type": "string"},
                                                "content": {
                                                    "type": "object",
                                                    "properties": {
                                                        "edit_param2": {
                                                            "type": "string",
                                                        }
                                                    },
                                                    "required": ["edit_param2"],
                                                },
                                            },
                                        },
                                    }
                                },
                            },
                        )
                    },
                )
            },
            description="Update test_name item",
            requestBody=oas.RequestBodyObject(
                content={
                    "application/x-www-form-urlencoded": {
                        "schema": {
                            "type": "object",
                            "properties": {"edit_param1": {"type": "string"}},
                            "required": ["edit_param1"],
                        }
                    }
                },
            ),
        ),
        parameters=[
            {
                "name": "output_mode",
                "in": "query",
                "required": True,
                "description": "Output mode",
                "schema": {"type": "string", "enum": ["json"], "default": "json"},
            },
            {
                "name": "name",
                "in": "path",
                "required": True,
                "description": "The name of the item to operate on",
                "schema": {"type": "string"},
            },
        ],
    )


def test_rest_handler_config_openapi_empty_params():
    cfg = RestHandlerConfig(
        name="test_name",
        endpoint="test_endpoint",
        handlerType="EAI",
        requestParameters={
            "create": {},
            "list": {},
            "edit": {},
            "remove": {},
        },
        responseParameters={
            "create": {},
            "list": {},
            "edit": {},
            "remove": {},
        },
    )

    assert cfg.supported_actions == {"create", "list", "remove", "edit"}
    assert cfg.oas_paths.keys() == {"/test_endpoint", "/test_endpoint/{name}"}
    assert cfg.oas_paths["/test_endpoint"] == oas.PathItemObject(
        get=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Get list of items for test_name",
                )
            },
            description="Get list of items for test_name",
        ),
        post=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Create item in test_name",
                )
            },
            description="Create item in test_name",
            requestBody=oas.RequestBodyObject(
                content={
                    "application/x-www-form-urlencoded": {
                        "schema": {
                            "type": "object",
                            "properties": {"name": {"type": "string"}},
                            "required": ["name"],
                        }
                    }
                },
                description=None,
                required=False,
            ),
        ),
        parameters=[
            {
                "name": "output_mode",
                "in": "query",
                "required": True,
                "description": "Output mode",
                "schema": {"type": "string", "enum": ["json"], "default": "json"},
            },
        ],
    )
    assert cfg.oas_paths["/test_endpoint/{name}"] == oas.PathItemObject(
        get=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Get test_name item details",
                )
            },
            description="Get test_name item details",
        ),
        post=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Update test_name item",
                )
            },
            description="Update test_name item",
        ),
        delete=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Delete test_name item",
                )
            },
            description="Delete test_name item",
        ),
        parameters=[
            {
                "name": "output_mode",
                "in": "query",
                "required": True,
                "description": "Output mode",
                "schema": {"type": "string", "enum": ["json"], "default": "json"},
            },
            {
                "name": "name",
                "in": "path",
                "required": True,
                "description": "The name of the item to operate on",
                "schema": {"type": "string"},
            },
        ],
    )


def test_rest_handler_config_openapi_full():
    cfg = RestHandlerConfig(
        name="test_name",
        endpoint="test_endpoint",
        handlerType="EAI",
        requestParameters={
            "create": {
                "create_param_obj": {
                    "schema": {
                        "type": "object",
                        "properties": {"key": {"type": "string"}},
                    },
                    "required": True,
                },
                "create_param_array": {
                    "schema": {
                        "type": "array",
                        "items": {"type": "string"},
                    }
                },
            },
            "list": {
                "list_param1": {
                    "schema": {"type": "number"},
                    "required": True,
                },
            },
            "edit": {
                "edit_param1": {"schema": {"type": "string"}, "required": True},
            },
            "remove": {
                "remove_param1": {"schema": {"type": "string"}},
            },
        },
        responseParameters={
            "create": {
                "create_param2": {"schema": {"type": "string"}, "required": True},
            },
            "list": {
                "list_param2": {"schema": {"type": "number"}},
                "list_param22": {"schema": {"type": "string"}},
            },
            "edit": {
                "edit_param2": {"schema": {"type": "string"}, "required": True},
            },
            "remove": {
                "remove_param2": {"schema": {"type": "string"}},
            },
        },
    )

    assert cfg.supported_actions == {"create", "list", "edit", "remove"}
    assert cfg.oas_paths.keys() == {"/test_endpoint", "/test_endpoint/{name}"}

    get_response_schema = {
        "type": "object",
        "properties": {
            "entry": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "content": {
                            "type": "object",
                            "properties": {
                                "list_param2": {"type": "number"},
                                "list_param22": {"type": "string"},
                            },
                        },
                    },
                },
            }
        },
    }

    assert cfg.oas_paths["/test_endpoint"] == oas.PathItemObject(
        get=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Get list of items for test_name",
                    content={
                        "application/json": oas.MediaTypeObject(
                            schema=get_response_schema
                        )
                    },
                )
            },
            description="Get list of items for test_name",
            parameters=[
                {
                    "name": "list_param1",
                    "in": "query",
                    "required": True,
                    "schema": {"type": "number"},
                },
            ],
        ),
        post=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Create item in test_name",
                    content={
                        "application/json": oas.MediaTypeObject(
                            schema={
                                "type": "object",
                                "properties": {
                                    "entry": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {"type": "string"},
                                                "content": {
                                                    "type": "object",
                                                    "properties": {
                                                        "create_param2": {
                                                            "type": "string",
                                                        }
                                                    },
                                                    "required": ["create_param2"],
                                                },
                                            },
                                        },
                                    }
                                },
                            }
                        )
                    },
                )
            },
            description="Create item in test_name",
            requestBody=oas.RequestBodyObject(
                content={
                    "application/x-www-form-urlencoded": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "create_param_obj": {
                                    "type": "object",
                                    "properties": {"key": {"type": "string"}},
                                },
                                "create_param_array": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                },
                            },
                            "required": ["create_param_obj", "name"],
                        }
                    }
                }
            ),
        ),
        parameters=[
            {
                "name": "output_mode",
                "in": "query",
                "required": True,
                "description": "Output mode",
                "schema": {"type": "string", "enum": ["json"], "default": "json"},
            },
        ],
    )

    assert cfg.oas_paths["/test_endpoint/{name}"] == oas.PathItemObject(
        get=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Get test_name item details",
                    content={
                        "application/json": oas.MediaTypeObject(
                            schema=get_response_schema,
                        )
                    },
                )
            },
            description="Get test_name item details",
            parameters=[
                {
                    "name": "list_param1",
                    "in": "query",
                    "required": True,
                    "schema": {"type": "number"},
                }
            ],
            deprecated=False,
        ),
        post=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Update test_name item",
                    content={
                        "application/json": oas.MediaTypeObject(
                            schema={
                                "type": "object",
                                "properties": {
                                    "entry": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {"type": "string"},
                                                "content": {
                                                    "type": "object",
                                                    "properties": {
                                                        "edit_param2": {
                                                            "type": "string",
                                                        }
                                                    },
                                                    "required": ["edit_param2"],
                                                },
                                            },
                                        },
                                    }
                                },
                            },
                        )
                    },
                )
            },
            description="Update test_name item",
            requestBody=oas.RequestBodyObject(
                content={
                    "application/x-www-form-urlencoded": {
                        "schema": {
                            "type": "object",
                            "properties": {"edit_param1": {"type": "string"}},
                            "required": ["edit_param1"],
                        }
                    }
                },
                required=False,
            ),
            deprecated=False,
        ),
        delete=oas.OperationObject(
            responses={
                "200": oas.ResponseObject(
                    description="Delete test_name item",
                    content={
                        "application/json": oas.MediaTypeObject(
                            schema={
                                "type": "object",
                                "properties": {
                                    "entry": {
                                        "type": "array",
                                        "items": {
                                            "type": "object",
                                            "properties": {
                                                "name": {"type": "string"},
                                                "content": {
                                                    "type": "object",
                                                    "properties": {
                                                        "remove_param2": {
                                                            "type": "string"
                                                        }
                                                    },
                                                },
                                            },
                                        },
                                    }
                                },
                            },
                        )
                    },
                )
            },
            description="Delete test_name item",
            parameters=[
                {
                    "name": "remove_param1",
                    "in": "query",
                    "required": False,
                    "schema": {"type": "string"},
                }
            ],
            deprecated=False,
        ),
        parameters=[
            {
                "name": "output_mode",
                "in": "query",
                "required": True,
                "description": "Output mode",
                "schema": {"type": "string", "enum": ["json"], "default": "json"},
            },
            {
                "name": "name",
                "in": "path",
                "required": True,
                "description": "The name of the item to operate on",
                "schema": {"type": "string"},
            },
        ],
    )


def test_rest_handler_config_registration():
    for file in ("test_handler", "test_handler.py"):
        cfg = RestHandlerConfig(
            name="test_name",
            endpoint="test_endpoint",
            handlerType="EAI",
            registerHandler={
                "file": file,
                "actions": ["create", "list", "edit", "remove"],
            },
        )

        assert cfg.endpoint_registration_entry == EndpointRegistrationEntry(
            name="test_endpoint",
            rh_name="test_handler",
            actions_list=["create", "list", "edit", "remove"],
        )


def test_user_defined_rest_handlers_paths():
    # 1 path
    cfg1 = RestHandlerConfig(
        name="test_name_1",
        endpoint="test_endpoint_1",
        handlerType="EAI",
        requestParameters={
            "create": {
                "param1": {"schema": {"type": "string"}},
            }
        },
    )
    # 2 paths
    cfg2 = RestHandlerConfig(
        name="test_name_2",
        endpoint="test_endpoint_2",
        handlerType="EAI",
        requestParameters={
            "list": {
                "param2": {"schema": {"type": "string"}},
            }
        },
    )
    # 1 path
    cfg3 = RestHandlerConfig(
        name="test_name_3",
        endpoint="test_endpoint_3",
        handlerType="EAI",
        requestParameters={
            "edit": {
                "param3": {"schema": {"type": "string"}},
            }
        },
    )

    assert len(cfg1.oas_paths) == 1
    assert len(cfg2.oas_paths) == 2
    assert len(cfg3.oas_paths) == 1

    hnds = UserDefinedRestHandlers()
    hnds.add_definitions([cfg1, cfg2])
    hnds.add_definition(cfg3)

    assert hnds.oas_paths == {
        "/test_endpoint_1": cfg1.oas_paths["/test_endpoint_1"],
        "/test_endpoint_2": cfg2.oas_paths["/test_endpoint_2"],
        "/test_endpoint_2/{name}": cfg2.oas_paths["/test_endpoint_2/{name}"],
        "/test_endpoint_3/{name}": cfg3.oas_paths["/test_endpoint_3/{name}"],
    }


def test_user_defined_rest_handlers_registration_entries():
    cfg1 = RestHandlerConfig(
        name="test_name_1",
        endpoint="test_endpoint_1",
        handlerType="EAI",
        registerHandler={
            "file": "test_handler_1",
            "actions": ["create", "list"],
        },
    )
    cfg2 = RestHandlerConfig(
        name="test_name_2",
        endpoint="test_endpoint_2",
        handlerType="EAI",
        registerHandler={
            "file": "test_handler_2",
            "actions": ["edit"],
        },
    )
    cfg3 = RestHandlerConfig(
        name="test_name_3",
        endpoint="test_endpoint_3",
        handlerType="EAI",
        registerHandler={
            "file": "test_handler_3",
            "actions": ["remove"],
        },
    )

    hnds = UserDefinedRestHandlers()
    hnds.add_definitions([cfg1, cfg2, cfg3])

    assert hnds.endpoint_registration_entries == [
        EndpointRegistrationEntry(
            name="test_endpoint_1",
            rh_name="test_handler_1",
            actions_list=["create", "list"],
        ),
        EndpointRegistrationEntry(
            name="test_endpoint_2", rh_name="test_handler_2", actions_list=["edit"]
        ),
        EndpointRegistrationEntry(
            name="test_endpoint_3",
            rh_name="test_handler_3",
            actions_list=["remove"],
        ),
    ]


def test_user_defined_rest_handlers_duplicates():
    normal = RestHandlerConfig(
        name="test_name",
        endpoint="test_endpoint",
        handlerType="EAI",
    )
    duplicated_name = RestHandlerConfig(
        name="test_name",
        endpoint="test_endpoint_other",
        handlerType="EAI",
    )
    duplicated_endpoint = RestHandlerConfig(
        name="test_name_other",
        endpoint="test_endpoint",
        handlerType="EAI",
    )

    hnds = UserDefinedRestHandlers()
    hnds.add_definition(normal)

    with pytest.raises(ValueError):
        hnds.add_definition(duplicated_name)

    with pytest.raises(ValueError):
        hnds.add_definition(duplicated_endpoint)


def test_user_defined_rest_handlers_register_duplicates():
    cfg1 = RestHandlerConfig(
        name="test_name_1",
        endpoint="test_endpoint_1",
        handlerType="EAI",
        registerHandler={
            "file": "test_handler_1",
            "actions": ["create", "list"],
        },
    )
    cfg2 = RestHandlerConfig(
        name="test_name_2",
        endpoint="test_endpoint_2",
        handlerType="EAI",
        registerHandler={
            "file": "test_handler_2",
            "actions": ["edit"],
        },
    )
    cfg3 = RestHandlerConfig(
        name="test_name_3",
        endpoint="test_endpoint_3",
        handlerType="EAI",
        registerHandler={
            "file": "test_handler_2.py",
            "actions": ["remove"],
        },
    )

    hnds = UserDefinedRestHandlers()
    hnds.add_definitions([cfg1, cfg2])

    assert hnds.endpoint_registration_entries

    with pytest.raises(ValueError):
        hnds.add_definition(cfg3)
