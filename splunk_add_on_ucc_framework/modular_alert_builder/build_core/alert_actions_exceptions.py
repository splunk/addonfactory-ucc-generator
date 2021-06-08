#
# Copyright 2021 Splunk Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

class AlertParameterInputSettingNotImplemented(Exception):
    pass


class AlertIconPathInvalid(Exception):
    pass


class AlertIconFileDoesNotExist(Exception):
    pass


class AlertActionsInValidArgs(Exception):
    pass


class AlertActionsNotSupportedFeature(Exception):
    pass


class AlertActionsDoWorkNotImplemented(Exception):
    pass


class AlertActionsFailedToLoadInputSettingJson(Exception):
    pass


class AlertTestSettingFileDoesNotExist(Exception):
    pass


class AlertTestInputUnsupportedMode(Exception):
    pass


class AlertTestJsonFileLoadFailure(Exception):
    pass


class AlertTestWritingFileFailure(Exception):
    pass


class AlertSearchCreatingFailure(Exception):
    pass


class AlertTestBuildTAFailure(Exception):
    pass


class AlertTestKillingSubprocessFailure(Exception):
    pass


class AlertTestSubprocessTimeoutFailure(Exception):
    pass


class AlertTestCodeFileNotExistFailure(Exception):
    pass


class AlertCleaningFormatFailure(Exception):
    pass
