import { dirname, resolve } from 'path';
import { defineConfig } from 'vite';
import { defineBuildConstants } from "./vite.shared";
import { readdirSync, readFileSync } from 'fs';

function green(text: string) {
  return `\x1b[32m${text}\x1b[0m`;
}

function yellow(text: string) {
  return `\x1b[33m${text}\x1b[0m`;
}

function d(text: string) {
  return `\x1b[0m${text}\x1b[0m`;
}

function purple(text: string) {
  return `\x1b[35m${text}\x1b[0m`;
}

function centerText(text: string, lineLength: number) {
  // strip ansi codes from the text
  const stripped = text.replace(/\x1b\[[0-9;]*m/g, '');
  const ansiCodes = text.match(/\x1b\[[0-9;]*m/g) || [];
  const diff = lineLength - stripped.length;
  const leftPadding = Math.floor(diff / 2);
  const rightPadding = diff - leftPadding;
  const left = ' '.repeat(leftPadding);
  const right = ' '.repeat(rightPadding - 1);
  return `${left}${ansiCodes}${text}${right}`;
}

const demosDir = resolve(__dirname, 'demos');
const demoTypes = ['example', 'showcase', 'playground'];
const demoTypeHeadings: Record<string, string> = { example: 'examples', showcase: 'showcases', playground: 'playgrounds' };

// Every demo is a folder holding an `index.html` and a `meta.json`, see the "In-repo demos" section of the README
function findDemos() {
  return readdirSync(demosDir, { recursive: true, encoding: 'utf8' })
    .filter((file) => /^(examples|showcases|playgrounds)\/.*meta\.json$/.test(file.replaceAll('\\', '/')))
    .map((file) => {
      const { title, type } = JSON.parse(readFileSync(resolve(demosDir, file), 'utf8')) as { title: string; type: string };
      return { title, type, path: dirname(file).replaceAll('\\', '/') };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

const entrypoints = Object.fromEntries([
  ['index', resolve(demosDir, 'index.html')],
  ...findDemos().map(({ path }) => [path, resolve(demosDir, path, 'index.html')]),
]);

export default defineConfig({
  mode: "development",
  root: "./demos",
  // `.env.local` (e.g. `VITE_MAPTILER_API_KEY`) is read from the root of the repo, not from `demos`
  envDir: __dirname,
  // A link to a demo that doesn't exist (anymore) gets a 404, instead of silently serving the home page
  appType: "mpa",
  resolve: {
    alias: [
      // The demos use the shipped Vite helper like customers do, but against the SDK source (no build needed):
      // the helper's own `import ... from "@maptiler/sdk"` then resolves to `src`, so there's a single SDK instance.
      { find: /^@maptiler\/sdk\/vite-worker$/, replacement: resolve(__dirname, 'bundler-helpers/vite-worker.mjs') },
      { find: /^@maptiler\/sdk$/, replacement: resolve(__dirname, 'src/index.ts') },
    ],
  },
  build: {
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: entrypoints,
    },
  },
  define: defineBuildConstants("dev"),
  plugins: [
    {
      name: 'demos-favicon',
      /**
       * Adds the MapTiler favicon to every page, so it isn't one more thing to copy into each demo's `index.html`.
       */
      transformIndexHtml: () => [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '16x16' }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' }, injectTo: 'head' },
      ],
    },
    {
      name: 'demos-list',
      /**
       * Fills the home page from the metadata, so there's no second list of demos to maintain.
       * The metadata is read on every request, so demos added or moved while the server runs are listed.
       */
      transformIndexHtml: (html) => {
        if (!html.includes('<!-- demos-list -->')) return html;
        const demos = findDemos();
        const sections = demoTypes.map((type) => {
          const items = demos.filter((demo) => demo.type === type).flatMap(({ path, title }, i, list) => {
            const link = `<a href="/${path}/">${title} →</a>`;
            // Examples are grouped by topic folder (`examples/<topic>/<name>`), headed when the topic changes
            if (type !== 'example') return [link];
            const topic = path.split('/')[1];
            const isNewTopic = i === 0 || list[i - 1].path.split('/')[1] !== topic;
            return isNewTopic ? [`<h3>${topic.replaceAll('-', ' ')}</h3>`, link] : [link];
          });
          return `<section class="column">\n<h2>${demoTypeHeadings[type]}</h2>\n${items.join('\n')}\n</section>`;
        });
        return html.replace('<!-- demos-list -->', `<div class="columns">\n${sections.join('\n')}\n</div>`);
      },
    },
    {
      name: 'url-override',
      /**
       * Changing logged URLs to include the path to the demo directory.
       */
      configureServer: (server) => {
        const port = server.config.server.port
        const urls = findDemos().map(({ path }) => {
          return `http://localhost:${port}/${path}/`
        })
        const lineLength = Math.max(...urls.map((entry) => entry.length)) + 4
        console.log('\n')
        console.log('┏' + '━'.repeat(lineLength) + '┓')
        console.info(`┃` + ' '.repeat(lineLength) + '┃')
        console.info('┃' + yellow(centerText(`** MapTiler SDK JS **`, lineLength)) + ' ┃')
        console.info('┃' + purple(centerText(`** Demos **`, lineLength)) + ' ┃')
        console.info(`┃` + ' '.repeat(lineLength) + '┃')
        urls.map((entry) => {
          return `${d('┃')} - ${entry}`
        }, []).forEach((entry, _, arr) => {
          const numCharactersToPad = Math.max(...arr.map((entry) => entry.length)) - entry.length
          const padding = ' '.repeat(numCharactersToPad)
          const output = green(entry) + padding + ' ┃'
          console.log(output)
        })
        console.log('┗' + '━'.repeat(lineLength) + '┛')

        console.log('\n')

        // `server.config.env` holds the `VITE_` variables loaded from `envDir`
        if (!server.config.env.VITE_MAPTILER_API_KEY) {
          console.warn(yellow('⚠ No MapTiler API key set. The demos will need one: add `VITE_MAPTILER_API_KEY=<key>` to `.env.local` at the root of the repo (then restart the dev server), or open a demo with `?key=<key>` once to store it in the browser.'))
          console.log('\n')
        }
      }
    }
  ],
});
