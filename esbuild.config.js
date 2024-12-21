import { build, context } from "esbuild";
import fs from "node:fs/promises";

const isWatch = process.argv.includes("--watch") || process.argv.includes("-w");
const isSkipPrebuild =
  process.argv.includes("--skipPrebuild") || process.argv.includes("-spb");
const isProductionEnv =
  process.argv.includes("--production") || process.argv.includes("-p");
const outPath = new URL("dist/", import.meta.url);
const clientPath = new URL("dist/client", import.meta.url);
const publicPath = new URL("public/", import.meta.url);

/** @type {import('esbuild').BuildOptions} */
const commonBuildOptions = {
  logLevel: "info",
  color: true,
  outdir: "dist",
  legalComments: "none",
  bundle: true,
  target: "es2022",
  loader: {
    ".png": "file",
    ".jpeg": "file",
    ".jpg": "file",
    ".svg": "file",
    ".mp3": "file",
    ".gltf": "file",
    ".webp": "file",
  },
  minify: isProductionEnv,
  sourcemap: !isProductionEnv,
};

/** @type {import('esbuild').BuildOptions} */
const nodeEsmBundles = {
  platform: "node",
  ...commonBuildOptions,
  format: "esm",
  entryPoints: ["src/server/index.ts"],
  outdir: "dist/server",
  packages: "external",
};

/** @type {import('esbuild').BuildOptions} */
const browserEsmBundle = {
  ...commonBuildOptions,
  format: "esm",
  entryPoints: ["src/client/index.tsx"],
  outdir: "dist/client",
  define: {
    "process.env.NODE_ENV": isProductionEnv ? '"production"' : '"development"',
  },
};

if (!isSkipPrebuild) {
  await fs.rm(outPath, { recursive: true, force: true });
  await fs.mkdir(outPath, { recursive: true });
  await fs.cp(publicPath, clientPath, { recursive: true });
}

const bundles = [nodeEsmBundles, browserEsmBundle];

if (isWatch) {
  const serverContext = await context(nodeEsmBundles);
  const clientContext = await context(browserEsmBundle);

  await serverContext.watch();
  await clientContext.watch();
  await clientContext.serve({
    port: 8000,
    host: "localhost",
    servedir: "dist/client",
  });
} else {
  await Promise.all(bundles.map((bundle) => build(bundle)));
}
