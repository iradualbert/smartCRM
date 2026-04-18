import axios from "axios"

type ErrorValue =
  | string
  | string[]
  | Record<string, unknown>
  | Array<string | Record<string, unknown>>

function flattenErrorValue(value: ErrorValue, prefix?: string): string[] {
  if (typeof value === "string") {
    return [prefix ? `${prefix}: ${value}` : value]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") {
        return [prefix ? `${prefix}: ${item}` : item]
      }

      if (item && typeof item === "object") {
        return Object.entries(item).flatMap(([key, nested]) =>
          flattenErrorValue(nested as ErrorValue, key)
        )
      }

      return []
    })
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) =>
      flattenErrorValue(nested as ErrorValue, prefix ? `${prefix}.${key}` : key)
    )
  }

  return []
}

export function getApiErrorMessages(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (typeof data === "string") {
      return [data]
    }

    if (data && typeof data === "object") {
      const messages = flattenErrorValue(data as ErrorValue)
      if (messages.length) return messages
    }

    if (error.message) {
      return [error.message]
    }
  }

  if (error instanceof Error) {
    return [error.message]
  }

  return ["Something went wrong."]
}

export function getApiErrorMessage(error: unknown): string {
  return getApiErrorMessages(error).join(" ")
}