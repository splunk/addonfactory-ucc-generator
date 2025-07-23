import logging


def map(self, records):
    """Computes sum(fieldname, 1, n) and stores the result in 'total'"""
    fieldnames = self.fieldnames
    total = 0.0
    for record in records:
        for fieldname in fieldnames:
            total += float(record[fieldname])
    yield {self.total: total}


def reduce(self, records):
    """Computes sum(total, 1, N) and stores the result in 'total'"""
    fieldname = self.total
    total = 0.0
    for record in records:
        value = record[fieldname]
        try:
            total += float(value)
        except ValueError:
            logging.debug(
                "could not convert %s value to float: %s", fieldname, repr(value)
            )
    yield {self.total: total}
