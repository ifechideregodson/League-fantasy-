"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState, type CSSProperties } from "react";
import { ArrowLeft, LoaderCircle, Search, FileUp, RefreshCw, CircleCheck, CircleAlert, CircleDashed } from "lucide-react";

type Output = { report?: string; sources?: unknown[]; report_files?: {file:string;content:string}[]; answer?: string; error?: string; detail?: string; note?: string };
type Integration = { id:string; name:string; kind:string; purpose:string; homepage:string; status:string; package_installed:boolean; credentials_configured:boolean };
type IntegrationResponse = { integrations:Integration[]; installed_and_configured_count:number; catalogue_count:number; note?:string };
const statusLabel:Record<string,string> = {
  installed_and_configured:"Installed & configured",
  installed_missing_credentials:"Credentials missing",
  credentials_set_package_missing:"Package missing",
  not_configured:"Not configured",
  catalogue_linked:"Catalogue link",
};

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
  const [integrationData,setIntegrationData]=useState<IntegrationResponse|null>(null);
  const [statusError,setStatusError]=useState("");
  const [statusBusy,setStatusBusy]=useState(true);

  const loadStatuses=useCallback(async () => {
    setStatusBusy(true);setStatusError("");
    try {
      const response=await fetch("/api/research/integrations",{cache:"no-store"});
      const data=await response.json();
      if(!response.ok) throw new Error(data.detail||data.error||"Could not load research engine statuses.");
      if(!Array.isArray(data.integrations)) throw new Error("The research API returned an unexpected status response.");
      setIntegrationData(data);
    } catch(err) {
      setStatusError(err instanceof Error?err.message:"Could not load research engine statuses.");
    } finally {setStatusBusy(false);}
  },[]);

  useEffect(()=>{void loadStatuses();},[loadStatuses]);

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
  const panel:CSSProperties={marginTop:20,padding:20,border:"1px solid #253249",borderRadius:15,background:"#101827"};
  const field:CSSProperties={width:"100%",padding:13,borderRadius:9,border:"1px solid #344662",background:"#0b1220",color:"#eef3fb"};
  const button:CSSProperties={marginTop:12,padding:"11px 15px",border:0,borderRadius:9,background:"#2563eb",color:"white",fontWeight:600,display:"inline-flex",alignItems:"center",gap:8,cursor:"pointer"};
  return <main style={{maxWidth:1000,margin:"0 auto",padding:"40px 22px",color:"#eef3fb"}}>
    <Link href="/research" style={{color:"#91a0b7",fontSize:13}}><ArrowLeft size={14} style={{display:"inline",verticalAlign:"middle"}}/> Literature research</Link>
    <div style={{marginTop:28,color:"#7ce0c3",fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Research engines</div>
    <h1 style={{fontSize:32,margin:"10px 0"}}>Autonomous research & PDF analysis</h1>
    <p style={{color:"#91a0b7",lineHeight:1.7}}>Run the installed research engines against live sources, or ask PaperQA2 a question about a scientific PDF you upload.</p>

    <section style={panel} aria-live="polite">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div><h2 style={{fontSize:19,margin:0}}>Integration status</h2><p style={{fontSize:12,color:"#91a0b7",margin:"6px 0 0"}}>Live configuration reported by the Render research API</p></div>
        <button type="button" onClick={()=>void loadStatuses()} disabled={statusBusy} style={{...button,marginTop:0,background:"#26364e"}}>{statusBusy?<LoaderCircle size={14}/>:<RefreshCw size={14}/>}Refresh status</button>
      </div>
      {statusBusy&&!integrationData&&<p style={{color:"#aab7ca",fontSize:13}}>Loading integration statuses…</p>}
      {statusError&&<p role="alert" style={{color:"#ffb7b7",fontSize:13,marginTop:14}}>Status unavailable: {statusError}</p>}
      {integrationData&&<>
        <div style={{display:"flex",gap:18,flexWrap:"wrap",margin:"16px 0",fontSize:12,color:"#aab7ca"}}>
          <span>Installed & configured: <strong style={{color:"#eef3fb"}}>{integrationData.installed_and_configured_count}</strong></span>
          <span>Discovery catalogues: <strong style={{color:"#eef3fb"}}>{integrationData.catalogue_count}</strong></span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
          {integrationData.integrations.map(item=><div key={item.id} style={{padding:13,border:"1px solid #344662",borderRadius:10,background:"#0b1220"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:650}}>
              {item.status==="installed_and_configured"?<CircleCheck size={15} color="#65d6a5"/>:item.status==="catalogue_linked"?<CircleDashed size={15} color="#9eb4d0"/>:<CircleAlert size={15} color="#e7b66e"/>}
              {item.name}
            </div>
            <div style={{fontSize:11,marginTop:8,color:item.status==="installed_and_configured"?"#75d9ad":item.status==="catalogue_linked"?"#9eb4d0":"#e7b66e"}}>{statusLabel[item.status]||item.status.replaceAll("_"," ")}</div>
            <p style={{fontSize:11,lineHeight:1.5,color:"#91a0b7",margin:"7px 0"}}>{item.purpose}</p>
            <div style={{fontSize:10,color:"#71819a"}}>Package: {item.package_installed?"present":"not detected"} · Credentials: {item.credentials_configured?"configured":"not configured"}</div>
            <a href={item.homepage} target="_blank" rel="noreferrer" style={{display:"inline-block",marginTop:8,fontSize:11,color:"#8db7ff"}}>Project information ↗</a>
          </div>)}
        </div>
        <p style={{fontSize:10,color:"#91a0b7",lineHeight:1.5,marginBottom:0}}>{integrationData.note||"Configuration status does not guarantee a successful live inference. Run a test request to verify each engine."}</p>
      </>}
    </section>

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
