# SGAIP Core Specification

**Stateless Global Agent Identity Protocol (SGAIP)**
Core Protocol Specification

---

## Status of This Document

This document defines the **core, normative behavior** of the Stateless Global Agent Identity Protocol (SGAIP).

This specification:

* is protocol-level, not application-level,
* is implementation-neutral,
* does not define trust, governance, or policy,
* is intended for long-term standardization.

The key words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are to be interpreted as described in RFC 2119.

---

## 1. Scope

This document specifies:

* what constitutes an Agent under SGAIP,
* how Agent Identity is derived,
* how identity is proven,
* what guarantees SGAIP provides and does not provide.

This document does **not** specify:

* reputation systems,
* authorization models,
* economic incentives,
* governance mechanisms.

---

## 2. Design Objectives

SGAIP is designed to satisfy the following objectives:

1. **Statelessness** – No global registry, ledger, or shared state
2. **Determinism** – Same identity derivation everywhere
3. **Offline Verifiability** – Identity proofs must work without internet access
4. **Permissionlessness** – No authority issues or approves identities
5. **AI-Native Support** – Autonomous agents are first-class participants

---

## 3. Agent Model

### 3.1 Definition of Agent

An **Agent** is any entity capable of:

* generating or holding a cryptographic private key, and
* producing verifiable digital signatures.

An agent MAY represent:

* a human,
* an AI system,
* an organization,
* a collective of entities.

SGAIP does not impose semantic meaning beyond cryptographic control.

---

## 4. Cryptographic Foundations

SGAIP relies on standard cryptographic primitives:

* Asymmetric key pairs
* Secure hash functions
* Digital signature schemes

SGAIP introduces **no new cryptography**.

All cryptographic algorithms used MUST be publicly documented and widely reviewed.

---

## 5. Agent Identity Derivation

### 5.1 Identity Definition

An **Agent Identity (AID)** is defined as a deterministic function of an agent’s public key.

Formally:

```
AID = HASH( PublicKey || IdentityDomain )
```

Where:

* `PublicKey` is the agent’s public key
* `IdentityDomain` is a protocol-defined constant
* `HASH` is a cryptographic hash function

---

### 5.2 Identity Domain

The **IdentityDomain** is a fixed byte sequence used to ensure domain separation.

For SGAIP version 1:

```
IdentityDomain = "SGAIP-v1"
```

All compliant implementations MUST use the same IdentityDomain value.

---

### 5.3 Identity Properties

An Agent Identity MUST satisfy the following properties:

* **Deterministic** – identical inputs produce identical identities
* **Globally Unique** – collision probability is negligible
* **Stateless** – no registration or lookup required
* **Timeless** – identity validity does not expire
* **Non-Transferable** – control requires private key possession

---

## 6. Identity Proof Protocol

### 6.1 Proof Model

SGAIP identity proofs are based on a **challenge–response** model.

An agent proves identity by demonstrating control of the private key corresponding to the public key used to derive the AID.

---

### 6.2 Proof Steps

1. The verifier generates a random challenge value
2. The agent signs the challenge using its private key
3. The verifier verifies the signature using the public key
4. The verifier independently derives the Agent Identity

If verification succeeds, identity is proven.

---

### 6.3 Verification Requirements

A verifier MUST:

* validate the cryptographic signature,
* independently derive the Agent Identity,
* reject proofs that fail verification.

A verifier MUST NOT:

* rely on registries,
* rely on third-party authorities,
* assume trust from identity alone.

---

## 7. Offline Verification

SGAIP identity proofs MUST be verifiable without:

* internet connectivity,
* network synchronization,
* external services.

Verification MUST depend only on:

* local computation,
* cryptographic primitives,
* provided proof material.

---

## 8. Metadata Handling

SGAIP explicitly separates **identity** from **metadata**.

Metadata:

* MAY be provided by an agent,
* MUST be cryptographically signed if used,
* MUST NOT be required for identity verification.

Loss or absence of metadata MUST NOT invalidate identity.

---

## 9. Trust and Authorization (Out of Scope)

SGAIP does not define:

* trust models,
* authorization rules,
* reputation systems.

Identity verification does not imply trust, permission, or approval.

---

## 10. Security Considerations

SGAIP provides:

* identity non-forgery,
* global consistency,
* censorship resistance via statelessness.

SGAIP does not protect against:

* malicious but valid agents,
* social engineering,
* misuse of trust.

---

## 11. Interoperability

Any implementation that:

* follows this specification,
* uses the defined IdentityDomain,
* applies deterministic identity derivation,

MUST interoperate with all other compliant implementations.

---

## 12. Versioning

This document defines **SGAIP v1**.

Future versions MUST:

* preserve backward compatibility where possible,
* define new IdentityDomain values,
* clearly document breaking changes.

---

## 13. Canonical Protocol Statement

> **SGAIP defines identity as a cryptographic proof of control, derivable and verifiable by any system without reliance on global state.**

---

## 14. Conformance

An implementation is SGAIP-compliant if it:

* derives Agent Identity exactly as specified,
* performs identity proof verification correctly,
* does not introduce mandatory registries or ledgers.

---

## End of Document
