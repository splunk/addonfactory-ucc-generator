import splunktalib.rest as rest
import splunktalib.common.xml_dom_parser as xdp


def _do_rest(uri, session_key):
    resp, content = rest.splunkd_request(uri, session_key)
    if resp is None:
        return None

    if resp.status not in (200, 201):
        return None

    stanza_objs = xdp.parse_conf_xml_dom(content)
    if not stanza_objs:
        return None

    return stanza_objs[0]


class ServerInfo(object):
    def __init__(self, splunkd_uri, session_key):
        uri = "{}/services/server/info".format(splunkd_uri)
        server_info = _do_rest(uri, session_key)
        if server_info is None:
            raise Exception("Failed to init ServerInfo")

        self._server_info = server_info

    def is_captain(self):
        """
        :return: True if splunkd_uri is captain otherwise False
        """

        return "shc_captain" in self._server_info["server_roles"]

    def is_search_head(self):
        for sh in ("search_head", "cluster_search_head"):
            if sh in self._server_info["server_roles"]:
                return True
        return False

    def is_shc_member(self):
        return "cluster_search_head" in self._server_info["server_roles"]

    def version(self):
        return self._server_info["version"]

    def to_dict(self):
        return self._server_info


if __name__ == "__main__":
    import splunktalib.credentials as cred

    sp_uri = "https://localhost:8089"
    skey = cred.CredentialManager.get_session_key("admin", "admin")
    si = ServerInfo(sp_uri, skey)
    assert (not si.is_captain())

    sp_uri = "https://qa-systest-03.sv.splunk.com:1901"
    skey = cred.CredentialManager.get_session_key("admin", "notchagneme")
    si = ServerInfo(sp_uri, skey)
    assert (si.is_captain())
    assert (si.is_search_head())

    sp_uri = "https://qa-systest-01.sv.splunk.com:1901"
    skey = cred.CredentialManager.get_session_key("admin", "notchagneme")
    si = ServerInfo(sp_uri, skey)
    assert (not si.is_captain())
    assert (si.is_search_head())
