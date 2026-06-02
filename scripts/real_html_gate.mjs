#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const WORK = path.join(ROOT, ".tmp", "real-html-gate");
const SOURCE = path.join(WORK, "source");
const STORE = path.join(WORK, "store");
const VERSION = "24.16.0";
const RELEASE_URL = `https://nodejs.org/download/release/v${VERSION}/docs/api`;
const PAGES = [
  "async_context.html",
  "diagnostics_channel.html",
  "globals.html",
  "stream.html",
];

const CASES = [
  {
    name: "async context snapshot",
    args: ["node-html", "AsyncLocalStorage.snapshot", "context"],
    expectedDoc: "node-html@24.16.0/async_context",
    expectedHeading: /AsyncLocalStorage\.snapshot/,
  },
  {
    name: "diagnostics tracing subscribers",
    args: ["node-html", "diagnostics_channel", "tracingChannel", "hasSubscribers"],
    expectedDoc: "node-html@24.16.0/diagnostics_channel",
    expectedHeading: /tracingChannel\.hasSubscribers/,
  },
  {
    name: "abort timeout signal",
    args: ["node-html", "AbortSignal", "timeout", "signal"],
    expectedDoc: "node-html@24.16.0/globals",
    expectedHeading: /AbortSignal\.timeout/,
  },
];

async function main() {
  await fs.rm(WORK, { recursive: true, force: true });
  await fs.mkdir(SOURCE, { recursive: true });

  for (const page of PAGES) {
    const url = `${RELEASE_URL}/${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    await fs.writeFile(path.join(SOURCE, page), await response.text());
  }

  runOpenDocu(["import-html", "node-html", VERSION, SOURCE, "--url-base", RELEASE_URL]);
  runOpenDocu(["index"]);
  const doctor = runOpenDocu(["doctor"]).stdout;

  const results = [];
  for (const testCase of CASES) {
    const payload = JSON.parse(
      runOpenDocu([
        "search",
        ...testCase.args,
        "--version",
        VERSION,
        "--limit",
        "1",
        "--json",
      ]).stdout,
    );
    const top = payload.results[0];
    if (!top) {
      throw new Error(`${testCase.name}: no results`);
    }
    if (top.doc_id !== testCase.expectedDoc) {
      throw new Error(`${testCase.name}: expected ${testCase.expectedDoc}, got ${top.doc_id}`);
    }
    if (!testCase.expectedHeading.test(top.heading)) {
      throw new Error(`${testCase.name}: unexpected heading ${top.heading}`);
    }
    if (!top.url.startsWith(RELEASE_URL)) {
      throw new Error(`${testCase.name}: non-versioned source URL ${top.url}`);
    }
    results.push({
      name: testCase.name,
      doc_id: top.doc_id,
      heading: top.heading,
      url: top.url,
      count: payload.count,
    });
  }

  console.log(
    JSON.stringify(
      {
        corpus: {
          source: RELEASE_URL,
          format: "html",
          pages: PAGES,
        },
        doctor,
        cases: results,
      },
      null,
      2,
    ),
  );
}

function runOpenDocu(args) {
  return run("node", [path.join(ROOT, "bin", "opendocu.mjs"), ...args], {
    env: { ...process.env, OPENDOCU_HOME: STORE },
  });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    env: options.env || process.env,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
