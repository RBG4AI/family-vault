# Family Vault

A local-only encrypted vault for a household. Install it on a computer or phone, store logins, bank details, IDs, and notes, and keep the data on that device.

No account. No cloud. The master password is never written to disk.

## Security model

- Each vault is encrypted with **AES-256-GCM**
- The encryption key is derived with **PBKDF2-SHA-256** (400,000 iterations) from the master password
- A random data key is wrapped by that password; the password itself is not stored
- A **recovery key** can unwrap the same data key if the password is lost
- Unlocked keys live in memory only and are wiped on lock, idle timeout, or hiding the app
- Backups are the encrypted vault file. They are useless without the password or recovery key
- Clipboard copies of secrets are cleared after 30 seconds when the browser allows it

This is strong local encryption. It cannot protect a compromised device, a weak master password, or screenshots while a secret is revealed.

## Phones (HTTPS)

A phone browser will only encrypt the vault on **HTTPS**. Hosting the app on GitHub Pages publishes the **program**, not anyone’s secrets. Each phone still stores its vault in that device’s browser.

Phone link (after Add to Home Screen, it works offline):

**https://rbg4ai.github.io/family-vault/**

Friends should:

1. Open that link in **Safari** (iPhone) or **Chrome** (Android)
2. Share / browser menu → **Add to Home Screen**
3. Open the home-screen icon next time (works offline after the first visit)

The GitHub site is only the **program**. Vault data stays on each phone. A later publish updates the app, not anyone’s secrets.

## Install (computer)

```bash
npm install
npm run dev
```

Or one file, no install: `npm run standalone` then open `FamilyVault.html` in Chrome or Safari.

Create a **Family** vault for household data and separate **Personal** vaults if needed. Each vault has its own password.

## Using it

1. Create a vault and write down the recovery key offline
2. Add logins, cards, IDs, insurance, investments, and notes
3. Export an encrypted backup onto a USB drive or trusted computer
4. Import that backup on another family device, then unlock with the same password

If you forget the password, use the recovery key, then set a new password.

## Migrating from the old app

If this device still has the previous plaintext `localStorage` vault, it appears in the list as a legacy vault. Unlock it once with the old password. The data is re-encrypted and the plaintext copy is deleted.

## What was removed

Unencrypted HTML export, Base64 “share codes”, fake LAN sync, and unfinished biometric login. Those paths leaked or pretended to protect data.
