// Supabase-backed storage — SQLite is not used in this project
import supabase from "./supabase";
import type { Project, InsertProject, About, InsertAbout } from "@shared/schema";

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Project[];
}

export async function getProject(id: number): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Project;
}

export async function createProject(p: InsertProject): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert(p)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: number, p: Partial<InsertProject>): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update({ ...p, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: number): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── About ───────────────────────────────────────────────────────────────────

export async function getAbout(): Promise<About | null> {
  const { data, error } = await supabase
    .from("about")
    .select("*")
    .limit(1)
    .single();
  if (error) return null;
  return data as About;
}

export async function upsertAbout(a: InsertAbout): Promise<About> {
  const existing = await getAbout();
  if (existing) {
    const { data, error } = await supabase
      .from("about")
      .update({ ...a, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as About;
  } else {
    const { data, error } = await supabase
      .from("about")
      .insert(a)
      .select()
      .single();
    if (error) throw error;
    return data as About;
  }
}
