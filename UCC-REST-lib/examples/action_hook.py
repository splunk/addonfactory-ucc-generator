
def delete_hook(**kwargs):
    """Delete hook called before the actual delete action

    Args:
        id: the id of the stanza to delete
        name: service name
    """
    pass

def create_hook(**kwargs):
    """Create hook called before the actual create action

    Args:
        id: the id of the stanza to create
        name: service name
        payload: data dict
    """
    pass

def edit_hook(**kwargs):
    """Edit hook called before the actual edit action

    Args:
        id: the id of the stanza to edit
        name: service name
        payload: data dict
    """
    pass
