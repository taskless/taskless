# Taskless & Next.js Using `@taskless/client/next`

This is an example of using the Taskless.io client in a Next.js application. Please see [pages/api/queues/sample.ts](./pages/api/queues/sample.ts) for how to set up the queue, and one of the below triggering examples for how to enqueue items.

This example also shows how to use a `NextApiHandler` wrapper integration such as `@sentry/next` in order to provide a consistent queue interface and reattach the queue functions to the main export, viewable at [pages/api/queue/sentry.ts](./pages/api/queues/sentry.ts).

To run:

1. run `pnpm install`
2. run `pnpm dev`

A set of sample API endpoints are available that demonstrate the various job types you can enqueue

- http://localhost:3001/api/immediate [an immediately queued job](./pages/api/immediate.ts) that runs at the first opportunity
- http://localhost:3001/api/delayed [a delayed job](./pages/api/delayed.ts) that is scheduled `3 days` after enqueueing
- http://localhost:3001/api/cron [a recurring job](./pages/api/cron.ts) that runs every `5 minutes` and can be removed via http://localhost:3001/api/cron-end

These endpoints are for instructional purposes. In a production environment, you would likely call `.enqueue()` in response to a user action as opposed to manually hitting an API endpoint.

## Changes from Base App

- Adds [concurrently](https://www.npmjs.com/package/concurrently) for launching the Taskless dev server alongside next in development
- Adds [luxon](https://github.com/moment/luxon) for a sane way of managing dates, times, and durations

---

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
