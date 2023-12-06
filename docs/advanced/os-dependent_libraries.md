This feature allows us to download and unpack libraries with appropriate binaries for the indicated operating system during the build process.
To do this, you need to expand the **meta** section in global config with the **os-dependentLibraries** field. This field takes the following attributes:


| Property                                                | Type    | Description                                                                                                                                                                                                                                                              | default value |
|---------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| name<span class="required-asterisk">*</span>            | string  | Name of the library we want to download.                                                                                                                                                                                                                                 | -             |
| version<span class="required-asterisk">*</span>         | string  | Specific version of given library (required)(string).                                                                                                                                                                                                                    | -             |
| dependencies                                            | boolean | Optional parameter which determines whether the "--no-deps" flag will be used. When the value is set to true, the flag "--no-deps" is missing and specified library will be downloaded along with all dependencies. In this case dependency versions are handled by pip. | false         |
| platform<span class="required-asterisk">*</span>        | string  | The platform for which we want to download the specified library. The value depends on the available wheels for a given library e.g. for this wheel **cryptography-41.0.5-cp37-abi3-manylinux_2_28_x86_64.whl** platform is **manylinux_2_28_x86_64**.                   | -             |
| python-version<span class="required-asterisk">*</span>  | string  | Python version compatible with the library.                                                                                                                                                                                                                              | -             |
| target<span class="required-asterisk">*</span>          | string  | Path where the selected library will be unpacked.                                                                                                                                                                                                                        | -             |

### Usage

```
    },
    "meta": {
        "name": "<TA name>",
        "restRoot": "<restRoot>",
        "version": "<TA version>",
        "displayName": "<TA display name>",
        "schemaVersion": "<schema version>",
        "os-dependentLibraries": [
            {
                "name": "cryptography",
                "version": "41.0.5",
                "platform": "win_amd64",
                "python-version": "37",
                "target": "3rdparty/windows"
            },
            {
                "name": "cryptography",
                "version": "41.0.5",
                "dependencies": true,
                "platform": "manylinux2014_x86_64",
                "python-version": "37",
                "target": "3rdparty/linux_with_deps"
            },
            {
                "name": "cffi",
                "version": "1.15.1",
                "platform": "win_amd64",
                "python-version": "37",
                "target": "3rdparty/windows"
            }
        ]
    }
```

### Result

Running the build for the above configuration will result in the creation of the following structure:


```
output
    └──<TA>
        ├── bin
        ...
        └── lib
            └── 3rdparty
                ├── linux
                │   ├── _cffi_backend.cpython-37m-x86_64-linux-gnu.so
                │   ├── cffi
                │   ├── cffi-1.15.1.dist-info
                │   ├── cryptography
                │   └── cryptography-41.0.5.dist-info
                ├── linux_with_deps
                │   ├── _cffi_backend.cpython-37m-x86_64-linux-gnu.so
                │   ├── cffi
                │   ├── cffi-1.15.1.dist-info
                │   ├── cryptography
                │   ├── cryptography-41.0.5.dist-info
                │   ├── pycparser
                │   └── pycparser-2.21.dist-info
                └── windows
                    ├── _cffi_backend.cp37-win_amd64.pyd
                    ├── cffi
                    ├── cffi-1.15.1.dist-info
                    ├── cryptography
                    └── cryptography-41.0.5.dist-info

```