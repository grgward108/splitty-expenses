import { createFactory } from "hono/factory";
import type { HealthCheckContext } from "../generated/endpoints/health/health.context";

const factory = createFactory();

export const healthCheckHandlers = factory.createHandlers(async (c: HealthCheckContext) => {
  return c.json({
    status: "ok" as const,
    timestamp: new Date().toISOString(),
  });
});
