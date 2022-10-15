<!-- Banner -->
<p align="center">
  <a href="https://taskless.io">
    <img alt="taskless logo" height="128" src="https://raw.githubusercontent.com/taskless/taskless/main/.github/resources/taskless.png">
    <h1 align="center">Taskless</h1>
  </a>
</p>

<!-- Docs -->
<p align="center">
  <a aria-label="taskless documentation" href="https://taskless.io/docs">Read the Documentation 📚</a>
</p>

---

# @taskless/graphinql

A super-lightweight GraphQL client built on [isomorphic-unfetch](https://www.npmjs.com/package/isomorphic-unfetch) and [p-retry](https://github.com/sindresorhus/p-retry). It's used by both the Taskless Client and Taskless Dev Server for simple GraphQL operations. Originally inspired by phin, which the library was inspired by. As few dependencies as possible, works in the browser and server. Specifically built to work with strings and avoid a dependency on `graphql` / `graphql-tag`.

- ✅ Queries, Mutations, Introspection
- ✅ Custom headers per request or shared via `new GraphQLClient()`
- ❌ Typed GraphQL Document Node (would require graphql typings, adding dependencies and complexity)
- ❌ Subscriptions
- ❌ Docs (currently)
