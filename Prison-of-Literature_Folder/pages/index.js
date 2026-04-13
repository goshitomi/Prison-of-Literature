import { useState, useEffect, useCallback } from "react";
import Head from "next/head";

/* ── helpers ── */
function hash(s){let h=0;for(let i=0;i<(s||"").length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return Math.abs(h)}
function simStatus(id){const n=hash(id)%100;return n<55?"AVAILABLE":n<80?"CHECKED_OUT":"RESTRICTED"}
function simReturn(id){const d=new Date();d.setDate(d.getDate()+(hash(id)%21)+3);return d.toISOString().slice(0,10)}
function simVisitor(id){return`#${String(hash(id)%9999).padStart(4,"0")}`}
function simClass(id){const n=hash(id)%100;return n<10?"RESTRICTED":n<30?"SPECIAL COLLECTION":"GENERAL"}
function simCharges(c){return c==="RESTRICTED"?"접근 제한 자료 — 열람 허가 필요":c==="SPECIAL COLLECTION"?"특별 소장 자료 — 관내 열람만 가능":"일반 소장 자료"}
function yearFromId(id){const m=id.match(/\d{4}/);return m?m[0]:""}

const ST={
  AVAILABLE:{ko:"접견가능",en:"AVAILABLE",c:"#2B6E2B",bg:"#E8F5E9"},
  CHECKED_OUT:{ko:"접견중",en:"CHECKED OUT",c:"#C25700",bg:"#FFF3E0"},
  RESTRICTED:{ko:"접견불가",en:"RESTRICTED",c:"#C62828",bg:"#FFEBEE"},
};
const CC={RESTRICTED:"#C62828","SPECIAL COLLECTION":"#C25700",GENERAL:"#2B6E2B"};
const blue="#003B71";

function parse(item){
  const id=item.BIBLIO_ID||"";const st=simStatus(id);const cl=simClass(id);
  return{
    id,title:item.DCTERMS_title||item.RDFS_label||"제목 없음",
    label:item.RDFS_label||"",creator:item.DCTERMS_creator||"",
    isbn:item.BIBO_isbn||"",pubPlace:item.NLON_publicationPlace||"",
    callNo:item.NLON_itemNumberOfNLK||"",
    extent:Array.isArray(item.BIBFRAME_extent)?item.BIBFRAME_extent.join(", "):(item.BIBFRAME_extent||""),
    holding:item.NLON_localHolding||"",abstract:item.DCTERMS_abstract||"",
    genre:item.NLON_genre||"",desc:item.DCTERMS_description||"",
    alt:item.DCTERMS_alternative||"",format:item.DCTERMS_hasFormat||"",
    status:st,classification:cl,charges:simCharges(cl),
    returnDate:st==="CHECKED_OUT"?simReturn(id):"",
    visitor:st==="CHECKED_OUT"?simVisitor(id):"",
    year:yearFromId(id),
  };
}

export default function Home(){
  const[pg,setPg]=useState("home");
  const[books,setBooks]=useState([]);
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState(null);
  const[total,setTotal]=useState(0);
  const[pn,setPn]=useState(1);
  const rows=20;

  // search & filter
  const[q,setQ]=useState("");
  const[searchField,setSearchField]=useState("all"); // all, title, creator
  const[statusFilter,setStatusFilter]=useState("all"); // all, AVAILABLE, CHECKED_OUT, RESTRICTED
  const[sortBy,setSortBy]=useState("default"); // default, title, creator, year
  const[viewMode,setViewMode]=useState("list"); // list, card

  const[sel,setSel]=useState(null);
  const[vf,setVf]=useState({n:"",r:"",s:"",a:false});
  const[vs,setVs]=useState(false);

  const load=useCallback(async(p=1)=>{
    setLoading(true);setErr(null);
    try{
      const res=await fetch(`/api/books?pageNo=${p}&numOfRows=${rows}&koreanOnly=true`);
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const d=await res.json();
      if(d?.error)throw new Error(d.error);
      if(d?.header?.resultCode&&d.header.resultCode!=="00")throw new Error(d.header.resultMsg||"API 오류");
      const b=d?.body||d;
      setBooks((b?.items||[]).map(parse));
      setTotal(b?.totalCount||0);
      setPn(p);
    }catch(e){setErr(e.message);setBooks([]);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{load(1);},[load]);

  // client-side filter & sort
  let display=[...books];
  if(q.trim()){
    const s=q.toLowerCase();
    display=display.filter(b=>{
      if(searchField==="title")return(b.title+b.label).toLowerCase().includes(s);
      if(searchField==="creator")return b.creator.toLowerCase().includes(s);
      return(b.title+b.label+b.creator+b.isbn+b.callNo).toLowerCase().includes(s);
    });
  }
  if(statusFilter!=="all") display=display.filter(b=>b.status===statusFilter);
  if(sortBy==="title") display.sort((a,b)=>a.title.localeCompare(b.title,"ko"));
  else if(sortBy==="creator") display.sort((a,b)=>(a.creator||"").localeCompare(b.creator||"","ko"));
  else if(sortBy==="year") display.sort((a,b)=>(a.year||"").localeCompare(b.year||""));

  const tp=Math.ceil(total/rows);
  const open=(b)=>{setSel(b);setPg("detail");setVs(false);setVf({n:"",r:"",s:"",a:false});window.scrollTo(0,0);};
  const home=()=>{setPg("home");setQ("");window.scrollTo(0,0);};

  return(
    <>
      <Head>
        <title>INMATE LOCATOR — 서지교정국</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap" rel="stylesheet"/>
      </Head>
      <style jsx global>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;background:#F5F6F8;color:#222;-webkit-font-smoothing:antialiased}
        @keyframes spin{to{transform:rotate(360deg)}}
        button{cursor:pointer;font-family:inherit}
        input,select,textarea{font-family:inherit}
        a{color:${blue};text-decoration:none}
        tr:hover td{background:#F0F4FA!important}
        .card:hover{box-shadow:0 2px 8px rgba(0,59,113,.12);border-color:#B0C4DE}
      `}</style>

      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}>

        {/* HEADER */}
        <header style={{background:blue}}>
          <div style={{maxWidth:1120,margin:"0 auto",padding:"0 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap"}}>
            <div onClick={home} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",cursor:"pointer",userSelect:"none"}}>
              <svg viewBox="0 0 32 32" width="24" height="24" fill="none"><rect x="4" y="6" width="24" height="20" rx="2" stroke="#fff" strokeWidth="1.5"/><line x1="10" y1="6" x2="10" y2="26" stroke="#fff"/><line x1="14" y1="11" x2="24" y2="11" stroke="#fff" opacity=".4"/><line x1="14" y1="15" x2="22" y2="15" stroke="#fff" opacity=".4"/><line x1="14" y1="19" x2="20" y2="19" stroke="#fff" opacity=".4"/></svg>
              <div>
                <div style={{color:"#fff",fontSize:15,fontWeight:700,letterSpacing:3,fontFamily:"'Noto Serif KR',Georgia,serif"}}>INMATE LOCATOR</div>
                <div style={{color:"rgba(255,255,255,.4)",fontSize:9.5,letterSpacing:1}}>서지교정국 수감자 조회 시스템</div>
              </div>
            </div>
            <nav style={{display:"flex",gap:0}}>
              {[["home","홈"],["index","수감자 명부"]].map(([k,l])=>(
                <button key={k} onClick={()=>k==="home"?home():setPg(k)} style={{background:"none",border:"none",color:pg===k?"#fff":"rgba(255,255,255,.5)",padding:"14px 14px",fontSize:13,borderBottom:pg===k?"2px solid #fff":"2px solid transparent",fontWeight:pg===k?500:400}}>{l}</button>
              ))}
              {sel&&<button onClick={()=>{setPg("detail");window.scrollTo(0,0)}} style={{background:"none",border:"none",color:pg==="detail"?"#fff":"rgba(255,255,255,.5)",padding:"14px 14px",fontSize:13,borderBottom:pg==="detail"?"2px solid #fff":"2px solid transparent"}}>상세정보</button>}
              {sel&&<button onClick={()=>{setPg("visit");setVs(false);window.scrollTo(0,0)}} style={{background:"none",border:"none",color:pg==="visit"?"#fff":"rgba(255,255,255,.5)",padding:"14px 14px",fontSize:13,borderBottom:pg==="visit"?"2px solid #fff":"2px solid transparent"}}>접견신청</button>}
            </nav>
          </div>
        </header>

        <main style={{flex:1,maxWidth:1120,margin:"0 auto",width:"100%",padding:"20px 24px 48px"}}>

          {/* ══ HOME ══ */}
          {(pg==="home"||pg==="index")&&<>
            {/* Search bar */}
            <div style={{background:"#fff",border:"1px solid #E0E3E8",borderRadius:4,padding:"20px 24px",marginBottom:12}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <select value={searchField} onChange={e=>setSearchField(e.target.value)} style={{padding:"9px 12px",border:"1px solid #D0D4DA",borderRadius:3,fontSize:13,background:"#FAFBFC",color:"#444",minWidth:100}}>
                  <option value="all">전체</option>
                  <option value="title">수감자명</option>
                  <option value="creator">관련인(저자)</option>
                </select>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="검색어를 입력하세요" style={{flex:1,minWidth:200,padding:"9px 14px",border:"1px solid #D0D4DA",borderRadius:3,fontSize:14,outline:"none",background:"#FAFBFC"}}/>
                <button onClick={()=>{}} style={{padding:"9px 24px",background:blue,color:"#fff",border:"none",borderRadius:3,fontSize:14,fontWeight:500}}>검색</button>
              </div>
            </div>

            {/* Content area with sidebar */}
            <div style={{display:"flex",gap:16,alignItems:"flex-start",flexWrap:"wrap"}}>

              {/* Sidebar filters */}
              <aside style={{width:180,flexShrink:0,background:"#fff",border:"1px solid #E0E3E8",borderRadius:4,padding:"16px 0"}}>
                <div style={{padding:"0 16px 12px",fontSize:13,fontWeight:700,color:"#333",borderBottom:"1px solid #F0F1F3"}}>검색 옵션</div>

                <div style={{padding:"12px 16px 8px"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:8,letterSpacing:.5}}>접견상태</div>
                  {[["all","전체"],["AVAILABLE","접견가능"],["CHECKED_OUT","접견중"],["RESTRICTED","접견불가"]].map(([k,l])=>(
                    <label key={k} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:statusFilter===k?"#222":"#777",marginBottom:6,cursor:"pointer",fontWeight:statusFilter===k?500:400}}>
                      <input type="radio" name="sf" checked={statusFilter===k} onChange={()=>setStatusFilter(k)} style={{accentColor:blue}}/>
                      {l}
                      {k!=="all"&&<span style={{fontSize:10,color:ST[k]?.c,fontWeight:600}}>●</span>}
                    </label>
                  ))}
                </div>

                <div style={{padding:"8px 16px",borderTop:"1px solid #F0F1F3"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:8,letterSpacing:.5}}>보안등급</div>
                  {["GENERAL","SPECIAL COLLECTION","RESTRICTED"].map(k=>(
                    <div key={k} style={{fontSize:12,color:"#777",marginBottom:4,display:"flex",alignItems:"center",gap:4}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:CC[k],display:"inline-block"}}/>
                      {k}
                    </div>
                  ))}
                </div>
              </aside>

              {/* Main content */}
              <div style={{flex:1,minWidth:0}}>
                {/* Toolbar */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
                  <div style={{fontSize:13,color:"#888"}}>
                    {total>0&&<>전체 수감자: <strong style={{color:"#444"}}>{total.toLocaleString()}</strong>건</>}
                    {q&&<> · 필터 결과: <strong style={{color:blue}}>{display.length}</strong>건</>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                    {/* View mode */}
                    <div style={{display:"flex",border:"1px solid #D0D4DA",borderRadius:3,overflow:"hidden"}}>
                      <button onClick={()=>setViewMode("list")} style={{padding:"5px 10px",background:viewMode==="list"?blue:"#fff",color:viewMode==="list"?"#fff":"#888",border:"none",fontSize:12,display:"flex",alignItems:"center",gap:3}} title="목록형">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5"/><line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5"/><line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5"/></svg>
                        목록형
                      </button>
                      <button onClick={()=>setViewMode("card")} style={{padding:"5px 10px",background:viewMode==="card"?blue:"#fff",color:viewMode==="card"?"#fff":"#888",border:"none",borderLeft:"1px solid #D0D4DA",fontSize:12,display:"flex",alignItems:"center",gap:3}} title="표지형">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>
                        표지형
                      </button>
                    </div>

                    {/* Sort */}
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:12,color:"#999"}}>정렬기준</span>
                      <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:"5px 8px",border:"1px solid #D0D4DA",borderRadius:3,fontSize:12,background:"#fff",color:"#444"}}>
                        <option value="default">기본순</option>
                        <option value="title">수감자명순</option>
                        <option value="creator">저자순</option>
                        <option value="year">수감연도순</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loading&&<Loader/>}
                {err&&<div style={{padding:16,background:"#FFF3E0",border:"1px solid #FFB74D",borderRadius:4,fontSize:14,color:"#E65100"}}>⚠ {err}</div>}

                {/* LIST VIEW */}
                {!loading&&display.length>0&&viewMode==="list"&&(
                  <div style={{background:"#fff",border:"1px solid #E0E3E8",borderRadius:4,overflow:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:580}}>
                      <thead><tr>
                        <th style={TH}>수감번호</th><th style={{...TH,minWidth:180}}>수감자명</th>
                        <th style={TH}>저자(관련인)</th><th style={TH}>수감위치</th><th style={TH}>접견상태</th>
                      </tr></thead>
                      <tbody>{display.map((b,i)=>(
                        <tr key={b.id+i} style={{cursor:"pointer"}} onClick={()=>open(b)}>
                          <td style={{...TDM,background:i%2===0?"#FAFBFC":"#fff"}}>{b.isbn||b.id}</td>
                          <td style={{...TD,background:i%2===0?"#FAFBFC":"#fff"}}><span style={{fontWeight:500}}>{b.title.length>55?b.title.slice(0,55)+"…":b.title}</span></td>
                          <td style={{...TD,background:i%2===0?"#FAFBFC":"#fff"}}>{b.creator}</td>
                          <td style={{...TDM,background:i%2===0?"#FAFBFC":"#fff"}}>{b.callNo||"—"}</td>
                          <td style={{...TD,background:i%2===0?"#FAFBFC":"#fff"}}><Badge s={b.status}/></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}

                {/* CARD VIEW */}
                {!loading&&display.length>0&&viewMode==="card"&&(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",gap:12}}>
                    {display.map((b,i)=>(
                      <div className="card" key={b.id+i} onClick={()=>open(b)} style={{background:"#fff",border:"1px solid #E0E3E8",borderRadius:4,padding:16,cursor:"pointer",transition:"all .15s",display:"flex",flexDirection:"column",gap:10}}>
                        <div style={{width:"100%",aspectRatio:"3/4",background:"#F0F1F3",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:2,position:"relative"}}>
                          <span style={{fontSize:36,filter:"grayscale(.6)",opacity:.4}}>📕</span>
                          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"4px 8px",background:"rgba(0,0,0,.5)",color:"#fff",fontSize:9,fontFamily:"'Courier New',monospace",letterSpacing:.5}}>{b.id}</div>
                        </div>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,lineHeight:1.3,marginBottom:3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{b.title}</div>
                          <div style={{fontSize:12,color:"#888",marginBottom:6}}>{b.creator}</div>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span style={{fontSize:10,fontFamily:"'Courier New',monospace",color:"#bbb"}}>{b.callNo}</span>
                            <Badge s={b.status}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading&&!err&&display.length===0&&books.length>0&&<div style={{textAlign:"center",padding:48,color:"#bbb",fontSize:14}}>검색 결과가 없습니다.</div>}

                {!q&&tp>1&&<Pager pn={pn} tp={tp} load={load}/>}
              </div>
            </div>
          </>}

          {/* ══ DETAIL ══ */}
          {pg==="detail"&&sel&&<>
            <button onClick={home} style={{background:"none",border:"none",fontSize:13,color:blue,marginBottom:12,padding:0}}>← 목록으로 돌아가기</button>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 18px",background:blue,borderRadius:"4px 4px 0 0",flexWrap:"wrap",gap:6}}>
              <span style={{fontSize:11,letterSpacing:2,color:"rgba(255,255,255,.65)",fontWeight:600}}>INMATE FILE</span>
              <span style={{fontSize:11,fontFamily:"'Courier New',monospace",color:"rgba(255,255,255,.4)"}}>Case No. {sel.isbn||sel.id}</span>
            </div>
            <div style={{display:"flex",gap:24,padding:24,background:"#fff",border:"1px solid #E0E3E8",borderTop:"none",borderRadius:"0 0 4px 4px",flexWrap:"wrap"}}>
              <div style={{width:160,flexShrink:0}}>
                <div style={{border:"1px solid #E0E3E8",background:"#FAFBFC",textAlign:"center",padding:"28px 12px 14px"}}>
                  <div style={{fontSize:42,filter:"grayscale(.8)",opacity:.45}}>📕</div>
                  <div style={{fontSize:10,fontFamily:"'Courier New',monospace",color:"#bbb",marginTop:6}}>{sel.id}</div>
                </div>
                <div style={{marginTop:4,padding:"6px 0",textAlign:"center",color:"#fff",fontSize:10,fontWeight:700,letterSpacing:1,background:CC[sel.classification]||"#555"}}>{sel.classification}</div>
              </div>
              <div style={{flex:1,minWidth:260}}>
                <h2 style={{margin:"0 0 2px",fontSize:20,fontWeight:700,lineHeight:1.3}}>{sel.title}</h2>
                {sel.alt&&<div style={{fontSize:13,color:"#999",marginBottom:10,fontStyle:"italic"}}>{sel.alt}</div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",border:"1px solid #E8EAED",marginTop:12,marginBottom:16}}>
                  {[["수감번호 (ISBN)",sel.isbn||"—",1],["서지ID",sel.id,1],["저자",sel.creator||"—"],["발행지",sel.pubPlace||"—"],["수감위치 (청구기호)",sel.callNo||"—",1],["소장정보",sel.holding||"—"],["형태사항",sel.extent||"—"],["장르",sel.genre||"—"]].map(([l,v,m],i)=>(
                    <div key={i} style={{padding:"8px 12px",borderBottom:"1px solid #F0F1F3",borderRight:"1px solid #F0F1F3"}}>
                      <div style={{fontSize:10,color:"#aaa",fontWeight:500,marginBottom:2}}>{l}</div>
                      <div style={{fontSize:13,color:"#333",...(m?{fontFamily:"'Courier New',monospace",fontSize:12}:{})}}>{v}</div>
                    </div>
                  ))}
                </div>
                {sel.abstract&&<InfoBox title="사건 개요" color={blue}>{sel.abstract}</InfoBox>}
                <InfoBox title="기소 사유" color={ST[sel.status].c}>{sel.charges}</InfoBox>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#888",marginBottom:5}}>접견 상태</div>
                  <div style={{padding:"12px 16px",background:ST[sel.status].bg,color:ST[sel.status].c,borderLeft:`3px solid ${ST[sel.status].c}`}}>
                    <div style={{fontSize:15,fontWeight:700}}>{ST[sel.status].en}</div>
                    <div style={{fontSize:13}}>{ST[sel.status].ko}</div>
                    {sel.status==="CHECKED_OUT"&&<div style={{fontSize:12,marginTop:4,opacity:.8}}>접견인: 이용자 {sel.visitor} · 반납예정: {sel.returnDate}</div>}
                  </div>
                </div>
                {sel.status==="AVAILABLE"&&<button onClick={()=>{setPg("visit");setVs(false);window.scrollTo(0,0)}} style={{padding:"9px 22px",background:blue,color:"#fff",border:"none",borderRadius:3,fontSize:14,fontWeight:500}}>접견 신청 →</button>}
                {sel.status==="RESTRICTED"&&<div style={{padding:12,background:"#FFEBEE",border:"1px solid #EF9A9A",borderRadius:3,fontSize:13,color:"#C62828"}}>본 수감자는 접근 제한 상태입니다.</div>}
              </div>
            </div>
          </>}

          {/* ══ VISIT ══ */}
          {pg==="visit"&&sel&&<>
            <button onClick={()=>{setPg("detail");window.scrollTo(0,0)}} style={{background:"none",border:"none",fontSize:13,color:blue,marginBottom:12,padding:0}}>← 상세정보로 돌아가기</button>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 18px",background:blue,borderRadius:"4px 4px 0 0",flexWrap:"wrap",gap:6}}>
              <span style={{fontSize:11,letterSpacing:2,color:"rgba(255,255,255,.65)",fontWeight:600}}>접견 신청서</span>
              <span style={{fontSize:11,fontFamily:"'Courier New',monospace",color:"rgba(255,255,255,.4)"}}>{sel.title.slice(0,30)}</span>
            </div>
            <div style={{padding:24,background:"#fff",border:"1px solid #E0E3E8",borderTop:"none",borderRadius:"0 0 4px 4px"}}>
              {sel.status==="RESTRICTED"?(
                <Stamp color="#C62828" text="DENIED"><p>접견이 거부되었습니다. 본 수감자는 <strong>{sel.classification}</strong> 등급으로 접근이 제한됩니다.</p></Stamp>
              ):sel.status==="CHECKED_OUT"?(
                <Stamp color="#C25700" text="IN PROGRESS"><p>현재 이용자 {sel.visitor}와(과) 접견 중입니다.<br/>접견 가능 예상일: <strong>{sel.returnDate}</strong></p></Stamp>
              ):vs?(
                <Stamp color="#2B6E2B" text="APPROVED">
                  <p>수감자 <strong>{sel.title}</strong>에 대한 접견이 승인되었습니다.<br/>소장위치: <strong>{sel.callNo||sel.holding||"확인 필요"}</strong></p>
                  <div style={{display:"inline-block",marginTop:14,padding:"10px 16px",background:"#F5F6F8",fontFamily:"'Courier New',monospace",fontSize:12,lineHeight:1.8,textAlign:"left",border:"1px solid #E0E3E8"}}>
                    접견인: {vf.n}<br/>관계: {vf.r}<br/>승인: {new Date().toLocaleString("ko-KR")}<br/>인가코드: {Math.random().toString(36).slice(2,10).toUpperCase()}
                  </div>
                </Stamp>
              ):<>
                <div style={{padding:14,background:"#FAFBFC",border:"1px solid #E8EAED",marginBottom:20,fontSize:13,lineHeight:1.8}}>
                  <strong>접견 규칙</strong><br/>
                  1. 모든 접견인은 유효한 신분증을 제시해야 합니다.<br/>
                  2. 접견 기간은 14일을 초과할 수 없습니다.<br/>
                  3. 수감자 재산 훼손 시 금전적 제재가 부과됩니다.<br/>
                  4. 수감자 내용물의 무단 복제는 엄격히 금지됩니다.<br/>
                  5. 교정국은 언제든지 접견 권한을 취소할 수 있습니다.
                </div>
                <div style={{marginBottom:14}}><label style={FL}>접견인 성명 *</label><input style={FI} value={vf.n} onChange={e=>setVf({...vf,n:e.target.value})} placeholder="성명"/></div>
                <div style={{marginBottom:14}}>
                  <label style={FL}>수감자와의 관계 *</label>
                  <select style={FI} value={vf.r} onChange={e=>setVf({...vf,r:e.target.value})}><option value="">선택</option><option value="연구자">연구자</option><option value="학생">학생</option><option value="일반 열람인">일반 열람인</option><option value="법률 대리인">법률 대리인</option></select>
                </div>
                <div style={{marginBottom:14}}><label style={FL}>접견 사유</label><textarea style={{...FI,height:68,resize:"vertical"}} value={vf.s} onChange={e=>setVf({...vf,s:e.target.value})} placeholder="사유"/></div>
                <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#444",cursor:"pointer",marginBottom:14}}>
                  <input type="checkbox" checked={vf.a} onChange={e=>setVf({...vf,a:e.target.checked})} style={{accentColor:blue}}/> 접견 규칙에 동의합니다 *
                </label>
                <button disabled={!vf.n||!vf.r||!vf.a} onClick={()=>setVs(true)} style={{padding:"9px 22px",background:blue,color:"#fff",border:"none",borderRadius:3,fontSize:14,fontWeight:500,opacity:(vf.n&&vf.r&&vf.a)?1:.35}}>접견 신청</button>
              </>}
            </div>
          </>}
        </main>

        <footer style={{background:blue,color:"rgba(255,255,255,.35)",padding:"14px 24px",textAlign:"center",fontSize:11,letterSpacing:1,marginTop:"auto"}}>
          서지교정국 · DEPT. OF LIBRARY CORRECTIONS · 「책은 죄수다」
        </footer>
      </div>
    </>
  );
}

/* ── Components ── */
function Badge({s}){return<span style={{display:"inline-block",padding:"2px 7px",fontSize:11,fontWeight:600,borderRadius:2,background:ST[s].bg,color:ST[s].c}}>{ST[s].ko}</span>}
function Loader(){return<div style={{textAlign:"center",padding:40,color:"#888",fontSize:14}}><div style={{width:24,height:24,border:"3px solid #E0E3E8",borderTop:`3px solid ${blue}`,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 8px"}}/>조회 중…</div>}
function Pager({pn,tp,load}){return<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:12,padding:"16px 0"}}><button disabled={pn<=1} onClick={()=>{load(pn-1);window.scrollTo(0,0)}} style={PB}>← 이전</button><span style={{fontSize:13,color:"#888"}}>{pn} / {tp>9999?"…":tp}</span><button disabled={pn>=tp} onClick={()=>{load(pn+1);window.scrollTo(0,0)}} style={PB}>다음 →</button></div>}
function Stamp({color,text,children}){return<div style={{textAlign:"center",padding:"20px 0"}}><div style={{display:"inline-block",padding:"7px 28px",background:color,color:"#fff",fontSize:22,fontWeight:700,letterSpacing:5,fontFamily:"'Noto Serif KR',Georgia,serif",transform:"rotate(-2deg)"}}>{text}</div><div style={{marginTop:16,fontSize:14,lineHeight:1.7,color:"#444"}}>{children}</div></div>}
function InfoBox({title,color,children}){return<div style={{padding:"11px 14px",background:"#FAFBFC",border:"1px solid #E8EAED",borderLeft:`3px solid ${color}`,marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color,marginBottom:3}}>{title}</div><div style={{fontSize:13,lineHeight:1.7,color:"#444"}}>{children}</div></div>}

/* ── Style tokens ── */
const TH={textAlign:"left",padding:"9px 14px",fontSize:11,fontWeight:600,color:"#777",borderBottom:"2px solid #E0E3E8",background:"#FAFBFC"};
const TD={padding:"9px 14px",borderBottom:"1px solid #F0F1F3",verticalAlign:"top"};
const TDM={...TD,fontFamily:"'Courier New',monospace",fontSize:11,color:"#666"};
const PB={padding:"6px 14px",background:"#fff",border:"1px solid #D0D4DA",borderRadius:3,fontSize:13,color:"#444"};
const FL={display:"block",fontSize:12,fontWeight:500,color:"#555",marginBottom:4};
const FI={width:"100%",padding:"9px 12px",border:"1px solid #D0D4DA",borderRadius:3,fontSize:13,outline:"none",background:"#FAFBFC",boxSizing:"border-box"};
