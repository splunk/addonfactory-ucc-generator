

__all__ = ['Normaliser', 'Boolean', 'StringLower', 'StringUpper']


class Normaliser(object):
    """Base class of Normaliser.
    """
    _name = None
    
    def __init__(self):
        pass
    
    def normalize(self, value):
        """Normalize a given value. 
        @param value: value to normalize.
        @return: normalized value.
        """
        raise NotImplementedError
    
    def getName(self):
        """Get name of normaliser.
        """
        return self._name or self.__class__.__name__


class Boolean(Normaliser):
    """Normalize a boolean field.
    """
    def normalize(self, value):
        if isinstance(value, bool) or isinstance(value, int):
            return value and '1' or '0'
        if isinstance(value, basestring) and value.strip().lower() in {'true', 't', '1', 'yes', 'y'}:
            return '1'
        return '0'

class StringLower(Normaliser):
    """Normalize a string to all lower cases.
    """
    def normalize(self, value):
        if isinstance(value, basestring):
            return value.strip().lower()
        return value

class StringUpper(Normaliser):
    """Normalize a string to all upper cases.
    """
    def normalize(self, value):
        if isinstance(value, basestring):
            return value.strip().upper()
        return value
    