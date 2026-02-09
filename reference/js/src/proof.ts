import crypto from "crypto";
import { createPrivateKeyObjectFromRaw, createPublicKeyObjectFromRaw } from "./keys.js";

/**
 * Sign data with an Ed25519 private key.
 * 
 * SECURITY RECOMMENDATIONS:
 * - The privateKey buffer remains in memory after this function returns
 * - Call zeroBuffer(privateKey) when you're done with the key
 * - Consider using createPrivateKeyObjectFromRaw(privateKey, true) to auto-zero
 * 
 * @param privateKey The raw 32-byte Ed25519 private key material
 * @param data The data to sign
 * @returns The signature bytes
 */
export function sign(privateKey: Buffer, data: Buffer): Buffer {
  const keyObject = createPrivateKeyObjectFromRaw(privateKey);
  return crypto.sign(null, data, keyObject) as Buffer;
}

/**
 * Verify a signature against data using an Ed25519 public key.
 * 
 * @param publicKey The raw 32-byte Ed25519 public key material
 * @param data The original data that was signed
 * @param signature The signature to verify
 * @returns true if the signature is valid, false otherwise
 */
export function verify(publicKey: Buffer, data: Buffer, signature: Buffer): boolean {
  const keyObject = createPublicKeyObjectFromRaw(publicKey);
  return crypto.verify(null, data, keyObject, signature);
}
