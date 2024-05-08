import fs from 'node:fs';

const chokidar = require('chokidar');

// One-liner for current directory
const watcher = chokidar.watch('./src', {
   persistent: true, // Keep watching until explicitly stopped
});
const change = (data: any) => {
   console.log(`File ${data} change`);
   buildWithExternals();
};
watcher
   .on('add', change)
   .on('change', change)
   .on('unlink', change)
   .on('error', change);
function getExternalsFromPackageJson() {
   const packageJson = JSON.parse(fs.readFileSync('./package.json') as any);

   const sections = ['dependencies', 'devDependencies', 'peerDependencies'],
      externals = new Set();

   for (const section of sections)
      if (packageJson[section])
         Object.keys(packageJson[section]).forEach((_) => externals.add(_));

   //console.log('externals', externals); //If you want to see externals then uncomment this

   return Array.from(externals);
}

async function buildWithExternals(): Promise<void> {
   const externalDeps = getExternalsFromPackageJson();

   await Bun.build({
      entrypoints: ['./src/index.ts'],
      outdir: './build',
      target: 'node',
      external: externalDeps as any,
      root: './src',
   });
}
