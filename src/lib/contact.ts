import { z } from "zod";

/** Verified public institute contact channels (supplied by the Institute). */
export const INSTITUTE_CONTACT = {
  email: "viendoanhtri.iem@gmail.com",
  fanpageUrl: "https://www.facebook.com/p/Vi%E1%BB%87n-Doanh-Tr%C3%AD-IEM-100061851555009/",
} as const;

export const CONTACT_DEPARTMENTS = ["training", "consulting", "community", "partnership"] as const;
export const contactMessageSchema = z.object({
  full_name: z.string().trim().min(1).max(100),
  organization: z.string().trim().max(150).optional(),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
  department: z.enum(CONTACT_DEPARTMENTS),
  interest: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1).max(1900),
});