# Taskless & Express Using `@taskless/client/express`

This is an example of using the Taskless.io client in an Express application. Please see [routes/queues/sample.ts](./routes/queues/sample.js) for how to set up the queue, and [routes/run-sample.js](./routes/run-sample.js) for an example of triggering a queue.

To run:

1. run `yarn install`
2. run `yarn start`
3. visit `http://localhost:3000/run-sample` with your browser or wget the url with `wget http://localhost:3000/run-sample` from a terminal window

## Changes from Base App

- Adds [dotenv](https://www.npmjs.com/package/dotenv) to allow loading of env files in development
- Adds [concurrently](https://www.npmjs.com/package/concurrently) for launching the Taskless dev server alongside express
- Fixes the `__dirname` const in `app.js` to comply with ES6
- changes `www.js` to emit a `console.log` to confirm server start

---

(express generator does not create a `README.md`)
