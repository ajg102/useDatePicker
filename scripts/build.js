import { build } from "esbuild";

const main = async () => {
  const sharedOptions = {
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: "browser",
    target: "es2019",
    entryPoints: ["src/index.ts"],
    external: ["react", "react-dom", "date-fns"],
  };
  await build({
    format: "cjs",
    outfile: "dist/index.cjs",
    ...sharedOptions,
  });
  await build({
    format: "esm",
    outfile: "dist/index.esm.js",
    ...sharedOptions,
  });
};

main();
