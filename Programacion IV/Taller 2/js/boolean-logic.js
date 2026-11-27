/**
 * Simplificación booleana: Quine-McCluskey y Petrick.
 * Este archivo comparte el ámbito clásico con los demás scripts del taller.
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
     * Posición 0 -> varNames[0], Posición 1 -> varNames[1], Posición 2 -> varNames[2], Posición 3 -> varNames[3]
     */
    function formatPattern(pattern, style = 'prime', asHtml = false) {
      const vars = varNames;
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