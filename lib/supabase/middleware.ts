import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from './config'
import type { Database } from './types'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isAdminRoute = pathname.startsWith('/admin')
  const isCustomerRoute = pathname.startsWith('/dashboard')

  if (isAdminRoute || isCustomerRoute) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id ?? '').maybeSingle()

    if (isAdminRoute && profile?.role !== 'admin') {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      dashboardUrl.searchParams.set('admin', 'required')
      return NextResponse.redirect(dashboardUrl)
    }

    if (isCustomerRoute && profile?.role === 'admin') {
      const adminUrl = request.nextUrl.clone()
      adminUrl.pathname = '/admin'
      adminUrl.searchParams.set('from', 'dashboard')
      return NextResponse.redirect(adminUrl)
    }
  }

  return response
}
