# Security Specification for Sri Lankan Community Web Portal

## 1. Data Invariants
1. **Master Gate / Ownership Invariant**: A user profile at `/users/{userId}` can only be written by the authenticated user (`request.auth.uid == userId`) or an established Admin.
2. **Bootstrapped Admin Invariant**: The designated primary administrator (`damika1316@gmail.com`) and any verified entry in `/admins/{userId}` have administrative privileges.
3. **No Privilege Escalation**: A regular user cannot set their own role to 'Super Admin' or 'Moderator', nor toggle their own `isBanned` or `isPhoneVerified` status.
4. **Temporal Invariant**: Creation timestamps (`createdAt`) must match `request.time`. Update operations must set `updatedAt == request.time` and leave `createdAt` immutable.
5. **Classified & Auction Invariant**: A listing in `/classifieds/{itemId}` can only be created by an authenticated verified user whose `sellerId == request.auth.uid`.
6. **Course Creator Invariant**: A Dhamma course can only be created by an authenticated user whose `createdBy == request.auth.uid`.
7. **Report Invariant**: Any authenticated user can submit a grievance report with their own `reporterId == request.auth.uid`. Only Admins can read or update reports.
8. **Site Settings Invariant**: Only Admins can modify `/site_settings/{settingId}`. Public users can only read.

## 2. The "Dirty Dozen" Payloads (Must be Denied)
1. **Ghost Field Injection**: Adding `__proto__` or rogue fields to `/users/{userId}` during profile creation.
2. **Self-Promote to Super Admin**: User sending `role: "Super Admin"` in `/users/{userId}` during registration.
3. **Impersonate Seller**: Writing to `/classifieds/{itemId}` with a mismatched `sellerId: "victim-uid"` while authenticated as `attacker-uid`.
4. **Bypass Ban**: Banned user writing classifieds or modifying platform settings.
5. **Unauthenticated Site Settings Write**: Updating `/site_settings/global` without admin auth.
6. **Denial of Wallet ID Poisoning**: Using a 10KB string for `{itemId}` or document ID.
7. **Fake Server Timestamp**: Providing client timestamp `createdAt: "2020-01-01"` instead of `request.time`.
8. **Tamper with Other User Profile**: User B updating user A's document `/users/{userA}`.
9. **Steal Admin Collection**: Non-admin user writing directly to `/admins/{anyId}`.
10. **Report Tampering**: Non-admin updating report status to `Resolved`.
11. **Immortal Field Overwrite**: Updating `/classifieds/{itemId}` and altering original `sellerId` or `createdAt`.
12. **Blanket Query Scraping**: Non-admin querying all private user notes or reports.
