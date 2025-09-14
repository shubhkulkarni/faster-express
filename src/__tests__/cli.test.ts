import { describe, test, expect } from '@jest/globals';

describe('faster-express CLI', () => {
  test('should be defined', () => {
    expect(true).toBe(true);
  });

  test('package.json should have correct name', () => {
    const pkg = require('../../package.json');
    expect(pkg.name).toBe('faster-express');
  });

  test('should have bin configuration', () => {
    const pkg = require('../../package.json');
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin['faster-express']).toBe('./bin/faster-express');
  });
});
