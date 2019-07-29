from table import Table

class ConfigurationTable(Table):
    """
    The table located in the configuration page.
    """
    def __init__(self, browser, container, mapping={}):
        super(ConfigurationTable, self).__init__(browser, container, mapping)