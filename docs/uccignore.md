# `.uccignore` file

This feature can be used to remove files from the output **after** the UCC template files were copied and **before** the source of the 
add-on recursively overrides the output folder.

Place it in the same folder as the `globalConfig` file to have the effect.

You will see a warning message in case the ignored file is not found in the output folder.
