---
title: Timezone Aware Events with Taskless
---

# {% $frontmatter.title %}

Imagine, for a moment, you're building a mobile-first professional networking app. One of its most important features is the "Daily Briefing" where you tell your user about their upcoming day, sent at 8:30 every morning. Because our users are business professionals, they're likely to be traveling and changing time zones frequently.

So, **when is 8:30 am for that user**? With Taskless, you can make your events timezone aware, and that Daily Briefing arrives exactly when it should.

A completed example is available [in the examples folder](https://github.com/taskless/taskless/tree/main/examples/next-gudie) if you'd like to just look at the final product.

## Our Core Event & API

First, it's helpful to be familiar with [how jobs are enqueued in Taskless](/docs/api/enqueue). This is because when a job in Taskless is enqueued with the same `Job Identifier`, it automatically updates the matching job if it exists. In database terms, this is an upsert.

> All jobs scheduled in Taskless are treated like an `upsert`

To keep our data payload as small as possible, we're only going to deal with the `userId` we're scheduling a briefing for. In our API endpoint, we would add any additional security checks before we agree to enqueue the job. Our job doesn't do much, but it's easy to see where we'd add all our backend service calls and email generation work. We'll create this queue inside of our Next API folder at `/api/queues/briefing.ts`.

```ts
// api/queues/briefing.ts

import { createQueue } from "@taskless/next";

interface DailyBriefing {
  userId: string;
}

export default createQueue<DailyBriefing>(
  "daily-briefing",
  "/api/queues/briefing",
  async (job, api) => {
    console.info(`Daily briefing for ${job.userId}`);
    return { ok: true };
  }
);
```

We'll also want our API that our mobile app calls, used for setting the timezone. For now, we'll keep that information as placeholders. Our REST-like endpoint will be at `/api/update-briefing.ts`.

```ts
// api/update-briefing.ts

import { sleep } from "@/util/sleep";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  ok: boolean;
};

const validateSession = () => sleep(80, "Verify user is valid");

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  await validateSession();
  res.status(200).json({ ok: true });
};

export default handler;
```

## Mobile: Capturing Timezone

To update our briefing, we'll want to call our API with information about the current user's timezone as an IANA identifier. Mobile devices make this available via various APIs, and we can use these timezone IDs for scheduling our briefing to the correct timezone for the user.

One of the best parts about using IANA identifiers is that the [tz database](https://en.wikipedia.org/wiki/Tz_database) knows what these IDs mean, if they include daylight saving time, and their offsets (❤️ you Chatham Islands, New Zealand and your `UTC +12:45`).

{% tabs %}

{% tab label="React Native" %}

```ts
import DeviceInfo from "react-native-device-info";

console.log(DeviceInfo.getTimezone()); //   'America/New_York'
```

{% /tab %}

{% tab label="Swift" %}

```swift
var localTimeZoneIdentifier: String { return TimeZone.current.identifier }

localTimeZoneIdentifier // "America/Sao_Paulo"
```

{% /tab %}

{% tab label="Kotlin" %}

```kotlin
TimeZone tz = TimeZone.getDefault();
```

{% /tab %}

{% /tabs %}

No matter how you get it, we'll make a JSON request to our `/api/update-briefing` endpoint with a payload that tells us about the possibly new timezone. For brevity, we'll assume you're using sessions, JWTs, or another means to secure your API endpoint.

```json
{
  "userId": "03952ed3-d7be-4e26-874a-15052735ee9f",
  "tz": "America/New_York"
}
```

## Upserting Into Taskless

When our API receives a valid request, we can call `enqueue()` into Taskless with the new timezone information. To make sure our _first_ run is correct, we'll use the excellent [luxon](https://moment.github.io/luxon/) library to set the first run. Once we add the timezone, Taskless can take care of every run after that.

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import { DateTime } from "luxon";
import { sleep } from "@/util/sleep";
import briefing from "./queues/briefing";

type Data = {
  ok: boolean;
};

const validateSession = () => sleep(80, "Verify user is valid");

const getSession = async () => {
  // these values should come from your session
  return {
    userId: "03952ed3-d7be-4e26-874a-15052735ee9f",
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  await validateSession();
  const { userId } = await getSession();

  const timezone = `${req.body.timezone ?? "UTC"}`;
  const now = DateTime.now().setZone(timezone);

  briefing.enqueue(
    `${userId}`,
    {
      userId,
    },
    {
      runAt: (now < now.set({ hour: 8, minute: 0, second: 0, millisecond: 0 })
        ? now.startOf("day").set({ hour: 8 })
        : now.startOf("day").plus({ days: 1 }).set({ hour: 8 })
      ).toISO(),
      runEvery: "P1D",
      timezone,
    }
  );

  res.status(200).json({ ok: true });
};

export default handler;
```

## What's Next

Timezone aware jobs are just one of the many things you can do with Taskless. Check out the [getting started doc](/docs/welcome) for other guides and ideas.
