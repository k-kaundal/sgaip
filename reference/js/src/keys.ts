import crypto from "crypto";

export interface KeyPairResult {
  publicKey: Buffer;
  privateKey: Buffer;
}

export function generateKeyPair(): KeyPairResult {
  // @ts-ignore - Node.js supports raw ed25519 keys but TypeScript types are outdated
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "raw", format: "raw" },
    privateKeyEncoding: { type: "raw", format: "raw" }
  });
  
  return {
    // @ts-ignore - Returns Buffer when format: "raw" is used
    publicKey: publicKey,
    // @ts-ignore - Returns Buffer when format: "raw" is used
    privateKey: privateKey
  };
}
