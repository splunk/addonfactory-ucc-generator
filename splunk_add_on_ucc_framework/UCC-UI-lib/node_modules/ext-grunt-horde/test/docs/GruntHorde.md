Packageable, composable grunt configuration modules

_Source: [lib/grunt-horde/index.js](../lib/grunt-horde/index.js)_

<a name="tableofcontents"></a>

- <a name="toc_exportsgrunthorde"></a><a name="toc_exports"></a>[exports.GruntHorde](#exportsgrunthorde)
- <a name="toc_exportscreategrunt"></a>[exports.create](#exportscreategrunt)
- <a name="toc_exportsextendext"></a>[exports.extend](#exportsextendext)
- <a name="toc_grunthorde"></a>[GruntHorde](#grunthorde)
- <a name="toc_grunthordeprototypeattack"></a><a name="toc_grunthordeprototype"></a>[GruntHorde.prototype.attack](#grunthordeprototypeattack)
- <a name="toc_grunthordeprototypehomecwd"></a>[GruntHorde.prototype.home](#grunthordeprototypehomecwd)
- <a name="toc_grunthordeprototypekillkey"></a>[GruntHorde.prototype.kill](#grunthordeprototypekillkey)
- <a name="toc_grunthordeprototypelearnkey"></a>[GruntHorde.prototype.learn](#grunthordeprototypelearnkey)
- <a name="toc_grunthordeprototypelootname"></a>[GruntHorde.prototype.loot](#grunthordeprototypelootname)
- <a name="toc_grunthordeprototypedemandkey-val"></a>[GruntHorde.prototype.demand](#grunthordeprototypedemandkey-val)

<a name="exports"></a>

# exports.GruntHorde()

> Reference to [GruntHorde](#grunthorde).

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# exports.create(grunt)

> Create a new [GruntHorde](#grunthorde).

**Parameters:**

- `{object} grunt` Instance injected into Gruntfile.js

**Return:**

`{object}`

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# exports.extend(ext)

> Extend [GruntHorde](#grunthorde).prototype.

**Parameters:**

- `{object} ext`

**Return:**

`{object}` Merge result.

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# GruntHorde()

> GruntHorde constructor.

**Usage:**

```js
// Gruntfile.js
module.exports = function(grunt) {
  require('grunt-horde')
    .create(grunt)
    .loot('my-base-config-module')
    .loot('./config/grunt')
    .attack();
};
```

**Properties:**

- `{object} config` Gruntfile.js values indexed by `grunt` method name
  - `{object} initConfig`
  - `{object} loadNpmTasks`
  - `{object} loadTasks`
  - `{object} registerMultiTask`
  - `{object} registerTask`
- `{object} frozenConfig` Track `config` keys set in `Gruntfile.js`
  - Allow client project to override defaults set in modules.
  - Keys: `config` key names, values: not used
- `{string} [home=process.cwd]` Absolute path to project root dir w/out trailing slash
- `{object} grunt` Instance injected into Gruntfile.js
- `{array} lootBatch` Pending merge functions collected in Gruntfile.prototype.loot

<sub>Go: [TOC](#tableofcontents)</sub>

<a name="grunthordeprototype"></a>

# GruntHorde.prototype.attack()

> Apply configuration.

Run all supported `grunt` configuration methods.

<sub>Go: [TOC](#tableofcontents) | [GruntHorde.prototype](#toc_grunthordeprototype)</sub>

# GruntHorde.prototype.home(cwd)

> Set working directory used to resolve relative paths.

**Parameters:**

- `{string} cwd`

**Return:**

`{object}` this

<sub>Go: [TOC](#tableofcontents) | [GruntHorde.prototype](#toc_grunthordeprototype)</sub>

# GruntHorde.prototype.kill(key)

> Remove a configuration property. Supports `x.y.z` property paths.

**Usage:**

```js
horde.demand('initConfig.x', 20);
horde.kill('initConfig.x');
console.log(grunt.config.getRaw().x); // undefined
console.log(horde.learn('initConfig.x')); // undefined
```

**Emits:**

- `grunt-horde:kill` on every invocation.

**Parameters:**

- `{string} key` &lt;section&gt;.&lt;key&gt;
  - Ex. `initConfig.x.y.z`, `registerTask.default`, etc.
  - Sections: initConfig, loadNpmTasks, loadTasks, registerTask, registerMultiTask

**Return:**

`{object}` this

**See:**

- [Events](modules.md#events)

<sub>Go: [TOC](#tableofcontents) | [GruntHorde.prototype](#toc_grunthordeprototype)</sub>

# GruntHorde.prototype.learn(key)

> Get a configuration property. Supports `x.y.z` property paths.

**Usage:**

```js
horde.demand('initConfig.x.y.z', 20);
horde.learn('initConfig.x.y.z'); // 20
```

**Parameters:**

- `{string} key` &lt;section&gt;.&lt;key&gt;
  - Ex. `initConfig.x.y.z`, `registerTask.default`, etc.
  - Sections: initConfig, loadNpmTasks, loadTasks, registerTask, registerMultiTask

**Return:**

`{mixed}`

<sub>Go: [TOC](#tableofcontents) | [GruntHorde.prototype](#toc_grunthordeprototype)</sub>

# GruntHorde.prototype.loot(name)

> Load a config module. Merge in its payload.

- Merge operation is deferred until [GruntHorde.prototype.attack](#grunthordeprototypeattack).
- Payloads are merged recursively, last wins.
- Loads `tasks/`, if present, with `grunt.loadTasks`.

**Supported module types:**

- Name of locally installed NPM package
- Relative path, ex. `./config/grunt/`
- Absolute path

**Usage:**

```js
horde.home('/proj/home');
horde.loot('base'); // require('/proj/home/node_modules/base');
horde.loot('./base'); // require('/proj/home/base.js');
horde.loot('/path/to/base'); // require('/path/to/base');
```

**Example layout:**

```
initConfig/
  index.js
  eslint.js
  uglify.js
  shell.js
tasks/
  precommit.js
loadTasks.js
loadNpmTasks.js
registerTask.js
registerMultiTask.js
```

**Parameters:**

- `{string} name` Module path, see `Usage` above for examples

**Return:**

`{object}` this

**See:**

- [Modules Documentation](modules.md)

<sub>Go: [TOC](#tableofcontents) | [GruntHorde.prototype](#toc_grunthordeprototype)</sub>

# GruntHorde.prototype.demand(key, val)

> Set a configuration property. Supports `x.y.z` property paths.

**Usage:**

```js
horde.demand('x.y.z', 20);
console.log(horde.learn('x.y.z')); // 20
console.log(grunt.config.getRaw().x.y.z); // 20
```

**Emits:**

- `grunt-horde:demand` on every invocation.

**Parameters:**

- `{string} key` &lt;section&gt;.&lt;key&gt;
  - Ex. `initConfig.x.y.z`, `registerTask.default`, etc.
  - Sections: initConfig, loadNpmTasks, loadTasks, registerTask, registerMultiTask

- `{mixed} val`

**Return:**

`{object}` this

**See:**

- [Events](modules.md#events)

<sub>Go: [TOC](#tableofcontents) | [GruntHorde.prototype](#toc_grunthordeprototype)</sub>

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
