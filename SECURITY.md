# Security policy

## Supported version

Security fixes are made against the current default branch. This is a research prototype and is not designed for deployment as a public, multi-tenant service without additional hardening.

## Reporting a vulnerability

Do not publish credentials, exploit details, or an unpatched vulnerability in a public issue. Use GitHub's private vulnerability reporting for this repository when it is enabled. If that option is unavailable, contact the repository owner through GitHub and share only the minimum information needed to coordinate a private report.

Please include the affected component, impact, reproduction steps, and any proposed mitigation. Do not include real user data or active credentials in the report.

## Secret handling

Keep provider keys in environment variables or ignored local `.env` files. Rotate any credential that may have been committed or disclosed; removing it from the latest commit does not remove it from Git history. Avoid including credentials in logs, screenshots, issues, or pull requests.
