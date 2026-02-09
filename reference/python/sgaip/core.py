# SGAIP Reference Implementation (Python)
# Stateless Global Agent Identity Protocol
# This is a minimal, readable reference implementation.
# It is NOT production code.

from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)
from cryptography.hazmat.primitives import serialization
import hashlib
import os

# -------------------------------------------------------------------
# Protocol Constants
# -------------------------------------------------------------------

IDENTITY_DOMAIN = b"SGAIP-v1"

# -------------------------------------------------------------------
# Identity Derivation
# -------------------------------------------------------------------

def derive_agent_id(public_key_bytes: bytes) -> str:
    """
    Derive a deterministic Agent Identity (AID) from public key bytes.
    """
    return hashlib.sha256(public_key_bytes + IDENTITY_DOMAIN).hexdigest()

# -------------------------------------------------------------------
# Key Management
# -------------------------------------------------------------------

def generate_keypair():
    """
    Generate a new Ed25519 keypair.
    """
    private_key = Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    return private_key, public_key


def serialize_public_key(public_key: Ed25519PublicKey) -> bytes:
    """
    Serialize public key to canonical bytes.
    """
    return public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )

# -------------------------------------------------------------------
# Identity Proof (Challenge–Response)
# -------------------------------------------------------------------

def sign_challenge(private_key: Ed25519PrivateKey, challenge: bytes) -> bytes:
    """
    Sign a verifier-provided challenge.
    """
    return private_key.sign(challenge)


def verify_proof(
    public_key_bytes: bytes,
    challenge: bytes,
    signature: bytes,
    expected_aid: str | None = None,
) -> bool:
    """
    Verify an identity proof offline.
    """
    public_key = Ed25519PublicKey.from_public_bytes(public_key_bytes)

    # Verify signature
    public_key.verify(signature, challenge)

    # Derive Agent Identity
    derived_aid = derive_agent_id(public_key_bytes)

    if expected_aid is not None:
        return derived_aid == expected_aid

    return True

# -------------------------------------------------------------------
# Example Usage (Offline)
# -------------------------------------------------------------------

if __name__ == "__main__":
    # Agent creates identity
    sk, pk = generate_keypair()
    pk_bytes = serialize_public_key(pk)
    aid = derive_agent_id(pk_bytes)

    print("Agent ID:", aid)

    # Verifier creates challenge (offline)
    challenge = os.urandom(32)

    # Agent signs challenge
    signature = sign_challenge(sk, challenge)

    # Verifier verifies proof
    result = verify_proof(pk_bytes, challenge, signature, expected_aid=aid)

    if result:
        print("✅ Identity verified offline")
    else:
        print("❌ Identity verification failed")
