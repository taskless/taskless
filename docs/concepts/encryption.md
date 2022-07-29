# Encryption in Taskless

When using any Taskless client with an encryption key, your payloads are encrypted end-to-end inside the client before they are sent to Taskless. As a result of this, you won't be able to decrypt and view the contents of your payload on Taskless.io.

# What's Encrypted in a Job

Internally, a Taskless job looks like this (actual sample taken from Taskless' own heartbeat monitoring job):

```json
{
  "v": 1,
  "transport": {
    "ev": 1,
    "alg": "aes-256-gcm",
    "atl": 16,
    "at": "jjLZqWRaWJe99/XhKnoWVg==",
    "iv": "7SL0zL2EoCB6uR7y"
  },
  "text": "sXP4QmcH5KsZEbwD5UAG/7r3VZGNmiQ9vlM=",
  "signature": "PgOSqla7U9wV9zaSjy8XzpG9B9qapP6qYm40KVlfzPM="
}
```

In the clear, we pass `v` which tells us the version of the Taskless body, as well as the `transport` key. `transport` tells us about the envelope we used to encrypt the contents of `text`.

- `ev` tells us the envelope version in case we need to make backwards incompatible changes
- `alg` tells us the encryption algorithm used. By default, Taskless uses [AES-256](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard), the same standard used by Google, NIST, and others to secure sensitive data
- `atl` tells us the AuthTag length and simplifies validating the length of the `at` property
- `at` is the AuthTag itself, which helps us confirm the message was not altered
- `iv` is the [Initialization Vector](https://en.wikipedia.org/wiki/Initialization_vector) which makes it computationally impossible to reverse our encrypted text back into a key

Finally, our `text` is encrypted, and we generate a `signature` using your `APP_SECRET` value.

# Making Jobs Searchable

Because Jobs on Taskless are encrypted, it can make finding data very difficult. However, there are a few fields unencrypted that you can use for searching and querying.

- **Queue Name:** Queues in Taskless are a grouping mechanism, and are easier to remember and use than an endpoint URL
- **Job Name:** Jobs are unique to the application, but Jobs can also contain any string or array of keys making it easy to namespace. For example, a "send notification" job for `Bob` and `Alice` might be keyed as `enqueue(["sendNotification", "Bob"])` and `enqueue(["sendNotification", "Alice"])` respectively. Avoid putting personally identifiable information into the keys and prefer opaque tokens such as a user id or a session id.

# Rotating Encryption Secrets

In the event that your encryption secret was leaked, you should understand that the damage is limited. With only an encryption key, an attacker can (at best) read the payload of pending jobs, but only if they also gained access to your `TASKLESS_APP_ID` and `TASKLESS_APP_SECRET`. Regardless, if you feel your encryption secret was leaked, you can (and should) update it. To replace your leaked secret with a new one:

1. set the env value `TASKLESS_PREVIOUS_ENCRYPTION_SECRETS` to `your-old-secret`. This will allow existing jobs to still be decrypted safely.
2. Set `TASKLESS_ENCRYPTION_SECRET` to a new value.
3. Once you are confident all Jobs encrypted with the old secret executed, you may safely remove the `TASKLESS_PREVIOUS_ENCRYPTION_SECRETS`
