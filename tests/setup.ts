import "@testing-library/jest-dom";

// Polyfill text encoding/crypto if needed in test environment
if (typeof globalThis.crypto === "undefined") {
  const { webcrypto } = require("crypto");
  // @ts-ignore
  globalThis.crypto = webcrypto;
}
