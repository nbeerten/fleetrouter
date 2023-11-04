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

    protected routes: { pattern: string, handler: Handler<Req, Env, Ctx, any>, method: "*" | HttpMethod }[] = [];

    public add<Pattern extends string>(method: HttpMethod, pattern: Pattern extends string ? Pattern : never, handler: Handler<Req, Env, Ctx, Params<Pattern>>): this;
    public add(method: HttpMethod, pattern: URLPattern, handler: Handler<Req, Env, Ctx, unknown>): this;
    public add<Pattern extends string>(method: HttpMethod | "*", pattern: Pattern, handler: Handler<Req, Env, Ctx, Params<Pattern>>): this {
        this.routes.push({ pattern, handler, method });

        return this;
    }

    public async fetch(request: Req, env: Env = {} as Env, ctx: Ctx = {} as Ctx): Promise<Response> {
        try {
            const requestMethod = request.method.toUpperCase() as HttpMethod;
            const filteredRoutes = this.routes.filter(route => route.method === "*" || route.method === requestMethod);

            for (const route of filteredRoutes) {
                const { pattern, handler } = route;
                const routePattern = new URLPattern(pattern, request.url);

                if (routePattern.test(request.url)) {
                    const rawParams = routePattern.exec(request.url);
                    const params = rawParams?.pathname.groups;
                    
                    return params ? handler({ request, env, ctx, params, rawParams }) : handler({ request, env, ctx, params: {} });
                }
            }

            return new Response(null, { status: 404 });
        } catch {
            return new Response(null, { status: 500 });
        }
    }
}

//////////////////////////////////////////////////
//                                              //
//                    Types                     //
//                                              //
//////////////////////////////////////////////////


export type Handler<
    RequestType extends Body = Request,
    Env extends object = {}, 
    Ctx extends object = {},
    Params extends (object | unknown) = {}
> = ({ request, env, ctx, params }: { request: RequestType, env: Env, ctx: Ctx, params: Params, rawParams?: URLPatternResult }) => Promise<Response> | Response;
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | {};

// Much is taken from the Hono router.
// https://github.com/honojs/hono/blob/main/src/types.ts#L532

type ParamKeyName<NameWithPattern> = NameWithPattern extends `${infer Name}(${infer Rest}`
    ? Rest extends `${infer _Pattern}*`
    ? `${Name}*`
    : Name
    : NameWithPattern

type ParamKey<Component> = Component extends `:${infer NameWithPattern}`
    ? ParamKeyName<NameWithPattern>
    : never

type ParamKeys<Path> = Path extends `${infer Component}/${infer Rest}`
    ? ParamKey<Component> | ParamKeys<Rest>
    : ParamKey<Path>

type ParamKeyToRecord<T extends string> = T extends `${infer R}*`
    ? Record<R, string | undefined>
    : { [K in T]: string }

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never

type FlattenObject<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type RecordIfUnknown<T> = T extends object ? T : { [Param in string]: string }

type Params<Pattern> = FlattenObject<RecordIfUnknown<UnionToIntersection<ParamKeyToRecord<ParamKeys<Pattern>>>>>;