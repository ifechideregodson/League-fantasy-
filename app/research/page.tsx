import Link from "next/link";
import { ArrowLeft, FlaskConical, Search, FileText, Workflow } from "lucide-react";

export default function ResearchPage() {
  return <main style={{maxWidth:900,margin:"0 auto",padding:"48px 24px"}}>
    <Link href="/" style={{color:"#91a0b7",fontSize:13}}><ArrowLeft size={14} style={{display:"inline",verticalAlign:"middle"}}/> Back to overview</Link>
    <div style={{marginTop:34,color:"#7ce0c3",fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Research workspace</div>
    <h1 style={{fontSize:32,margin:"10px 0"}}>Start with a research question</h1>
    <p style={{color:"#91a0b7",lineHeight:1.7,maxWidth:680}}>This workspace will coordinate literature search, paper retrieval, evidence extraction and report drafting. Project persistence and agent execution are the next integration steps.</p>
    <Link href="/research/search" style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:18,padding:"10px 13px",borderRadius:9,background:"#17243a",border:"1px solid #344662",color:"#dce8ff",fontSize:12}}>Search academic publications <Search size={14}/></Link>\n    <section style={{marginTop:28,padding:22,border:"1px solid #253249",borderRadius:16,background:"#101827"}}>
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}><FlaskConical color="#83a9ff"/><strong>New research project</strong></div>
      <label htmlFor="question" style={{display:"block",fontSize:12,color:"#aab7ca",marginBottom:8}}>Research question</label>
      <textarea id="question" placeholder="e.g. What evidence supports..." rows={5} style={{width:"100%",resize:"vertical",padding:14,borderRadius:10,border:"1px solid #344662",background:"#0b1220",color:"#eef3fb"}} />
      <p style={{fontSize:11,color:"#91a0b7",lineHeight:1.6}}>Project submission will be enabled after authentication, database persistence and the research worker are connected. No placeholder action will pretend to launch a real research job.</p>
    </section>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginTop:18}}>
      {[["Academic search",Search],["Paper analysis",FileText],["Agent workflow",Workflow]].map(([name,Icon]) => { const I = Icon as typeof Search; return <div key={name as string} style={{padding:16,border:"1px solid #253249",borderRadius:12,color:"#cbd7e8",fontSize:12}}><I size={17} style={{marginBottom:9,color:"#83a9ff"}}/><div>{name as string}</div><div style={{color:"#91a0b7",marginTop:5}}>Integration pending</div></div>; })}
    </div>
  </main>;
}
