[@taskless/client](../README.md) / types

# Module: types

## Table of contents

### Type aliases

- [CipherAes256Gcm](types.md#cipheraes256gcm)
- [CipherNone](types.md#ciphernone)
- [Ciphers](types.md#ciphers)
- [GetBodyCallback](types.md#getbodycallback)
- [GetHeadersCallback](types.md#getheaderscallback)
- [JSONValue](types.md#jsonvalue)
- [Job](types.md#job)
- [JobHandler](types.md#jobhandler)
- [JobHandlerResult](types.md#jobhandlerresult)
- [JobHeaders](types.md#jobheaders)
- [JobMeta](types.md#jobmeta)
- [JobOptions](types.md#joboptions)
- [KeyOf](types.md#keyof)
- [QueueMethods](types.md#queuemethods)
- [QueueOptions](types.md#queueoptions)
- [SendJsonCallback](types.md#sendjsoncallback)
- [SupportedCiphers](types.md#supportedciphers)
- [TasklessBody](types.md#tasklessbody)
- [Transport](types.md#transport)

## Type aliases

### CipherAes256Gcm

Ƭ **CipherAes256Gcm**: `Object`

Data required for an AES-256-GCM cipher

#### Type declaration

| Name  | Type                                          | Description                |
| :---- | :-------------------------------------------- | :------------------------- |
| `alg` | `Extract`<`CipherGCMTypes`, `"aes-256-gcm"`\> | The Cipher used            |
| `at`  | `string`                                      | The Auth Tag               |
| `atl` | `number`                                      | The length of the Auth Tag |
| `iv`  | `string`                                      | The Cipher IV value        |

---

### CipherNone

Ƭ **CipherNone**: `Object`

Data required for a non-ciphertext

#### Type declaration

| Name  | Type     |
| :---- | :------- |
| `alg` | `"none"` |

---

### Ciphers

Ƭ **Ciphers**: [`CipherAes256Gcm`](types.md#cipheraes256gcm) \| [`CipherNone`](types.md#ciphernone)

All Supported Cipher combinations

---

### GetBodyCallback

Ƭ **GetBodyCallback**<`T`\>: () => `Awaited`<`T`\>

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Type declaration

▸ (): `Awaited`<`T`\>

An intgeration callback for getting the request body as a JSON object

##### Returns

`Awaited`<`T`\>

---

### GetHeadersCallback

Ƭ **GetHeadersCallback**: () => `IncomingHttpHeaders` \| `Promise`<`IncomingHttpHeaders`\>

#### Type declaration

▸ (): `IncomingHttpHeaders` \| `Promise`<`IncomingHttpHeaders`\>

An integration callback for getting the headers as a JSON object

##### Returns

`IncomingHttpHeaders` \| `Promise`<`IncomingHttpHeaders`\>

---

### JSONValue

Ƭ **JSONValue**: `null` \| `string` \| `number` \| `boolean` \| { `[key: string]`: [`JSONValue`](types.md#jsonvalue); } \| [`JSONValue`](types.md#jsonvalue)[]

A recursive description of a valid JSON-like value

---

### Job

Ƭ **Job**<`T`\>: `Object`

Describes a Taskless.io Job with a payload of type `T`

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Type declaration

| Name        | Type                                | Description                                                                  |
| :---------- | :---------------------------------- | :--------------------------------------------------------------------------- |
| `enabled`   | `boolean`                           | Determines if the job is enabled or not                                      |
| `endpoint`  | `string`                            | The fully-qualified URL that will be called when this job executes           |
| `headers?`  | [`JobHeaders`](types.md#jobheaders) | An optional set of key-value pairs to pass as headers when this job executes |
| `name`      | `string`                            | The name of the job, unique to the application                               |
| `payload`   | `T`                                 | The Job's payload to be delivered                                            |
| `retries`   | `number`                            | The number of retries for this Job                                           |
| `runAt`     | `string`                            | An ISO-8601 timestamp of when this job will be ran                           |
| `runEvery?` | `string`                            | An ISO-8601 duration for how often this job will repeat its run              |

---

### JobHandler

Ƭ **JobHandler**<`T`\>: (`payload`: `T`, `meta`: [`JobMeta`](types.md#jobmeta)) => `Awaited`<[`JSONValue`](types.md#jsonvalue)\>

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Type declaration

▸ (`payload`, `meta`): `Awaited`<[`JSONValue`](types.md#jsonvalue)\>

The Job Handler signature, taking a `payload` and `meta`

##### Parameters

| Name      | Type                          |
| :-------- | :---------------------------- |
| `payload` | `T`                           |
| `meta`    | [`JobMeta`](types.md#jobmeta) |

##### Returns

`Awaited`<[`JSONValue`](types.md#jsonvalue)\>

---

### JobHandlerResult

Ƭ **JobHandlerResult**: `Awaited`<`void`\> \| `Awaited`<[`JSONValue`](types.md#jsonvalue)\>

The result of the Job Handler callback

---

### JobHeaders

Ƭ **JobHeaders**: `Object`

#### Index signature

▪ [header: `string`]: `string`

---

### JobMeta

Ƭ **JobMeta**: `Object`

Metadata regarding the currently running Job

#### Type declaration

| Name             | Type               |
| :--------------- | :----------------- |
| `applicationId`  | `string` \| `null` |
| `attempt`        | `number`           |
| `organizationId` | `string` \| `null` |

---

### JobOptions

Ƭ **JobOptions**: `Object`

A set of options on a per-job level

#### Type declaration

| Name        | Type                                | Description                                                                   |
| :---------- | :---------------------------------- | :---------------------------------------------------------------------------- |
| `enabled?`  | `boolean`                           | Is the job enabled                                                            |
| `headers?`  | [`JobHeaders`](types.md#jobheaders) | A set of key:value pairs to pass as job headers                               |
| `retries?`  | `number`                            | The number of retries to attempt before the job is failed                     |
| `runAt?`    | `string`                            | An optional time to run the job, delaying it into the future. ISO-8601 format |
| `runEvery?` | `string`                            | An optional ISO-8601 duration that enables repeated running of a job          |

---

### KeyOf

Ƭ **KeyOf**<`T`\>: keyof `T`

A helper type for keyof typeof access

#### Type parameters

| Name |
| :--- |
| `T`  |

---

### QueueMethods

Ƭ **QueueMethods**<`T`\>: `Object`

Describes the set of Queue Methods available on a Taskless Integration

#### Type parameters

| Name | Description                                                                                                                             |
| :--- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `T`  | Types the payload expected in `enqueue` and `update`, as well as the payload key returned from `enqueue`, `update`, `delete`, and `get` |

#### Type declaration

| Name      | Type                                                                                                                                     |
| :-------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `delete`  | (`name`: `string`) => `Promise`<[`Job`](types.md#job)<`T`\>\>                                                                            |
| `enqueue` | (`name`: `null` \| `string`, `payload`: `T`, `options?`: [`JobOptions`](types.md#joboptions)) => `Promise`<[`Job`](types.md#job)<`T`\>\> |
| `get`     | (`name`: `string`) => `Promise`<[`Job`](types.md#job)<`T`\>\>                                                                            |
| `update`  | (`name`: `string`, `payload`: `T`, `options?`: [`JobOptions`](types.md#joboptions)) => `Promise`<[`Job`](types.md#job)<`T`\>\>           |

---

### QueueOptions

Ƭ **QueueOptions**: `Object`

A set of options for setting up a Taskless Queue

#### Type declaration

| Name                          | Type                                                                       | Description                                                                                                                                                 |
| :---------------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseUrl?`                    | `string`                                                                   | The base url, defaults to process.env.TASKLESS_BASE_URL                                                                                                     |
| `credentials?`                | { `appId`: `string` ; `expiredSecrets?`: `string`[] ; `secret`: `string` } | Your Application's credential pair of an Application ID and Application Secret. Defaults to process.env.TASKLESS_APP_ID and process.env.TASKLESS_APP_SECRET |
| `credentials.appId`           | `string`                                                                   | -                                                                                                                                                           |
| `credentials.expiredSecrets?` | `string`[]                                                                 | -                                                                                                                                                           |
| `credentials.secret`          | `string`                                                                   | -                                                                                                                                                           |
| `encryptionKey?`              | `string`                                                                   | An optional encryption key for e2e encryption of job data. Defaults to process.env.TASKLESS_ENCRYPTION_KEY                                                  |
| `expiredEncryptionKeys?`      | `string`[]                                                                 | Previous encryption keys to assist in key rotation. Defaults to a comma separated list in process.env.TASKLESS_PREVIOUS_ENCRYPTION_KEYS                     |

---

### SendJsonCallback

Ƭ **SendJsonCallback**: (`json`: [`JSONValue`](types.md#jsonvalue)) => `void` \| `Promise`<`void`\>

#### Type declaration

▸ (`json`): `void` \| `Promise`<`void`\>

An integration callback for sending JSON back to Taskless.io

##### Parameters

| Name   | Type                              |
| :----- | :-------------------------------- |
| `json` | [`JSONValue`](types.md#jsonvalue) |

##### Returns

`void` \| `Promise`<`void`\>

---

### SupportedCiphers

Ƭ **SupportedCiphers**: `Extract`<`CipherGCMTypes`, `"aes-256-gcm"`\> \| `"none"`

Supported ciphers have iv lengths as well as a matching hash function of equal bits

---

### TasklessBody

Ƭ **TasklessBody**: `Object`

The taskless body definition (what is posted to & from the client)

**`see`** {isTasklessBody} ts-auto-guard:type-guard

#### Type declaration

| Name        | Type                              | Description               |
| :---------- | :-------------------------------- | :------------------------ |
| `signature` | `string`                          | Signature of text field   |
| `text`      | `string`                          | Possibly ciphered text    |
| `transport` | [`Transport`](types.md#transport) | The encoder transport     |
| `v`         | `number`                          | The Taskless Body Version |

---

### Transport

Ƭ **Transport**: { `alg`: [`SupportedCiphers`](types.md#supportedciphers) ; `ev`: `1` } & [`Ciphers`](types.md#ciphers)

Describes the taskless Transport Metadata
