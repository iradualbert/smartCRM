import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

export const getTemplates = (setTemplates) => {
  axios.get('/templates/')
  .then(res => {
    setTemplates(res.data)
  })
  .catch(err => console.error(err))
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