import axios from "axios";
import dompurify from "dompurify"
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TemplateParameter } from "./types";

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback
  }

  const data = error.response?.data
  if (!data) return fallback

  if (typeof data.detail === "string") return data.detail

  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return data.non_field_errors.join(" ")
  }

  if (typeof data === "object") {
    const messages: string[] = []
    for (const [key, val] of Object.entries(data)) {
      if (key === "non_field_errors") continue
      if (Array.isArray(val)) messages.push(`${key}: ${val.join(", ")}`)
      else if (typeof val === "string") messages.push(`${key}: ${val}`)
    }
    if (messages.length > 0) return messages.join(" • ")
  }

  return fallback
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SaveMailTemplateParams = {
  data: object,
  onSuccess?: Function,
  onError?: Function,

}

export const saveMailTemplate = async ({ data, onSuccess, onError }: SaveMailTemplateParams) => {
  try {
    const res = await axios.post('/templates/', data)
    if (typeof onSuccess === "function") onSuccess(res);
  } catch (err) {
    if (typeof onError === "function") onError(err);
  }
}

export const getTemplates = async () => {
  const res = await axios.get('/templates/')
  return res.data
}

export function extractParameters(message) {
  const regex = /{{\s*([^}\s]+)\s*}}/g;
  const matches = [];

  let match;
  while ((match = regex.exec(message)) !== null) {

    matches.push(match[1]);

  }

  return matches;
}

export const getUpdatedParams = (content: string, currentParameters: TemplateParameter[]) => {
  const extracted = extractParameters(content);
  const newParams = extracted.filter(paramName => !currentParameters.some(p => p.name === paramName));
  const params = currentParameters.filter(param => extracted.some(paramName => param.name === paramName));
  newParams.forEach((paramName) => {
    params.push({
          name: paramName,
          defaultValue: ""
      })
  })
  return {
    params,
    newParams,
  }
}

export function generateMessage(template, parameters) {
  let message = template;

  Object.keys(parameters).forEach((param) => {
    const regex = new RegExp(`{{\\s*${param}\\s*}}`, 'g');
    message = message.replace(regex, parameters[param]);
  });

  return message;
}


export function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const parseTime = (s) => {
  const date = new Date(s);
  const today = new Date();

  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    // If the date is today, return only the time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    // If the date is not today, return the date without seconds
    return date.toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
};

export const sanitizer = (raw: string) => {
  return {
      __html: dompurify.sanitize(raw)
  }

}