import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import MiniSearch from "minisearch";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fastify = Fastify({ logger: true });

let cachedIndexer = undefined;
const getIndexer = async () => {
  if (cachedIndexer) return cachedIndexer;

  const indexerData = await fs.readFile(__dirname + "static/indexer.json", {
    encoding: "utf-8",
  });

  cachedIndexer = MiniSearch.loadJSON(indexerData, {
    idField: "file",
    fields: [
      "title",
      "description",
      "tags",
      "body",
      "h1Elements",
      "h2Elements",
      "h3Elements",
    ],
    storeFields: ["title", "file", "description"],
  });
  return cachedIndexer;
};

//STATIC FILES
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "static"),
});

// Declare a route
fastify.get("/search", async function (request, reply) {
  const index = await getIndexer();

  reply.header("Access-Control-Allow-Origin", "*");

  reply.send({
    autosuggest: index.autoSuggest(request.query.q),
    query: index.search(request.query.q),
  });
});

// Run the server!
fastify.listen(process.env.PORT || 3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
