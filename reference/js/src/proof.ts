import crypto from "crypto";

export function sign(privateKey: Buffer, data: Buffer): Buffer {
  // @ts-ignore - Node.js supports raw ed25519 keys but TypeScript types are outdated
  const keyObject = crypto.createPrivateKey({
    key: privateKey,
    format: "raw",
    type: "ed25519"
  });
  return crypto.sign(null, data, keyObject) as Buffer;
}

export function verify(publicKey: Buffer, data: Buffer, signature: Buffer): boolean {
  // @ts-ignore - Node.js supports raw ed25519 keys but TypeScript types are outdated
  const keyObject = crypto.createPublicKey({
    key: publicKey,
    format: "raw",
    type: "ed25519"
  });
  return crypto.verify(null, data, keyObject, signature);
}
