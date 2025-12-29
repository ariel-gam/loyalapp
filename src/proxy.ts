import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Protect /setup route
    if (request.nextUrl.pathname.startsWith('/setup')) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Optional: Refresh session for other routes if cookie exists
    // This is important because the session token rotates.
    // However, we only need to "wait" for it if we are actually using the user object.
    // The createServerClient's `setAll` cookie logic happens inside `getUser` (it calls internal methods).
    // So we should call it if we suspect a user is logged in.

    // Check if we have a supabase cookie coming in
    const hasSupabaseCookie = request.cookies.getAll().some(c => c.name.includes('sb-'));
    if (hasSupabaseCookie && !request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/setup')) {
        await supabase.auth.getUser()
    }

    return response
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/setup/:path*',
        '/login',
        '/auth/:path*'
    ]
}
