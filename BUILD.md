# Building PedigreeJS

## Current Status
The file `lib/pedigreejs.es.v3.0.0-rc8.js` is a pre-built ES module from the original PedigreeJS repository.

## To Build from Source

1. **Clone original repository:**
```bash
git clone https://github.com/CCGE-BOADICEA/pedigreejs.git
cd pedigreejs
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the library:**
```bash
npm run build
```

4. **Copy the built file:**
```bash
# The built file will be in dist/ folder
cp dist/pedigreejs.es.js ../pedigreejs-nextjs/lib/pedigreejs.es.v3.0.0-rc8.js
```

## Build Tools Used by Original Project
- **Rollup** - Module bundler
- **Babel** - JavaScript compiler
- **ESLint** - Code linting
- **Terser** - Code minification

## File Structure
```
pedigreejs/
├── src/           # Source code
├── dist/          # Built files
├── rollup.config.js
├── package.json
└── README.md
```

## Notes
- The current file is already optimized and minified
- Contains all necessary dependencies bundled
- Compatible with ES6+ module systems
- Includes source maps for debugging