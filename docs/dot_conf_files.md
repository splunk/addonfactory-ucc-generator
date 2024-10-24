# .conf files

`ucc-gen` generates the following `.conf` files in the `default` directory.
If any of the `.conf` files are present in the source directory, `ucc-gen` copies that file to the output folder. The only exception is the `app.conf` file.

> For most of the use cases, the generated configuration is sufficient. If you
> need to adjust the file that is generated, contact Splunk with a feature
> request. Alternatively, create a file in the `default` location, so it will accepted
> without being generated.

## `app.conf`

`ucc-gen` merges the file present in the `default` folder with some
additional information generated during the build time. But if you don't need
anything specific generated, you don't need to have `app.conf` in the source folder.

app.conf uses the `app.manifest` file to determine the add-on description, the add-on name,
the add-on title, and the add-on author (taking the first one if multiple are defined).
Make sure that your `app.manifest` is up-to-date, so `app.conf` will have all relevant information.

Also the `triggers` stanza is created by `ucc-gen`. It <!--- it stands for stanza or ucc-gen---> determines what
the `.conf` files are used in the add-on and generates the relevant key-value
pairs.

## `inputs.conf`

`ucc-gen` generates a stanza for every input defined in the `globalConfig`
file and sets `python.version` to `python3`.

## `server.conf`

`ucc-gen` generates the `shclustering` stanza. This stanza determines which
`.conf` files are used in the add-on and generates the relevant key-value pairs.

## `web.conf`

`ucc-gen` generates information about the exposed endpoints from the add-on.

## `restmap.conf`

`ucc-gen` generates information about the configuration of every endpoint.
