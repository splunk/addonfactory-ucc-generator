def transform(self, records):
        contains = self.contains
        replace_array = self.replace_array

        if contains and replace_array:
            arr = replace_array.split(",")
            if len(arr) != 2:
                raise ValueError("Please provide only two arguments, separated by comma for 'replace'")

            for record in records:
                _raw = record.get("_raw")
                if contains in _raw:
                    record["_raw"] = _raw.replace(arr[0], arr[1])
                    yield record
            return

        if contains:
            for record in records:
                _raw = record.get("_raw")
                if contains in _raw:
                    yield record
            return

        if replace_array:
            arr = replace_array.split(",")
            if len(arr) != 2:
                raise ValueError("Please provide only two arguments, separated by comma for 'replace'")

            for record in records:
                _raw = record.get("_raw")
                record["_raw"] = _raw.replace(arr[0], arr[1])
                yield record
            return

        for record in records:
            yield record