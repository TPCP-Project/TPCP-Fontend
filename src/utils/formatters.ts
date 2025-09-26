export const formatCurrency = (n: number, locale = 'vi-VN', currency = 'VND') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n)
