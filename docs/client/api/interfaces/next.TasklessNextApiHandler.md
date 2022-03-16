[@taskless/client](../README.md) / [next](../modules/next.md) / TasklessNextApiHandler

# Interface: TasklessNextApiHandler<T\>

[next](../modules/next.md).TasklessNextApiHandler

## Type parameters

| Name | Description                                                                                          |
| :--- | :--------------------------------------------------------------------------------------------------- |
| `T`  | Used for typing the [QueueMethods](../modules/types.md#queuemethods) and {@link NextMethods} objects |

## Hierarchy

- `NextApiHandler`

- [`QueueMethods`](../modules/types.md#queuemethods)<`T`\>

- `NextMethods`<`T`\>

  ↳ **`TasklessNextApiHandler`**

## Callable

### TasklessNextApiHandler

▸ **TasklessNextApiHandler**(`req`, `res`): `void` \| `Promise`<`void`\>

Next `API` route handler

#### Parameters

| Name  | Type                      | Description                                           |
| :---- | :------------------------ | :---------------------------------------------------- |
| `req` | `NextApiRequest`          | The NextApiRequest which extends http#IncomingMessage |
| `res` | `NextApiResponse`<`any`\> | The NextApiResponse which extends http#ServerResponse |

#### Returns

`void` \| `Promise`<`void`\>

#### Defined in

node_modules/next/dist/shared/lib/utils.d.ts:251

## Table of contents

### Methods

- [delete](next.TasklessNextApiHandler.md#delete)
- [enqueue](next.TasklessNextApiHandler.md#enqueue)
- [get](next.TasklessNextApiHandler.md#get)
- [update](next.TasklessNextApiHandler.md#update)
- [withQueue](next.TasklessNextApiHandler.md#withqueue)

## Methods

### delete

▸ **delete**(`name`): `Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

Delete an item from the queue

**`throws`** Error if the job could not be deleted

#### Parameters

| Name   | Type     | Description    |
| :----- | :------- | :------------- |
| `name` | `string` | The Job's name |

#### Returns

`Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

The deleted `Job` object

#### Inherited from

QueueMethods.delete

#### Defined in

[packages/taskless/src/types.ts:98](https://github.com/taskless/taskless/blob/c9e7b9d/packages/taskless/src/types.ts#L98)

---

### enqueue

▸ **enqueue**(`name`, `payload`, `options?`): `Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

Adds an item to the queue. If an item of the same name exists, it will be replaced with this new data

**`throws`** Error when the job could not be created in the Taskless system

#### Parameters

| Name       | Type                                           | Description                                                                                                         |
| :--------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `name`     | `null` \| `string`                             | The Job's name. Should be unique to the system if you wish to retrieve it later. If `null` will result in a v4 uuid |
| `payload`  | `T`                                            | The Job's payload to be delivered                                                                                   |
| `options?` | [`JobOptions`](../modules/types.md#joboptions) | Job options. These overwrite the default job options specified on the queue at creation time                        |

#### Returns

`Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

The `Job` object

#### Inherited from

QueueMethods.enqueue

#### Defined in

[packages/taskless/src/types.ts:78](https://github.com/taskless/taskless/blob/c9e7b9d/packages/taskless/src/types.ts#L78)

---

### get

▸ **get**(`name`): `Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

Retrieve an item from the Taskless queue

#### Parameters

| Name   | Type     | Description    |
| :----- | :------- | :------------- |
| `name` | `string` | the Job's name |

#### Returns

`Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

The `Job` object

#### Inherited from

QueueMethods.get

#### Defined in

[packages/taskless/src/types.ts:104](https://github.com/taskless/taskless/blob/c9e7b9d/packages/taskless/src/types.ts#L104)

---

### update

▸ **update**(`name`, `payload`, `options?`): `Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

Update an existing item in the queue

**`throws`** Error when there is no existing item to update

#### Parameters

| Name       | Type                                           | Description                                                                                                 |
| :--------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                       | The Job's name                                                                                              |
| `payload`  | `T`                                            |                                                                                                             |
| `options?` | [`JobOptions`](../modules/types.md#joboptions) | The Job Options. These are merged on top of the default Job Options specified on the queue at creation time |

#### Returns

`Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

The `Job` object

#### Inherited from

QueueMethods.update

#### Defined in

[packages/taskless/src/types.ts:91](https://github.com/taskless/taskless/blob/c9e7b9d/packages/taskless/src/types.ts#L91)

---

### withQueue

▸ **withQueue**(`wrappedHandler`): [`TasklessNextApiHandler`](next.TasklessNextApiHandler.md)<`T`\>

#### Parameters

| Name             | Type                     |
| :--------------- | :----------------------- |
| `wrappedHandler` | `NextApiHandler`<`any`\> |

#### Returns

[`TasklessNextApiHandler`](next.TasklessNextApiHandler.md)<`T`\>

#### Inherited from

NextMethods.withQueue

#### Defined in

[packages/taskless/src/next.ts:10](https://github.com/taskless/taskless/blob/c9e7b9d/packages/taskless/src/next.ts#L10)
