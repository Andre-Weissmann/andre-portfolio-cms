/**
 * GitHub Content Layer
 * Public reads: GitHub raw content URLs (no auth needed, instant)
 * Admin writes: GitHub API with GITHUB_TOKEN (PAT)
 */
import { Octokit } from "@octokit/rest";

const OWNER = "Andre-Weissmann";
const REPO = "andre-portfolio-content";
const BRANCH = "main";
const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

function getOctokit() {
  // In production (published), token is injected as CUSTOM_CRED_API_GITHUB_COM_TOKEN
  // In dev, falls back to GITHUB_TOKEN in .env
  const token = process.env.CUSTOM_CRED_API_GITHUB_COM_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GitHub token not set");
  return new Octokit({ auth: token });
}

async function getFileSha(octokit: Octokit, path: string): Promise<string | undefined> {
  try {
    const res = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path, ref: BRANCH });
    return (res.data as any).sha;
  } catch {
    return undefined;
  }
}

// ─── Public reads (no token needed) ─────────────────────────────────────────
async function readJsonPublic<T>(path: string): Promise<T> {
  const url = `${RAW_BASE}/${path}?t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GitHub raw fetch failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Authenticated writes ─────────────────────────────────────────────────────
async function writeJsonFile(path: string, value: unknown, message: string): Promise<void> {
  const octokit = getOctokit();
  const sha = await getFileSha(octokit, path);
  const content = Buffer.from(JSON.stringify(value, null, 2)).toString("base64");
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path, message, content, sha, branch: BRANCH,
  });
}

// ─── Image upload ─────────────────────────────────────────────────────────────
export async function uploadImage(filename: string, buffer: Buffer): Promise<string> {
  const octokit = getOctokit();
  const path = `images/${filename}`;
  const sha = await getFileSha(octokit, path);
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path,
    message: `Upload image: ${filename}`,
    content: buffer.toString("base64"),
    sha, branch: BRANCH,
  });
  return `${RAW_BASE}/${path}`;
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export interface Project {
  id: number; title: string; tool: string; tool_color: string;
  description: string; insights: string; dataset_info: string;
  methodology: string; image_url: string; sort_order: number; is_featured: boolean;
  status: "published" | "draft";
}

export async function getProjects(): Promise<Project[]> {
  return readJsonPublic<Project[]>("projects.json");
}

export async function saveProjects(projects: Project[]): Promise<void> {
  await writeJsonFile("projects.json", projects, "Update projects");
}

export async function createProject(data: Omit<Project, "id">): Promise<Project> {
  const projects = await getProjects();
  const id = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
  const project = { ...data, id };
  projects.push(project);
  projects.sort((a, b) => a.sort_order - b.sort_order);
  await saveProjects(projects);
  return project;
}

export async function updateProject(id: number, data: Partial<Project>): Promise<Project> {
  const projects = await getProjects();
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) throw new Error("Project not found");
  projects[idx] = { ...projects[idx], ...data };
  await saveProjects(projects);
  return projects[idx];
}

export async function deleteProject(id: number): Promise<void> {
  const projects = await getProjects();
  await saveProjects(projects.filter(p => p.id !== id));
}

// ─── About ────────────────────────────────────────────────────────────────────
export interface About {
  bio_headline: string; bio_body: string; location: string; open_to_work: boolean;
  linkedin_url: string; github_url: string; avatar_url: string; resume_url: string;
  banner_url: string;
}

export async function getAbout(): Promise<About> {
  return readJsonPublic<About>("about.json");
}

export async function saveAbout(about: About): Promise<void> {
  await writeJsonFile("about.json", about, "Update about");
}
