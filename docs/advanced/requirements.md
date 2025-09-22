# Requirements

UCC allows you to specify Python package dependencies for your add-on using standard pip requirements files. This feature provides control over which packages are installed and which should be excluded from the final build.

## Requirements File

You can specify Python packages to be installed in your add-on by creating a `requirements.txt` file in the `package/lib/` directory. UCC will use pip to install these packages during the build process.

### Location

```
<your_project>/
├── package/
│   └── lib/
│       ├── requirements.txt
│       └── exclude.txt (optional)
```

### Format

The `requirements.txt` file follows the standard [pip requirements file format](https://pip.pypa.io/en/stable/reference/requirements-file-format/):

```txt
# Standard packages
requests>=2.25.0
pyyaml
cryptography==41.0.5

# From VCS
git+https://github.com/user/repo.git@v1.0#egg=package-name

# Local package
./local-package

# Packages with extras
requests[security]
```

### Example

```txt
splunktaucclib
splunk-sdk
solnlib
requests>=2.25.0
pyyaml
cryptography
```

## Exclude File

The `exclude.txt` file allows you to specify packages that should be **removed** after installation. This is particularly useful for excluding packages that are already shipped with Splunk by default, avoiding conflicts and reducing add-on size.

### Location

The `exclude.txt` file should be placed in the same `package/lib/` directory as `requirements.txt`.

### Format

The exclude file contains one package name per line. Comments are supported using the `#` symbol.

### Example

```txt
# Exclude packages shipped with Splunk
urllib3
certifi

# Other packages to exclude
setuptools
pip
```

## Build Process

During the build process, UCC will:

1. Install all packages listed in `requirements.txt` using pip
1.Remove any packages listed in `exclude.txt` from the installed libraries
1.Copy the remaining packages to the add-on's `lib` directory

## Usage Notes

- If `requirements.txt` doesn't exist, no packages will be installed
- If `exclude.txt` doesn't exist, no packages will be excluded
- Package exclusion happens **after** installation, so dependencies of excluded packages may still be present unless explicitly excluded
- The exclude file only accepts package names without version specifiers, markers, URLs, or extras

