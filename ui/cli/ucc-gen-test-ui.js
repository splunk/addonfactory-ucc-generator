#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const viteTestUccConfigPath = `${dirName}/vite.config_ucc-test-gen-ui.ts`;

execSync(`vitest run --coverage --config ${viteTestUccConfigPath}`, {
    stdio: 'inherit',
});
