#!/usr/bin/env node
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

// eslint-disable-next-line no-undef
const paramOutputDir = process.argv.find((arg) => arg.startsWith('output='))?.slice(7);

// eslint-disable-next-line no-undef
const TA_NAME = process.argv.find((arg) => arg.startsWith('ta_name='))?.slice(8);

if (!TA_NAME || TA_NAME === 'undefined') {
    throw new Error('ta_name is not defined. Please provide a valid ta_name parameter.');
}

// eslint-disable-next-line no-undef
const paramInitFileDir = process.argv.find((arg) => arg.startsWith('init_file_dir='))?.slice(14);

const initFileDir =
    paramInitFileDir !== undefined && paramInitFileDir !== 'undefined' && paramInitFileDir
        ? paramInitFileDir
        : 'src/ucc-ui.ts';

const viteUccGenConfigPath = `${dirName}/vite.config_ucc-gen-ui.ts`;

execSync(
    `vite build --config ${viteUccGenConfigPath} output=${paramOutputDir} ta_name=${TA_NAME} init_file_dir=${initFileDir}`,
    {
        stdio: 'inherit',
    }
);
