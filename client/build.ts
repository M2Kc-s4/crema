import tailwindPlugin from "bun-plugin-tailwind";

await Bun.build({
    entrypoints: ["./client/src/app/index.html"],
    outdir: "./dist",
    minify: true,
    plugins: [tailwindPlugin],
})
