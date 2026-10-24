import fs from "node:fs";
import path from "node:path";
const root = process.cwd(),
  base = "/kioskflow-rescue/";
const index = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
const scripts = [
  ...index.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g),
].map((x) => x[1]);
const styles = [...index.matchAll(/<link[^>]+href="([^"]+\.css)"[^>]*>/g)].map(
  (x) => x[1],
);
const asset = (url, relativeTo = base) => {
  const resolved = new URL(url, `http://demo.invalid${relativeTo}`);
  if (
    resolved.origin !== "http://demo.invalid" ||
    !resolved.pathname.startsWith(base)
  )
    throw Error("Asset boundary mismatch");
  const file = path.resolve(
    root,
    "dist",
    decodeURIComponent(resolved.pathname.slice(base.length)),
  );
  if (!file.startsWith(path.join(root, "dist") + path.sep))
    throw Error("Asset traversal rejected");
  return file;
};
if (scripts.length !== 1 || styles.length < 1)
  throw Error("Expected one app bundle and CSS");
const embeddedStyles = styles
  .map((url) =>
    fs
      .readFileSync(asset(url), "utf8")
      .replace(/url\((['"]?)([^'"\)]+)\1\)/g, (whole, quote, src) => {
        if (src.startsWith("data:") || src.startsWith("#")) return whole;
        const file = asset(src, url);
        const types = {
          ".woff2": "font/woff2",
          ".png": "image/png",
          ".svg": "image/svg+xml",
        };
        const mime = types[path.extname(file)];
        if (!mime) throw Error("Unsupported portable asset");
        return `url("data:${mime};base64,${fs.readFileSync(file).toString("base64")}")`;
      }),
  )
  .join("\n");
const license = fs
  .readFileSync(path.join(root, "public/fonts/OFL-Pretendard.txt"), "utf8")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");
let html = index
  .replace(/<script[^>]+src="[^"]+"[^>]*><\/script>/g, "")
  .replace(/<link[^>]+href="[^"]+\.css"[^>]*>/g, "");
html = html
  .replace(
    "</head>",
    `<style>${embeddedStyles}</style><template id="pretendard-ofl-license">${license}</template></head>`,
  )
  .replace(
    "</body>",
    `<script type="module">${fs.readFileSync(asset(scripts[0]), "utf8").replaceAll("</script", "<\\/script")}</script></body>`,
  );
if (/<script[^>]+src=/.test(html) || /<link[^>]+href="\//.test(html))
  throw Error("Unexpected external asset");
const urls = [...embeddedStyles.matchAll(/url\((['"]?)([^'"\)]+)\1\)/g)].map(
  (x) => x[2],
);
if (urls.some((u) => !u.startsWith("data:") && !u.startsWith("#")))
  throw Error("Unembedded CSS asset");
html = html.replace(/[ \t]+$/gm, "");
const output = path.join(root, "deliverables/kioskflow-rescue-standalone.html");
fs.writeFileSync(output, html);
console.log(
  `Standalone: ${Buffer.byteLength(html)} bytes; embedded JS/CSS/local Pretendard font; OFL license included; no external runtime assets or APIs.`,
);
