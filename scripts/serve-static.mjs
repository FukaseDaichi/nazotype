import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const args = process.argv.slice(2);
const OPTION_NAMES = new Set(["--host", "-H", "--port", "-p"]);

if (args.includes("--help") || args.includes("-h")) {
  console.log("Usage: npm run start -- [outDir] [--host HOST] [--port PORT]");
  process.exit(0);
}

function readOption(names, fallback) {
  for (const name of names) {
    const index = args.indexOf(name);
    if (index >= 0 && args[index + 1]) {
      return args[index + 1];
    }
  }
  return fallback;
}

function readPositional(fallback) {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (OPTION_NAMES.has(arg)) {
      index += 1;
      continue;
    }
    if (!arg.startsWith("-")) {
      return arg;
    }
  }
  return fallback;
}

const positional = readPositional("out");
const root = path.resolve(process.cwd(), positional);
const host = readOption(["--host", "-H"], process.env.HOST ?? "127.0.0.1");
const port = Number(readOption(["--port", "-p"], process.env.PORT ?? "3000"));

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  console.error(`Invalid port: ${port}`);
  process.exit(1);
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveFile(requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split("?")[0] || "/");
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requested = path.resolve(root, `.${normalizedPath}`);

  const relativePath = path.relative(root, requested);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  const candidates = [requested];
  if (path.extname(requested) === "") {
    candidates.push(path.join(requested, "index.html"));
    candidates.push(`${requested}.html`);
  }

  for (const candidate of candidates) {
    if (!(await pathExists(candidate))) {
      continue;
    }

    const candidateStat = await stat(candidate);
    if (candidateStat.isDirectory()) {
      const indexPath = path.join(candidate, "index.html");
      if (await pathExists(indexPath)) {
        return indexPath;
      }
      continue;
    }

    if (candidateStat.isFile()) {
      return candidate;
    }
  }

  const notFoundPath = path.join(root, "404.html");
  return (await pathExists(notFoundPath)) ? notFoundPath : null;
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const filePath = await resolveFile(requestUrl.pathname);

    if (!filePath) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not Found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const statusCode = path.basename(filePath) === "404.html" && requestUrl.pathname !== "/404.html" ? 404 : 200;

    response.writeHead(statusCode, {
      "cache-control": "no-store",
      "content-type": MIME_TYPES[extension] ?? "application/octet-stream",
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://${host}:${port}/`);
});
