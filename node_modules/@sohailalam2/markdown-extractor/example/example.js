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

const abstract = content['#abstract'];
const preferredQualifications = content['#preferred-qualifications'].split('\n');
const perks = content['#perks'];

console.log('******************************');
console.log(markdown);
console.log('******************************');
console.log(html);
console.log('******************************');
console.log(metadata);
console.log('******************************');
console.log(abstract);
console.log('******************************');
console.log(preferredQualifications);
console.log('******************************');
console.log(perks);
console.log('******************************');
