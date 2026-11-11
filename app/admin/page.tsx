import Link from "next/link";
export default function AdminPage() {
  return <main style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",color:"#eef3fb"}}><Link href="/" style={{color:"#91a0b7",fontSize:13}}>← Back to overview</Link><h1 style={{fontSize:32,marginTop:34}}>Platform administration</h1><p style={{color:"#91a0b7",lineHeight:1.7}}>Administration controls will be protected by owner/admin authentication. Do not deploy privileged actions until authentication and authorization middleware are implemented.</p><div style={{marginTop:24,padding:24,border:"1px solid #253249",borderRadius:14,background:"#101827"}}><strong>Secure administration pending</strong><p style={{color:"#91a0b7",fontSize:13}}>No admin actions are exposed in this initial UI.</p></div></main>;
}
