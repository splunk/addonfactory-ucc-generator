# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

# encode=utf-8

class MetricException(Exception):
    def __init__(self, *args, **kwargs):
        super(MetricException, self).__init__(*args, **kwargs)
