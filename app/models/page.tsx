import Link from "next/link";
export default function ModelsPage() {
  return <main style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",color:"#eef3fb"}}><Link href="/" style={{color:"#91a0b7",fontSize:13}}>← Back to overview</Link><h1 style={{fontSize:32,marginTop:34}}>Model registry</h1><p style={{color:"#91a0b7",lineHeight:1.7}}>Track model provider, version, licence, intended use, validation evidence and deployment status before activating a model.</p><div style={{marginTop:24,padding:24,border:"1px solid #253249",borderRadius:14,background:"#101827"}}><strong>No models registered</strong><p style={{color:"#91a0b7",fontSize:13}}>SciBERT, BioGPT and other candidate models will be evaluated and recorded here. No model is activated by default.</p></div></main>;
}
