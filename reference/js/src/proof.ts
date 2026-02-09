import crypto from "crypto";

export function sign(privateKey: Buffer, data: Buffer): Buffer {
  return crypto.sign(null, data, privateKey) as Buffer;
}

export function verify(publicKey: Buffer, data: Buffer, signature: Buffer): boolean {
  return crypto.verify(null, data, publicKey, signature);
}
