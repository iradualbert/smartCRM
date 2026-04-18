import axios from "axios"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

type PrimitiveErrorValue = string | string[]
type NestedErrorValue =
  | PrimitiveErrorValue
  | Record<string, PrimitiveErrorValue | NestedErrorValue>
  | Array<string | Record<string, PrimitiveErrorValue | NestedErrorValue>>

function flattenErrorValue(
  value: NestedErrorValue,
  prefix?: string
): Array<{ path?: string; message: string }> {
  if (typeof value === "string") {
    return [{ path: prefix, message: value }]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === "string") {
        return [{ path: prefix, message: item }]
      }
      if (item && typeof item === "object") {
        return Object.entries(item).flatMap(([key, nested]) =>
          flattenErrorValue(nested as NestedErrorValue, prefix ? `${prefix}.${key}` : key)
        )
      }
      return []
    })
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) =>
      flattenErrorValue(nested as NestedErrorValue, prefix ? `${prefix}.${key}` : key)
    )
  }

  return []
}

export function getApiErrorMessages(error: unknown): string[] {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data

    if (typeof data === "string") return [data]

    if (data && typeof data === "object") {
      const flattened = flattenErrorValue(data as NestedErrorValue)
      if (flattened.length) {
        return flattened.map((item) =>
          item.path ? `${item.path}: ${item.message}` : item.message
        )
      }
    }

    if (error.message) return [error.message]
  }

  if (error instanceof Error) return [error.message]

  return ["Something went wrong."]
}

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>
) {
  if (!axios.isAxiosError(error)) return

  const data = error.response?.data
  if (!data || typeof data !== "object") return

  const flattened = flattenErrorValue(data as NestedErrorValue)

  for (const item of flattened) {
    if (!item.path) continue

    if (item.path === "non_field_errors" || item.path === "detail") {
      continue
    }

    setError(item.path as Path<TFieldValues>, {
      type: "server",
      message: item.message,
    })
  }
}