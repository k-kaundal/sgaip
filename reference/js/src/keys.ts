import crypto from "crypto";

export interface KeyPairResult {
  publicKey: Buffer;
  privateKey: Buffer;
}

export function generateKeyPair(): KeyPairResult {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "der" },
    privateKeyEncoding: { type: "pkcs8", format: "der" }
  });
  
  return {
    publicKey: publicKey as Buffer,
    privateKey: privateKey as Buffer
  };
}
