import { fileURLToPath } from "url";
import fs from "fs/promises";
import { parseMarkdown } from "@sohailalam2/markdown-extractor";
import lunr from "lunr";
import MarkdownIt from "markdown-it";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const md = new MarkdownIt();

const buildIndexer = (blogs) => {
  return lunr(function () {
    this.ref("file");

    this.field("title");
    this.field("description");
    this.field("tags");
    this.field("body");
    this.field("h1Elements");
    this.field("h2Elements");
    this.field("h3Elements");

    blogs.forEach((blog) => {
      this.add(blog);
    });
  });
};

const compileFile = async (file) => {
  const data = await fs.readFile(__dirname + "static/posts/" + file, "utf8");

  const { html, metadata } = parseMarkdown(data);

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
  console.log(md.parse(data));
  const htmlParsedElements = md.parse(data);
  const h1Elements = [];
  const h2Elements = [];
  const h3Elements = [];

  htmlParsedElements.forEach((element) => {
    if (element.tag === "h1") {
      h1Elements.push(element.content);
    }
    if (element.tag === "h2") {
      h2Elements.push(element.content);
    }
    if (element.tag === "h3") {
      h3Elements.push(element.content);
    }
  });

  return {
    metadata,
    file: file.slice(0, file.lastIndexOf(".")),
    body: data,
    h1Elements,
    h2Elements,
    h3Elements,
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
  console.log(blogsKeyValue);
  await fs.writeFile(
    __dirname + "static/indexer.json",
    JSON.stringify(buildIndexer(blogs).toJSON())
  );
  await fs.writeFile(
    __dirname + "static/blogs.json",
    JSON.stringify(blogsKeyValue)
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
