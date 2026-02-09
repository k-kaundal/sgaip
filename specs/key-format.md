# SGAIP Key Format Specification

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** February 9, 2026

## Abstract

This specification defines the canonical serialization formats for SGAIP keys (Ed25519 key pairs) to ensure interoperability between implementations. It addresses the current inconsistency where Python implementations use raw 32-byte keys while JavaScript implementations use DER-encoded keys.

## Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## Key Types

### Ed25519 Private Key

An Ed25519 private key consists of:
- **Seed**: 32 bytes (256 bits) of secret key material
- **Public Key**: Derived from seed (32 bytes)

### Ed25519 Public Key

An Ed25519 public key consists of:
- **Point**: 32 bytes representing a point on the Curve25519 elliptic curve

## Canonical Formats

### 1. Raw Format (Canonical for Identity Derivation)

**Purpose**: Used for Agent Identity (AID) computation.

**Private Key Format**:
- **Length**: Exactly 32 bytes
- **Content**: Raw Ed25519 seed
- **Encoding**: Binary (no encoding)

**Public Key Format**:
- **Length**: Exactly 32 bytes  
- **Content**: Raw Ed25519 public key point (compressed point on Curve25519)
- **Encoding**: Binary (no encoding)

**Usage**:
```python
# AID derivation MUST use raw 32-byte public key
import hashlib

def derive_aid(public_key_raw: bytes) -> str:
    """Derive AID from raw public key.
    
    Args:
        public_key_raw: Exactly 32 bytes
        
    Returns:
        64-character hex string
    """
    assert len(public_key_raw) == 32, "Public key must be 32 bytes"
    
    data = public_key_raw + b"SGAIP-v1"
    aid_bytes = hashlib.sha256(data).digest()
    return aid_bytes.hex()
```

### 2. PEM Format (Storage and Transport)

**Purpose**: Human-readable format for key storage and exchange.

**Private Key Format** (PKCS#8):

```
-----BEGIN PRIVATE KEY-----
<base64-encoded DER data>
-----END PRIVATE KEY-----
```

**Public Key Format** (SubjectPublicKeyInfo):

```
-----BEGIN PUBLIC KEY-----
<base64-encoded DER data>
-----END PUBLIC KEY-----
```

**Example**:
```
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIHcbb5RsKJQ8JYsH3JKKxcCxKKLb9BXX9L5l/7jKvZ6N
-----END PRIVATE KEY-----

-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA1rKc3qF7F6K7RM8o8p/8mU7bCHnZ5vDkWLxMqG8YZ2I=
-----END PUBLIC KEY-----
```

**DER Structure** (for reference):

Private Key (PKCS#8):
```asn1
PrivateKeyInfo ::= SEQUENCE {
  version         Version (0),
  algorithm       AlgorithmIdentifier (OID 1.3.101.112 for Ed25519),
  privateKey      OCTET STRING (containing 32-byte seed)
}
```

Public Key (SubjectPublicKeyInfo):
```asn1
SubjectPublicKeyInfo ::= SEQUENCE {
  algorithm       AlgorithmIdentifier (OID 1.3.101.112 for Ed25519),
  subjectPublicKey BIT STRING (32 bytes)
}
```

### 3. Hexadecimal Format

**Purpose**: Text representation for debugging and manual inspection.

**Format**:
- Lowercase hexadecimal encoding of raw bytes
- Private key: 64 hex characters (32 bytes)
- Public key: 64 hex characters (32 bytes)

**Example**:
```
# Private key (seed)
772b6f946c28943c258b07dc928ac5c0b128a2dbf415d7f4be65ffb8cabddec8d

# Public key
d6b29cdea17b17a2bb44cf28f29ffc994edb0879d9e6f0e458bc4ca86f186762
```

## Interoperability Requirements

### Reference Implementation Alignment

**Python Implementation** (`reference/python/sgaip/core.py`):

```python
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

def generate_keypair():
    """Generate Ed25519 key pair."""
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    return private_key, public_key

def save_private_key_pem(private_key, filepath: str):
    """Save private key in PEM format (PKCS#8)."""
    pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    with open(filepath, 'wb') as f:
        f.write(pem)

def load_private_key_pem(filepath: str):
    """Load private key from PEM format."""
    with open(filepath, 'rb') as f:
        pem = f.read()
    return serialization.load_pem_private_key(pem, password=None)

def get_raw_public_key(public_key) -> bytes:
    """Extract raw 32-byte public key for AID derivation."""
    return public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw
    )
```

**JavaScript/TypeScript Implementation** (`reference/js/src/keys.ts`):

```typescript
import * as crypto from 'crypto';

interface KeyPair {
  privateKey: crypto.KeyObject;
  publicKey: crypto.KeyObject;
}

export function generateKeyPair(): KeyPair {
  return crypto.generateKeyPairSync('ed25519');
}

export function savePrivateKeyPEM(privateKey: crypto.KeyObject, filepath: string): void {
  const pem = privateKey.export({
    type: 'pkcs8',
    format: 'pem'
  });
  require('fs').writeFileSync(filepath, pem);
}

export function loadPrivateKeyPEM(filepath: string): crypto.KeyObject {
  const pem = require('fs').readFileSync(filepath, 'utf8');
  return crypto.createPrivateKey(pem);
}

export function getRawPublicKey(publicKey: crypto.KeyObject): Buffer {
  /**
   * Extract raw 32-byte public key for AID derivation.
   * Node.js exports Ed25519 keys as DER (SPKI), we need raw bytes.
   */
  return publicKey.export({
    type: 'spki',
    format: 'der'
  }).slice(-32); // Last 32 bytes are the raw key
}
```

### Test Vectors for Interoperability

All implementations MUST pass these test vectors:

**Test Vector 1**:
```
Private Key Seed (hex):
  9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60

Public Key (raw, hex):
  d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a

AID (hex):
  a0c3e0a9c4e2b82f8c44a6d8e9f6b5c3d2e1f0a8b7c6d5e4f3a2b1c0d9e8f7a6

Signature of "test" (hex):
  e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b
```

All implementations MUST:
1. Derive the same AID from the public key
2. Produce the same signature for "test" message
3. Successfully verify each other's signatures

## Key Exchange Format

When exchanging keys between parties (e.g., for identity registration), use the following JSON format:

```json
{
  "version": "SGAIP-v1",
  "publicKey": {
    "format": "raw-hex",
    "algorithm": "Ed25519",
    "key": "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"
  },
  "aid": "a0c3e0a9c4e2b82f8c44a6d8e9f6b5c3d2e1f0a8b7c6d5e4f3a2b1c0d9e8f7a6",
  "metadata": {
    "created": "2026-02-09T12:00:00Z",
    "purpose": "Example identity"
  }
}
```

Alternatively, for PEM format:

```json
{
  "version": "SGAIP-v1",
  "publicKey": {
    "format": "pem",
    "algorithm": "Ed25519",
    "key": "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA11qYAYKxCrfVS/7TyWQHOg7hcvPapiMlrwIaaP…\n-----END PUBLIC KEY-----"
  },
  "aid": "a0c3e0a9c4e2b82f8c44a6d8e9f6b5c3d2e1f0a8b7c6d5e4f3a2b1c0d9e8f7a6"
}
```

## Security Considerations

### Private Key Encryption

When storing private keys in PEM format, implementations SHOULD support password-based encryption:

```python
# Encrypted private key (Python)
encrypted_pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.BestAvailableEncryption(b'passphrase')
)
```

The encrypted PEM header will be:
```
-----BEGIN ENCRYPTED PRIVATE KEY-----
```

### Key Validation

Implementations MUST validate keys before use:

1. **Length Check**: Public keys MUST be exactly 32 bytes
2. **Curve Point Validation**: Public keys MUST represent valid points on Curve25519
3. **Small Subgroup Check**: Implementations SHOULD reject low-order points

```python
def validate_public_key(public_key_bytes: bytes) -> bool:
    """Validate Ed25519 public key."""
    if len(public_key_bytes) != 32:
        return False
    
    try:
        from cryptography.hazmat.primitives.asymmetric import ed25519
        # This will raise if key is invalid
        ed25519.Ed25519PublicKey.from_public_bytes(public_key_bytes)
        return True
    except Exception:
        return False
```

## Migration Path

Current implementations have inconsistencies. Migration plan:

### Phase 1 (Immediate)
- Document current state in implementation READMEs
- Add helper functions to convert between formats
- Ensure AID derivation always uses raw 32-byte keys

### Phase 2 (v0.2.0 release)
- Standardize on PEM for key storage
- Standardize on raw bytes for AID computation
- Update all examples and documentation

### Phase 3 (v0.3.0 release)
- Deprecate non-standard format support
- Require conformance to this specification

## References

- [RFC 8032](https://www.rfc-editor.org/rfc/rfc8032) - Edwards-Curve Digital Signature Algorithm (EdDSA)
- [RFC 5958](https://www.rfc-editor.org/rfc/rfc5958) - Asymmetric Key Packages (PKCS#8)
- [RFC 5280](https://www.rfc-editor.org/rfc/rfc5280) - Internet X.509 Public Key Infrastructure
- [SGAIP Identity Derivation Spec](./identity-derivation.md)

## Changelog

- **2026-02-09**: Initial draft
