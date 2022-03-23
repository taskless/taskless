[@taskless/client](../README.md) / integrations/express

# Module: integrations/express

## Table of contents

### Type aliases

- [ExpressQueueOptions](integrations_express.md#expressqueueoptions)

### Interfaces

- [TasklessExpressRouter](../interfaces/integrations_express.TasklessExpressRouter.md)

### Functions

- [createQueue](integrations_express.md#createqueue)

## Type aliases

### ExpressQueueOptions

Ƭ **ExpressQueueOptions**: [`QueueOptions`](types.md#queueoptions)

Express Queue Options take all of the optional [QueueOptions](types.md#queueoptions)

## Functions

### createQueue

▸ **createQueue**<`T`\>(`route`, `handler`, `queueOptions`, `defaultJobOptions?`): [`TasklessExpressRouter`](../interfaces/integrations_express.TasklessExpressRouter.md)<`T`\>

Creates an Express Router object augmented with Taskess Queue methods

#### Type parameters

| Name | Type        | Description                                                                      |
| :--- | :---------- | :------------------------------------------------------------------------------- |
| `T`  | `undefined` | Describes the payload and is passed through to [JobHandler](types.md#jobhandler) |

#### Parameters

| Name                 | Type                                      | Description                                                                                    |
| :------------------- | :---------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `route`              | `string`                                  | The URL path to reach this route                                                               |
| `handler`            | [`JobHandler`](types.md#jobhandler)<`T`\> | A [JobHandler](types.md#jobhandler) that supports a payload of type `T`                        |
| `queueOptions`       | [`QueueOptions`](types.md#queueoptions)   | The [QueueOptions](types.md#queueoptions) for this queue                                       |
| `defaultJobOptions?` | [`JobOptions`](types.md#joboptions)       | A set of [JobOptions](types.md#joboptions) to apply as defaults for every new job in the Queue |

#### Returns

[`TasklessExpressRouter`](../interfaces/integrations_express.TasklessExpressRouter.md)<`T`\>
