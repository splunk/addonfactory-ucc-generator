// eslint-disable-next-line import/no-extraneous-dependencies
import { vi } from 'vitest';
import { mockUnifiedConfig } from './mockUnifiedConfig';

export const getUnifiedConfigs = vi.fn().mockImplementation(() => mockUnifiedConfig);

export const generateToast = vi.fn();
