'use strict';

const
  frontMatter = require('front-matter'),
  Prism = require('./prism'),
  Remarkable = require('remarkable'),
  escapeHtml = require('remarkable/lib/common/utils').escapeHtml,
  md = new Remarkable();

function storeVariable(code, name) {
  return `{(store.${name} = ${code}, null)}`;
}

/**
 * Render a jsx code block
 * @param   {String}   code       - Raw html code
 */
function renderCodeBlock(code) {
  return `
    <div class="example">
      <div class="run">${code}</div>
    </div>
  `;
}

/**
 * Escape JSX for rendering cod3
 * @param   {String}   code       - Raw html code
 * @param   {String}   lang       - Language indicated in the code block
 * @param   {String}   langPrefix - Language prefix
 * @param   {Function} highlight  - Code highlight function
 * @returns {String}                Code block with souce and run code
 */
function escapeCodeBlock(code, lang, langPrefix, highlight) {
  let codeBlock = escapeHtml(code);

  if (highlight) {
    codeBlock = highlight(code, lang);
  }

  const langClass = !lang ? '' : `${langPrefix}${escape(lang, true)}`;

  codeBlock = codeBlock
    .replace(/{/g, '{"{"{')
    .replace(/}/g, '{"}"}')
    .replace(/{"{"{/g, '{"{"}')
    .replace(/(\n)/g, '{"\\n"}')
    .replace(/class=/g, 'className=');

  return `
    <div class="example">
      <div class="source">
        <pre><code${!langClass ? '' : ` class="${langClass}"`}>
          ${codeBlock}
        </code></pre>
      </div>
    </div>`;
}

/**
 * @typedef MarkdownObject
 * @type {Object}
 * @property {Object} attributes - Map of properties from the front matter
 * @property {String} body       - Markdown
 */

/**
 * @typedef HTMLObject
 * @type {Object}
 * @property {String} html    - HTML parsed from markdown
 * @property {Object} imports - Map of dependencies
 */

/**
 * Parse Markdown to HTML with code blocks
 * @param   {MarkdownObject} markdown - Markdown attributes and body
 * @returns {HTMLObject}                HTML and imports
 */
function parseMarkdown(markdown) {
  return new Promise((resolve, reject) => {
    let html;

    const options = {
      highlight(code, lang) {
        if (Prism.languages[lang]) {
          const language = Prism.languages[lang];
          return Prism.highlight(code, language);
        }
        return code
      },
      xhtmlOut: true
    };

    md.set(options);
    let store = {}

    md.renderer.rules.fence_custom.store = (tokens, idx, options) => {
      // gets tags applied to fence blocks ```store
      const codeTags = tokens[idx].params.split(/\s+/g);
      const name = codeTags[codeTags.length - 1]
      store[name] = tokens[idx].content
      return storeVariable(
        tokens[idx].content,
        name
      );
    };

    md.renderer.rules.fence_custom.render = (tokens, idx, options) => {
      // gets tags applied to fence blocks ```render
      const codeTags = tokens[idx].params.split(/\s+/g);
      return renderCodeBlock(
        tokens[idx].content
      );
    };

    md.renderer.rules.fence_custom.code = (tokens, idx, options) => {
      // gets tags applied to fence blocks ```code jsx
      const codeTags = tokens[idx].params.split(/\s+/g);
      return escapeCodeBlock(
        tokens[idx].content,
        codeTags[codeTags.length - 1],
        options.langPrefix,
        options.highlight
      );
    };
    md.renderer.rules.fence_custom.stored = (tokens, idx, options) => {
      // gets tags applied to fence blocks ```stored name jsx
      const codeTags = tokens[idx].params.split(/\s+/g);
      const language = codeTags[codeTags.length - 1]
      const stored = codeTags[codeTags.length - 2]
      return escapeCodeBlock(
        store[stored],
        language,
        options.langPrefix,
        options.highlight
      );
    };

    try {
      html = md.render(markdown.body);
      resolve({ html, attributes: markdown.attributes });
    } catch (err) {
      return reject(err);
    }

  });
}

/**
 * Extract FrontMatter from markdown
 * and return a separate object with keys
 * and a markdown body
 * @param   {String} markdown - Markdown string to be parsed
 * @returns {MarkdownObject}    Markdown attributes and body
 */
function parseFrontMatter(markdown) {
  return frontMatter(markdown);
}

/**
 * Parse markdown, extract the front matter
 * and return the body and imports
 * @param  {String} markdown - Markdown string to be parsed
 * @returns {HTMLObject}       HTML and imports
 */
function parse(markdown) {
  return parseMarkdown(parseFrontMatter(markdown));
}

module.exports = {
  renderCodeBlock,
  parse,
  parseFrontMatter,
  parseMarkdown
};
