---
title: Testing Payloads
---

# {% $frontmatter.title %}

When `process.env.TASKLESS_ENV` or `process.env.NODE_ENV` is `developent`, Taskless will accept unsigned and unencrypted JSON payloads to help you test receiving job data before you go to production. Some common uses cases for endpoint testing include:

- End to End tests where you want to verify a series of Jobs are triggered (such as a fan-out job)
- Jobs with well known test data
- Development scenarios where you don't want to use the [Taskless Dev Server](/docs/features/dev-server), and wish to make requests manually using a tool such as Postman or Insomnia

A raw development payload only requires that you specify the version `"v": 1` parameter in your JSON, and then you may pass any additional job data to the `json` key.

```json
{
  "v": 1,
  "json": {
    // put your payload here
  }
}
```

When Taskless sees a development payload and the environment is `development`, Taskless will emit a warning once per queue. This is so that developers can catch issues with unsigned payloads unrelated to the development endpoint testing. In production, using the `json` attribute in a Taskless body will throw an error.
