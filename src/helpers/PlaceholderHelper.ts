import { format } from "date-fns";
import { DateHelper } from "./DateHelper";
import { SlugHelper } from "./SlugHelper";

/**
 * Replace the known placeholders
 * @param value 
 * @param title 
 * @returns 
 */
export const processKnownPlaceholders = (value: string, title: string, dateFormat: string) => {
  if (value && typeof value === "string") {
    if (value.includes("{{title}}")) {
      const regex = new RegExp("{{title}}", "g");
      value = value.replace(regex, title);
    }
    
    if (value.includes("{{slug}}")) {
      const regex = new RegExp("{{slug}}", "g");
      value = value.replace(regex, SlugHelper.createSlug(title) || "");
    }

    if (value.includes("{{now}}")) {
      const regex = new RegExp("{{now}}", "g");

      if (dateFormat && typeof dateFormat === "string") {
        value = value.replace(regex, format(new Date(), DateHelper.formatUpdate(dateFormat) as string));
      } else {
        return (new Date()).toISOString();
      }
    }

    if (value.includes("{{year}}")) {
      const regex = new RegExp("{{year}}", "g");
      value = value.replace(regex, format(new Date(), "yyyy"));
    }

    if (value.includes("{{month}}")) {
      const regex = new RegExp("{{month}}", "g");
      value = value.replace(regex, format(new Date(), "MM"));
    }

    if (value.includes("{{day}}")) {
      const regex = new RegExp("{{day}}", "g");
      value = value.replace(regex, format(new Date(), "dd"));
    }
  }

  return value;
}