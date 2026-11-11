"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Search } from "lucide-react";

type Paper = {
  doi: string | null;
  title: string;
  authors: string[];
  year: number | null;
  journal: string | null;
  publisher: string | null;
  type: string | null;
  url: string | null;
};

export default function LiteratureSearchPage() {
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const response = await fetch(`/api/sources/search?q=${encodeURIComponent(query)}&limit=12`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setPapers(data.results ?? []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return <main style={{maxWidth:1000,margin:"0 auto",padding:"42px 24px",color:"#eef3fb"}}>
    <Link href="/research" style={{color:"#91a0b7",fontSize:13}}><ArrowLeft size={14} style={{display:"inline",verticalAlign:"middle"}}/> Research workspace</Link>
    <div style={{marginTop:30,color:"#7ce0c3",fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Literature discovery · Crossref</div>
    <h1 style={{fontSize:32,margin:"10px 0"}}>Search scholarly publications</h1>
    <p style={{color:"#91a0b7",lineHeight:1.7,maxWidth:700}}>Search publication metadata from Crossref. This first connector discovers papers and DOI links; full-text access depends on publisher and open-access availability.</p>
    <form onSubmit={search} style={{display:"flex",gap:10,marginTop:24}}>
      <input value={query} onChange={(e)=>setQuery(e.target.value)} minLength={3} maxLength={240} required placeholder="Search a topic, title, author or DOI" style={{flex:1,minWidth:0,padding:"13px 14px",borderRadius:10,border:"1px solid #344662",background:"#101827",color:"#eef3fb"}}/>
      <button disabled={loading} className="btn primary" type="submit"><Search size={15}/>{loading?"Searching":"Search papers"}</button>
    </form>
    {error && <p role="alert" style={{color:"#ffadad",fontSize:13,marginTop:15}}>{error}</p>}
    {searched && <div style={{marginTop:24,color:"#91a0b7",fontSize:12}}>{papers.length} results returned by Crossref</div>}
    <div style={{display:"grid",gap:12,marginTop:14}}>
      {papers.map((paper,index)=><article key={paper.doi ?? index} style={{padding:18,border:"1px solid #253249",borderRadius:13,background:"#101827"}}>
        <h2 style={{fontSize:15,lineHeight:1.5,margin:"0 0 8px"}}>{paper.title}</h2>
        <p style={{fontSize:11,color:"#aab7ca",lineHeight:1.6,margin:"0 0 8px"}}>{paper.authors.slice(0,5).join(", ")}{paper.authors.length>5?" et al.":""}</p>
        <div style={{fontSize:11,color:"#91a0b7"}}>{[paper.journal,paper.publisher,paper.year].filter(Boolean).join(" · ")}</div>
        {paper.url && <a href={paper.url} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,color:"#91b4ff",fontSize:11,marginTop:12}}>Open publication <ExternalLink size={12}/></a>}
      </article>)}
    </div>
    {searched && papers.length===0 && <p style={{color:"#91a0b7",fontSize:13}}>No publication metadata matched this query.</p>}
    <p style={{fontSize:10,color:"#66758c",marginTop:25}}>Metadata supplied by Crossref. Search results are not a substitute for reading and verifying the underlying publication.</p>
  </main>;
}
