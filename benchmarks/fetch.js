// @ts-check
import Benchmark from "benchmark";
import { makeEdgeEnv, EdgeFetchEvent } from "edge-mock";
import { FleetRouter } from "../dist/index.mjs";

const fleet = new FleetRouter();

fleet
.add("GET", "/user/username/:username", ({ params }) => {
    return new Response(JSON.stringify(params));
})
.add("GET", "/hello", () => {
    return new Response("Hello World!");
})
.add("GET", "about", () => {
    return new Response("About");
})
.add("GET", "/contact", () => {
    return new Response("Contact");
})
.add("GET", "/login", () => {
    return new Response("Login");
})
.add("GET", "/register", () => {
    return new Response("Register");
})
.add("GET", "/dashboard", () => {
    return new Response("Dashboard");
})
.add("GET", "/profile", () => {
    return new Response("Profile");
})
.add("GET", "/services", () => {
    return new Response("Services");
})
.add("GET", "/user/:id", ({ params }) => {
    return new Response(JSON.stringify(params));
})

const request = new Request('http://localhost/user/9', { method: 'GET' })

makeEdgeEnv()

// FetchEvent Object
const event = new EdgeFetchEvent('fetch', { request })

const suite = new Benchmark.Suite();

suite
    .add('Fleet', async () => {
        await fleet.fetch(event.request)
    })
    .on('cycle', (event) => {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log(`Fastest is ${this.filter('fastest').map('name')}`)
    })
    .run({ async: true })