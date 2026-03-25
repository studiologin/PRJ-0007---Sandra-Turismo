/**
 * Formats a date string from YYYY-MM-DD to DD/MM/YYYY.
 * If the input is invalid, returns the original string.
 */
export const formatDateBR = (dateStr: string): string => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;

    try {
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateStr;
    }
};

/**
 * Formats a month string from YYYY-MM to Long Month/YYYY.
 */
export const formatMonthBR = (monthStr: string): string => {
    if (!monthStr || !monthStr.includes('-')) return monthStr;

    try {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    } catch (error) {
        console.error('Error formatting month:', error);
        return monthStr;
    }
};
