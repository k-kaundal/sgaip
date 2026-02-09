# SGAIP Trust Statements Specification

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** February 9, 2026

## Abstract

This specification defines a trust layer for SGAIP, enabling agents and humans to issue cryptographically signed statements about other identities. Trust statements form the foundation for reputation systems, access control, and decentralized trust networks built on top of SGAIP's identity primitive.

## Motivation

**SGAIP Core Limitation**: Identity ≠ Trust
- SGAIP proves "I control this cryptographic key"
- Does NOT prove "I am trustworthy" or "I have permission to do X"
- No mechanism for expressing trust relationships

**Use Cases Requiring Trust Layer**:
1. **Reputation Systems**: "I trust agent A for task T based on past interactions"
2. **Delegation**: "Agent A can act on my behalf with authority X"
3. **Certification**: "Organization O certifies agent A has capability C"
4. **Web of Trust**: "I trust agents trusted by agent A"
5. **Blacklisting**: "Agent B is compromised/malicious"
6. **Access Control**: "Agent A has permission to access resource R"

**Solution**: Signed, portable, verifiable trust statements layered on SGAIP identities.

---

## Trust Statement Format

### Core Structure

A trust statement is a JSON document signed by the issuer's SGAIP private key:

```json
{
  "version": "SGAIP-Trust-v1",
  "issuer": {
    "aid": "a1b2c3d4...",
    "publicKey": "<base64-public-key>"
  },
  "subject": {
    "aid": "e5f6a7b8...",
    "context": "Specific agent or resource"
  },
  "statement": {
    "type": "trust|delegate|certify|revoke|blacklist",
    "predicate": "Human-readable assertion",
    "confidence": 0.95,
    "evidence": ["List of supporting evidence"],
    "metadata": {
      "issuedAt": "2026-02-09T12:00:00Z",
      "expiresAt": "2027-02-09T12:00:00Z",
      "scope": ["capability:read", "capability:write"],
      "custom": {}
    }
  },
  "signature": "<base64-signature-of-statement>",
  "proof": {
    "challenge": "<nonce-to-prevent-replay>",
    "timestamp": "2026-02-09T12:00:00Z"
  }
}
```

### Statement Types

#### 1. Trust Statement

**Purpose**: Express trust in another identity.

**Example**:
```json
{
  "type": "trust",
  "predicate": "I trust agent E5F6A7B8 for executing financial transactions",
  "confidence": 0.90,
  "evidence": [
    "Completed 47 successful transactions",
    "Zero failures over 6 months",
    "Verified by auditor AID:C3D4E5F6"
  ],
  "metadata": {
    "issuedAt": "2026-02-09T12:00:00Z",
    "expiresAt": "2027-02-09T12:00:00Z",
    "scope": ["domain:finance", "action:transaction", "limit:10000USD"]
  }
}
```

**Semantics**: 
- Issuer vouches for subject's trustworthiness in specified scope
- Confidence: 0.0 (no trust) to 1.0 (complete trust)
- Evidence: Optional supporting documentation

#### 2. Delegation Statement

**Purpose**: Grant authority to another agent to act on issuer's behalf.

**Example**:
```json
{
  "type": "delegate",
  "predicate": "Agent E5F6A7B8 is authorized to sign documents on my behalf",
  "confidence": 1.0,
  "metadata": {
    "issuedAt": "2026-02-09T12:00:00Z",
    "expiresAt": "2026-02-10T12:00:00Z",
    "scope": ["action:sign-document", "document-type:contract"],
    "constraints": {
      "maxValue": 50000,
      "requiresNotification": true
    }
  }
}
```

**Semantics**:
- Subject can perform actions in `scope` on behalf of issuer
- Time-bounded and scoped
- Optional constraints for additional safety

#### 3. Certification Statement

**Purpose**: Attest that subject has specific capabilities or properties.

**Example**:
```json
{
  "type": "certify",
  "predicate": "Agent E5F6A7B8 has completed security audit and is certified for production use",
  "confidence": 1.0,
  "evidence": [
    "Audit report: https://example.org/audit-report-123.pdf",
    "Auditor AID: C3D4E5F6",
    "Audit date: 2026-01-15"
  ],
  "metadata": {
    "issuedAt": "2026-02-09T12:00:00Z",
    "expiresAt": "2027-02-09T12:00:00Z",
    "scope": ["certification:security-audit", "standard:ISO27001"],
    "certificationLevel": "Level 2"
  }
}
```

**Semantics**:
- Issuer (typically authority/auditor) certifies subject's properties
- Evidence points to external verification artifacts
- Certifications have compliance/standard metadata

#### 4. Revocation Statement

**Purpose**: Revoke a previous trust/delegation/certification statement.

**Example**:
```json
{
  "type": "revoke",
  "predicate": "Revoke all previous trust statements for agent E5F6A7B8",
  "confidence": 1.0,
  "metadata": {
    "issuedAt": "2026-02-09T12:00:00Z",
    "revokedStatementId": "sha256:abc123...",
    "reason": "Security compromise detected"
  }
}
```

**Semantics**:
- Explicitly revoke specific statement (via hash) or all statements for subject
- Should be checked before relying on any trust statement

#### 5. Blacklist Statement

**Purpose**: Explicitly distrust an identity (e.g., known malicious actor).

**Example**:
```json
{
  "type": "blacklist",
  "predicate": "Agent E5F6A7B8 is malicious and should not be trusted",
  "confidence": 1.0,
  "evidence": [
    "Attempted unauthorized access on 2026-02-08",
    "Incident report: https://example.org/incident-456"
  ],
  "metadata": {
    "issuedAt": "2026-02-09T12:00:00Z",
    "severity": "critical",
    "reason": "Unauthorized access attempt"
  }
}
```

**Semantics**:
- Negative trust assertion
- Should be propagated widely in trust networks
- Evidence required for serious claims

---

## Signature and Verification

### Signing a Trust Statement

**Process**:

1. **Construct statement** (JSON object with all fields except signature)
2. **Canonicalize** (deterministic JSON serialization to ensure consistent hashing)
3. **Compute hash**: `statement_hash = SHA-256(canonical_json)`
4. **Sign hash** with issuer's SGAIP private key: `signature = Sign(private_key, statement_hash)`
5. **Attach signature** to statement

**Python Example**:
```python
import json
import hashlib
import base64
from sgaip import derive_aid, sign_challenge

def sign_trust_statement(statement_dict: dict, issuer_private_key, issuer_public_key) -> dict:
    """Sign a trust statement with SGAIP identity."""
    
    # Ensure issuer AID is correct
    issuer_aid = derive_aid(issuer_public_key)
    statement_dict['issuer']['aid'] = issuer_aid
    statement_dict['issuer']['publicKey'] = base64.b64encode(issuer_public_key).decode()
    
    # Canonicalize (sorted keys, no whitespace)
    canonical_json = json.dumps(
        {k: v for k, v in statement_dict.items() if k != 'signature'},
        sort_keys=True,
        separators=(',', ':')
    )
    
    # Hash
    statement_hash = hashlib.sha256(canonical_json.encode()).digest()
    
    # Sign
    signature = sign_challenge(issuer_private_key, statement_hash)
    
    # Attach
    statement_dict['signature'] = base64.b64encode(signature).decode()
    
    return statement_dict
```

### Verifying a Trust Statement

**Process**:

1. **Parse** JSON statement
2. **Extract** issuer AID, public key, and signature
3. **Verify issuer AID**: Re-derive from public key and compare
4. **Reconstruct canonical JSON** (all fields except signature)
5. **Compute hash**: `statement_hash = SHA-256(canonical_json)`
6. **Verify signature**: `Verify(issuer_public_key, statement_hash, signature)`
7. **Check expiration**: Ensure `current_time < expiresAt`
8. **Check revocation**: Query revocation lists for this statement

**Python Example**:
```python
def verify_trust_statement(statement_dict: dict) -> bool:
    """Verify a trust statement signature and validity."""
    
    # Extract components
    issuer_aid = statement_dict['issuer']['aid']
    issuer_public_key = base64.b64decode(statement_dict['issuer']['publicKey'])
    signature = base64.b64decode(statement_dict['signature'])
    
    # Verify issuer AID
    aid_computed = derive_aid(issuer_public_key)
    if aid_computed != issuer_aid:
        return False
    
    # Canonicalize
    statement_without_sig = {k: v for k, v in statement_dict.items() if k != 'signature'}
    canonical_json = json.dumps(statement_without_sig, sort_keys=True, separators=(',', ':'))
    statement_hash = hashlib.sha256(canonical_json.encode()).digest()
    
    # Verify signature
    try:
        verify_signature(issuer_public_key, statement_hash, signature)
    except:
        return False
    
    # Check expiration
    from datetime import datetime
    expires_at = datetime.fromisoformat(statement_dict['statement']['metadata']['expiresAt'])
    if datetime.now() > expires_at:
        return False
    
    # Check revocation (requires revocation list lookup)
    if is_revoked(statement_hash):
        return False
    
    return True
```

---

## Trust Graph

### Representing Trust Networks

**Graph Model**:
- **Nodes**: SGAIP identities (AIDs)
- **Edges**: Trust statements (directed, weighted by confidence)
- **Properties**: Scope, expiration, evidence

**Example Graph**:
```
Alice (A1B2C3D4) --[trust:0.95, scope:finance]--> Bob (E5F6A7B8)
Alice (A1B2C3D4) --[trust:0.80, scope:security]--> Carol (C3D4E5F6)
Bob (E5F6A7B8) --[certify:1.0, scope:audit]--> Dave (D4E5F6A7)
```

**Query Operations**:
1. **Direct Trust**: Does A trust B for scope S?
2. **Transitive Trust**: Does A trust B through intermediaries?
3. **Trust Score**: Aggregate trust from multiple paths
4. **Shortest Trust Path**: Find trust chain from A to B

### Trust Propagation (Web of Trust)

**Transitive Trust Formula**:

```
TrustScore(A → C) = max over all paths P from A to C of:
  min(confidence along path P) * decay_factor^(path_length - 1)
```

**Parameters**:
- `decay_factor`: e.g., 0.8 (trust decays with distance)
- `max_path_length`: e.g., 3 (don't consider paths longer than 3 hops)

**Example**:
```
Alice --[0.95]--> Bob --[0.90]--> Carol
Direct: A trusts C with score = 0.95 * 0.90 * 0.8^1 = 0.684

Alice --[0.95]--> Bob --[0.90]--> Carol --[0.85]--> Dave
Transitive: A trusts D with score = 0.95 * 0.90 * 0.85 * 0.8^2 = 0.465
```

**Implementation**:
```python
def compute_trust_score(graph, source_aid, target_aid, max_depth=3, decay=0.8):
    """Compute transitive trust score using BFS."""
    from collections import deque
    
    queue = deque([(source_aid, 1.0, 0)])  # (node, trust_so_far, depth)
    visited = {source_aid: 1.0}
    max_trust = 0.0
    
    while queue:
        current, trust, depth = queue.popleft()
        
        if current == target_aid:
            max_trust = max(max_trust, trust)
            continue
        
        if depth >= max_depth:
            continue
        
        # Explore neighbors
        for neighbor, edge_trust in graph.get_edges_from(current):
            new_trust = trust * edge_trust * (decay ** depth)
            if neighbor not in visited or new_trust > visited[neighbor]:
                visited[neighbor] = new_trust
                queue.append((neighbor, new_trust, depth + 1))
    
    return max_trust
```

---

## Storage and Distribution

### Trust Statement Registry

**Options**:

1. **Decentralized Storage (IPFS/Arweave)**
   - Trust statements published to content-addressed storage
   - Immutable, permanent record
   - Lookup by statement hash

2. **Distributed Hash Table (DHT)**
   - Kademlia-style DHT keyed by issuer or subject AID
   - Query: "Give me all trust statements issued by AID X"
   - Peer-to-peer replication

3. **Blockchain (Optional)**
   - Trust statements published as transactions
   - Provides ordering and tamper-evidence
   - High cost, high latency

4. **Application-Specific Registries**
   - Centralized database for specific ecosystem
   - Fast lookups, simpler implementation
   - Trust the registry operator

**Recommendation**: Hybrid approach
- Critical statements (certifications, delegations) → Blockchain or Arweave
- Social trust statements → DHT or IPFS
- Application layer → Caching in local database

### Query API

**Example REST API**:

```http
GET /trust-statements?issuer={aid}
GET /trust-statements?subject={aid}
GET /trust-statements?type={trust|delegate|certify}
GET /trust-statements/{statement_hash}
POST /trust-statements (publish new statement)
```

**GraphQL API**:
```graphql
query GetTrustStatements($issuerAID: String, $subjectAID: String) {
  trustStatements(issuer: $issuerAID, subject: $subjectAID) {
    issuer { aid, publicKey }
    subject { aid }
    statement { type, predicate, confidence }
    signature
    verified
  }
}
```

---

## Use Case Examples

### Example 1: Organizational Authorization

**Scenario**: Company wants to authorize sub-agents to act on its behalf.

**Setup**:
1. Company has SGAIP identity (possibly threshold): `CompanyAID`
2. Company issues delegation statements for each sub-agent:

```json
{
  "issuer": {"aid": "CompanyAID"},
  "subject": {"aid": "SubAgentAID"},
  "statement": {
    "type": "delegate",
    "predicate": "Authorized to sign contracts up to $50,000",
    "confidence": 1.0,
    "metadata": {
      "scope": ["action:sign-contract", "domain:legal"],
      "constraints": {"maxContractValue": 50000}
    }
  }
}
```

**Verification**: External party receives contract signature from `SubAgentAID`. They:
1. Verify SGAIP signature from `SubAgentAID`
2. Lookup delegation statement from `CompanyAID` to `SubAgentAID`
3. Verify delegation signature and check expiration
4. Check constraints (contract value ≤ $50k)
5. Accept if all checks pass

### Example 2: Security Certification Chain

**Scenario**: Third-party auditor certifies agents as secure.

**Chain**:
1. **Root Authority** (e.g., ISO) certifies auditor:
   ```json
   {
     "issuer": {"aid": "ISO_RootAID"},
     "subject": {"aid": "AuditorAID"},
     "statement": {
       "type": "certify",
       "predicate": "Certified auditor for ISO 27001",
       "confidence": 1.0,
       "metadata": {"certification": "ISO27001-Auditor"}
     }
   }
   ```

2. **Auditor** certifies agent:
   ```json
   {
     "issuer": {"aid": "AuditorAID"},
     "subject": {"aid": "AgentAID"},
     "statement": {
       "type": "certify",
       "predicate": "Passed security audit, compliant with ISO 27001",
       "confidence": 1.0,
       "metadata": {"standard": "ISO27001", "level": "Level2"}
     }
   }
   ```

**Verification**: User verifies agent's security by:
1. Checking agent's certification from auditor
2. Verifying auditor's certification from root authority
3. Building trust chain: `ISO_Root → Auditor → Agent`

### Example 3: Reputation System

**Scenario**: Peer-to-peer marketplace where buyers rate sellers.

**After Transaction**:
```json
{
  "issuer": {"aid": "BuyerAID"},
  "subject": {"aid": "SellerAID"},
  "statement": {
    "type": "trust",
    "predicate": "Excellent service, item as described, fast shipping",
    "confidence": 0.95,
    "evidence": ["Transaction ID: TX123456"],
    "metadata": {
      "domain": "marketplace",
      "category": "electronics",
      "transactionValue": 250
    }
  }
}
```

**Reputation Aggregation**: Compute seller reputation:
```python
def compute_reputation(subject_aid, domain="marketplace"):
    statements = query_trust_statements(subject=subject_aid, type="trust", domain=domain)
    
    # Filter valid, non-expired statements
    valid_statements = [s for s in statements if verify_trust_statement(s)]
    
    # Aggregate (e.g., weighted average)
    if not valid_statements:
        return 0.5  # Neutral
    
    total_confidence = sum(s['statement']['confidence'] for s in valid_statements)
    count = len(valid_statements)
    
    return total_confidence / count
```

### Example 4: Dynamic Access Control

**Scenario**: Resource owner grants time-limited access to agents.

**Grant Access**:
```json
{
  "issuer": {"aid": "ResourceOwnerAID"},
  "subject": {"aid": "AgentAID"},
  "statement": {
    "type": "delegate",
    "predicate": "Read access to database DB_XYZ",
    "confidence": 1.0,
    "metadata": {
      "issuedAt": "2026-02-09T12:00:00Z",
      "expiresAt": "2026-02-09T18:00:00Z",
      "scope": ["resource:DB_XYZ", "action:read"],
      "rateLimit": "100 requests/hour"
    }
  }
}
```

**Access Control Check**:
```python
def check_access(agent_aid, resource_id, action):
    # Query delegation statements
    delegations = query_trust_statements(
        issuer=resource_owner_aid,
        subject=agent_aid,
        type="delegate"
    )
    
    for delegation in delegations:
        if not verify_trust_statement(delegation):
            continue
        
        metadata = delegation['statement']['metadata']
        scope = metadata.get('scope', [])
        
        # Check scope matches
        if f"resource:{resource_id}" in scope and f"action:{action}" in scope:
            return True  # Access granted
    
    return False  # Access denied
```

---

## Security Considerations

### Statement Replay Attacks

**Threat**: Adversary copies valid trust statement and presents it out of context.

**Mitigation**:
1. **Expiration Timestamps**: All statements MUST have `expiresAt`
2. **Nonce**: Include challenge/nonce in proof field
3. **Context Binding**: Tie statement to specific resource or transaction

### Statement Forgery

**Threat**: Adversary creates fake trust statement.

**Mitigation**:
1. **Cryptographic Signatures**: SGAIP signature verification
2. **Public Key Verification**: Ensure issuer AID matches public key
3. **Double-Checking**: Verify statements against multiple sources

### Sybil Attacks (Fake Endorsements)

**Threat**: Adversary creates many identities to boost trust score.

**Mitigation**:
1. **Weighted Trust**: Weight statements by issuer reputation
2. **Proof of Work**: Require cost to issue statements
3. **Social Graph Analysis**: Detect fake identity clusters

### Revocation Latency

**Threat**: Compromised key continues being trusted because revocation not propagated.

**Mitigation**:
1. **Short Expiration**: Force periodic re-certification
2. **Revocation Lists**: Check blacklist before accepting statement
3. **Push Notifications**: Active revocation broadcast to relying parties

### Privacy Leakage

**Threat**: Public trust statements leak information about relationships and transactions.

**Mitigation**:
1. **Private Trust Statements**: Encrypt statement content, reveal only to specific parties
2. **Zero-Knowledge Trust**: Prove "I am trusted by someone in group G" without revealing who
3. **Aggregated Reputations**: Publish aggregate scores, not individual statements

---

## Implementation Roadmap

### Phase 1: Core Trust Statements (2026 Q4)
- ✅ Specification complete (this document)
- 📋 Reference implementation: Sign and verify trust statements
- 📋 CLI tool: Issue and verify statements
- 📋 Basic storage (file-based JSON)

### Phase 2: Graph and Queries (2027 Q1-Q2)
- 📋 Trust graph library (in-memory)
- 📋 Transitive trust computation
- 📋 Query API (REST or GraphQL)
- 📋 Integration examples

### Phase 3: Distributed Storage (2027 Q3-Q4)
- 📋 IPFS integration for statement publishing
- 📋 DHT-based statement lookup
- 📋 Revocation list propagation
- 📋 Performance optimization

### Phase 4: Advanced Features (2028+)
- 📋 Private trust statements (encrypted)
- 📋 ZKP-based trust proofs
- 📋 Threshold trust (M-of-N endorsements required)
- 📋 Machine learning trust scoring

---

## References

### Academic Papers

1. **Web of Trust**: PGP Trust Model
2. **TrustRank**: [Combating Web Spam with TrustRank](http://ilpubs.stanford.edu:8090/6 52/1/2004-7.pdf)
3. **Reputation Systems**: [The Eigentrust Algorithm for Reputation Management in P2P Networks](https://nlp.stanford.edu/pubs/eigentrust.pdf)

### Systems

1. **Ceramic Network**: Decentralized data network for trust statements
2. **DIDComm**: Secure messaging for decentralized identifiers
3. **Verifiable Credentials**: W3C standard for claims

---

## Changelog

- **2026-02-09**: Initial trust statements specification

---

**Status**: Draft (open for community feedback)  
**Maintainers**: SGAIP Trust Network Working Group
