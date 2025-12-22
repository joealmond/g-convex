import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

import { httpAction } from "./_generated/server";

http.route({
  pathPrefix: "/api/auth/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    return auth.handler(request);
  }),
});

http.route({
  pathPrefix: "/api/auth/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return auth.handler(request);
  }),
});

export default http;
