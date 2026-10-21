import { NextResponse, type NextRequest } from "next/server";
import { slugFromHost } from "@/lib/branch-routing";

/**
 * Subdomain support.
 *
 * In "path" mode this does nothing. In "subdomain" mode a request to
 * nellikatte.ambikapucollege.edu.in/courses is rewritten internally to
 * /nellikatte/courses, so the same route files serve both URL shapes and
 * switching between them is a configuration change, not a rebuild.
 */
export default function proxy(request: NextRequest) {
  const slug = slugFromHost(request.headers.get("host"));

  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();

  // Already rewritten (or the visitor typed the path form on the subdomain).
  if (url.pathname === `/${slug}` || url.pathname.startsWith(`/${slug}/`)) {
    return NextResponse.next();
  }

  url.pathname = `/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|favicon.ico|api).*)"],
};
