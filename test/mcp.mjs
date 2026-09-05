import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const env = {};
const rpc = (body) =>
 worker.fetch(
  new Request("https://m/mcp", {
   method: "POST",
   headers: { "content-type": "application/json" },
   body: JSON.stringify(body),
  }),
  env,
 );

test("initialize + tools/list", async () => {
 const init = await (await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })).json();
 assert.equal(init.result.serverInfo.name, "field-notes");
 const list = await (await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })).json();
 assert.deepEqual(
  list.result.tools.map((t) => t.name).sort(),
  ["board_read", "board_wait", "board_write"],
 );
});

test("protocol errors", async () => {
 const bad = await (await rpc({ jsonrpc: "2.0", id: 3, method: "nope", params: {} })).json();
 assert.equal(bad.error.code, -32601);
 const tool = await (
  await rpc({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "nope", arguments: {} } })
 ).json();
 assert.equal(tool.error.code, -32602);
 const get = await worker.fetch(new Request("https://m/mcp"), env);
 assert.equal(get.status, 405);
});

test("live read-through", async () => {
 const read = await (
  await rpc({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "board_read", arguments: { path: "threads" } } })
 ).json();
 assert.match(read.result.content[0].text, /replies|no threads yet/);
});
