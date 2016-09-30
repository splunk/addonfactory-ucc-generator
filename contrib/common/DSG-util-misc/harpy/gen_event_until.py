import time
import argparse

import splunklib.client as client
import splunktalib.conf_manager.ta_conf_manager as tcm
import splunktalib.credentials as cred


def get_event_count(serv):
    job = serv.search("search * | stats count", **{"exec_mode": "blocking"})

    return int(job["eventCount"])


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("count", help="Number of events", type=int)
    args = parser.parse_args()

    service = client.connect(host="localhost", port=8089, username="admin", password="changeme")
    service.restart(timeout=600)

    event_count = get_event_count(service)

    if event_count < args.count:
        while event_count < args.count:
            time.sleep(60)
            event_count = get_event_count(service)

    session_key = cred.CredentialManager.get_session_key("admin", "changeme")
    mgr = tcm.TAConfManager("app.conf", "https://localhost:8089", session_key, "SA-Eventgen")
    mgr.update({"name": "install", "state": "disabled"})
    service.restart(timeout=600)
