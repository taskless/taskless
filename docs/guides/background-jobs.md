---
title: Building Background Jobs with Taskless
---

# {% $frontmatter.title %}

In this guide, we're going to build a simple background job processor in Taskless. While we'll be creating placeholders for a variety of functions (using `console.log`), it's a great example of how you can use Taskless to move work out of the blocking path.

## Password Resets, but Faster and More Reliable

We're going to be fixing up a very simple password reset flow for a hypothetical website. A completed example is available [in the examples folder](https://github.com/taskless/taskless/tree/main/examples/next-gudie) if you'd like to just look at the final product.

In this example, we're using a third party service for sending email, emulated through some `setTimeout` calls. Like any other service, there can be hiccups, downtime, and slow connections. Because we don't want our users waiting while we talk to the email service, we're going to shift this work out of the API request the user makes to request the reset. This process, _doing work in the background_ is perfect for Taskless.

## Environment Setup

We'll start by creating a copy of our [next-guide](https://github.com/taskless/taskless/tree/main/examples/next-guide) example app. It was created using [create-next-app](https://www.npmjs.com/package/create-next-app) with `@taskless/next`, `@taskless/dev`, and `npm-run-all` added. We've also modified the `scripts` section to launch Taskless alongside our Next app.

> **Note:** You can also use npm or yarn for dependency management.

```sh
npx create-next-app@latest next-background --use-pnpm --example "https://github.com/taskless/examples/next-guide"
cd next-guide
touch .env.local
```

That's it for setup. When we run `pnpm dev` from our console, we'll get the familiar next.js starter page. Next.js will run on port `3000`, while the Taskless Dev Server runs on `3001`,

![next13-home](https://user-images.githubusercontent.com/1795/216490240-3c8cd35e-ef55-42e3-bd47-03252c3d9f33.png)

## The Password Reset Page

To keep things simple, we'll borrow several of the Next.js starter styles and add a basic input and button for password resetting. In a production app, you'd likely use `react-hook-form`, `Formik`, or another form management library. The file we're looking at is `/pages/auth/reset.tsx`:

```tsx
import Head from "next/head";
import { Inter } from "@next/font/google";
import home from "@/styles/Home.module.css";
import styles from "@/styles/PWReset.module.css";
import { useCallback, useRef, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = useCallback(async () => {
    if (processing || !inputRef.current) {
      return;
    }
    setProcessing(true);

    setProcessing(true);
    try {
      const resp = await fetch("/api/auth/reset-slow", {
        method: "POST",
        body: JSON.stringify({
          email: inputRef.current.value,
        }),
      });
      const res = await resp.json();
      console.log(res);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }

    setProcessing(false);
  }, [processing]);

  return (
    <>
      <Head>
        <title>Password Reset Example - Taskless</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={home.main}>
        <div className={home.center}>
          <div className={styles.grid}>
            <h1 className={inter.className}>Reset Your Password</h1>
            <div
              className={styles.grid}
              style={{ opacity: processing ? 0.5 : 1 }}
            >
              <input
                className={styles.input}
                type="email"
                placeholder="your email"
                ref={inputRef}
                readOnly={processing}
              />
              <button type="button" onClick={handleSubmit}>
                Forgot Password
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
```

As you interact with the page at [http://localhost:3000/auth/reset](http://localhost:3000/auth/reset), you'll notice that the page "hangs" for a moment or two. Looking in our console, we can see our Mail Service is occasioanly timing out. And while we're waiting on our Mail Service to respond, the user's stuck waiting with us. 😬

```
[dev:next] ⤵️   Making request via reset-slow
[dev:next] [⏳] Check abuse rate limits
[dev:next] [✅] Check abuse rate limits
[dev:next] [⏳] Lookup user by email
[dev:next] [✅] Lookup user by email
[dev:next] [⏳] Save reset token
[dev:next] [✅] Save reset token
[dev:next] [⏳] Call Mail Service API
[dev:next] [💥] Call Mail Service API Timed Out (7s)
```

## Enter the Taskless Queue

Queues in Taskless are small, publicly accessible functions in your app. We recommend making them available inside of a `queues` directory; wherever your data endpoints go best. We've taken the slow parts (literally) of our API endpoint and put them inside of a Taskless runner. For Next.js, this would be `/pages/api/queues/reset.ts`:

```ts
import { createQueue } from "@taskless/next";
import { performSlowGlitchyPasswordReset } from "../auth/reset-slow";

interface ResetData {
  email: string;
}

export default createQueue<ResetData>(
  "password-reset",
  "/api/queues/reset",
  async (job, api) => {
    console.info("⤵️   Running Taskless Background Job");
    await performSlowGlitchyPasswordReset();
    return { ok: true };
  }
);
```

It's our same glitchy and unreliable password reset service, but this time it's bundled up in Taskless. Check the `Use Taskless` box on our password reset form, and the reset request will be sent to `/api/auth/reset-fast`.

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import reset from "../queues/reset";

type Data = {
  ok: boolean;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  console.info("⤵️   Making request via reset-fast");

  if (!req.body.email) {
    throw new Error("no email");
  }
  const email = (
    Array.isArray(req.body.email) ? req.body.email : [req.body.email]
  )[0];

  const key = crypto
    .createHash("sha256")
    .update(email ?? "")
    .digest("hex")
    .toString();

  await reset.enqueue(key, { email }, { retries: 3 });

  console.info("[✅] Sent to Taskless");
  res.status(200).json({ ok: true });
};

export default handler;
```

Now, when "Use Taskless" is selected, we'll push everything to the background. Even if our service is slow to respond, the user always gets an immediate response from our API. When our flaky Mail Service fails, Taskless backs off for a few seconds and tries again.

```
[dev:next] ⤵️   Making request via reset-fast
[dev:next] [✅] Sent to Taskless
[dev:next] ⤵️   Running Taskless Background Job
[dev:next] [⏳] Check abuse rate limits
[dev:next] [✅] Check abuse rate limits
[dev:next] [⏳] Lookup user by email
[dev:next] [✅] Lookup user by email
[dev:next] [⏳] Save reset token
[dev:next] [✅] Save reset token
[dev:next] [⏳] Call Mail Service API
[dev:next] [💥] Call Mail Service API Timed Out (7s)
[dev:next] Error: Service Timed Out
[dev:next]     at ...
[dev:t   ] info   - 17:10:41.41 (root) FAIL of c496c6be-cc69-507f-bd14-4e4380be8945
[dev:t   ] error  - 17:10:41.41 (root) Received non-2xx response
[dev:next] ⤵️   Running Taskless Background Job
[dev:next] [⏳] Check abuse rate limits
[dev:next] [✅] Check abuse rate limits
[dev:next] [⏳] Lookup user by email
[dev:next] [✅] Lookup user by email
[dev:next] [⏳] Save reset token
[dev:next] [✅] Save reset token
[dev:next] [⏳] Call Mail Service API
[dev:next] [✅] Call Mail Service API
[dev:t   ] info   - 17:11:15.745 (root) ACK of c496c6be-cc69-507f-bd14-4e4380be8945
```

![fail-success](https://user-images.githubusercontent.com/1795/216490321-b5187cda-76b2-44f9-9a55-dd6a998c1eb1.png)

## What's Next

Background jobs are just one of the many things you can do with Taskless. Check out the [getting started doc](/docs/welcome) for other guides and ideas.
