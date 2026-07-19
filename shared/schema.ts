import { z } from "zod";

// ─── Projects ───────────────────────────────────────────────────────────────

export const insertProjectSchema = z.object({
  title: z.string().min(1),
  tool: z.string().min(1),          // "Excel" | "Python" | "Power BI" | "Tableau" | "SQL"
  tool_color: z.string().default("#22c55e"),
  description: z.string().min(1),
  insights: z.string().default(""),
  dataset_info: z.string().default(""),
  methodology: z.string().default(""),
  image_url: z.string().default(""),
  sort_order: z.number().default(0),
  is_featured: z.boolean().default(false),
  status: z.enum(["published", "draft"]).default("published"),
});

export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Project = InsertProject & {
  id: number;
  created_at: string;
  updated_at: string;
};

// ─── About ──────────────────────────────────────────────────────────────────

export const insertAboutSchema = z.object({
  bio_headline: z.string().default(""),
  bio_body: z.string().default(""),
  location: z.string().default(""),
  open_to_work: z.boolean().default(true),
  linkedin_url: z.string().default(""),
  github_url: z.string().default(""),
  avatar_url: z.string().default(""),
  resume_url: z.string().default(""),
});

export type InsertAbout = z.infer<typeof insertAboutSchema>;
export type About = InsertAbout & { id: number; updated_at: string };

// ─── Admin session (server-side only) ───────────────────────────────────────
export const loginSchema = z.object({
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;
