import Link from "next/link";
export default function LibraryPage() {
  return <main style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",color:"#eef3fb"}}><Link href="/" style={{color:"#91a0b7",fontSize:13}}>← Back to overview</Link><h1 style={{fontSize:32,marginTop:34}}>Paper library</h1><p style={{color:"#91a0b7",lineHeight:1.7}}>A private library for research papers, extracted text, source metadata and verified passage references. File upload and indexing will be enabled after private object storage is configured.</p><div style={{marginTop:24,padding:24,border:"1px solid #253249",borderRadius:14,background:"#101827"}}><strong>Library is ready for integration</strong><p style={{color:"#91a0b7",fontSize:13}}>No papers have been uploaded or indexed yet.</p></div></main>;
}
