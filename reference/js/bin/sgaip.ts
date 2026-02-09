#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { parseArgs } from "util";
import { deriveAID } from "../src/identity.js";
import { generateKeyPair } from "../src/keys.js";
import { sign, verify } from "../src/proof.js";

interface CommandContext {
  args: Record<string, unknown>;
  positionals: string[];
}

function showUsage(): void {
  console.log(`
SGAIP CLI

Global installation allows running: sgaip <command> [options]

Commands:
  keygen              Generate a new SGAIP identity keypair
  sign                Sign a message or file
  verify              Verify a signature offline

For help on a command: sgaip <command> --help
`);
}

async function cmdKeygen(ctx: CommandContext): Promise<void> {
  const privateFile = (ctx.args.private as string) || "agent.sk";
  const publicFile = (ctx.args.public as string) || "agent.pk";

  const { publicKey, privateKey } = generateKeyPair();

  fs.writeFileSync(privateFile, privateKey);
  fs.writeFileSync(publicFile, publicKey);

  const aid = deriveAID(publicKey);
  console.log("Key pair generated:");
  console.log("  Private key:", privateFile);
  console.log("  Public key:", publicFile);
  console.log("  Agent ID:", aid);
}

async function cmdSign(ctx: CommandContext): Promise<void> {
  const privateFile = ctx.args.private as string;
  if (!privateFile) {
    throw new Error("--private is required");
  }

  const messageStr = ctx.args.message as string | undefined;
  const fileArg = ctx.args.file as string | undefined;

  let data: Buffer;
  if (messageStr) {
    data = Buffer.from(messageStr);
  } else if (fileArg) {
    data = fs.readFileSync(fileArg);
  } else {
    throw new Error("Either --message or --file is required");
  }

  const privateKey = fs.readFileSync(privateFile);
  const signature = sign(privateKey, data);

  const outFile = (ctx.args.out as string) || "signature.bin";
  fs.writeFileSync(outFile, signature);

  console.log("Signature written to:", outFile);
}

async function cmdVerify(ctx: CommandContext): Promise<void> {
  const publicFile = ctx.args.public as string;
  const signatureFile = ctx.args.signature as string;

  if (!publicFile) throw new Error("--public is required");
  if (!signatureFile) throw new Error("--signature is required");

  const messageStr = ctx.args.message as string | undefined;
  const fileArg = ctx.args.file as string | undefined;

  let data: Buffer;
  if (messageStr) {
    data = Buffer.from(messageStr);
  } else if (fileArg) {
    data = fs.readFileSync(fileArg);
  } else {
    throw new Error("Either --message or --file is required");
  }

  const publicKey = fs.readFileSync(publicFile);
  const signature = fs.readFileSync(signatureFile);

  const isValid = verify(publicKey, data, signature);

  if (isValid) {
    console.log("✅ Signature valid");
    console.log("Derived Agent ID:", deriveAID(publicKey));
  } else {
    console.error("❌ Signature invalid");
    process.exit(2);
  }
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    options: {
      private: { type: "string" },
      public: { type: "string" },
      message: { type: "string" },
      file: { type: "string" },
      out: { type: "string" },
      signature: { type: "string" },
      help: { type: "boolean", short: "h" }
    },
    strict: true,
    allowPositionals: true
  });

  const cmd = positionals[0];

  if (!cmd || values.help) {
    showUsage();
    if (values.help && !cmd) process.exit(0);
    if (!cmd) process.exit(1);
    return;
  }

  const ctx: CommandContext = {
    args: values,
    positionals: positionals.slice(1)
  };

  try {
    switch (cmd) {
      case "keygen":
        await cmdKeygen(ctx);
        break;
      case "sign":
        await cmdSign(ctx);
        break;
      case "verify":
        await cmdVerify(ctx);
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
        showUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(2);
});
