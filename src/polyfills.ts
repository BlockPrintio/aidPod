import { Buffer } from 'buffer';
import stream from 'stream-browserify';
import util from 'util';
import process from 'process';
import assert from 'assert';

// Extend Window interface for polyfills
declare global {
  interface Window {
    Buffer: typeof Buffer;
    process: typeof process;
    global: Window;
    stream: typeof stream;
    util: typeof util;
    assert: typeof assert;
  }
}

// Set up global polyfills
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.process = window.process || process;
  window.global = window;
  window.stream = stream;
  window.util = util;
  window.assert = assert;

  // Add readable-stream polyfills
  if (!window.stream.Readable) {
    window.stream.Readable = stream.Readable;
    window.stream.Writable = stream.Writable;
    window.stream.Duplex = stream.Duplex;
    window.stream.Transform = stream.Transform;
    window.stream.PassThrough = stream.PassThrough;
  }
}

// Export polyfills for direct imports if needed
export {
  Buffer,
  stream,
  util,
  process,
  assert
};

