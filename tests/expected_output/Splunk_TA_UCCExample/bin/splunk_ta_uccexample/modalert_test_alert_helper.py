# encoding = utf-8

def process_event(helper, *args, **kwargs):
    """
    # IMPORTANT
    # Do not remove the anchor macro:start and macro:end lines.
    # These lines are used to generate sample code. If they are
    # removed, the sample code will not be updated when configurations
    # are updated.

    [sample_code_macro:start]

    # The following example gets the alert action parameters and prints them to the log
    name = helper.get_param("name")
    helper.log_info("name={}".format(name))

    all_incidents = helper.get_param("all_incidents")
    helper.log_info("all_incidents={}".format(all_incidents))

    table_list = helper.get_param("table_list")
    helper.log_info("table_list={}".format(table_list))

    action = helper.get_param("action")
    helper.log_info("action={}".format(action))

    account = helper.get_param("account")
    helper.log_info("account={}".format(account))


    # The following example adds two sample events ("hello", "world")
    # and writes them to Splunk
    # NOTE: Call helper.writeevents() only once after all events
    # have been added
    helper.addevent("hello", sourcetype="test:incident")
    helper.addevent("world", sourcetype="test:incident")
    helper.writeevents(index="summary", host="localhost", source="localhost")

    # The following example gets the events that trigger the alert
    events = helper.get_events()
    for event in events:
        helper.log_info("event={}".format(event))

    # helper.settings is a dict that includes environment configuration
    # Example usage: helper.settings["server_uri"]
    helper.log_info("server_uri={}".format(helper.settings["server_uri"]))
    [sample_code_macro:end]
    """

    helper.log_info("Alert action test_alert started.")

    # TODO: Implement your alert action logic here
    return 0
