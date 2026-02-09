# sgaip (Node.js / TypeScript)

Reference **TypeScript** implementation of the
**Stateless Global Agent Identity Protocol (SGAIP)**.

This package provides:

* 📦 **JavaScript/TypeScript API** – fully typed for safe usage
* 🔧 **Built-in CLI** (`sgaip` command) – global installation support
* 🔒 **Offline verification** – deterministic identity derivation and verification
* ✅ **Production-ready** – strict TypeScript, comprehensive tests, linting

---

## What is SGAIP?

SGAIP is a **stateless, cryptographic identity protocol** that enables **global, offline-verifiable identity** for humans and AI agents **without registries, blockchains, or centralized authorities**.

Identity in SGAIP is:

* derived from a public key (deterministic)
* verifiable offline (no network needed)
* permissionless (anyone can create an identity)

---

## Key Properties

* **Stateless** – no registry, no ledger
* **Offline verification** – works completely offline
* **Permissionless** – create identities without permission
* **Deterministic** – same AID for same public key everywhere
* **Standard cryptography** – Ed25519 + SHA-256

---

## Installation

### As a Library

```bash
npm install sgaip
```

### With CLI (Global)

```bash
npm install -g sgaip
```

---

## Quick Start

### CLI

```bash
# Generate keypair
sgaip keygen --private agent.sk --public agent.pk

# Sign a message
sgaip sign --private agent.sk --message "Hello, World!" --out message.sig

# Verify offline
sgaip verify --public agent.pk --signature message.sig --message "Hello, World!"

# Work with files
sgaip sign --private agent.sk --file data.bin --out data.bin.sig
sgaip verify --public agent.pk --signature data.bin.sig --file data.bin
```

### JavaScript/TypeScript

```typescript
import { generateKeyPair, deriveAID, sign, verify } from "sgaip";

// Generate identity
const { publicKey, privateKey } = generateKeyPair();
const aid = deriveAID(publicKey);
console.log("Agent ID:", aid);

// Sign data
const data = Buffer.from("Hello, World!");
const signature = sign(privateKey, data);

// Verify (offline, no internet)
const isValid = verify(publicKey, data, signature);
console.log("Valid:", isValid);
```

---

## API Reference

### `generateKeyPair(): KeyPairResult`

Generate a new Ed25519 keypair.

```typescript
const { publicKey, privateKey } = generateKeyPair();
// publicKey: Buffer (91 bytes, SPKI DER format)
// privateKey: Buffer (48 bytes, PKCS8 DER format)
```

### `deriveAID(publicKeyBytes: Buffer): string`

Derive a deterministic Agent Identity.

```typescript
const aid = deriveAID(publicKey); // 64-char hex string
// Same publicKey always produces same AID
```

### `sign(privateKey: Buffer, data: Buffer): Buffer`

Sign data with a private key.

```typescript
const signature = sign(privateKey, Buffer.from("message"));
// Returns: 64-byte Ed25519 signature
```

### `verify(publicKey: Buffer, data: Buffer, signature: Buffer): boolean`

Verify a signature offline.

```typescript
const isValid = verify(publicKey, Buffer.from("message"), signature);
// Returns: true if valid, false otherwise
```

---

## Development

### Setup

```bash
npm install
npm run build       # Compile TypeScript → dist/
npm run dev         # Watch mode (auto-compile)
```

### Testing

```bash
npm test            # Run tests
npm run type-check  # TypeScript check
npm run lint        # ESLint
```

### Code Quality

```bash
# Type check
npm run type-check

# Lint (ESLint)
npm run lint

# Clean and rebuild
npm run clean && npm run build
```

### Directory Structure

```
.
├── src/
│   ├── identity.ts    # AID derivation
│   ├── keys.ts        # Key generation
│   ├── proof.ts       # Signing/verification
│   ├── index.ts       # Main exports
│   └── index.test.ts  # Tests
├── bin/
│   └── sgaip.ts       # CLI implementation
├── dist/              # Compiled output (generated)
├── tsconfig.json      # TypeScript config
├── package.json       # npm config
└── .eslintrc.json     # Linting rules
```

---

## TypeScript Support

All code is written in **strict TypeScript**. Type definitions are auto-generated and included:

```typescript
import type { KeyPairResult } from "sgaip";

const pair: KeyPairResult = generateKeyPair();
const aid: string = deriveAID(pair.publicKey);
const sig: Buffer = sign(pair.privateKey, data);
const ok: boolean = verify(pair.publicKey, data, sig);
```

---

## What This Package Does NOT Do

* ❌ No trust or reputation scoring
* ❌ No authorization or permissions
* ❌ No registry or directory
* ❌ No network communication
* ❌ No blockchain or tokens

**Identity ≠ trust ≠ authorization.**

---

## Security Notes

⚠️ **Reference implementation — not security audited.**

* Anyone with the private key controls the identity
* Loss of the private key means loss of identity (no recovery mechanism)
* Key protection is the responsibility of the user
* SGAIP provides **authentication only**, not trust or authorization
* See [../../specs/threat-model.md](../../specs/threat-model.md) for detailed security analysis

---

## Specifications

This package implements:

* [`specs/sgaip-core.md`](../../specs/sgaip-core.md) – Core specification
* [`specs/identity-derivation.md`](../../specs/identity-derivation.md) – AID derivation
* [`specs/proof-protocol.md`](../../specs/proof-protocol.md) – Proof protocol

---

## Testing & Interoperability

Tests verify:
- ✅ Deterministic identity derivation
- ✅ Ed25519 signature correctness
- ✅ Offline verification works
- ✅ CLI commands function correctly

Run the full test suite:

```bash
npm test
npm run type-check
npm run lint
```

---

## Troubleshooting

**Issue:** `ERR_MODULE_NOT_FOUND` after installation

```bash
npm run clean && npm run build
```

**Issue:** TypeScript compilation errors

```bash
npm run type-check
```

**Issue:** CLI not found after global install

```bash
npm install -g sgaip@latest
which sgaip
```

**Issue:** Permission denied on CLI

```bash
sudo npm install -g sgaip
# or if you prefer non-sudo:
npm config set prefix ~/.npm-global
export PATH=$HOME/.npm-global/bin:$PATH
npm install -g sgaip
```

---

## Contributing

See [../../DEVELOPMENT.md](../../DEVELOPMENT.md) for contribution guidelines.

Key areas for contribution:
- Performance optimizations
- Additional test vectors
- Documentation improvements
- Additional language bindings

---

## Package Information

- **Package:** sgaip
- **Version:** 0.1.0
- **License:** Apache-2.0
- **Node.js:** 18+
- **Repository:** https://github.com/k-kaundal/sgaip
- **npm:** https://www.npmjs.com/package/sgaip

---

## Related Projects

* **Python:** [../python/](../python/)
* **Protocol Spec:** [../../specs/](../../specs/)
* **Test Vectors:** [../../test-vectors/](../../test-vectors/)
* **Main Repo:** [../../README.md](../../README.md)

---

## License

Licensed under the **Apache License, Version 2.0** – see [LICENSE](../../LICENSE)

---

## Disclaimer

This software is provided for **educational and reference purposes only**.

It has not been security audited and SHOULD NOT be used in production systems without thorough security review.

---

**Questions?**  
Open an issue on [GitHub](https://github.com/k-kaundal/sgaip/issues) or see [GOVERNANCE.md](../../GOVERNANCE.md).
