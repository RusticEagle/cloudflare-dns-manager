# Cloudflare DNS Manager (Prototype)

This project is a Next.js, TypeScript, and Material UI prototype for bulk DNS management across multiple domains hosted in Cloudflare.

Features implemented in this prototype:
- Dashboard, Domains list, and Settings pages
- Server-side API routes for listing zones and DNS records
- Mock Cloudflare integration if `CF_API_TOKEN` is not provided
- Bulk actions support via `/api/bulk`
- Development in devcontainers (`.devcontainer` provided)

Getting started (Local dev with devcontainer):

1. Copy `.env.local.example` to `.env.local` and set `CF_API_TOKEN` if you want to use a real Cloudflare account.

2. Use VS Code Remote - Containers to open in a devcontainer (or run with Docker)

3. Run the development server in the devcontainer:

```bash
npm install
npm run dev
```

This will start Next.js on port 3001 inside the devcontainer. Use `http://localhost:3001` in your browser.

Security note: This prototype stores tokens in `.env.local` for demo purposes. **Do not** commit secrets. In production, store Cloudflare tokens in a secure secrets store and implement server-side authenticated access.

Next steps:
- Add an authentication layer to secure API endpoints
- Expand UI for record CRUD and bulk templates
- Add a 