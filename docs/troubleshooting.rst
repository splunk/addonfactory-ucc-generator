Troubleshooting
===============

Splunk calls your modular input only once
-----------------------------------------

In case Splunk calls your modular input only once however you are specifying an
interval within it should call your script - check :code:`use_single_instance`
variable in :code:`get_scheme` method of your modular input class. It should be
set :code:`False` so that Splunk can schedule the input accordingly.

To be able to understand that Splunk does not schedule your modular input script,
search for :code:`"index=_internal ExecProcessor"` and look for
:code:`"interval: run once"` near your script name.
