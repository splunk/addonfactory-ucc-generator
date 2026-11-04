#!/usr/bin/env node
import { execSync } from 'child_process';
import process from 'node:process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);

const paramOutputDir = process.argv.find((arg) => arg.startsWith('output='))?.slice(7);

const TA_NAME = process.argv.find((arg) => arg.startsWith('ta_name='))?.slice(8);

if (!TA_NAME || TA_NAME === 'undefined') {
    throw new Error('ta_name is not defined. Please provide a valid ta_name parameter.');
}

const paramInitFileDir = process.argv.find((arg) => arg.startsWith('init_file_dir='))?.slice(14);

const initFileDir =
    paramInitFileDir !== undefined && paramInitFileDir !== 'undefined' && paramInitFileDir
        ? paramInitFileDir
        : 'src/ucc-ui.ts';

const inventory =
    process.argv.includes('--dependency-manifest') || process.env.UCC_DEPENDENCY_MANIFEST === '1';
// Source-map composition for the full UCC graph needs the same heap as the standard UI build.
const nodeOptions = process.env.NODE_OPTIONS || '';
const hasHeapLimit = /(?:^|\s)--max[-_]old[-_]space[-_]size(?:=|\s)/.test(nodeOptions);
const inventoryEnv = inventory
    ? {
          ...process.env,
          UCC_DEPENDENCY_MANIFEST: '1',
          NODE_OPTIONS: hasHeapLimit
              ? nodeOptions
              : [nodeOptions, '--max-old-space-size=8192'].filter(Boolean).join(' '),
      }
    : undefined;

const viteUccGenConfigPath = `${dirName}/vite.config_ucc-gen-ui.ts`;

execSync(
    `vite build --config ${viteUccGenConfigPath} output=${paramOutputDir} ta_name=${TA_NAME} init_file_dir=${initFileDir}`,
    {
        stdio: 'inherit',
        env: inventoryEnv,
    }
);
