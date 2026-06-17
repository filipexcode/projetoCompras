const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

export function formatCurrency(value: number): string {
    const safeValue = Number.isFinite(value) ? value : 0;
    return currencyFormatter.format(safeValue);
}
