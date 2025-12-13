// Polyfills for browser compatibility
// This file ensures all necessary globals are available before the app starts

// Buffer polyfill
if (typeof window !== 'undefined') {
  if (!window.Buffer) {
    const { Buffer } = require('buffer/');
    window.Buffer = Buffer;
  }

  // Global polyfill
  if (!window.global) {
    window.global = window;
  }

  // Process polyfill
  if (!window.process) {
    window.process = require('process/browser');
  }
}

export {};
