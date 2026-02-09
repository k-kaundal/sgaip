#!/usr/bin/env python3
"""SGAIP package CLI — installs as `sgaip` via console_scripts."""

import argparse
from pathlib import Path
from cryptography.hazmat.primitives.asymmetric.ed25519 import (
    Ed25519PrivateKey,
    Ed25519PublicKey,
)
from cryptography.hazmat.primitives import serialization

from .core import (
    derive_agent_id,
    generate_keypair,
    serialize_public_key,
    sign_challenge,
    verify_proof,
)


def _write_keypair(private_key: Ed25519PrivateKey, public_key: Ed25519PublicKey, private_path: Path, public_path: Path):
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    )

    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )

    private_path.write_bytes(private_bytes)
    public_path.write_bytes(public_bytes)


def _load_private(path: Path) -> Ed25519PrivateKey:
    return Ed25519PrivateKey.from_private_bytes(path.read_bytes())


def _load_public_bytes(path: Path) -> bytes:
    return path.read_bytes()


def cmd_keygen(args):
    sk, pk = generate_keypair()
    private_path = Path(args.private)
    public_path = Path(args.public)
    _write_keypair(sk, pk, private_path, public_path)

    aid = derive_agent_id(serialize_public_key(pk))
    print("Key pair generated:")
    print(f"  Private key: {private_path}")
    print(f"  Public key: {public_path}")
    print(f"  Agent ID: {aid}")


def cmd_sign(args):
    if not args.message and not args.file:
        raise SystemExit("Error: either --message or --file is required")
    
    if args.message and args.file:
        raise SystemExit("Error: cannot specify both --message and --file")
    
    private_path = Path(args.private)
    sk = _load_private(private_path)

    if args.message:
        data = args.message.encode()
    else:
        data = Path(args.file).read_bytes()

    sig = sign_challenge(sk, data)
    Path(args.out).write_bytes(sig)
    print(f"Signature written to {args.out}")


def cmd_verify(args):
    if not args.message and not args.file:
        raise SystemExit("Error: either --message or --file is required")
    
    if args.message and args.file:
        raise SystemExit("Error: cannot specify both --message and --file")
    
    public_bytes = _load_public_bytes(Path(args.public))
    if args.message:
        data = args.message.encode()
    else:
        data = Path(args.file).read_bytes()

    signature = Path(args.signature).read_bytes()

    try:
        ok = verify_proof(public_bytes, data, signature, expected_aid=None)
    except Exception as e:
        print(f"Verification failed: {e}")
        raise SystemExit(2)

    if ok:
        print("✅ Signature valid")
        print(f"Derived Agent ID: {derive_agent_id(public_bytes)}")
    else:
        print("❌ Signature invalid")
        raise SystemExit(2)


def main(argv=None):
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

    args = parser.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
