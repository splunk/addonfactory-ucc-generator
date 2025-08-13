import { defineConfig } from 'vite';
import type { ViteUserConfig as VitestUserConfigInterface } from 'vitest/config';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const ucctestSetup = `${dirName}/ucc-vite-test-setup.ts`;

const vitestTestConfig: VitestUserConfigInterface = {
    test: {
        watch: false,
        globals: true,
        environment: 'jsdom',
        setupFiles: ucctestSetup,
        server: {
            deps: {
                inline: ['jspdf'],
            },
        },
        coverage: {
            all: true,
            provider: 'istanbul',
            reporter: ['text'],
            include: ['src/**/*.{js,jsx,ts,tsx}'],
        },
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/**.stories.**',
            '**/*.types.ts',
            '**/tests/**',
            '**/test/**',
            '**/mock*',
            '**/__mocks__/**',
            '**/*.d.ts',
            '**/*.types.ts',
        ],
    },
};

export default defineConfig({
    logLevel: 'info',
    plugins: [
        react(),
        checker({
            typescript: true,
        }),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    base: '',
    test: vitestTestConfig.test,
});
