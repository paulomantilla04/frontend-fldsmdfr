/**
 * Utilidades para validación de fechas
 * Previene selección de fechas futuras en todo el sistema
 */

/**
 * Obtiene la fecha máxima permitida (hoy) en formato YYYY-MM-DD
 * @returns Fecha actual en formato ISO (solo fecha)
 */
export const getMaxDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Obtiene la fecha mínima sugerida (hace 10 años) en formato YYYY-MM-DD
 * @returns Fecha hace 10 años en formato ISO (solo fecha)
 */
export const getMinDate = (): string => {
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  return tenYearsAgo.toISOString().split('T')[0];
};

/**
 * Valida que una fecha no sea futura
 * @param date Fecha a validar en formato string
 * @returns true si la fecha es válida (no futura), false si es inválida
 */
export const isDateValid = (date: string): boolean => {
  if (!date) return false;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Fin del día de hoy
  
  return inputDate <= today;
};

/**
 * Valida que una fecha no sea futura y retorna un mensaje de error si lo es
 * @param date Fecha a validar
 * @param fieldName Nombre del campo para el mensaje de error
 * @returns string vacío si es válida, mensaje de error si no lo es
 */
export const validateDateNotFuture = (date: string, fieldName: string = "La fecha"): string => {
  if (!date) return `${fieldName} es requerida`;
  
  if (!isDateValid(date)) {
    return `${fieldName} no puede ser posterior a la fecha actual`;
  }
  
  return "";
};

/**
 * Formatea una fecha para mostrar en formato legible
 * @param date Fecha en formato ISO o Date
 * @returns Fecha formateada en español
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Formatea una fecha para mostrar en formato corto
 * @param date Fecha en formato ISO o Date
 * @returns Fecha formateada DD/MM/YYYY
 */
export const formatDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj);
};

/**
 * Convierte una fecha UTC a fecha local en formato YYYY-MM-DD
 * Útil para inputs tipo date
 * @param utcDate Fecha en formato UTC
 * @returns Fecha local en formato YYYY-MM-DD
 */
export const utcToLocalDate = (utcDate: string): string => {
  if (!utcDate) return '';
  
  const date = new Date(utcDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Props para input de fecha con validación
 */
export const getDateInputProps = () => ({
  type: 'date' as const,
  max: getMaxDate(),
  min: getMinDate(),
});
