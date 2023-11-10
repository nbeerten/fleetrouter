# Fleetrouter

> [!WARNING]
> This router is slow. This is a limitation of the URLPattern API. From my testing ([benchmarks/fetch.js](https://github.com/nbeerten/fleetrouter/tree/main/benchmarks), similar benchmark suite to what Hono is using) I can see this router is able to handle about **22,000 requests per second**.
> Hono is able to achieve above **250,000 requests per second**. Don't use this if you want performance.
> The goal is to string together as much Web APIs as possible, not to be fast or good or usable in production.

Fleetrouter is an ultra-minimal router designed for fleet-footed server-side routing on the edge, fully based on web standards like [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request), [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) and [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

## Installation

You can install Fleetrouter using NPM. Run the following command:

```sh
pnpm add @nbeerten/fleetrouter
```

## Usage

> [!NOTE]
> This example works on Cloudflare Workers. Other runtimes have different ways of exporting the router.

```ts
import { FleetRouter } from "@nbeerten/fleetrouter";

// Optional custom types for Request, Env and Context
// For example, see cloudflare workers docs for more info:
// https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#background
const Router = new FleetRouter<Request, Env, Ctx>();

Router.add("GET", "/", () => {
    return new Response("Hello World!");
});

// You can also use URLPattern have parameters in the URL. For improved
// usability, this package doesns't return the usual output
// of `URLPatternResult` but instead returns an object with the parameters
// of only the path as a `Record<string, string>`.
Router.add("GET", "/path/:id", ({ params }) => {
    return new Response(`Path ${params.id} is awesome!`);
});

Router.add("*", "/*", () => {
    return new Response("Fallback response");
});

export default Router;
```

Routes are evaluated in the order they are added, so a fallback route should always be added last. The first route that matches a request's method and path will be returned.

### Other runtimes

Depending on the runtime you need to export something else. Usually it's as simple as exporting the `Router.fetch` function as a default export, but sometimes you may need to export a function that calls the `Router.fetch` function.

```ts
export default Router.fetch;

// Or

export default (request: Request, context: Context) => {
    return Router.fetch(request, {}, context);
}
```
