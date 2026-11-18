# Requirements

UCC allows you to specify Python package dependencies for your add-on using standard pip requirements files.
Alternatively, opt in to [Poetry runtime dependency profiles](#poetry-runtime-dependency-profiles) to lock
complete dependency sets for different Splunk Python runtimes.

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

Similarly to `requirements.txt`, a line that begins with `#` is treated as a comment and ignored.
Whitespace followed by a `#` causes the `#` and the remainder of the line to be treated as a comment.

### Example

```txt
# Exclude packages shipped with Splunk
urllib3
certifi

setuptools # Exclude setuptools
```

The above example will exclude the `urllib3`, `certifi`, and `setuptools` packages from the final add-on package.

## Build Process

During the build process, UCC will:

1. Install all packages listed in `requirements.txt` using pip
1. Remove any packages listed in `exclude.txt` from the installed libraries
1. Copy the remaining packages to the add-on's `lib` directory

## Usage Notes

- If `requirements.txt` doesn't exist, no packages will be installed
- If `exclude.txt` doesn't exist, no packages will be excluded
- Package exclusion happens **after** installation, so dependencies of excluded packages may still be present unless explicitly excluded
- The exclude file only accepts package names without version specifiers, markers, URLs, or extras

## Poetry runtime dependency profiles

Use `meta.dependencyProfiles` when an add-on needs different dependency sets for different operating
systems, architectures, or Python versions. Poetry exports the main dependency group, and UCC evaluates
its environment markers for each target. Declare the complete runtime dependency graph in Poetry,
including `splunktaucclib` for add-ons with pages and `solnlib` for OAuth. Profiles replace the
`requirements.txt` installation path; UCC does not merge those two dependency sources.

### Project layout and locking

```text
your_project/
├── globalConfig.json
├── pyproject.toml
├── poetry.lock
└── package/
    ├── app.manifest
    └── lib/
        └── ucc-dependencies.lock.json
```

Keep `pyproject.toml` and `poetry.lock` in the parent of the package source directory, including when
using an explicit `--config` path. Install Poetry with its export plugin in the locking environment.
For an existing Poetry installation, the plugin can be installed with `poetry self add poetry-plugin-export`.
Poetry is required for locking, but not for builds that consume a committed UCC lock.

Add profiles to the source globalConfig. For example:

```json
{
  "meta": {
    "dependencyProfiles": [
      {
        "name": "linux39",
        "python_version": "3.9.20",
        "os": "linux",
        "platform": "manylinux2014_x86_64"
      },
      {
        "name": "windows313",
        "python_version": "3.13.4",
        "os": "windows",
        "platform": "win_amd64",
        "minimum_openssl": "3.0.0"
      }
    ]
  }
}
```

This fragment belongs in your existing globalConfig; retain its other required fields. Replace the
example Python versions and wheel platforms with the exact targets you have validated for your add-on.
The setting chooses dependencies for Splunk's Python; it does not install or upgrade Python in Splunk.
UCC omits this build-only setting from the globalConfig copy consumed by the browser.

1. Run `ucc-gen lock --source package --update` to run Poetry locking, check the Poetry lock, and
   export the main dependency group into `package/lib/ucc-dependencies.lock.json`.
1. Commit the source globalConfig, `pyproject.toml`, `poetry.lock`, and the UCC lock together.
1. Run `ucc-gen build --source package`. The build verifies the lock fingerprint, installs matching
   wheels with exact versions and SHA-256 hashes, and generates the runtime selector and manifest.
1. Validate the built add-on on each target Splunk host, then package it normally.

See [`ucc-gen lock`](../commands.md#ucc-gen-lock) for all command options. The package command does
not repeat lock verification. Changes to either Poetry file or the profile declarations require a new
UCC lock before the next build.

### Profile fields

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | Unique directory-safe identifier, up to 64 characters: letters, digits, underscores, and hyphens, starting with a letter or digit. |
| `python_version` | Yes | Exact Python version, including the patch, such as `3.13.4`. |
| `os` | Yes | `linux`, `windows`, or `darwin`. |
| `platform` | Yes | Matching wheel platform, using a `manylinux`/`musllinux`, `win_`, or `macosx_` prefix and a supported x86-64 or ARM64 architecture suffix. |
| `provided` | No | Distribution names supplied by the host instead of bundled in this profile. Defaults to an empty list. |
| `minimum_openssl` | No | Minimum host OpenSSL version in three numeric components, such as `3.0.0`. |

Each OS/architecture/Python major-minor combination must have only one profile, even if patch versions
differ. The configuration supports up to 32 profiles.

### Host-provided dependencies

Every `provided` distribution must also occur in that profile's Poetry dependency graph. UCC leaves
it out of the bundled directory and checks at startup that the host supplies the exact locked version.
Validate that contract on the intended Splunk hosts; a host library with a different version causes
startup to fail. This check does not guarantee that application code is compatible with the library API.

If you retain `package/lib/exclude.txt`, every excluded distribution must be declared in every profile's
`provided` list. Profiles do not remove arbitrary packages after installing the frozen graph.

### Restrictions and upgrades

- Only published wheels are supported. VCS, direct-URL, local, and source-only dependencies are rejected.
- Profiles cannot be combined with `meta.os-dependentLibraries`, `--pip-legacy-resolver`, or custom pip flags.
  Profile builds use pip from `--python-binary-name`; they do not upgrade it using `--pip-version`.
- A source-owned `package/bin/import_declare_test.py` must be migrated before enabling profiles.
  UCC generates this bootstrap and `lib/3rdparty/ucc`; do not copy generated profile directories into source.
- OS release/version environment markers are unsupported. Other supported environment markers are
  evaluated for the declared target, rather than the build host.
- Python patch matching is strict: a `3.13.4` profile rejects a `3.13.5` host. After a Splunk Python
  patch upgrade, update the profile, regenerate and commit the lock, rebuild, and validate the add-on.
- Dependency versions already imported from conflicting locations cause startup to fail. Start a fresh
  process with the rebuilt add-on after an upgrade.

Wheel availability, version checks, and the optional OpenSSL check do not replace testing collection,
authentication, and configuration flows on each target operating system and Splunk runtime.

