import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true })

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const body = (await request.json()) as {
    access_token?: string
    refresh_token?: string
  }

  if (!body.access_token || !body.refresh_token) {
    return NextResponse.json({ error: 'Missing Supabase session tokens.' }, { status: 400 })
  }

  const { error } = await supabase.auth.setSession({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
  })

  if (error) {
    console.error('Server session sync failed:', error)
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return response
}
