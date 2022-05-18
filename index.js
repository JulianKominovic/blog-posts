import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import lunr from "lunr";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fastify = Fastify({ logger: true });

let cachedIndexer = undefined;
const getIndexer = async () => {
  if (cachedIndexer) return cachedIndexer;

  const indexerData = await fs.readFile(__dirname + "static/indexer.json", {
    encoding: "utf-8",
  });

  cachedIndexer = lunr.Index.load(JSON.parse(indexerData));
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

  reply.send(
    index.query(function (q) {
      q.term("*" + request.query.q + "*");
    })
  );
});

// Run the server!
fastify.listen(process.env.PORT || 3000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
