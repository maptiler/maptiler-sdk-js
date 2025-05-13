import { resolve } from 'path';
import { defineConfig } from 'vite';
import packagejson from "./package.json";
import { readdirSync } from 'fs';

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

const entrypoints = readdirSync(resolve(__dirname, 'demos/public')).filter((file) => {
  return file.endsWith('.html');
}).reduce((entries, file) => {
  // const file = path.

  const camelKey = file
    .replace(/\.html$/, '')
    .replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    .replace(/([0-9])/g, '')


  const key = camelKey.charAt(0).toUpperCase() + camelKey.slice(1);
  const entry = file
  return {
    ...entries,
    [key]: entry,
  }
}, {})

// console.log('Demos being server from:', Object.values(entrypoints).map((entry) => entry).join('\n'));

export default defineConfig({
  mode: "development",
  root: "./demos",
  build: {
    minify: false,
    sourcemap: true,
    rollupOptions: {
      input: entrypoints,
    },
  },
  define: {
    __MT_SDK_VERSION__: JSON.stringify(packagejson.version),
  },
  plugins: [
    {
      name: 'url-override',
      /**
       * Changing logged URLs to include the path to the demo directory.
       */
      configureServer: (server) => {
        const port = server.config.server.port
        const urls = Object.values(entrypoints).map((entry) => {
          return `http://localhost:${port}/${entry}`
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
      }
    }
  ],
});
