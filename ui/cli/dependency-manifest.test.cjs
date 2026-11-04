/*
 * Copyright 2026 Splunk Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-env node */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');

const { rollup, VERSION: rollupVersion } = require(process.env.ROLLUP_MODULE || 'rollup');
const publicDependencyManifest = require('@splunk/add-on-ucc-framework/dependency-manifest');
const dependencyManifest = require('./dependency-manifest.cjs');

const hash = (code) => createHash('sha256').update(code).digest('hex');

function write(root, file, value) {
    const dest = path.join(root, file);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, value);
    return dest;
}

function project(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ucc-dependency-test-'));
    const previous = process.cwd();
    process.chdir(root);
    t.after(() => {
        process.chdir(previous);
        fs.rmSync(root, { recursive: true, force: true });
    });
    write(root, 'package.json', JSON.stringify({ name: 'own-project', version: '9.0.0' }));
    return root;
}

function pkg(root, dir, name, version, code) {
    write(root, `${dir}/package.json`, JSON.stringify({ name, version }));
    return write(root, `${dir}/index.js`, code);
}

async function bundle(root, entry, out, plugin, sourcemap = false) {
    const build = await rollup({ input: path.join(root, entry), plugins: [plugin] });
    try {
        await build.write({ dir: path.join(root, out), format: 'es', sourcemap });
    } finally {
        await build.close();
    }
    const fragment = path.join(root, out, 'dependency-chunks.json');
    return fs.existsSync(fragment) ? JSON.parse(fs.readFileSync(fragment)) : null;
}

test('emitted packages, nested versions, private packages, and final hashes', async (t) => {
    const root = project(t);
    pkg(root, 'node_modules/used', 'used', '1.0.0', 'export const used = "used";');
    pkg(root, 'node_modules/unused', 'unused', '1.0.0', 'export const unused = "unused";');
    pkg(
        root,
        'node_modules/parent/node_modules/used',
        'used',
        '2.0.0',
        'export const used = "nested";'
    );
    pkg(
        root,
        'node_modules/@private/dep',
        '@private/dep',
        '3.0.0',
        'export const value = "private";'
    );
    write(
        root,
        'entry.js',
        `
        import {used} from './node_modules/used/index.js';
        import {unused} from './node_modules/unused/index.js';
        import {used as nested} from './node_modules/parent/node_modules/used/index.js';
        import {value} from './node_modules/@private/dep/index.js';
        console.log(used, nested, value);
    `
    );
    const result = await bundle(
        root,
        'entry.js',
        'dist',
        dependencyManifest({ producer: 'custom-ui' })
    );
    const record = result.chunks[0];
    assert.deepEqual(record.packages, [
        { name: '@private/dep', version: '3.0.0' },
        { name: 'used', version: '1.0.0' },
        { name: 'used', version: '2.0.0' },
    ]);
    assert.equal(record.sha256, hash(fs.readFileSync(path.join(root, 'dist', record.path))));
    assert(!fs.readdirSync(path.join(root, 'dist')).some((file) => file.endsWith('.map')));
});

for (const producer of ['ucc-ui', 'custom-ui']) {
    test(`own root omitted for ${producer}; explicit maps retained`, async (t) => {
        const root = project(t);
        write(root, 'entry.js', 'console.log("own code");');
        const result = await bundle(
            root,
            'entry.js',
            'dist',
            dependencyManifest({ producer }),
            true
        );
        assert.deepEqual(result.chunks[0].packages, []);
        const file = result.chunks[0].path;
        assert(fs.existsSync(path.join(root, 'dist', `${file}.map`)));
        assert.equal(result.chunks[0].sha256, hash(fs.readFileSync(path.join(root, 'dist', file))));
    });
}

test('prebundle tree shaking preserves used dependency and consumed library root', async (t) => {
    const root = project(t);
    const lib = path.join(root, 'library');
    pkg(
        root,
        'library',
        '@splunk/test-ucc',
        '6.6.0',
        `
        export {used} from './node_modules/used/index.js';
        export {unused} from './node_modules/unused/index.js';
        export function framework() { return 'framework'; }
    `
    );
    pkg(lib, 'node_modules/used', 'used', '1.0.0', 'export function used() { return "used"; }');
    pkg(
        lib,
        'node_modules/unused',
        'unused',
        '1.0.0',
        'export function unused() { return "unused"; }'
    );
    process.chdir(lib);
    await bundle(
        lib,
        'index.js',
        'dist',
        dependencyManifest({ producer: 'ucc-ui', library: true })
    );
    const map = JSON.parse(fs.readFileSync(path.join(lib, 'dist/index.js.map')));
    assert(!map.sourcesContent);
    assert(map.sources.every((source) => source.startsWith('ucc-package:')));
    assert(!JSON.stringify(map).includes(root));
    process.chdir(root);
    write(
        root,
        'entry.js',
        `
        import {used, framework} from './library/dist/index.js';
        console.log(used(), framework());
    `
    );
    const result = await bundle(
        root,
        'entry.js',
        'dist',
        dependencyManifest({ producer: 'custom-ui' })
    );
    assert.deepEqual(result.chunks[0].packages, [
        { name: '@splunk/test-ucc', version: '6.6.0' },
        { name: 'used', version: '1.0.0' },
    ]);

    // A prebundle can retain dependency code while all code owned by its wrapper disappears.
    write(root, 'entry.js', "import {used} from './library/dist/index.js'; console.log(used());");
    const dependencyOnly = await bundle(
        root,
        'entry.js',
        'dist',
        dependencyManifest({ producer: 'custom-ui' })
    );
    assert.deepEqual(dependencyOnly.chunks[0].packages, [{ name: 'used', version: '1.0.0' }]);

    const broken = await rollup({
        input: path.join(root, 'entry.js'),
        plugins: [
            {
                name: 'mapless-prebundle',
                transform(code, id) {
                    return id === path.join(lib, 'dist/index.js') ? `${code}\n/* changed */` : null;
                },
            },
            dependencyManifest({ producer: 'custom-ui' }),
        ],
    });
    try {
        await assert.rejects(
            () => broken.write({ dir: path.join(root, 'dist'), format: 'es' }),
            /Unmapped dependency/
        );
    } finally {
        await broken.close();
    }
});

test('Vite dynamic-import final hashes and mapped packages after minification', async (t) => {
    const root = project(t);
    pkg(root, 'node_modules/used', 'used', '1.0.0', 'export const used = "used";');
    write(root, 'entry.js', "globalThis.run = async () => (await import('./lazy.js')).value;");
    write(
        root,
        'lazy.js',
        "import {used} from './node_modules/used/index.js'; export const value = used;"
    );
    const { build } = await import('vite');
    const collector = dependencyManifest({ producer: 'custom-ui' });
    await build({
        configFile: false,
        root,
        logLevel: 'silent',
        plugins: [
            { ...collector, generateBundle: { order: 'post', handler: collector.generateBundle } },
        ],
        build: {
            sourcemap: false,
            minify: true,
            outDir: 'dist',
            rollupOptions: { input: path.join(root, 'entry.js') },
        },
    });
    const result = JSON.parse(fs.readFileSync(path.join(root, 'dist/dependency-chunks.json')));
    assert.equal(result.chunks.length, 2);
    assert(result.chunks.some((chunk) => chunk.packages.some((item) => item.name === 'used')));
    for (const chunk of result.chunks) {
        assert.equal(chunk.sha256, hash(fs.readFileSync(path.join(root, 'dist', chunk.path))));
        assert(!fs.existsSync(path.join(root, 'dist', `${chunk.path}.map`)));
    }
});

test('public helper export resolves through the package entry point', () => {
    assert.equal(publicDependencyManifest, dependencyManifest);
});

test('public helper types compile with the selected Rollup version', (t) => {
    const root = project(t);
    let rollupRoot = path.dirname(require.resolve(process.env.ROLLUP_MODULE || 'rollup'));
    while (!fs.existsSync(path.join(rollupRoot, 'package.json'))) {
        rollupRoot = path.dirname(rollupRoot);
    }
    const modules = path.join(root, 'node_modules');
    fs.mkdirSync(modules);
    fs.symlinkSync(rollupRoot, path.join(modules, 'rollup'), 'dir');
    fs.symlinkSync(
        path.dirname(path.dirname(require.resolve('@types/node/package.json'))),
        path.join(modules, '@types'),
        'dir'
    );
    fs.copyFileSync(
        path.join(__dirname, 'dependency-manifest.d.cts'),
        path.join(root, 'dependency-manifest.d.cts')
    );
    write(
        root,
        'consumer.cts',
        "import factory = require('./dependency-manifest.cjs'); import type {Plugin} from 'rollup'; const p: Plugin = factory({producer:'custom-ui'}); void p;"
    );
    execFileSync(
        process.execPath,
        [
            require.resolve('typescript/bin/tsc'),
            '--noEmit',
            '--target',
            'es2022',
            '--module',
            'NodeNext',
            '--moduleResolution',
            'NodeNext',
            '--strict',
            '--types',
            'node',
            'consumer.cts',
        ],
        { cwd: root }
    );
});

test('context collector is enabled only by inventory intent', async (t) => {
    const root = project(t);
    const { loadConfigFromFile } = await import('vite');
    const previous = process.env.UCC_DEPENDENCY_MANIFEST;
    process.argv.push('ta_name=Splunk_TA_Test');
    t.after(() => {
        process.argv.pop();
        if (previous === undefined) {
            delete process.env.UCC_DEPENDENCY_MANIFEST;
        } else {
            process.env.UCC_DEPENDENCY_MANIFEST = previous;
        }
    });
    for (const enabled of [false, true]) {
        if (enabled) {
            process.env.UCC_DEPENDENCY_MANIFEST = '1';
        } else {
            delete process.env.UCC_DEPENDENCY_MANIFEST;
        }
        // Config reads the environment; each variant must load sequentially.
        // eslint-disable-next-line no-await-in-loop
        const result = await loadConfigFromFile(
            { command: 'build', mode: 'production' },
            path.join(__dirname, 'vite.config_ucc-gen-ui.ts'),
            root
        );
        const plugins = result.config.plugins.filter(Boolean);
        assert.equal(
            plugins.some((p) => p.name === 'ucc-dependency-manifest'),
            enabled
        );
    }
});

test('direct context CLI opts into evidence and keeps explicit Node options', (t) => {
    const root = project(t);
    const bin = path.join(root, 'bin');
    const capture = path.join(root, 'capture.json');
    const vite = write(
        root,
        'bin/vite',
        `#!${process.execPath}\nrequire('node:fs').writeFileSync(${JSON.stringify(
            capture
        )}, JSON.stringify({argv:process.argv, inventory:process.env.UCC_DEPENDENCY_MANIFEST, options:process.env.NODE_OPTIONS}));`
    );
    fs.chmodSync(vite, 0o755);
    for (const explicitOptions of [
        undefined,
        '--trace-warnings',
        '--max-old-space-size=9216',
        '--max_old_space_size=9216',
    ]) {
        const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}` };
        delete env.NODE_OPTIONS;
        delete env.UCC_DEPENDENCY_MANIFEST;
        if (explicitOptions) {
            env.NODE_OPTIONS = explicitOptions;
        }
        execFileSync(
            process.execPath,
            [
                path.join(__dirname, 'ucc-gen-build-ui.js'),
                'ta_name=Splunk_TA_Test',
                '--dependency-manifest',
            ],
            { cwd: root, env }
        );
        const result = JSON.parse(fs.readFileSync(capture));
        assert.equal(result.inventory, '1');
        assert.equal(
            result.options,
            explicitOptions?.includes('9216')
                ? explicitOptions
                : [explicitOptions, '--max-old-space-size=8192'].filter(Boolean).join(' ')
        );
        assert(!result.argv.includes('--dependency-manifest'));
    }
});

test('Storybook omits the TA producer while the core build retains it', async (t) => {
    const previous = process.env.UCC_DEPENDENCY_MANIFEST;
    process.env.UCC_DEPENDENCY_MANIFEST = '1';
    t.after(() => {
        if (previous === undefined) {
            delete process.env.UCC_DEPENDENCY_MANIFEST;
        } else {
            process.env.UCC_DEPENDENCY_MANIFEST = previous;
        }
    });
    const root = project(t);
    const { loadConfigFromFile } = await import('vite');
    const environment = { command: 'build', mode: 'production' };
    const ui = await loadConfigFromFile(
        environment,
        path.join(__dirname, '../vite.config.ts'),
        root
    );
    const collector = ui.config.plugins.find(
        (plugin) => plugin?.name === 'ucc-dependency-manifest'
    );
    assert(collector, 'Core TA builds need evidence');
    const storybook = await loadConfigFromFile(
        environment,
        path.join(__dirname, '../.storybook/main.ts'),
        root
    );
    const config = await storybook.config.viteFinal({
        plugins: [collector, { name: 'retained-plugin' }],
    });
    assert.deepEqual(
        config.plugins.map((plugin) => plugin.name),
        ['retained-plugin']
    );
});

test('a package boundary without a version cannot inherit its parent identity', async (t) => {
    const root = project(t);
    write(root, 'node_modules/incomplete/package.json', JSON.stringify({ name: 'incomplete' }));
    write(root, 'node_modules/incomplete/index.js', 'export const value = 7;');
    write(
        root,
        'entry.js',
        "import {value} from './node_modules/incomplete/index.js'; console.log(value);"
    );
    await assert.rejects(
        () => bundle(root, 'entry.js', 'dist', dependencyManifest({ producer: 'custom-ui' })),
        /package.*version|identity/i
    );
});

test('a map-less dependency transform cannot silently remove package attribution', async (t) => {
    const root = project(t);
    pkg(root, 'node_modules/used', 'used', '1.0.0', 'export const value = "original";');
    write(
        root,
        'entry.js',
        "import {value} from './node_modules/used/index.js'; console.log(value);"
    );
    const build = await rollup({
        input: path.join(root, 'entry.js'),
        plugins: [
            {
                name: 'mapless-transform',
                transform(code, id) {
                    return id.endsWith('/used/index.js')
                        ? code.replace('original', 'changed')
                        : null;
                },
            },
            dependencyManifest({ producer: 'custom-ui' }),
        ],
    });
    try {
        await assert.rejects(
            () => build.write({ dir: path.join(root, 'dist'), format: 'es' }),
            /Unmapped dependency/
        );
    } finally {
        await build.close();
    }
});

test('a JSON-only dependency cannot silently disappear from Vite evidence', async (t) => {
    const root = project(t);
    write(
        root,
        'node_modules/json-only/package.json',
        JSON.stringify({ name: 'json-only', version: '1.0.0' })
    );
    write(root, 'node_modules/json-only/value.json', JSON.stringify({ value: 17 }));
    write(
        root,
        'entry.js',
        "import data from './node_modules/json-only/value.json'; console.log(data);"
    );
    const { build } = await import('vite');
    const collector = dependencyManifest({ producer: 'custom-ui' });
    await assert.rejects(
        () =>
            build({
                configFile: false,
                root,
                logLevel: 'silent',
                plugins: [
                    {
                        ...collector,
                        generateBundle: { order: 'post', handler: collector.generateBundle },
                    },
                ],
                build: { outDir: 'dist', rollupOptions: { input: path.join(root, 'entry.js') } },
            }),
        /Unmapped dependency/
    );
});

test('custom source path transforms cannot silently remove package attribution', async (t) => {
    const root = project(t);
    pkg(root, 'node_modules/used', 'used', '1.0.0', 'export const value=7;');
    write(
        root,
        'entry.js',
        "import {value} from './node_modules/used/index.js'; console.log(value);"
    );
    const build = await rollup({
        input: path.join(root, 'entry.js'),
        plugins: [dependencyManifest({ producer: 'custom-ui' })],
    });
    try {
        await assert.rejects(
            () =>
                build.write({
                    dir: path.join(root, 'dist'),
                    format: 'es',
                    sourcemapPathTransform: () => 'unrelated.js',
                }),
            /Unmapped dependency/
        );
    } finally {
        await build.close();
    }
});

test('evidence-only maps respect custom map filenames without leaking sources', async (t) => {
    if (Number(rollupVersion.split('.')[0]) < 3) {
        t.skip('sourcemapFileNames needs Rollup 3.29+');
        return;
    }
    const root = project(t);
    pkg(root, 'node_modules/used', 'used', '1.0.0', 'export const value=7;');
    write(
        root,
        'entry.js',
        "import {value} from './node_modules/used/index.js'; console.log(value);"
    );
    const build = await rollup({
        input: path.join(root, 'entry.js'),
        plugins: [dependencyManifest({ producer: 'custom-ui' })],
    });
    try {
        await build.write({
            dir: path.join(root, 'dist'),
            format: 'es',
            sourcemapFileNames: 'private/[name].evidence.map',
        });
    } finally {
        await build.close();
    }
    assert(!fs.existsSync(path.join(root, 'dist/private/index.evidence.map')));
    assert(
        !fs
            .readdirSync(path.join(root, 'dist'), { recursive: true })
            .some((file) => String(file).endsWith('.map'))
    );
});

test('nested compatibility manifests do not invent another installed package', async (t) => {
    const root = project(t);
    pkg(root, 'node_modules/real', 'real', '1.0.0', 'export const value=9;');
    write(
        root,
        'node_modules/real/dist/package.json',
        JSON.stringify({ name: 'compat-alias', type: 'module' })
    );
    write(root, 'node_modules/real/dist/index.js', 'export const value=9;');
    write(
        root,
        'entry.js',
        "import {value} from './node_modules/real/dist/index.js'; console.log(value);"
    );
    const data = await bundle(
        root,
        'entry.js',
        'dist',
        dependencyManifest({ producer: 'custom-ui' })
    );
    assert.deepEqual(data.chunks[0].packages, [{ name: 'real', version: '1.0.0' }]);
});

test('core and library development builds collect evidence only when requested', async (t) => {
    const root = project(t);
    const { loadConfigFromFile } = await import('vite');
    const previous = process.env.UCC_DEPENDENCY_MANIFEST;
    t.after(() => {
        if (previous === undefined) {
            delete process.env.UCC_DEPENDENCY_MANIFEST;
        } else {
            process.env.UCC_DEPENDENCY_MANIFEST = previous;
        }
    });
    for (const file of ['vite.config.ts', 'vite.lib.config.ts']) {
        for (const enabled of [false, true]) {
            process.env.UCC_DEPENDENCY_MANIFEST = enabled ? '1' : '0';
            // Configuration loading observes the process environment set for this case.
            // eslint-disable-next-line no-await-in-loop
            const loaded = await loadConfigFromFile(
                { command: 'build', mode: 'production' },
                path.join(__dirname, '..', file),
                root
            );
            assert.equal(
                loaded.config.plugins
                    .filter(Boolean)
                    .some((plugin) => plugin.name === 'ucc-dependency-manifest'),
                enabled
            );
        }
    }
});
