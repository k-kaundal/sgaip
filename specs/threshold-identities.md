# SGAIP Threshold Signatures Specification

**Version:** 1.0  
**Status:** Experimental  
**Last Updated:** February 9, 2026

## Abstract

This specification extends SGAIP with threshold signature support, enabling M-of-N multi-party control over identities. Threshold identities allow distributed key management, organizational identities, and fault-tolerant agent systems without single points of failure.

## Motivation

**SGAIP Core Limitation**: Single-key identities
- One private key = single point of failure/compromise
- No organizational/shared identities
- No decentralized control

**Use Cases**:
1. **Organizational Identities**: Company or DAO controlled by multiple stakeholders
2. **High-Security Agents**: Critical agent requires 3-of-5 approval for actions
3. **Social Recovery**: Recover identity with help from M trusted friends
4. **Fault Tolerance**: Agent continues operating if some key shards lost
5. **Multi-Party Agents**: AI agent collective with shared identity

**Solution**: Threshold signatures where M-of-N parties hold key shares, and any M can collaborately generate valid proofs.

---

## Threshold Cryptography Primer

### Concepts

**Threshold Signature Scheme (TSS)**:
- **N**: Total number of participants
- **M** (threshold): Minimum participants needed to sign
- **Key Shares**: Each participant holds a secret share `s_i`
- **No Reconstruction**: Signing does not reveal individual shares or reconstruct full private key

**Properties**:
- **M-of-N Threshold**: Any M participants can sign, fewer than M cannot
- **Share Independence**: Compromise of M-1 shares reveals nothing about key
- **Standard Verification**: Threshold signatures verify identically to standard signatures
- **No Trusted Dealer** (ideal): Distributed Key Generation (DKG) without central party

### Threshold Schemes

| Scheme | Algorithm | Threshold | DKG | PQ-Resistant | Maturity |
|--------|-----------|-----------|-----|--------------|----------|
| **FROST** | Ed25519, Ristretto | M-of-N | ✅ Yes | ❌ No | Medium |
| **Schnorr TSS** | Schnorr, secp256k1 | M-of-N | ✅ Yes | ❌ No | High |
| **BLS TSS** | BLS12-381 | M-of-N | ✅ Yes | ❌ No | High |
| **Lattice TSS** | ML-DSA (research) | M-of-N | ⚠️ Complex | ✅ Yes | Low |

**Recommended**: **FROST (Flexible Round-Optimized Schnorr Threshold)** for Ed25519 compatibility with SGAIP v1.

---

## FROST Overview

### FROST Protocol

**FROST (RFC 9591)**: Two-round threshold Schnorr signatures compatible with Ed25519.

**Key Generation (DKG)**:
1. Each participant generates polynomial coefficients
2. Broadcast commitments to coefficients
3. Send secret shares to other participants
4. Each participant verifies shares and commits to public key share
5. Aggregate to derive group public key

**Signing (2 rounds)**:
1. **Round 1 (Commitment)**: Each signer generates nonce commitment
2. **Round 2 (Response)**: Coordinator aggregates commitments, each signer produces signature share
3. **Aggregation**: Coordinator combines M shares into final signature

**Result**: Standard Ed25519 signature (64 bytes), verifiable with standard SGAIP v1 protocol.

---

## Threshold Identity Derivation

### T-AID (Threshold Agent Identity)

**Formula** (identical to standard SGAIP):
```
T-AID = SHA-256(GroupPublicKey || "SGAIP-v1")
```

**Properties**:
- Group public key derived from all N participants' key shares during DKG
- T-AID looks identical to standard AID (no external distinction)
- Verifiers use standard SGAIP verification (backward compatible)

**Advantages**:
- ✅ No protocol changes for verifiers
- ✅ Threshold identities drop-in replacement for standard identities
- ✅ Privacy: External observers cannot distinguish threshold from standard identities

**Metadata Extension** (optional):
```json
{
  "aid": "a3f8c2e9...",
  "type": "threshold",
  "parameters": {
    "threshold": 3,
    "total": 5,
    "scheme": "FROST-Ed25519"
  },
  "participants": [
    {"id": 1, "publicKeyShare": "..."},
    {"id": 2, "publicKeyShare": "..."},
    {"id": 3, "publicKeyShare": "..."},
    {"id": 4, "publicKeyShare": "..."},
    {"id": 5, "publicKeyShare": "..."}
  ]
}
```

---

## Protocol Specification

### Phase 1: Distributed Key Generation (DKG)

**Participants**: N parties (e.g., 5 stakeholders)  
**Threshold**: M-of-N (e.g., 3-of-5)

#### Step 1.1: Participant Setup

Each participant `i` (i = 1..N):
1. Selects random polynomial of degree M-1:
   ```
   f_i(x) = a_i0 + a_i1*x + a_i2*x^2 + ... + a_i(M-1)*x^(M-1)
   ```
   where `a_i0, a_i1, ..., a_i(M-1)` are random scalars.

2. Computes public commitments:
   ```
   C_i = [a_i0*G, a_i1*G, ..., a_i(M-1)*G]
   ```
   where G is the Ed25519 base point.

3. **Broadcasts**: `C_i` (public, no secrets revealed)

#### Step 1.2: Secret Share Distribution

Each participant `i`:
1. Computes secret share for participant `j`:
   ```
   s_ij = f_i(j)  // Evaluate polynomial at j
   ```

2. **Sends privately** to participant `j`: `s_ij`

#### Step 1.3: Share Verification

Each participant `j` receives shares `s_1j, s_2j, ..., s_Nj` from all participants.

Participant `j` verifies each share `s_ij` against commitment `C_i`:
```
s_ij * G == C_i[0] + j*C_i[1] + j^2*C_i[2] + ... + j^(M-1)*C_i[M-1]
```

If verification fails, participant `j` publicly complains about participant `i`.

#### Step 1.4: Key Share Computation

Each participant `j` computes their **long-term secret key share**:
```
s_j = sum(s_1j, s_2j, ..., s_Nj) mod q
```

#### Step 1.5: Group Public Key

All participants compute **group public key** (identical result for all):
```
PK_group = sum(C_1[0], C_2[0], ..., C_N[0])
```

**Derive T-AID**:
```python
import hashlib

def derive_threshold_aid(group_public_key: bytes) -> str:
    """Derive threshold AID from group public key."""
    data = group_public_key + b"SGAIP-v1"
    aid_bytes = hashlib.sha256(data).digest()
    return aid_bytes.hex()
```

---

### Phase 2: Threshold Signing

**Goal**: M participants collaboratively sign challenge without reconstructing private key.

**Inputs**:
- Challenge from verifier: `challenge`
- Participant set: M participants from N total (e.g., participants {1, 3, 5} of 5 total)

#### Round 1: Nonce Commitment

Each signing participant `i`:

1. Generates **nonce commitments**:
   ```python
   d_i = random_scalar()
   e_i = random_scalar()
   
   D_i = d_i * G  # Hiding nonce commitment
   E_i = e_i * G  # Binding nonce commitment
   ```

2. **Broadcasts**:  `(D_i, E_i)` to coordinator and other signers

#### Round 2: Signature Share Generation

**Coordinator** (one of the M signers):

1. Collects all commitments: `{(D_1, E_1), (D_3, E_3), (D_5, E_5)}`

2. Computes **binding factor** for each signer:
   ```python
   rho_i = H("rho", i, challenge, {D_1, D_3, D_5}, {E_1, E_3, E_5})
   ```

3. Computes **group commitment**:
   ```python
   R = sum(D_i + rho_i * E_i for i in signers)
   ```

4. Computes **challenge hash**:
   ```python
   c = H("challenge", R, PK_group, challenge)
   ```

5. **Sends to each signer**: `(R, c, {rho_i})`

**Each signing participant** `i`:

1. Computes **Lagrange coefficient**:
   ```python
   lambda_i = lagrange_coefficient(i, [1, 3, 5])  # For active signers
   ```

2. Computes **signature share**:
   ```python
   z_i = d_i + (e_i * rho_i) + (lambda_i * s_i * c)
   ```

3. **Sends to coordinator**: `z_i`

#### Signature Aggregation

**Coordinator**:

1. Aggregates signature shares:
   ```python
   z = sum(z_1, z_3, z_5) mod q
   ```

2. Forms **final signature** (standard Ed25519 format):
   ```
   signature = (R, z)  # 64 bytes total
   ```

3. **Creates SGAIP proof**:
   ```json
   {
     "version": "SGAIP-v1",
     "aid": "a3f8c2e9...",
     "publicKey": "<group_public_key>",
     "signature": "<threshold_signature>",
     "challenge": "<challenge>"
   }
   ```

---

### Phase 3: Verification (Standard SGAIP)

**Verifier** (no knowledge of threshold):

1. Receives proof with signature and group public key
2. Verifies using **standard Ed25519 verification**:
   ```python
   from cryptography.hazmat.primitives.asymmetric import ed25519
   
   public_key = ed25519.Ed25519PublicKey.from_public_bytes(proof['publicKey'])
   try:
       public_key.verify(proof['signature'], proof['challenge'])
       aid_computed = derive_aid(proof['publicKey'])
       assert aid_computed == proof['aid']
       print("Proof valid!")
   except:
       print("Proof invalid!")
   ```

**Result**: Threshold signature is indistinguishable from standard signature. Verifier doesn't know (or care) that M parties collaborated.

---

## Key Management

### Participant Responsibilities

Each participant stores:
- **Secret key share** `s_i` (32 bytes)
- **Participant identifier** `i`
- **Group public key** `PK_group`
- **Threshold parameters** `(M, N)`
- **List of all participants** (for coordination)

**Security Requirements**:
- Encrypt key shares at rest
- Never transmit key shares after DKG
- Use secure channels for Round 1/2 communication

### Key Share Backup and Recovery

**Challenge**: If > (N - M) participants lose key shares, threshold identity is unrecoverable.

**Solutions**:

1. **Redundant Participants**: Use higher N than needed (e.g., 3-of-7 instead of 3-of-5)

2. **Share Refresh Protocol** (FROST supports):
   - Periodically redistribute shares without changing group public key
   - Protects against gradual share compromise
   - Requires M participants online

3. **Hierarchical Backup**:
   - Each participant's share backed up with its own M'-of-N' threshold
   - Example: Participant 1's share protected by 2-of-3 backup guardians

### Adding/Removing Participants (Re-Keying)

**Limitation**: FROST does not support dynamic threshold modification without re-keying.

**Process** (requires generating new T-AID):
1. Run new DKG with updated participant set
2. Derive new T-AID from new group public key
3. Publish signed binding statement: `"Old T-AID migrated to new T-AID"`
4. Transition period where both T-AIDs accepted

---

## Implementation Guide

### Reference Libraries

**FROST Implementations**:

| Library | Language | Status | Audit |
|---------|----------|--------|-------|
| [ZF FROST](https://github.com/ZcashFoundation/frost) | Rust | Production | ✅ NCC Group |
| [frost-dalek](https://github.com/chelseakomlo/frost-dalek) | Rust | Research | ❌ No |
| [tss-lib](https://github.com/binance-chain/tss-lib) | Go | Production | ⚠️ Partial |

**Recommended**: ZF FROST (Zcash Foundation) - audited, well-documented, active maintenance.

### Python Integration

```python
# Using ZF FROST via PyO3 Rust bindings (hypothetical)
from sgaip_frost import FrostParticipant, FrostCoordinator

# === DKG Phase ===
# Each participant runs:
participant = FrostParticipant(participant_id=1, threshold=3, total=5)
commitments, secret_package = participant.dkg_round1()

# Broadcast commitments to all participants
# ... (communication layer) ...

# Each participant receives all commitments:
participant.dkg_round2(all_commitments)

# Each participant sends secret shares to others:
shares_to_send = participant.generate_shares_for_participants([2, 3, 4, 5])
# ... (send privately) ...

# Each participant receives shares:
participant.receive_shares(received_shares)

# Verify and compute key share:
key_share, group_public_key = participant.dkg_finalize()

# Derive T-AID:
t_aid = derive_aid(group_public_key)

# === Signing Phase ===
# Participants {1, 3, 5} sign challenge:

# Round 1: Each signer generates commitment
nonce_commitment, nonce_secret = participant.sign_round1(challenge)
# Broadcast to coordinator...

# Coordinator aggregates:
coordinator = FrostCoordinator(threshold=3, commitments=[c1, c3, c5])
signing_package = coordinator.prepare_signing(challenge)
# Send to each signer...

# Round 2: Each signer generates signature share
sig_share = participant.sign_round2(signing_package, nonce_secret, key_share)
# Send to coordinator...

# Coordinator aggregates to final signature:
final_signature = coordinator.aggregate([sig_share1, sig_share3, sig_share5])

# Create SGAIP proof:
proof = {
    "version": "SGAIP-v1",
    "aid": t_aid,
    "publicKey": base64.b64encode(group_public_key),
    "signature": base64.b64encode(final_signature),
    "challenge": base64.b64encode(challenge)
}
```

### Coordinator Role

**Options**:

1. **Rotating Coordinator**: Each signing round, different participant acts as coordinator
2. **Dedicated Coordinator**: One participant always coordinates (simpler but single point of communication failure)
3. **Decentralized**: Use byzantine agreement protocol to agree on commitments (complex)

**Recommendation**: Rotating coordinator with automatic failover.

### Communication Layer

**Requirements**:
- **Authenticated channels**: Ensure messages from participant `i` are actually from `i`
- **Reliable broadcast**: All participants receive same view of commitments
- **Private channels**: Secret shares sent only to intended recipient

**Implementation Options**:

1. **Libp2p**: Peer-to-peer networking with built-in security
2. **Matrix Protocol**: Decentralized chat with E2E encryption
3. **Custom gRPC**: Authenticated RPC with TLS
4. **Blockchain**: Use blockchain for commitment broadcast (expensive but maximally decentralized)

---

## Use Case Examples

### Example 1: Corporate Identity (3-of-5)

**Scenario**: Acme Corp AI agent requires approval from 3 of 5 board members to act.

**Setup**:
1. 5 board members run DKG → T-AID derived
2. Register T-AID as "Acme Corp Official Agent"
3. Each board member stores key share in personal HSM

**Operation**:
1. Agent needs to authenticate (e.g., sign contract)
2. Agent requests signature from board members
3. 3 board members participate in threshold signing
4. Agent uses resulting signature to prove identity

**Benefits**:
- No single board member can impersonate agent alone
- Agent continues operating if 2 board members unavailable
- Auditable: Logs show which 3 members participated in each signature

### Example 2: Social Recovery (2-of-3)

**Scenario**: Alice's personal AI agent, but Alice wants social recovery via 2 friends.

**Setup**:
1. Alice, Bob, and Carol run 2-of-3 DKG
2. T-AID becomes Alice's agent identity
3. Alice uses T-AID in daily operations (signs with any 2 of 3)

**Normal Operation**:
- Alice + Bob sign (Carol not involved)
- Alice + Carol sign (Bob not involved)

**Recovery Scenario** (Alice loses key share):
- Bob + Carol collaborate to sign
- Generate new 2-of-3 identity (new DKG)
- Publish migration statement

**Benefits**:
- Alice not single point of failure
- Friends can help recover identity
- Maintains privacy (friends don't learn Alice's full key)

### Example 3: Multi-Agent Collective (4-of-7)

**Scenario**: 7 AI agents form collective identity, any 4 can act on behalf of collective.

**Setup**:
1. 7 agents run DKG → collective T-AID
2. Each agent stores key share in secure enclave

**Operation**:
- Decisionmaker queries 4+ agents
- 4 agents participate in threshold signing
- Collective identity used for authentication

**Benefits**:
- Collective survives failure of 3 agents
- No single agent can forge collective signature
- Decentralized decision-making

---

## Security Considerations

### Adversarial Threshold

**Security Guarantee**: Adversary compromising **< M** key shares learns NOTHING about group private key.

**Failure Mode**: Adversary compromising **≥ M** key shares can forge signatures.

**Recommendation**: Set M high enough that compromising M parties is highly difficult (e.g., 5-of-7 for critical systems).

### Denial of Service

**Threat**: Malicious participant refuses to participate in signing → identity unusable.

**Mitigation**:
1. Set threshold M well below N (e.g., 3-of-7) → tolerates N-M unavailable participants
2. Implement timeouts and fallback participant selection
3. Social accountability: Identify non-responsive participants

### Malicious Participant in DKG

**Threat**: Participant provides invalid shares or commitments during DKG.

**Mitigation**:
1. **Zero-knowledge proofs of correct DKG**: Each participant proves shares generated correctly
2. **Abort-on-complaint**: If any participant detects invalid share, abort DKG
3. **Identify malicious party**: Complaint includes proof of misbehavior

FROST includes verification steps to detect malicious participants.

### Share Compromise Over Time

**Threat**: Adversary gradually compromises shares (e.g., 1 per year), eventually reaches threshold.

**Mitigation**:
1. **Proactive refresh**: Periodically redistribute shares without changing group key
2. **Time-limited shares**: Shares expire after period (e.g., 1 year), require re-DKG
3. **Monitoring**: Detect anomalous signature patterns

### Communication Security

**Threat**: Man-in-the-middle during DKG or signing leaks shares or allows forgery.

**Mitigation**:
1. **Authenticated channels**: TLS with certificate pinning or pre-shared keys
2. **Commitment schemes**: Participants commit to messages before revealing
3. **Broadcast consistency**: All participants verify they received same broadcast

---

## Post-Quantum Threshold Signatures

**Challenge**: FROST is elliptic-curve based → quantum-vulnerable.

**PQ Threshold Schemes** (research-stage):

1. **Lattice-based TSS**:
   - Based on ML-DSA / CRYSTALS-Dilithium
   - Research: [Distributed ML-DSA](https://eprint.iacr.org/2023/1740)
   - Status: Theoretical, no production implementations

2. **Hash-based TSS**:
   - Based on SPHINCS+ / SLH-DSA
   - Simpler construction but larger signatures
   - Status: Emerging research

3. **MPC-based Approach**:
   - Generic multi-party computation for any signature scheme
   - Overhead: Very high (10-100x slower)
   - Practical for low-frequency operations

**Timeline**: PQ threshold signatures expected ~2028-2030.

**Migration Strategy**:
1. **2026-2027**: Deploy FROST-based threshold identities
2. **2028-2030**: Research and prototype PQ threshold schemes
3. **2030+**: Migrate to PQ threshold identities (requires new T-AIDs)

---

## Implementation Roadmap

### Phase 1: Prototype (2026 Q3-Q4)
- ✅ Specification complete (this document)
- 📋 Integrate ZF FROST library into Python reference implementation
- 📋 Build DKG CLI tool
- 📋 Build threshold signing CLI tool
- 📋 End-to-end test with 3-of-5 threshold

### Phase 2: Production (2027 Q1-Q2)
- 📋 Coordinator service implementation
- 📋 Communication layer (libp2p or gRPC)
- 📋 Key management utilities
- 📋 Comprehensive test suite
- 📋 Documentation and tutorials

### Phase 3: Audit and Deployment (2027 Q3-Q4)
- 📋 Security audit of integration code
- 📋 Performance benchmarking
- 📋 Public beta with real organizations
- 📋 Case studies

### Phase 4: PQ Research (2028+)
- 📋 Research lattice-based threshold schemes
- 📋 Prototype PQ threshold signatures
- 📋 Migration planning

---

## References

### Academic Papers

1. **FROST**: [RFC 9591 - Flexible Round-Optimized Schnorr Threshold Signatures](https://www.rfc-editor.org/rfc/rfc9591.html)
2. **Original FROST Paper**: Komlo & Goldberg (2020) - [FROST: Flexible Round-Optimized Schnorr Threshold Signatures](https://eprint.iacr.org/2020/852)
3. **Distributed Key Generation**: Pedersen (1991) - [A Threshold Cryptosystem without a Trusted Party](https://link.springer.com/chapter/10.1007/3-540-46416-6_47)

### Libraries

1. **ZF FROST** (Rust): https://github.com/ZcashFoundation/frost
2. **tss-lib** (Go): https://github.com/binance-chain/tss-lib
3. **Multi-Party ECDSA** (Rust): https://github.com/ZenGo-X/multi-party-ecdsa

### Standards

1. **IRTF CFRG FROST** (RFC 9591)

---

## Changelog

- **2026-02-09**: Initial threshold signature specification

---

**Status**: Experimental (requires security audit before production use)  
**Maintainers**: SGAIP Threshold Cryptography Working Group
