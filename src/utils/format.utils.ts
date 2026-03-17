export const bold = (text: string): string => `<b>${text}</b>`;

export const italic = (text: string): string => `<i>${text}</i>`;

export const code = (text: string): string => `<code>${text}</code>`;

export const formatDate = (date: Date): string =>
    date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });