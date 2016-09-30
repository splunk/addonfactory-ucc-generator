import json


def get_credential(credential):
    if isinstance(credential, basestring):
        return json.loads(credential)
    elif isinstance(credential, dict):
        return credential
    else:
        raise ValueError('credential should be dict OR str, but {} is given'.format(type(credential)))
