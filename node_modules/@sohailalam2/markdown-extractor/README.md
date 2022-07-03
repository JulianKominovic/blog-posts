# Markdown Extractor 🔣

[![npm](https://badgen.net/npm/v/@sohailalam2/markdown-extractor?icon=npm)](https://www.npmjs.com/package/@sohailalam2/markdown-extractor)
[![github actions](https://github.com/sohailalam2/markdown-extractor/workflows/Build%20&%20Test/badge.svg?branch=master)](https://github.com/sohailalam2/markdown-extractor/actions)
[![gzip size](https://badgen.net/badgesize/gzip/https://cdn.jsdelivr.net/npm/@sohailalam2/markdown-extractor/dist/bundle.min.js)](https://cdn.jsdelivr.net/npm/@sohailalam2/markdown-extractor/dist/bundle.min.js)
[![install size](https://badgen.net/packagephobia/install/@sohailalam2/markdown-extractor?icon=packagephobia)](https://packagephobia.now.sh/result?p=@sohailalam2/markdown-extractor)
[![snyk](https://snyk.io/test/npm/@sohailalam2/markdown-extractor/badge.svg)](https://snyk.io/test/npm/@sohailalam2/markdown-extractor)

## 📝 Description

Your one stop for parsing Markdown content. Give your markdown superpower by adding metadata.

## 🔧 Features

- Parse markdown content. We use [marked](https://github.com/markedjs/marked)
- Extract YAML metadata information about your markdown content. We use [js-yaml](https://github.com/nodeca/js-yaml)
- Convert markdown to HTML and easily extract data from DOM nodes by passing selectors. We use [cheerio](https://github.com/cheeriojs/cheerio)
- Support for both NodeJS and Browser
- Browser standalone package also available at `dist/bundle.min.js`

## 💡 How does it work?

For example,

```md
---
title: Awesome Markdown Extractor
id: 101
---

# Abstract

Lorem ipsum dolor...
```

would be parsed as

```js
{
  metadata: {
    title: "Awesome Markdown Extractor",
    id: 101
  },
  content: {
    abstract: 'Abstract'
  },
  html: "<h1>Abstract</h1>...."
}
```

## 📝 Prerequisites

NodeJs v12 or above. May work on lower version but not tested.

## 💻 Installation

```bash
$ npm install @sohailalam2/markdown-extractor
```

## ✅ Usage

Check [`example`](./example) for more information.

Given the sample markdown content, lets see how we can parse it and extract the metadata information

```md
---
title: Backend Engineer
id: 101
locations: [India, Remote]
department: Engineering
publishDate: 2020-06-27T13:53:26.714Z
tags: [NodeJs, AWS, Serverless, TypeScript]
isDraft: true
---

# Backend Engineer

## Abstract

This is the awesome _abstract_ for the **backend engineering** role. Visit https://github.com to checkout our brand and some amazing content.

## Preferred Qualifications

- AWS experience
- Serverless experience

## Perks

- Industry standard salary
- Awesome team
- Freedom and responsibilities

## Other Details

This is an **amazing** opportunity for _budding engineers_. Apply now!!
```

```js
const fs = require('fs');
const path = require('path');

const { parseMarkdown } = require('../dist');

const markdown = fs.readFileSync(path.join(__dirname, 'job-backend-engineer.md'), 'utf8');

const options = {
  selectors: [
    { selector: '#abstract', parseHtml: true },
    { selector: '#preferred-qualifications' },
    { selector: '#perks', parseHtml: true },
  ],
};

const { metadata, content, html } = parseMarkdown(markdown, options);

// metadata:
//
// {
//   title: 'Backend Engineer',
//   id: 101,
//   locations: [ 'India', 'Remote' ],
//   department: 'Engineering',
//   publishDate: 2020-06-27T13:53:26.714Z,
//   tags: [ 'NodeJs', 'AWS', 'Serverless', 'TypeScript' ],
//   isDraft: true
// }

const abstract = content['#abstract'];
// <p>This is the awesome <em>abstract</em> for the <strong>backend engineering</strong> role. Visit <a href="https://github.com">https://github.com</a> to checkout our brand and some amazing content.</p>

const preferredQualifications = content['#preferred-qualifications'].split('\n');
// [ 'AWS experience', 'Serverless experience' ]

const perks = content['#perks'];

// <ul>
// <li>Industry standard salary</li>
// <li>Awesome team</li>
// <li>Freedom and responsibilities</li>
// </ul>
```

## Standalone library in browser

```html
<script src="../dist/bundle.min.js"></script>

<script>
  // ...

  const { metadata, content, html } = MarkdownExtractor.parseMarkdown(markdown, options);

  // ...
</script>
```

## 📌 Links

- [`Changelog`](./CHANGELOG.md)
- [`Contributing`](./CONTRIBUTING.md)
- [Annotated code documentation](https://sohailalam2.github.io/markdown-extractor/)
- [Test Coverage](https://sohailalam2.github.io/markdown-extractor/tests/coverage/lcov-report)
- [Allure Report](https://sohailalam2.github.io/markdown-extractor/tests/report)
