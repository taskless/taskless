[@taskless/client](../README.md) / next

# Module: next

## Table of contents

### Interfaces

- [TasklessNextApiHandler](../interfaces/next.TasklessNextApiHandler.md)

### Functions

- [createQueue](next.md#createqueue)

## Functions

### createQueue

▸ **createQueue**<`T`\>(`route`, `handler`, `options?`): [`TasklessNextApiHandler`](../interfaces/next.TasklessNextApiHandler.md)<`T`\>

Creates a next.js compatible API Route that doubles as a Taskless Queue object

#### Type parameters

| Name | Type        | Description                                                                                                                                                 |
| :--- | :---------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `T`  | `undefined` | Describes the payload and is passed through to [JobHandler](types.md#jobhandler) and [TasklessNextApiHandler](../interfaces/next.TasklessNextApiHandler.md) |

#### Parameters

| Name       | Type                                      |
| :--------- | :---------------------------------------- |
| `route`    | `string`                                  |
| `handler`  | [`JobHandler`](types.md#jobhandler)<`T`\> |
| `options?` | [`QueueOptions`](types.md#queueoptions)   |

#### Returns

[`TasklessNextApiHandler`](../interfaces/next.TasklessNextApiHandler.md)<`T`\>

#### Defined in

[packages/taskless/src/next.ts:32](https://github.com/taskless/taskless/blob/c9e7b9d/packages/taskless/src/next.ts#L32)
