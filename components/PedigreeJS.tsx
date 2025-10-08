'use client';

import React, { useEffect, useRef, useState } from 'react';

// PedigreeJS Component
const PedigreeJSComponent: React.FC = () => {
  const pedigreeRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [jsonInput, setJsonInput] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentOpts, setCurrentOpts] = useState<any>(null);
  const [jsonError, setJsonError] = useState<string>('');

  useEffect(() => {
    const initializePedigree = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;

      try {
        // Import dependencies
        const d3 = await import('d3');
        const $ = (await import('jquery')).default;
        
        // Make jQuery available globally first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).d3 = d3;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).$ = $;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).jQuery = $;
        
        // Load jQuery UI from CDN
        if (!document.querySelector('script[src*="jquery-ui"]')) {
          const jqueryUIScript = document.createElement('script');
          jqueryUIScript.src = 'https://code.jquery.com/ui/1.13.2/jquery-ui.min.js';
          document.head.appendChild(jqueryUIScript);
          
          // Wait for jQuery UI to load
          await new Promise((resolve) => {
            jqueryUIScript.onload = resolve;
          });
        }

        // Import the pedigreejs library dynamically
        const pedigreeModule = await import('../lib/pedigreejs.es.v4.0.0-rc1');
        const { pedigreejs_pedcache } = pedigreeModule;

        // Auto-detect diseases from dataset
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const autoDetectDiseases = (dataset: any[]) => {
          const diseaseFields = new Set<string>();
          
          dataset.forEach(person => {
            Object.keys(person).forEach(key => {
              if (key.endsWith('_diagnosis_age') || key === 'affected') {
                diseaseFields.add(key.replace('_diagnosis_age', ''));
              }
              // Detect boolean disease fields
              if (person[key] === true && !key.endsWith('_diagnosis_age') && 
                  !['top_level', 'noparents', 'proband', 'stillbirth', 'miscarriage', 'termination', 'adopted_in', 'adopted_out'].includes(key)) {
                diseaseFields.add(key);
              }
            });
          });
          
          // Generate grayscale colors for diseases
          return Array.from(diseaseFields).map((disease, index) => {
            const grayValue = Math.floor(80 + (index * 30) % 100);
            return {
              type: disease,
              colour: `rgb(${grayValue}, ${grayValue}, ${grayValue})`
            };
          });
        };

        const w = window.innerWidth;
        const h = window.innerHeight;
        
        const opts = Object.freeze({
          'targetDiv': 'pedigreejs',
          'btn_target': 'pedigree_history',
          'width': (w > 800 ? 700 : w - 50),
          'height': h * 0.6,
          'symbol_size': 30,
          'font_size': '.75em',
          'edit': false,
          'showWidgets': false,
          'widgets': [],
          'readonly': true,
          'zoomIn': .5,
          'zoomOut': 1.5,
          'zoomSrc': ['wheel', 'button'],
          'labels': ['display_name', ['age', 'yob'], 'stillbirth', 'disease-list'],
          'diseases': [],
          'DEBUG': false
        });



        // Check for cached data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let finalOpts: any = { ...opts };
        let local_dataset;
        try {
          local_dataset = pedigreejs_pedcache.current(opts);
        } catch (error) {
          console.warn('Cache error, clearing cache:', error);
          localStorage.clear();
          local_dataset = null;
        }
        if (local_dataset !== undefined && local_dataset !== null) {
          finalOpts.dataset = local_dataset;
          // Auto-detect diseases from cached dataset
          const detectedDiseases = autoDetectDiseases(local_dataset);
          if (detectedDiseases.length > 0) {
            finalOpts.diseases = detectedDiseases;
          }
        } else {
          // Default simple family data
          const defaultData = [
            {"name":"m21","display_name":"father","sex":"M","top_level":true},
            {"name":"f21","display_name":"mother","sex":"F","top_level":true},
            {"name":"ch1","sex":"F","mother":"f21","father":"m21","proband":true,"status":"0","display_name":"child"}
          ];
          
          finalOpts.dataset = defaultData;
        }

        // Function to load data from file
        const loadDataFromFile = async (filename: string) => {
          try {
            const response = await fetch(`/${filename}`);
            const data = await response.json();
            
            // Auto-detect diseases from loaded data
            const detectedDiseases = autoDetectDiseases(data);
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newOpts: any = { ...opts, dataset: data };
            if (detectedDiseases.length > 0) {
              newOpts.diseases = detectedDiseases;
            }
            return newOpts;
          } catch (error) {
            console.warn('Could not load file:', filename, error);
            return false;
          }
        };

        // Try to load ped (35).txt if available
        const loadedOpts = await loadDataFromFile('ped (35).txt');
        if (loadedOpts) {
          finalOpts = loadedOpts;
        } else if (!local_dataset) {
          // Fallback to default data if no file and no cache
          console.log('Using default simple family data');
        }

        // Store opts for later use
        setCurrentOpts(finalOpts);

        // Initialize pedigree
        showPedigree(finalOpts);
        
        // Disable right-click context menu and handle wheel events on SVG canvas
        setTimeout(() => {
          const pedigreeContainer = document.getElementById('pedigreejs');
          if (pedigreeContainer) {
            pedigreeContainer.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              return false;
            });
            
            // Prevent page scroll, only allow zoom
            pedigreeContainer.addEventListener('wheel', (e) => {
              e.preventDefault();
            }, { passive: false });
          }
        }, 500);
        
        // Initialize buttons after pedigree is loaded
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pedModule = pedigreeModule as any;
          if (typeof pedModule.addButtons === 'function') {
            pedModule.addButtons(finalOpts);
          }
          if (typeof pedModule.addIO === 'function') {
            pedModule.addIO(finalOpts);
          }
        }, 100);

      } catch (error) {
        console.error('Error initializing pedigree:', error);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showPedigree = (opts: any) => {
      const p = document.getElementById("pedigreejs");
      const ped = document.getElementById("pedigree");
      if (!p && ped) {
        const newP = document.createElement('div');
        newP.id = 'pedigreejs';
        ped.appendChild(newP);
        pedigreejs_load(opts);
      }
    };

    initializePedigree();
  }, []);

  const formatJson = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return text;
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setJsonError('');
  };

  const highlightErrorLine = (errorMessage: string) => {
    const lineMatch = errorMessage.match(/line (\d+)/);
    if (lineMatch && textareaRef.current) {
      const lineNumber = parseInt(lineMatch[1]) - 1;
      const lines = jsonInput.split('\n');
      let position = 0;
      for (let i = 0; i < lineNumber && i < lines.length; i++) {
        position += lines[i].length + 1;
      }
      const lineEnd = position + (lines[lineNumber]?.length || 0);
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(position, lineEnd);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      textarea.value = newValue;
      textarea.selectionStart = textarea.selectionEnd = start + 2;
      setJsonInput(newValue);
    }
  };

  const handleJsonBlur = () => {
    if (jsonInput.trim() && jsonInput.length > 10) {
      try {
        JSON.parse(jsonInput);
        setJsonInput(formatJson(jsonInput));
        setJsonError('');
      } catch (error) {
        if (jsonInput.includes('{') && jsonInput.includes('}')) {
          setJsonError((error as Error).message);
          setTimeout(() => highlightErrorLine((error as Error).message), 100);
        }
      }
    }
  };

  const handleJsonPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedData = e.clipboardData.getData('text');
    if (pastedData.trim()) {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentValue = target.value;
      const newValue = currentValue.substring(0, start) + pastedData + currentValue.substring(end);
      const formatted = formatJson(newValue);
      target.value = formatted;
      setJsonInput(formatted);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + pastedData.length;
      }, 0);
    }
  };

  const loadJsonData = async () => {
    if (!jsonInput.trim() || !currentOpts) return;
    
    try {
      const data = JSON.parse(jsonInput);
      
      // Validate data is array
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of person objects');
      }
      
      // Validate required fields
      for (let i = 0; i < data.length; i++) {
        const person = data[i];
        if (!person.name) {
          throw new Error(`Person at index ${i} is missing required 'name' field`);
        }
        if (!person.sex || !['M', 'F', 'U'].includes(person.sex)) {
          throw new Error(`Person '${person.name}' has invalid or missing 'sex' field (must be M, F, or U)`);
        }
      }
      
      // Auto-detect diseases from loaded data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const autoDetectDiseases = (dataset: any[]) => {
        const diseaseFields = new Set<string>();
        
        dataset.forEach(person => {
          Object.keys(person).forEach(key => {
            if (key.endsWith('_diagnosis_age') || key === 'affected') {
              diseaseFields.add(key.replace('_diagnosis_age', ''));
            }
            if (person[key] === true && !key.endsWith('_diagnosis_age') && 
                !['top_level', 'noparents', 'proband', 'stillbirth', 'miscarriage', 'termination', 'adopted_in', 'adopted_out'].includes(key)) {
              diseaseFields.add(key);
            }
          });
        });
        
        return Array.from(diseaseFields).map((disease, index) => {
          const grayValue = Math.floor(80 + (index * 30) % 100);
          return {
            type: disease,
            colour: `rgb(${grayValue}, ${grayValue}, ${grayValue})`
          };
        });
      };
      
      const detectedDiseases = autoDetectDiseases(data);
      
      const newOpts = { ...currentOpts, dataset: data };
      if (detectedDiseases.length > 0) {
        newOpts.diseases = detectedDiseases;
      }
      
      // Update current opts
      setCurrentOpts(newOpts);
      
      // Rebuild pedigree with new data
      const pedigreeModule = await import('../lib/pedigreejs.es.v4.0.0-rc1');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { pedigreejs, pedigreejs_zooming } = pedigreeModule as any;
      
      pedigreejs.rebuild(newOpts);
      pedigreejs_zooming.scale_to_fit(newOpts);
      
      setJsonError('');
      alert('Data loaded successfully!');
    } catch (error) {
      const errorMsg = (error as Error).message;
      setJsonError(errorMsg);
      setTimeout(() => highlightErrorLine(errorMsg), 100);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pedigreejs_load = async (opts: any) => {
    try {
      const pedigreeModule = await import('../lib/pedigreejs.es.v4.0.0-rc1');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { pedigreejs, pedigreejs_zooming } = pedigreeModule as any;
      pedigreejs.rebuild(opts);
      pedigreejs_zooming.scale_to_fit(opts);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      let msg;
      if (typeof e === "string") {
        msg = e.toUpperCase();
      } else if (e instanceof Error) {
        msg = e.message;
      }
      console.error("PedigreeJS ::: " + msg, e);
    }
  };

  return (
    <>
      <div id="pedigree_history" className="p-2" ref={historyRef}></div>
      <div key="tree" id="pedigree" ref={pedigreeRef}></div>
      
      {/* JSON Input Form */}
      <div className="json-input-form">
        <h3>📊 Load JSON Pedigree Data</h3>
        <textarea
          ref={textareaRef}
          className="json-textarea"
          placeholder={`Paste your JSON pedigree data here...

Example format:
[
  {
    "name": "person1",
    "display_name": "John Doe",
    "sex": "M",
    "age": "45",
    "mother": "mother_name",
    "father": "father_name",
    "proband": true
  }
]`}
          value={jsonInput}
          onChange={handleJsonChange}
          onBlur={handleJsonBlur}
          onPaste={handleJsonPaste}
          onKeyDown={handleKeyDown}
        />
        {jsonError && (
          <div className="json-error-text">
            ❌ {jsonError}
          </div>
        )}
        <div className="json-helper-text">
          💡 Tip: Paste valid JSON array with pedigree data. Diseases will be auto-detected.
        </div>
        <button
          className="load-btn"
          onClick={loadJsonData}
          disabled={!jsonInput.trim()}
        >
          {!jsonInput.trim() ? '⚠️ Enter Data' : '🚀 Load Data'}
        </button>
      </div>
      
      {/* Edit dialog form required by pedigreejs */}
      <div id="node_properties" title="Edit Node Properties" style={{display: 'none'}}>
        <form>
          <table>
            <tbody>
              <tr>
                <td>Name:</td>
                <td><input type="text" id="node_name" /></td>
              </tr>
              <tr>
                <td>Display Name:</td>
                <td><input type="text" id="node_display_name" /></td>
              </tr>
              <tr>
                <td>Sex:</td>
                <td>
                  <select id="node_sex">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="U">Unknown</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Age:</td>
                <td><input type="number" id="node_age" /></td>
              </tr>
              <tr>
                <td>Year of Birth:</td>
                <td><input type="number" id="node_yob" /></td>
              </tr>
              <tr>
                <td>Status:</td>
                <td>
                  <select id="node_status">
                    <option value="0">Alive</option>
                    <option value="1">Dead</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </>
  );
};

export default PedigreeJSComponent;