[@taskless/client](../README.md) / [integrations/express](../modules/integrations_express.md) / TasklessExpressRouter

# Interface: TasklessExpressRouter<T\>

[integrations/express](../modules/integrations_express.md).TasklessExpressRouter

An Express compatible API Handler, with Taskless Queue support

## Type parameters

| Name | Description                                                          |
| :--- | :------------------------------------------------------------------- |
| `T`  | Used for typing the [QueueMethods](../modules/types.md#queuemethods) |

## Hierarchy

- [`QueueMethods`](../modules/types.md#queuemethods)<`T`\>

  ↳ **`TasklessExpressRouter`**

## Table of contents

### Methods

- [delete](integrations_express.TasklessExpressRouter.md#delete)
- [enqueue](integrations_express.TasklessExpressRouter.md#enqueue)
- [get](integrations_express.TasklessExpressRouter.md#get)
- [update](integrations_express.TasklessExpressRouter.md#update)

### Properties

- [router](integrations_express.TasklessExpressRouter.md#router)

## Methods

### delete

▸ **delete**(`name`): `Promise`<`null` \| [`Job`](../modules/types.md#job)<`T`\>\>

Delete an item from the queue

**`throws`** Error if the job could not be deleted

#### Parameters

| Name   | Type     | Description    |
| :----- | :------- | :------------- |
| `name` | `string` | The Job's name |

#### Returns

`Promise`<`null` \| [`Job`](../modules/types.md#job)<`T`\>\>

The deleted `Job` object, or `null` if no job was deleted

#### Inherited from

QueueMethods.delete

---

### enqueue

▸ **enqueue**(`name`, `payload`, `options?`): `Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

Adds an item to the queue. If an item of the same name exists, it will be replaced with this new data

**`throws`** Error when the job could not be created in the Taskless system

#### Parameters

| Name       | Type                                           | Description                                                                                  |
| :--------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `name`     | `string`                                       | The Job's identifiable name                                                                  |
| `payload`  | `T`                                            | The Job's payload to be delivered                                                            |
| `options?` | [`JobOptions`](../modules/types.md#joboptions) | Job options. These overwrite the default job options specified on the queue at creation time |

#### Returns

`Promise`<[`Job`](../modules/types.md#job)<`T`\>\>

The `Job` object

#### Inherited from

QueueMethods.enqueue

---

### get

▸ **get**(`name`): `Promise`<`null` \| [`Job`](../modules/types.md#job)<`T`\>\>

Retrieve an item from the Taskless queue

#### Parameters

| Name   | Type     | Description    |
| :----- | :------- | :------------- |
| `name` | `string` | the Job's name |

#### Returns

`Promise`<`null` \| [`Job`](../modules/types.md#job)<`T`\>\>

The `Job` object or `null` if no job was deleted

#### Inherited from

QueueMethods.get

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

## Properties

### router

• **router**: `Router`

The Express router object which should be mounted at Application root via `app.use()`
