# Fleetrouter

Fleetrouter is an ultra-minimal router designed for fleet-footed server-side routing on the edge, fully based on web standards like [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request), [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) and [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

> [!IMPORTANT]  
> This is an experimental side project and is not made or intended for production use.

## Installation

You can install FleetRouter using NPM. Run the following command:

```sh
pnpm add @nbeerten/fleetrouter
```

## Usage

```ts
import { FleetRouter } from "@nbeerten/fleetrouter";

// Optional custom types for Request, Env and Context
// For example, see cloudflare workers docs for more info:
// https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#background
const Router = new FleetRouter<Request, Env, Ctx>();

Router.add("GET", "/", () => {
    return new Response("Hello World!");
});

Router.add("*", "/*", () => {
    return new Response("Fallback response");
});

export default Router;
```

Routes are evaluated in the order they are added, so a fallback route should always be added last. The first route that matches a request's method and path will be returned.

Exporting the router like in the example is only possible in runtimes like Cloudflare Workers or Vercel Edge Functions, where the default export of the entrypoint is an object, containing a fetch function. If you want to add other handlers, like scheduled handlers on cloudflare workers, use the following:

```ts
export default {
    fetch: Router.fetch,
    scheduled: () => { ... }
}
```
