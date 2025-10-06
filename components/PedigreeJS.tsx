'use client';

import React, { useEffect, useRef } from 'react';

// PedigreeJS Component
const PedigreeJSComponent: React.FC = () => {
  const pedigreeRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializePedigree = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;

      try {
        // Import dependencies
        const d3 = await import('d3');
        const $ = (await import('jquery')).default;
        
        // Make jQuery available globally first
        (window as any).d3 = d3;
        (window as any).$ = $;
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
        const { pedigreejs, pedigreejs_zooming, pedigreejs_pedcache, pedigreejs_io } = pedigreeModule;

        // Auto-detect diseases from dataset
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
        
        const opts = {
          'targetDiv': 'pedigreejs',
          'btn_target': 'pedigree_history',
          'width': (w > 800 ? 700 : w - 50),
          'height': h * 0.6,
          'symbol_size': 30,
          'font_size': '.75em',
          'edit': true,
          'zoomIn': .5,
          'zoomOut': 1.5,
          'zoomSrc': ['wheel', 'button'],
          'labels': ['display_name', ['age', 'yob'], 'stillbirth', 'disease-list'],
          'diseases': [],
          'DEBUG': false
        };

        // Check for cached data
        let local_dataset = pedigreejs_pedcache.current(opts);
        if (local_dataset !== undefined && local_dataset !== null) {
          opts.dataset = local_dataset;
          // Auto-detect diseases from cached dataset
          const detectedDiseases = autoDetectDiseases(local_dataset);
          if (detectedDiseases.length > 0) {
            opts.diseases = detectedDiseases;
          }
        } else {
          // Default CanRisk data
          const canRiskData =
            '##CanRisk 3.0\n' +
            '##FamID\tName\tTarget\tIndivID\tFathID\tMothID\tSex\tMZtwin\tDead\tAge\tYob\tBC1\tBC2\tOC\tPRO\tPAN\tAshkn\tBRCA1\tBRCA2\tPALB2\tATM\tCHEK2\tBARD1\tRAD51D\tRAD51C\tBRIP1\tER:PR:HER2:CK14:CK56\n' +
            'XFAM\t0\t0\tgrandma\t0\t0\tF\t0\t1\t85\t1933\t55\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t1\t0\tgrandpa\t0\t0\tM\t0\t1\t88\t1930\t0\t0\t0\t71\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t2\t0\tparent1\t0\t0\tF\t0\t0\t50\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t3\t0\tparent2\tgrandpa\tgrandma\tM\t0\t0\t60\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t4\t0\tparent3\tgrandpa\tgrandma\tF\t0\t0\t55\t0\t53\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t5\t0\tparent4\t0\t0\tM\t0\t0\t60\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t6\t0\tchild1\tparent2\tparent1\tF\t0\t0\t40\t0\t40\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t7\t0\tchild2\tparent2\tparent1\tF\t0\t0\t38\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t8\t0\tchild3\tparent2\tparent1\tF\t0\t0\t36\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t9\t0\tchild4\tparent2\tparent1\tM\t0\t0\t36\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t10\t0\tchild5\tparent2\tparent1\tF\t0\t0\t36\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t11\t0\tchild6\tparent2\tparent1\tM\t0\t0\t36\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t12\t1\tchild7\tparent4\tparent3\tF\t0\t0\t25\t2000\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t13\t0\tchild8\tparent4\tparent3\tF\t0\t0\t38\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t14\t0\tchild9\tparent4\tparent3\tF\t0\t0\t23\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t15\t0\tchild10\tparent2\tparent1\tM\t0\t0\t35\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t16\t0\tchild11\tparent4\tparent3\tF\t0\t0\t28\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t17\t0\tchild12\tchild10\tchild11\tM\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t18\t0\tchild13\tchild10\tchild11\tF\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t19\t0\tchild14\tchild10\tchild11\tM\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0\n' +
            'XFAM\t20\t0\tchild15\tchild10\tchild11\tF\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0\t0:0:0:0:0';
          
          pedigreejs_io.load_data(canRiskData, opts);
        }

        // Function to load data from file
        const loadDataFromFile = async (filename: string) => {
          try {
            const response = await fetch(`/${filename}`);
            const data = await response.json();
            
            // Auto-detect diseases from loaded data
            const detectedDiseases = autoDetectDiseases(data);
            
            opts.dataset = data;
            if (detectedDiseases.length > 0) {
              opts.diseases = detectedDiseases;
            }
            
            return true;
          } catch (error) {
            console.warn('Could not load file:', filename, error);
            return false;
          }
        };

        // Try to load ped (35).txt if available
        const fileLoaded = await loadDataFromFile('ped (35).txt');
        if (!fileLoaded && !local_dataset) {
          // Fallback to default data if no file and no cache
          console.log('Using default CanRisk data');
        }

        // Initialize pedigree
        showPedigree(opts);
        
        // Initialize buttons after pedigree is loaded
        setTimeout(() => {
          if (typeof pedigreeModule.addButtons === 'function') {
            pedigreeModule.addButtons(opts);
          }
          if (typeof pedigreeModule.addIO === 'function') {
            pedigreeModule.addIO(opts);
          }
        }, 100);

      } catch (error) {
        console.error('Error initializing pedigree:', error);
      }
    };

    initializePedigree();
  }, []);

  const showPedigree = (opts: any) => {
    const p = document.getElementById("pedigreejs");
    const ped = document.getElementById("pedigree");
    if (!p && ped) {
      const newP = document.createElement('div');
      newP.id = 'pedigreejs';
      ped.appendChild(newP);
      pedigreejs_load(opts);
    }
    const refresh = document.getElementsByClassName("fa-refresh");
    if (refresh) refresh[0]?.style && (refresh[0].style.display = "none");
  };

  const pedigreejs_load = async (opts: any) => {
    try {
      const pedigreeModule = await import('../lib/pedigreejs.es.v4.0.0-rc1');
      const { pedigreejs, pedigreejs_zooming } = pedigreeModule;
      pedigreejs.rebuild(opts);
      pedigreejs_zooming.scale_to_fit(opts);
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