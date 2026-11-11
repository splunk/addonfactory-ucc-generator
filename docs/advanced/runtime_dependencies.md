# Locked runtime dependencies

Use `meta.dependencyProfiles` to package a complete Poetry dependency graph for each
supported Python and operating system combination. This is opt-in: add-ons without
profiles keep using their existing requirements and OS-dependent libraries.

This feature resolves the whole dependency graph together. For example, a Python
marker on `urllib3` lets Poetry choose compatible versions of its consumers too.
It does not automatically rewrite add-on code for a changed library API.

## Configure the targets

Keep `pyproject.toml`, `poetry.lock`, and `globalConfig.json` (or YAML) beside the
`package` directory. Declare runtime dependencies in Poetry's main dependency
group, including libraries required by the generated UI or OAuth handlers.
Poetry's Python constraint must cover every target. Development dependencies must
also be compatible with Poetry's resolution.

Add profiles to the existing `meta` object:

```json
{
  "dependencyProfiles": [
    {
      "name": "linux39",
      "python_version": "3.9.20",
      "os": "linux",
      "platform": "manylinux2014_x86_64",
      "minimum_openssl": "1.1.1"
    },
    {
      "name": "windows313",
      "python_version": "3.13.4",
      "os": "windows",
      "platform": "win_amd64"
    }
  ]
}
```

These are illustrative targets, not a Splunk support matrix. Use the Python patch
version, wheel platform, architecture, and OpenSSL requirements of the actual
Splunk installations you test. Linux, Windows, and macOS profiles support x86-64
and ARM64 wheel platforms. Configure at most one profile for each OS, architecture,
and Python major/minor combination.

The full Python version matters when evaluating dependency markers. The generated
startup script checks it exactly; a host Python patch upgrade requires regenerating
the profile and testing again. OS release/version markers are currently unsupported.

## Lock, build, and package

Install Poetry with its
[export plugin](https://github.com/python-poetry/poetry-plugin-export) in the
development or CI environment. For example, an existing Poetry installation can
use `poetry self add poetry-plugin-export`.

```sh
# Explicitly resolve dependencies and export each target's frozen graph.
ucc-gen lock --source package --update

# Export an existing, current poetry.lock without resolving again.
ucc-gen lock --source package

ucc-gen build --source package
ucc-gen package --path output/your_addon_name
```

Commit `pyproject.toml`, `poetry.lock`, the profile configuration, and the generated
`package/lib/ucc-dependencies.lock.json`. The UCC lock contains exact versions and
SHA-256 hashes for the complete graph selected for each target. Re-running the
lock command with the same inputs produces the same file.

Normal builds check the lock against its inputs and install only those versions.
They do not invoke Poetry or resolve dependencies again. A stale or missing lock
fails with instructions to run `ucc-gen lock`. Installation requires published
wheels for every target: VCS, direct-URL, local, and source-only dependencies are
currently unsupported. Publish an approved wheel before migrating such a dependency.

Libraries go into separate `lib/3rdparty/ucc/<profile>-<graph-hash>` directories.
UCC generates `lib/ucc-runtime-dependencies.json` and `bin/import_declare_test.py`.
The startup script selects the target, checks installed versions and the optional
OpenSSL minimum, and sets import paths before dependency consumers are imported.
Custom entry points must import `import_declare_test` first, as generated entry
points do.

The graph hash changes the directory when dependencies change. On upgrade, the
selector ignores old graph directories and undeclared modules left in the add-on's
root library and bin directories. It fails if a conflicting dependency was already
imported, rather than replacing a module inside a running process.

## Libraries supplied by Splunk

An optional `provided` list declares distributions owned by the host:

```json
{
  "name": "linux39",
  "python_version": "3.9.20",
  "os": "linux",
  "platform": "manylinux2014_x86_64",
  "provided": ["requests"]
}
```

Poetry must still resolve these distributions and all their dependencies. UCC
omits the declared distributions from the add-on's profile directory and checks
their host metadata at startup. This initial implementation requires the host's
distribution version to match the lock exactly. A different version stops startup
with an error explaining the mismatch.

Verify this contract on every supported Splunk release. A matching version is a
dependency check, not proof that the add-on's API calls or collection work. Test
Configuration, inputs, collection, and upgrade behavior on the actual hosts.

## Migrate an existing add-on

1. Move all runtime dependencies into Poetry's main group and resolve incompatible
   constraints together, including Python markers where needed.
1. Replace `meta.os-dependentLibraries` with dependency profiles; the two modes
   cannot be combined. The root `requirements.txt` is not used in profile mode.
1. Review custom `bin/import_declare_test.py` logic before removing it from source.
   UCC refuses to overwrite a source bootstrap. Move any necessary add-on behavior
   into helpers that run after the generated selector.
1. Declare every `lib/exclude.txt` entry as `provided` in every profile, or remove
   the exclusion and let the add-on own that distribution.
1. Remove generated `lib/3rdparty/ucc` content from package source. Run lock, build,
   and package, then test both a clean installation and an upgrade.

Legacy resolver and custom pip flags are not accepted in profile mode. UCC uses
hash checking, wheel-only installation, and disabled pip dependency resolution to
preserve the selected graph. `--pip-version` is not applied in this mode; use a
build interpreter with a pip version that supports your target wheels.
