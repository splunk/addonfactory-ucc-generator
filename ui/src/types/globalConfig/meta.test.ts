import { describe, expect, it } from 'vitest';
import { meta } from './meta';

const baseMeta = {
    displayName: 'Splunk UCC test Add-on',
    name: 'Splunk_TA_UCCExample',
    restRoot: 'splunk_ta_uccexample',
    version: '1.0.0',
};

describe('meta schema', () => {
    it.each(['python3', 'python3.9'])('accepts pythonVersion %s', (pythonVersion) => {
        expect(meta.safeParse({ ...baseMeta, pythonVersion }).success).toBe(true);
    });

    it.each(['python3.13', 'python3.9\n', '3.9'])('rejects pythonVersion %j', (pythonVersion) => {
        expect(meta.safeParse({ ...baseMeta, pythonVersion }).success).toBe(false);
    });
});
