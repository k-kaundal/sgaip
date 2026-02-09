import crypto from "crypto";

export const IDENTITY_DOMAIN = Buffer.from("SGAIP-v1");

export function deriveAID(publicKeyBytes: Buffer): string {
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([publicKeyBytes, IDENTITY_DOMAIN]))
    .digest("hex");
}
