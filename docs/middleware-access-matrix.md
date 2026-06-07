# Middleware Access Matrix

This matrix helps verify auth and RBAC behavior after middleware changes.

## Paths

- Public: `/`, `/login`, `/register`
- Admin-only: `/admin` and any nested route
- Private: all other non-static, non-API routes

## Expected outcomes

| User state | Role | Path | Expected |
| --- | --- | --- | --- |
| Guest | GUEST | `/` | 200 |
| Guest | GUEST | `/login` | 200 |
| Guest | GUEST | `/register` | 200 |
| Guest | GUEST | `/admin` | 302 -> `/{locale}/login?callbackUrl=...` |
| Authenticated | CUSTOMER | `/login` | 302 -> `/{locale}/profile` |
| Authenticated | CUSTOMER | `/register` | 302 -> `/{locale}/profile` |
| Authenticated | CUSTOMER | `/admin` | 302 -> `/{locale}/unauthorized` |
| Authenticated | ADMIN | `/admin` | 200 |
| Authenticated | ADMIN | `/admin/users` | 200 |

## Quick manual checks

1. Sign out and open `/en/admin`.
2. Sign in as non-admin and open `/en/admin`.
3. Sign in as admin and open `/en/admin`.
4. While signed in, open `/en/login`.
