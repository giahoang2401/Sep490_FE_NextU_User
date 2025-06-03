import { config } from "@/config"
import { deleteCookie, getCookie, hasCookie, setCookie } from "cookies-next"

export const isLogged = () => {
  return hasCookie(config.AUTH_KEY)
}

export const getAccessToken = () => {
  const accessToken = getCookie(config.AUTH_KEY)
  return {
    access_token: accessToken ?? ''
  }
}
//@ts-ignore
export const saveAccessToken = (access_token) => {
  try {
    setCookie(config.AUTH_KEY, access_token, { maxAge: 60 * 6 * 24 * 15, secure: true }) // Cookie sẽ hết hạn sau 15 ngày
  } catch (error) {
    console.error('AUTH COOKIE SAVE ERROR', error)
  }
}

export const removeAccessToken = () => {
  try {
    deleteCookie(config.AUTH_KEY)
  } catch (error) {
    console.error('AUTH COOKIE REMOVE ERROR', error)
  }
}