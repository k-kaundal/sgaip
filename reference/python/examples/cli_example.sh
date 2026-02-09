#!/bin/bash
# SGAIP Python CLI Example and Test Script
# This script demonstrates all CLI functionality:
# - Key generation
# - Message signing
# - File signing
# - Signature verification

set -e

echo "=========================================="
echo "SGAIP Python CLI - Complete Example"
echo "=========================================="
echo

# Create temporary directory for example files
EXAMPLE_DIR=$(mktemp -d)
echo "Working directory: $EXAMPLE_DIR"
cd "$EXAMPLE_DIR"
echo

# ===== 1. GENERATE KEYPAIR =====
echo "1️⃣  Generate Keypair"
echo "---"
sgaip keygen --private agent.sk --public agent.pk
echo

# ===== 2. SIGN A MESSAGE =====
echo "2️⃣  Sign a Message"
echo "---"
echo "Signing: 'Hello, SGAIP!'"
sgaip sign --private agent.sk --message 'Hello, SGAIP!' --out msg.sig
echo

# ===== 3. VERIFY MESSAGE SIGNATURE =====
echo "3️⃣  Verify Message Signature"
echo "---"
echo "Verifying signature for: 'Hello, SGAIP!'"
sgaip verify --public agent.pk --signature msg.sig --message 'Hello, SGAIP!'
echo

# ===== 4. CREATE AND SIGN A FILE =====
echo "4️⃣  Create and Sign a File"
echo "---"
cat > data.txt << 'EOF'
This is a test file for SGAIP signature verification.
It demonstrates offline cryptographic identity proofs.
SGAIP enables stateless, verifiable agent identities.
EOF

echo "File contents:"
cat data.txt
echo
echo "Signing file..."
sgaip sign --private agent.sk --file data.txt --out data.sig
echo

# ===== 5. VERIFY FILE SIGNATURE =====
echo "5️⃣  Verify File Signature"
echo "---"
sgaip verify --public agent.pk --signature data.sig --file data.txt
echo

# ===== 6. DEMONSTRATE VERIFICATION FAILURE =====
echo "6️⃣  Demonstrate Failed Verification (modified message)"
echo "---"
echo "Attempting to verify signature with wrong message..."
sgaip verify --public agent.pk --signature msg.sig --message 'Wrong message!' 2>&1 || echo "✅ Correctly rejected!"
echo

# ===== 7. DISPLAY KEY CONTENTS =====
echo "7️⃣  Key Material (Raw Hex)"
echo "---"
echo "Private key (32 bytes):"
xxd -p agent.sk | tr -d '\n'
echo
echo

echo "Public key (32 bytes):"
xxd -p agent.pk | tr -d '\n'
echo
echo

# ===== CLEANUP =====
echo "=========================================="
echo "✅ All examples completed successfully!"
echo "=========================================="
echo "Temporary files in: $EXAMPLE_DIR"
echo "To clean up: rm -rf $EXAMPLE_DIR"
