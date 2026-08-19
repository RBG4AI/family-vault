const last4 = (value) => {
  const text = String(value || '').replace(/\s/g, '');
  if (!text) return '';
  if (text.length <= 4) return '••••';
  return `••••${text.slice(-4)}`;
};

const rowsFor = (items, pick) => (items || []).map(pick).filter((row) => row.label);

export const buildEmergencySheet = (data = {}) => {
  const people = (data.people || []).map((person) => ({
    name: person.name,
    relation: person.relation || '',
    phone: person.phone || '',
    emergencyPhone: person.emergencyPhone || '',
    bloodGroup: person.bloodGroup || '',
    doctorName: person.doctorName || '',
    lockerHint: person.lockerHint || '',
  }));

  return {
    people,
    ids: rowsFor(data.government, (item) => ({
      label: item.documentType || 'ID',
      value: last4(item.documentNumber),
      extra: item.holderName || '',
    })),
    insurance: rowsFor(data.insurance, (item) => ({
      label: item.insuranceType || 'Insurance',
      value: last4(item.policyNumber),
      extra: item.provider || '',
    })),
    banking: rowsFor(data.banking, (item) => ({
      label: item.bankName || 'Bank',
      value: last4(item.accountNumber),
      extra: item.ifscCode || '',
    })),
    vehicles: rowsFor(data.vehicles, (item) => ({
      label: item.name || 'Vehicle',
      value: item.registrationNumber || '',
      extra: item.insurer || '',
    })),
  };
};
