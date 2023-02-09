import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

/**
 * Configure test attributes
 */
configure({ testIdAttribute: 'data-test' });
