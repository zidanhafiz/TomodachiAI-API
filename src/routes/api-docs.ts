import { SwaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";

const apiDocs = new Hono().get("/v1/api-docs", (c) => {
  return c.html(`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Custom Swagger" />
        <title>Tomodachiai API</title>
      </head>
      ${SwaggerUI({ url: "/v1-api-docs" })}
    </html>
  `);
});

export default apiDocs;
