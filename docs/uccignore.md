# `.uccignore` file

This feature can be used to remove files from the output **after** UCC template files were copied and **before** the source of the 
add-on recursively overrides the output folder.

It is expected to be placed in the same folder as `globalConfig` file to have effect.

Uccignore supports wildcard expressions, thanks to which we can find all files matching a specific pattern.

e.g. for given file structure 

```
...
└── lib
    └── 3rdparty
        ├── linux
        │   ├── pycache.pyc
        ├── linux_with_deps
        │   ├── pycache.pyc
        └── windows
            ├── pycache.pyc
```  

we can remove all `.pyc` files by adding `lib/**/pycache.pyc` to .uccignore file. 
If we want to remove only for one specific platform we need to provide the exact path e.g. **`lib/3rdparty/windows/pycache.pyc`**.

In case .uccignore file is not found you will see a warning message.
