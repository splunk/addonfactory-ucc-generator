import { mockUnifiedConfig } from './mockUnifiedConfig';

export const getUnifiedConfigs = jest.fn().mockImplementation(() => mockUnifiedConfig);

export const generateToast = jest.fn();
