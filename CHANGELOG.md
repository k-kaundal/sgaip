# Changelog

All notable changes to SGAIP and its reference implementations are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.1] – 2026-02-09 (Ready for Publication)

### Added
- Documentation updates reflecting npm and PyPI publication status
- Updated version numbers in Python package (pyproject.toml, __init__.py)
- Added publication guide for Python package (PUBLISH_GUIDE.md)

### Changed
- Updated README.md with publication URLs (PyPI and npm)
- Enhanced CHANGELOG with publication status section
- Synchronized version numbering across packages

### Documentation
- Updated main README with live package links
- Created reference/python/PUBLISH_GUIDE.md with publication instructions
- Consistent documentation across all packages

---

## [0.1.0] – 2026-02-09 (Released)

### Added

#### Python Package (reference/python/)
- ✨ Production-ready `sgaip` Python package published to PyPI
- ✨ Console script entry point (`sgaip` CLI command)
- ✨ `sgaip/cli.py` module with full command support:
  - `sgaip keygen` – generate Ed25519 keypair
  - `sgaip sign` – sign messages or files
  - `sgaip verify` – offline verification
- ✨ `sgaip/__main__.py` for `python -m sgaip` support
- ✨ Full type hints and docstrings (`sgaip/core.py`)
- ✨ Comprehensive test suite (`tests/test_core.py`) with pytest
- ✨ Development tools configured:
  - pytest with coverage
  - black for code formatting
  - ruff for linting
  - mypy for strict type checking
- ✨ Enhanced `pyproject.toml` with:
  - Proper metadata (keywords, classifiers, maintainers)
  - Optional dev dependencies
  - Pytest and tool configurations
  - Documentation and preprint URLs

#### JavaScript/TypeScript Package (reference/js/)
- ✨ Full TypeScript conversion of JavaScript reference implementation
- ✨ `src/identity.ts`, `src/keys.ts`, `src/proof.ts` with strict types
- ✨ Main entry point `src/index.ts` with proper exports
- ✨ TypeScript CLI (`bin/sgaip.ts`) with:
  - Argument parsing via `util.parseArgs`
  - Global installation support
  - Full error handling
  - Help text and usage messages
- ✨ `tsconfig.json` with strict mode and sourcemaps
- ✨ Test suite (`src/index.test.ts`) using Node.js built-in test runner
- ✨ ESLint configuration (`.eslintrc.json`) with TypeScript rules
- ✨ Enhanced `package.json` with:
  - TypeScript build pipeline
  - Type declarations generation
  - Multiple npm scripts (build, dev, test, lint, type-check)
  - Dev dependencies (TypeScript, ESLint, @types/node)
  - Proper bin field pointing to compiled CLI

#### Repository
- ✨ Comprehensive `.gitignore` covering Python, Node.js, TypeScript, IDE files, secrets, and build artifacts
- ✨ Updated main [README.md](README.md) with:
  - Quick start guides for Python and JavaScript
  - PyPI and npm package links
  - Clear repository structure documentation
  - Installation instructions for both packages
  - Security notes and limitations
- ✨ [DEVELOPMENT.md](DEVELOPMENT.md) – complete developer guide with:
  - Setup instructions for both languages
  - Development workflow guidance
  - Testing strategy and requirements
  - Version management guidance
  - Publishing procedures
  - Code style guidelines
  - Troubleshooting tips
- ✨ [PRODUCTION_UPDATES.md](PRODUCTION_UPDATES.md) – detailed summary of v0.1.0 enhancements

#### Documentation
- ✨ Updated [reference/python/README.md](reference/python/README.md) with:
  - Feature list highlighting production readiness
  - Quick-start examples for all CLI commands
  - Development section with test/lint/typecheck commands
- ✨ Enhanced [reference/js/README.md](reference/js/README.md) with:
  - Development section documenting build workflow
  - TypeScript-first approach highlighted

### Fixed
- Fixed setuptools package discovery in Python package
- Fixed TypeScript compilation errors in CLI argument handling
- Ensured all imports properly resolve after TypeScript build

### Changed
- Restructured documentation to separate specs, docs, and implementation guides
- Improved organization of CLI commands across both implementations

### Documentation
- Clarified protocol status as early-stage but with production-ready implementations
- Added comprehensive installation and usage guides
- Updated all package READMEs with concrete examples

---

## Standards Compliance

This version:
- ✅ Implements [SGAIP Core Specification](specs/sgaip-core.md)
- ✅ Complies with [Identity Derivation](specs/identity-derivation.md) spec
- ✅ Implements [Proof Protocol](specs/proof-protocol.md)
- ✅ Addresses [Threat Model](specs/threat-model.md) considerations

---

## Compatibility Notes

### Python
- Requires Python 3.10 or higher
- Requires `cryptography` library

### JavaScript
- Requires Node.js 18 or higher
- Pure JavaScript/TypeScript (no additional dependencies for the library)

---

## Security Considerations

- ℹ️ Reference implementations are for educational purposes
- ⚠️ Not audited for production use
- ⚠️ Private keys should be protected according to your security policy
- See [specs/threat-model.md](specs/threat-model.md) for detailed security analysis

---

## Migration from Previous Versions

This is the first production-ready release (0.1.0). 

If you were using the legacy CLI (`cli/sgaip_cli.py`), migrate to:
- **Python:** Use `pip install sgaip` and the `sgaip` command
- **JavaScript:** Use `npm install -g sgaip` and the `sgaip` command

Both provide the same functionality with enhanced reliability and production support.

---

## Known Limitations

- No key recovery or revocation mechanisms (by design)
- No trust or reputation scoring context
- No authorization model (authentication only)
- Reference implementations prioritize clarity over performance

---

## Future Plans

- [ ] GitHub Actions CI/CD pipeline for automated testing
- [ ] Additional language implementations (Go, Rust, etc.)
- [ ] Extended test vector suite
- [ ] Performance benchmarking framework
- [ ] Security audit of reference implementations
- [ ] Extended documentation and tutorials

---

## Publication Status

### v0.1.0 (Released 2026-02-09)
- ✅ **Python:** Published to PyPI https://pypi.org/project/sgaip/v0.1.0
- ✅ **JavaScript:** Published to npm https://www.npmjs.com/package/sgaip/v/0.1.0

### v0.1.1 (Ready for Publication - 2026-02-09)
- ✅ **Python:** Ready for PyPI upload (version updated, docs finalized)
- ✅ **Documentation:** All guides and references updated

## Contributors

SGAIP is developed by SGAIP Contributors.

See [GOVERNANCE.md](GOVERNANCE.md) for contribution guidelines and decision-making process.
