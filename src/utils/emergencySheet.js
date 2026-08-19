const last4 = (value) => {
  const raw = String(value || '').replace(/\s/g, '');
  if (!raw) return '';
  if (raw.length <= 4) return raw;
  return `•••• ${raw.slice(-4)}`;
};

const text = (value) => {
  const next = String(value || '').trim();
  return next || '';
};

const rowsFor = (items, pick) => (items || []).map(pick).filter((row) => row.title);

export const buildEmergencySheet = (data = {}) => {
  const people = (data.people || []).map((person) => ({
    id: person.id,
    name: text(person.name),
    relation: text(person.relation),
    birthday: text(person.birthday),
    phone: text(person.phone),
    email: text(person.email),
    emergencyPhone: text(person.emergencyPhone),
    bloodGroup: text(person.bloodGroup),
    allergies: text(person.allergies),
    doctorName: text(person.doctorName),
    lockerHint: text(person.lockerHint),
  }));

  return {
    people,
    ids: rowsFor(data.government, (item) => ({
      title: text(item.documentType) || 'ID',
      holder: text(item.holderName),
      number: text(item.documentNumber),
      expiry: text(item.expiryDate),
      extra: text(item.issuingAuthority),
    })),
    insurance: rowsFor(data.insurance, (item) => ({
      title: text(item.insuranceType) || 'Insurance',
      holder: text(item.policyHolderName),
      number: text(item.policyNumber),
      extra: [text(item.provider), text(item.nominee) && `Nominee ${item.nominee}`, text(item.policyEndDate)].filter(Boolean).join(' · '),
    })),
    banking: rowsFor(data.banking, (item) => ({
      title: text(item.bankName) || 'Bank',
      holder: '',
      number: text(item.accountNumber),
      extra: [text(item.ifscCode), text(item.nominee) && `Nominee ${item.nominee}`].filter(Boolean).join(' · '),
    })),
    cards: rowsFor(data.cards, (item) => ({
      title: text(item.cardType) || 'Card',
      holder: text(item.cardHolderName) || text(item.bankName),
      number: last4(item.cardNumber),
      extra: [text(item.bankName), text(item.expiryDate)].filter(Boolean).join(' · '),
    })),
    vehicles: rowsFor(data.vehicles, (item) => ({
      title: text(item.name) || 'Vehicle',
      holder: text(item.vehicleType),
      number: text(item.registrationNumber),
      extra: [text(item.insurer), text(item.policyNumber), text(item.insuranceExpiry)].filter(Boolean).join(' · '),
    })),
    properties: rowsFor(data.properties, (item) => ({
      title: text(item.name) || 'Property',
      holder: text(item.propertyType),
      number: text(item.surveyNumber),
      extra: text(item.address),
    })),
    investments: rowsFor(data.investments, (item) => ({
      title: text(item.name) || text(item.investmentType) || 'Investment',
      holder: text(item.platform),
      number: text(item.accountNumber),
      extra: [text(item.investmentType), text(item.nominee) && `Nominee ${item.nominee}`, text(item.maturityDate)].filter(Boolean).join(' · '),
    })),
  };
};
