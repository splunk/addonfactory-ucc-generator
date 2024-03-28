import import_declare_test
from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
# any other imports required for validation

def _validate_organization(organization_id, organization_api_key):
    # Some code to validate the API key.
    # Should return nothing if the configuration is valid.
    # Should raise an exception splunktaucclib.rest_handler.error.RestError if the configuration is not valid.
    pass


class CustomAccountValidator(AdminExternalHandler):
    def __init__(self, *args, **kwargs):
        AdminExternalHandler.__init__(self, *args, **kwargs)

    def handleList(self, confInfo):
        AdminExternalHandler.handleList(self, confInfo)

    def handleEdit(self, confInfo):
        _validate_organization(
            self.payload.get("organization_id"),
            self.payload.get("organization_api_key"),
        )
        AdminExternalHandler.handleEdit(self, confInfo)

    def handleCreate(self, confInfo):
        _validate_organization(
            self.payload.get("organization_id"),
            self.payload.get("organization_api_key"),
        )
        AdminExternalHandler.handleCreate(self, confInfo)

    def handleRemove(self, confInfo):
        AdminExternalHandler.handleRemove(self, confInfo)
