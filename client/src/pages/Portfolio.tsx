import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Github, Linkedin, ExternalLink, ChevronDown, X } from "lucide-react";

interface Project {
  id: number; title: string; tool: string; tool_color: string;
  description: string; insights: string; dataset_info: string;
  methodology: string; image_url: string; sort_order: number; is_featured: boolean;
}
interface About {
  bio_headline: string; bio_body: string; location: string; open_to_work: boolean;
  linkedin_url: string; github_url: string; avatar_url: string; resume_url: string;
}

function ToolBadge({ tool, color }: { tool: string; color: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: color }}>
      {tool}
    </span>
  );
}

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [section, setSection] = useState("overview");
  const sections = ["overview", "insights", "dataset", "methodology"];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f1117] border border-gray-800 rounded-t-3xl md:rounded-3xl w-full md:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ToolBadge tool={project.tool} color={project.tool_color} />
              {project.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-teal-300 text-teal-950 font-semibold border border-teal-400">Featured</span>}
            </div>
            <h2 className="text-xl font-bold text-white">{project.title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 mt-1"><X size={20} /></button>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 pb-0">
          {sections.map(s => (
            <button key={s} onClick={() => setSection(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${section === s ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {project.image_url && section === "overview" && (
            <img src={project.image_url} alt={project.title} className="w-full rounded-xl object-cover max-h-64 border border-gray-800" />
          )}
          {section === "overview" && <p className="text-gray-300 text-sm leading-relaxed">{project.description}</p>}
          {section === "insights" && (
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{project.insights || "No insights added yet."}</p>
            </div>
          )}
          {section === "dataset" && (
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed">{project.dataset_info || "No dataset info added yet."}</p>
            </div>
          )}
          {section === "methodology" && (
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{project.methodology || "No methodology added yet."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div data-testid={`card-project-${project.id}`}
      className="group bg-[#0f1117] border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
      onClick={onClick}>
      {project.image_url ? (
        <div className="aspect-video overflow-hidden">
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="aspect-video bg-gray-900 flex items-center justify-center">
          <span className="text-gray-600 text-sm">No image</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <ToolBadge tool={project.tool} color={project.tool_color} />
          {project.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-teal-300 text-teal-950 font-semibold border border-teal-400 font-medium">Featured</span>}
        </div>
        <h3 className="text-white font-semibold text-base mb-2 leading-snug">{project.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
        <div className="mt-4 flex items-center gap-1 text-blue-400 text-xs font-medium group-hover:gap-2 transition-all">
          Deep dive <ExternalLink size={11} />
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({ queryKey: ["/api/projects"] });
  const { data: about, isLoading: loadingAbout } = useQuery<About>({ queryKey: ["/api/about"] });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const featured = projects.filter(p => p.is_featured);
  const rest = projects.filter(p => !p.is_featured);

  return (
    <div className="min-h-screen bg-[#080a0f] text-white">
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto">
          {loadingAbout ? (
            <div className="space-y-4 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-gray-800" />
              <div className="h-8 bg-gray-800 rounded w-2/3" />
              <div className="h-4 bg-gray-800 rounded w-1/2" />
            </div>
          ) : about && (
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative flex-shrink-0">
                <img src={about.avatar_url} alt="Andre Weissmann" className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-700 shadow-xl" />
                {about.open_to_work && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg">
                    Open to work
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {about.location && (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <MapPin size={13} /> {about.location}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 leading-tight">
                  Andre Weissmann
                </h1>
                <p className="text-blue-400 text-lg font-medium mb-4 italic" style={{ fontFamily: "Georgia, serif" }}>
                  {about.bio_headline}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-6 whitespace-pre-wrap">
                  {about.bio_body}
                </p>
                <div className="flex flex-wrap gap-3">
                  {about.linkedin_url && (
                    <a href={about.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#0077b5] hover:bg-[#006396] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      <Linkedin size={15} /> LinkedIn
                    </a>
                  )}
                  {about.github_url && (
                    <a href={about.github_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      <Github size={15} /> GitHub
                    </a>
                  )}
                  {about.resume_url && (
                    <a href={about.resume_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                      <ExternalLink size={15} /> Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-800/50 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-8 justify-start">
          {[
            { label: "Projects", value: projects.length.toString() },
            { label: "SQL rows cleaned", value: "56,477" },
            { label: "Survey participants", value: "630" },
            { label: "Tools mastered", value: "5+" },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5].map(i => <div key={i} className="aspect-square bg-gray-900 rounded-2xl animate-pulse" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg mb-2">No projects yet</p>
              <p className="text-sm"><a href="/#/admin/login" className="text-blue-400 hover:underline">Add your first project →</a></p>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Featured Work</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                    {featured.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />)}
                  </div>
                </>
              )}
              {rest.length > 0 && (
                <>
                  {featured.length > 0 && <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">More Projects</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {rest.map(p => <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 px-6 text-center">
        <p className="text-gray-600 text-sm">© 2026 Andre Weissmann · Healthcare Data Analytics</p>
      </footer>

      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}
