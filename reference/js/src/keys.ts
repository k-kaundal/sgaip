import crypto from "crypto";

export interface KeyPairResult {
  publicKey: Buffer;
  privateKey: Buffer;
  /**
   * Securely zeros out the private key from memory.
   * Call this when the key is no longer needed to minimize the window
   * during which the key material exists in RAM.
   */
  zeroPrivateKey(): void;
}

/**
 * Securely zeros out a sensitive buffer from memory.
 * @param buffer The buffer containing sensitive data to be wiped
 */
export function zeroBuffer(buffer: Buffer): void {
  if (!buffer || buffer.length === 0) return;
  // Fill the buffer with random data first, then zeros
  crypto.randomFillSync(buffer);
  buffer.fill(0);
}

/**
 * Extract raw Ed25519 private key bytes (32 bytes) from PKCS8 DER encoding.
 * PKCS8 structure contains the raw key material. We parse it to extract just the raw bytes.
 */
function extractPrivateKeyFromDer(derBuffer: Buffer): Buffer {
  // PKCS8 DER for Ed25519 has this structure:
  // SEQUENCE {
  //   INTEGER 0                              (version)
  //   SEQUENCE { OID 1.3.101.112 }           (algorithm identifier)
  //   OCTET STRING {                         (privateKey)
  //     OCTET STRING (32 bytes raw key)
  //   }
  // }
  // We need to find the inner OCTET STRING which contains the raw key
  
  // Look for the pattern: 0x04 0x20 (OCTET STRING of length 32)
  // This should appear twice - once wrapping, once for the actual key
  let lastOctetStringPos = -1;
  for (let i = 0; i < derBuffer.length - 33; i++) {
    if (derBuffer[i] === 0x04 && derBuffer[i + 1] === 0x20) {
      lastOctetStringPos = i;
    }
  }
  
  if (lastOctetStringPos === -1) {
    throw new Error("Invalid PKCS8 Ed25519 private key format");
  }
  
  // The raw key starts after the OCTET STRING tag (0x04) and length (0x20)
  return derBuffer.subarray(lastOctetStringPos + 2, lastOctetStringPos + 34);
}

/**
 * Extract raw Ed25519 public key bytes (32 bytes) from SPKI DER encoding.
 * SPKI structure contains the raw key material. We parse it to extract just the raw bytes.
 */
function extractPublicKeyFromDer(derBuffer: Buffer): Buffer {
  // SPKI DER for Ed25519 has this structure:
  // SEQUENCE {
  //   SEQUENCE { OID 1.3.101.112 }           (algorithm identifier)
  //   BIT STRING (containing 32 bytes)       (publicKey)
  // }
  // The BIT STRING format is: tag (0x03), length, numberOfUnusedBits (0x00), then the 32 bytes
  
  // Look for BIT STRING tag (0x03) followed by length 0x21 (33 bytes = 1 byte unused bits + 32 bytes key)
  for (let i = 0; i < derBuffer.length - 34; i++) {
    if (derBuffer[i] === 0x03 && derBuffer[i + 1] === 0x21 && derBuffer[i + 2] === 0x00) {
      // Found the BIT STRING with 0 unused bits, and the 32-byte key follows
      return derBuffer.subarray(i + 3, i + 35);
    }
  }
  
  throw new Error("Invalid SPKI Ed25519 public key format");
}

/**
 * Generates a new Ed25519 keypair with raw key material.
 * 
 * SECURITY WARNING: The returned KeyPairResult contains the private key in plaintext
 * in a Buffer. For maximum security:
 * - Call zeroPrivateKey() when finished with the key
 * - Never log or serialize the private key
 * - Store the private key encrypted at rest
 * - Keep the key material in memory only as long as needed
 * 
 * @returns A KeyPairResult containing public and private keys in raw format
 */
export function generateKeyPair(): KeyPairResult {
  // Generate in PEM format (more compatible across Node.js versions)
  const { publicKey: publicKeyPem, privateKey: privateKeyPem } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  // Load the PEM keys as KeyObjects so we can export as DER
  const publicKeyObj = crypto.createPublicKey({
    key: publicKeyPem,
    format: "pem"
  });

  const privateKeyObj = crypto.createPrivateKey({
    key: privateKeyPem,
    format: "pem"
  });

  // Export as DER format
  const publicKeyDer = publicKeyObj.export({ format: "der", type: "spki" }) as Buffer;
  const privateKeyDer = privateKeyObj.export({ format: "der", type: "pkcs8" }) as Buffer;

  // Extract raw key bytes from DER
  const publicKeyRaw = extractPublicKeyFromDer(publicKeyDer);
  const privateKeyRaw = extractPrivateKeyFromDer(privateKeyDer);

  return {
    publicKey: publicKeyRaw,
    privateKey: privateKeyRaw,
    zeroPrivateKey(): void {
      zeroBuffer(privateKeyRaw);
    }
  };
}

/**
 * Convert raw Ed25519 private key bytes to a crypto KeyObject.
 * Uses a workaround for compatibility with various Node.js versions.
 * 
 * SECURITY WARNING: When you're done using the returned KeyObject,
 * consider calling zeroBuffer() on the input privateKeyBytes if you no longer need it.
 * 
 * @param privateKeyBytes The raw 32-byte Ed25519 private key material
 * @param autoZero If true, zeros out the input buffer after creating the KeyObject (default: false)
 * @returns A crypto.KeyObject for signing operations
 */
export function createPrivateKeyObjectFromRaw(privateKeyBytes: Buffer, autoZero: boolean = false): crypto.KeyObject {
  try {
    // Try the raw format approach first
    const keyObject = crypto.createPrivateKey({
      key: privateKeyBytes,
      format: "raw",
      type: "ed25519"
    } as any) as crypto.KeyObject;
    
    if (autoZero) {
      zeroBuffer(privateKeyBytes);
    }
    
    return keyObject;
  } catch (err) {
    // Fallback: convert raw bytes to PKCS8 DER format
    // PKCS8 structure: SEQUENCE { version INTEGER, algorithm SEQUENCE { OID, NULL }, privateKey OCTET STRING }
    // OID for Ed25519 is 1.3.101.112 = 06 03 2B 65 70
    const pkcs8Key = Buffer.concat([
      Buffer.from([
        0x30, 0x2e, // SEQUENCE, length 46
        0x02, 0x01, 0x00, // INTEGER 0 (version)
        0x30, 0x05, // SEQUENCE (algorithm), length 5
        0x06, 0x03, 0x2b, 0x65, 0x70, // OID 1.3.101.112 (Ed25519)
        0x04, 0x22, // OCTET STRING, length 34
        0x04, 0x20 // OCTET STRING, length 32 (the actual key)
      ]),
      privateKeyBytes
    ]);
    const keyObject = crypto.createPrivateKey({
      key: pkcs8Key,
      format: "der",
      type: "pkcs8"
    });
    
    // Always zero the temporary PKCS8 buffer
    zeroBuffer(pkcs8Key);
    
    if (autoZero) {
      zeroBuffer(privateKeyBytes);
    }
    
    return keyObject;
  }
}

/**
 * Convert raw Ed25519 public key bytes to a crypto KeyObject.
 * Uses a workaround for compatibility with various Node.js versions.
 * 
 * NOTE: Public keys do not require the same secure handling as private keys,
 * but it's good practice to be consistent with cryptographic material management.
 * 
 * @param publicKeyBytes The raw 32-byte Ed25519 public key material
 * @param autoZero If true, zeros out the input buffer after creating the KeyObject (default: false)
 * @returns A crypto.KeyObject for verification operations
 */
export function createPublicKeyObjectFromRaw(publicKeyBytes: Buffer, autoZero: boolean = false): crypto.KeyObject {
  try {
    // Try the raw format approach first
    const keyObject = crypto.createPublicKey({
      key: publicKeyBytes,
      format: "raw",
      type: "ed25519"
    } as any) as crypto.KeyObject;
    
    if (autoZero) {
      zeroBuffer(publicKeyBytes);
    }
    
    return keyObject;
  } catch (err) {
    // Fallback: convert raw bytes to SubjectPublicKeyInfo (SPKI) DER format
    const spkiKey = Buffer.concat([
      Buffer.from([0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00]),
      publicKeyBytes
    ]);
    const keyObject = crypto.createPublicKey({
      key: spkiKey,
      format: "der",
      type: "spki"
    });
    
    // Always zero the temporary SPKI buffer
    zeroBuffer(spkiKey);
    
    if (autoZero) {
      zeroBuffer(publicKeyBytes);
    }
    
    return keyObject;
  }
}
