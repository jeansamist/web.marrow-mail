/* eslint-disable @typescript-eslint/no-explicit-any */

import { isAxiosError } from "axios"
import { axiosInstance } from "./axios-instance-mail"
type Response<T> =
  | { success: true; data: T; message?: string }
  | { success: false; data: null; message?: string }

// Define common types for success and error handlers
type ApiSuccessHandler<RESPONSE, RETURN = RESPONSE> = (data: RESPONSE) => RETURN
type ApiErrorHandler = (error: Error) => Error

// Define a generic type for the API function
type ApiFunction = <PAYLOAD = undefined, RESPONSE = unknown, RETURN = RESPONSE>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  payload?: PAYLOAD,
  onSuccess?: ApiSuccessHandler<RESPONSE, RETURN>,
  onError?: ApiErrorHandler
) => Promise<RETURN | Error>

// Centralized API request handler
const apiRequest: ApiFunction = async <PAYLOAD, RESPONSE, RETURN = RESPONSE>(
  method: string,
  url: string,
  payload: PAYLOAD,
  onSuccess: ApiSuccessHandler<RESPONSE, RETURN> | undefined,
  onError: ApiErrorHandler | undefined
): Promise<RETURN | Error> => {
  const unknownError = onError
    ? onError(new Error("Unknown error"))
    : new Error("Unknown error")

  try {
    const _url = "/api/mail" + (url?.startsWith("/") ? url : "/" + url)
    // Determine the correct axios method and call it
    const axiosMethod = () => {
      switch (method) {
        case "POST":
          return axiosInstance.post<Response<RESPONSE>>(_url, payload)
        case "PUT":
          return axiosInstance.put<Response<RESPONSE>>(_url, payload)
        case "DELETE":
          return axiosInstance.delete<Response<RESPONSE>>(_url)
        case "GET":
        default:
          return axiosInstance.get<Response<RESPONSE>>(_url)
      }
    }

    const { data: response } = await axiosMethod()

    // Handle successful responses with null data properly
    if (response.success) {
      if (response.data !== undefined) {
        return onSuccess ? onSuccess(response.data) : (response.data as RETURN)
      } else {
        // Return null for explicit null data
        return onSuccess ? onSuccess(null as any) : (null as any as RETURN)
      }
    } else {
      // Handle error responses
      const errorMessage = response.message || "Unknown error"
      return onError
        ? onError(new Error(errorMessage))
        : new Error(errorMessage)
    }
  } catch (error) {
    if (isAxiosError(error)) {
      if (
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        return onError
          ? onError(new Error(error.response?.data.message))
          : new Error(error.response?.data.message)
      }
    }
    console.error("[API] Unexpected error:", error)

    return unknownError
  }
}

// Specific functions for each HTTP method
export const GET = <RESPONSE, RETURN = RESPONSE>(
  url: string,
  onSuccess?: ApiSuccessHandler<RESPONSE, RETURN>,
  onError?: ApiErrorHandler
) =>
  apiRequest<undefined, RESPONSE, RETURN>(
    "GET",
    url,
    undefined,
    onSuccess,
    onError
  )

export const POST = <PAYLOAD, RESPONSE, RETURN = RESPONSE>(
  url: string,
  payload: PAYLOAD,
  onSuccess?: ApiSuccessHandler<RESPONSE, RETURN>,
  onError?: ApiErrorHandler
) =>
  apiRequest<PAYLOAD, RESPONSE, RETURN>(
    "POST",
    url,
    payload,
    onSuccess,
    onError
  )

export const PUT = <PAYLOAD, RESPONSE, RETURN = RESPONSE>(
  url: string,
  payload: PAYLOAD,
  onSuccess?: ApiSuccessHandler<RESPONSE, RETURN>,
  onError?: ApiErrorHandler
) =>
  apiRequest<PAYLOAD, RESPONSE, RETURN>("PUT", url, payload, onSuccess, onError)

export const DELETE = <RESPONSE, RETURN = RESPONSE>(
  url: string,
  onSuccess?: ApiSuccessHandler<RESPONSE, RETURN>,
  onError?: ApiErrorHandler
) =>
  apiRequest<undefined, RESPONSE, RETURN>(
    "DELETE",
    url,
    undefined,
    onSuccess,
    onError
  )
