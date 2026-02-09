#!/usr/bin/env python3
"""
SGAIP Python Library Example

This demonstrates the main API functions:
- generate_keypair() – Generate Ed25519 keypair
- serialize_public_key() – Serialize public key to bytes
- derive_agent_id() – Deterministic identity derivation
- sign_challenge() – Sign a challenge with private key
- verify_proof() – Verify identity proof offline
"""

from sgaip import (
    generate_keypair,
    serialize_public_key,
    derive_agent_id,
    sign_challenge,
    verify_proof,
)

def main():
    print("=" * 50)
    print("SGAIP Python Library - Example")
    print("=" * 50)
    print()

    # ===== 1. Generate keypair =====
    print("1. Generate Keypair")
    print("-" * 50)
    sk, pk = generate_keypair()
    print(f"Private key generated: {len(sk)} bytes")
    print(f"Public key generated: {len(pk)} bytes")
    print()

    # ===== 2. Serialize public key =====
    print("2. Serialize Public Key")
    print("-" * 50)
    pk_bytes = serialize_public_key(pk)
    print(f"Serialized: {pk_bytes.hex()}")
    print()

    # ===== 3. Derive Agent ID =====
    print("3. Derive Agent ID (Deterministic Identity)")
    print("-" * 50)
    aid = derive_agent_id(pk_bytes)
    print(f"Agent ID: {aid}")
    print(f"Length: {len(aid)} hex characters (256-bit hash)")
    print()

    # ===== 4. Sign challenge =====
    print("4. Sign Challenge with Private Key")
    print("-" * 50)
    challenge = b"test-challenge-data"
    signature = sign_challenge(sk, challenge)
    print(f"Challenge: {challenge.decode()}")
    print(f"Signature: {signature.hex()}")
    print(f"Signature length: {len(signature)} bytes (Ed25519)")
    print()

    # ===== 5. Verify proof =====
    print("5. Verify Proof Offline")
    print("-" * 50)
    is_valid = verify_proof(pk_bytes, challenge, signature)
    print(f"Signature valid: {is_valid}")
    print()

    # ===== 6. Verify with expected AID =====
    print("6. Verify Proof with Expected Agent ID")
    print("-" * 50)
    is_valid_with_aid = verify_proof(pk_bytes, challenge, signature, expected_aid=aid)
    print(f"Signature valid with expected AID: {is_valid_with_aid}")
    print()

    # ===== 7. Demonstrate failed verification =====
    print("7. Demonstrate Failed Verification (Wrong Challenge)")
    print("-" * 50)
    wrong_challenge = b"different-data"
    try:
        verify_proof(pk_bytes, wrong_challenge, signature)
        print("❌ Verification should have failed!")
    except Exception as e:
        print(f"✅ Correctly rejected: {type(e).__name__}")
    print()

    # ===== 8. Demonstrate failed verification with wrong AID =====
    print("8. Demonstrate Failed Verification (Wrong Expected AID)")
    print("-" * 50)
    wrong_aid = "0" * 64
    is_valid_wrong_aid = verify_proof(pk_bytes, challenge, signature, expected_aid=wrong_aid)
    print(f"Verification with wrong expected AID: {is_valid_wrong_aid}")
    print()

    print("=" * 50)
    print("✅ All examples completed successfully!")
    print("=" * 50)

if __name__ == "__main__":
    main()
