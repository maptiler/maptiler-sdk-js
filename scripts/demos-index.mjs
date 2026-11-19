/**
 * Validates the metadata of the demos and writes the index of public demos to the root README.
 * With `--check`, nothing is written and the script fails if the index is out of date.
 * See the "In-repo demos" section of the README for the structure and the metadata format.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DEMOS_DIR = join(ROOT, "demos");
const README_PATH = join(ROOT, "README.md");

// Top folders of `demos/` that hold demos, with the `type` of the demos they hold
const TYPE_BY_FOLDER = { examples: "example", showcases: "showcase", playgrounds: "playground" };
// Types of the demos listed in the README index; playgrounds are only listed on the `npm run dev` page
const PUBLIC_TYPES = ["example", "showcase"];
const INDEX_START = "<!-- demos-index:start -->";
const INDEX_END = "<!-- demos-index:end -->";
const VERSION_PATTERN = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const readme = readFileSync(README_PATH, "utf8");
const errors = [];

function readTopics() {
  const list = readme.match(/<!-- demo-topics:start -->([\s\S]*?)<!-- demo-topics:end -->/);
  if (!list) throw new Error("The list of topics was not found in the README");
  return new Set([...list[1].matchAll(/^- `([^`]+)`$/gm)].map((match) => match[1]));
}

function findDemoFolders() {
  const folders = Object.keys(TYPE_BY_FOLDER).flatMap((folder) =>
    readdirSync(join(DEMOS_DIR, folder), { recursive: true, encoding: "utf8" })
      .filter((file) => file === "index.html" || file === "main.ts" || file === "meta.json" || /[\\/](index\.html|main\.ts|meta\.json)$/.test(file))
      .map((file) => dirname(join(folder, file))),
  );
  return [...new Set(folders)].sort();
}

function validate(path, meta, topics) {
  const report = (message) => errors.push(`demos/${path}: ${message}`);
  const parts = path.split("/");
  const type = TYPE_BY_FOLDER[parts[0]];

  if (typeof meta.title !== "string" || !meta.title) report("`title` is required");
  if (typeof meta.description !== "string" || !meta.description) report("`description` is required");
  if (meta.type !== type) report(`\`type\` must be "${type}" in this folder`);
  if (parts.length !== (type === "example" ? 3 : 2)) report(`expected ${type === "example" ? "examples/<topic>/<name>" : `${parts[0]}/<name>`}`);

  if (!Array.isArray(meta.topics)) {
    report("`topics` must be an array");
  } else {
    if (meta.topics.length === 0 && type !== "playground") report("`topics` must not be empty");
    for (const topic of meta.topics) {
      if (!topics.has(topic)) report(`unknown topic "${topic}", see the list of topics in the README`);
    }
    if (type === "example" && meta.topics[0] !== parts[1]) report(`the first topic must be the folder name, "${parts[1]}"`);
  }

  if (!VERSION_PATTERN.test(meta.createdWith)) report("`createdWith` must be an SDK version");
  if ((meta.lastCheckedWith === null) !== (meta.lastCheckedOn === null)) report("`lastCheckedWith` and `lastCheckedOn` must be set together");
  if (meta.lastCheckedWith !== null && !VERSION_PATTERN.test(meta.lastCheckedWith)) report("`lastCheckedWith` must be an SDK version or null");
  if (meta.lastCheckedOn !== null && !DATE_PATTERN.test(meta.lastCheckedOn)) report("`lastCheckedOn` must be a YYYY-MM-DD date or null");
}

function readDemos() {
  const topics = readTopics();
  return findDemoFolders().flatMap((folder) => {
    const path = folder.split(sep).join("/");
    const missing = ["index.html", "main.ts", "meta.json"].filter((file) => !existsSync(join(DEMOS_DIR, folder, file)));
    if (missing.length > 0) {
      errors.push(`demos/${path}: missing ${missing.join(", ")}`);
      return [];
    }
    let meta;
    try {
      meta = JSON.parse(readFileSync(join(DEMOS_DIR, folder, "meta.json"), "utf8"));
    } catch (error) {
      errors.push(`demos/${path}: invalid meta.json, ${error.message}`);
      return [];
    }
    validate(path, meta, topics);
    return [{ path, ...meta }];
  });
}

function renderTable(demos) {
  const rows = demos.map(({ path, title, description, topics, createdWith, lastCheckedWith, lastCheckedOn }) => {
    const link = `[${title}](./${relative(ROOT, join(DEMOS_DIR, path)).split(sep).join("/")})`;
    const topicLabels = topics.map((topic) => `\`${topic}\``).join(" ");
    const checked = lastCheckedWith ? `${lastCheckedWith} (${lastCheckedOn})` : "Not yet";
    return `| ${link} | ${description} | ${topicLabels} | ${createdWith} | ${checked} |`;
  });
  return ["| Demo | Description | Topics | Created with | Last checked |", "| --- | --- | --- | --- | --- |", ...rows].join("\n");
}

function renderIndex(demos) {
  const publicDemos = demos.filter((demo) => PUBLIC_TYPES.includes(demo.type));
  const sections = [
    ["Examples", publicDemos.filter((demo) => demo.type === "example")],
    ["Showcases", publicDemos.filter((demo) => demo.type === "showcase")],
  ];
  return sections.map(([title, list]) => `#### ${title}\n\n${renderTable(list)}`).join("\n\n");
}

const demos = readDemos();
if (errors.length > 0) {
  console.error(`Invalid demo metadata:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

const start = readme.indexOf(INDEX_START);
const end = readme.indexOf(INDEX_END);
if (start === -1 || end === -1) throw new Error("The index markers were not found in the README");
const updated = `${readme.slice(0, start + INDEX_START.length)}\n${renderIndex(demos)}\n${readme.slice(end)}`;

if (process.argv.includes("--check")) {
  if (updated !== readme) {
    console.error("The demos index in the README is out of date. Run `npm run demos:index` and commit the result.");
    process.exit(1);
  }
  console.log("The demos index is up to date.");
} else {
  writeFileSync(README_PATH, updated);
  console.log(`Wrote ${demos.filter((demo) => PUBLIC_TYPES.includes(demo.type)).length} public demos to the README (${demos.length} in total).`);
}
