import dayjs from 'dayjs';
import { calendarUtils } from './calendarUtils';

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
 * Formata um intervalo de datas a partir da data inicial e final em uma string com a data por extenso incluindo o mês completo com a primeira letra maiúscula.
 *
 * @param startsAt - Uma string representando a data inicial, no formato 'YYYY-MM-DD'.
 * @param endsAt - Uma string representando a data final, no formato 'YYYY-MM-DD'.
 * @returns Uma string com o intervalo de datas formatado, onde a primeira letra do mês é maiúscula.
 *
 * @example
 * // Entrada: '2024-07-16', '2024-07-19'
 * // Saída: '16 à 19 de Julho'
 */
export const dateRangeWithFullMonth = (
  startsAt: string,
  endsAt: string,
): string => {
  return calendarUtils.formatDatesInText({
    startsAt: dayjs(startsAt),
    endsAt: dayjs(endsAt),
  });
};

/**
 * Formata um intervalo de datas para garantir que o mês é abreviado.
 *
 * @param startsAt - Uma string representando a data inicial, no formato 'YYYY-MM-DD'.
 * @param endsAt - Uma string representando a data final, no formato 'YYYY-MM-DD'.
 * @returns Uma string com o intervalo de datas formatado, onde o mês é abreviado e a primeira letra é maiúscula.
 *
 * @example
 * // Entrada: '2024-07-16', '2024-07-19'
 * // Saída: '16 à 19 de Jul.'
 */
export const dateRangeWithShortMonth = (
  startsAt: string,
  endsAt: string,
): string => {
  const formattedDates = dateRangeWithFullMonth(startsAt, endsAt);
  const formattedDatesArray = formattedDates.split(' ');
  formattedDatesArray[formattedDatesArray.length - 1] = formattedDatesArray[
    formattedDatesArray.length - 1
  ].slice(0, 3);
  return formattedDatesArray.join(' ');
};
