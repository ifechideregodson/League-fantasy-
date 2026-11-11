"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, LoaderCircle, Search, FileUp } from "lucide-react";

type Output = { report?: string; sources?: unknown[]; report_files?: {file:string;content:string}[]; answer?: string; error?: string; detail?: string; note?: string };
export default function ResearchEnginesPage() {
  const [query,setQuery]=useState("");
  const [engine,setEngine]=useState("gpt-researcher");
  const [output,setOutput]=useState<Output|null>(null);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [question,setQuestion]=useState("");
  const [pdf,setPdf]=useState<File|null>(null);
  const [pdfOutput,setPdfOutput]=useState<Output|null>(null);
  const [pdfBusy,setPdfBusy]=useState(false);
  const [pdfError,setPdfError]=useState("");

  async function runAgent(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setError("");setOutput(null);
    try {
      const response=await fetch(`/api/research/agents/${engine}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})});
      const data=await response.json();if(!response.ok)throw new Error(data.detail||data.error||"Research engine failed.");setOutput(data);
    } catch(err) {setError(err instanceof Error?err.message:"Research engine failed.");}
    finally {setBusy(false);}
  }
  async function askPdf(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();if(!pdf)return;setPdfBusy(true);setPdfError("");setPdfOutput(null);
    try {
      const form=new FormData();form.set("file",pdf);form.set("question",question);
      const response=await fetch("/api/research/papers",{method:"POST",body:form});const data=await response.json();
      if(!response.ok)throw new Error(data.detail||data.error||"PaperQA2 analysis failed.");setPdfOutput(data);
    } catch(err) {setPdfError(err instanceof Error?err.message:"PaperQA2 analysis failed.");}
    finally {setPdfBusy(false);}
  }
  const panel:React.CSSProperties={marginTop:20,padding:20,border:"1px solid #253249",borderRadius:15,background:"#101827"};
  const field:React.CSSProperties={width:"100%",padding:13,borderRadius:9,border:"1px solid #344662",background:"#0b1220",color:"#eef3fb"};
  const button:React.CSSProperties={marginTop:12,padding:"11px 15px",border:0,borderRadius:9,background:"#2563eb",color:"white",fontWeight:600,display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer"};
  return <main style={{maxWidth:1000,margin:"0 auto",padding:"40px 22px",color:"#eef3fb"}}>
    <Link href="/research" style={{color:"#91a0b7",fontSize:13}}><ArrowLeft size={14} style={{display:"inline",verticalAlign:"middle"}}/> Literature research</Link>
    <div style={{marginTop:28,color:"#7ce0c3",fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Research engines</div>
    <h1 style={{fontSize:32,margin:"10px 0"}}>Autonomous research & PDF analysis</h1>
    <p style={{color:"#91a0b7",lineHeight:1.7}}>Run the installed research engines against live sources, or ask PaperQA2 a question about a scientific PDF you upload.</p>
    <section style={panel}>
      <h2 style={{fontSize:19}}>Autonomous web research</h2>
      <form onSubmit={runAgent}>
        <label htmlFor="engine" style={{display:"block",fontSize:12,color:"#aab7ca",margin:"14px 0 7px"}}>Research engine</label>
        <select id="engine" value={engine} onChange={e=>setEngine(e.target.value)} style={field}><option value="gpt-researcher">GPT Researcher — autonomous source research</option><option value="stanford-storm">Stanford STORM — multi-perspective research</option></select>
        <label htmlFor="query" style={{display:"block",fontSize:12,color:"#aab7ca",margin:"14px 0 7px"}}>Research topic</label>
        <textarea id="query" required minLength={10} maxLength={1000} rows={4} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Enter a research question or topic..." style={{...field,resize:"vertical"}}/>
        <button type="submit" disabled={busy} style={button}>{busy?<LoaderCircle size={15}/>:<Search size={15}/ >}{busy?"Research engine running...":"Start research"}</button>
      </form>
      {error&&<p role="alert" style={{color:"#ffb7b7",fontSize:13}}>{error}</p>}
      {output&&<article style={{marginTop:18,padding:15,border:"1px solid #344662",borderRadius:10,whiteSpace:"pre-wrap",lineHeight:1.75,fontSize:13}}>{output.report||output.report_files?.map(x=>x.content).join("\n\n")||JSON.stringify(output,null,2)}</article>}
    </section>
    <section style={panel}>
      <h2 style={{fontSize:19}}>PaperQA2 scientific PDF analysis</h2>
      <p style={{fontSize:12,color:"#91a0b7",lineHeight:1.6}}>Upload one PDF (maximum 20 MB). The service extracts and analyzes its full text. The current deployment processes it temporarily and does not yet retain the document.</p>
      <form onSubmit={askPdf}>
        <label htmlFor="paper" style={{display:"block",fontSize:12,color:"#aab7ca",margin:"14px 0 7px"}}>Scientific PDF</label>
        <input id="paper" type="file" accept="application/pdf,.pdf" required onChange={e=>setPdf(e.target.files?.[0]||null)} style={{...field,padding:10}}/>
        <label htmlFor="paper-question" style={{display:"block",fontSize:12,color:"#aab7ca",margin:"14px 0 7px"}}>Question about this paper</label>
        <textarea id="paper-question" required minLength={5} maxLength={2000} rows={3} value={question} onChange={e=>setQuestion(e.target.value)} placeholder="What evidence does this paper provide for..." style={{...field,resize:"vertical"}}/>
        <button type="submit" disabled={pdfBusy||!pdf} style={button}>{pdfBusy?<LoaderCircle size={15}/>:<FileUp size={15}/ >}{pdfBusy?"Analyzing PDF...":"Analyze PDF with PaperQA2"}</button>
      </form>
      {pdfError&&<p role="alert" style={{color:"#ffb7b7",fontSize:13}}>{pdfError}</p>}
      {pdfOutput&&<article style={{marginTop:18,padding:15,border:"1px solid #344662",borderRadius:10,whiteSpace:"pre-wrap",lineHeight:1.75,fontSize:13}}>{pdfOutput.answer||JSON.stringify(pdfOutput,null,2)}{pdfOutput.note&&<p style={{color:"#e8bd81",fontSize:11}}>{pdfOutput.note}</p>}</article>}
    </section>
    <p style={{fontSize:10,color:"#66758c",marginTop:24}}>Research outputs require human verification. These engines do not provide clinical diagnosis. Reports and citations must be checked against original sources.</p>
  </main>;
}
