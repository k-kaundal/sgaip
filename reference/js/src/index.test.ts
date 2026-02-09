import test from "node:test";
import assert from "node:assert";
import { generateKeyPair } from "../src/keys.js";
import { deriveAID } from "../src/identity.js";
import { sign, verify } from "../src/proof.js";

test("Key Generation", async (t) => {
  await t.test("generateKeyPair returns both keys", () => {
    const { publicKey, privateKey } = generateKeyPair();
    assert.ok(publicKey instanceof Buffer);
    assert.ok(privateKey instanceof Buffer);
    assert.strictEqual(publicKey.length, 91); // SPKI DER encoding
    assert.strictEqual(privateKey.length, 48); // PKCS8 DER encoding
  });
});

test("Identity Derivation", async (t) => {
  await t.test("deriveAID is deterministic", () => {
    const { publicKey } = generateKeyPair();
    const aid1 = deriveAID(publicKey);
    const aid2 = deriveAID(publicKey);
    assert.strictEqual(aid1, aid2);
  });

  await t.test("deriveAID returns 64-char hex string", () => {
    const { publicKey } = generateKeyPair();
    const aid = deriveAID(publicKey);
    assert.strictEqual(typeof aid, "string");
    assert.strictEqual(aid.length, 64);
    assert.match(aid, /^[0-9a-f]+$/);
  });
});

test("Proof Protocol", async (t) => {
  await t.test("sign and verify roundtrip", () => {
    const { publicKey, privateKey } = generateKeyPair();
    const data = Buffer.from("test-message");

    const signature = sign(privateKey, data);
    assert.ok(signature instanceof Buffer);
    assert.strictEqual(signature.length, 64); // Ed25519 signature

    const isValid = verify(publicKey, data, signature);
    assert.strictEqual(isValid, true);
  });

  await t.test("verify fails with wrong data", () => {
    const { publicKey, privateKey } = generateKeyPair();
    const data = Buffer.from("test-message");
    const wrongData = Buffer.from("wrong-message");

    const signature = sign(privateKey, data);
    const isValid = verify(publicKey, wrongData, signature);
    assert.strictEqual(isValid, false);
  });

  await t.test("verify fails with wrong public key", () => {
    const { publicKey: pk1, privateKey: sk1 } = generateKeyPair();
    const { publicKey: pk2 } = generateKeyPair();
    const data = Buffer.from("test-message");

    const signature = sign(sk1, data);
    const isValid = verify(pk2, data, signature);
    assert.strictEqual(isValid, false);
  });
});
