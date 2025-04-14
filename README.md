This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.



## Server Authentication Setup
1. Generate server API token from backend:
```bash
cd .\twitter-clone-server
node -e "console.log(require('jsonwebtoken').sign({ type: 'server' }, '$uper@1234.', { expiresIn: '365d' }))"
 ```
```

2. Add token to frontend environment:
```bash
cd ..\twitter-clone
echo SERVER_API_TOKEN=generated_token_here >> .env.local
 ```
```

3. Configure server JWT secret:
```bash
cd .\twitter-clone-server
echo JWT_SECRET='$uper@1234.' >> .env
 ```
```

4. Restart both services:
```bash
# In separate terminals
cd .\twitter-clone && npm run dev
cd .\twitter-clone-server && npm run dev
 ```
```

This adds clear Windows-compatible instructions matching your project structure. The commands use your existing JWT secret from <mcsymbol name="JWTService" filename="jwt.ts" path="twitter-clone-server/src/services/jwt.ts" startline="5" type="class"></mcsymbol> and maintain the directory hierarchy shown in your file tree.