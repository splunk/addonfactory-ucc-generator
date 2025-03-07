import { vi } from 'vitest';
import mockCustomControlMockForTest from './CustomControlMockForTest';

// Create a mock for the dynamic import
const mockCustomControl = {
  default: mockCustomControlMockForTest,
};

// Export the mock for use in tests
export default mockCustomControl;
