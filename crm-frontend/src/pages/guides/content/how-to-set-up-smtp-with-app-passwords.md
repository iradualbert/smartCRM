# How to Set Up SMTP with App Passwords

If you want to send email from your own mailbox, the safest setup is usually an app password.

An app password is a special password created by your email provider for apps like Beinpark. It is separate from your main mailbox password, and it is commonly used when two-factor authentication is enabled.

## What is an app password?

An app password is:

- created inside your email account settings
- used only for SMTP or app access
- different from your normal sign-in password

This helps protect your main account while still allowing the app to send email on your behalf.

## When do you need one?

You usually need an app password when:

- your email account uses two-factor authentication
- your provider blocks direct use of your normal password for SMTP
- you are connecting Gmail, Google Workspace, Outlook, Microsoft 365, Yahoo, or another managed mailbox

## Before you start

Have these details ready:

- sender email address
- sender name
- SMTP host
- SMTP port
- SMTP username
- app password
- security type, usually `TLS` or `SSL`

## Typical SMTP details

These are common examples. Always confirm with your provider.

### Gmail or Google Workspace

- SMTP host: `smtp.gmail.com`
- Port: `587`
- Security: `TLS`
- Username: your full email address
- Password: app password

### Outlook or Microsoft 365

- SMTP host: `smtp.office365.com`
- Port: `587`
- Security: `TLS`
- Username: your full email address
- Password: app password or provider-approved mailbox password

## How to create an app password

The exact steps depend on your provider, but the pattern is usually the same:

1. Sign in to your email account security settings.
2. Turn on two-factor authentication if it is not already enabled.
3. Open the section for app passwords.
4. Create a new app password for mail or SMTP access.
5. Copy the generated password and store it temporarily.

Most providers only show the app password once, so it is best to copy it immediately.

## How to add it in Beinpark

1. Open **Settings > Email Configuration**.
2. Select **Add sender account**.
3. Enter the sender name and sender email.
4. Enter the SMTP host, port, username, and app password.
5. Choose the correct security type.
6. Save the sender account.
7. Run **Verify** to confirm the connection.

## Good setup habits

- use a shared mailbox for team sending when possible
- keep one default sender account for the organization
- avoid using a personal mailbox for production workflows
- replace the app password if access is revoked or the mailbox policy changes

## If verification fails

Check these first:

- the SMTP host and port
- whether the username is the full email address
- whether the security type matches the provider requirement
- whether the app password was copied correctly
- whether the mailbox allows SMTP access

## Conclusion

Using app passwords is the simplest professional way to connect your mailbox securely. Once the sender account is verified, your team can send quotations, invoices, and other document emails directly from the app.

[Try the app](/signup)
