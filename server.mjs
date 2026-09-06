import http from "node:http";
import handler from "./src/index.js";

const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const url = `http://localhost:${port}${req.url}`;
  const r = await handler.fetch(new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) }), {});
  res.writeHead(r.status, Object.fromEntries(r.headers.entries()));
  res.end(Buffer.from(await r.arrayBuffer()));
});
server.listen(port, () => console.log(`field-notes-mcp on :${port}`));
