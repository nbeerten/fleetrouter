export type Handler<RequestType extends Body = Request, Env extends object = {}, Ctx extends object = {}> = ({ request, env, ctx, params }: { request: RequestType, env: Env, ctx: Ctx, params?: URLPatternResult }) => Promise<Response> | Response;
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | {};

// @ts-expect-error URLPattern is not included in default types.
if (!globalThis.URLPattern) { 
    await import("urlpattern-polyfill");
}

export class FleetRouter<Req extends Request = Request, Env extends object = {}, Ctx extends object = {}> {
    constructor() {
        Object.assign(this, {
            fetch: this.fetch.bind(this)
        });
    }

    protected routes: { pattern: string | URLPatternInit, handler: Handler<Req, Env, Ctx>, method: "*" | HttpMethod }[] = [];

    public add(method: HttpMethod | "*", pattern: string | URLPatternInit, handler: Handler<Req, Env, Ctx>) {
        this.routes.push({ pattern, handler, method });
    }

    public async fetch(request: Req, env: Env = {} as Env, ctx: Ctx = {} as Ctx): Promise<Response> {
        try {
            const requestMethod = request.method.toUpperCase() as HttpMethod;
            const filteredRoutes = this.routes.filter(route => route.method === "*" || route.method === requestMethod);

            for (const route of filteredRoutes) {
                const { pattern, handler } = route;
                const routePattern = new URLPattern(pattern, request.url);

                if (routePattern.test(request.url)) {
                    const params = routePattern.exec(request.url);
                    return params ? handler({ request, env, ctx, params }) : handler({ request, env, ctx });
                }
            }

            return new Response(null, { status: 404 });
        } catch {
            return new Response(null, { status: 500 });
        }
    }
}