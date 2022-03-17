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

#### Defined in

[packages/taskless/src/types.ts:137](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L137)

---

### CipherNone

Ƭ **CipherNone**: `Object`

Data required for a non-ciphertext

#### Type declaration

| Name  | Type     |
| :---- | :------- |
| `alg` | `"none"` |

#### Defined in

[packages/taskless/src/types.ts:149](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L149)

---

### Ciphers

Ƭ **Ciphers**: [`CipherAes256Gcm`](types.md#cipheraes256gcm) \| [`CipherNone`](types.md#ciphernone)

All Supported Cipher combinations

#### Defined in

[packages/taskless/src/types.ts:154](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L154)

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

#### Defined in

[packages/taskless/src/types.ts:114](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L114)

---

### GetHeadersCallback

Ƭ **GetHeadersCallback**: () => `IncomingHttpHeaders` \| `Promise`<`IncomingHttpHeaders`\>

#### Type declaration

▸ (): `IncomingHttpHeaders` \| `Promise`<`IncomingHttpHeaders`\>

An integration callback for getting the headers as a JSON object

##### Returns

`IncomingHttpHeaders` \| `Promise`<`IncomingHttpHeaders`\>

#### Defined in

[packages/taskless/src/types.ts:117](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L117)

---

### JSONValue

Ƭ **JSONValue**: `null` \| `string` \| `number` \| `boolean` \| { `[key: string]`: [`JSONValue`](types.md#jsonvalue); } \| [`JSONValue`](types.md#jsonvalue)[]

A recursive description of a valid JSON-like value

#### Defined in

[packages/taskless/src/types.ts:125](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L125)

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

#### Defined in

[packages/taskless/src/types.ts:46](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L46)

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

#### Defined in

[packages/taskless/src/types.ts:108](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L108)

---

### JobHandlerResult

Ƭ **JobHandlerResult**: `Awaited`<`void`\> \| `Awaited`<[`JSONValue`](types.md#jsonvalue)\>

The result of the Job Handler callback

#### Defined in

[packages/taskless/src/types.ts:111](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L111)

---

### JobHeaders

Ƭ **JobHeaders**: `Object`

#### Index signature

▪ [header: `string`]: `string`

#### Defined in

[packages/taskless/src/types.ts:20](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L20)

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

#### Defined in

[packages/taskless/src/types.ts:39](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L39)

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

#### Defined in

[packages/taskless/src/types.ts:25](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L25)

---

### KeyOf

Ƭ **KeyOf**<`T`\>: keyof `T`

A helper type for keyof typeof access

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Defined in

[packages/taskless/src/types.ts:176](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L176)

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

#### Defined in

[packages/taskless/src/types.ts:69](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L69)

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

#### Defined in

[packages/taskless/src/types.ts:5](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L5)

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

#### Defined in

[packages/taskless/src/types.ts:122](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L122)

---

### SupportedCiphers

Ƭ **SupportedCiphers**: `Extract`<`CipherGCMTypes`, `"aes-256-gcm"`\> \| `"none"`

Supported ciphers have iv lengths as well as a matching hash function of equal bits

#### Defined in

[packages/taskless/src/types.ts:134](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L134)

---

### TasklessBody

Ƭ **TasklessBody**: `Object`

The taskless body definition (what is posted to & from the client)

#### Type declaration

| Name        | Type                              | Description               |
| :---------- | :-------------------------------- | :------------------------ |
| `signature` | `string`                          | Signature of text field   |
| `text`      | `string`                          | Possibly ciphered text    |
| `transport` | [`Transport`](types.md#transport) | The encoder transport     |
| `v`         | `number`                          | The Taskless Body Version |

#### Defined in

[packages/taskless/src/types.ts:164](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L164)

---

### Transport

Ƭ **Transport**: { `alg`: [`SupportedCiphers`](types.md#supportedciphers) ; `ev`: `1` } & [`Ciphers`](types.md#ciphers)

Describes the taskless Transport Metadata

#### Defined in

[packages/taskless/src/types.ts:157](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/types.ts#L157)
