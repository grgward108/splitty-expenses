import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { parse } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENAPI_PATH = join(__dirname, "../generated/openapi.yaml");
const PORT = process.env.SWAGGER_PORT || 4000;

function loadOpenApiSpec() {
  try {
    const content = readFileSync(OPENAPI_PATH, "utf-8");
    return parse(content);
  } catch (error) {
    console.error("Failed to load OpenAPI spec:", error);
    return null;
  }
}

let openApiSpec = loadOpenApiSpec();

const app = express();

// Serve static swagger UI assets
app.use(
  "/api-docs",
  (_req, _res, next) => {
    // Reload spec on each request to pick up changes
    openApiSpec = loadOpenApiSpec();
    next();
  },
  swaggerUi.serve,
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (openApiSpec) {
      swaggerUi.setup(openApiSpec, {
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Monorepo API - Swagger",
      })(req, res, next);
    } else {
      res.status(500).send("OpenAPI spec not found");
    }
  }
);

// Redirect root to swagger docs
app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});

// Serve raw OpenAPI spec
app.get("/openapi.yaml", (_req, res) => {
  res.sendFile(OPENAPI_PATH);
});

app.get("/openapi.json", (_req, res) => {
  openApiSpec = loadOpenApiSpec();
  if (openApiSpec) {
    res.json(openApiSpec);
  } else {
    res.status(500).json({ error: "OpenAPI spec not found" });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Swagger UI is running at http://localhost:${PORT}/api-docs`);
  console.log("📄 OpenAPI spec available at:");
  console.log(`   - http://localhost:${PORT}/openapi.yaml`);
  console.log(`   - http://localhost:${PORT}/openapi.json\n`);
});
