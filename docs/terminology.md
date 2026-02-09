# SGAIP Terminology

This document defines the canonical terminology used by the
**Stateless Global Agent Identity Protocol (SGAIP)**.

All terms defined in this document are **normative** unless explicitly stated otherwise.

---

## 1. Agent

An **Agent** is any entity capable of:

* holding a cryptographic private key, and
* producing verifiable digital signatures.

Agents may be:

* **Human Agents** (individual people),
* **AI Agents** (autonomous software systems),
* **Organizational Agents** (institutions or services),
* **Collective Agents** (multi-entity or human–AI systems).

An agent is defined by **cryptographic control**, not by legal, social, or institutional status.

---

## 2. Agent Identity (AID)

An **Agent Identity (AID)** is a **deterministic cryptographic identifier** derived from an agent’s public key according to the SGAIP specification.

Key properties:

* globally unique (with negligible collision probability),
* stateless (not registered or stored globally),
* timeless (valid indefinitely),
* non-transferable without private key transfer.

An AID is **derived**, not assigned.

---

## 3. Stateless

**Stateless** means that:

* no global registry is required,
* no persistent shared database is assumed,
* no ledger or consensus mechanism is involved.

In SGAIP, identity validity does **not** depend on network availability or stored global state.

---

## 4. Identity Derivation

**Identity Derivation** is the deterministic process by which an Agent Identity is computed from cryptographic material.

Formally:

```
AID = HASH( PublicKey || IdentityDomain )
```

Where:

* `HASH` is a cryptographic hash function,
* `PublicKey` is the agent’s public key,
* `IdentityDomain` is a protocol-defined constant.

Any compliant implementation MUST derive the same AID from the same public key.

---

## 5. Identity Proof

An **Identity Proof** is a cryptographic demonstration that an agent controls the private key corresponding to a given public key and derived AID.

SGAIP identity proofs are typically implemented using:

* challenge–response digital signatures.

Identity proofs do **not** require:

* registries,
* third-party authorities,
* online verification.

---

## 6. Verifier

A **Verifier** is any system, agent, or user that:

* receives an identity proof,
* validates the cryptographic signature,
* independently derives the Agent Identity.

A verifier does not require prior trust in the agent and does not require internet connectivity.

---

## 7. Offline Verification

**Offline Verification** refers to the ability to:

* verify an agent’s identity,
* validate message authenticity,

**without internet access**, relying only on:

* cryptographic primitives,
* local computation.

Offline verification is a core requirement of SGAIP.

---

## 8. Public Key

A **Public Key** is the publicly shareable component of an asymmetric cryptographic key pair used to:

* verify digital signatures,
* derive an Agent Identity.

In SGAIP, the public key is the **root of identity**.

---

## 9. Private Key

A **Private Key** is secret cryptographic material used to:

* generate identity proofs,
* sign messages,
* demonstrate control over an Agent Identity.

Loss or compromise of a private key implies loss of identity control.

---

## 10. Metadata

**Metadata** is optional, non-authoritative information associated with an agent, such as:

* name,
* description,
* role,
* capabilities,
* communication endpoints.

Metadata:

* is NOT identity,
* may change or disappear,
* MUST be cryptographically signed if used.

Identity validity does not depend on metadata availability.

---

## 11. Trust

**Trust** is a contextual, subjective judgment made by a verifier about an agent’s reliability or suitability for a specific purpose.

SGAIP:

* defines identity,
* does NOT define trust.

Trust decisions are local, optional, and outside the core protocol.

---

## 12. Trust Statement

A **Trust Statement** is a signed assertion made by one agent about another agent within a specific context.

Trust statements are:

* optional,
* non-global,
* non-authoritative,
* independently evaluated by verifiers.

---

## 13. Context

A **Context** is the domain or situation in which an identity or trust decision is evaluated
(e.g., research, finance, governance).

Identity is context-independent.
Trust is context-dependent.

---

## 14. Identity Domain

The **Identity Domain** is a fixed, protocol-defined constant used in identity derivation to ensure domain separation and prevent cross-protocol ambiguity.

Identity domains MUST be consistent across all compliant SGAIP implementations.

---

## 15. Protocol

A **Protocol** is a set of rules and procedures that:

* define data formats,
* define verification logic,
* enable interoperability.

SGAIP is a protocol, not:

* a platform,
* a service,
* a product,
* a registry.

---

## 16. Registry (Non-SGAIP Term)

A **Registry** is a centralized or distributed system that stores and assigns identities.

SGAIP explicitly does **not** require or define registries.

Registries may exist externally but are non-normative and ignorable.

---

## 17. Ledger (Non-SGAIP Term)

A **Ledger** is a globally replicated, append-only data structure.

SGAIP does **not** depend on ledgers, blockchains, or consensus mechanisms.

---

## 18. Normative vs Informative

* **Normative** terms define mandatory behavior (MUST, MUST NOT, SHOULD).
* **Informative** terms provide explanation or context.

This terminology document is **normative** unless explicitly stated otherwise.

---

## Canonical Terminology Statement

> **In SGAIP, identity is cryptographically proven, not registered; derived, not assigned; and verified locally, not looked up.**

---

## Status of This Document

This terminology is intended to be:

* stable,
* implementation-neutral,
* suitable for long-term standardization.

Changes to terminology MUST be backward compatible.
