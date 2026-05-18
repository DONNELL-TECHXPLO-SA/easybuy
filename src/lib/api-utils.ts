import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitHeaders } from "./rate-limit";

export function errorResponse(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message }, { status });
}

export function serverError(error: unknown, context?: string) {
  console.error(`[API Error]${context ? ` ${context}` : ""}:`, error);
  return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}

export function withRateLimit(request: Request, maxRequests = 20): ReturnType<typeof checkRateLimit> {
  return checkRateLimit(getClientIp(request), maxRequests);
}
