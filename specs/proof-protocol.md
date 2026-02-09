# SGAIP Identity Proof Protocol

**Stateless Global Agent Identity Protocol (SGAIP)**
Identity Proof (Challenge–Response) Specification

---

## Status of This Document

This document defines the **normative identity proof protocol** for SGAIP.

This specification:

* defines how an agent proves control of an Agent Identity (AID),
* enables offline verification,
* does not require registries, ledgers, or online services.

The key words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are to be interpreted as described in RFC 2119.

---

## 1. Scope

This document specifies:

* the challenge–response proof mechanism,
* message formats and verification rules,
* replay protection requirements,
* offline verification behavior.

This document does **not** specify:

* trust or authorization decisions,
* reputation systems,
* metadata schemas.

---

## 2. Terminology

The terms **Agent**, **Agent Identity (AID)**, **Verifier**, **Public Key**, and **Private Key** are defined in `docs/terminology.md` and are used here with the same meaning.

---

## 3. Proof Model Overview

SGAIP identity proofs are based on a **challenge–response** model.

An agent proves its identity by demonstrating cryptographic control of the private key corresponding to the public key used to derive its AID.

No third party, registry, or network service participates in this proof.

---

## 4. Cryptographic Requirements

### 4.1 Signature Scheme

The signature scheme used MUST:

* support digital signatures with public verification,
* provide unforgeability under chosen-message attack (EUF-CMA).

The specific algorithm is implementation-defined but MUST be publicly documented.

---

### 4.2 Randomness

Verifiers MUST generate challenges using a cryptographically secure source of randomness.

Challenges MUST be unpredictable and unique per verification session.

---

## 5. Challenge–Response Protocol

### 5.1 Protocol Steps

1. **Challenge Generation**
   The verifier generates a random challenge value `C`.

2. **Challenge Transmission**
   The verifier transmits `C` to the agent.

3. **Response Generation**
   The agent computes a digital signature `S = Sign(PrivateKey, C)`.

4. **Response Transmission**
   The agent transmits `S` and its public key to the verifier.

5. **Verification**
   The verifier:

   * verifies `S` using the provided public key,
   * derives the Agent Identity (AID) from the public key,
   * accepts the proof if verification succeeds.

---

### 5.2 Proof Acceptance Conditions

A verifier MUST accept an identity proof only if:

* the signature verification succeeds,
* the derived AID matches the expected or claimed AID,
* the challenge value is fresh and unused.

Failure of any condition MUST result in rejection.

---

## 6. Replay Protection

To prevent replay attacks:

* each challenge MUST be unique,
* verifiers MUST NOT accept reused challenges,
* challenges SHOULD be bound to a single verification session.

Offline systems MAY rely on locally generated nonces or counters.

---

## 7. Offline Verification

SGAIP identity proofs MUST be verifiable without:

* internet connectivity,
* access to external services,
* synchronized clocks.

Verification MUST rely solely on:

* cryptographic verification,
* local computation,
* provided proof material.

---

## 8. Message Binding

Implementations MAY bind additional message data to the challenge before signing.

If message binding is used:

* the exact data bound MUST be clearly defined,
* the verifier MUST verify the same bound data.

This allows identity proof and message authenticity to be combined.

---

## 9. Error Handling

Verifiers MUST explicitly reject identity proofs if:

* the signature is invalid,
* the public key is malformed,
* the derived AID does not match expectations,
* the challenge is reused or invalid.

Silent acceptance or undefined behavior is prohibited.

---

## 10. Security Considerations

Correct implementation of this protocol provides:

* identity non-forgery,
* protection against replay attacks,
* offline verifiability.

This protocol does not protect against:

* compromised private keys,
* malicious but valid agents,
* misuse of trust by verifiers.

---

## 11. Interoperability

All compliant implementations:

* MUST implement the challenge–response flow as specified,
* MUST support deterministic identity derivation,
* MUST NOT introduce mandatory online dependencies.

---

## 12. Conformance

An implementation conforms to this specification if it:

* generates fresh challenges,
* verifies signatures correctly,
* derives AIDs according to `specs/identity-derivation.md`,
* enforces replay protection.

---

## End of Document
