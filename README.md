# SGAIP

**Stateless Global Agent Identity Protocol (SGAIP)** is a protocol for global, offline-verifiable identity
for humans and AI agents.

SGAIP defines identity as a **cryptographic proof**, not a registry entry, ledger record,
or platform account.

---

## Key Properties

- **Stateless** – no registry, no ledger, no central authority
- **Offline verifiable** – identity proofs work without internet access
- **Permissionless** – anyone can create an identity
- **AI-native** – autonomous agents are first-class participants
- **Cryptographically derived** – identity is deterministic from a public key
- **Implementable** – uses only standard cryptography (Ed25519 + SHA-256)

---

## Quick Start

### Using the Python Package

```bash
pip install sgaip
sgaip keygen
sgaip sign --private agent.sk --message "hello"
sgaip verify --public agent.pk --signature signature.bin --message "hello"
```

📦 **PyPI (Published):** [https://pypi.org/project/sgaip/](https://pypi.org/project/sgaip/)

### Using the JavaScript Package

```bash
npm install -g sgaip
sgaip keygen
sgaip sign --private agent.sk --message "hello"
sgaip verify --public agent.pk --signature signature.bin --message "hello"
```

📦 **npm (Published):** [https://www.npmjs.com/package/sgaip](https://www.npmjs.com/package/sgaip)

---

## What SGAIP Is Not

- ❌ Not blockchain-based
- ❌ Not a registry or directory
- ❌ Not a token system
- ❌ Not a platform or service
- ❌ Identity ≠ trust (no reputation scoring)
- ❌ Identity ≠ authorization (no permission system)

---

## Repository Structure

```
.
├── docs/               # Terminology and concepts
├── specs/              # Protocol specifications
│   ├── sgaip-core.md              # Core specification
│   ├── identity-derivation.md     # Identity derivation spec
│   ├── proof-protocol.md          # Proof/signature spec
│   └── threat-model.md            # Security threat model
├── reference/          # Reference implementations (production-ready)
│   ├── python/         # Python package + CLI
│   └── js/             # TypeScript/JavaScript package + CLI
├── test-vectors/       # Interoperability test data
└── cli/                # Legacy Python CLI (see reference/python)
```

---

## Status

SGAIP is an **early-stage protocol specification** with **production-ready reference implementations**.

- ✅ Protocol specification complete (specs/)
- ✅ Reference implementations ready (reference/python, reference/js)
- ✅ **Published on PyPI** https://pypi.org/project/sgaip/
- ✅ **Published on npm** https://www.npmjs.com/package/sgaip
- ✅ Test suites and development guides
- ⏳ Community review and feedback phase

---

## Documentation

### For Protocol Designers & Researchers
- [Core Specification](specs/sgaip-core.md) – protocol definition
- [Identity Derivation](specs/identity-derivation.md) – how AID is computed
- [Proof Protocol](specs/proof-protocol.md) – signing and verification
- [Threat Model](specs/threat-model.md) – security analysis
- [Terminology](docs/terminology.md) – key terms and definitions

### For Package Users

**Python:**
- [Python Package Guide](reference/python/README.md)
- [Installation & Usage](reference/python/README.md#quick-start)
- [API Documentation](reference/python/sgaip/core.py)

**JavaScript/TypeScript:**
- [JavaScript Package Guide](reference/js/README.md)
- [Installation & Usage](reference/js/README.md#installation)
- [TypeScript API](reference/js/src/index.ts)

### For Contributors
- [Development Guide](DEVELOPMENT.md)
- [Production Updates](PRODUCTION_UPDATES.md)
- [Governance](GOVERNANCE.md)
- [Changelog](CHANGELOG.md)

---

## Installation

### Python (PyPI)

```bash
pip install sgaip
```

Then use the `sgaip` CLI globally or import the library:

```python
from sgaip.core import generate_keypair, derive_agent_id

sk, pk = generate_keypair()
aid = derive_agent_id(serialize_public_key(pk))
```

### JavaScript/TypeScript (npm)

```bash
npm install sgaip
```

Or install CLI globally:

```bash
npm install -g sgaip
```

Usage:

```typescript
import { generateKeyPair, deriveAID } from "sgaip";

const { publicKey, privateKey } = generateKeyPair();
const aid = deriveAID(publicKey);
```

---

## Development

```bash
# Python
cd reference/python
pip install -e .[dev]
pytest tests/

# JavaScript
cd reference/js
npm install
npm run build
npm test
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed guidance.

---

## Security

⚠️  **Reference implementations are for educational and research purposes.**

- Not audited for production use
- Use at your own risk
- For production systems, seek professional security review

See [specs/threat-model.md](specs/threat-model.md) for security analysis.

---

## License

Licensed under the **Apache License, Version 2.0** ([LICENSE](LICENSE))

---

## Community

- **Issues & Discussions:** GitHub Issues and Discussions
- **Governance:** See [GOVERNANCE.md](GOVERNANCE.md)
- **Contributions:** See [DEVELOPMENT.md](DEVELOPMENT.md)
