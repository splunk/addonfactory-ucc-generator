# .conf files

`ucc-gen` generates the following `.conf` files in the `default` directory.
If any of the `.conf` file is present in the source directory, `ucc-gen` will
just copy the file to the output folder. The only exception is `app.conf` file.

> Note: for most of the use cases, generated configuration is sufficient, if you
> need to adjust the file which being generated, please ping us for a feature 
> request or create a file in the `default` location, so it will be taken 
> instead of being generated. 

## `app.conf`

`ucc-gen` will merge the file present in the `default` folder with some 
additional information generated during the build time. But if you don't need 
anything specific, you don't need to have `app.conf` in the source folder. 

It uses `app.manifest` file to determine add-on description, add-on name, add-on
title and add-on author (taking first one if multiple defined). Make sure that
your `app.manifest` is up-to-date, so `app.conf` will have relevant information
as well.

Also, `triggers` stanza will be created by `ucc-gen`, it will determine what 
are the `.conf` files used in the add-on and generates the relevant key-value 
pairs.

## `inputs.conf`

`ucc-gen` will generate a stanza for every input defined in the `globalConfig` 
file and set `python.version` to `python3`.

## `server.conf`

`ucc-gen` will generate `shclustering` stanza, it will determine what are the 
`.conf` files used in the add-on and generates the relevant key-value pairs.

## `web.conf`
 
`ucc-gen` will generate all needed information about the endpoints being exposed
from the add-on.

## `restmap.conf`

`ucc-gen` will generate all needed information about the configuration of every
endpoint.
