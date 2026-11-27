/**
 * Generación y dibujo del esquema SVG.
 * Este archivo comparte el ámbito clásico con los demás scripts del taller.
 */

    function renderSchematic() {
      const wrapper = document.getElementById('schematic-wrapper');
      if (!wrapper) return;

      const VARS = varNames;

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
      link.download = `esquema_karnaugh_${varNames.join('')}.svg`;
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
          link.download = `esquema_karnaugh_${varNames.join('')}.png`;
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
