
from builtins import object
class BaseHookMixin(object):
    """ Base Hook Mixin class
    """
    def create_hook(self, session_key, config_name, stanza_id, payload):
        """Create hook called before the actual create action

        Args:
            config_name: configuration name
            stanza_id: the id of the stanza to create
            payload: data dict
        """
        pass

    def edit_hook(self, session_key, config_name, stanza_id, payload):
        """Edit hook called before the actual create action

        Args:
            config_name: configuration name
            stanza_id: the id of the stanza to edit
            payload: data dict
        """
        pass

    def delete_hook(self, session_key, config_name, stanza_id):
        """Delete hook called before the actual create action

        Args:
            config_name: configuration name
            stanza_id: the id of the stanza to delete
        """
        pass
