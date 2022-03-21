[@taskless/client](../README.md) / client/TasklessClient

# Module: client/TasklessClient

## Table of contents

### Classes

- [TasklessClient](../classes/client_TasklessClient.TasklessClient.md)

### Type aliases

- [TasklessClientConstructorArgs](client_TasklessClient.md#tasklessclientconstructorargs)

## Type aliases

### TasklessClientConstructorArgs

Ƭ **TasklessClientConstructorArgs**<`T`\>: `Object`

Constructor arguments for the Taskless Client

#### Type parameters

| Name | Description                                                         |
| :--- | :------------------------------------------------------------------ |
| `T`  | Describes the payload used in the [JobHandler](types.md#jobhandler) |

#### Type declaration

| Name            | Type                                      | Description                                                                          |
| :-------------- | :---------------------------------------- | :----------------------------------------------------------------------------------- |
| `handler`       | [`JobHandler`](types.md#jobhandler)<`T`\> | A callback handler for processing the job **`template`** The expected payload object |
| `jobOptions?`   | [`JobOptions`](types.md#joboptions)       | Default options applied to newly enqueued jobs                                       |
| `queueOptions?` | [`QueueOptions`](types.md#queueoptions)   | Options applied to the Queue globally                                                |
| `route`         | `string`                                  | The route slug this client is managing                                               |
