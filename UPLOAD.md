# crossledger.trade: count enquiries in Google Analytics

Built on top of live main (042498e, with your three deletions from 00:03 on 15 Oct). The site builds cleanly. Codex reviewed it ("no defects found") and I checked it too.

## What it adds

- **Homepage enquiry form:** when Formspree accepts a message, GA4 receives a `generate_lead` event with the enquiry type only (for example "Trade or corridor partnership").
- **/contact page:** clicking one of the email links sends a `contact_email_click` event with the topic only (pilot, inspector, security or general).
- **Privacy notice:** one sentence saying so, and the "last updated" date changes to 15 October 2026.

No name, email address or message is ever sent to Google.

## Upload (about 2 minutes)

1. Open github.com/CLX-Trade/crossledger-site, then **Add file**, then **Upload files**, at the repository root.
2. Drag the **`pages` folder** from this folder onto the upload area. Drag the folder, not the files inside it. Don't drag this UPLOAD.md.
3. GitHub should list exactly three files:
   - `pages/contact.js`
   - `pages/index.js`
   - `pages/privacy.js`
4. Commit message: `Count enquiries in Google Analytics`. Commit directly to `main`.

## After it is live

In Google Analytics: Admin > Events, find `generate_lead` (it appears after the first enquiry) and mark it as a **key event**. Then X campaign visits that turn into enquiries show up as conversions.

If anyone has changed `pages/index.js`, `pages/contact.js` or `pages/privacy.js` on main since 15 Oct 00:03, tell Claude first, so the change can be rebuilt on top of theirs.

## Safety check (added 16 Oct 11:40)
- This folder contains exactly three files: `pages/index.js`, `pages/contact.js`, `pages/privacy.js`. GitHub's upload adds or replaces only those three. It doesn't delete or change anything else.
- They are built on live main 042498e, and main hasn't changed since (checked 16 Oct 11:31), so nobody's later edits get overwritten. If main changes before you upload, tell Claude first.
- Combined with the homepage patches, the site builds successfully (`next build`, 16 Oct).

## 18 Oct 2026 update
- Gui approved the upload. Main still 042498e (checked 18 Oct), patch applied cleanly, `next build` passes. Privacy "last updated" changed to 18 October 2026 (the day it goes live).
- Claude's `git push` failed: GitHub rejected the keychain credential ("Invalid username or token"). Nothing was pushed. Use the upload steps above, or refresh the GitHub credential and Claude can push.

## How Claude will verify it after upload (no fake enquiries)
1. Check that the live deployment has moved past 042498e and that the page code contains the `generate_lead` and `contact_email_click` calls.
2. **Contact intent:** Gui opens /contact, clicks one email link (it just opens a draft email, so nothing is sent), and checks GA4 Realtime for one `contact_email_click`.
3. **Submitted enquiry:** not tested with a fake form. The code path is checked in the deployed page; the first real `generate_lead` is confirmed in GA4 when a genuine enquiry arrives. Then, in GA4: Admin, Events, mark `generate_lead` as a key event.
4. Reporting keeps the three apart: contact clicks (intent), submitted enquiries (`generate_lead`), and qualified enquiries (counted by hand from the inbox).
