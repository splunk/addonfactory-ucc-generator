This feature allows us to download and unpack libraries with appropriate binaries for the indicated operating system during the build process.
To do this, you need to expand the **meta** section in global config with the **os-dependentLibraries** field. This field takes the following attributes:


| Property                                               | Type    | Description                                                                                                                                                                                                                                                              | default value |
|--------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| name<span class="required-asterisk">*</span>           | string  | Name of the library we want to download.                                                                                                                                                                                                                                 | -             |
| version<span class="required-asterisk">*</span>        | string  | Specific version of given library.                                                                                                                                                                                                                                       | -             |
| dependencies                                           | boolean | Optional parameter which determines whether the "--no-deps" flag will be used. When the value is set to true, the flag "--no-deps" is missing and specified library will be downloaded along with all dependencies. In this case dependency versions are handled by pip. | false         |
| platform<span class="required-asterisk">*</span>       | string  | The platform for which we want to download the specified library. The value depends on the available wheels for a given library e.g. for this wheel **cryptography-41.0.5-cp37-abi3-manylinux_2_28_x86_64.whl** platform is **manylinux_2_28_x86_64**.                   | -             |
| python_version<span class="required-asterisk">*</span> | string  | Python version compatible with the library.                                                                                                                                                                                                                              | -             |
| target<span class="required-asterisk">*</span>         | string  | Path where the selected library will be unpacked.                                                                                                                                                                                                                        | -             |
| os<span class="required-asterisk">*</span>             | string  | The name of the operating system for which the library is intended. Using this parameter, an appropriate insert into sys.path will be created. It takes 3 values **windows**, **linux** and **darwin**.                                                                  | -             |

### About wheels files

Generally, the wheel name convention is <br>**{distribution}-{version}(-{build tag})?-{python tag}-{abi tag}-{platform tag}.whl**.<br>
For example for this particular library: <br>**grpcio-1.54.2-cp37-cp37m-manylinux_2_17_x86_64.manylinux2014_x86_64.whl**<br> 
your pip parameters are:

* name = **grpcio**
* version = **1.54.2**
* platform = **manylinux_2_17_x86_64** or **manylinux2014_x86_64**
* python_version = **37**
* target = **your/path/to/target**
* os = **linux**

and your pip command should look like this:<br>
`pip install --no-deps --platform manylinux_2_17_x86_64 --python-version 37 --target your/path/to/target --only-binary=:all: grpcio==1.54.2`

A dot in the platform part indicates that a given distribution supports several platforms.
In this case "**.**" in **manylinux_2_17_x86_64.manylinux2014_x86_64** means this distribution supports both **manylinux_2_17_x86_64** and **manylinux2014_x86_64**.


for more informations, we recommend watching [.whl](https://www.youtube.com/watch?v=4L0Jb3Ku81s) and [manylinux platform](https://www.youtube.com/watch?v=80j-MRtHMek)


### Usage

```
    ...
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
                "platform": "manylinux2014_x86_64",
                "python_version": "37",
                "os": "linux",
                "target": "3rdparty/linux"
            },
            {
                "name": "cryptography",
                "version": "41.0.5",
                "platform": "win_amd64",
                "python_version": "37",
                "os": "windows",
                "target": "3rdparty/windows"
            },
            {
                "name": "cryptography",
                "version": "41.0.5",
                "dependencies": true,
                "platform": "manylinux2014_x86_64",
                "python_version": "37",
                "os": "linux",
                "target": "3rdparty/linux_with_deps"
            },
            {
                "name": "cffi",
                "version": "1.15.1",
                "platform": "win_amd64",
                "python_version": "37",
                "os": "windows",
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
  
During the build process, a python script "import_declare_test.py" will be created in **output/ta_name/bin** to manipulate system paths. 
In each input using the specified libraries, this script must be imported. 
Currently, three operating systems are supported: **Windows**, **Linux** and **Darwin**. 
If, for development purposes, there is a need to create other custom manipulations on sys.path, 
create your own script called "import_declare_test.py" and place it in the **package/bin** folder. 
This way, when building the TA, the default script will be replaced with the one created by the developer.  
The default script for the above configuration will look like this:

```python
import os
import sys
import re
from os.path import dirname

ta_name = 'demo_addon_for_splunk'
pattern = re.compile(r'[\\/]etc[\\/]apps[\\/][^\\/]+[\\/]bin[\\/]?$')
new_paths = [path for path in sys.path if not pattern.search(path) or ta_name in path]
new_paths.insert(0, os.path.join(dirname(dirname(__file__)), "lib"))
new_paths.insert(0, os.path.sep.join([os.path.dirname(__file__), ta_name]))
sys.path = new_paths

bindir = os.path.dirname(os.path.realpath(os.path.dirname(__file__)))
libdir = os.path.join(bindir, "lib")
platform = sys.platform
if platform.startswith("linux"):
	sys.path.insert(0, os.path.join(libdir, "3rdparty/linux_with_deps"))
	sys.path.insert(0, os.path.join(libdir, "3rdparty/linux"))
if platform.startswith("win"):
	sys.path.insert(0, os.path.join(libdir, "3rdparty/windows"))

```