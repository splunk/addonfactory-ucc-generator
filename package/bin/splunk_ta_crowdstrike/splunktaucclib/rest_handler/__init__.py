"""REST Manager for handling *.conf in Splunk add-on including data inputs:
1. basic CRUD handler
2. easy-to-use model configuration
3. common error control
4. arguments validation & normalization
5. encrypt specified arguments

Some directions:
1. It dose not allow to create object with name starting with '_'.
2. Call [GET] ``<endpoint url>/_new``  to get fields info before creating.
3. Call [GET] ``<endpoint url>/_reload`` to load direct-editing content
    from *.conf before getting.
"""
