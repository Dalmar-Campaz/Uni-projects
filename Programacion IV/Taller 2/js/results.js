/**
 * Expresión simplificada y grupos.
 * Este archivo comparte el ámbito clásico con los demás scripts del taller.
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