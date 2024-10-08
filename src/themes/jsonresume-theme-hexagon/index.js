"use strict";
var fs = require("fs");
var path = require("path");
const moment = require("moment");
const marked = require("marked");
var Handlebars = require("handlebars");

const Mapper = require("./mapper.json");

Handlebars.registerHelper("md", (markdown = "") => {
  return marked.parse(markdown);
  return new Handlebars.SafeString(html);
});

Handlebars.registerHelper("lowercase", (text = "") => {
  return new Handlebars.SafeString(text.toLowerCase());
});

Handlebars.registerHelper("date", (date = "1970-01-01") => {
  return moment(date).format("MMM YYYY");
});

Handlebars.registerHelper("img64", (img) => {
  const b64 = fs.readFileSync(img, { encoding: "base64" });
  return `data:image/png;base64,${b64}`;
});

Handlebars.registerHelper("img64network", (network) => {
  const b64 = fs.readFileSync(`${network.toLowerCase()}.hex.png`, {
    encoding: "base64",
  });
  return `data:image/png;base64,${b64}`;
});

Handlebars.registerHelper("names", (text = "") => {
  var names = [];
  const [first, last] = text.split(" ");
  names.push(
    `<span class="firstName">${Handlebars.escapeExpression(first)}</span>`,
  );
  names.push(
    `<span class="lastName">${Handlebars.escapeExpression(last)}</span>`,
  );
  return new Handlebars.SafeString(names.join(" "));
});

Handlebars.registerHelper("levels", (level, options) => {
  let skills = "";
  if (typeof level === 'string') {
    switch (level.toLowerCase()) {
      case 'expert':
        level = 5;
        break;
      case 'master':
        level = 4;
        break;
      case 'proficient':
        level = 3;
        break;
      default:
        level = 0;
        break;
    }
  }
  for (let i = 1; i <= 5; ++i) skills += options.fn(i <= level ? "active" : "");
  return skills;
});

Handlebars.registerHelper('loud', function (aString) {
  return aString.toUpperCase();
});

Handlebars.registerHelper("skills", (skills, options) => {
  const mapper = {};
  Object.entries(Mapper.skills).forEach(([k, v = []]) => {
    v.forEach((s) => {
      mapper[s] = k;
    });
  });

  const sks = {};
  skills.forEach((sk) => {
    const grp =
      Object.entries(mapper).find(([n, _]) => sk.name.includes(n)) ?? undefined;
    if (grp === undefined) return;
    let values = sks[grp[1]] || "";
    values += options.fn({ name: (Array.isArray() ? sk.name.join(", ") : sk.name), level: sk.level });
    sks[grp[1]] = values;
  });

  let ret = "";
  Object.entries(sks)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(
      ([key, val]) =>
        (ret += `<div class="skill-group"><h5>${key}</h5> ${val}</div>`),
    );

  return ret;
});

Handlebars.registerHelper("tiny", (url = "", ...params) => {
  const [options, ...args] = params.reverse();
  const [numPaths = 1] = args;
  const [host, ...paths] = url.replace(/(http|https):\/\//i, "").split("/");
  return new Handlebars.SafeString(
    [host, ...paths.slice(0, numPaths)].join("/"),
  );
});

function render(resume) {
  var css = fs.readFileSync(__dirname + "/style.css", "utf-8");
  var tpl = fs.readFileSync(__dirname + "/resume.hbs", "utf-8");

  return Handlebars.compile(tpl)({ ...resume, _: { styles: css } });
}

module.exports = {
  render: render,
};



















