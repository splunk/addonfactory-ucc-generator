#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

// eslint-disable-next-line no-undef
const paramOutputDir = process.argv.find((arg) => arg.startsWith('output='))?.slice(7);
const viteUccGenConfigPath = `${dirName}/vite.config_ucc-gen-ui.ts`;

execSync(`vite build --config ${viteUccGenConfigPath} output=${paramOutputDir}`, {
    stdio: 'inherit',
});
