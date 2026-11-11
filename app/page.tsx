import Link from "next/link";
import { Activity, ArrowUpRight, BookOpen, BrainCircuit, CheckCircle2, ClipboardList, FileSearch, FlaskConical, FolderOpen, Library, Microscope, ShieldCheck, Sparkles, Workflow } from "lucide-react";

const stats = [
  { label: "Research projects", value: "—", note: "Connect database to load live data" },
  { label: "Indexed papers", value: "—", note: "Academic search not connected yet" },
  { label: "Research jobs", value: "0", note: "No jobs submitted" },
  { label: "AI models", value: "0", note: "No models activated" }
];

const capabilities = [
  { icon: FileSearch, title: "Literature discovery", desc: "Search scholarly indexes and collect source metadata with traceable provenance." },
  { icon: BookOpen, title: "Scientific PDF workspace", desc: "Ingest papers, extract passages and ask questions grounded in the uploaded sources." },
  { icon: Workflow, title: "Autonomous research agents", desc: "Plan subtasks, gather evidence in parallel and synthesize structured research drafts." },
  { icon: BrainCircuit, title: "Model evaluation registry", desc: "Track model versions, licences, intended use, benchmarks and activation approvals." }
];

export default function Home() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">A</div><div><div className="brand-name">ASTER RESEARCH</div><div className="brand-sub">Intelligence workspace</div></div></div>
        <div>
          <div className="nav-label">Workspace</div>
          <nav className="nav">
            <Link className="active" href="/"><Activity size={16}/> Overview</Link>
            <Link href="/research"><FlaskConical size={16}/> Research projects</Link>
            <Link href="/library"><Library size={16}/> Paper library</Link>
            <Link href="/models"><BrainCircuit size={16}/> Model registry</Link>
          </nav>
        </div>
        <div>
          <div className="nav-label">Platform</div>
          <nav className="nav">
            <Link href="/medical"><Microscope size={16}/> Medical AI</Link>
            <Link href="/admin"><ShieldCheck size={16}/> Administration</Link>
          </nav>
        </div>
        <div className="sidebar-bottom"><div className="pill">FOUNDATION BUILD</div><p>Evidence-led research tools with clinical workflows kept behind separate safety and validation controls.</p></div>
      </aside>
      <main className="main">
        <header className="topbar"><div className="crumb">Workspace / Overview</div><div className="top-actions"><span>Platform status: foundation</span><div className="avatar">AR</div></div></header>
        <div className="content">
          <div className="hero-row">
            <div><div className="eyebrow">Unified research intelligence</div><h1>Good evening. Welcome back.</h1><p className="subtitle">One workspace for academic discovery, scientific document analysis and evidence-backed research workflows.</p></div>
            <Link className="btn primary" href="/research">Start a research project <ArrowUpRight size={15}/></Link>
          </div>
          <section className="stats">{stats.map((s) => <div className="stat" key={s.label}><div className="stat-label">{s.label}</div><div className="stat-value">{s.value}</div><div className="stat-note">{s.note}</div></div>)}</section>
          <div className="section-head"><h2>Research workspace</h2><span className="pill">Core modules planned</span></div>
          <div className="grid-2">
            <section className="panel">
              <div className="panel-title">Research capabilities</div><div className="panel-desc">A unified workflow assembled from specialized research components.</div>
              <div className="feature-list">{capabilities.map((item) => { const Icon = item.icon; return <div className="feature" key={item.title}><div className="feature-icon"><Icon size={17}/></div><div><strong>{item.title}</strong><span>{item.desc}</span></div></div>; })}</div>
            </section>
            <section className="panel">
              <div className="panel-title">Platform readiness</div><div className="panel-desc">Current integration status — no fake activity or fabricated research metrics.</div>
              <div className="activity">
                <div className="activity-item"><div><CheckCircle2 size={14} style={{display:"inline",marginRight:7,color:"#7ce0c3"}}/>Repository scaffold</div><span>Committed</span></div>
                <div className="activity-item"><div><FolderOpen size={14} style={{display:"inline",marginRight:7}}/>Web workspace</div><span>Foundation added</span></div>
                <div className="activity-item"><div><ClipboardList size={14} style={{display:"inline",marginRight:7}}/>Database schema</div><span>Defined</span></div>
                <div className="activity-item"><div><Sparkles size={14} style={{display:"inline",marginRight:7}}/>Research providers</div><span>Not connected</span></div>
                <div className="activity-item"><div><ShieldCheck size={14} style={{display:"inline",marginRight:7}}/>Clinical model gateway</div><span>Not activated</span></div>
              </div>
              <div className="callout"><strong>Clinical safety boundary</strong><br/>Medical model output will remain disabled until a validated model, documented intended use and clinician review workflow are configured.</div>
            </section>
          </div>
          <div className="footer-note">ASTER RESEARCH · Modular platform · Research sources and model provenance will be recorded as integrations are enabled.</div>
        </div>
      </main>
    </div>
  );
}
