import fs from "node:fs";
import path from "node:path";
const root = process.cwd(),
  index = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
const scripts = [
  ...index.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g),
].map((x) => x[1]);
const styles = [...index.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)].map(
  (x) => x[1],
);
const load = (url) => {
  const relative = url.replace(/^\/kioskflow-rescue\//, "");
  const file = path.resolve(root, "dist", relative);
  if (!file.startsWith(path.join(root, "dist") + path.sep))
    throw Error("Asset boundary mismatch");
  return fs.readFileSync(file, "utf8");
};
if (scripts.length !== 1 || styles.length < 1)
  throw Error("Expected one app bundle and CSS");
let html = index
  .replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/g, "")
  .replace(/<link[^>]+href="[^"]+\.css"[^>]*>/g, "");
html = html
  .replace("</head>", `<style>${styles.map(load).join("\n")}</style></head>`)
  .replace(
    "</body>",
    `<script type="module">${load(scripts[0]).replaceAll("</script", "<\\/script")}</script></body>`,
  );
if (/<script[^>]+src=/.test(html) || /<link[^>]+href="\//.test(html))
  throw Error("Unexpected external asset");
const output = path.join(root, "deliverables/kioskflow-rescue-standalone.html");
fs.writeFileSync(output, html);
console.log(
  `Standalone generated: ${Buffer.byteLength(html)} bytes; embedded JS/CSS; no server or API needed.`,
);
