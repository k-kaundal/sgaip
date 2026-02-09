"""
Tests for SGAIP core module
"""

import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from sgaip.core import (
    derive_agent_id,
    generate_keypair,
    serialize_public_key,
    sign_challenge,
    verify_proof,
)


class TestKeyGeneration:
    def test_generate_keypair(self):
        """Test that generate_keypair returns valid key objects"""
        sk, pk = generate_keypair()
        assert sk is not None
        assert pk is not None
        assert isinstance(sk, Ed25519PrivateKey)

    def test_serialize_public_key(self):
        """Test that serialize_public_key produces 32-byte output"""
        sk, pk = generate_keypair()
        pk_bytes = serialize_public_key(pk)
        assert isinstance(pk_bytes, bytes)
        assert len(pk_bytes) == 32  # Ed25519 public keys are 32 bytes


class TestIdentityDerivation:
    def test_derive_agent_id_consistency(self):
        """Test that derive_agent_id is deterministic for the same input"""
        sk, pk = generate_keypair()
        pk_bytes = serialize_public_key(pk)

        aid1 = derive_agent_id(pk_bytes)
        aid2 = derive_agent_id(pk_bytes)

        assert aid1 == aid2

    def test_derive_agent_id_format(self):
        """Test that Agent ID is a hex string of length 64 (256-bit hash)"""
        sk, pk = generate_keypair()
        pk_bytes = serialize_public_key(pk)
        aid = derive_agent_id(pk_bytes)

        assert isinstance(aid, str)
        assert len(aid) == 64
        assert all(c in "0123456789abcdef" for c in aid)


class TestProofProtocol:
    def test_sign_and_verify(self):
        """Test basic signing and verification"""
        sk, pk = generate_keypair()
        pk_bytes = serialize_public_key(pk)
        challenge = b"test-challenge-123"

        signature = sign_challenge(sk, challenge)
        assert isinstance(signature, bytes)
        assert len(signature) == 64  # Ed25519 signatures are 64 bytes

        result = verify_proof(pk_bytes, challenge, signature)
        assert result is True

    def test_verify_with_wrong_challenge(self):
        """Test that verification fails with a different challenge"""
        sk, pk = generate_keypair()
        pk_bytes = serialize_public_key(pk)
        challenge = b"test-challenge-123"

        signature = sign_challenge(sk, challenge)
        wrong_challenge = b"wrong-challenge"

        with pytest.raises(Exception):
            verify_proof(pk_bytes, wrong_challenge, signature)

    def test_verify_with_expected_aid(self):
        """Test verification with expected Agent ID"""
        sk, pk = generate_keypair()
        pk_bytes = serialize_public_key(pk)
        aid = derive_agent_id(pk_bytes)
        challenge = b"test-challenge-123"

        signature = sign_challenge(sk, challenge)
        result = verify_proof(pk_bytes, challenge, signature, expected_aid=aid)
        assert result is True

    def test_verify_with_wrong_aid(self):
        """Test that verification fails with wrong expected Agent ID"""
        sk, pk = generate_keypair()
        pk_bytes = serialize_public_key(pk)
        challenge = b"test-challenge-123"
        wrong_aid = "0" * 64

        signature = sign_challenge(sk, challenge)
        result = verify_proof(pk_bytes, challenge, signature, expected_aid=wrong_aid)
        assert result is False
