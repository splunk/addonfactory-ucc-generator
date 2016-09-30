
import re


__all__ = ['Validator', 'AnyOf', 'AllOf', 'Enum', 'Range', 'String', 'Pattern', 'Host']


class Validator(object):
    """Base class of validators.
    """
    _name = None
    
    def __init__(self):
        pass
    
    def validate(self, value):
        """Check if the value is valid. 
        @param value: value to validate.
        If it is valid, return a boolean value indicate if value is valid.
        """
        raise NotImplementedError
    
    def getName(self):
        """Get name of validator.
        """
        return self._name or self.__class__.__name__


class AnyOf(Validator):
    """A composite validator that accepts values accepted by any of its component validators.
    """

    def __init__(self, *validators):
        self._validators = validators

    def validate(self, value):
        for validator in self._validators:
            if validator.validate(value):
                return True
        return False


class AllOf(Validator):
    """A composite validator that accepts values accepted by all of its component validators.
    """

    def __init__(self, *validators):
        self._validators = validators

    def validate(self, value):
        for validator in self._validators:
            if not validator.validate(value):
                return False
        return True


class Enum(Validator):
    """A validator that accepts only a finite set of values.
    """

    def __init__(self, values=()):
        """
        @param values: The collection of valid values 
        """
        super(Enum, self).__init__()
        try:
            self._values = set(values)
        except:
            self._values = list(values)

    def validate(self, value):
        return value in self._values
 

class Range(Validator):
    """A validator that accepts values within in a certain range.
    """

    def __init__(self, minVal=None, maxVal=None):
        """
        @param minVal: If not None, values less than ``minVal`` are invalid.
        @param maxVal: If not None, values larger than ``maxVal`` are invalid.
        """
        super(Range, self).__init__()
        self._minVal = minVal
        self._maxVal = maxVal

    def validate(self, value):
        if self._minVal is not None and value < self._minVal:
            return False
        if self._maxVal is not None and value > self._maxVal:
            return False
        return True


class String(Validator):
    """A validator that accepts string values.
    """

    def __init__(self, minLen=None, maxLen=None):
        """Instantiate a String validator.

        @param minLen: If not None, strings shorter than ``minLen`` are invalid.
        @param maxLen: If not None, strings longer than ``maxLen`` are invalid.
        """
        super(String, self).__init__()
        self._minLen = minLen
        self._maxLen = maxLen

    def validate(self, value):
        if self._minLen is not None and len(value) < self._minLen:
            return False
        if self._maxLen is not None and len(value) > self._maxLen:
            return False
        return True


class Pattern(Validator):
    """A validator that accepts strings that match a given regular expression.
    """

    def __init__(self, regexp):
        """
        @param regexp: The regular expression (string or compiled) to be matched
        """
        super(Pattern, self).__init__()
        self._regexp = re.compile(regexp)

    def validate(self, value, adapt=True):
        return self._regexp.match(value) and True or False


class Host(Pattern):
    """A validator that accepts strings that represent network host/url.
    """
    
    def __init__(self):
        regexp = (
            r'^((https?:((//)|(\\\\))+)?' # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain
            r'localhost|' #localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' #ip
            r'(?::\d+)?' #port
            r'(?:/?|[/?]\S+)?)$'
        )
        super(Pattern, self).__init__(regexp)
    


