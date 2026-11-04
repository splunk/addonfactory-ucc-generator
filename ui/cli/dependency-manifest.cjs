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
const fs = require('node:fs');
const path = require('node:path');
const { fileURLToPath } = require('node:url');
const { createHash } = require('node:crypto');
const { decode } = require('@jridgewell/sourcemap-codec');

const marker = 'ucc-package:';

function compare(a, b) {
    if (a === b) {
        return 0;
    }
    return a < b ? -1 : 1;
}

function packageOwner(file) {
    const parts = path.resolve(file).split(path.sep);
    const modules = parts.lastIndexOf('node_modules');
    // Published packages may contain nested syntax/compatibility package.json files.
    const installedRoot =
        modules >= 0
            ? parts.slice(0, modules + (parts[modules + 1].startsWith('@') ? 3 : 2)).join(path.sep)
            : null;
    let directory = installedRoot || path.dirname(file);
    while (directory) {
        const manifest = path.join(directory, 'package.json');
        if (fs.existsSync(manifest)) {
            const metadata = JSON.parse(fs.readFileSync(manifest, 'utf8'));
            if (installedRoot || metadata.name || metadata.version) {
                if (!metadata.name || !metadata.version) {
                    throw new Error(`Missing package name/version: ${manifest}`);
                }
                return {
                    name: metadata.name,
                    version: metadata.version,
                    directory: fs.realpathSync(directory),
                };
            }
        }
        if (installedRoot) {
            throw new Error(`Missing package identity: ${installedRoot}`);
        }
        const parent = path.dirname(directory);
        if (parent === directory) {
            return null;
        }
        directory = parent;
    }
    return null;
}

function sourceOwner(source, outputFile, sourceRoot) {
    const encoded = source.match(/ucc-package:([^@]+)@([^/]+)\//);
    if (encoded) {
        return { name: decodeURIComponent(encoded[1]), version: decodeURIComponent(encoded[2]) };
    }
    if (source.includes('\0') || source.includes('ucc-generated:')) {
        return null;
    }
    const file = source.startsWith('file:')
        ? fileURLToPath(source)
        : path.resolve(path.dirname(outputFile), sourceRoot || '', source.split('?')[0]);
    const owner = packageOwner(file);
    if (!owner) {
        throw new Error(`No package identity for mapped source: ${source}`);
    }
    return { ...owner, file: fs.existsSync(file) ? fs.realpathSync(file) : file };
}

module.exports = function dependencyManifest({ producer, library = false }) {
    if (!['ucc-ui', 'custom-ui'].includes(producer)) {
        throw new Error('Unknown dependency producer');
    }
    const project = packageOwner(path.join(process.cwd(), '__project__.js'));
    if (!project) {
        throw new Error('The frontend project needs a package.json name and version');
    }
    let viteInternalMaps = false;
    let removeMaps = false;

    return {
        name: 'ucc-dependency-manifest',
        apply: 'build',
        // Vite must preserve maps through its transforms, before Rollup outputOptions.
        config(config) {
            viteInternalMaps = !config.build?.sourcemap;
            if (library || viteInternalMaps) {
                return { build: { sourcemap: 'hidden' } };
            }
            return undefined;
        },
        outputOptions(options) {
            removeMaps = !library && (viteInternalMaps || !options.sourcemap);
            return {
                ...options,
                sourcemap: library || !options.sourcemap ? 'hidden' : options.sourcemap,
                ...(library ? { sourcemapExcludeSources: true } : {}),
            };
        },
        load(id) {
            const mapPath = `${id}.map`;
            if (!fs.existsSync(mapPath)) {
                return null;
            }
            const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
            if (!map.sources?.some((source) => source.includes(marker))) {
                return null;
            }
            return { code: fs.readFileSync(id, 'utf8'), map };
        },
        generateBundle(options, bundle) {
            const chunks = [];
            for (const chunk of Object.values(bundle)) {
                if (chunk.type !== 'chunk') {
                    continue;
                }
                if (!chunk.map) {
                    this.error(`Missing dependency source map: ${chunk.fileName}`);
                }
                const outputFile = options.file || path.resolve(options.dir || '.', chunk.fileName);
                const map = JSON.parse(chunk.map.toString());
                const usedSources = new Set();
                for (const line of decode(map.mappings)) {
                    for (const segment of line) {
                        if (segment.length >= 4) {
                            usedSources.add(segment[1]);
                        }
                    }
                }
                const mappedPackages = new Set();
                for (const index of usedSources) {
                    const owner = sourceOwner(map.sources[index], outputFile, map.sourceRoot);
                    if (owner) {
                        mappedPackages.add(JSON.stringify([owner.name, owner.version]));
                    }
                }
                for (const [id, module] of Object.entries(chunk.modules)) {
                    if (!module.renderedLength || id.includes('\0')) {
                        continue;
                    }
                    const owner = packageOwner(id.split('?')[0]);
                    if (!owner || (!library && owner.directory === project.directory)) {
                        continue;
                    }
                    if (!mappedPackages.has(JSON.stringify([owner.name, owner.version]))) {
                        this.error(
                            `Unmapped dependency ${owner.name}@${owner.version} in ${chunk.fileName}; preserve source maps in transforming plugins`
                        );
                    }
                }
                const mapFile = chunk.sourcemapFileName || `${chunk.fileName}.map`;
                if (library) {
                    map.sources = map.sources.map((source) => {
                        const owner = sourceOwner(source, outputFile, map.sourceRoot);
                        if (!owner) {
                            return `ucc-generated:${encodeURIComponent(path.basename(source))}`;
                        }
                        return `${marker}${encodeURIComponent(owner.name)}@${encodeURIComponent(
                            owner.version
                        )}/${encodeURIComponent(
                            owner.file
                                ? path.relative(owner.directory, owner.file)
                                : path.basename(source)
                        )}`;
                    });
                    delete map.sourcesContent;
                    delete map.sourceRoot;
                    Object.assign(chunk.map, map);
                    delete chunk.map.sourcesContent;
                    const asset = bundle[mapFile];
                    // Rollup 2 writes maps later from chunk.map; Rollup 4 has map assets now.
                    if (asset) {
                        asset.source = JSON.stringify(map);
                    }
                    continue;
                }
                const packages = new Map();
                for (const index of usedSources) {
                    const owner = sourceOwner(map.sources[index], outputFile, map.sourceRoot);
                    if (!owner || owner.directory === project.directory) {
                        continue;
                    }
                    const identity = { name: owner.name, version: owner.version };
                    packages.set(JSON.stringify(identity), identity);
                }
                let writtenCode = chunk.code;
                if (
                    Number(this.meta.rollupVersion.split('.')[0]) < 3 &&
                    !removeMaps &&
                    options.sourcemap &&
                    options.sourcemap !== 'hidden'
                ) {
                    const url =
                        options.sourcemap === 'inline'
                            ? chunk.map.toUrl()
                            : `${path.basename(chunk.fileName)}.map`;
                    writtenCode += `//# sourceMappingURL=${url}\n`;
                }
                chunks.push({
                    path: chunk.fileName,
                    sha256: createHash('sha256').update(writtenCode).digest('hex'),
                    packages: [...packages.values()].sort(
                        (a, b) => compare(a.name, b.name) || compare(a.version, b.version)
                    ),
                });
                if (removeMaps) {
                    delete bundle[mapFile];
                    chunk.map = null;
                }
            }
            if (!library) {
                chunks.sort((a, b) => compare(a.path, b.path));
                this.emitFile({
                    type: 'asset',
                    fileName: 'dependency-chunks.json',
                    source: `${JSON.stringify({ schema_version: 1, producer, chunks }, null, 2)}\n`,
                });
            }
        },
    };
};
