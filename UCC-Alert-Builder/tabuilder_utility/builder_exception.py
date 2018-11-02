class CommonException(Exception):
    def __init__(self, e_message='', err_code=None, options={}):
        super(CommonException, self).__init__(self, e_message)
        self.err_msg = e_message
        self.e_code = err_code
        self.options = options

    def __repr__(self):
        return self._str()

    def __str__(self):
        return self._str()

    def _str(self):
        return "CommonException:" + str(self.err_msg) + " ErrorCode:" + str(self.e_code) + " ErrorOptions:" + str(self.options)

    def set_err_code(self, err_code):
        self.e_code = err_code

    def get_err_code(self):
        return self.e_code

    def set_option(self, key, name):
        self.options[key] = name

    def get_option(self, key):
        return self.options.get(key, None)

    def get_options(self):
        return dict(self.options)

class BracketMismatch(Exception):
    def __init__(self, msg=''):
        super(BracketMismatch, self).__init__(self, msg)
        self.err_msg = msg
        
class QuoteMismatch(Exception):
    def __init__(self, msg=''):
        super(BracketMismatch, self).__init__(self, msg)
        self.err_msg = msg