# `.uccignore` file

This feature can be used to remove files from the output **after** the UCC template files were copied and **before** the source of the 
add-on recursively overrides the output folder.

Place it in the same folder as the `globalConfig` file to have the effect.

Uccignore supports wildcard expressions, thanks to which we can find all files matching a specific pattern.

e.g. for given file structure 

```
...
└── lib
    └── 3rdparty
    │   ├── linux
    │   ├   └── pycache.pyc
    │   ├── linux_with_deps
    │   ├   └── pycache.pyc
    │   └── windows
    │       └── pycache.pyc
    └── requests
    │       └── pycache.pyc
    └── urllib
            └── pycache.pyc
```  

we can remove all `.pyc` files by adding `lib/**/pycache.pyc` to the .uccignore file. 
If we want to remove all `.pyc` files just from the `3rdparty` directory, we need to change pattern to `lib/3rdparty/**/pycache.pyc`.
If we want to remove only for one specific platform, we need to provide the exact path e.g. **`lib/3rdparty/windows/pycache.pyc`**.

In case no file is found for the specified pattern, you will see an appropriate warning message.
