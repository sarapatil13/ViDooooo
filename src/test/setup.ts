import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest + React 19: make sure each test starts with an empty DOM.
afterEach(() => {
  cleanup();
});
