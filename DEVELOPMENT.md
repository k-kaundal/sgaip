# Development Guide

This document provides guidance for contributing to SGAIP, developing reference implementations, and maintaining the specification.

---

## Repository Overview

```
sgaip/
├── specs/              # Protocol specifications (normative)
├── docs/               # Documentation and terminology
├── reference/          # Production-ready reference implementations
│   ├── python/         # Python package (sgaip on PyPI)
│   └── js/             # JavaScript/TypeScript package (sgaip on npm)
├── test-vectors/       # Cross-implementation test data
├── cli/                # Legacy Python CLI (for historical reference)
└── [config files]      # Root-level configs (.gitignore, etc.)
```

---

## Development Environment Setup

### Python Development

```bash
cd reference/python
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -e .[dev]
```

**Available scripts:**

```bash
pytest tests/                    # Run tests
pytest tests/ --cov=sgaip       # Tests with coverage
black src/ sgaip/               # Format code
ruff check src/ sgaip/          # Lint
mypy src/ sgaip/                # Type check
```

### JavaScript/TypeScript Development

```bash
cd reference/js
npm install
npm run dev                      # Watch mode (compile on changes)
npm run build                    # Build for production
npm test                         # Run tests
npm run lint                     # ESLint
npm run type-check              # TypeScript type checking
```

---

## Making Changes

### Protocol Changes (specs/)

1. **Edit the relevant spec** in `specs/`
2. **Update** `reference/python/sgaip/core.py` and `reference/js/src/`
3. **Add test vectors** to `test-vectors/sgaip-test-vectors.md`
4. **Update all reference implementations** to match spec
5. **Document** in [CHANGELOG.md](CHANGELOG.md)

### Reference Implementation Changes (reference/python or reference/js)

1. **Verify spec compliance** first
2. **Write tests** for new functionality
3. **Run full test suite** (`pytest` or `npm test`)
4. **Run linting** and type checks
5. **Update documentation** (READMEs, docstrings)
6. **Update version** in `pyproject.toml` or `package.json`
7. **Document** in [CHANGELOG.md](CHANGELOG.md)

### Documentation Changes (docs/specs)

1. **Edit** the `.md` file
2. **Cross-reference** related sections
3. **Review** for consistency with code and other docs
4. **Test** any code examples

---

## Testing Strategy

### Python Testing

- **Framework:** pytest
- **Location:** `reference/python/tests/test_*.py`
- **Coverage target:** >90%
- **Run:** `pytest tests/ --cov=sgaip`

Key test areas:
- Identity derivation determinism
- Key pair generation
- Signing and verification
- CLI argument parsing

### JavaScript/TypeScript Testing

- **Framework:** Node.js built-in test runner
- **Location:** `reference/js/src/**/*.test.ts`
- **Run:** `npm test`

Key test areas (same as Python):
- Identity, keys, proofs
- TypeScript compilation
- CLI functionality

---

## Version Management

### Version Numbers

SGAIP follows **semantic versioning**:

```
MAJOR.MINOR.PATCH
```

- **MAJOR:** Protocol breaking changes
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, internal improvements

### Updating Versions

```bash
# Python (reference/python/pyproject.toml)
version = "0.1.0"

# JavaScript (reference/js/package.json)
"version": "0.1.0"
```

Update both when releasing.

---

## Publishing

### Python Package (PyPI)

```bash
cd reference/python
python -m build
twine upload dist/*
```

Requirements:
- PyPI account with credentials configured
- `build` and `twine` installed

### JavaScript Package (npm)

```bash
cd reference/js
npm run build
npm publish
```

Requirements:
- npm account and authentication
- `npm-cli-rc` configured with credentials

---

## Continuous Integration

### Local Pre-commit Checks

Before committing, run:

**Python:**
```bash
cd reference/python
pytest tests/ --cov=sgaip
black --check sgaip/
ruff check sgaip/
mypy sgaip/
```

**JavaScript:**
```bash
cd reference/js
npm test
npm run lint
npm run type-check
```

### GitHub Actions (CI/CD Pipeline)

Workflows auto-run on every push/PR (when configured):
- Tests on Python 3.10+
- Tests on Node.js 18+
- Linting and type checking
- Code coverage reporting

See `.github/workflows/` for configurations (if present).

---

## Code Style

### Python

- **Formatting:** `black` (line length 100)
- **Linting:** `ruff`
- **Type checking:** `mypy` (strict mode)
- **Docstring style:** Google style

Example:

```python
def derive_agent_id(public_key_bytes: bytes) -> str:
    """
    Derive a deterministic Agent Identity from public key bytes.
    
    Args:
        public_key_bytes: Raw Ed25519 public key (32 bytes).
    
    Returns:
        Hex-encoded SHA-256 hash of (public_key || domain).
    """
    return hashlib.sha256(public_key_bytes + IDENTITY_DOMAIN).hexdigest()
```

### JavaScript/TypeScript

- **Formatter:** Prettier (configured in eslintrc)
- **Linting:** ESLint with TypeScript rules
- **Target:** ES2022
- **Strict mode:** Always

Example:

```typescript
export function deriveAID(publicKeyBytes: Buffer): string {
  return crypto
    .createHash("sha256")
    .update(Buffer.concat([publicKeyBytes, IDENTITY_DOMAIN]))
    .digest("hex");
}
```

---

## Troubleshooting

### Python Issues

**Issue:** `ImportError: No module named 'cryptography'`
```bash
pip install cryptography
```

**Issue:** Tests fail on type checking
```bash
mypy sgaip/ --ignore-missing-imports
```

### JavaScript Issues

**Issue:** `Module not found` after changes
```bash
npm run clean && npm run build
```

**Issue:** ESLint errors
```bash
npm run lint -- --fix
```

---

## Collaboration

### Before Opening a PR

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test locally
4. Commit with clear messages
5. Push to your fork
6. Open a PR with a clear description

### PR Review Criteria

PRs should include:
- Clear description of changes
- Tests for new functionality
- Updated documentation
- Clean commit history
- Passing CI checks

### Requesting Review

- Tag maintainers if urgent
- Include links to related issues
- Provide context for complex changes

---

## Resources

- **SGAIP Specification:** [specs/sgaip-core.md](../specs/sgaip-core.md)
- **Identity Derivation:** [specs/identity-derivation.md](../specs/identity-derivation.md)
- **Proof Protocol:** [specs/proof-protocol.md](../specs/proof-protocol.md)
- **Threat Model:** [specs/threat-model.md](../specs/threat-model.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

## Questions?

- Open an issue for bugs or questions
- Start a discussion for RFCs (Request for Comment)
- See [GOVERNANCE.md](GOVERNANCE.md) for decision-making process
