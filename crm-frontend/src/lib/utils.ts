import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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