'use client';

import PedigreeJS from '../components/PedigreeJS';

function GitHubButton() {
  return (
    <a className="button" href="https://github.com/SenusaBio/pedigreejs-nextjs">
      View on GitHub
    </a>
  );
}

export default function Home() {
  return (
    <>
      <div className="header">
        <div className="container">
          <span>
            <GitHubButton />
            pedigreejs - Example Using Next.js
          </span>
        </div>
      </div>

      <div className="pedigree-controls">
        <input type="file" id="load" accept=".txt,.json" style={{display: 'none'}} />
        <button 
          id="load-btn" 
          className="control-btn"
          onClick={() => document.getElementById('load')?.click()}
        >
          Load
        </button>
        <button id="save" className="control-btn">Save</button>
        <button id="print" className="control-btn">Print</button>
        <button id="svg_download" className="control-btn">SVG</button>
        <button id="png_download" className="control-btn">PNG</button>
      </div>
      
      <PedigreeJS />
      
      <p>
        An example deployment of{' '}
        <a href="https://ccge-boadicea.github.io/pedigreejs/" target="_blank" rel="noopener noreferrer">
          pedigreejs
        </a>{' '}
        using{' '}
        <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">
          Next.js
        </a>{' '}
        and{' '}
        <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
          TypeScript
        </a>
        . The pedigreejs ES module bundle file is used (built in the pedigreejs project by
        running <i>&lsquo;npm run build-es&rsquo;</i>) in the Next.js App.
      </p>
    </>
  );
}