import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage =
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/signup"

  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  // If user NOT logged in and trying to access dashboard
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  //  If user logged in and trying to open login/signup
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}