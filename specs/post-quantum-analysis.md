# SGAIP Post-Quantum Cryptography Analysis

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** February 9, 2026

## Executive Summary

SGAIP v1 uses Ed25519 (elliptic curve cryptography) which is vulnerable to quantum computers running Shor's algorithm. This document analyzes the quantum threat, evaluates post-quantum cryptography (PQC) alternatives, and proposes a migration path to quantum-resistant SGAIP v2.

**Key Findings:**
- ⚠️ **Quantum Threat Timeline**: Large-scale quantum computers capable of breaking Ed25519 estimated 2030-2040
- ✅ **NIST PQC Standards Available**: ML-DSA (lattice-based) standardized in 2024
- 📋 **Migration Strategy**: Hybrid classical+PQC mode during transition, full PQC by 2030
- 🎯 **Recommended Algorithm**: ML-DSA-65 (balanced security/performance)

---

## Table of Contents

1. [Quantum Threat Assessment](#quantum-threat-assessment)
2. [Impact on SGAIP v1](#impact-on-sgaip-v1)
3. [Post-Quantum Cryptography Overview](#post-quantum-cryptography-overview)
4. [Algorithm Evaluation](#algorithm-evaluation)
5. [Recommended Algorithms](#recommended-algorithms)
6. [SGAIP v2 Design](#sgaip-v2-design)
7. [Migration Strategy](#migration-strategy)
8. [Implementation Roadmap](#implementation-roadmap)
9. [References](#references)

---

## Quantum Threat Assessment

### Quantum Computing Progress

**Current State (2026)**:
- Largest quantum computers: ~1,000-2,000 qubits (IBM, Google)
- Error rates: ~0.1-1% per gate operation
- Not yet capable of running Shor's algorithm at scale

**Projected Timeline**:
- **2028-2030**: First demonstrations of breaking small RSA/ECC keys (research setting)
- **2030-2035**: Potential for breaking 256-bit ECC (Ed25519) with specialized hardware
- **2035-2040**: Cryptographically relevant quantum computers (CRQCs) potentially widespread

**Conservative Assumption**: Plan for quantum computers capable of breaking Ed25519 by **2030**.

### Shor's Algorithm Impact

**Attack Complexity**:
- Shor's algorithm solves Elliptic Curve Discrete Logarithm Problem (ECDLP) in polynomial time
- Estimated qubits needed to break Ed25519: ~2,330 logical qubits (with error correction: ~millions of physical qubits)
- Time to break: Hours to days on a CRQC

**What This Means for SGAIP**:
- Private keys can be recovered from public keys
- All existing AIDs compromised (anyone can forge proofs)
- Complete protocol failure

### Grover's Algorithm Impact on SHA-256

**Attack Complexity**:
- Grover's algorithm provides quadratic speedup for preimage attacks
- SHA-256 security reduced from 256-bit to 128-bit against quantum adversary
- 128-bit security still adequate for most applications

**What This Means for SGAIP**:
- AID collision/preimage attacks slightly easier but still infeasible
- SHA-256 acceptable for SGAIP v2 (but consider SHA-3/SHAKE for future versions)

---

## Impact on SGAIP v1

### Compromised Security Properties

| Property | Classical Security | Post-Quantum Security |
|----------|-------------------|---------------------|
| Identity Non-Forgery | ✅ Secure | ❌ Broken (Shor's algorithm) |
| AID Collision Resistance | ✅ Secure | ⚠️ Reduced (128-bit via Grover) |
| Signature Unforgeability | ✅ Secure | ❌ Broken (private key recovery) |
| Offline Verification | ✅ Works | ❌ Compromised identities |

### Attack Scenarios

**Scenario 1: Harvest Now, Decrypt Later**
- Adversary records SGAIP proofs today
- When quantum computer available, break private keys from public keys
- Impersonate identities retroactively

**Scenario 2: Real-Time Forgery**
- Adversary observes public key
- Computes private key using quantum computer
- Forges proofs in real-time

**Scenario 3: Identity Theft**
- Adversary derives private key from any published public key or AID
- Takes over existing identities
- No detection possible (stateless protocol has no revocation)

### Migration Urgency

**Risk Timeline**:
- **2026 (Now)**: Low risk, quantum threat theoretical
- **2028**: Medium risk, begin seeing small-scale quantum attacks on crypto
- **2030**: High risk, CRQCs potentially available to well-funded adversaries
- **2035+**: Critical risk, quantum computers widespread

**Recommendation**: Begin migration planning NOW, target SGAIP v2 deployment by **2028**, deprecate v1 by **2030**.

---

## Post-Quantum Cryptography Overview

### NIST PQC Standardization

**NIST Post-Quantum Cryptography Project** (2016-2024):
- Goal: Standardize quantum-resistant public-key cryptography
- Process: Multi-round competition with public cryptanalysis
- **Results** (finalized 2024):
  - **Digital Signatures**: ML-DSA, SLH-DSA, FALCON
  - **Key Encapsulation**: ML-KEM, others

### PQC Signature Schemes

#### 1. ML-DSA (Module-Lattice-Based Digital Signature Algorithm)

**Basis**: CRYSTALS-Dilithium (lattice-based)

**Properties**:
- **Security**: Based on hardness of Module-LWE and Module-SIS problems
- **Quantum Security**: No known quantum algorithms with significant advantage
- **Performance**: Fast signing and verification
- **Key/Signature Sizes**: Moderate (larger than Ed25519 but acceptable)

**Variants**:
- **ML-DSA-44**: ~128-bit quantum security, smaller keys
- **ML-DSA-65**: ~192-bit quantum security, balanced (RECOMMENDED)
- **ML-DSA-87**: ~256-bit quantum security, larger keys

**Sizes** (ML-DSA-65):
- Public key: 1,952 bytes (~61x larger than Ed25519)
- Private key: 4,000 bytes
- Signature: 3,293 bytes (~52x larger than Ed25519)

#### 2. SLH-DSA (Stateless Hash-Based Digital Signature Algorithm)

**Basis**: SPHINCS+ (hash-based)

**Properties**:
- **Security**: Based only on hash function security (very conservative)
- **Quantum Security**: Excellent (hash functions resist quantum attacks well)
- **Performance**: Slower signing, fast verification
- **Key/Signature Sizes**: Larger signatures than ML-DSA

**Variants**:
- **SLH-DSA-128s**: Small signatures (~8KB)
- **SLH-DSA-128f**: Fast signing
- **SLH-DSA-256s**: Higher security, larger signatures

**Sizes** (SLH-DSA-128s):
- Public key: 32 bytes (same as Ed25519!)
- Private key: 64 bytes
- Signature: ~7,856 bytes (~123x larger than Ed25519)

#### 3. FALCON

**Basis**: Fast Fourier lattice-based signatures

**Properties**:
- **Security**: Lattice-based (NTRU lattices)
- **Quantum Security**: Good
- **Performance**: Fast verification, moderate signing
- **Key/Signature Sizes**: Most compact among lattice schemes

**Sizes** (FALCON-512):
- Public key: 897 bytes
- Private key: 1,281 bytes
- Signature: ~666 bytes (~10x larger than Ed25519)

**Challenge**: Complex implementation, floating-point arithmetic (side-channel risks)

---

## Algorithm Evaluation

### Evaluation Criteria for SGAIP v2

1. **Quantum Security**: Resistance to known quantum algorithms
2. **Signature Size**: Must be reasonable for network transmission
3. **Public Key Size**: Affects AID derivation and storage
4. **Performance**: Signing/verification speed for real-time use
5. **Implementation Maturity**: Available libraries, security audits
6. **Side-Channel Resistance**: Protection against timing/cache attacks
7. **Standardization**: NIST approval, industry adoption

### Comparison Matrix

| Algorithm | Pubkey Size | Signature Size | Speed | Maturity | Q-Security | NIST Status |
|-----------|-------------|----------------|-------|----------|------------|-------------|
| **Ed25519** (baseline) | 32 B | 64 B | Excellent | Excellent | ❌ None | N/A |
| **ML-DSA-44** | 1,312 B | 2,420 B | Good | Good | ~128-bit | ✅ Standardized |
| **ML-DSA-65** | 1,952 B | 3,293 B | Good | Good | ~192-bit | ✅ Standardized |
| **ML-DSA-87** | 2,592 B | 4,595 B | Good | Good | ~256-bit | ✅ Standardized |
| **SLH-DSA-128s** | 32 B | 7,856 B | Slow | Good | ~128-bit | ✅ Standardized |
| **FALCON-512** | 897 B | 666 B | Good | Medium | ~128-bit | ✅ Standardized |
| **FALCON-1024** | 1,793 B | 1,280 B | Good | Medium | ~256-bit | ✅ Standardized |

### Trade-off Analysis

**Best Overall**: **ML-DSA-65**
- ✅ Good balance of security (192-bit quantum), performance, and size
- ✅ NIST-standardized, strong cryptanalysis
- ✅ Mature implementations (liboqs, pqclean)
- ⚠️ Larger keys/signatures than classical crypto (acceptable trade-off)

**Most Conservative**: **SLH-DSA-128s**
- ✅ Hash-based (simple security assumption)
- ✅ 32-byte public key (same as Ed25519!)
- ❌ Very large signatures (7.8 KB)
- ❌ Slower signing

**Most Compact**: **FALCON-512**
- ✅ Smallest signature among PQC schemes (666 bytes)
- ⚠️ Complex implementation (floating-point, side-channel risks)
- ⚠️ Less mature than ML-DSA

---

## Recommended Algorithms

### Primary Recommendation: ML-DSA-65

**Rationale**:
1. **Balanced Security**: 192-bit quantum security (adequate for long-term protection)
2. **NIST Standardized**: Finalized in 2024, strong confidence
3. **Good Performance**: Practical for real-time authentication
4. **Implementation Availability**: Multiple audited libraries
5. **Industry Adoption**: Emerging as default PQC signature scheme

**Use Cases**:
- Default algorithm for new SGAIP v2 identities
- General-purpose agent authentication
- Long-term identity commitment

### Secondary Recommendation: SLH-DSA-128s

**Rationale**:
1. **Conservative Security**: Hash-based (simplest security assumption)
2. **Compact Public Keys**: 32 bytes (AID size remains same!)
3. **Backup Option**: If lattice cryptography is broken unexpectedly

**Use Cases**:
- Ultra-conservative deployments
- Long-term archival identities
- Applications tolerant of large signatures

### Hybrid Mode: Ed25519 + ML-DSA-65

**Rationale**:
1. **Defense in Depth**: Secure if either algorithm is broken
2. **Smooth Transition**: Backward compatibility during migration
3. **Performance**: Falls back to fast Ed25519 when quantum threat low

**Implementation**:
- Dual signatures: Sign with both Ed25519 and ML-DSA-65
- Verifiers accept if EITHER signature valid (during transition) or BOTH valid (post-transition)
- Gradual phase-out of Ed25519 by 2030

---

## SGAIP v2 Design

### Algorithm Agility Architecture

**Goal**: Support multiple signature algorithms without breaking protocol.

**AID Derivation v2**:
```
AID_v2 = SHA-256(AlgorithmID || PublicKey || "SGAIP-v2")
```

**Algorithm IDs**:
- `0x00`: Reserved
- `0x01`: Ed25519 (legacy, for v1 compatibility)
- `0x02`: ML-DSA-65 (RECOMMENDED)
- `0x03`: ML-DSA-87
- `0x04`: SLH-DSA-128s
- `0x05`: FALCON-512
- `0x06`: Hybrid (Ed25519 + ML-DSA-65)
- `0x07-0xFF`: Reserved for future algorithms

**AID Format**:
- Version indicator: First byte of AID differentiates v1 (no version byte) from v2
- Alternatively: Prepend version to hash input: `SHA-256(0x02 || AlgorithmID || PublicKey || "SGAIP-v2")`

**Wire Format** (Proof Transmission):
```json
{
  "version": "SGAIP-v2",
  "algorithmId": 2,
  "aid": "b3c5e0a9...",
  "publicKey": "base64-encoded-key",
  "signature": "base64-encoded-signature",
  "challenge": "base64-encoded-challenge"
}
```

### Backward Compatibility

**v1 Identity Support**:
- v2 verifiers MUST accept v1 proofs (Ed25519) until deprecation date
- v1 identifiers distinguishable by AID format or explicit version field
- Warning logs for v1 usage after 2028

**Migration Period**:
- 2026-2028: Both v1 and v2 supported
- 2028-2030: v2 recommended, v1 deprecated but functional
- 2030+: v1 support optional, v2 mandatory

---

## Migration Strategy

### Phase 1: Preparation (2026 Q1-Q4)

**Objectives**:
- Finalize SGAIP v2 specification
- Implement PQC libraries in reference implementations
- Create migration tools

**Deliverables**:
1. [Algorithm Agility Specification](./algorithm-agility.md)
2. Reference implementations with ML-DSA-65 support
3. Key conversion utilities (v1 → v2)
4. Interoperability test suite

**Actions**:
- Research PQC libraries (liboqs, pqcrypto, Bouncy Castle)
- Prototype v2 AID derivation
- Benchmark performance

### Phase 2: Hybrid Mode (2027 Q1-2029 Q4)

**Objectives**:
- Deploy hybrid classical+PQC identities
- Maintain compatibility during transition
- Educate users on quantum risk

**Deliverables**:
1. Hybrid mode support in all implementations
2. Migration guide for users
3. Dual-signature tooling

**Actions**:
- Release SGAIP v0.5.0 with hybrid mode
- Launch migration campaign
- Monitor adoption metrics

### Phase 3: PQC-Only (2030 Q1+)

**Objectives**:
- Complete migration to quantum-resistant cryptography
- Deprecate v1 identities
- Achieve full quantum resistance

**Deliverables**:
1. v1 support removed from default configurations
2. All new identities use ML-DSA-65 or better
3. Security audit of PQC implementation

**Actions**:
- Sunset v1 verifier support
- Archive v1 documentation as historical
- Publish post-migration security analysis

### User Migration Path

**For Existing v1 Users**:

1. **Generate v2 Identity** (2027-2029)
   ```bash
   sgaip keygen --algorithm ml-dsa-65 --output v2_identity.pem
   ```

2. **Link v1 to v2** (optional)
   - Sign a binding statement: `"AID_v1 migrated to AID_v2 on [date]"`
   - Publish on application-layer registry or website

3. **Transition Period** (2028-2030)
   - Accept proofs from both v1 and v2 identities
   - Gradually phase out v1 usage

4. **Complete Migration** (2030+)
   - Exclusively use v2 identity
   - v1 identity marked as deprecated

---

## Implementation Roadmap

### 2026 Q1-Q2: Foundation

- ✅ **This Document**: Post-quantum analysis complete
- 📋 Create [Algorithm Agility Specification](./algorithm-agility.md)
- 📋 Select PQC library (recommend: liboqs)
- 📋 Prototype AID v2 derivation

### 2026 Q3-Q4: Development

- 📋 Implement ML-DSA-65 in Python reference implementation
- 📋 Implement ML-DSA-65 in JavaScript reference implementation
- 📋 Create test vectors for v2 identities
- 📋 Benchmark performance vs v1

### 2027 Q1-Q2: Hybrid Mode

- 📋 Implement hybrid Ed25519+ML-DSA mode
- 📋 CLI support for v2 key generation
- 📋 Update documentation and guides
- 📋 Security audit of PQC implementation

### 2027 Q3-Q4: Deployment

- 📋 Release SGAIP v0.5.0 with PQC support
- 📋 Launch migration campaign
- 📋 Monitor adoption metrics

### 2028-2029: Transition

- 📋 Deprecation warnings for v1 identities
- 📋 Community outreach and support
- 📋 Gradual v1 sunset

### 2030+: PQC-Only

- 📋 Remove v1 support from default build
- 📋 Declare quantum resistance achieved
- 📋 Continuous monitoring of PQC cryptanalysis

---

## References

### Academic Papers

1. **CRYSTALS-Dilithium**: [NIST Submission](https://pq-crystals.org/dilithium/)
2. **SPHINCS+**: [Post-Quantum Hash-Based Signatures](https://sphincs.org/)
3. **FALCON**: [Fast Fourier Lattice-based Compact Signatures](https://falcon-sign.info/)
4. **Shor's Algorithm**: Shor, P. W. (1997). "Polynomial-Time Algorithms for Prime Factorization and Discrete Logarithms on a Quantum Computer"

### Standards

1. **NIST FIPS 204**: Module-Lattice-Based Digital Signature Standard (ML-DSA)
2. **NIST FIPS 205**: Stateless Hash-Based Digital Signature Standard (SLH-DSA)
3. **RFC 8032**: Edwards-Curve Digital Signature Algorithm (EdDSA)

### Libraries

1. **liboqs** (C): https://github.com/open-quantum-safe/liboqs
2. **liboqs-python** (Python): https://github.com/open-quantum-safe/liboqs-python
3. **pqcrypto** (Rust): https://github.com/rustpq/pqcrypto
4. **Bouncy Castle** (Java/C#): PQC support in v1.70+

### Resources

1. **NIST PQC Project**: https://csrc.nist.gov/projects/post-quantum-cryptography
2. **Open Quantum Safe**: https://openquantumsafe.org/
3. **PQC Forum**: https://groups.google.com/a/list.nist.gov/g/pqc-forum

---

## Changelog

- **2026-02-09**: Initial draft with threat analysis and algorithm recommendations

---

**Next Steps**: Proceed with [Algorithm Agility Specification](./algorithm-agility.md) to define technical implementation of SGAIP v2.
