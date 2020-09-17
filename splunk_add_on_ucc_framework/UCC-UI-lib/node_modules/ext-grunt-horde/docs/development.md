# `this.grunt.config.getRaw` vs. `this.config`

We use:

- `getRaw` to modify plugin config properties
- `this.config` to both:
  - store properties not represented in by grunt in `getRaw`, like inputs to its task API (`registerTask/registerMultiTask/loadTasks/loadNpmTasks`)
  - store all config properties in one object to support the `demand/learn` methods and general ability to compose a final grunt config set from multiple sources

It might be possible to just store everything in `getRaw`. It's unclear if that approach was fully investigated.

Results of those uses:

- `learn` and `configuredDemand` will read/write plugin configs (under the `initConfig` namespace) into `getRaw` rather than `this.config`

# `Gruntfile` API

- While `learn` is available in the Gruntfile, it can only see properties that have also been set earlier in the Gruntfile by `demand`. No config sources selected by `loot` are read and merged until `attack` is called. This makes `learn` basically useless from the Gruntfile and was probably added for completeness. It will likely be removed eventually.

# `attack`

## Deferring `loot` calls

Config sources selected by `loot` can contribute plugin config (`initConfig`) properties as well as task API inputs (ex. for `registerTask` or `loadNpmTasks`), but those sources are not read immediately.

The delay gives a Gruntfile the opportunity to have more control. The intent of that control is a one-way data flow between a Gruntfile and config modules, based on the assumption that the Gruntfile has the high-level overview of the composition:

- It defines the order of `loot` calls, which affects the merge result.
- It override plugin config properties which modules cannot change.
- It can set properties for modules to read and alter their behavior if needed.

The composition process would get more powerful (but more complicated) if the merge happened incrementally and the Gruntfile could inspect progress, alter its own behavior (ex. decide whether to `loot` another module, etc). But that type of process is not currently planned.
