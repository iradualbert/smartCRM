# Plans & Trial System (No Payments Yet)

## Goal
Implement a simple plan system that allows users to try the Business (Pro) plan for free, without requiring a credit card.

Payments are intentionally delayed for now.

---

## 1. Default Behavior on Signup

- When a user signs up and creates an organization:
  - Automatically assign the **Business (Pro) plan**
  - Set a **trial period of 30 days**

Fields to track:
- plan_type (FREE, BUSINESS)
- trial_started_at
- trial_ends_at

---

## 2. Trial Logic

- During the trial:
  - User has full Business plan access
- After trial expires:
  - Automatically downgrade organization to FREE plan

Behavior:
- No credit card required
- No manual upgrade needed during trial
- Downgrade happens automatically

---

## 3. Plan Enforcement

Implement plan limits (basic version):

### FREE plan:
- limited number of documents
- limited emails sent
- limited storage

### BUSINESS plan:
- higher or unlimited limits

Rules:
- When limits are reached:
  - show warning first (soft limit)
  - then block action (hard limit)

---

## 4. UI Requirements

### Show trial status clearly:
- “Business plan trial — X days remaining”
- visible in dashboard or header

### When trial ends:
- show:
  - “Your trial has ended”
  - “You are now on the Free plan”

### Upgrade UI:
- show upgrade prompts
- do NOT implement payment yet
- just placeholder button: “Upgrade (coming soon)”

---

## 5. Email Notifications

Send emails:
- 7 days before trial ends
- 2 days before trial ends
- on trial expiration

Content:
- remind user of upcoming downgrade
- highlight value of Business features

---

## 6. Backend Requirements

- Store plan info at organization level (not user)
- All usage tracking must be scoped by organization
- Plan checks must be enforced in:
  - document creation
  - email sending
  - storage usage

---

## 7. Important Constraints

- Do NOT integrate payment providers yet
- Do NOT implement subscriptions or billing flows
- Do NOT add pricing checkout logic

Focus only on:
- trial
- downgrade
- usage limits
- UI feedback

---

## Outcome

Users can:
- sign up
- immediately use full features
- understand value
- hit limits naturally

System will:
- downgrade after 30 days
- enforce limits
- prepare for future paid plans