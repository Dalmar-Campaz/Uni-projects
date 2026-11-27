/**
 * Acciones, formato y portapapeles.
 * Este archivo comparte el ámbito clásico con los demás scripts del taller.
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
      let plainText = `F(${varNames.join(',')}) = `;
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
