import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import type { Database } from "@/lib/supabase/database.types"

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"]
const PUBLIC_PREFIXES = ["/auth/", "/reset-password"]

function isPublicRoute(pathname: string) {
  return (
    AUTH_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  )
}

function redirectWithCookies(request: NextRequest, response: NextResponse, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ""

  const redirect = NextResponse.redirect(url)
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

/**
 * Refreshes the Supabase auth session on navigation and keeps cookies in sync.
 * Route protection here is optimistic: tenant membership is checked by the
 * authenticated layouts and onboarding page, where a profile read is safe.
 */
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Allow the app to boot before Supabase is configured.
  if (!url || !anonKey) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // IMPORTANT: keep this call so expired tokens are refreshed.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const publicRoute = isPublicRoute(pathname)

  if (!user && !publicRoute) {
    const login = request.nextUrl.clone()
    login.pathname = "/login"
    login.search = ""
    if (pathname !== "/") {
      login.searchParams.set("next", `${pathname}${request.nextUrl.search}`)
    }
    const redirect = NextResponse.redirect(login)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    return redirect
  }

  if (user && AUTH_ROUTES.includes(pathname)) {
    return redirectWithCookies(request, response, "/onboarding")
  }

  return response
}
