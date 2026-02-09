"""
SGAIP (Stateless Global Agent Identity Protocol) – Python Reference Implementation

A minimal, production-ready reference implementation of SGAIP for cryptographic identity
derivation and offline verification.

Public API:
    - generate_keypair() – Generate Ed25519 keypair
    - serialize_public_key() – Serialize public key to bytes
    - derive_agent_id() – Deterministic identity derivation
    - sign_challenge() – Sign a challenge with private key
    - verify_proof() – Verify identity proof offline

Available on PyPI: https://pypi.org/project/sgaip/
Repository: https://github.com/k-kaundal/sgaip
"""

from .core import (
    IDENTITY_DOMAIN,
    derive_agent_id,
    generate_keypair,
    serialize_public_key,
    sign_challenge,
    verify_proof,
)

__version__ = "0.1.2"
__all__ = [
    "IDENTITY_DOMAIN",
    "derive_agent_id",
    "generate_keypair",
    "serialize_public_key",
    "sign_challenge",
    "verify_proof",
]
