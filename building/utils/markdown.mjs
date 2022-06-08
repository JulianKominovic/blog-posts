import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import mdMeta from "markdown-it-meta";
import markdownItAnchor from "markdown-it-anchor";
const markdown = new MarkdownIt({
  html: false, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: false, // Convert '\n' in paragraphs into <br>
  langPrefix: "language-", // CSS language prefix for fenced blocks
  linkify: true, // autoconvert URL-like texts to links
  typographer: true, // Enable smartypants and other sweet transforms
  // options below are for demo only
  _highlight: true, // <= THIS IS WHAT YOU NEED
  _strict: false,
  _view: "html", // html / src / debug
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }

    return (
      '<pre class="hljs"><code>' +
      markdown.utils.escapeHtml(str) +
      "</code></pre>"
    );
  },
})
  .use(mdMeta)
  .use(markdownItAnchor);
export default markdown;
