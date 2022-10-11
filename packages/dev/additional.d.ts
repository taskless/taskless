// ref: https://stackoverflow.com/questions/59459312/using-globalthis-in-typescript
declare global {
  var memoryCache: Record<string, any>;
}

export {};
