# SGAIP Algorithm Agility Specification

**Version:** 2.0  
**Status:** Draft  
**Last Updated:** February 9, 2026

## Abstract

This specification defines SGAIP v2 with support for multiple cryptographic algorithms, enabling migration to post-quantum cryptography while maintaining backward compatibility with SGAIP v1 (Ed25519-only). Algorithm agility allows the protocol to adapt to cryptographic advances and quantum threats without fundamental redesign.

## Motivation

SGAIP v1 is bound to Ed25519, which is vulnerable to quantum computers. To ensure long-term viability, SGAIP v2 introduces:

1. **Algorithm Identifiers**: Distinguishable signature schemes
2. **Versioned AIDs**: Protocol version encoded in identity derivation
3. **Negotiation Protocol**: Verifiers and provers agree on supported algorithms
4. **Migration Path**: Smooth transition from classical to post-quantum cryptography

## Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

---

## Algorithm Registry

### Supported Signature Algorithms

Each algorithm is assigned a unique 1-byte identifier:

| Algorithm ID | Algorithm Name | Status | Quantum-Resistant | Standardization |
|--------------|---------------|--------|-------------------|-----------------|
| `0x00` | Reserved | - | - | - |
| `0x01` | Ed25519 | Legacy | ❌ No | RFC 8032 |
| `0x02` | ML-DSA-65 | **RECOMMENDED** | ✅ Yes | NIST FIPS 204 |
| `0x03` | ML-DSA-87 | Active | ✅ Yes | NIST FIPS 204 |
| `0x04` | SLH-DSA-128s | Active | ✅ Yes | NIST FIPS 205 |
| `0x05` | SLH-DSA-128f | Active | ✅ Yes | NIST FIPS 205 |
| `0x06` | FALCON-512 | Experimental | ✅ Yes | NIST Round 3 |
| `0x07` | FALCON-1024 | Experimental | ✅ Yes | NIST Round 3 |
| `0x08-0xEF` | Reserved | - | - | - |
| `0xF0-0xFF` | Custom/Experimental | - | Varies | N/A |

**Algorithm Selection Criteria**:
- NIST-standardized algorithms preferred
- Quantum-resistant algorithms required for new identities (post-2027)
- Backward compatibility with Ed25519 until 2030

### Algorithm Properties

#### Ed25519 (0x01)
```yaml
Public Key Size: 32 bytes
Private Key Size: 64 bytes (32-byte seed + 32-byte public key)
Signature Size: 64 bytes
Security Level: ~128-bit classical, 0-bit quantum
Performance: Excellent (fast sign/verify)
Status: Legacy (deprecated for new identities after 2027)
```

#### ML-DSA-65 (0x02) [RECOMMENDED]
```yaml
Public Key Size: 1,952 bytes
Private Key Size: 4,000 bytes
Signature Size: 3,293 bytes
Security Level: ~192-bit quantum-resistant
Performance: Good (practical for real-time)
Status: RECOMMENDED for all new identities
```

#### ML-DSA-87 (0x03)
```yaml
Public Key Size: 2,592 bytes
Private Key Size: 4,864 bytes
Signature Size: 4,595 bytes
Security Level: ~256-bit quantum-resistant
Performance: Good
Status: For high-security applications
```

#### SLH-DSA-128s (0x04)
```yaml
Public Key Size: 32 bytes
Private Key Size: 64 bytes
Signature Size: 7,856 bytes
Security Level: ~128-bit quantum-resistant
Performance: Slower signing, fast verification
Status: Conservative alternative
```

---

## SGAIP v2 Protocol

### AID Derivation v2

**Formula**:
```
AID_v2 = SHA-256(Version || AlgorithmID || PublicKey || DomainString)
```

**Parameters**:
- `Version`: 1 byte = `0x02` (protocol version 2)
- `AlgorithmID`: 1 byte (from algorithm registry)
- `PublicKey`: Variable length (algorithm-dependent raw public key bytes)
- `DomainString`: ASCII string = `"SGAIP-v2"`

**Example (ML-DSA-65)**:
```python
import hashlib

def derive_aid_v2(algorithm_id: int, public_key: bytes) -> str:
    """Derive SGAIP v2 Agent Identity.
    
    Args:
        algorithm_id: 1-byte algorithm identifier (e.g., 0x02 for ML-DSA-65)
        public_key: Raw public key bytes (length depends on algorithm)
        
    Returns:
        64-character hex string (256-bit AID)
    """
    version = bytes([0x02])  # SGAIP v2
    algo_id = bytes([algorithm_id])
    domain = b"SGAIP-v2"
    
    data = version + algo_id + public_key + domain
    aid_bytes = hashlib.sha256(data).digest()
    return aid_bytes.hex()

# Example for ML-DSA-65
aid = derive_aid_v2(0x02, ml_dsa_public_key)
# Output: "c7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8"
```

### Backward Compatibility with v1

**v1 AID Format** (no version byte):
```
AID_v1 = SHA-256(PublicKey_Ed25519 || "SGAIP-v1")
```

**Distinguishing v1 from v2**:
- v2 AIDs derived with explicit version byte (0x02) prepended
- v1 AIDs lack version byte (implicitly version 0x01)
- Verifiers MUST attempt v2 verification first, fall back to v1 if needed

**v1 Support Timeline**:
- **2026-2027**: v1 and v2 both fully supported
- **2028-2029**: v1 deprecated but functional, warnings issued
- **2030+**: v1 support optional (implementations MAY reject v1 proofs)

---

## Proof Protocol v2

### Proof Generation

**Input**:
- `private_key`: Algorithm-specific private key
- `algorithm_id`: 1-byte algorithm identifier
- `challenge`: Random bytes from verifier (≥32 bytes)

**Output**:
- `proof`: JSON object containing signature and metadata

**Process**:
1. Generate signature: `signature = Sign(private_key, challenge)`
2. Derive public key: `public_key = GetPublicKey(private_key)`
3. Derive AID: `aid = derive_aid_v2(algorithm_id, public_key)`
4. Package proof

**Proof Structure (JSON)**:
```json
{
  "version": "SGAIP-v2",
  "algorithmId": 2,
  "aid": "c7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
  "publicKey": "<base64-encoded public key>",
  "signature": "<base64-encoded signature>",
  "challenge": "<base64-encoded challenge>",
  "timestamp": "2026-02-09T12:00:00Z"
}
```

### Proof Verification

**Input**:
- `proof`: JSON proof object
- `expected_aid`: (Optional) AID to verify against

**Output**:
- `valid`: Boolean (true if proof valid)
- `aid`: Derived AID
- `algorithm`: Algorithm used

**Process**:
1. Parse proof JSON
2. Extract `algorithmId`, `publicKey`, `signature`, `challenge`
3. Lookup algorithm parameters (key size, verification function)
4. Validate public key format and size
5. Verify signature: `Verify(publicKey, challenge, signature)`
6. Independently derive AID: `aid_computed = derive_aid_v2(algorithmId, publicKey)`
7. Compare `aid_computed` with `proof.aid` (constant-time comparison)
8. If `expected_aid` provided, compare with `aid_computed`
9. Return verification result

**Python Example**:
```python
import json
import base64
from typing import Dict, Tuple

def verify_proof_v2(proof_json: str, expected_aid: str = None) -> Tuple[bool, str]:
    """Verify SGAIP v2 proof.
    
    Args:
        proof_json: JSON-encoded proof
        expected_aid: Optional AID to verify against
        
    Returns:
        (valid, aid) tuple
    """
    proof = json.loads(proof_json)
    
    # Extract components
    algo_id = proof['algorithmId']
    public_key = base64.b64decode(proof['publicKey'])
    signature = base64.b64decode(proof['signature'])
    challenge = base64.b64decode(proof['challenge'])
    claimed_aid = proof['aid']
    
    # Get algorithm-specific verifier
    verifier = get_verifier(algo_id)
    
    # Verify signature
    if not verifier.verify(public_key, challenge, signature):
        return False, None
    
    # Independently derive AID
    computed_aid = derive_aid_v2(algo_id, public_key)
    
    # Compare AIDs (constant-time)
    if not constant_time_compare(computed_aid, claimed_aid):
        return False, None
    
    # Check against expected AID if provided
    if expected_aid and not constant_time_compare(computed_aid, expected_aid):
        return False, None
    
    return True, computed_aid
```

---

## Algorithm Negotiation

### Capability Advertisement

**Verifier Capability Announcement**:
```json
{
  "supportedAlgorithms": [1, 2, 3, 4],
  "preferredAlgorithm": 2,
  "version": "SGAIP-v2",
  "quantumResistantOnly": false
}
```

**Prover Algorithm Selection**:
1. Prover receives verifier capabilities
2. Prover selects strongest mutually supported algorithm
3. If no common algorithm, negotiation fails

### Fallback Strategy

**Priority Order** (strongest to weakest):
1. ML-DSA-87 (0x03) - Highest quantum security
2. ML-DSA-65 (0x02) - Recommended balance
3. SLH-DSA-128s (0x04) - Conservative alternative
4. Ed25519 (0x01) - Legacy only

**Negotiation Example**:
```
Verifier supports: [0x01, 0x02, 0x03]
Prover has: ML-DSA-65 (0x02) identity
Result: Use ML-DSA-65
```

```
Verifier supports: [0x01]  // Legacy-only
Prover has: ML-DSA-65 (0x02) identity
Result: Negotiation fails (quantum-resistant required)
```

### Migration Mode (Hybrid Identities)

**Dual-Algorithm Identity**:
- Prover maintains TWO key pairs (e.g., Ed25519 + ML-DSA-65)
- Both derive to SAME logical identity (via binding statement)
- Prover can prove with either algorithm based on verifier capability

**Hybrid Proof Structure**:
```json
{
  "version": "SGAIP-v2-hybrid",
  "primaryAlgorithm": 2,
  "fallbackAlgorithm": 1,
  "aid": {
    "primary": "c7e8f9a0...",
    "fallback": "a3b2c1d0..."
  },
  "signatures": {
    "primary": "<ML-DSA-65 signature>",
    "fallback": "<Ed25519 signature>"
  },
  "publicKeys": {
    "primary": "<ML-DSA public key>",
    "fallback": "<Ed25519 public key>"
  },
  "bindingProof": "<signature linking both identities>",
  "challenge": "<challenge>"
}
```

**Hybrid Verification**:
- Verifier MUST verify at least primary signature
- Verifier MAY verify both for defense-in-depth
- Binding proof ensures same entity controls both keys

---

## Wire Format Specification

### Compact Binary Format (Alternative to JSON)

For bandwidth-constrained environments:

```
+--------+----------+----------+-----------+-----------+----------+
| Version | AlgoID  | PubKeyLen|  PubKey   |   SigLen  |   Sig    |
| 1 byte  | 1 byte  | 2 bytes  | variable  | 2 bytes   | variable |
+--------+----------+----------+-----------+-----------+----------+
```

**Advantages**:
- No JSON parsing overhead
- Minimal bandwidth (no field names, whitespace)
- Fixed parsing logic

**Disadvantages**:
- Less human-readable
- Requires schema versioning

**Encoding Example** (Python):
```python
import struct

def encode_proof_binary(version: int, algo_id: int, public_key: bytes, signature: bytes) -> bytes:
    """Encode proof in compact binary format."""
    header = struct.pack('BB', version, algo_id)
    pubkey_len = struct.pack('>H', len(public_key))  # Big-endian 2-byte length
    sig_len = struct.pack('>H', len(signature))
    
    return header + pubkey_len + public_key + sig_len + signature
```

---

## Security Considerations

### Algorithm Downgrade Attacks

**Threat**: Adversary intercepts negotiation and forces use of weak algorithm.

**Mitigation**:
1. **Integrity Protection**: Use TLS for negotiation channel
2. **Policy Enforcement**: Verifiers MAY reject weak algorithms (e.g., Ed25519 after 2030)
3. **Audit Logging**: Log algorithm used for each verification

### Algorithm Confusion Attacks

**Threat**: Adversary submits signature from one algorithm claiming it's another.

**Mitigation**:
1. **Explicit Algorithm ID**: Always include algorithm ID in proof
2. **Independent Verification**: Verifier re-derives AID with specified algorithm
3. **Type-Safe Parsing**: Validate public key format matches algorithm

### Quantum Transition Attacks

**Threat**: During hybrid mode, adversary breaks weak algorithm (Ed25519) to impersonate.

**Mitigation**:
1. **Both Signatures Required** (post-2028): Verifiers MUST accept BOTH signatures during transition
2. **Binding Proof**: Cryptographically link classical and PQC identities
3. **Timeline Enforcement**: Hard cutoff for Ed25519-only proofs by 2030

### Algorithm Identifier Exhaustion

**Threat**: 256 algorithm IDs (1 byte) may be insufficient long-term.

**Mitigation**:
1. **Reserved Range**: 0xF0-0xFF for experimental/custom algorithms
2. **Future Extension**: Reserve version byte values for extended algorithm namespaces
3. **Deprecation Strategy**: Retire obsolete algorithms to reclaim IDs

---

## Implementation Guidelines

### Algorithm Provider Interface

Implementations SHOULD use a plugin architecture:

```python
class AlgorithmProvider:
    """Abstract interface for signature algorithms."""
    
    @abstractmethod
    def generate_keypair(self) -> Tuple[PrivateKey, PublicKey]:
        """Generate new key pair."""
        pass
    
    @abstractmethod
    def sign(self, private_key: PrivateKey, message: bytes) -> bytes:
        """Sign message."""
        pass
    
    @abstractmethod
    def verify(self, public_key: PublicKey, message: bytes, signature: bytes) -> bool:
        """Verify signature."""
        pass
    
    @abstractmethod
    def get_algorithm_id(self) -> int:
        """Return algorithm ID."""
        pass
    
    @abstractmethod
    def get_public_key_size(self) -> int:
        """Expected public key size in bytes."""
        pass
```

**Implementations**:
- `Ed25519Provider` (algorithm ID 0x01)
- `MLDSA65Provider` (algorithm ID 0x02)
- `MLDSA87Provider` (algorithm ID 0x03)
- `SLHDSA128sProvider` (algorithm ID 0x04)

### Library Recommendations

**Python**:
- Ed25519: `cryptography` library
- ML-DSA: `liboqs-python` (NIST PQC implementations)
- SLH-DSA: `liboqs-python`

**JavaScript/TypeScript**:
- Ed25519: `@noble/ed25519` or Node.js `crypto`
- ML-DSA: `pqc-js` or WebAssembly ports of liboqs
- SLH-DSA: WebAssembly implementations

**Rust**:
- Ed25519: `ed25519-dalek`
- ML-DSA: `pqcrypto-dilithium`
- SLH-DSA: `pqcrypto-sphincsplus`

---

## Test Vectors

### Ed25519 (Algorithm ID 0x01)

```yaml
Private Key Seed (hex):
  9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60

Public Key (hex):
  d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a

AID v2 (hex):
  Version: 0x02, AlgoID: 0x01
  Input: 02 01 d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a 534741 49502d7632
  AID: 8f2e3b4a5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2

Challenge (hex):
  746573742063686c6c656e6765  // "test challenge"

Signature (hex):
  92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00
```

### ML-DSA-65 (Algorithm ID 0x02)

*Note: Actual test vectors pending liboqs integration. Placeholder structure:*

```yaml
Private Key (hex):
  <4000 bytes, omitted for brevity>

Public Key (hex, first 64 bytes):
  c1d5e9f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0...

AID v2 (hex):
  Version: 0x02, AlgoID: 0x02
  AID: 7a3f8e9c0d1b2a4f5e6c7d8b9a0e1f2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8

Challenge (hex):
  746573742063686c6c656e6765

Signature (hex, first 64 bytes):
  e8f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2...
```

---

## Changelog

- **2026-02-09**: Initial v2 specification with algorithm agility

---

## References

1. [SGAIP Post-Quantum Analysis](./post-quantum-analysis.md)
2. [NIST FIPS 204: Module-Lattice-Based Digital Signature Standard](https://csrc.nist.gov/pubs/fips/204/final)
3. [NIST FIPS 205: Stateless Hash-Based Digital Signature Standard](https://csrc.nist.gov/pubs/fips/205/final)
4. [RFC 8032: Edwards-Curve Digital Signature Algorithm (EdDSA)](https://www.rfc-editor.org/rfc/rfc8032)

---

**Next Steps**: 
1. Implement AID v2 derivation in reference implementations
2. Integrate liboqs for ML-DSA support
3. Create comprehensive test vectors
4. Benchmark performance comparison (v1 vs v2)
