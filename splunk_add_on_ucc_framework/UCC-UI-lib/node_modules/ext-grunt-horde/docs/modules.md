- [Composition API](#composition-api)
  - [loot(name)](#loot)
  - [demand(key, val)](#demand)
  - [learn(key)](#learn)
  - [assimilate](#assimilate)
  - [age](#age)
- [Module Files](#module-files)
  - [initConfig/index.js](#initconfigindexjs)
  - [initConfig/&lt;name&gt;.js](#initconfignamejs)
  - [tasks/&lt;name&gt;.js](#tasksnamejs)
  - [loadNpmTasks.js](#loadnpmtasksjs)
  - [loadTasks.js](#loadtasksjs)
  - [registerTask.js](#registertaskjs)
  - [registerMultiTask.js](#registermultitaskjs)
- [Examples](#examples)
- [Tips](#tips)
- [Events](#events)

# Composition API

## In `Gruntfile.js`

> Create an instance in your `Gruntfile.js` to define the composition at a high-level.

```js
module.exports = function(grunt) {
  var horde = require('grunt-horde').create(grunt);
  horde                       // GruntHorde instance
    .loot('my-base-config')   // NPM
    .loot('./config/grunt')
    .demand('initConfig.eslint.options', {envs: ['node', 'es6']})
    .attack();
};
```

Available from `GruntHorde` instance:

- `loot(name)`: Load a module and merge in its key/value pairs.
  - Relative path: `./path/to/mod`
  - Absolute path: `/path/to/mod`
  - Local `node_modules/mod`: `mod`
- `demand(key, val)`: Setter for the raw `grunt` config object.
- `learn(key)`: Getter for the raw `grunt` config object.
- `kill(key)`: Delete from the raw `grunt` config object.
- `attack`: Apply composition.

Notes:

- `key` values are [string paths](https://github.com/chaijs/pathval#usage) like `initConfig.eslint.options`.
- On Windows, use backward slashes only.

## In Modules

Available from `module.exports` function context:

- `this.demand(key, val)`: Setter for the raw `grunt` config object.
- `this.learn(key)`: Getter for the raw `grunt` config object.
- `this.kill(key)`: Delete from the raw `grunt` config object.
- `this.t(template [, options])`: Alias for [grunt.template.process](http://gruntjs.com/api/grunt.template#grunt.template.process).
- `this.assimilate`: Alias for the [justmoon/node-extend](https://github.com/justmoon/node-extend) used in `grunt-horde` to merge objects recursively.
  - Example:
- `this.age`: Alias for [semver](https://github.com/isaacs/node-semver).

```js
// Example: initConfig/eslint.js
module.exports = function() {
  return {
    src: {
      files: {
        test: ['test/**/*.js']
      }
    }
  };
};
```

Notes:

- You can safely omit `return` without side effect, ex. if your module only needs to use `demand/learn`.
- To removing a top-level config key, use [kill(key)](GruntHorde.md#tableofcontents).
- All `key` values are [string paths](https://github.com/chaijs/pathval#usage) like `initConfig.eslint.options`.

## Method Notes

### `loot`

> `loot` is the main way to compose your configuration from modules.

- Objects returned by the modules are [merged recursively](https://github.com/justmoon/node-extend). Last wins.
- File layout of module packages must use specific [conventions](#module-files).
- Every `module.exports` must be a function that returns `grunt` config key pairs.
- Every `module.exports` receives one argument: the main `grunt` object.
- Loads `tasks/`, if present, with [grunt.loadTasks](http://gruntjs.com/api/grunt.task#grunt.task.loadtasks).

### `demand`

> Use it to individually set raw `grunt` config keys, ex. to add project-specific settings to a current project-agnostic composition.

- Alias for [GruntHorde.prototype.demand](GruntHorde.md#tableofcontents).
- Emits an [event](#events) for debugging.
- Values may include standard `<%= keyName %>` templates. (You can also expand template variables immediately with [this.t](#composition-api).)
- Compliments `learn` by allowing you to inspect the current value before changing it.

### `learn`

-  Alias for [GruntHorde.prototype.learn](GruntHorde.md#tableofcontents).

### `kill`

-  Alias for [GruntHorde.prototype.kill](GruntHorde.md#tableofcontents).

### `assimilate`

Example of object merging with [assimilate](https://github.com/justmoon/node-extend):

```js
// By using {} as the target, currentPairs is not modified in the process.
var mergeResult = this.assimilate(true, {}, currentPairs, newPairs);
```

### `age`

Example of using `age` to adjust configuration based on semver:

```js
// Ex. in Gruntfile.js
this.demand('initConfig.harmony', this.age.satisfies(process.version, '>=0.11.9'));

// Ex. in initConfig/eslint.js
if (this.learn('initConfig.harmony')) {
  defaultOptions.esnext = true;
}
```

## Precedence

[demand()](GruntHorde.md#tableofcontents) can be called from `Gruntfile.js` and any module file, but its effectiveness depends where it is used.

- Key/value pairs returned from modules loaded by `loot` (lowest)
- Key/value pairs set by `demand()` in modules loaded by `loot`
- Key/value pairs set by `demand()` in `Gruntfile.js` (highest)

Remidner: Sequence your `loot` calls based on module precendence, highest last.

## Use `learn/demand` to merge with existing value, rather than a last-wins overwrite

If `loot` has already loaded `moduleX` that defined `initConfig` key `dev.logs`, `moduleY` could include this:

```js
var orig = this.learn('initConfig.dev.logs');
this.demand('initConfig.dev.logs', orig.concat('tmp/request.log'));
```

# Module Files

You can compose a module from any combination of these files.

## `initConfig/index.js`

> Defines top-level keys passed to `grunt.initConfig`.

```js
module.exports = function(grunt) {
  return {
    pkg: grunt.file.readJSON('package.json')
  };
};
```

## `initConfig/<name>.js`

Example: `initConfig/uglify.js`

> Defines the `uglify` section passed to `grunt.initConfig`.

```js
module.exports = function(grunt) {
  return {
    src: {
      options: {beautify: true},
      files: {'dist/grunt-horde.js': 'dist/grunt-horde.js'}
    }
  };
};
```

## `tasks/<name>.js`

Example: `tasks/precommit.js`

> Defines a module that will be processed by `grunt.loadTasks` if enabled in [loadTasks.js](#loadtasksjs).

## `loadNpmTasks.js`

> `false` can be used to disable an NPM task enabled in a module earlier in the merge.

```js
module.exports = function(grunt) {
  return {
    'grunt-contrib-uglify': true
  };
};
```

## `loadTasks.js`

```js
module.exports = function(grunt) {
  return {
    'path/to/dev-tasks': true
  };
};
```

- Each returned key should refer to a [task file](#tasksnamejs).
- Use `false` to disable a task enabled by a module earlier in the merge.

## `registerTask.js`

> Defines the arguments passed to [`grunt.registerTask`](http://gruntjs.com/creating-tasks).

This example alias task defines a "default" task whereby the "jshint", "qunit","concat" and "uglify" tasks are run automatically if Grunt is executed without specifying any tasks:

```js
module.exports = function(grunt) {
  return {
    default: [['jshint', 'qunit', 'concat', 'uglify']]
  };
};
```

You can also provide a function which optionally accepts colon-delimited arguments:

```js
module.exports = function(grunt) {
  return {
    hello: [function (target) {
      console.info('hello ' + (target || 'world'));
    }],
    add: [function( arg1, arg2 ) {
      grunt.log.writeln(arg1 + ' + ' + arg2 + ' = ' + (parseFloat(arg1) + parseFloat(arg2)));
    }]
  };
};
```
```
> grunt hello
  hello world
> grunt hello:David
  hello David
> grunt add:1.2:3.4
  1.2 + 3.4 = 4.6
```

You can also provide an optional description that will be displayed by `grunt --help`:

```js
module.exports = function(grunt) {
  return {
    default: [['jshint', 'qunit', 'concat', 'uglify']],
    aliasWithDescription: ['Build without tests', ['concat', 'uglify']],
    hello: ['Hello World example', function (target) {
      console.info('hello ' + (target || 'world'));
    }]
  };
};
```
```
> grunt --help
              default  Alias for "jshint", "qunit", "concat", "uglify" tasks.
 aliasWithDescription  Build without tests
                hello  Hello World example
```

For more details, refer [Creating tasks](http://gruntjs.com/creating-tasks)


## `registerMultiTask.js`

> Defines the arguments passed to `grunt.registerMultiTask`.

```js
// initConfig/copyrightScan.js
module.exports = function() {
  return {
    libHttp: {
      dir: 'lib/http'
    },
    testHttp: {
      dir: 'test/lib/http'
    }
  };
};

// ./multi-tasks/find-missing-copyright-notice.js
module.exports = function() {
  // `grunt copyrightScan:libHttp` output:
  console.log(this.target);   // "libHttp"
  console.log(this.data.dir); // "lib/http"
  
  // `grunt copyrightScan:testHttp` output:
  console.log(this.target);   // "testHttp"
  console.log(this.data.dir); // "test/http"
};

// registerMultiTask.js
module.exports = function(grunt) {
  var taskFn = require('./multi-tasks/find-missing-copyright-notice.js');
  return {
    copyrightScan: ['Scan for missing copyright notice', taskFn]
  };
};
```

# Examples

I combine these configurations in most of my projects and then customize, if needed, with a `./config/grunt` module.

## Configurations

- [node-component-grunt](https://github.com/codeactual/node-component-grunt)
- [node-lib-grunt](https://github.com/codeactual/node-lib-grunt)
- [node-bin-grunt](https://github.com/codeactual/node-bin-grunt)

## Dependent Projects

- [conjure](https://github.com/codeactual/conjure/blob/master/Gruntfile.js)
- [prankcall](https://github.com/codeactual/prankcall/blob/master/Gruntfile.js)
- [apidox](https://github.com/codeactual/apidox/blob/master/Gruntfile.js)

# Tips

- Consider `npm install --save-dev git://...` as a means of reusing configuration packages across multiple projects. The [examples](#examples) above use that approach.

# Events

Subscribe through the [grunt.event](http://gruntjs.com/api/grunt.event) API.

```js
// Gruntfile.js
module.exports = function(grunt) {
  grunt.event.on('grunt-horde:demand', function(source, section, key, val, mode) {
    console.log('demand:', source, section, key, val, mode);
  });

  // ...
};
```

## `grunt-horde:demand`

> Fires on every `demand()` invocation.

Receives arguments:

- `{string} source` Ex. 'Gruntfile' or '/path/to/initConfig/eslint.js'
- `{string} section` Ex. `initConfig`, `registerTask`, etc.
- `{string} key` Config key, ex. `x.y.z`
- `{string} val` Config val, ex. `20`
- `{string} mode`
  - `''`: initial/updated value from module was accepted
  - `frozen`: new value from module was denied (already modified by `Gruntfile.js`)
  - `freezing`: value modified from `Gruntfile.js`

## `grunt-horde:kill`

> Fires on every `kill()` invocation.

Receives arguments:

- `{string} source` Ex. 'Gruntfile' or '/path/to/initConfig/eslint.js'
- `{string} section` Ex. `initConfig`, `registerTask`, etc.
- `{string} key` Config key, ex. `x.y.z`
- `{string} mode`
  - `''`: initial/updated value from module was accepted
  - `frozen`: new value from module was denied (already modified by `Gruntfile.js`)
  - `freezing`: value modified from `Gruntfile.js`

