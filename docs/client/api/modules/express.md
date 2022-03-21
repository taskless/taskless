[@taskless/client](../README.md) / express

# Module: express

## Table of contents

### Type aliases

- [ExpressQueueOptions](express.md#expressqueueoptions)

### Interfaces

- [TasklessExpressRouter](../interfaces/express.TasklessExpressRouter.md)

### Functions

- [createQueue](express.md#createqueue)

## Type aliases

### ExpressQueueOptions

Ƭ **ExpressQueueOptions**: [`QueueOptions`](types.md#queueoptions) & { `middleware`: `Express.RequestHandler`[] ; `router`: `Express.Router` }

Express Queue Options take all of the optional [QueueOptions](types.md#queueoptions), but also
require you to declare your `router` and `middleware` implementation. In most
cases, you can pass in an instance of an express Router and a middleware that
includes at a minimum the express json body parser.

**`example`** ```ts
{
// other QueueOptions can be included
router: express.Router(),
middleware: [express.json()]
}

```

## Functions

### createQueue

▸ **createQueue**<`T`\>(`route`, `handler`, `queueOptions`, `defaultJobOptions?`): [`TasklessExpressRouter`](../interfaces/express.TasklessExpressRouter.md)<`T`\>

Creates an Express Router object augmented with Taskess Queue methods

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | `undefined` | Describes the payload and is passed through to [JobHandler](types.md#jobhandler) |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `route` | `string` | The URL path to reach this route |
| `handler` | [`JobHandler`](types.md#jobhandler)<`T`\> | A [JobHandler](types.md#jobhandler) that supports a payload of type `T` |
| `queueOptions` | [`ExpressQueueOptions`](express.md#expressqueueoptions) | The [QueueOptions](types.md#queueoptions) for this queue |
| `defaultJobOptions?` | [`JobOptions`](types.md#joboptions) | A set of [JobOptions](types.md#joboptions) to apply as defaults for every new job in the Queue |

#### Returns

[`TasklessExpressRouter`](../interfaces/express.TasklessExpressRouter.md)<`T`\>
```
