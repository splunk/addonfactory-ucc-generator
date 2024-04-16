def validate_params(helper):
    # logic to validate the params that are passed.
    # they can be accessed via helper.get_param(<field_name>)
    return 0

def process_event(helper, *args, **kwargs):
    if not validate_params(helper):
        return 3
    
    helper.log_info("Alert action test_alert started.")
    # TODO: Implement your alert action logic here

    
    # if clean execution, return 0, 
    # else non-zero number
    return 0
