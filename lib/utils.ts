import { format } from "date-fns"

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}

export const formatDate = (date: Date | undefined): string => {
  if (!date) return "N/A"
  return format(date, "MMM dd, yyyy")
}

