import { build, context } from "esbuild";
import fs from "node:fs/promises";
import { tailwindEsbuildPlugin } from "./scripts/tailwind-plugin.js";

const isWatch = process.argv.includes("--watch") || process.argv.includes("-w");
const isAnalyze =
  process.argv.includes("--analyze") || process.argv.includes("-a");
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
  metafile: isAnalyze ? true : false,
  plugins: [tailwindEsbuildPlugin],
};

/** @type {import('esbuild').BuildOptions} */
const workersEsmBundle = {
  platform: "node",
  ...commonBuildOptions,
  format: "esm",
  entryPoints: ["src/client/scripts/game-worker.ts"],
  outdir: "dist/client",
  packages: "external",
};

if (!isSkipPrebuild) {
  await fs.rm(outPath, { recursive: true, force: true });
  await fs.mkdir(outPath, { recursive: true });
  await fs.cp(publicPath, clientPath, { recursive: true });
}

const bundles = [nodeEsmBundles, browserEsmBundle, workersEsmBundle];

if (isWatch) {
  const serverContext = await context(nodeEsmBundles);
  const clientContext = await context(browserEsmBundle);
  const workersContext = await context(workersEsmBundle);

  await serverContext.watch();
  await clientContext.watch();
  await workersContext.watch();
  await clientContext.serve({
    port: 8000,
    host: "localhost",
    servedir: "dist/client",
  });
} else {
  await Promise.all(
    bundles.map(async (bundle, i) => {
      const result = await build(bundle);
      // Create a metafile if metafile is enabled
      if (isAnalyze && result.metafile) {
        fs.writeFile(`meta${i}.json`, JSON.stringify(result.metafile));
      }
      return result;
    })
  );
}
