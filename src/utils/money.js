export const formatInr = (value) => {
  const n = Number(value) || 0;
  if (n >= 10000000) {
    const cr = n / 10000000;
    return `₹${cr.toFixed(cr >= 10 ? 0 : 1)} Cr`;
  }
  if (n >= 100000) {
    const lakh = n / 100000;
    return `₹${lakh.toFixed(lakh >= 10 ? 0 : 1)} L`;
  }
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

export const holdingValue = (item) => Number(item?.currentValue) || Number(item?.amountInvested) || 0;
