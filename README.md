# PedigreeJS - Next.js Implementation

This is a [Next.js](https://nextjs.org) implementation of [pedigreejs](https://ccge-boadicea.github.io/pedigreejs/) - a JavaScript library for drawing pedigree diagrams.

## About

This project is based on the original [PedigreeJS library](https://github.com/CCGE-BOADICEA/pedigreejs) developed by the Centre for Cancer Genetic Epidemiology (CCGE) at the University of Cambridge. We have adapted and modernized it for use with Next.js and React 19.

## Repository

- **This Next.js Implementation**: [https://github.com/SenusaBio/pedigreejs-nextjs](https://github.com/SenusaBio/pedigreejs-nextjs)
- **Chart Generator Branch**: `generate-chart` - Enhanced version with chart generation features
- **Original PedigreeJS Library**: [https://github.com/CCGE-BOADICEA/pedigreejs](https://github.com/CCGE-BOADICEA/pedigreejs)
- **Original React Example**: [https://github.com/CCGE-BOADICEA/pedigreejs-react-app](https://github.com/CCGE-BOADICEA/pedigreejs-react-app)

## Features

- **Next.js 15.5.4** with App Router
- **React 19.1.0** with TypeScript support
- **Tailwind CSS v4** for styling
- **D3.js v7** for data visualization
- **jQuery v3** for DOM manipulation
- **Client-side rendering** for pedigreejs compatibility
- **Dynamic imports** to avoid SSR issues
- **Chart Generator** - Generate pedigree charts from JSON data

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
pedigreejs-nextjs/
├── app/
│   ├── globals.css          # Global styles including pedigree CSS
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page component
├── components/
│   └── PedigreeJS.tsx       # PedigreeJS React component
├── lib/
│   └── pedigreejs.es.v4.0.0-rc1.js  # PedigreeJS library
├── next.config.ts           # Next.js configuration
└── package.json             # Dependencies and scripts
```

## Key Implementation Details

### Client-Side Rendering
The pedigreejs library requires browser APIs (DOM, localStorage, etc.), so the component uses:
- `'use client'` directive
- Dynamic imports with `ssr: false`
- Conditional rendering based on `typeof window`

### Library Integration
- D3.js and jQuery are imported dynamically and made available globally
- The pedigreejs ES module is imported client-side only
- Webpack configuration handles external library fallbacks

### Styling
- Global CSS includes all pedigree-specific styles
- Tailwind CSS is configured for additional utility classes
- Responsive design with mobile-friendly dimensions

## Differences from React+Vite Version

| Feature | React+Vite | Next.js |
|---------|------------|---------|
| Framework | Vite + React 18 | Next.js 15 + React 19 |
| Rendering | Client-side only | SSR with client-side hydration |
| Routing | React Router (if needed) | Next.js App Router |
| Styling | CSS imports | Global CSS + Tailwind |
| Build Tool | Vite | Next.js with Turbopack |
| TypeScript | Optional | Built-in support |

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

This project is licensed under the **GNU General Public License v3.0 or later (GPL-3.0-or-later)** to maintain compatibility with the original PedigreeJS library.

### License Compliance

This implementation incorporates and is based on:
- **PedigreeJS Library** © 2023 University of Cambridge
- **SPDX-License-Identifier**: GPL-3.0-or-later
- **Original Repository**: https://github.com/CCGE-BOADICEA/pedigreejs

As required by the GPL license:
- Source code is freely available
- Modifications are clearly marked
- Same license terms apply to derivative works
- No warranty is provided

See the [LICENSE](./LICENSE) file for the complete license text.

## Credits

This implementation is built upon the excellent work of:

- **Original PedigreeJS Library**: © 2023 University of Cambridge, Centre for Cancer Genetic Epidemiology (CCGE)
- **License**: GPL-3.0-or-later
- **Authors**: CCGE-BOADICEA team

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [PedigreeJS Documentation](https://ccge-boadicea.github.io/pedigreejs/) - learn about the pedigree library
- [Original PedigreeJS Repository](https://github.com/CCGE-BOADICEA/pedigreejs) - source code and documentation
- [React Documentation](https://react.dev/) - learn about React
- [TypeScript Documentation](https://www.typescriptlang.org/) - learn about TypeScript

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.