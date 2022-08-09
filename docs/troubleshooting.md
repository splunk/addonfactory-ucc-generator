# Troubleshooting

## Splunk calls your modular input only once

In case Splunk calls your modular input only once however you are
specifying an interval within it should call your script - check
`use_single_instance` variable in `get_scheme` method of your modular
input class. It should be set False so that Splunk can schedule the
input accordingly.

To be able to understand that Splunk does not schedule your modular
input script, search for "index=_internal ExecProcessor" and look for
"interval: run once" near your script name.
