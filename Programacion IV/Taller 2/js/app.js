/**
 * Inicialización y conexión de eventos.
 * Este archivo comparte el ámbito clásico con los demás scripts del taller.
 */

    /**
     * Inicialización al cargar la página
     */
    window.addEventListener('DOMContentLoaded', () => {
      syncVariableLabelsUI();
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

      // Eventos de presets y personalización de variables
      document.querySelectorAll('.var-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const preset = btn.dataset.preset;
          if (preset === 'CUSTOM') {
            activePreset = 'CUSTOM';
            syncVariableLabelsUI();
            const firstInput = document.getElementById('var-input-0');
            if (firstInput) {
              firstInput.focus();
              firstInput.select();
            }
          } else {
            applyVariableNames(preset.split(''), preset);
          }
        });
      });

      document.getElementById('btn-reverse-vars').addEventListener('click', () => {
        applyVariableNames([...varNames].reverse());
      });

      document.querySelectorAll('.var-letter-input').forEach((inp, idx) => {
        inp.addEventListener('focus', () => inp.select());
        inp.addEventListener('input', e => handleCustomLetterInput(idx, e.target.value));
      });

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