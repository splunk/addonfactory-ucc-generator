import { vi } from "vitest";
// --- START of unnecessary polyfills
/**
 * @note The block below contains polyfills for Node.js globals
 * required for Jest to function when running JSDOM tests.
 * These HAVE to be require's and HAVE to be in this exact
 * order, since "undici" depends on the "TextEncoder" global API.
 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */

// the most of the polyfills are applied with jest-fixed-jsdom package

HTMLCanvasElement.prototype.getContext = vi.fn();

// --- END of unnecessary polyfills
