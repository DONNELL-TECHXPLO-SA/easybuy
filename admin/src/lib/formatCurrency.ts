export const formatZar = (value: number | string) => {
  const amount = Number(value);
  return `R${amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
