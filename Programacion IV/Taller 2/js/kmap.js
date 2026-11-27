/**
 * Interfaz y edición del mapa de Karnaugh.
 * Este archivo comparte el ámbito clásico con los demás scripts del taller.
 */

     */
    function formatTwoVarGrayLabel(bits, vHigh, vLow) {
      const first = bits[0] === '1' ? vHigh : `${vHigh}'`;
      const second = bits[1] === '1' ? vLow : `${vLow}'`;
      return `${first}${second}`;
    }

    /**
     * Actualiza todas las etiquetas de ejes, encabezados, inputs y firmas de función
     * según el arreglo actual `varNames = [V3, V2, V1, V0]`
     */
    function syncVariableLabelsUI() {
      const [v3, v2, v1, v0] = varNames;
      const joined = varNames.join('');
      const reversedJoined = [...varNames].reverse().join('');
      const rowPair = `${v3}${v2}`;
      const colPair = `${v1}${v0}`;
      const sig = `F(${v3},${v2},${v1},${v0})`;

      // Encabezado principal y subtítulos
      document.getElementById('header-vars-order').textContent = joined;
      document.getElementById('header-msb-var').textContent = v3;
      document.getElementById('header-lsb-var').textContent = v0;
      document.getElementById('subtitle-row-vars').textContent = rowPair;
      document.getElementById('subtitle-col-vars').textContent = colPair;

      // Botón rápido de inversión
      document.getElementById('reverse-vars-label').textContent = `${joined} ⇄ ${reversedJoined}`;

      // Esquina diagonal y encabezados de columnas BA / CD / etc.
      document.getElementById('corner-row-label').textContent = rowPair;
      document.getElementById('corner-col-label').textContent = colPair;
      GRAY_CODES.forEach((gc, idx) => {
        const colHdr = document.getElementById(`col-hdr-${idx}`);
        if (colHdr) {
          colHdr.textContent = formatTwoVarGrayLabel(gc.bits, v1, v0);
        }
      });

      // Sincronizar valores de los 4 inputs individuales
      varNames.forEach((letter, idx) => {
        const inp = document.getElementById(`var-input-${idx}`);
        if (inp && inp.value !== letter) {
          inp.value = letter;
        }
      });

      // Actualizar estado visual de los botones preset
      document.querySelectorAll('.var-preset-btn').forEach(btn => {
        const preset = btn.dataset.preset;
        if (preset === activePreset) {
          btn.className = 'var-preset-btn px-2.5 py-1 rounded-lg font-mono-code text-xs font-bold bg-indigo-600 text-white shadow-xs transition cursor-pointer';
        } else {
          btn.className = 'var-preset-btn px-2.5 py-1 rounded-lg font-mono-code text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition cursor-pointer';
        }
      });

      // Firma de la función booleana, esquema y fórmula del pie de página
      document.getElementById('function-signature').textContent = `${sig} =`;
      document.getElementById('schematic-func-sig').textContent = sig;
      document.getElementById('footer-minterm-formula').textContent = `Minterm = 8·${v3} + 4·${v2} + 2·${v1} + 1·${v0}`;
    }

    /**
     * Aplica un nuevo arreglo de 4 letras únicas y re-renderiza todo el sistema
     */
    function applyVariableNames(newVars, presetName = null) {
      varNames = [...newVars];
      const joined = varNames.join('');
      if (presetName) {
        activePreset = presetName;
      } else if (['DCBA', 'ABCD', 'WXYZ'].includes(joined)) {
        activePreset = joined;
      } else {
        activePreset = 'CUSTOM';
      }

      syncVariableLabelsUI();
      buildKMapGrid();
      updateMintermsSummary();
      solveAndRender();
    }

    /**
     * Maneja la edición en tiempo real de cualquiera de las 4 letras individuales
     * garantizando letras alfabéticas únicas en mayúscula.
     */
    function handleCustomLetterInput(index, rawValue) {
      const msgEl = document.getElementById('var-validation-msg');
      const cleaned = rawValue.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1);
      const inputEl = document.getElementById(`var-input-${index}`);

      if (!cleaned) {
        // Restaurar la letra anterior si se borra o se escribe un carácter no alfabético
        inputEl.value = varNames[index];
        return;
      }

      const nextVars = [...varNames];
      const duplicateIdx = nextVars.findIndex((v, i) => i !== index && v === cleaned);

      if (duplicateIdx !== -1) {
        // Si la letra ya estaba en otra posición, intercambiarlas automáticamente para mantener unicidad
        const previousLetter = nextVars[index];
        nextVars[duplicateIdx] = previousLetter;
        nextVars[index] = cleaned;
        msgEl.textContent = `Se intercambiaron "${cleaned}" y "${previousLetter}" para evitar variables duplicadas.`;
        msgEl.classList.remove('hidden');
        clearTimeout(msgEl._hideTimer);
        msgEl._hideTimer = setTimeout(() => msgEl.classList.add('hidden'), 2600);
      } else {
        nextVars[index] = cleaned;
        msgEl.classList.add('hidden');
      }

      applyVariableNames(nextVars);
    }

    /**
     * ============================================================================
     * CONSTRUCCIÓN DE LA INTERFAZ DEL MAPA 4x4
     * ============================================================================
     */
    function buildKMapGrid() {
      const container = document.getElementById('kmap-grid-body');
      container.innerHTML = '';
      const [v3, v2] = varNames;

      for (let r = 0; r < 4; r++) {
        const rowInfo = GRAY_CODES[r];
        const rowExprLabel = formatTwoVarGrayLabel(rowInfo.bits, v3, v2);

        // Encabezado de fila [V3 V2]
        const rowHeader = document.createElement('div');
        rowHeader.className = 'aspect-square rounded-xl bg-slate-100/80 border border-slate-200/80 flex flex-col items-center justify-center select-none';
        rowHeader.innerHTML = `
          <span class="font-mono-code text-sm sm:text-base font-bold text-slate-800">${rowInfo.bits}</span>
          <span class="text-[10px] text-slate-400 font-mono-code">${rowExprLabel}</span>
        `;
        container.appendChild(rowHeader);

        // 4 celdas de la fila [V1 V0]
        for (let c = 0; c < 4; c++) {
          const colInfo = GRAY_CODES[c];
          // Minterm decimal: V3*8 + V2*4 + V1*2 + V0*1
          const minterm = (rowInfo.val << 2) | colInfo.val;
          const binaryStr = minterm.toString(2).padStart(4, '0');

          const cellBtn = document.createElement('button');
          cellBtn.type = 'button';
          cellBtn.id = `cell-${minterm}`;
          cellBtn.dataset.minterm = minterm;
          cellBtn.setAttribute('aria-label', `Celda m${minterm} (${binaryStr}), valor actual 0`);
          cellBtn.className = 'kmap-cell relative aspect-square rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

          cellBtn.innerHTML = `
            <span class="absolute top-1 left-1.5 font-mono-code text-[10px] sm:text-[11px] font-medium text-slate-400">
              m${minterm}
            </span>
            <span class="cell-val font-mono-code text-xl sm:text-2xl font-bold text-slate-400 mt-1">
              0
            </span>
            <span class="group-dots absolute bottom-1 right-1.5 flex gap-0.5"></span>
          `;

          cellBtn.addEventListener('click', () => cycleCellValue(minterm));
          container.appendChild(cellBtn);
        }
      }
    }

    /**
     * Alterna cíclicamente el valor de una celda: 0 -> 1 -> X -> 0
     */
    function cycleCellValue(minterm) {
      const current = kmapValues[minterm];
      if (current === '0') {
        kmapValues[minterm] = '1';
      } else if (current === '1') {
        kmapValues[minterm] = 'X';
      } else {
        kmapValues[minterm] = '0';
      }
      updateCellVisuals();
      updateMintermsSummary();
      // Recalcula automáticamente para experiencia fluida e inmediata
      solveAndRender();
    }

    /**
     * Actualiza el aspecto visual de las 16 celdas (valor, colores y grupos)
     */
    function updateCellVisuals() {
      for (let m = 0; m < 16; m++) {
        const cell = document.getElementById(`cell-${m}`);
        if (!cell) continue;

        const val = kmapValues[m];
        const valSpan = cell.querySelector('.cell-val');
        const dotsSpan = cell.querySelector('.group-dots');
        const binaryStr = m.toString(2).padStart(4, '0');

        valSpan.textContent = val;
        cell.setAttribute('aria-label', `Celda m${m} (${binaryStr}), valor actual ${val}`);

        // Restablecer estilos base según el estado ('0', '1', 'X')
        cell.style.backgroundColor = '';
        cell.style.borderColor = '';
        cell.style.boxShadow = '';

        if (val === '0') {
          cell.className = 'kmap-cell relative aspect-square rounded-xl border-2 border-slate-200 bg-white hover:border-slate-300 flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40';
          valSpan.className = 'cell-val font-mono-code text-xl sm:text-2xl font-bold text-slate-400 mt-1';
        } else if (val === '1') {
          cell.className = 'kmap-cell relative aspect-square rounded-xl border-2 border-indigo-300 bg-indigo-50/60 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40';
          valSpan.className = 'cell-val font-mono-code text-xl sm:text-2xl font-bold text-indigo-700 mt-1';
        } else {
          cell.className = 'kmap-cell relative aspect-square rounded-xl border-2 border-amber-300 bg-amber-50/70 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40';
          valSpan.className = 'cell-val font-mono-code text-xl sm:text-2xl font-bold text-amber-700 mt-1';
        }

        // Indicadores de pertenencia a grupos
        dotsSpan.innerHTML = '';
        const matchingGroups = [];
        currentGroups.forEach((grp, idx) => {
          if (grp.minterms.includes(m)) {
            matchingGroups.push({ grp, idx });
          }
        });

        if (matchingGroups.length > 0) {
          matchingGroups.forEach(({ idx }) => {
            const color = GROUP_PALETTE[idx % GROUP_PALETTE.length];
            const dot = document.createElement('span');
            dot.className = 'w-2 h-2 rounded-full inline-block';
            dot.style.backgroundColor = color.border;
            dotsSpan.appendChild(dot);
          });

          // Si el usuario está pasando el mouse sobre un grupo específico
          if (hoveredGroupIndex !== null) {
            const isMember = currentGroups[hoveredGroupIndex]?.minterms.includes(m);
            const activeColor = GROUP_PALETTE[hoveredGroupIndex % GROUP_PALETTE.length];
            if (isMember) {
              cell.style.backgroundColor = activeColor.bg;
              cell.style.borderColor = activeColor.border;
              cell.style.boxShadow = `0 0 0 2px ${activeColor.border}40`;
            } else {
              cell.style.opacity = '0.45';
            }
          } else {
            cell.style.opacity = '1';
            // Aplicar borde del primer grupo que cubre esta celda para claridad visual
            const primaryColor = GROUP_PALETTE[matchingGroups[0].idx % GROUP_PALETTE.length];
            cell.style.borderColor = primaryColor.border;
            if (matchingGroups.length === 1) {
              cell.style.backgroundColor = primaryColor.bg;
            }
          }
        } else {
          cell.style.opacity = hoveredGroupIndex !== null ? '0.45' : '1';
        }
      }
    }

    /**
     * Actualiza la lista de minterms (Σm) y don't cares (Σd)
     */
    function updateMintermsSummary() {
      const ones = [];
      const dontCares = [];
      for (let m = 0; m < 16; m++) {
        if (kmapValues[m] === '1') ones.push(m);
        else if (kmapValues[m] === 'X') dontCares.push(m);
      }
      document.getElementById('minterms-list').textContent = `Σm(${ones.join(', ')})`;
      document.getElementById('dontcares-list').textContent = `Σd(${dontCares.join(', ')})`;
    }

    /**
     * ============================================================================
     * ALGORITMO DE QUINE-MCCLUSKEY + MÉTODO DE PETRICK (4 VARIABLES: DCBA)
     * ============================================================================
     */

    /**
     * Convierte un entero 0..15 a cadena binaria de 4 bits (DCBA)
     */