// Polyfills for browser compatibility
// This file ensures all necessary globals are available before the app starts

import { Buffer } from 'buffer/';
import process from 'process/browser';

// Buffer polyfill
if (typeof window !== 'undefined') {
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }

  // Global polyfill
  if (!window.global) {
    window.global = window;
  }

  // Process polyfill
  if (!window.process) {
    window.process = process;
  }
}

export {};
