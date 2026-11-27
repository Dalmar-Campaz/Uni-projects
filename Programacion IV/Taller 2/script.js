/**
     * ============================================================================
     * CONFIGURACIÓN Y ESTADO GLOBAL DEL MAPA DE KARNAUGH 4x4 (DCBA)
     * ============================================================================
     */

    // Orden de código Gray de 2 bits para filas (DC) y columnas (BA)
    const GRAY_CODES = [
      { bits: '00', val: 0, label: "D'C'" },
      { bits: '01', val: 1, label: "D'C" },
      { bits: '11', val: 3, label: 'DC' },
      { bits: '10', val: 2, label: "DC'" }
    ];

    // Paleta de colores distintivos para resaltar cada grupo en el mapa y en la lista
    const GROUP_PALETTE = [
      { name: 'Índigo',  border: '#4f46e5', bg: 'rgba(79, 70, 229, 0.14)',  badgeBg: '#eef2ff', badgeText: '#3730a3' },
      { name: 'Esmeralda', border: '#059669', bg: 'rgba(5, 150, 105, 0.14)',  badgeBg: '#ecfdf5', badgeText: '#065f46' },
      { name: 'Ámbar',   border: '#d97706', bg: 'rgba(217, 119, 6, 0.15)',  badgeBg: '#fffbeb', badgeText: '#92400e' },
      { name: 'Rosa',    border: '#e11d48', bg: 'rgba(225, 29, 72, 0.13)',  badgeBg: '#fff1f2', badgeText: '#9f1239' },
      { name: 'Cian',    border: '#0284c7', bg: 'rgba(2, 132, 199, 0.14)',  badgeBg: '#f0f9ff', badgeText: '#075985' },
      { name: 'Violeta', border: '#7c3aed', bg: 'rgba(124, 58, 237, 0.14)', badgeBg: '#f5f3ff', badgeText: '#5b21b6' },
      { name: 'Lima',    border: '#65a30d', bg: 'rgba(101, 163, 13, 0.15)', badgeBg: '#f7fee7', badgeText: '#3f6212' },
      { name: 'Naranja', border: '#ea580c', bg: 'rgba(234, 88, 12, 0.14)',  badgeBg: '#fff7ed', badgeText: '#9a3412' }
    ];

    // Arreglo de 16 posiciones indexado por el minterm decimal m0..m15 (DCBA)
    // Valores posibles: '0', '1', 'X'
    const kmapValues = new Array(16).fill('0');

    // Estado de visualización
    let negationStyle = 'prime'; // 'prime' (D') o 'overline' (D con barra superior)
    let currentGroups = [];      // Lista de grupos (implicantes primos esenciales/mínimos) hallados
    let currentSpecial = null;   // '0', '1', o null
    let hoveredGroupIndex = null;
    let notGateMode = 'bus';     // 'bus' (compuertas NOT en el bus izquierdo) o 'inline' (burbuja/NOT junto a cada entrada)

    /**
     * ============================================================================
     * CONSTRUCCIÓN DE LA INTERFAZ DEL MAPA 4x4
     * ============================================================================
     */
    function buildKMapGrid() {
      const container = document.getElementById('kmap-grid-body');
      container.innerHTML = '';

      for (let r = 0; r < 4; r++) {
        const dcInfo = GRAY_CODES[r];

        // Encabezado de fila (DC)
        const rowHeader = document.createElement('div');
        rowHeader.className = 'aspect-square rounded-xl bg-slate-100/80 border border-slate-200/80 flex flex-col items-center justify-center select-none';
        rowHeader.innerHTML = `
          <span class="font-mono-code text-sm sm:text-base font-bold text-slate-800">${dcInfo.bits}</span>
          <span class="text-[10px] text-slate-400 font-mono-code">${dcInfo.label}</span>
        `;
        container.appendChild(rowHeader);

        // 4 celdas de la fila (BA)
        for (let c = 0; c < 4; c++) {
          const baInfo = GRAY_CODES[c];
          // Minterm decimal: D*8 + C*4 + B*2 + A*1
          const minterm = (dcInfo.val << 2) | baInfo.val;
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
    function toBin4(num) {
      return num.toString(2).padStart(4, '0');
    }

    /**
     * Cuenta cuántos '1' hay en una cadena
     */
    function countOnes(pattern) {
      let c = 0;
      for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === '1') c++;
      }
      return c;
    }

    /**
     * Intenta combinar dos patrones de 4 caracteres ('0', '1', '-').
     * Si difieren en exactamente 1 posición (y ninguno tiene '-' ahí), devuelve el patrón combinado.
     */
    function combinePatterns(p1, p2) {
      let diffCount = 0;
      let combined = '';
      for (let i = 0; i < 4; i++) {
        if (p1[i] === p2[i]) {
          combined += p1[i];
        } else {
          if (p1[i] === '-' || p2[i] === '-') return null;
          diffCount++;
          combined += '-';
        }
      }
      return diffCount === 1 ? combined : null;
    }

    /**
     * Encuentra todos los Implicantes Primos (Prime Implicants) usando Quine-McCluskey
     */
    function findPrimeImplicants(allTerms) {
      // Cada implicante tiene: { pattern: '01-0', minterms: Set([4, 6]), used: false }
      let currentLevel = allTerms.map(m => ({
        pattern: toBin4(m),
        minterms: new Set([m]),
        used: false
      }));

      const primeImplicants = [];

      while (currentLevel.length > 0) {
        // Agrupar por cantidad de '1'
        const buckets = [[], [], [], [], []];
        currentLevel.forEach(imp => {
          buckets[countOnes(imp.pattern)].push(imp);
        });

        const nextMap = new Map();

        for (let g = 0; g < 4; g++) {
          const groupA = buckets[g];
          const groupB = buckets[g + 1];

          for (let i = 0; i < groupA.length; i++) {
            for (let j = 0; j < groupB.length; j++) {
              const mergedPattern = combinePatterns(groupA[i].pattern, groupB[j].pattern);
              if (mergedPattern !== null) {
                groupA[i].used = true;
                groupB[j].used = true;

                if (!nextMap.has(mergedPattern)) {
                  const unionSet = new Set([...groupA[i].minterms, ...groupB[j].minterms]);
                  nextMap.set(mergedPattern, {
                    pattern: mergedPattern,
                    minterms: unionSet,
                    used: false
                  });
                }
              }
            }
          }
        }

        // Todo implicante que no pudo combinarse es un Implicante Primo
        currentLevel.forEach(imp => {
          if (!imp.used) {
            primeImplicants.push({
              pattern: imp.pattern,
              minterms: Array.from(imp.minterms).sort((a, b) => a - b)
            });
          }
        });

        currentLevel = Array.from(nextMap.values());
      }

      return primeImplicants;
    }

    /**
     * Selecciona el subconjunto mínimo de implicantes primos que cubre todos los minterms requeridos (1s)
     * utilizando implicantes primos esenciales + dominancia de filas + Método de Petrick exacto
     * + verificación final de redundancia.
     */
    function selectMinimumCover(primeImplicants, requiredMinterms) {
      if (requiredMinterms.length === 0) return [];

      const requiredSet = new Set(requiredMinterms);
      const remainingMinterms = new Set(requiredMinterms);
      const selectedIndices = new Set();

      // Filtrar implicantes primos que cubran al menos un minterm requerido ('1')
      // y precalcular su conjunto de minterms requeridos ('1') cubiertos
      const candidatePIs = primeImplicants
        .map(pi => {
          const coveredOnes = pi.minterms.filter(m => requiredSet.has(m));
          return {
            ...pi,
            coveredOnes
          };
        })
        .filter(pi => pi.coveredOnes.length > 0);

      // 1. Extraer Implicantes Primos Esenciales de forma iterativa
      let addedEssential = true;
      while (addedEssential && remainingMinterms.size > 0) {
        addedEssential = false;

        for (const m of Array.from(remainingMinterms)) {
          const covering = [];
          candidatePIs.forEach((pi, idx) => {
            if (!selectedIndices.has(idx) && pi.coveredOnes.includes(m)) {
              covering.push(idx);
            }
          });

          if (covering.length === 1) {
            const essentialIdx = covering[0];
            selectedIndices.add(essentialIdx);
            candidatePIs[essentialIdx].coveredOnes.forEach(coveredM => {
              remainingMinterms.delete(coveredM);
            });
            addedEssential = true;
          }
        }
      }

      // 2. Si aún quedan minterms por cubrir, aplicar Dominancia de Filas + Método de Petrick completo
      if (remainingMinterms.size > 0) {
        const remList = Array.from(remainingMinterms);

        // Obtener índices candidatos que aún cubren al menos un minterm pendiente
        let activeIndices = [];
        candidatePIs.forEach((pi, idx) => {
          if (!selectedIndices.has(idx)) {
            const remCovered = pi.coveredOnes.filter(m => remainingMinterms.has(m));
            if (remCovered.length > 0) {
              activeIndices.push(idx);
            }
          }
        });

        // Dominancia de filas: si el implicante A cubre un subconjunto propio (o igual con >= literales)
        // de los minterms pendientes que cubre B, y B tiene <= literales que A, A es dominado y se descarta.
        activeIndices = activeIndices.filter(idxA => {
          const covA = candidatePIs[idxA].coveredOnes.filter(m => remainingMinterms.has(m));
          const litA = countLiteralsInPattern(candidatePIs[idxA].pattern);

          for (const idxB of activeIndices) {
            if (idxA === idxB) continue;
            const covB = candidatePIs[idxB].coveredOnes.filter(m => remainingMinterms.has(m));
            const litB = countLiteralsInPattern(candidatePIs[idxB].pattern);

            const aSubsetOfB = covA.every(m => covB.includes(m));
            if (aSubsetOfB && litB <= litA) {
              if (covA.length < covB.length || litB < litA || idxB < idxA) {
                return false;
              }
            }
          }
          return true;
        });

        // Construir cláusulas POS para cada minterm restante: (P_i + P_j + ...)
        const clauses = remList.map(m => {
          const opts = [];
          activeIndices.forEach(idx => {
            if (candidatePIs[idx].coveredOnes.includes(m)) {
              opts.push(new Set([idx]));
            }
          });
          return opts;
        });

        // Multiplicar las cláusulas aplicando absorción booleana X + XY = X en cada paso
        let product = simplifyPetrickTerms(clauses[0]);
        for (let i = 1; i < clauses.length; i++) {
          const nextProduct = [];
          for (const termA of product) {
            for (const termB of clauses[i]) {
              const combined = new Set([...termA, ...termB]);
              nextProduct.push(combined);
            }
          }
          product = simplifyPetrickTerms(nextProduct);
        }

        // Elegir el producto con menor cantidad de términos y menor total de literales
        product.sort((setA, setB) => {
          if (setA.size !== setB.size) return setA.size - setB.size;
          const litA = countLiteralsInSet(setA, candidatePIs);
          const litB = countLiteralsInSet(setB, candidatePIs);
          return litA - litB;
        });

        if (product.length > 0) {
          product[0].forEach(idx => selectedIndices.add(idx));
        }
      }

      // 3. Paso final de verificación de redundancia:
      // Eliminar cualquier implicante seleccionado cuyos minterms (1s) ya estén 100% cubiertos
      // por la unión de los demás implicantes seleccionados.
      const finalIndices = Array.from(selectedIndices);
      // Ordenar de menor a mayor tamaño de grupo para evaluar primero si los más pequeños son redundantes
      finalIndices.sort((a, b) => candidatePIs[a].minterms.length - candidatePIs[b].minterms.length);

      const keptIndices = new Set(finalIndices);
      for (const idx of finalIndices) {
        const coveredByOthers = new Set();
        keptIndices.forEach(otherIdx => {
          if (otherIdx !== idx) {
            candidatePIs[otherIdx].coveredOnes.forEach(m => coveredByOthers.add(m));
          }
        });

        const isRedundant = candidatePIs[idx].coveredOnes.every(m => coveredByOthers.has(m));
        if (isRedundant) {
          keptIndices.delete(idx);
        }
      }

      // Ordenar los implicantes finales de mayor tamaño de grupo a menor
      const result = Array.from(keptIndices).map(idx => ({
        pattern: candidatePIs[idx].pattern,
        minterms: candidatePIs[idx].minterms
      }));
      result.sort((a, b) => b.minterms.length - a.minterms.length);
      return result;
    }

    function countLiteralsInPattern(pattern) {
      let literals = 0;
      for (const ch of pattern) {
        if (ch !== '-') literals++;
      }
      return literals;
    }

    function simplifyPetrickTerms(terms) {
      // Eliminar duplicados y superconjuntos (Absorción booleana: X + XY = X)
      const unique = [];
      for (let i = 0; i < terms.length; i++) {
        let isSuperset = false;
        for (let j = 0; j < terms.length; j++) {
          if (i === j) continue;
          if (isSubsetOf(terms[j], terms[i])) {
            // Si son idénticos, conservar solo el de menor índice j < i
            if (terms[j].size < terms[i].size || j < i) {
              isSuperset = true;
              break;
            }
          }
        }
        if (!isSuperset) unique.push(terms[i]);
      }
      return unique;
    }

    function isSubsetOf(sub, sup) {
      if (sub.size > sup.size) return false;
      for (const item of sub) {
        if (!sup.has(item)) return false;
      }
      return true;
    }

    function countLiteralsInSet(indexSet, primeImplicants) {
      let literals = 0;
      indexSet.forEach(idx => {
        literals += countLiteralsInPattern(primeImplicants[idx].pattern);
      });
      return literals;
    }

    /**
     * ============================================================================
     * FORMATEO DE TÉRMINOS BOOLEANOS (DCBA) Y RENDERIZADO DE RESULTADOS
     * ============================================================================
     */

    /**
     * Convierte un patrón de 4 bits (ej. "01-0") a texto plano o HTML según estilo
     * Posición 0 -> D, Posición 1 -> C, Posición 2 -> B, Posición 3 -> A
     */
    function formatPattern(pattern, style = 'prime', asHtml = false) {
      const vars = ['D', 'C', 'B', 'A'];
      let out = '';

      for (let i = 0; i < 4; i++) {
        const bit = pattern[i];
        const v = vars[i];
        if (bit === '-') continue;

        if (bit === '1') {
          out += v;
        } else if (bit === '0') {
          if (style === 'overline' && asHtml) {
            out += `<span class="overline-term">${v}</span>`;
          } else {
            out += `${v}'`;
          }
        }
      }
      return out === '' ? '1' : out;
    }

    /**
     * Ejecuta la simplificación del mapa actual y actualiza toda la UI
     */
    function solveAndRender() {
      const ones = [];
      const dontCares = [];

      for (let m = 0; m < 16; m++) {
        if (kmapValues[m] === '1') ones.push(m);
        else if (kmapValues[m] === 'X') dontCares.push(m);
      }

      hoveredGroupIndex = null;

      // Caso especial 1: No hay ningún '1' (todos 0 o solo X) -> F = 0
      if (ones.length === 0) {
        currentGroups = [];
        currentSpecial = '0';
        renderOutput();
        updateCellVisuals();
        renderSchematic();
        return;
      }

      // Caso especial 2: Todos los 16 espacios están cubiertos por '1' o 'X' (y hay al menos un '1') -> F = 1
      if (ones.length + dontCares.length === 16) {
        currentGroups = [{
          pattern: '----',
          minterms: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
        }];
        currentSpecial = '1';
        renderOutput();
        updateCellVisuals();
        renderSchematic();
        return;
      }

      currentSpecial = null;
      const allTerms = [...ones, ...dontCares];
      const primeImplicants = findPrimeImplicants(allTerms);
      currentGroups = selectMinimumCover(primeImplicants, ones);

      renderOutput();
      updateCellVisuals();
      renderSchematic();
    }

    /**
     * Dibuja la expresión booleana y la lista interactiva de grupos
     */
    function renderOutput() {
      const exprEl = document.getElementById('expression-output');
      const groupsContainer = document.getElementById('groups-container');
      const countBadge = document.getElementById('groups-count-badge');

      if (currentSpecial === '0') {
        exprEl.innerHTML = '0';
        countBadge.textContent = '0 grupos';
        groupsContainer.innerHTML = `
          <div class="text-sm text-slate-500 bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-center">
            No hay minterms en <strong>1</strong>. La salida siempre es <strong class="font-mono-code text-slate-800">0</strong>.
          </div>
        `;
        return;
      }

      if (currentSpecial === '1') {
        exprEl.innerHTML = '1';
        countBadge.textContent = '1 grupo (16 celdas)';
        const color = GROUP_PALETTE[0];
        groupsContainer.innerHTML = `
          <div
            data-group-idx="0"
            class="group-item rounded-xl border p-3.5 transition cursor-pointer flex items-center justify-between"
            style="border-color: ${color.border}; background-color: ${color.badgeBg};"
          >
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${color.border};"></span>
              <div>
                <div class="font-mono-code font-bold text-sm" style="color: ${color.badgeText};">
                  Grupo 1: 1 (Tautología)
                </div>
                <div class="text-xs text-slate-600 mt-0.5">
                  Cubre las 16 celdas del mapa (m0 – m15)
                </div>
              </div>
            </div>
            <span class="text-xs font-mono-code font-semibold px-2 py-0.5 rounded bg-white/80 text-slate-700">
              Octeto ×2
            </span>
          </div>
        `;
        attachGroupHoverEvents();
        return;
      }

      // Renderizar suma de productos (SOP)
      const htmlTerms = currentGroups.map(g => formatPattern(g.pattern, negationStyle, true));
      exprEl.innerHTML = htmlTerms.join(' <span class="text-indigo-500 mx-1">+</span> ');

      countBadge.textContent = `${currentGroups.length} ${currentGroups.length === 1 ? 'grupo' : 'grupos'}`;

      groupsContainer.innerHTML = currentGroups.map((grp, idx) => {
        const color = GROUP_PALETTE[idx % GROUP_PALETTE.length];
        const termHtml = formatPattern(grp.pattern, negationStyle, true);
        const cellsLabel = grp.minterms.map(m => `m${m}`).join(', ');
        const sizeName = getGroupSizeLabel(grp.minterms.length);

        return `
          <div
            data-group-idx="${idx}"
            class="group-item rounded-xl border border-slate-200 hover:border-slate-300 bg-white p-3.5 transition cursor-pointer flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                style="background-color: ${color.border};"
              ></span>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-semibold text-slate-500">Grupo ${idx + 1}:</span>
                  <span
                    class="font-mono-code font-bold text-base px-2 py-0.5 rounded-md"
                    style="background-color: ${color.badgeBg}; color: ${color.badgeText};"
                  >
                    ${termHtml}
                  </span>
                </div>
                <div class="text-xs text-slate-500 font-mono-code mt-1 truncate">
                  Celdas: ${cellsLabel}
                </div>
              </div>
            </div>
            <span class="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              ${sizeName}
            </span>
          </div>
        `;
      }).join('');

      attachGroupHoverEvents();
    }

    function getGroupSizeLabel(count) {
      switch (count) {
        case 16: return '16 celdas';
        case 8:  return 'Octeto (8)';
        case 4:  return 'Cuádruple (4)';
        case 2:  return 'Par (2)';
        default: return 'Aislado (1)';
      }
    }

    /**
     * Conecta los eventos hover / touch en las tarjetas de grupos para destacar celdas en el K-Map
     */
    function attachGroupHoverEvents() {
      const items = document.querySelectorAll('.group-item');
      items.forEach(item => {
        const idx = Number(item.dataset.groupIdx);
        item.addEventListener('mouseenter', () => {
          hoveredGroupIndex = idx;
          updateCellVisuals();
          highlightSchematicGroup(idx);
        });
        item.addEventListener('mouseleave', () => {
          hoveredGroupIndex = null;
          updateCellVisuals();
          highlightSchematicGroup(null);
        });
        item.addEventListener('click', () => {
          hoveredGroupIndex = hoveredGroupIndex === idx ? null : idx;
          updateCellVisuals();
          highlightSchematicGroup(hoveredGroupIndex);
        });
      });
    }

    /**
     * ============================================================================
     * MOTOR DE GENERACIÓN DE ESQUEMAS DE COMPUERTAS LÓGICAS (ESTILO CLÁSICO IEEE/ANSI)
     * ============================================================================
     */

    /**
     * Resalta suavemente en el SVG el grupo seleccionado (sincronizado con K-Map y lista)
     */
    function highlightSchematicGroup(groupIdx) {
      const svg = document.getElementById('logic-schematic-svg');
      if (!svg) return;

      const gateEls = svg.querySelectorAll('[data-sch-group]');
      gateEls.forEach(el => {
        const idx = Number(el.getAttribute('data-sch-group'));
        if (groupIdx === null) {
          el.style.opacity = '1';
          el.style.filter = 'none';
        } else if (idx === groupIdx) {
          const color = GROUP_PALETTE[idx % GROUP_PALETTE.length];
          el.style.opacity = '1';
          el.style.filter = `drop-shadow(0 0 5px ${color.border})`;
        } else {
          el.style.opacity = '0.28';
          el.style.filter = 'none';
        }
      });
    }

    /**
     * Renderiza el esquema completo en SVG con estética de libro de texto:
     * fondo blanco, trazos negros gruesos (2.5px), relleno blanco en compuertas,
     * puntos de unión sólidos y puentes semicirculares en cruces ortogonales.
     */
    function renderSchematic() {
      const wrapper = document.getElementById('schematic-wrapper');
      if (!wrapper) return;

      const VARS = ['D', 'C', 'B', 'A'];

      // Helper para crear elementos SVG con atributos limpios
      const el = (tag, attrs = {}) => {
        const attrStr = Object.entries(attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        return `<${tag} ${attrStr} />`;
      };

      // Trazos estándar tipo libro de texto (idénticos a la imagen de referencia)
      const STROKE = '#000000';
      const SW = 2.5;
      const FONT = 'Arial, Helvetica, sans-serif';

      // ------------------------------------------------------------------------
      // CASO ESPECIAL 0 o 1 (Salida constante)
      // ------------------------------------------------------------------------
      if (currentSpecial === '0' || currentSpecial === '1') {
        const constVal = currentSpecial;
        const W = 440;
        const H = 190;
        let svgParts = [];

        // Mostrar entradas D, C, B, A a la izquierda sin carga y línea constante hacia Q
        VARS.forEach((v, i) => {
          const y = 38 + i * 36;
          svgParts.push(`<text x="32" y="${y + 6}" font-family="${FONT}" font-size="18" font-weight="600" fill="#000000" text-anchor="end">${v}</text>`);
          svgParts.push(el('line', { x1: 42, y1: y, x2: 88, y2: y, stroke: STROKE, 'stroke-width': SW, 'stroke-linecap': 'round' }));
        });

        // Fuente constante ('0' o '1') conectada directo a Q
        const cy = 92;
        svgParts.push(`<rect x="165" y="${cy - 18}" width="44" height="36" rx="6" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" />`);
        svgParts.push(`<text x="187" y="${cy + 7}" font-family="${FONT}" font-size="20" font-weight="700" fill="#000000" text-anchor="middle">${constVal}</text>`);
        svgParts.push(el('line', { x1: 209, y1: cy, x2: 365, y2: cy, stroke: STROKE, 'stroke-width': SW, 'stroke-linecap': 'round' }));
        svgParts.push(`<text x="378" y="${cy + 6}" font-family="${FONT}" font-size="20" font-weight="700" fill="#000000" text-anchor="start">Q</text>`);

        wrapper.innerHTML = `
          <svg id="logic-schematic-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="max-width: 100%; height: auto; background: #ffffff;">
            ${svgParts.join('\n')}
          </svg>
        `;
        return;
      }

      // ------------------------------------------------------------------------
      // ANALIZAR LITERALES Y TÉRMINOS PRODUCTO DE LA EXPRESIÓN ACTUAL
      // ------------------------------------------------------------------------
      // Cada grupo en currentGroups tiene pattern de 4 chars ('0','1','-') para D,C,B,A
      const terms = currentGroups.map((grp, gIdx) => {
        const literals = [];
        for (let i = 0; i < 4; i++) {
          const bit = grp.pattern[i];
          if (bit === '1') literals.push({ varIdx: i, varName: VARS[i], inverted: false });
          else if (bit === '0') literals.push({ varIdx: i, varName: VARS[i], inverted: true });
        }
        return { groupIdx: gIdx, pattern: grp.pattern, literals };
      });

      // Determinar qué señales (varIdx + inverted) son requeridas en el circuito
      const neededTrue = [false, false, false, false];
      const neededInv = [false, false, false, false];
      terms.forEach(t => {
        t.literals.forEach(lit => {
          if (lit.inverted) neededInv[lit.varIdx] = true;
          else neededTrue[lit.varIdx] = true;
        });
      });

      // ------------------------------------------------------------------------
      // GEOMETRÍA Y COORDENADAS ORTOGONALES
      // ------------------------------------------------------------------------
      const numTerms = terms.length;
      const singleTermOnly = numTerms === 1;
      const singleWireOnly = singleTermOnly && terms[0].literals.length === 1;

      // Posiciones Y de las 4 líneas de entrada principales D, C, B, A
      // Si se usa modo 'bus' con inversores, dejamos espacio debajo de cada línea para su riel negado
      const inputStartX = 48;
      const labelX = 36;
      const inputLeadEndX = 82;

      const varBaseY = [];
      let cursorY = 46;
      for (let i = 0; i < 4; i++) {
        varBaseY.push(cursorY);
        cursorY += (notGateMode === 'bus' && neededInv[i]) ? 62 : 44;
      }

      // Calcular pistas verticales (buses) para las señales usadas
      // Cada señal activa tiene una coordenada X única en el canal de buses para evitar colisiones
      let busCursorX = notGateMode === 'bus' ? 168 : 112;
      const busSpacing = 22;

      const trueBusX = [null, null, null, null];
      const invBusX = [null, null, null, null];
      const invGateY = [null, null, null, null];

      for (let i = 0; i < 4; i++) {
        if (neededTrue[i]) {
          trueBusX[i] = busCursorX;
          busCursorX += busSpacing;
        }
        if (notGateMode === 'bus' && neededInv[i]) {
          invGateY[i] = varBaseY[i] + 26;
          invBusX[i] = busCursorX;
          busCursorX += busSpacing;
        }
      }

      const busZoneEndX = Math.max(busCursorX + 18, 210);

      // Posición X de la columna de compuertas AND (nivel 1)
      const andGateX = busZoneEndX + 26;
      const andGateW = 58;

      // Calcular alturas y centros Y de cada término producto
      const termLayouts = [];
      let termCursorY = 46;

      terms.forEach((t, idx) => {
        const k = t.literals.length;
        const gateH = k <= 2 ? 48 : k === 3 ? 60 : 72;
        const centerY = termCursorY + gateH / 2;

        // Coordenadas Y de los pines de entrada de esta compuerta
        const pinYs = [];
        if (k === 1) {
          pinYs.push(centerY);
        } else {
          const pad = 11;
          const span = gateH - 2 * pad;
          for (let p = 0; p < k; p++) {
            pinYs.push(termCursorY + pad + (span * p) / (k - 1));
          }
        }

        termLayouts.push({
          term: t,
          groupIdx: idx,
          gateX: andGateX,
          gateW: andGateW,
          gateH,
          topY: termCursorY,
          centerY,
          pinYs
        });

        termCursorY += gateH + 26;
      });

      // Posición de la compuerta OR final (nivel 2) si hay 2 o más términos
      const orGateX = singleTermOnly
        ? (singleWireOnly ? busZoneEndX + 40 : andGateX + andGateW + 55)
        : andGateX + andGateW + 46 + numTerms * 14;
      const orGateW = 68;
      const orGateH = Math.max(58, Math.min(130, 44 + numTerms * 14));

      const firstTermY = termLayouts[0].centerY;
      const lastTermY = termLayouts[termLayouts.length - 1].centerY;
      const orCenterY = Math.round((firstTermY + lastTermY) / 2);
      const orTopY = orCenterY - orGateH / 2;

      // Pines de entrada de la compuerta OR final
      const orPinYs = [];
      if (!singleTermOnly) {
        const pad = 13;
        const span = orGateH - 2 * pad;
        for (let i = 0; i < numTerms; i++) {
          orPinYs.push(orTopY + pad + (span * i) / (numTerms - 1));
        }
      }

      const outputTipX = singleTermOnly
        ? (singleWireOnly ? busZoneEndX + 110 : andGateX + andGateW + 90)
        : orGateX + orGateW + 54;
      const outputLabelX = outputTipX + 12;

      const totalW = outputLabelX + 42;
      const totalH = Math.max(cursorY + 24, termCursorY + 18, orTopY + orGateH + 34);

      // ------------------------------------------------------------------------
      // REGISTRO DE SEGMENTOS HORIZONTALES Y VERTICALES PARA DETECTAR CRUCES (HOPS)
      // ------------------------------------------------------------------------
      const hSegments = []; // { x1, x2, y, netId }
      const vSegments = []; // { x, y1, y2, netId }
      const junctions = []; // { x, y }
      const shapes = [];    // Elementos SVG de compuertas y textos

      function addHLine(x1, x2, y, netId) {
        if (Math.abs(x1 - x2) < 0.5) return;
        hSegments.push({ x1: Math.min(x1, x2), x2: Math.max(x1, x2), y, netId });
      }

      function addVLine(x, y1, y2, netId) {
        if (Math.abs(y1 - y2) < 0.5) return;
        vSegments.push({ x, y1: Math.min(y1, y2), y2: Math.max(y1, y2), netId });
      }

      function addDot(x, y) {
        // Evitar puntos duplicados en exactamente la misma coordenada
        if (!junctions.some(j => Math.abs(j.x - x) < 1 && Math.abs(j.y - y) < 1)) {
          junctions.push({ x, y });
        }
      }

      // ------------------------------------------------------------------------
      // 1. DIBUJAR ENTRADAS (D, C, B, A) Y BUSES DE SEÑALES
      // ------------------------------------------------------------------------
      for (let i = 0; i < 4; i++) {
        const y = varBaseY[i];
        const netTrue = `var_${i}_true`;
        const netInv = `var_${i}_inv`;

        // Etiqueta de entrada a la izquierda (estilo Arial bold limpio)
        shapes.push(`<text x="${labelX}" y="${y + 6}" font-family="${FONT}" font-size="18" font-weight="600" fill="#000000" text-anchor="end">${VARS[i]}</text>`);

        // Encontrar el punto más a la derecha de la línea horizontal principal de la variable
        let maxLineX = inputLeadEndX;
        if (neededTrue[i] && trueBusX[i] > maxLineX) maxLineX = trueBusX[i];
        if (notGateMode === 'bus' && neededInv[i]) maxLineX = Math.max(maxLineX, 96);

        addHLine(inputStartX, maxLineX, y, netTrue);

        // Si se usa modo 'bus' y se necesita la versión negada, colocar compuerta NOT debajo
        if (notGateMode === 'bus' && neededInv[i]) {
          const ny = invGateY[i];
          const tapX = 86;
          const gateStartX = 100;
          const notW = 24;
          const bubbleR = 4.2;

          // Derivación vertical desde la línea principal hacia la entrada del inversor
          if (maxLineX > tapX) {
            addDot(tapX, y);
          }
          addVLine(tapX, y, ny, netTrue);
          addHLine(tapX, gateStartX, ny, netTrue);

          // Símbolo estándar compuerta NOT (triángulo + burbuja blanca con borde negro)
          const triPoints = `${gateStartX},${ny - 11} ${gateStartX},${ny + 11} ${gateStartX + notW},${ny}`;
          shapes.push(`<polygon points="${triPoints}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round" />`);
          shapes.push(el('circle', {
            cx: gateStartX + notW + bubbleR,
            cy: ny,
            r: bubbleR,
            fill: '#ffffff',
            stroke: STROKE,
            'stroke-width': SW
          }));

          // Cable desde salida del inversor hasta su pista vertical en el bus
          const invOutX = gateStartX + notW + bubbleR * 2;
          addHLine(invOutX, invBusX[i], ny, netInv);
        }
      }

      // Calcular el rango vertical (minY, maxY) que necesita cada pista del bus
      const trueBusMinY = [...varBaseY];
      const trueBusMaxY = [...varBaseY];
      const invBusMinY = [...invGateY];
      const invBusMaxY = [...invGateY];

      termLayouts.forEach(tl => {
        tl.term.literals.forEach((lit, pIdx) => {
          const targetY = tl.pinYs[pIdx];
          if (!lit.inverted || notGateMode === 'inline') {
            trueBusMinY[lit.varIdx] = Math.min(trueBusMinY[lit.varIdx], targetY);
            trueBusMaxY[lit.varIdx] = Math.max(trueBusMaxY[lit.varIdx], targetY);
          } else {
            invBusMinY[lit.varIdx] = Math.min(invBusMinY[lit.varIdx], targetY);
            invBusMaxY[lit.varIdx] = Math.max(invBusMaxY[lit.varIdx], targetY);
          }
        });
      });

      // Trazar los rieles verticales del bus
      for (let i = 0; i < 4; i++) {
        if (neededTrue[i]) {
          addVLine(trueBusX[i], trueBusMinY[i], trueBusMaxY[i], `var_${i}_true`);
        }
        if (notGateMode === 'bus' && neededInv[i]) {
          addVLine(invBusX[i], invBusMinY[i], invBusMaxY[i], `var_${i}_inv`);
        }
      }

      // ------------------------------------------------------------------------
      // 2. CONECTAR BUSES A LAS COMPUERTAS AND (O CABLE DIRECTO SI ES 1 LITERAL)
      // ------------------------------------------------------------------------
      termLayouts.forEach(tl => {
        const { term, groupIdx, gateX, gateW, gateH, topY, centerY, pinYs } = tl;
        const k = term.literals.length;

        // Conectar cada literal desde su bus hasta el pin de entrada correspondiente
        term.literals.forEach((lit, pIdx) => {
          const pinY = pinYs[pIdx];
          const useInvBus = lit.inverted && notGateMode === 'bus';
          const srcX = useInvBus ? invBusX[lit.varIdx] : trueBusX[lit.varIdx];
          const netId = useInvBus ? `var_${lit.varIdx}_inv` : `var_${lit.varIdx}_true`;

          // Si el bus vertical continúa tanto arriba como abajo de esta derivación, poner punto negro
          const busTop = useInvBus ? invBusMinY[lit.varIdx] : trueBusMinY[lit.varIdx];
          const busBot = useInvBus ? invBusMaxY[lit.varIdx] : trueBusMaxY[lit.varIdx];
          const isBusOrigin = !useInvBus && Math.abs(pinY - varBaseY[lit.varIdx]) < 1;

          if (!isBusOrigin && pinY > busTop + 1 && pinY < busBot - 1) {
            addDot(srcX, pinY);
          } else if (isBusOrigin && (busTop < pinY - 1 || busBot > pinY + 1)) {
            addDot(srcX, pinY);
          }

          if (k === 1 && singleTermOnly) {
            // Caso de 1 solo literal en toda la función: va directo hacia la salida Q
            if (lit.inverted && notGateMode === 'inline') {
              const notX = gateX;
              const notW = 28;
              const bubR = 4.5;
              addHLine(srcX, notX, pinY, netId);
              shapes.push(`<g class="schematic-gate-group" data-sch-group="${groupIdx}">
                <polygon points="${notX},${pinY - 13} ${notX},${pinY + 13} ${notX + notW},${pinY}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round" />
                <circle cx="${notX + notW + bubR}" cy="${pinY}" r="${bubR}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" />
              </g>`);
              addHLine(notX + notW + bubR * 2, outputTipX, pinY, `term_${groupIdx}`);
            } else {
              addHLine(srcX, outputTipX, pinY, netId);
            }
          } else if (k === 1 && !singleTermOnly) {
            // Término de 1 solo literal dentro de una suma OR (ej. F = D + BC): no necesita compuerta AND
            if (lit.inverted && notGateMode === 'inline') {
              const notX = gateX + 10;
              const notW = 26;
              const bubR = 4.2;
              addHLine(srcX, notX, pinY, netId);
              shapes.push(`<g class="schematic-gate-group" data-sch-group="${groupIdx}">
                <polygon points="${notX},${pinY - 12} ${notX},${pinY + 12} ${notX + notW},${pinY}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round" />
                <circle cx="${notX + notW + bubR}" cy="${pinY}" r="${bubR}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" />
              </g>`);
              tl.termOutX = notX + notW + bubR * 2;
            } else {
              tl.termOutX = srcX;
            }
          } else {
            // Compuerta AND de 2, 3 o 4 entradas
            if (lit.inverted && notGateMode === 'inline') {
              // Burbuja de negación justo en el pin de entrada de la compuerta AND
              const bubR = 4.2;
              addHLine(srcX, gateX - bubR * 2, pinY, netId);
              shapes.push(`<circle cx="${gateX - bubR}" cy="${pinY}" r="${bubR}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" />`);
            } else {
              addHLine(srcX, gateX, pinY, netId);
            }
          }
        });

        // Dibujar cuerpo de la compuerta AND si tiene >= 2 literales
        if (k >= 2) {
          const r = gateH / 2;
          const straightW = Math.max(18, gateW - r);
          const andPath = `M ${gateX} ${topY} L ${gateX + straightW} ${topY} A ${r} ${r} 0 0 1 ${gateX + straightW} ${topY + gateH} L ${gateX} ${topY + gateH} Z`;

          shapes.push(`
            <g class="schematic-gate-group" data-sch-group="${groupIdx}">
              <path d="${andPath}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round" />
            </g>
          `);
          tl.termOutX = gateX + straightW + r;
        }
      });

      // ------------------------------------------------------------------------
      // 3. CONECTAR SALIDAS DE TÉRMINOS A LA COMPUERTA OR FINAL (O DIRECTO A Q)
      // ------------------------------------------------------------------------
      if (singleTermOnly) {
        if (terms[0].literals.length >= 2) {
          addHLine(termLayouts[0].termOutX, outputTipX, termLayouts[0].centerY, 'term_0');
        }
        shapes.push(`<text x="${outputLabelX}" y="${termLayouts[0].centerY + 7}" font-family="${FONT}" font-size="20" font-weight="700" fill="#000000" text-anchor="start">Q</text>`);
      } else {
        // Enrutamiento ortogonal escalonado desde cada término hacia los pines de la compuerta OR
        // Para evitar cruces innecesarios, las pistas verticales se escalonan ordenadamente
        const midIndex = (numTerms - 1) / 2;
        const baseElbowX = andGateX + andGateW + 24;

        termLayouts.forEach((tl, idx) => {
          const startX = tl.termOutX;
          const startY = tl.centerY;
          const targetY = orPinYs[idx];
          const netId = `term_${idx}`;

          // Desplazamiento X escalonado para que los tramos verticales nunca se superpongan
          const distFromCenter = Math.abs(idx - midIndex);
          const elbowX = baseElbowX + Math.round((midIndex - distFromCenter) * 14);

          // La compuerta OR tiene lado izquierdo cóncavo; el pin entra ligeramente dentro de la curva
          const concaveOffset = getOrConcaveInset(targetY - orTopY, orGateH, orGateW);
          const pinTargetX = orGateX + concaveOffset;

          addHLine(startX, elbowX, startY, netId);
          addVLine(elbowX, startY, targetY, netId);
          addHLine(elbowX, pinTargetX, targetY, netId);
        });

        // Dibujar símbolo estándar IEEE/ANSI de la compuerta OR final
        const orPath = buildOrGatePath(orGateX, orTopY, orGateW, orGateH);
        shapes.push(`
          <g class="schematic-gate-group">
            <path d="${orPath}" fill="#ffffff" stroke="${STROKE}" stroke-width="${SW}" stroke-linejoin="round" />
          </g>
        `);

        // Línea de salida final hacia Q
        addHLine(orGateX + orGateW, outputTipX, orCenterY, 'net_out_Q');
        shapes.push(`<text x="${outputLabelX}" y="${orCenterY + 7}" font-family="${FONT}" font-size="20" font-weight="700" fill="#000000" text-anchor="start">Q</text>`);
      }

      // ------------------------------------------------------------------------
      // 4. GENERAR TRAZOS DE CABLES CON PUENTES SEMICIRCULARES (WIRE HOPS) EN CRUCES
      // ------------------------------------------------------------------------
      const wireSvg = [];
      const HOP_R = 5; // Radio del puente semicircular cuando un cable vertical cruza uno horizontal

      // Primero dibujar todos los segmentos horizontales
      hSegments.forEach(h => {
        wireSvg.push(el('line', {
          x1: h.x1,
          y1: h.y,
          x2: h.x2,
          y2: h.y,
          stroke: STROKE,
          'stroke-width': SW,
          'stroke-linecap': 'round'
        }));
      });

      // Dibujar cada segmento vertical insertando un arco semicircular (bridge) sobre cada cruce ortogonal
      vSegments.forEach(v => {
        // Encontrar todos los segmentos horizontales de OTRA red que cruzan estrictamente este segmento vertical
        const crossingsY = [];
        hSegments.forEach(h => {
          if (h.netId === v.netId) return;
          if (v.x > h.x1 + 2 && v.x < h.x2 - 2 && h.y > v.y1 + HOP_R + 1 && h.y < v.y2 - HOP_R - 1) {
            // Evitar duplicados muy cercanos
            if (!crossingsY.some(cy => Math.abs(cy - h.y) < 3)) {
              crossingsY.push(h.y);
            }
          }
        });

        crossingsY.sort((a, b) => a - b);

        if (crossingsY.length === 0) {
          wireSvg.push(el('line', {
            x1: v.x,
            y1: v.y1,
            x2: v.x,
            y2: v.y2,
            stroke: STROKE,
            'stroke-width': SW,
            'stroke-linecap': 'round'
          }));
        } else {
          // Construir path vertical con saltos semicirculares hacia la izquierda (como en la foto de referencia)
          let d = `M ${v.x} ${v.y1}`;
          crossingsY.forEach(cy => {
            d += ` L ${v.x} ${cy - HOP_R}`;
            // Arco semicircular de radio HOP_R rodeando el cruce por la izquierda
            d += ` A ${HOP_R} ${HOP_R} 0 0 0 ${v.x} ${cy + HOP_R}`;
          });
          d += ` L ${v.x} ${v.y2}`;

          wireSvg.push(`<path d="${d}" fill="none" stroke="${STROKE}" stroke-width="${SW}" stroke-linecap="round" />`);
        }
      });

      // Dibujar puntos negros sólidos en todas las derivaciones (T-junctions)
      const dotSvg = junctions.map(pt =>
        el('circle', {
          cx: pt.x,
          cy: pt.y,
          r: 3.6,
          fill: '#000000'
        })
      );

      // Ensamblar el documento SVG final (primero cables, luego compuertas con fondo blanco, luego puntos de unión)
      wrapper.innerHTML = `
        <svg id="logic-schematic-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" style="max-width: 100%; height: auto; background: #ffffff;">
          <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="#ffffff" />
          <g id="schematic-wires">${wireSvg.join('\n')}</g>
          <g id="schematic-gates">${shapes.join('\n')}</g>
          <g id="schematic-junctions">${dotSvg.join('\n')}</g>
        </svg>
      `;

      // Si había un grupo seleccionado por hover/clic, mantener su resaltado
      if (hoveredGroupIndex !== null) {
        highlightSchematicGroup(hoveredGroupIndex);
      }
    }

    /**
     * Genera la ruta SVG exacta de una compuerta OR estándar IEEE/ANSI
     */
    function buildOrGatePath(x, y, w, h) {
      const backCurve = w * 0.24;
      const bodyStart = w * 0.42;
      const midY = y + h / 2;
      return [
        `M ${x} ${y}`,
        `L ${x + bodyStart} ${y}`,
        `Q ${x + w * 0.82} ${y} ${x + w} ${midY}`,
        `Q ${x + w * 0.82} ${y + h} ${x + bodyStart} ${y + h}`,
        `L ${x} ${y + h}`,
        `Q ${x + backCurve} ${midY} ${x} ${y}`,
        'Z'
      ].join(' ');
    }

    /**
     * Calcula cuánto se adentra la curva cóncava trasera de la compuerta OR a una altura relativa relY
     */
    function getOrConcaveInset(relY, h, w) {
      const t = Math.max(0, Math.min(1, relY / h));
      const backCurve = w * 0.24;
      // Curva cuadrática de Bezier: x(t) = 2*(1-t)*t * (backCurve / 2) = (1-t)*t * backCurve
      return (1 - t) * t * backCurve;
    }

    /**
     * ============================================================================
     * EXPORTACIÓN DEL ESQUEMA EN FORMATO SVG Y PNG DE ALTA RESOLUCIÓN
     * ============================================================================
     */

    function downloadSchematicSVG() {
      const svgEl = document.getElementById('logic-schematic-svg');
      if (!svgEl) return;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'esquema_karnaugh_DCBA.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    function downloadSchematicPNG() {
      const svgEl = document.getElementById('logic-schematic-svg');
      if (!svgEl) return;

      const width = Number(svgEl.getAttribute('width')) || 600;
      const height = Number(svgEl.getAttribute('height')) || 300;
      const scale = 3; // Alta resolución 3x para nitidez tipo libro impreso

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        canvas.toBlob(pngBlob => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = 'esquema_karnaugh_DCBA.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(pngUrl);
        }, 'image/png');
      };
      img.src = url;
    }

    /**
     * ============================================================================
     * CONTROLES DE UTILIDAD, FORMATO Y PORTAPAPELES
     * ============================================================================
     */

    function setAllValues(val) {
      kmapValues.fill(val);
      updateMintermsSummary();
      solveAndRender();
    }

    function generateRandomExample() {
      // Genera un patrón realista con grupos interesantes y algunas indiferencias (X)
      for (let m = 0; m < 16; m++) {
        const r = Math.random();
        if (r < 0.45) kmapValues[m] = '1';
        else if (r < 0.60) kmapValues[m] = 'X';
        else kmapValues[m] = '0';
      }
      updateMintermsSummary();
      solveAndRender();
    }

    function setNegationStyle(style) {
      negationStyle = style;
      const btnPrime = document.getElementById('fmt-prime');
      const btnOverline = document.getElementById('fmt-overline');

      if (style === 'prime') {
        btnPrime.className = 'px-2.5 py-1 rounded-md font-mono-code font-medium bg-white text-slate-900 shadow-xs transition cursor-pointer';
        btnOverline.className = 'px-2.5 py-1 rounded-md font-mono-code font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer';
      } else {
        btnOverline.className = 'px-2.5 py-1 rounded-md font-mono-code font-medium bg-white text-slate-900 shadow-xs transition cursor-pointer';
        btnPrime.className = 'px-2.5 py-1 rounded-md font-mono-code font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer';
      }
      renderOutput();
    }

    function copyExpressionToClipboard() {
      let plainText = 'F(D,C,B,A) = ';
      if (currentSpecial === '0') {
        plainText += '0';
      } else if (currentSpecial === '1') {
        plainText += '1';
      } else {
        plainText += currentGroups.map(g => formatPattern(g.pattern, 'prime', false)).join(' + ');
      }

      const tempInput = document.createElement('textarea');
      tempInput.value = plainText;
      tempInput.style.position = 'fixed';
      tempInput.style.opacity = '0';
      document.body.appendChild(tempInput);
      tempInput.select();

      try {
        document.execCommand('copy');
        const label = document.getElementById('copy-label');
        label.textContent = '¡Copiado!';
        setTimeout(() => {
          label.textContent = 'Copiar';
        }, 1600);
      } catch (err) {
        // Fallback silencioso
      } finally {
        document.body.removeChild(tempInput);
      }
    }

    /**
     * Inicialización al cargar la página
     */
    window.addEventListener('DOMContentLoaded', () => {
      buildKMapGrid();

      // Cargar un ejemplo inicial ilustrativo (ej. D'C + BA')
      // m4(0100), m5(0101), m6(0110), m7(0111) -> D'C
      // m2(0010), m6(0110), m10(1010), m14(1110) -> BA'
      [4, 5, 6, 7, 2, 10, 14].forEach(m => {
        kmapValues[m] = '1';
      });
      kmapValues[15] = 'X';

      updateMintermsSummary();
      solveAndRender();

      // Eventos de botones principales
      document.getElementById('btn-generate').addEventListener('click', solveAndRender);
      document.getElementById('btn-clear').addEventListener('click', () => setAllValues('0'));
      document.getElementById('btn-ones').addEventListener('click', () => setAllValues('1'));
      document.getElementById('btn-random').addEventListener('click', generateRandomExample);

      // Eventos de formato y copia
      document.getElementById('fmt-prime').addEventListener('click', () => setNegationStyle('prime'));
      document.getElementById('fmt-overline').addEventListener('click', () => setNegationStyle('overline'));
      document.getElementById('btn-copy').addEventListener('click', copyExpressionToClipboard);

      // Eventos del diagrama esquemático (modo inversores y exportación SVG/PNG)
      document.getElementById('btn-toggle-not-mode').addEventListener('click', () => {
        notGateMode = notGateMode === 'bus' ? 'inline' : 'bus';
        document.getElementById('not-mode-label').textContent = notGateMode === 'bus' ? 'En bus' : 'En entrada';
        renderSchematic();
      });
      document.getElementById('btn-download-svg').addEventListener('click', downloadSchematicSVG);
      document.getElementById('btn-download-png').addEventListener('click', downloadSchematicPNG);
    });