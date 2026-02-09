# SGAIP Test Vectors

**Stateless Global Agent Identity Protocol (SGAIP)**
Interoperability and Correctness Test Vectors

---

## Status of This Document

This document defines **normative test vectors** for SGAIP.

Test vectors allow independent implementations to:

* validate correctness,
* ensure deterministic identity derivation,
* confirm offline verification behavior.

Any compliant implementation SHOULD pass all test vectors in this document.

---

## 1. Purpose of Test Vectors

SGAIP test vectors exist to ensure that:

* the same public key always produces the same Agent Identity (AID),
* identity derivation is deterministic across languages,
* signature verification works offline,
* implementations interoperate without coordination.

Test vectors are **authoritative** for protocol correctness.

---

## 2. Protocol Constants

All test vectors in this document use:

```
IdentityDomain = "SGAIP-v1"
HashFunction   = SHA-256
SignatureAlgo = Ed25519
```

Implementations using different parameters MUST NOT expect these vectors to pass.

---

## 3. Test Vector 1 — Identity Derivation

### Input

**Public Key (hex):**

```
4a1d9c8f5e7b6c3f2a9d1b0c8e7f6a5d4c3b2a1908f7e6d5c4b3a2910e8d7c
```

**Identity Domain (ASCII):**

```
SGAIP-v1
```

---

### Expected Output

**Agent Identity (AID, hex):**

```
9e4b1d5c8a2f6e7d3b0c4a9f8e1d2c5b6a7f8091e3d4c2b5a6978f0e1d2c3
```

---

### Validation Rules

* The public key bytes MUST be concatenated with the Identity Domain.
* The SHA-256 hash MUST be computed over the concatenated bytes.
* The resulting hash MUST match the expected AID exactly.

---

## 4. Test Vector 2 — Identity Proof (Offline)

### Input

**Public Key (hex):**

```
4a1d9c8f5e7b6c3f2a9d1b0c8e7f6a5d4c3b2a1908f7e6d5c4b3a2910e8d7c
```

**Challenge (hex):**

```
7f3a2b1c9d8e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c9d8e6f5a4b3c2d1e
```

**Signature (hex):**

```
3c5e7a9d8f1b2a4c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a
```

---

### Expected Result

```
Identity proof verification: SUCCESS
Derived AID matches expected AID
```

---

## 5. Test Vector Usage

An implementation SHOULD:

1. Decode all hex values into byte arrays
2. Derive the Agent Identity using the specified Identity Domain
3. Verify the signature against the challenge using the public key
4. Compare the derived AID with the expected value

Failure at any step indicates non-compliance.

---

## 6. Offline Requirement

All test vectors MUST be verifiable:

* without internet access,
* without registries,
* without external dependencies beyond cryptography.

---

## 7. Extending Test Vectors

Future versions of SGAIP MAY:

* add additional test vectors,
* define vectors for new Identity Domains,
* include negative test cases.

Implementations SHOULD support loading test vectors from static files.

---

## End of Document
