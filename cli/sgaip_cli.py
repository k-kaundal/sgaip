#!/usr/bin/env python3
"""
SGAIP CLI Tool
Stateless Global Agent Identity Protocol
Reference command-line interface

This is a reference CLI for:
- key generation
- Agent Identity derivation
- signing challenges or messages
- offline verification

Not production software.
"""

import argparse
import hashlib
import os
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)
from cryptography.hazmat.primitives import serialization

IDENTITY_DOMAIN = b"SGAIP-v1"

# ------------------------------------------------------------------
# Core helpers
# ------------------------------------------------------------------

def derive_aid(public_key_bytes: bytes) -> str:
    return hashlib.sha256(public_key_bytes + IDENTITY_DOMAIN).hexdigest()


def load_private_key(path: str) -> Ed25519PrivateKey:
    with open(path, "rb") as f:
        return Ed25519PrivateKey.from_private_bytes(f.read())


def load_public_key(path: str) -> Ed25519PublicKey:
    with open(path, "rb") as f:
        return Ed25519PublicKey.from_public_bytes(f.read())

# ------------------------------------------------------------------
# Commands
# ------------------------------------------------------------------

def cmd_keygen(args):
    sk = Ed25519PrivateKey.generate()
    pk = sk.public_key()

    with open(args.private, "wb") as f:
        f.write(sk.private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption(),
        ))

    with open(args.public, "wb") as f:
        f.write(pk.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw,
        ))

    aid = derive_aid(pk.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    ))

    print("Key pair generated")
    print("Agent ID (AID):", aid)


def cmd_sign(args):
    sk = load_private_key(args.private)

    data = args.message.encode() if args.message else open(args.file, "rb").read()
    sig = sk.sign(data)

    with open(args.out, "wb") as f:
        f.write(sig)

    print("Signature written to", args.out)


def cmd_verify(args):
    pk = load_public_key(args.public)

    data = args.message.encode() if args.message else open(args.file, "rb").read()
    signature = open(args.signature, "rb").read()

    pk.verify(signature, data)

    aid = derive_aid(pk.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    ))

    print("✅ Signature valid")
    print("Derived Agent ID:", aid)

# ------------------------------------------------------------------
# CLI definition
# ------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="SGAIP reference CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p_keygen = sub.add_parser("keygen", help="Generate a new SGAIP key pair")
    p_keygen.add_argument("--private", default="agent.sk")
    p_keygen.add_argument("--public", default="agent.pk")
    p_keygen.set_defaults(func=cmd_keygen)

    p_sign = sub.add_parser("sign", help="Sign a message or file")
    p_sign.add_argument("--private", required=True)
    p_sign.add_argument("--message")
    p_sign.add_argument("--file")
    p_sign.add_argument("--out", default="signature.bin")
    p_sign.set_defaults(func=cmd_sign)

    p_verify = sub.add_parser("verify", help="Verify signature offline")
    p_verify.add_argument("--public", required=True)
    p_verify.add_argument("--signature", required=True)
    p_verify.add_argument("--message")
    p_verify.add_argument("--file")
    p_verify.set_defaults(func=cmd_verify)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
