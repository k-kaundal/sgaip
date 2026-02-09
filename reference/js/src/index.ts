/**
 * SGAIP (Stateless Global Agent Identity Protocol)
 * Reference implementation library
 */

export { deriveAID, IDENTITY_DOMAIN } from "./identity.js";
export { generateKeyPair, type KeyPairResult } from "./keys.js";
export { sign, verify } from "./proof.js";
