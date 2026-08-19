import React, { useState } from 'react';
import { CreditCard, FileText, Key, Landmark, Mail, Shield, StickyNote, TrendingUp } from 'lucide-react';
import { copyToClipboard, storage } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../context/I18nContext';
import { optionLabel } from '../utils/telLink';
import { formatInr, holdingValue } from '../utils/money';
import { CopyTile, DueTile, InfoTile, RecordShell, SecretTile } from './recordBits';

const KIND = {
  credentials: { icon: Key, bar: 'from-violet-400 to-fuchsia-500' },
  emails: { icon: Mail, bar: 'from-sky-400 to-blue-500' },
  banking: { icon: Landmark, bar: 'from-emerald-400 to-teal-500' },
  notes: { icon: StickyNote, bar: 'from-amber-400 to-orange-500' },
};

const CARD_THEME = {
  'Credit Card': { icon: CreditCard, bar: 'from-amber-400 to-rose-500' },
  'Debit Card': { icon: CreditCard, bar: 'from-cyan-400 to-indigo-500' },
};

const GOV_THEME = {
  'PAN Card': { icon: FileText, bar: 'from-orange-400 to-amber-500' },
  'Aadhaar Card': { icon: FileText, bar: 'from-violet-400 to-indigo-500' },
  Passport: { icon: FileText, bar: 'from-sky-400 to-blue-600' },
  UAN: { icon: FileText, bar: 'from-teal-400 to-emerald-600' },
  'Driving License': { icon: FileText, bar: 'from-lime-400 to-green-600' },
  'Voter ID': { icon: FileText, bar: 'from-rose-400 to-pink-500' },
  'Ration Card': { icon: FileText, bar: 'from-amber-400 to-orange-600' },
};

const INS_THEME = {
  'Health Insurance': { icon: Shield, bar: 'from-rose-400 to-red-500' },
  'Life Insurance': { icon: Shield, bar: 'from-violet-400 to-purple-600' },
  'Term Insurance': { icon: Shield, bar: 'from-indigo-400 to-blue-600' },
  'Motor Insurance': { icon: Shield, bar: 'from-orange-400 to-amber-600' },
  'Home Insurance': { icon: Shield, bar: 'from-amber-400 to-yellow-500' },
  'Travel Insurance': { icon: Shield, bar: 'from-cyan-400 to-sky-500' },
};

const INV_THEME = {
  'Mutual Fund': { icon: TrendingUp, bar: 'from-cyan-400 to-blue-500' },
  Stock: { icon: TrendingUp, bar: 'from-violet-400 to-fuchsia-500' },
  'Demat Account': { icon: TrendingUp, bar: 'from-indigo-400 to-blue-600' },
  FD: { icon: TrendingUp, bar: 'from-emerald-400 to-teal-600' },
  RD: { icon: TrendingUp, bar: 'from-lime-400 to-green-600' },
  PPF: { icon: TrendingUp, bar: 'from-amber-400 to-orange-500' },
  EPF: { icon: TrendingUp, bar: 'from-orange-400 to-rose-500' },
  'NPS/PRAN': { icon: TrendingUp, bar: 'from-sky-400 to-indigo-500' },
  Gold: { icon: TrendingUp, bar: 'from-yellow-400 to-amber-600' },
  Crypto: { icon: TrendingUp, bar: 'from-fuchsia-400 to-purple-600' },
};

const titleFor = (item, kind) => {
  if (kind === 'credentials') return item.appName || item.title;
  if (kind === 'emails') return item.emailAddress;
  if (kind === 'banking') return item.bankName;
  if (kind === 'cards') return item.bankName || item.cardType;
  if (kind === 'government') return item.documentType || item.holderName;
  if (kind === 'insurance') return item.provider || item.insuranceType;
  if (kind === 'investments') return item.name;
  if (kind === 'notes') return item.title;
  return item.title || item.name || item.appName;
};

const themeFor = (item, kind) => {
  if (kind === 'cards') return CARD_THEME[item.cardType] || CARD_THEME['Debit Card'];
  if (kind === 'government') return GOV_THEME[item.documentType] || { icon: FileText, bar: 'from-slate-400 to-slate-600' };
  if (kind === 'insurance') return INS_THEME[item.insuranceType] || { icon: Shield, bar: 'from-slate-400 to-slate-600' };
  if (kind === 'investments') return INV_THEME[item.investmentType] || { icon: TrendingUp, bar: 'from-slate-400 to-slate-600' };
  return KIND[kind] || KIND.credentials;
};

const CredentialCard = ({ credential, kind, onEdit, onDelete, highlighted }) => {
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState('');
  const { toast } = useToast();
  const { t } = useI18n();
  const people = storage.get('people') || [];
  const person = people.find((row) => row.id === credential.personId);
  const theme = themeFor(credential, kind);
  const Icon = theme.icon;

  const copy = async (value, field) => {
    if (value === undefined || value === null || value === '') return;
    const ok = await copyToClipboard(String(value));
    if (ok) {
      setCopied(field);
      toast(t('common.copied'));
      window.setTimeout(() => setCopied(''), 2000);
    }
  };

  const toggle = (field) => setRevealed((current) => ({ ...current, [field]: !current[field] }));

  const secret = (field, last4) => (
    <SecretTile
      label={t(`field.${field}`)}
      value={credential[field]}
      shown={revealed[field]}
      onToggle={() => toggle(field)}
      onCopy={() => copy(credential[field], field)}
      copied={copied === field}
      last4={last4}
      t={t}
    />
  );

  const copyField = (field, mono) => (
    <CopyTile
      label={t(`field.${field}`)}
      value={credential[field]}
      onCopy={() => copy(credential[field], field)}
      copied={copied === field}
      mono={mono}
    />
  );

  const subtitle = [
    kind === 'cards' ? optionLabel(t, credential.cardType) : '',
    kind === 'government' ? credential.holderName : '',
    kind === 'insurance' ? optionLabel(t, credential.insuranceType) : '',
    kind === 'investments' ? optionLabel(t, credential.investmentType) : '',
    person?.name,
  ].filter(Boolean).join(' · ') || t('common.storedSecurely');

  const invested = Number(credential.amountInvested) || 0;
  const current = holdingValue(credential);
  const delta = current - invested;
  const twoFaOn = Boolean(credential.twoFactorEnabled);

  return (
    <RecordShell
      bar={theme.bar}
      Icon={Icon}
      title={titleFor(credential, kind) || t('common.untitled')}
      subtitle={subtitle}
      highlighted={highlighted}
      onEdit={() => onEdit(credential)}
      onDelete={() => onDelete(credential.id)}
      t={t}
    >
      {kind === 'credentials' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {copyField('username', true)}
            <InfoTile label={t('field.twoFactorEnabled')} className={twoFaOn ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/15 text-amber-100'}>
              {twoFaOn ? t('assets.with2fa') : t('assets.no2fa')}
            </InfoTile>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {secret('password')}
            {secret('twoFactorCodes')}
          </div>
        </>
      )}

      {kind === 'emails' && (
        <>
          {copyField('emailAddress', true)}
          <div className="grid grid-cols-2 gap-2">
            <InfoTile label={t('field.twoFactorEnabled')} className={twoFaOn ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/15 text-amber-100'}>
              {twoFaOn ? t('assets.with2fa') : t('assets.no2fa')}
            </InfoTile>
            {copyField('recoveryEmail', true)}
            {copyField('recoveryPhone')}
          </div>
          {secret('password')}
          {secret('twoFactorCodes')}
        </>
      )}

      {kind === 'banking' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {secret('accountNumber', true)}
            {copyField('ifscCode', true)}
            {copyField('customerId', true)}
            {copyField('nominee')}
            {copyField('netBankingUser', true)}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {secret('netBankingPassword')}
            {secret('transactionPin')}
            {secret('mobilePin')}
          </div>
        </>
      )}

      {kind === 'cards' && (
        <>
          <div className={`rounded-2xl p-4 bg-gradient-to-br ${theme.bar} text-white`}>
            <p className="text-xs opacity-80">{optionLabel(t, credential.cardType)}</p>
            <p className="font-mono text-lg tracking-widest mt-3">•••• {String(credential.cardNumber || '').slice(-4)}</p>
            <p className="text-sm mt-3 truncate">{credential.cardHolderName}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DueTile label={t('field.expiryDate')} iso={credential.expiryDate} t={t} />
            {credential.creditLimit ? (
              <InfoTile label={t('field.creditLimit')} className="bg-white/5 text-white">{formatInr(credential.creditLimit)}</InfoTile>
            ) : null}
            {credential.billingDate ? (
              <InfoTile label={t('field.billingDate')} className="bg-cyan-400/15 text-cyan-100">
                {t('assets.dayOfMonth', { day: credential.billingDate })}
              </InfoTile>
            ) : null}
            {credential.dueDate ? (
              <InfoTile label={t('field.dueDate')} className="bg-amber-400/15 text-amber-100">
                {t('assets.dayOfMonth', { day: credential.dueDate })}
              </InfoTile>
            ) : null}
          </div>
          {secret('cardNumber', true)}
          <div className="grid grid-cols-2 gap-2">
            {secret('cvv')}
            {secret('pin')}
          </div>
        </>
      )}

      {kind === 'government' && (
        <>
          {secret('documentNumber', true)}
          <div className="grid grid-cols-2 gap-2">
            {copyField('holderName')}
            <DueTile label={t('field.expiryDate')} iso={credential.expiryDate} t={t} />
            {credential.issueDate ? <DueTile label={t('field.issueDate')} iso={credential.issueDate} t={t} /> : null}
            {copyField('issuingAuthority')}
          </div>
        </>
      )}

      {kind === 'insurance' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {copyField('policyNumber', true)}
            {copyField('provider')}
            {credential.sumAssured ? (
              <InfoTile label={t('field.sumAssured')} className="bg-emerald-400/15 text-emerald-100">{formatInr(credential.sumAssured)}</InfoTile>
            ) : null}
            {credential.premiumAmount ? (
              <InfoTile label={t('field.premiumAmount')} className="bg-violet-400/15 text-violet-100">
                {formatInr(credential.premiumAmount)}
                {credential.premiumFrequency ? ` · ${optionLabel(t, credential.premiumFrequency)}` : ''}
              </InfoTile>
            ) : null}
            <DueTile label={t('field.policyEndDate')} iso={credential.policyEndDate} t={t} />
            {copyField('nominee')}
          </div>
          {(credential.agentName || credential.agentContact) && (
            <div className="grid grid-cols-2 gap-2">
              {copyField('agentName')}
              {copyField('agentContact')}
            </div>
          )}
        </>
      )}

      {kind === 'investments' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <InfoTile label={t('field.currentValue')} className="bg-emerald-400/20 text-emerald-100">{formatInr(current)}</InfoTile>
            <InfoTile label={t('field.amountInvested')} className="bg-white/5 text-white">{formatInr(invested)}</InfoTile>
            <InfoTile
              label={delta >= 0 ? t('assets.gain') : t('assets.loss')}
              className={delta > 0 ? 'bg-cyan-400/20 text-cyan-100' : delta < 0 ? 'bg-rose-400/20 text-rose-100' : 'bg-white/5 text-white/70'}
            >
              {delta === 0 ? t('assets.sameValue') : `${delta > 0 ? '+' : ''}${formatInr(delta)}`}
            </InfoTile>
            {copyField('platform')}
            {secret('accountNumber', true)}
            {copyField('nominee')}
            <DueTile label={t('field.maturityDate')} iso={credential.maturityDate} t={t} />
            {credential.purchaseDate ? <DueTile label={t('field.purchaseDate')} iso={credential.purchaseDate} t={t} /> : null}
          </div>
        </>
      )}

      {kind === 'notes' && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-300/10 p-4">
          {secret('content')}
        </div>
      )}

      {credential.notes && kind !== 'notes' ? <p className="text-white/45 text-sm">{credential.notes}</p> : null}

      {credential.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {credential.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full">{tag}</span>
          ))}
        </div>
      )}
    </RecordShell>
  );
};

export default CredentialCard;
