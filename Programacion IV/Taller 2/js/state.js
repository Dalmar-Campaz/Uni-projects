/**
 * Estado compartido y configuración.
 * Este archivo comparte el ámbito clásico con los demás scripts del taller.
 */

    /**
     * ============================================================================
     * CONFIGURACIÓN Y ESTADO GLOBAL DEL MAPA DE KARNAUGH 4x4
     * ============================================================================
     */

    // Orden de código Gray de 2 bits para filas [V3, V2] y columnas [V1, V0]
    const GRAY_CODES = [
      { bits: '00', val: 0 },
      { bits: '01', val: 1 },
      { bits: '11', val: 3 },
      { bits: '10', val: 2 }
    ];

    // Variables activas en orden [Bit 3 (MSB fila), Bit 2 (LSB fila), Bit 1 (MSB col), Bit 0 (LSB col)]
    let varNames = ['D', 'C', 'B', 'A'];
    let activePreset = 'DCBA';

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
