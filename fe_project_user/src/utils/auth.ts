import { config } from "@/config"
import { deleteCookie, getCookie, hasCookie, setCookie } from "cookies-next"

export const isLogged = () => {
  return !!localStorage.getItem("access_token");
}

export const getAccessToken = () => {
  const accessToken = localStorage.getItem("access_token");
  return {
    access_token: accessToken ?? ''
  }
}

export const saveAccessToken = (access_token) => {
  try {
    localStorage.setItem("access_token", access_token);
  } catch (error) {
    console.error('AUTH LOCALSTORAGE SAVE ERROR', error);
  }
}

export const removeAccessToken = () => {
  try {
    localStorage.removeItem("access_token");
  } catch (error) {
    console.error('AUTH LOCALSTORAGE REMOVE ERROR', error);
  }
}