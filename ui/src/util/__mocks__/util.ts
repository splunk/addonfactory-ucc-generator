import { vi } from 'vitest';
import { mockUnifiedConfig } from './mockUnifiedConfig';

export const getUnifiedConfigs = vi.fn().mockReturnValue(mockUnifiedConfig);

export const generateToast = vi.fn();
