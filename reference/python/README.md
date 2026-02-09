SGAIP Python Reference Implementation

- **Package:** sgaip
- **Version:** 0.1.1 (ready for PyPI)
- **License:** Apache-2.0
- **Python:** 3.10+
- **Repository:** https://github.com/k-kaundal/sgaip
- **PyPI:** https://pypi.org/project/sgaip/

## Overview

`sgaip` is a production-ready reference implementation of the Stateless Global Agent Identity Protocol (SGAIP).

It provides:
- **Core library** – deterministic identity derivation, Ed25519 operations
- **CLI tool** – global `sgaip` command for key generation, signing, verification
- **Full type safety** – complete type hints with mypy support
- **Comprehensive tests** – unit tests with pytest + coverage
- **Production quality** – linting, formatting, strict type checking

## Installation

### From PyPI

```bash
pip install sgaip
```

### From Source

```bash
git clone https://github.com/k-kaundal/sgaip.git
cd sgaip/reference/python
pip install -e .
```

### With Development Tools

```bash
pip install -e .[dev]
```

## CLI Usage

The `sgaip` command provides three main operations:

### 1. Generate a Keypair

```bash
sgaip keygen --private agent.sk --public agent.pk
```

Outputs:
- `agent.sk` – private key (keep secret!)
- `agent.pk` – public key
- Derived **Agent ID (AID)** to console

### 2. Sign a Message

```bash
sgaip sign --private agent.sk --message "Hello, World!"
sgaip sign --private agent.sk --file data.txt --out data.sig
```

Creates:
- `signature.bin` (or custom `--out` file)

### 3. Verify Offline

```bash
sgaip verify --public agent.pk --signature signature.bin --message "Hello, World!"
sgaip verify --public agent.pk --signature data.sig --file data.txt
```

Prints:
- ✅ Signature validity
- Derived **Agent ID (AID)**

All operations work **completely offline** – no internet required.

## Python API

### Basic Usage

```python
from sgaip import (
    generate_keypair,
    serialize_public_key,
    derive_agent_id,
    sign_challenge,
    verify_proof,
)

# Generate identity
private_key, public_key = generate_keypair()
public_bytes = serialize_public_key(public_key)

# Derive Agent Identity
aid = derive_agent_id(public_bytes)
print(f"Agent ID: {aid}")

# Sign a challenge
challenge = b"verifier-challenge-123"
signature = sign_challenge(private_key, challenge)

# Verify offline
is_valid = verify_proof(public_bytes, challenge, signature, expected_aid=aid)
assert is_valid
```

### Advanced: Import from Package

```python
import sgaip

# All public functions available
print(sgaip.__version__)
keypair = sgaip.generate_keypair()
aid = sgaip.derive_agent_id(sgaip.serialize_public_key(keypair[1]))
```

## Development

### Setup

```bash
cd sgaip/reference/python
python -m venv venv
source venv/bin/activate
pip install -e .[dev]
```

### Testing

```bash
# Run all tests
pytest tests/

# With coverage
pytest tests/ --cov=sgaip --cov-report=html

# Watch mode
pytest-watch tests/
```

### Linting & Formatting

```bash
# Format code
black sgaip/ tests/ bin/

# Check style
black --check sgaip/ tests/

# Lint with ruff
ruff check sgaip/ tests/
ruff check --fix sgaip/ tests/

# Type check
mypy sgaip/
```

### Running Individual Commands

```bash
# Keygen
python -m sgaip keygen --private test.sk --public test.pk

# Sign
python -m sgaip sign --private test.sk --message "test"

# Verify
python -m sgaip verify --public test.pk --signature signature.bin --message "test"
```

## Security Notes

⚠️ **Reference implementation — not security audited.**

- Protect private key files (`.sk`) – anyone with the key controls the identity
- Loss of private key means loss of identity (no recovery mechanism)
- SGAIP provides **authentication only**, not trust or authorization
- See [specs/threat-model.md](../../specs/threat-model.md) for detailed security analysis

## Specifications

This package implements:

- [SGAIP Core Specification](../../specs/sgaip-core.md)
- [Identity Derivation](../../specs/identity-derivation.md)
- [Proof Protocol](../../specs/proof-protocol.md)

## Testing & Interoperability

Python tests verify:
- ✅ Deterministic identity derivation (same AID for same public key)
- ✅ Ed25519 signature scheme correctness
- ✅ Offline verification
- ✅ CLI command handling

Run the full suite:

```bash
pytest tests/ --cov=sgaip
```

## Troubleshooting

**Issue:** `ModuleNotFoundError: No module named 'cryptography'`

```bash
pip install cryptography
```

**Issue:** Type checking fails

```bash
mypy sgaip/ --ignore-missing-imports
```

**Issue:** Tests fail on import

Ensure you've installed in editable mode:

```bash
pip install -e .
```

## Contributing

See [DEVELOPMENT.md](../../DEVELOPMENT.md) for contribution guidelines.

Key areas for contribution:
- Additional test vectors
- Performance optimizations
- Documentation improvements
- Additional language bindings

## License

Apache License 2.0 – see [LICENSE](../../LICENSE)

## Related Projects

- **JavaScript/TypeScript:** [reference/js/](../js/)
- **Protocol Specification:** [specs/](../../specs/)
- **Test Vectors:** [test-vectors/](../../test-vectors/)

---

**Questions?**  
Open an issue on [GitHub](https://github.com/k-kaundal/sgaip/issues) or see [GOVERNANCE.md](../../GOVERNANCE.md).


