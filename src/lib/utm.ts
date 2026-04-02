const UTM_COOKIE_NAME = 'linzmeier_utm'
const UTM_COOKIE_DAYS = 30

export interface UtmData {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    let c = cookies[i].trim()
    if (c.startsWith(nameEQ)) {
      return decodeURIComponent(c.substring(nameEQ.length))
    }
  }
  return null
}

/**
 * Reads UTM params from the current URL and saves them to a cookie.
 * Only writes the cookie if at least one UTM param is present.
 */
export function saveUtmFromUrl(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)

  const utmData: UtmData = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
  }

  // Only save if at least one UTM param is present
  const hasAny = Object.values(utmData).some((v) => v !== null && v !== '')
  if (hasAny) {
    setCookie(UTM_COOKIE_NAME, JSON.stringify(utmData), UTM_COOKIE_DAYS)
  }
}

/**
 * Reads the UTM cookie and returns the parsed UTM data, or null if not found.
 */
export function getUtmFromCookies(): UtmData | null {
  if (typeof window === 'undefined') return null

  const raw = getCookie(UTM_COOKIE_NAME)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as UtmData
    return parsed
  } catch {
    return null
  }
}
