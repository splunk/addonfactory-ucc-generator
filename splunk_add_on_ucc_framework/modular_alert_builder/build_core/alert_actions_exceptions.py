# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

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
