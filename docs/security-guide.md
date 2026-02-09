# SGAIP Security Guide

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** February 9, 2026

## Overview

This document provides security guidance for implementing and deploying SGAIP (Stateless Global Agent Identity Protocol). It covers operational security, implementation best practices, threat mitigation strategies, and secure key management.

## Table of Contents

1. [Security Model](#security-model)
2. [Key Management](#key-management)
3. [Implementation Security](#implementation-security)
4. [Operational Security](#operational-security)
5. [Threat Mitigation](#threat-mitigation)
6. [Side-Channel Attack Prevention](#side-channel-attack-prevention)
7. [Production Deployment Security](#production-deployment-security)
8. [Incident Response](#incident-response)

---

## Security Model

### Core Security Properties

SGAIP provides the following security guarantees:

1. **Identity Non-Forgery**: Only the holder of the private key can create valid proofs for an Agent Identity (AID)
2. **Global Consistency**: AID derivation is deterministic; all verifiers reach the same conclusion
3. **Collision Resistance**: Computationally infeasible to find two keys with the same AID
4. **Replay Protection**: Fresh challenges prevent signature replay attacks
5. **Offline Verifiability**: No network access required for proof verification

### Security Assumptions

SGAIP's security relies on:

- **Cryptographic Hardness**: Ed25519 signature scheme security (ECDLP hardness)
- **Hash Function Security**: SHA-256 collision resistance and preimage resistance
- **Random Number Generation**: Secure randomness for key generation and challenge generation
- **Implementation Correctness**: No bugs in signature verification or key handling logic

### Known Limitations

**⚠️ QUANTUM VULNERABILITY**: SGAIP v1 uses Ed25519, which is vulnerable to quantum computers running Shor's algorithm. Current estimates suggest large-scale quantum computers capable of breaking Ed25519 may emerge in the 2030-2040 timeframe. See [Post-Quantum Analysis](../specs/post-quantum-analysis.md) for migration planning.

**⚠️ NO REVOCATION**: SGAIP has no built-in key revocation mechanism. If a private key is compromised, the associated AID is permanently compromised. Implement application-level revocation lists if needed.

**⚠️ NO PRIVACY**: AIDs and public keys are inherently public. Do not use SGAIP if unlinkable identities are required. See [Zero-Knowledge Proofs](../specs/zero-knowledge-proofs.md) for privacy-preserving extensions.

---

## Key Management

### Key Generation

**Critical Requirements:**

1. **Use Cryptographically Secure Random Number Generators (CSRNG)**
   - Python: `secrets` module (never `random`)
   - JavaScript: `crypto.getRandomValues()` or Node.js `crypto.randomBytes()`
   - C++/Rust: OS-provided CSPRNG

2. **Entropy Requirements**
   - Ed25519 requires 32 bytes (256 bits) of entropy for private key seed
   - Ensure system entropy pool is adequately seeded before key generation
   - On Linux, check `/proc/sys/kernel/random/entropy_avail` (should be >256)

3. **Key Generation Environment**
   - Generate keys on trusted, air-gapped devices when possible
   - Avoid key generation in virtual machines or cloud instances (hypervisor risk)
   - For high-security applications, use Hardware Security Modules (HSMs)

**Example (Python):**
```python
import secrets
from cryptography.hazmat.primitives.asymmetric import ed25519

# CORRECT: Use secrets module
private_key = ed25519.Ed25519PrivateKey.generate()

# INCORRECT: Never use random module
# import random; seed = random.randbytes(32)  # ❌ INSECURE
```

### Key Storage

**Private Key Protection:**

1. **Encryption at Rest**
   - Always encrypt private keys when stored on disk
   - Use strong passphrases (min 128-bit entropy, ~20 random characters)
   - Recommended: AES-256-GCM with Argon2id key derivation

2. **File System Permissions**
   ```bash
   # Private keys should be accessible only to owner
   chmod 600 private_key.pem
   chown $USER:$USER private_key.pem
   ```

3. **Hardware Security Modules (HSMs)**
   - For production systems, store keys in HSMs (e.g., YubiHSM, AWS CloudHSM, Azure Key Vault)
   - HSMs prevent private key extraction
   - FIPS 140-2 Level 2+ certified devices recommended

4. **Avoid These Locations**
   - ❌ Environment variables (visible in process listings)
   - ❌ Configuration files committed to version control
   - ❌ Application logs
   - ❌ Unencrypted cloud storage
   - ❌ Browser localStorage (for web applications)

**Key Backup and Recovery:**

1. **Backup Strategy**
   - Store encrypted backups in geographically distributed locations
   - Use M-of-N secret sharing (e.g., Shamir's Secret Sharing) for critical keys
   - Document recovery procedures

2. **Key Ceremony**
   - For organizational identities, use multi-party key generation ceremonies
   - Require multiple witnesses
   - Video record the ceremony
   - See [Threshold Identities](../specs/threshold-identities.md)

### Key Lifecycle

**Key Rotation:**

SGAIP v1 does not support key rotation by design (stateless property). For applications requiring rotation:

1. Generate new identity (new key pair, new AID)
2. Publish signed statement binding old AID to new AID
3. Transition period where both AIDs are recognized
4. Deprecate old AID after transition period

See [Key Rotation Specification](../specs/key-rotation.md) for detailed protocol.

**Key Destruction:**

When destroying keys:

1. **Secure Memory Wiping**
   ```python
   # Zero out memory before deallocation
   import ctypes
   key_bytes = bytearray(private_key_bytes)
   ctypes.memset(id(key_bytes), 0, len(key_bytes))
   ```

2. **File Deletion**
   ```bash
   # Overwrite before deletion (not necessary on SSDs with TRIM)
   shred -n 3 -z -u private_key.pem
   ```

3. **Hardware Destruction**
   - For extreme security: physical destruction of storage media
   - Degaussing (HDDs) or physical shredding

---

## Implementation Security

### Secure Coding Practices

**1. Constant-Time Operations**

Avoid timing side channels in cryptographic operations:

```python
# CORRECT: Use constant-time comparison
import secrets

def verify_signature_safe(public_key, message, signature):
    """Verify signature with timing-safe comparison."""
    try:
        public_key.verify(signature, message)
        return True
    except Exception:
        return False

# INCORRECT: Never short-circuit on first difference
# def insecure_compare(a, b):
#     for i in range(len(a)):
#         if a[i] != b[i]:  # ❌ Leaks position of first difference
#             return False
```

**2. Input Validation**

```python
def validate_aid(aid: str) -> bool:
    """Validate AID format before processing."""
    # Must be 64 hex characters
    if len(aid) != 64:
        return False
    # Must be valid hex
    try:
        int(aid, 16)
    except ValueError:
        return False
    return True

def validate_public_key(public_key_bytes: bytes) -> bool:
    """Validate public key before use."""
    # Ed25519 public keys are exactly 32 bytes
    if len(public_key_bytes) != 32:
        return False
    # Additional validation: ensure key is on curve
    try:
        from cryptography.hazmat.primitives.asymmetric import ed25519
        ed25519.Ed25519PublicKey.from_public_bytes(public_key_bytes)
        return True
    except Exception:
        return False
```

**3. Memory Safety**

```javascript
// JavaScript: Zero sensitive buffers after use
function zeroBuffer(buffer) {
  if (buffer instanceof Uint8Array) {
    buffer.fill(0);
  }
}

// Use try-finally to ensure cleanup
function processPrivateKey(keyBuffer) {
  try {
    // ... use key ...
  } finally {
    zeroBuffer(keyBuffer);
  }
}
```

**4. Error Handling**

```python
# CORRECT: Generic error messages
try:
    verify_proof(aid, public_key, signature, challenge)
    return {"status": "success"}
except Exception as e:
    logger.error(f"Verification failed: {e}")  # Log details
    return {"status": "error", "message": "Verification failed"}  # Generic to user

# INCORRECT: Leaking verification details
# except InvalidSignature:
#     return {"error": "Signature invalid"}  # ❌ Leaks which check failed
# except InvalidPublicKey:
#     return {"error": "Public key invalid"}
```

### Dependency Security

**1. Pin Cryptographic Libraries**

```toml
# pyproject.toml
[tool.poetry.dependencies]
cryptography = ">=42.0.0,<43.0.0"  # Pin major version
```

```json
// package.json
{
  "dependencies": {
    "@noble/ed25519": "^2.0.0"
  }
}
```

**2. Regular Security Audits**

- Monitor CVE databases for crypto library vulnerabilities
- Use automated tools: `pip-audit`, `npm audit`, Dependabot
- Update dependencies promptly when security patches released

**3. Supply Chain Security**

- Verify cryptographic library signatures before installation
- Use package lock files (`poetry.lock`, `package-lock.json`)
- Enable GitHub dependency scanning

---

## Operational Security

### Challenge Generation

**Requirements:**

1. **Randomness Quality**
   - Challenges must be cryptographically random
   - Minimum entropy: 128 bits (recommended: 256 bits)
   - Never reuse challenges

2. **Challenge Format**
   ```python
   import secrets
   
   def generate_challenge() -> bytes:
       """Generate cryptographically secure challenge."""
       return secrets.token_bytes(32)  # 256 bits
   ```

3. **Challenge Lifespan**
   - Challenges should expire after short period (e.g., 60 seconds)
   - Track used challenges to prevent replay (in-memory cache with TTL)
   - Clear expired challenges regularly

**Example Challenge Management:**

```python
from datetime import datetime, timedelta
from collections import defaultdict

class ChallengeManager:
    def __init__(self, ttl_seconds=60):
        self.challenges = {}  # challenge -> expiry_time
        self.ttl = timedelta(seconds=ttl_seconds)
    
    def generate(self) -> bytes:
        challenge = secrets.token_bytes(32)
        self.challenges[challenge] = datetime.now() + self.ttl
        return challenge
    
    def verify(self, challenge: bytes) -> bool:
        if challenge not in self.challenges:
            return False
        if datetime.now() > self.challenges[challenge]:
            del self.challenges[challenge]
            return False
        # One-time use: remove after verification
        del self.challenges[challenge]
        return True
    
    def cleanup_expired(self):
        now = datetime.now()
        self.challenges = {
            c: exp for c, exp in self.challenges.items()
            if exp > now
        }
```

### Network Security

**TLS Requirements:**

When transmitting SGAIP proofs over networks:

1. **Always Use TLS 1.3+**
   - Even though signatures provide authenticity, use TLS to prevent traffic analysis
   - Configure strong cipher suites only
   - Enable perfect forward secrecy

2. **Certificate Validation**
   - Validate server certificates (no self-signed certs in production)
   - Pin certificates for high-security applications

3. **Avoid Logging Sensitive Data**
   - Never log private keys or intermediate key material
   - Redact signatures from logs (store only verification result)

---

## Threat Mitigation

### Threat: Private Key Compromise

**Prevention:**
- Store keys in HSMs
- Use encrypted storage with strong passphrases
- Implement strict file permissions
- Regular security audits of key storage systems

**Detection:**
- Monitor for unexpected proof generation from your AID
- Implement application-level usage analytics
- Alert on geographic/behavioral anomalies

**Response:**
- Immediately generate new identity (new AID)
- Publish signed revocation statement binding old AID to compromised status
- Notify all relying parties
- Forensic analysis to determine compromise vector

### Threat: Signature Replay Attacks

**Prevention:**
- Use fresh, random challenges for every proof request
- Implement challenge expiration (short TTL)
- Track used challenges (with bounded memory via TTL)

**Detection:**
- Log all verification attempts with timestamps
- Alert on duplicate signatures
- Monitor for verification failures

### Threat: Man-in-the-Middle (MITM) Attacks

**Prevention:**
- Use TLS 1.3 for all network communications
- Verify that the challenge you receive is the one you sent
- Implement authenticated channels

**Note**: SGAIP signatures themselves prevent MITM from forging identity, but MITM can still:
- Relay proofs to different verifiers (context binding mitigates this)
- Block communications (availability attack)

### Threat: Implementation Bugs

**Prevention:**
- Use well-audited cryptographic libraries
- Comprehensive test coverage (>90%)
- Fuzzing of signature verification logic
- Professional security audits
- Code review by cryptography experts

**Detection:**
- Continuous integration testing
- Runtime monitoring for unexpected exceptions
- Canary deployments

---

## Side-Channel Attack Prevention

### Timing Attacks

**Vulnerability**: Variable-time operations leak information through timing.

**Mitigation:**

```python
# Use constant-time comparison for all cryptographic operations
import hmac

def constant_time_compare(a: bytes, b: bytes) -> bool:
    """Compare two byte strings in constant time."""
    return hmac.compare_digest(a, b)
```

- Modern Ed25519 libraries (libsodium, cryptography.io) implement constant-time operations
- Avoid custom cryptographic code
- Disable CPU frequency scaling during crypto operations (if feasible)

### Cache-Timing Attacks

**Vulnerability**: Cache access patterns leak key material.

**Mitigation:**
- Use cache-resistant cryptographic implementations
- Ed25519 is generally resistant due to lack of secret-dependent table lookups
- On critical systems, disable hyperthreading to prevent cross-core cache attacks

### Power Analysis Attacks

**Vulnerability**: Power consumption during crypto operations leaks key bits.

**Mitigation:**
- Use HSMs with power analysis protections
- For embedded devices, use masked implementations
- Physical security: prevent attacker proximity to devices

### Fault Injection Attacks

**Vulnerability**: Induced faults (voltage glitches, clock manipulation) cause exploitable errors.

**Mitigation:**
- Redundant signature verification
- Sanity checks on intermediate values
- HSMs with fault detection
- Physical tamper-evident enclosures

---

## Production Deployment Security

### Infrastructure Security

1. **Principle of Least Privilege**
   - Run SGAIP verification services with minimal permissions
   - Dedicated service accounts
   - Network segmentation

2. **Logging and Monitoring**
   ```python
   import logging
   
   logger = logging.getLogger('sgaip')
   
   def verify_proof_with_logging(aid, public_key, signature, challenge):
       try:
           result = verify_proof(aid, public_key, signature, challenge)
           logger.info(f"Verification success for AID: {aid[:16]}...")
           return True
       except Exception as e:
           logger.warning(f"Verification failed for AID: {aid[:16]}... - {type(e).__name__}")
           return False
   ```

3. **Rate Limiting**
   - Prevent DoS via excessive verification requests
   - Implement per-IP rate limits
   - CAPTCHA for public-facing endpoints

4. **Intrusion Detection**
   - Alert on unusual verification patterns
   - Monitor for brute-force attempts (invalid signatures)
   - Track failed authentication attempts

### High Availability

1. **Stateless Design**
   - SGAIP verification is stateless (no shared state required)
   - Easy horizontal scaling
   - Deploy behind load balancer

2. **Geographic Distribution**
   - Deploy verification services in multiple regions
   - Reduce latency for global users
   - Resilience against regional outages

### Compliance Considerations

**GDPR**: AIDs and public keys are inherently public. If linking AIDs to natural persons, implement:
- Data minimization
- Right to erasure (revocation lists)
- Access controls on metadata

**SOC 2**: Implement controls for:
- Access logging
- Change management
- Incident response procedures
- Key management documentation

---

## Incident Response

### Incident Classification

**Severity Levels:**

1. **Critical**: Private key compromise, implementation vulnerability allowing forgery
2. **High**: Side-channel attack, DoS affecting availability
3. **Medium**: Operational errors, configuration issues
4. **Low**: Minor implementation bugs without security impact

### Response Procedures

**For Key Compromise:**

1. **Immediate Actions** (0-1 hour)
   - Disable compromised identity in application-level access control
   - Generate new key pair and AID
   - Notify security team

2. **Short-term** (1-24 hours)
   - Publish signed revocation statement
   - Notify all relying parties
   - Assess scope of compromise

3. **Long-term** (24+ hours)
   - Forensic investigation
   - Root cause analysis
   - Update security procedures
   - Public disclosure (if required by regulations)

**For Implementation Vulnerability:**

1. Immediate patch deployment
2. Audit logs for exploitation attempts
3. Notify users if exploitation detected
4. Post-mortem and security advisory publication

---

## Conclusion

Security is a continuous process. This guide provides baseline security practices for SGAIP implementations. Regularly review and update security measures as threats evolve and cryptographic best practices advance.

**Key Takeaways:**

✅ Use HSMs for high-value keys  
✅ Implement constant-time operations  
✅ Generate fresh challenges for every proof  
✅ Monitor for anomalous verification patterns  
✅ Plan for post-quantum migration (see [Post-Quantum Analysis](../specs/post-quantum-analysis.md))  
✅ Conduct regular security audits  

**⚠️ Remember**: SGAIP v1 is vulnerable to quantum computers. Plan migration to quantum-resistant cryptography before large-scale quantum computers emerge (estimated 2030-2040).

---

**Document Maintainers**: SGAIP Security Working Group  
**Review Frequency**: Quarterly  
**Next Review**: May 2026
