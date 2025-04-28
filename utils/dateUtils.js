/**
 * Utilidades para el manejo de fechas con ajuste a GMT-4 (Chile)
 */

// Constante para el offset GMT-4 en milisegundos
const GMT4_OFFSET_MS = -4 * 60 * 60 * 1000; // -4 horas en milisegundos

/**
 * Ajusta una fecha a la zona horaria GMT-4
 * @param {Date|string} fecha - Fecha a ajustar
 * @returns {Date} Fecha ajustada a GMT-4
 */
export function ajustarAGMT4(fecha) {
  if (!fecha) return null;
  
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  
  if (isNaN(fechaObj.getTime())) {
    console.error('Fecha inválida:', fecha);
    return null;
  }
  
  // Calcular el offset del usuario
  const userTimezoneOffset = fechaObj.getTimezoneOffset() * 60000; // en milisegundos
  
  // Ajustar a GMT-4
  return new Date(fechaObj.getTime() + userTimezoneOffset - GMT4_OFFSET_MS);
}

/**
 * Formatea una fecha a YYYY-MM-DD en zona horaria GMT-4
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada como YYYY-MM-DD
 */
export function formatearFechaGMT4(fecha) {
  const fechaGMT4 = ajustarAGMT4(fecha);
  if (!fechaGMT4) return '';
  
  return fechaGMT4.toISOString().split('T')[0];
}

/**
 * Formatea una fecha según la localización es-CL en zona horaria GMT-4
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada según localización es-CL (DD-MM-YYYY)
 */
export function formatearFechaChilena(fecha) {
  const fechaGMT4 = ajustarAGMT4(fecha);
  if (!fechaGMT4) return '';
  
  return fechaGMT4.toLocaleDateString('es-CL');
}

/**
 * Compara si dos fechas corresponden al mismo día en GMT-4
 * @param {Date|string} fecha1 - Primera fecha
 * @param {Date|string} fecha2 - Segunda fecha
 * @returns {boolean} true si ambas fechas son del mismo día
 */
export function sonMismoDiaGMT4(fecha1, fecha2) {
  if (!fecha1 || !fecha2) return false;
  
  const fecha1GMT4 = ajustarAGMT4(fecha1);
  const fecha2GMT4 = ajustarAGMT4(fecha2);
  
  if (!fecha1GMT4 || !fecha2GMT4) return false;
  
  return fecha1GMT4.toISOString().split('T')[0] === fecha2GMT4.toISOString().split('T')[0];
}

/**
 * Obtiene la fecha actual en GMT-4
 * @returns {Date} Fecha actual en GMT-4
 */
export function obtenerFechaActualGMT4() {
  return ajustarAGMT4(new Date());
}

/**
 * Imprime información de debug sobre una fecha (útil para depuración)
 * @param {Date|string} fecha - Fecha a debuggear
 * @param {string} etiqueta - Etiqueta para identificar la fecha en el log
 */
export function debugFecha(fecha, etiqueta = 'Fecha') {
  if (!fecha) {
    console.log(`${etiqueta}: null o undefined`);
    return;
  }
  
  const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
  
  if (isNaN(fechaObj.getTime())) {
    console.log(`${etiqueta}: Inválida (${fecha})`);
    return;
  }
  
  const fechaGMT4 = ajustarAGMT4(fechaObj);
  
  /*console.log(`${etiqueta}:`);
  console.log(`  Original ISO: ${fechaObj.toISOString()}`);
  console.log(`  GMT-4 ISO: ${fechaGMT4.toISOString()}`);
  console.log(`  Original Local: ${fechaObj.toString()}`);
  console.log(`  GMT-4 Local: ${fechaGMT4.toString()}`);
  console.log(`  Fecha formateada GMT-4 (YYYY-MM-DD): ${formatearFechaGMT4(fechaObj)}`);
  console.log(`  Fecha formateada GMT-4 (es-CL): ${formatearFechaChilena(fechaObj)}`); */
}