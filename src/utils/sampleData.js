import { updateVaultData } from '../storage/session';
import { taggedError } from '../i18n/vaultErrors';

const PREFIX = 'sample-';
const TAG = 'sample';

const KEYS = [
  'people',
  'credentials',
  'emails',
  'banking',
  'cards',
  'government',
  'insurance',
  'investments',
  'vehicles',
  'properties',
  'notes',
  'vitals',
];

const pad = (value) => String(value).padStart(2, '0');

const shiftDays = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const shiftMonth = (offset) => {
  const date = new Date();
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

const birthdayOn = (offsetDays, year = 1988) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return `${year}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const stamp = (id, fields) => ({
  id: `${PREFIX}${id}`,
  tags: [TAG],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...fields,
});

const PERSON = {
  asha: `${PREFIX}person-asha`,
  rohan: `${PREFIX}person-rohan`,
  meera: `${PREFIX}person-meera`,
  kabir: `${PREFIX}person-kabir`,
  nisha: `${PREFIX}person-nisha`,
};

const mergeSample = (existing = [], incoming = []) => {
  const kept = existing.filter((item) => !String(item.id || '').startsWith(PREFIX));
  return [...kept, ...incoming];
};

const buildSample = () => {
  const people = [
    stamp('person-asha', {
      name: 'Asha Sharma',
      relation: 'Self',
      birthday: birthdayOn(18, 1988),
      phone: '9876543210',
      email: 'asha.sample@example.com',
      notes: 'Demo record. Not a real person.',
    }),
    stamp('person-rohan', {
      name: 'Rohan Sharma',
      relation: 'Spouse',
      birthday: birthdayOn(40, 1986),
      phone: '9876543211',
      email: 'rohan.sample@example.com',
    }),
    stamp('person-meera', {
      name: 'Meera Sharma',
      relation: 'Parent',
      birthday: birthdayOn(-12, 1961),
      phone: '9876543212',
      email: 'meera.sample@example.com',
    }),
    stamp('person-kabir', {
      name: 'Kabir Sharma',
      relation: 'Child',
      birthday: birthdayOn(55, 2014),
      phone: '',
      email: '',
    }),
    stamp('person-nisha', {
      name: 'Nisha Sharma',
      relation: 'Sibling',
      birthday: birthdayOn(70, 1992),
      phone: '9876543213',
      email: 'nisha.sample@example.com',
    }),
  ];

  const credentials = [
    stamp('login-gmail', {
      personId: PERSON.asha,
      appName: 'Gmail',
      username: 'asha.sample@example.com',
      password: 'SamplePass1!',
      notes: 'Demo login',
    }),
    stamp('login-netflix', {
      personId: PERSON.rohan,
      appName: 'Netflix',
      username: 'sharma.family.sample',
      password: 'SamplePass2!',
      notes: 'Shared household profile',
    }),
    stamp('login-epfo', {
      personId: PERSON.asha,
      appName: 'EPFO member portal',
      username: 'ASHA_SAMPLE_UAN',
      password: 'SamplePass3!',
    }),
    stamp('login-instagram', {
      personId: PERSON.nisha,
      appName: 'Instagram',
      username: 'nisha.sample',
      password: 'SamplePass4!',
      notes: 'Personal account',
    }),
  ];

  const emails = [
    stamp('email-asha', {
      personId: PERSON.asha,
      emailAddress: 'asha.sample@example.com',
      password: 'SampleMail1!',
      recoveryEmail: 'asha.backup.sample@example.com',
      recoveryPhone: '9876543210',
      twoFactorEnabled: true,
    }),
    stamp('email-rohan', {
      personId: PERSON.rohan,
      emailAddress: 'rohan.sample@example.com',
      password: 'SampleMail2!',
      recoveryEmail: 'asha.sample@example.com',
      twoFactorEnabled: false,
    }),
    stamp('email-nisha', {
      personId: PERSON.nisha,
      emailAddress: 'nisha.sample@example.com',
      password: 'SampleMail3!',
      recoveryPhone: '9876543213',
      twoFactorEnabled: true,
    }),
  ];

  const banking = [
    stamp('bank-hdfc', {
      personId: PERSON.asha,
      bankName: 'HDFC Bank',
      accountNumber: '50100123456789',
      ifscCode: 'HDFC0001234',
      customerId: 'CUST1001',
      netBankingUser: 'asha.sample',
      netBankingPassword: 'SampleBank1!',
      transactionPin: '2468',
      mobilePin: '1357',
    }),
    stamp('bank-sbi', {
      personId: PERSON.rohan,
      bankName: 'State Bank of India',
      accountNumber: '30211234567890',
      ifscCode: 'SBIN0000456',
      customerId: 'CUST2002',
      netBankingUser: 'rohan.sample',
      netBankingPassword: 'SampleBank2!',
      transactionPin: '8642',
    }),
  ];

  const cards = [
    stamp('card-credit', {
      personId: PERSON.asha,
      cardType: 'Credit Card',
      bankName: 'HDFC Bank',
      cardNumber: '4111111111111111',
      cardHolderName: 'ASHA SHARMA',
      expiryDate: shiftMonth(2),
      cvv: '123',
      pin: '2580',
      creditLimit: 250000,
      billingDate: 5,
      dueDate: 18,
    }),
    stamp('card-debit', {
      personId: PERSON.rohan,
      cardType: 'Debit Card',
      bankName: 'State Bank of India',
      cardNumber: '5500000000000004',
      cardHolderName: 'ROHAN SHARMA',
      expiryDate: shiftMonth(14),
      cvv: '456',
      pin: '1470',
    }),
    stamp('card-nisha', {
      personId: PERSON.nisha,
      cardType: 'Credit Card',
      bankName: 'ICICI Bank',
      cardNumber: '4000000000000002',
      cardHolderName: 'NISHA SHARMA',
      expiryDate: shiftMonth(8),
      cvv: '789',
      pin: '3690',
      creditLimit: 150000,
      billingDate: 12,
      dueDate: 2,
    }),
  ];

  const government = [
    stamp('id-pan-asha', {
      personId: PERSON.asha,
      documentType: 'PAN Card',
      documentNumber: 'ABCDE1234F',
      holderName: 'ASHA SHARMA',
      issueDate: '2012-03-14',
      issuingAuthority: 'Income Tax Department',
    }),
    stamp('id-aadhaar-rohan', {
      personId: PERSON.rohan,
      documentType: 'Aadhaar Card',
      documentNumber: '999988887777',
      holderName: 'ROHAN SHARMA',
      issueDate: '2016-08-01',
      issuingAuthority: 'UIDAI',
    }),
    stamp('id-passport', {
      personId: PERSON.asha,
      documentType: 'Passport',
      documentNumber: 'Z1234567',
      holderName: 'ASHA SHARMA',
      issueDate: '2019-01-10',
      expiryDate: shiftDays(12),
      issuingAuthority: 'Passport Seva',
    }),
    stamp('id-dl', {
      personId: PERSON.rohan,
      documentType: 'Driving License',
      documentNumber: 'MH14 20110012345',
      holderName: 'ROHAN SHARMA',
      issueDate: '2011-06-20',
      expiryDate: shiftDays(-8),
      issuingAuthority: 'RTO Pune',
    }),
    stamp('id-uan', {
      personId: PERSON.asha,
      documentType: 'UAN',
      documentNumber: '101234567890',
      holderName: 'ASHA SHARMA',
      issueDate: '2015-09-01',
      issuingAuthority: 'EPFO',
    }),
    stamp('id-voter', {
      personId: PERSON.meera,
      documentType: 'Voter ID',
      documentNumber: 'ABC1234567',
      holderName: 'MEERA SHARMA',
      issueDate: '2005-02-18',
      issuingAuthority: 'Election Commission',
    }),
  ];

  const insurance = [
    stamp('ins-health', {
      personId: PERSON.asha,
      insuranceType: 'Health Insurance',
      policyNumber: 'HLTH-SAMPLE-1001',
      provider: 'HDFC ERGO',
      policyHolderName: 'Asha Sharma',
      sumAssured: 1000000,
      premiumAmount: 18500,
      premiumFrequency: 'Yearly',
      policyStartDate: '2024-04-01',
      policyEndDate: shiftDays(25),
      nominee: 'Rohan Sharma',
      agentName: 'Sample Agent',
      agentContact: '9000012345',
    }),
    stamp('ins-term', {
      personId: PERSON.rohan,
      insuranceType: 'Term Insurance',
      policyNumber: 'TERM-SAMPLE-2002',
      provider: 'LIC',
      policyHolderName: 'Rohan Sharma',
      sumAssured: 15000000,
      premiumAmount: 22000,
      premiumFrequency: 'Yearly',
      policyStartDate: '2020-01-15',
      policyEndDate: shiftDays(90),
      nominee: 'Asha Sharma',
    }),
    stamp('ins-motor', {
      personId: PERSON.rohan,
      insuranceType: 'Motor Insurance',
      policyNumber: 'MOT-SAMPLE-11',
      provider: 'ICICI Lombard',
      policyHolderName: 'Rohan Sharma',
      sumAssured: 650000,
      premiumAmount: 18500,
      premiumFrequency: 'Yearly',
      policyStartDate: '2025-06-01',
      policyEndDate: shiftDays(9),
      nominee: 'Asha Sharma',
    }),
    stamp('ins-home', {
      personId: PERSON.asha,
      insuranceType: 'Home Insurance',
      policyNumber: 'HOME-SAMPLE-33',
      provider: 'Bajaj Allianz',
      policyHolderName: 'Asha Sharma',
      sumAssured: 8000000,
      premiumAmount: 9200,
      premiumFrequency: 'Yearly',
      policyStartDate: '2024-08-01',
      policyEndDate: shiftDays(200),
    }),
  ];

  const investments = [
    stamp('inv-sip', {
      personId: PERSON.asha,
      investmentType: 'Mutual Fund',
      name: 'Nifty 50 index fund',
      platform: 'Groww',
      accountNumber: 'FOLIO-1001',
      amountInvested: 180000,
      currentValue: 214500,
      purchaseDate: '2022-01-10',
    }),
    stamp('inv-fd', {
      personId: PERSON.rohan,
      investmentType: 'FD',
      name: 'HDFC tax saver FD',
      platform: 'HDFC Bank',
      accountNumber: 'FD-7788',
      amountInvested: 5000,
      currentValue: 5450,
      purchaseDate: '2025-04-01',
      maturityDate: shiftDays(45),
    }),
    stamp('inv-gold', {
      personId: PERSON.meera,
      investmentType: 'Gold',
      name: 'Sovereign gold bond',
      platform: 'Zerodha',
      amountInvested: 800,
      currentValue: 920,
      purchaseDate: '2023-11-01',
    }),
    stamp('inv-ppf', {
      personId: PERSON.asha,
      investmentType: 'PPF',
      name: 'PPF Asha',
      platform: 'SBI',
      accountNumber: 'PPF-3321',
      amountInvested: 150000,
      currentValue: 168000,
      purchaseDate: '2018-04-05',
      maturityDate: '2033-04-05',
    }),
    stamp('inv-stock', {
      personId: PERSON.nisha,
      investmentType: 'Stock',
      name: 'HDFC Bank shares',
      platform: 'Zerodha',
      accountNumber: 'DEMAT-9911',
      amountInvested: 45000,
      currentValue: 51200,
      purchaseDate: '2024-02-12',
    }),
    stamp('inv-crypto', {
      personId: PERSON.rohan,
      investmentType: 'Crypto',
      name: 'Bitcoin (demo)',
      platform: 'CoinDCX',
      amountInvested: 600,
      currentValue: 740,
      purchaseDate: '2025-01-08',
    }),
  ];

  const vehicles = [
    stamp('veh-car', {
      personId: PERSON.rohan,
      name: 'Honda City',
      vehicleType: 'Car',
      registrationNumber: 'MH14 SAMPLE',
      insurer: 'ICICI Lombard',
      policyNumber: 'MOT-SAMPLE-11',
      insuranceExpiry: shiftDays(9),
      pucExpiry: shiftDays(33),
      rcExpiry: shiftDays(200),
      notes: 'Demo car',
    }),
    stamp('veh-scooter', {
      personId: PERSON.asha,
      name: 'Activa',
      vehicleType: 'Scooter',
      registrationNumber: 'MH12 SAMPLE',
      insurer: 'Bajaj Allianz',
      policyNumber: 'MOT-SAMPLE-22',
      insuranceExpiry: shiftDays(-3),
      pucExpiry: shiftDays(70),
      rcExpiry: shiftDays(400),
    }),
    stamp('veh-bike', {
      personId: PERSON.nisha,
      name: 'Royal Enfield',
      vehicleType: 'Bike',
      registrationNumber: 'MH14 SAMPLE2',
      insurer: 'New India',
      policyNumber: 'MOT-SAMPLE-33',
      insuranceExpiry: shiftDays(40),
      pucExpiry: shiftDays(18),
      rcExpiry: shiftDays(500),
    }),
  ];

  const properties = [
    stamp('prop-home', {
      personId: PERSON.asha,
      name: 'Koregaon Park flat',
      propertyType: 'Apartment',
      address: '12 Sample Lane, Koregaon Park, Pune 411001',
      surveyNumber: 'S.NO. 12/4',
      taxDueDate: shiftDays(22),
      notes: 'Demo home',
    }),
    stamp('prop-plot', {
      personId: PERSON.meera,
      name: 'Alibaug plot',
      propertyType: 'Plot',
      address: 'Survey 88, Sample village, Alibaug',
      surveyNumber: 'GAT 88',
      taxDueDate: shiftDays(120),
    }),
    stamp('prop-shop', {
      personId: PERSON.rohan,
      name: 'FC Road shop',
      propertyType: 'Shop',
      address: '14 Sample Complex, FC Road, Pune 411004',
      surveyNumber: 'SHOP-14',
      taxDueDate: shiftDays(50),
    }),
  ];

  const notes = [
    stamp('note-wifi', {
      personId: PERSON.asha,
      title: 'Home Wi-Fi',
      content: 'SSID: SharmaHome-Sample\nPassword: SampleWifi1!',
    }),
    stamp('note-locker', {
      personId: PERSON.rohan,
      title: 'Bank locker',
      content: 'HDFC Kalyani Nagar locker 12B. Key with Asha. Demo only.',
    }),
    stamp('note-wifi-guest', {
      personId: PERSON.kabir,
      title: 'Guest Wi-Fi',
      content: 'SSID: SharmaGuest-Sample\nPassword: SampleGuest1!',
    }),
  ];

  const vitals = [
    stamp('vital-asha-1', {
      personId: PERSON.asha,
      date: shiftDays(-21),
      systolic: 118,
      diastolic: 76,
      sugar: 92,
      weight: 62,
      heartRate: 72,
    }),
    stamp('vital-asha-2', {
      personId: PERSON.asha,
      date: shiftDays(-14),
      systolic: 122,
      diastolic: 78,
      sugar: 96,
      weight: 62.4,
      heartRate: 74,
    }),
    stamp('vital-asha-3', {
      personId: PERSON.asha,
      date: shiftDays(-3),
      systolic: 120,
      diastolic: 77,
      sugar: 90,
      weight: 62.1,
      heartRate: 70,
    }),
    stamp('vital-rohan-1', {
      personId: PERSON.rohan,
      date: shiftDays(-10),
      systolic: 128,
      diastolic: 82,
      sugar: 108,
      weight: 78,
      heartRate: 76,
    }),
    stamp('vital-rohan-2', {
      personId: PERSON.rohan,
      date: shiftDays(-2),
      systolic: 126,
      diastolic: 80,
      sugar: 102,
      weight: 77.5,
      heartRate: 74,
    }),
    stamp('vital-meera-1', {
      personId: PERSON.meera,
      date: shiftDays(-21),
      systolic: 142,
      diastolic: 88,
      sugar: 124,
      weight: 64.4,
      heartRate: 80,
    }),
    stamp('vital-meera-2', {
      personId: PERSON.meera,
      date: shiftDays(-7),
      systolic: 138,
      diastolic: 86,
      sugar: 118,
      weight: 64,
      heartRate: 78,
      notes: 'After evening walk',
    }),
  ];

  return {
    people,
    credentials,
    emails,
    banking,
    cards,
    government,
    insurance,
    investments,
    vehicles,
    properties,
    notes,
    vitals,
  };
};

export const loadSampleHousehold = () => {
  const sample = buildSample();
  try {
    updateVaultData((current) => {
      const next = { ...current };
      KEYS.forEach((key) => {
        next[key] = mergeSample(current[key], sample[key]);
      });
      return next;
    });
  } catch (error) {
    throw error.code ? error : taggedError('locked_vault', 'Vault is locked.');
  }
};

export const removeSampleHousehold = () => {
  try {
    updateVaultData((current) => {
      const next = { ...current };
      KEYS.forEach((key) => {
        next[key] = (current[key] || []).filter((item) => !String(item.id || '').startsWith(PREFIX));
      });
      return next;
    });
  } catch (error) {
    throw error.code ? error : taggedError('locked_vault', 'Vault is locked.');
  }
};
