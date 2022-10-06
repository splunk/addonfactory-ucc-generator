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

## ModuleNotFoundError: No module named '<library-name\>'

If you see this message in Splunk when your modular input is being run, it means that Splunk could not find a library you are trying to import.

It can be because of:

* there is no such library in the `package/lib` folder -> you need to check your `package/lib/requirements.txt` file to make sure that you have it as part of the requirements
* there is no `import import_declare_test` at the top of your modular input file -> add the import mentioned to the top of your modular input file
