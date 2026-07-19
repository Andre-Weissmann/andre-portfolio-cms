import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { isAdmin, adminHeaders, clearAdminToken } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Pencil, Trash2, Plus, Upload, X, Save, LogOut,
  ExternalLink, ChevronDown, ChevronUp, Eye, EyeOff, Radio,
  BarChart2, User, FolderOpen, Star, TrendingUp
} from "lucide-react";

const TOOL_OPTIONS = [
  { label: "SQL",      color: "#3b82f6" },
  { label: "Python",   color: "#f59e0b" },
  { label: "Power BI", color: "#eab308" },
  { label: "Tableau",  color: "#0ea5e9" },
  { label: "Excel",    color: "#22c55e" },
  { label: "R",        color: "#8b5cf6" },
];

interface Project {
  id: number; title: string; tool: string; tool_color: string;
  description: string; insights: string; dataset_info: string;
  methodology: string; image_url: string; sort_order: number;
  is_featured: boolean; status: "published" | "draft";
}
interface About {
  bio_headline: string; bio_body: string; location: string; open_to_work: boolean;
  linkedin_url: string; github_url: string; avatar_url: string; resume_url: string;
  banner_url: string;
}

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "/" + "__PORT_5000__";

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_BASE}/api/admin/upload`, {
    method: "POST", headers: adminHeaders(), body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.url;
}

const emptyProject: Omit<Project, "id"> = {
  title: "", tool: "SQL", tool_color: "#3b82f6", description: "",
  insights: "", dataset_info: "", methodology: "", image_url: "",
  sort_order: 99, is_featured: false, status: "published",
};

// ── Status badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "published" | "draft" }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-400 font-medium border border-gray-600/40">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
      Draft
    </span>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function PublishToggle({
  status, loading, onToggle,
}: { status: "published" | "draft"; loading: boolean; onToggle: () => void }) {
  const on = status === "published";
  return (
    <button
      data-testid="button-toggle-status"
      onClick={onToggle}
      disabled={loading}
      title={on ? "Click to unpublish (make draft)" : "Click to publish live"}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
        on ? "bg-emerald-500" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [tab, setTab] = useState<"projects" | "about" | "analytics">("projects");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState(false);
  const [form, setForm] = useState<Omit<Project, "id">>(emptyProject);
  const [aboutForm, setAboutForm] = useState<About | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => { if (!isAdmin()) setLocation("/admin-login"); }, []);

  // Admin fetches ALL projects including drafts
  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
    queryFn: () =>
      fetch(`${API_BASE}/api/admin/projects`, { headers: adminHeaders() }).then(r => r.json()),
    enabled: isAdmin(),
  });

  const { data: about, isLoading: loadingAbout } = useQuery<About>({
    queryKey: ["/api/about"],
    enabled: isAdmin(),
  });

  const { data: viewsData } = useQuery<{ views: number }>({
    queryKey: ["/api/views"],
    enabled: isAdmin(),
    refetchInterval: 30000,
  });

  useEffect(() => { if (about && !aboutForm) setAboutForm(about); }, [about]);

  const publishedCount = projects.filter(p => (p.status ?? "published") === "published").length;
  const draftCount = projects.filter(p => (p.status ?? "published") === "draft").length;
  const featuredCount = projects.filter(p => p.is_featured).length;

  const filteredProjects = projects.filter(p => {
    const s = p.status ?? "published";
    if (filter === "published") return s === "published";
    if (filter === "draft") return s === "draft";
    return true;
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: Omit<Project, "id">) =>
      apiRequest("POST", "/api/admin/projects", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      setNewProject(false); setForm(emptyProject);
      toast({ title: "Project added!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) =>
      apiRequest("PATCH", `/api/admin/projects/${id}`, data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      setEditingProject(null);
      toast({ title: "Project saved!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("PATCH", `/api/admin/projects/${id}/toggle`, {}).then(r => r.json()),
    onSuccess: (updated: Project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      setTogglingId(null);
      toast({
        title: updated.status === "published" ? "Now Live" : "Moved to Draft",
        description: updated.status === "published"
          ? `"${updated.title}" is now visible to visitors.`
          : `"${updated.title}" is hidden from visitors.`,
      });
    },
    onError: (e: any) => { setTogglingId(null); toast({ title: "Error", description: e.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "Project deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const aboutMutation = useMutation({
    mutationFn: (data: About) => apiRequest("PUT", "/api/admin/about", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      toast({ title: "About section saved!" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, target: "form" | "about") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (target === "form") setForm(f => ({ ...f, image_url: url }));
      else if (target === "about" && aboutForm) setAboutForm({ ...aboutForm, avatar_url: url });
      toast({ title: "Image uploaded!" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setUploading(false); }
  }

  function openEdit(p: Project) {
    setEditingProject(p);
    setForm({
      title: p.title, tool: p.tool, tool_color: p.tool_color, description: p.description,
      insights: p.insights, dataset_info: p.dataset_info, methodology: p.methodology,
      image_url: p.image_url, sort_order: p.sort_order, is_featured: p.is_featured,
      status: p.status ?? "published",
    });
    setNewProject(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleToolChange(toolLabel: string) {
    const opt = TOOL_OPTIONS.find(t => t.label === toolLabel);
    setForm(f => ({ ...f, tool: toolLabel, tool_color: opt?.color || "#3b82f6" }));
  }

  function handleLogout() { clearAdminToken(); setLocation("/admin-login"); }

  const isEditMode = editingProject !== null || newProject;

  const TABS = [
    { id: "projects", label: `Projects`, icon: <FolderOpen size={14} /> },
    { id: "about",    label: "About Me", icon: <User size={14} /> },
    { id: "analytics",label: "Analytics", icon: <BarChart2 size={14} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 bg-gray-950/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", fontWeight: "700", color: "white", fontStyle: "italic", fontFamily: "Georgia, serif"
          }}>A</div>
          <div>
            <span className="font-semibold text-white text-sm">Portfolio Admin</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Radio size={10} className="animate-pulse" /> {publishedCount} live
              </span>
              {draftCount > 0 && (
                <span className="text-xs text-gray-500">{draftCount} draft{draftCount > 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            <ExternalLink size={14} /> View portfolio
          </a>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors">
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-900 rounded-xl p-1 w-fit overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {t.icon}
              {t.id === "projects" ? `Projects (${projects.length})` : t.label}
            </button>
          ))}
        </div>

        {/* ── PROJECTS TAB ── */}
        {tab === "projects" && (
          <div>
            {!isEditMode && (
              <>
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {(["all", "published", "draft"] as const).map(f => (
                      <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                          filter === f
                            ? f === "published" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : f === "draft" ? "bg-gray-700 text-gray-300 border border-gray-600"
                            : "bg-gray-800 text-white border border-gray-700"
                            : "text-gray-500 hover:text-gray-300"
                        }`}>
                        {f === "all" ? `All (${projects.length})` : f === "published" ? `Live (${publishedCount})` : `Drafts (${draftCount})`}
                      </button>
                    ))}
                  </div>
                  <button data-testid="button-add-project"
                    onClick={() => { setNewProject(true); setEditingProject(null); setForm(emptyProject); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                    <Plus size={16} /> Add Project
                  </button>
                </div>

                {draftCount > 0 && filter === "all" && (
                  <div className="flex items-center gap-2 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/10 rounded-xl px-4 py-2.5 mb-4">
                    <EyeOff size={13} />
                    {draftCount} project{draftCount > 1 ? "s are" : " is"} hidden from visitors — toggle the switch to publish.
                  </div>
                )}
              </>
            )}

            {/* Edit / New Form */}
            {isEditMode && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">{newProject ? "New Project" : `Editing: ${editingProject?.title}`}</h3>
                  <button onClick={() => { setEditingProject(null); setNewProject(false); }} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Project Title</label>
                    <input data-testid="input-project-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="e.g. Nashville Housing Data Cleaning" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Tool / Technology</label>
                    <select data-testid="select-tool" value={form.tool} onChange={e => handleToolChange(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm">
                      {TOOL_OPTIONS.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Description</label>
                    <textarea data-testid="textarea-description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                      placeholder="What does this project analyze and why does it matter?" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Key Insights</label>
                    <textarea data-testid="textarea-insights" value={form.insights} onChange={e => setForm(f => ({ ...f, insights: e.target.value }))} rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                      placeholder="What did you find? What story does the data tell?" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Dataset Info</label>
                    <textarea data-testid="textarea-dataset" value={form.dataset_info} onChange={e => setForm(f => ({ ...f, dataset_info: e.target.value }))} rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                      placeholder="Rows, columns, source, timeframe..." />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Methodology</label>
                    <textarea data-testid="textarea-methodology" value={form.methodology} onChange={e => setForm(f => ({ ...f, methodology: e.target.value }))} rows={2}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                      placeholder="Tools, techniques, approach..." />
                  </div>

                  {/* Image */}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">Project Image</label>
                    <div className="flex gap-3 items-start">
                      {form.image_url && (
                        <img src={form.image_url} alt="preview" className="w-24 h-16 object-cover rounded-lg border border-gray-700 flex-shrink-0" />
                      )}
                      <div className="flex-1 space-y-2">
                        <label className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 border-dashed rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-pointer transition-colors">
                          <Upload size={16} />
                          {uploading ? "Uploading..." : "Upload image"}
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "form")} disabled={uploading} />
                        </label>
                        <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs"
                          placeholder="Or paste an image URL" />
                      </div>
                    </div>
                  </div>

                  {/* Visibility */}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-2 font-medium">Visibility</label>
                    <div className="flex gap-3 flex-wrap">
                      {(["published", "draft"] as const).map(s => (
                        <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            form.status === s
                              ? s === "published"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                                : "bg-gray-700 text-gray-300 border-gray-600"
                              : "text-gray-500 border-gray-700 hover:border-gray-600"
                          }`}>
                          {s === "published" ? <Eye size={14} /> : <EyeOff size={14} />}
                          {s === "published" ? "Publish live" : "Save as draft"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 rounded" />
                    <label htmlFor="featured" className="text-sm text-gray-300 flex items-center gap-1.5">
                      <Star size={13} className="text-yellow-400" /> Mark as featured project
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 flex-wrap">
                  <button data-testid="button-save-project"
                    onClick={() => {
                      if (newProject) createMutation.mutate(form);
                      else if (editingProject) updateMutation.mutate({ id: editingProject.id, data: form });
                    }}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                    <Save size={16} />
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Project"}
                  </button>
                  <button onClick={() => { setEditingProject(null); setNewProject(false); }}
                    className="text-gray-400 hover:text-white px-4 py-2.5 text-sm transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Project list */}
            {loadingProjects ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-900 rounded-2xl animate-pulse" />)}</div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <EyeOff size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No {filter !== "all" ? filter : ""} projects yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.map((p: Project) => {
                  const status = p.status ?? "published";
                  const isDraft = status === "draft";
                  return (
                    <div key={p.id} data-testid={`card-project-${p.id}`}
                      className={`border rounded-2xl overflow-hidden transition-all ${
                        isDraft
                          ? "bg-gray-900/50 border-gray-800/60 opacity-75"
                          : "bg-gray-900 border-gray-800"
                      }`}>
                      <div className="flex items-center gap-3 md:gap-4 p-4">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.title} className={`w-14 md:w-16 h-10 md:h-11 object-cover rounded-lg flex-shrink-0 ${isDraft ? "grayscale" : ""}`} />
                          : <div className="w-14 md:w-16 h-10 md:h-11 bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-600 text-xs">No img</div>
                        }
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className={`font-medium text-sm truncate max-w-[160px] md:max-w-none ${isDraft ? "text-gray-400" : "text-white"}`}>{p.title}</span>
                            <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: p.tool_color }}>{p.tool}</span>
                            <StatusBadge status={status} />
                            {p.is_featured && <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1"><Star size={9} />Featured</span>}
                          </div>
                          <p className="text-gray-500 text-xs line-clamp-1 hidden sm:block">{p.description}</p>
                        </div>

                        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 ml-1">
                          <div className="flex flex-col items-center gap-1">
                            <PublishToggle
                              status={status}
                              loading={togglingId === p.id && toggleMutation.isPending}
                              onToggle={() => {
                                setTogglingId(p.id);
                                toggleMutation.mutate(p.id);
                              }}
                            />
                            <span className="text-[10px] text-gray-600">{status === "published" ? "live" : "draft"}</span>
                          </div>
                          <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="text-gray-500 hover:text-white transition-colors p-1">
                            {expandedId === p.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          <button data-testid={`button-edit-${p.id}`} onClick={() => openEdit(p)} className="text-gray-400 hover:text-blue-400 transition-colors p-1"><Pencil size={16} /></button>
                          <button data-testid={`button-delete-${p.id}`}
                            onClick={() => { if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate(p.id); }}
                            className="text-gray-400 hover:text-red-400 transition-colors p-1"><Trash2 size={16} /></button>
                        </div>
                      </div>

                      {expandedId === p.id && (
                        <div className="px-4 pb-4 border-t border-gray-800 pt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div><p className="text-xs text-gray-500 font-medium mb-1">Key Insights</p><p className="text-xs text-gray-300">{p.insights || "—"}</p></div>
                          <div><p className="text-xs text-gray-500 font-medium mb-1">Dataset</p><p className="text-xs text-gray-300">{p.dataset_info || "—"}</p></div>
                          <div><p className="text-xs text-gray-500 font-medium mb-1">Methodology</p><p className="text-xs text-gray-300">{p.methodology || "—"}</p></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {tab === "about" && aboutForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2"><User size={18} className="text-blue-400" /> About Me</h2>
            <div className="space-y-5">
              {/* Avatar */}
              <div>
                <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <img src={aboutForm.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-700" />
                  <label className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 border-dashed rounded-xl px-4 py-2 text-sm text-gray-400 cursor-pointer transition-colors">
                    <Upload size={16} />
                    {uploading ? "Uploading..." : "Change photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "about")} disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Headline</label>
                <input value={aboutForm.bio_headline} onChange={e => setAboutForm({ ...aboutForm, bio_headline: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="e.g. Healthcare Data Analyst" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Bio</label>
                <textarea value={aboutForm.bio_body} onChange={e => setAboutForm({ ...aboutForm, bio_body: e.target.value })} rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm resize-none"
                  placeholder="Tell your story..." />
              </div>

              {/* Grid fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Location</label>
                  <input value={aboutForm.location} onChange={e => setAboutForm({ ...aboutForm, location: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">LinkedIn URL</label>
                  <input value={aboutForm.linkedin_url} onChange={e => setAboutForm({ ...aboutForm, linkedin_url: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">GitHub URL</label>
                  <input value={aboutForm.github_url} onChange={e => setAboutForm({ ...aboutForm, github_url: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Resume URL</label>
                  <input value={aboutForm.resume_url} onChange={e => setAboutForm({ ...aboutForm, resume_url: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="Link to your PDF resume" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Profile Banner Image URL</label>
                  <input value={aboutForm.banner_url} onChange={e => setAboutForm({ ...aboutForm, banner_url: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="https://... image shown as a cover above your About section" />
                  {aboutForm.banner_url && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-gray-700" style={{height: '80px'}}>
                      <img src={aboutForm.banner_url} alt="Banner preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Open to work */}
              <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                <input type="checkbox" id="open_to_work" checked={aboutForm.open_to_work}
                  onChange={e => setAboutForm({ ...aboutForm, open_to_work: e.target.checked })} className="w-4 h-4 rounded accent-emerald-500" />
                <label htmlFor="open_to_work" className="text-sm text-gray-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Show "Open to Work" badge on portfolio
                </label>
              </div>

              <button data-testid="button-save-about"
                onClick={() => aboutMutation.mutate(aboutForm)}
                disabled={aboutMutation.isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Save size={16} /> {aboutMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
        {tab === "about" && loadingAbout && <div className="h-64 bg-gray-900 rounded-2xl animate-pulse" />}

        {/* ── ANALYTICS TAB ── */}
        {tab === "analytics" && (
          <div className="space-y-6">
            <h2 className="font-semibold text-lg flex items-center gap-2"><TrendingUp size={18} className="text-blue-400" /> Portfolio Analytics</h2>

            {/* Stat grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Profile Views" value={viewsData?.views ?? 0} icon={<Eye size={18} />} color="#3b82f6" />
              <StatCard label="Live Projects" value={publishedCount} icon={<Radio size={18} />} color="#10b981" />
              <StatCard label="Draft Projects" value={draftCount} icon={<EyeOff size={18} />} color="#6b7280" />
              <StatCard label="Featured" value={featuredCount} icon={<Star size={18} />} color="#f59e0b" />
            </div>

            {/* Projects breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-medium text-sm text-gray-300 mb-4">Projects Breakdown</h3>
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white flex-shrink-0" style={{ background: p.tool_color }}>{p.tool}</span>
                    <span className="text-sm text-gray-300 flex-1 truncate">{p.title}</span>
                    <StatusBadge status={p.status ?? "published"} />
                    {p.is_featured && <Star size={12} className="text-yellow-400 flex-shrink-0" />}
                  </div>
                ))}
                {projects.length === 0 && <p className="text-gray-600 text-sm">No projects yet.</p>}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-medium text-sm text-gray-300 mb-4">Tips to Stand Out</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Add a resume URL so recruiters can download your CV in one click</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Mark your strongest project as Featured — it stands out in the list</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Keep all 5 projects Live so visitors see your full range</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Fill in Key Insights for every project — that's what recruiters read first</li>
                <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Turn on "Open to Work" if you're actively looking</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
