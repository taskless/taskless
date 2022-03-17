[@taskless/client](../README.md) / next

# Module: next

## Table of contents

### Interfaces

- [TasklessNextApiHandler](../interfaces/next.TasklessNextApiHandler.md)

### Functions

- [createQueue](next.md#createqueue)

## Functions

### createQueue

▸ **createQueue**<`T`\>(`route`, `handler`, `queueOptions?`, `defaultJobOptions?`): [`TasklessNextApiHandler`](../interfaces/next.TasklessNextApiHandler.md)<`T`\>

Creates a next.js compatible API Route that doubles as a Taskless Queue object

#### Type parameters

| Name | Type        | Description                                                                                                                                                 |
| :--- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `T`  | `undefined` | Describes the payload and is passed through to [JobHandler](types.md#jobhandler) and [TasklessNextApiHandler](../interfaces/next.TasklessNextApiHandler.md) |

#### Parameters

| Name                 | Type                                      | Description                                                                                    |
| :------------------- | :---------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `route`              | `string`                                  | The URL path to reach this route                                                               |
| `handler`            | [`JobHandler`](types.md#jobhandler)<`T`\> | A [JobHandler](types.md#jobhandler) that supports a payload of type `T`                        |
| `queueOptions?`      | [`QueueOptions`](types.md#queueoptions)   | The [QueueOptions](types.md#queueoptions) for this queue                                       |
| `defaultJobOptions?` | [`JobOptions`](types.md#joboptions)       | A set of [JobOptions](types.md#joboptions) to apply as defaults for every new job in the Queue |

#### Returns

[`TasklessNextApiHandler`](../interfaces/next.TasklessNextApiHandler.md)<`T`\>

#### Defined in

[packages/taskless/src/next.ts:38](https://github.com/taskless/taskless/blob/6436a96/packages/taskless/src/next.ts#L38)
