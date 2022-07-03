import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import MiniSearch from "minisearch";
import fastifyCors from "@fastify/cors";
import searchingIndexConfig from "./building/search-engine/config.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const fastify = Fastify({ logger: true });

let cachedIndexer = undefined;
let cachedPosts = undefined;
let cachedCommonTags = undefined;
let cachedCommonPostTags = undefined;

const getIndexer = async () => {
  if (cachedIndexer) return cachedIndexer;

  const indexerData = await fs.readFile(__dirname + "static/indexer.json", {
    encoding: "utf-8",
  });

  cachedIndexer = MiniSearch.loadJSON(indexerData, searchingIndexConfig);
  return cachedIndexer;
};

const getPosts = async () => {
  if (cachedPosts) return cachedPosts;
  const postsData = await fs.readFile(__dirname + "static/blogs.json", {
    encoding: "utf-8",
  });

  cachedPosts = JSON.parse(postsData);
  return cachedPosts;
};

const getCommonTags = async () => {
  if (cachedCommonTags) return cachedCommonTags;
  const commonTags = await fs.readFile(
    __dirname + "static/most-common-tags.json",
    {
      encoding: "utf-8",
    }
  );

  cachedCommonTags = JSON.parse(commonTags);
  return cachedCommonTags;
};

const getCommonPostTags = async () => {
  if (cachedCommonPostTags) return cachedCommonPostTags;
  const commonTags = await fs.readFile(
    __dirname + "static/most-common-posts-tags.json",
    {
      encoding: "utf-8",
    }
  );

  cachedCommonPostTags = JSON.parse(commonTags);
  return cachedCommonPostTags;
};

//REGISTERS
//STATIC FILES
fastify.register(fastifyStatic, {
  root: path.join(__dirname, "static"),
});
//CORS
fastify.register(fastifyCors, {
  origin: "*",
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

fastify.get("/posts", async function (request, reply) {
  const posts = await getPosts();

  reply.header("Access-Control-Allow-Origin", "*");

  console.log("QUERYS");
  console.log(request.query.tags);
  if (request.query.tags) {
    const queryTags = request.query.tags.split(",");

    const formattedRequestTagArray = queryTags.map((t) =>
      t.trim().toUpperCase()
    );

    const tags = await getCommonTags();
    const posts = await getPosts();

    const filesToSend = {};
    formattedRequestTagArray.forEach((item) => {
      tags[item]?.posts.forEach((post) => (filesToSend[post] = posts[post]));
    });

    reply.send(filesToSend);
  } else {
    reply.send(posts);
  }
});
fastify.get("/common-tags", async function (request, reply) {
  const tags = await getCommonTags();
  const objectSorted = Object.entries(tags).sort(
    (tag, nextTag) => tag.matches > nextTag.matches
  );
  const finalObject = objectSorted.map(([key, value]) => {
    return {
      key,
      icon: value.icon,
    };
  });
  reply.header("Access-Control-Allow-Origin", "*");

  reply.send(finalObject);
});
fastify.get("/common-post-tags", async function (request, reply) {
  const tags = await getCommonPostTags();
  const objectSorted = Object.entries(tags).sort(
    (tag, nextTag) => tag.matches > nextTag.matches
  );
  const finalObject = objectSorted.map(([key, value]) => {
    return {
      key,
      icon: value.icon,
    };
  });
  reply.header("Access-Control-Allow-Origin", "*");

  reply.send(finalObject);
});

fastify.get("/", async function (request, reply) {
  reply.status(200).send({
    "health-check": "OK",
  });
});

// Run the server!
fastify.listen(process.env.PORT || 4000, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
