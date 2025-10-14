[test_alert]
param._cam = <json> Adaptive Response parameters.
param.name = <string> Name. It's a required parameter. It's default value is xyz.
param.description = <string> Description. It's a required parameter. It's default value is some sample description.
param.all_incidents = <bool> All Incidents.
param.table_list = <list> Table List.  It's default value is problem.
param.action = <list> Action:. It's a required parameter. It's default value is update.
param.account = <list> Select Account. It's a required parameter.
python.required = {3.7|3.9|3.13}
* For Python scripts only, selects which Python version to use.
* Set to "3.9" to use the Python 3.9 version.
* Set to "3.13" to use the Python 3.13 version.
* Optional.
* Default: not set

[test_alert_default]
param._cam = <json> Adaptive Response parameters.
param.name = <string> Name. It's a required parameter. It's default value is xyz.
python.required = {3.7|3.9|3.13}
* For Python scripts only, selects which Python version to use.
* Set to "3.9" to use the Python 3.9 version.
* Set to "3.13" to use the Python 3.13 version.
* Optional.
* Default: not set
