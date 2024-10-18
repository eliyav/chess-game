import { build, context } from "esbuild";
import fs from "node:fs/promises";

// "esbuild src/client/index.tsx --bundle --outdir=dist/client --target=es2022  --format=esm --sourcemap",
//     "build:server": "esbuild src/server/index.ts --bundle --outdir=dist/server --packages=external --platform=node --sourcemap --format=esm",

const isWatch = process.argv.includes("--watch") || process.argv.includes("-w");
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
  minify: !isWatch,
  sourcemap: isWatch,
  define: {
    "process.env.NODE_ENV": isWatch ? '"development"' : '"production"',
  },
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
};

await fs.rm(outPath, { recursive: true, force: true });
await fs.mkdir(outPath, { recursive: true });
await fs.cp(publicPath, clientPath, { recursive: true });

const bundles = [nodeEsmBundles, browserEsmBundle];

if (isWatch) {
  const buildContexts = await Promise.all(
    bundles.map((bundle) => context(bundle))
  );
  await Promise.all(buildContexts.map((context) => context.watch()));
} else {
  await Promise.all(bundles.map((bundle) => build(bundle)));
}
