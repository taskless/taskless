# Taskless & Next.js Using `taskless/next`

This is an example of using the Taskless.io client in a Next.js application. Please see [pages/api/queues/sample.ts](./pages/api/queues/sample.ts) for how to set up the queue, and [pages/api/queue/sample-trigger.ts](./pages/api/queues/sample-trigger.ts) for an example of triggering a queue.

This example also shows how to use a `NextApiHandler` wrapper integration such as `@sentry/next` in order to provide a consistent queue interface and reattach the queue functions to the main export, viewable at [pages/api/queue/sentry.ts](./pages/api/queues/sentry.ts)

To run:

1. create a `.env.local` file with the necessary values
2. run `yarn dev`
3. visit `http://localhost:3000/api/run-sample` with your browser or wget the url with `wget http://localhost:3000/api/run-sample` from a terminal window

---

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
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
