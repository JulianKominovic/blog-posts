import { fileURLToPath } from "url";
import fs from "fs/promises";
import { parseMarkdown } from "@sohailalam2/markdown-extractor";

import MiniSearch from "minisearch";
import { JSDOM } from "jsdom";
import headings from "./building/utils/headings.mjs";
import markdown from "./building/utils/markdown.mjs";
import searchingIndexConfig from "./building/search-engine/config.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const commonTags = {};
const commonPostTags = {};

const buildIndexer = (blogs) => {
  const miniSearch = new MiniSearch(searchingIndexConfig);

  miniSearch.addAll(blogs);
  return miniSearch;
};

const buildTags = (tagsBag, tags, filename) => {
  tags.forEach((tag) => {
    const formattedTag = tag.toUpperCase().replace(/ /gi, "_").trim();
    if (tagsBag[formattedTag] === undefined)
      tagsBag[formattedTag] = {
        matches: 0,
        posts: [],
        icon: `/icons/${formattedTag}.svg`,
      };
    tagsBag[formattedTag] = {
      matches: tagsBag[formattedTag].matches + 1,
      posts: [...tagsBag[formattedTag].posts, filename],
      icon: `/icons/${formattedTag}.svg`,
    };
  });
};

const compileFile = async (file) => {
  const data = await fs.readFile(__dirname + "static/posts/" + file, "utf8");

  const { metadata } = parseMarkdown(data);

  const html = markdown.render(data);
  await fs.writeFile(
    __dirname +
      "static/posts/" +
      file.slice(0, file.lastIndexOf(".")) +
      ".html",
    html,
    { encoding: "utf8", flag: "w" }
  );

  await fs.writeFile(
    __dirname +
      "static/posts/" +
      file.slice(0, file.lastIndexOf(".")) +
      ".json",
    JSON.stringify(metadata),
    { encoding: "utf8", flag: "w" }
  );

  //   INDEXING HEADINGS

  const headingElements = {};

  const dom = new JSDOM(html);

  headings.forEach((h) => {
    dom.window.document.querySelectorAll(h).forEach((item) => {
      if (headingElements[h] === undefined) headingElements[h] = [];
      headingElements[h].push(item.textContent);
    });
  });

  if (metadata.tags)
    buildTags(commonTags, metadata.tags, file.slice(0, file.lastIndexOf(".")));

  if (metadata.postTags)
    buildTags(
      commonPostTags,
      metadata.postTags,
      file.slice(0, file.lastIndexOf("."))
    );

  return {
    metadata,
    ...metadata,
    file: file.slice(0, file.lastIndexOf(".")),
    body: data,
    ...headingElements,
  };
};

const build = async () => {
  const files = await fs.readdir(__dirname + "static/posts/");

  const onlyMarkdownFiles = files.filter(
    (file) => file.slice(file.lastIndexOf(".")) === ".md"
  );

  const blogs = await Promise.all(
    onlyMarkdownFiles.map((file) => compileFile(file))
  );

  const blogsKeyValue = {};
  blogs.forEach((blog) => {
    blogsKeyValue[blog.file] = blog.metadata;
  });

  console.log("BLOGS");
  await fs.writeFile(
    __dirname + "static/indexer.json",
    JSON.stringify(buildIndexer(blogs).toJSON())
  );
  await fs.writeFile(
    __dirname + "static/blogs.json",
    JSON.stringify(blogsKeyValue)
  );

  console.log("COMMON TAGS");
  console.log(commonTags);
  await fs.writeFile(
    __dirname + "static/most-common-tags.json",
    JSON.stringify(commonTags)
  );
  console.log("COMMON POST TAGS");
  console.log(commonPostTags);
  await fs.writeFile(
    __dirname + "static/most-common-posts-tags.json",
    JSON.stringify(commonPostTags)
  );
};

build()
  .then(() => {
    console.log("SUCCESS!");
  })
  .catch((err) => {
    console.log("ERROR");
    console.log(err);
  });
