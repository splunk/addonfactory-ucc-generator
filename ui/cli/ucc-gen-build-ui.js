#!/usr/bin/env node
import { execSync } from 'child_process';

execSync(
    'vite build --config ./node_modules/@splunk/add-on-ucc-framework/cli/vite.config_ucc-gen-ui.ts',
    { stdio: 'inherit' }
);
