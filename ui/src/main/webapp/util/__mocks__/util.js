import { mockUnifiedConfig } from './mockUnifiedConfig';

export const generateEndPointUrl = jest.fn(() => 'mockGeneratedEndPointUrl');

export const getUnifiedConfigs = jest.fn().mockImplementation(() => mockUnifiedConfig);

export const generateToast = jest.fn();
