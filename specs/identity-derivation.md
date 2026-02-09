# SGAIP Identity Derivation Specification

**Stateless Global Agent Identity Protocol (SGAIP)**
Identity Derivation Specification

---

## Status of This Document

This document defines the **normative rules** for deriving an Agent Identity (AID) under SGAIP.

This specification:

* is mandatory for all SGAIP-compliant implementations,
* defines deterministic identity derivation,
* ensures global interoperability and offline verification.

The key words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are to be interpreted as described in RFC 2119.

---

## 1. Scope

This document specifies:

* accepted cryptographic inputs for identity derivation,
* the identity derivation function,
* domain separation requirements,
* encoding and normalization rules,
* error handling requirements.

This document does **not** specify:

* key generation policies,
* trust or authorization models,
* metadata formats.

---

## 2. Terminology

The terms **Agent**, **Agent Identity (AID)**, **Public Key**, and **Identity Domain** are defined in `docs/terminology.md` and are used here with the same meaning.

---

## 3. Cryptographic Inputs

### 3.1 Public Key

The primary input to identity derivation is the agent’s **public key**.

Requirements:

* The public key MUST be generated using a secure asymmetric cryptographic algorithm.
* The public key MUST be represented in a deterministic byte encoding.
* The same public key bytes MUST always produce the same AID.

The choice of cryptographic algorithm is implementation-defined, but it MUST be publicly documented.

---

### 3.2 Public Key Encoding

Public keys MUST be encoded as a canonical byte sequence prior to identity derivation.

Implementations:

* MUST specify the exact encoding used,
* MUST reject ambiguous or non-canonical encodings,
* MUST treat differing encodings as distinct inputs.

---

## 4. Identity Domain

### 4.1 Purpose of Domain Separation

The **Identity Domain** provides domain separation to prevent identity collisions across protocols or versions.

Domain separation ensures that:

* the same public key used in another protocol does not produce the same identity,
* future versions of SGAIP can coexist safely.

---

### 4.2 Identity Domain Value

For SGAIP version 1, the Identity Domain MUST be the following ASCII byte sequence:

```
"SGAIP-v1"
```

All SGAIP v1 implementations MUST use this exact value.

---

## 5. Identity Derivation Function

### 5.1 Derivation Formula

An Agent Identity (AID) MUST be derived as follows:

```
AID = HASH( PublicKeyBytes || IdentityDomain )
```

Where:

* `PublicKeyBytes` is the canonical byte encoding of the public key,
* `IdentityDomain` is the protocol-defined constant,
* `HASH` is a cryptographic hash function.

---

### 5.2 Hash Function Requirements

The hash function used:

* MUST be cryptographically secure,
* MUST be collision resistant,
* MUST be preimage resistant.

Implementations SHOULD use SHA-256 or an equivalent widely accepted hash function.

---

## 6. Output Representation

### 6.1 AID Representation

The derived AID:

* MUST be represented as a fixed-length value,
* MAY be encoded in hexadecimal or other canonical textual forms,
* MUST preserve full entropy of the hash output.

The representation format MUST be documented by the implementation.

---

### 6.2 Determinism Guarantee

Given identical inputs:

* identical public key bytes,
* identical Identity Domain,
* identical hash function,

all compliant implementations MUST produce identical AIDs.

---

## 7. Error Handling

Implementations MUST fail identity derivation if:

* the public key encoding is invalid,
* the Identity Domain is missing or incorrect,
* the hash function is unavailable or misconfigured.

Failures MUST be explicit and MUST NOT silently produce undefined identities.

---

## 8. Security Properties

Correct implementation of this specification guarantees:

* global uniqueness (with negligible collision probability),
* stateless identity derivation,
* offline verifiability,
* resistance to registry-based capture.

This specification does not provide:

* trust guarantees,
* authorization semantics,
* key recovery mechanisms.

---

## 9. Backward and Forward Compatibility

Future versions of SGAIP:

* MUST define new Identity Domain values,
* MUST NOT reuse Identity Domain values across incompatible versions.

Implementations MAY support multiple Identity Domains for interoperability.

---

## 10. Conformance

An implementation conforms to this specification if it:

* derives AIDs exactly as specified,
* uses the correct Identity Domain,
* enforces canonical encoding rules,
* produces deterministic results.

---

## End of Document
