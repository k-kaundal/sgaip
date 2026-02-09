# SGAIP CLI

Reference Command-Line Interface for the
**Stateless Global Agent Identity Protocol (SGAIP)**

---

## Overview

The **SGAIP CLI** is a **minimal reference implementation** of the core SGAIP protocol.

It allows users to:

* generate cryptographic identities,
* derive Agent Identities (AID),
* sign messages or files,
* verify identities and signatures **offline**.

This CLI is intended for:

* learning and experimentation,
* protocol validation,
* demonstrations and testing.

It is **not production software**.

---

## Key Properties

* No blockchain
* No registry
* No network dependency
* Fully offline verification
* Stateless identity derivation

---

## Requirements

* Python 3.10+
* `cryptography` library

Install dependency:

```
pip install cryptography
```

---

## Installation

Clone the SGAIP repository:

```
git clone https://github.com/k-kaundal/sgaip.git
cd sgaip/cli
```

Make the CLI executable (optional):

```
chmod +x sgaip_cli.py
```

---

## Usage

All commands work **offline**.

### 1. Generate a Key Pair and Agent Identity

```
./sgaip_cli.py keygen --private agent.sk --public agent.pk
```

Output:

* `agent.sk` – private key (keep secret)
* `agent.pk` – public key
* derived **Agent ID (AID)** printed to console

---

### 2. Sign a Message

```
./sgaip_cli.py sign --private agent.sk --message "hello world"
```

This creates:

* `signature.bin`

---

### 3. Sign a File

```
./sgaip_cli.py sign --private agent.sk --file data.txt --out data.sig
```

---

### 4. Verify a Message or File (Offline)

```
./sgaip_cli.py verify --public agent.pk --signature signature.bin --message "hello world"
```

Output:

* signature verification result
* derived **Agent ID (AID)**

---

## What Verification Proves

Successful verification proves:

* control of the private key,
* authenticity of the message,
* deterministic Agent Identity derivation.

Verification does **not** imply:

* trustworthiness,
* authorization,
* correctness of content.

---

## Security Notes

* Protect private keys (`.sk` files)
* Anyone with the private key controls the identity
* Key loss means identity loss

SGAIP intentionally avoids key recovery or revocation mechanisms.

---

## Relationship to the Specification

This CLI implements:

* `specs/identity-derivation.md`
* `specs/proof-protocol.md`

It exists to clarify and validate the protocol, not to replace proper implementations.

---

## Disclaimer

This software is provided for **reference and educational purposes only**.

It has not been audited and SHOULD NOT be used in production environments.

---

## License

Licensed under the Apache License, Version 2.0.
