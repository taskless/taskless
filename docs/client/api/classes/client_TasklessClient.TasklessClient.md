[@taskless/client](../README.md) / [client/TasklessClient](../modules/client_TasklessClient.md) / TasklessClient

# Class: TasklessClient<T\>

[client/TasklessClient](../modules/client_TasklessClient.md).TasklessClient

## Type parameters

| Name |
| :--- |
| `T`  |

## Table of contents

### Methods

- [b2p](client_TasklessClient.TasklessClient.md#b2p)
- [delete](client_TasklessClient.TasklessClient.md#delete)
- [enqueue](client_TasklessClient.TasklessClient.md#enqueue)
- [get](client_TasklessClient.TasklessClient.md#get)
- [p2b](client_TasklessClient.TasklessClient.md#p2b)
- [receive](client_TasklessClient.TasklessClient.md#receive)
- [update](client_TasklessClient.TasklessClient.md#update)

### Constructors

- [constructor](client_TasklessClient.TasklessClient.md#constructor)

## Methods

### b2p

▸ **b2p**(`body`): `T`

Turn a Taskless Body into a payload

#### Parameters

| Name   | Type                                               |
| :----- | :------------------------------------------------- |
| `body` | [`TasklessBody`](../modules/types.md#tasklessbody) |

#### Returns

`T`

---

### delete

▸ **delete**(`name`): `Promise`<`null` \| [`Job`](../modules/types.md#job)<`T`\>\>

Removes a job from the queue

#### Parameters

| Name   | Type     | Description         |
| :----- | :------- | :------------------ |
| `name` | `string` | The name of the job |

#### Returns

`Promise`<`null` \| [`Job`](../modules/types.md#job)<`T`\>\>

a Promise containing the Job object that was removed

---

### enqueue

▸ **enqueue**(`name`, `payload`, `options?`): `Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

Adds a job to the queue for processing

#### Parameters

| Name       | Type                                           | Description                                            |
| :--------- | :--------------------------------------------- | :----------------------------------------------------- |
| `name`     | `string`                                       | The name of the job                                    |
| `payload`  | `T`                                            | The job's payload                                      |
| `options?` | [`JobOptions`](../modules/types.md#joboptions) | Additional job options overriding the queue's defaults |

#### Returns

`Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

a Promise containing the Job object enqueued

---

### get

▸ **get**(`name`): `Promise`<`null` \| [`Job`](../modules/types.md#job)<`T`\>\>

#### Parameters

| Name   | Type     |
| :----- | :------- |
| `name` | `string` |

#### Returns

`Promise`<`null` \| [`Job`](../modules/types.md#job)<`T`\>\>

---

### p2b

▸ **p2b**(`payload`): [`TasklessBody`](../modules/types.md#tasklessbody)

Turn a payload into a Taskless Body

#### Parameters

| Name      | Type |
| :-------- | :--- |
| `payload` | `T`  |

#### Returns

[`TasklessBody`](../modules/types.md#tasklessbody)

---

### receive

▸ **receive**(`functions`): `Promise`<`void`\>

Recieve a message and execute the handler for it
errors are caught and converted to a 500 response, while
any success is returned as a 200

#### Parameters

| Name                   | Type                                                                                                          | Description                                                         |
| :--------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------ |
| `functions`            | `Object`                                                                                                      | A set of accessory functions for accessing the request and response |
| `functions.getBody`    | [`GetBodyCallback`](../modules/types.md#getbodycallback)<[`TasklessBody`](../modules/types.md#tasklessbody)\> | Gets the body of the request as a JS object                         |
| `functions.getHeaders` | [`GetHeadersCallback`](../modules/types.md#getheaderscallback)                                                | Gets the request headers as a JS object                             |
| `functions.send`       | [`SendJsonCallback`](../modules/types.md#sendjsoncallback)                                                    | Sends a request via ServerResponse or framework equivalent          |
| `functions.sendError`  | [`SendJsonCallback`](../modules/types.md#sendjsoncallback)                                                    | Sends an error via ServerResponse or framework equivalent           |

#### Returns

`Promise`<`void`\>

---

### update

▸ **update**(`name`, `payload`, `options?`): `Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

Updates a job in the queue

#### Parameters

| Name       | Type                                           | Description                                                               |
| :--------- | :--------------------------------------------- | :------------------------------------------------------------------------ |
| `name`     | `string`                                       | The name of the job                                                       |
| `payload`  | `undefined` \| `T`                             | The job's payload. A value of `undefined` will reuse the existing payload |
| `options?` | [`JobOptions`](../modules/types.md#joboptions) | Additional job options overriding the queue's defaults                    |

#### Returns

`Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

a Promise containing the updated Job object

## Constructors

### constructor

• **new TasklessClient**<`T`\>(`args`)

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Parameters

| Name   | Type                                                                                                       |
| :----- | :--------------------------------------------------------------------------------------------------------- |
| `args` | [`TasklessClientConstructorArgs`](../modules/client_TasklessClient.md#tasklessclientconstructorargs)<`T`\> |
