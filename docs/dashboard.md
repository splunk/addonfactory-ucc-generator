# Dashboard

UCC introduces a support for a dashboard page (available from v5.27.0).
The dashboard page configuration is generated if `ucc-gen init` command is used.
The dashboard page is optional, you can delete it from configuration if you
don't need it in your add-on.

The dashboard page provides some additional information about the add-on
operations to increase the visibility into what is add-on is actually doing
under the hood.

As of now, 3 pre-built panels are supported:

* Add-on version
* Events ingested by sourcetype
* Errors in the add-on

> Note: if you change the dashboard page (Edit button) after the add-on is
> installed, the changes go to `local` folder, and you will see your version
> of the dashboard even if you update an add-on. 
