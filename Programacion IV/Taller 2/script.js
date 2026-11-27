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
        return;
      }

      currentSpecial = null;
      const allTerms = [...ones, ...dontCares];
      const primeImplicants = findPrimeImplicants(allTerms);
      currentGroups = selectMinimumCover(primeImplicants, ones);

      renderOutput();
      updateCellVisuals();
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
        });
        item.addEventListener('mouseleave', () => {
          hoveredGroupIndex = null;
          updateCellVisuals();
        });
        item.addEventListener('click', () => {
          hoveredGroupIndex = hoveredGroupIndex === idx ? null : idx;
          updateCellVisuals();
        });
      });
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
    });
