import dayjs from 'dayjs';

/**
 * Formata uma data no formato 'YYYY-MM-DD' para 'DD de MMM.'
 *
 * @param date - A data no formato 'YYYY-MM-DD'.
 * @returns Uma string formatada como 'DD de MMM.', onde o mês é abreviado e a primeira letra é maiúscula.
 *
 * @example
 * // Entrada: '2024-07-15'
 * // Saída: '15 de Jul.'
 */
export const isoToFullDateWithShortMonth = (date: string): string => {
  const formattedDate = dayjs(date).format('DD [de] MMM.');
  return formattedDate.replace(
    /de (\w{3})/,
    (_, p1) => `de ${p1.charAt(0).toUpperCase() + p1.slice(1)}`,
  );
};

/**
 * Formata um intervalo de datas para garantir que o mês é abreviado.
 *
 * @param formattedDates - Uma string representando um intervalo de datas, como '16 à 19 de Julho'.
 * @returns Uma string com o intervalo de datas formatado, onde o mês é abreviado e a primeira letra é maiúscula.
 *
 * @example
 * // Entrada: '16 à 19 de Julho'
 * // Saída: '16 à 19 de Jul.'
 */
export const dateRangeWithShortMonth = (formattedDates: string): string => {
  const formattedDatesArray = formattedDates.split(' ');
  formattedDatesArray[formattedDatesArray.length - 1] = formattedDatesArray[
    formattedDatesArray.length - 1
  ].slice(0, 3);
  return formattedDatesArray.join(' ');
};
