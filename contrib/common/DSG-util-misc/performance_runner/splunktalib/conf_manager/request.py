import splunktalib.rest as rest
from splunktalib.common import log

logger = log.Logs().get_logger("util")


class ConfRequestException(Exception):
    pass


class ConfNotExistsException(ConfRequestException):
    pass


class ConfExistsException(ConfRequestException):
    pass


def content_request(uri, session_key, method, payload, err_msg):
    """
    :return: response content if successful otherwise raise
    ConfRequestException
    """

    resp, content = rest.splunkd_request(uri,
                                         session_key,
                                         method,
                                         data=payload,
                                         retry=3)
    if resp is None and content is None:
        return None

    if resp.status >= 200 and resp.status <= 204:
        return content
    else:
        msg = "{}, status={}, reason={}, detail={}".format(
            err_msg, resp.status, resp.reason, content)
        logger.error(msg)

        if resp.status == 404:
            raise ConfNotExistsException(msg)
        if resp.status == 409:
            raise ConfExistsException(msg)
        else:
            if content and "already exists" in content:
                raise ConfExistsException(msg)
            raise ConfRequestException(msg)
