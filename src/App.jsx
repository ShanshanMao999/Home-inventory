import { useState, useEffect, useCallback } from "react";

const T = {
  en: {
    title: "📦 Home Inventory", sub: "Everything at a glance", search: "🔍 Search items...",
    addTitle: "📥 Add Item", name: "Name", namePh: "e.g. Eggs, Tissue...", zone: "Zone",
    qty: "Quantity", unit: "Unit", entryDate: "Date In", expiryDate: "Expiry (optional)",
    note: "Note (optional)", notePh: "Extra info...", confirm: "✓ Confirm", save: "✓ Save",
    useTitle: "📤 Use", usePh: "Max", current: "In stock: ", confirmUse: "Confirm",
    willClear: "⚠️ This will remove the item", editTitle: "✏️ Edit",
    shopTitle: "🛒 Shopping List", shopPh: "Add item...", shopEmpty: "List is empty",
    clearDone: "Clear completed", expired: "Expired", today: "Today",
    alertExp: " expired", alertSoon: " expiring soon",
    entryL: "In", expiryL: "Exp", noExpiry: "No expiry", allUsed: " (all)",
    fridge: "🧊 Fridge", freezer: "❄️ Freezer", dry: "🏺 Pantry", household: "🧴 Household",
    emptyZone: "No items here",
  },
  cn: {
    title: "📦 家庭物品管家", sub: "全屋库存 · 一目了然", search: "🔍 搜索物品...",
    addTitle: "📥 添加物品", name: "名称", namePh: "例如：鸡蛋、纸巾...", zone: "存放区域",
    qty: "数量", unit: "单位", entryDate: "入库日期", expiryDate: "到期日期（选填）",
    note: "备注（选填）", notePh: "补充信息...", confirm: "✓ 确认添加", save: "✓ 保存修改",
    useTitle: "📤 取用", usePh: "最多", current: "当前库存：", confirmUse: "确认取用",
    willClear: "⚠️ 将清空此物品", editTitle: "✏️ 编辑",
    shopTitle: "🛒 采购清单", shopPh: "添加采购项...", shopEmpty: "清单为空",
    clearDone: "清除已完成", expired: "已过期", today: "今天到期",
    alertExp: "项已过期", alertSoon: "项即将到期",
    entryL: "入库", expiryL: "到期", noExpiry: "无到期日", allUsed: "（全部）",
    fridge: "🧊 冷藏", freezer: "❄️ 冷冻", dry: "🏺 干货", household: "🧴 日用品",
    emptyZone: "这里还没有物品",
  },
};

const ZONES = [
  { id:"fridge", color:"#0ea5e9" }, { id:"freezer", color:"#8b5cf6" },
  { id:"dry", color:"#d97706" }, { id:"household", color:"#10b981" },
];
const UNITS = ["个","根","颗","头","块","片","份","包","袋","瓶","盒","卷","g","kg","ml","L","斤"];

const ORD = n => { const s=["th","st","nd","rd"]; const v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); };
const EMON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(d,lang) {
  if(!d) return ""; const x=new Date(d); const day=x.getDate(); const mon=x.getMonth();
  return lang==="en" ? `${ORD(day)} ${EMON[mon]}` : `${mon+1}月${day}日`;
}

function diffD(d) { if(!d) return Infinity; const t=new Date();t.setHours(0,0,0,0); const e=new Date(d);e.setHours(0,0,0,0); return Math.ceil((e-t)/864e5); }

function stOf(exp,lang) {
  if(!exp) return {t:T[lang].noExpiry,c:"#94a3b8",bg:"#f1f5f9",p:5};
  const d=diffD(exp); const tt=T[lang];
  if(d<0) return {t:tt.expired,c:"#ef4444",bg:"#fef2f2",p:0};
  if(d===0) return {t:tt.today,c:"#f59e0b",bg:"#fffbeb",p:1};
  if(d<=2) return {t:lang==="en"?`${d}d left`:`${d}天`,c:"#f97316",bg:"#fff7ed",p:2};
  if(d<=5) return {t:lang==="en"?`${d}d left`:`${d}天`,c:"#eab308",bg:"#fefce8",p:3};
  return {t:lang==="en"?`${d}d left`:`${d}天`,c:"#22c55e",bg:"#f0fdf4",p:4};
}

function td(){return new Date().toISOString().split("T")[0]}

const INIT=[
  {id:"1",name:"鸡蛋 Eggs",zone:"fridge",qty:11,unit:"个",entryDate:"2026-05-03",expiryDate:"2026-05-13",note:""},
  {id:"2",name:"芹菜 Celery",zone:"fridge",qty:0.66,unit:"根",entryDate:"2026-05-03",expiryDate:"2026-05-08",note:"两次的量 / 2 servings"},
  {id:"3",name:"上海青 Bok Choy",zone:"fridge",qty:2,unit:"颗",entryDate:"2026-05-03",expiryDate:"2026-05-07",note:""},
  {id:"4",name:"小葱 Spring Onion",zone:"fridge",qty:3,unit:"根",entryDate:"2026-05-03",expiryDate:"2026-05-08",note:""},
  {id:"5",name:"土豆 Potato",zone:"fridge",qty:5,unit:"个",entryDate:"2026-05-03",expiryDate:"2026-05-17",note:""},
  {id:"6",name:"红薯 Sweet Potato",zone:"fridge",qty:4,unit:"个",entryDate:"2026-05-03",expiryDate:"2026-05-17",note:""},
  {id:"7",name:"胡萝卜 Carrot",zone:"fridge",qty:3,unit:"根",entryDate:"2026-05-03",expiryDate:"2026-05-15",note:""},
  {id:"8",name:"蒜 Garlic",zone:"fridge",qty:1,unit:"头",entryDate:"2026-05-03",expiryDate:"2026-05-20",note:""},
  {id:"9",name:"西班牙火腿 Jamón",zone:"fridge",qty:100,unit:"g",entryDate:"2026-05-03",expiryDate:"2026-05-10",note:"7片 / 7 slices"},
  {id:"10",name:"牛奶 Milk",zone:"fridge",qty:200,unit:"ml",entryDate:"2026-05-03",expiryDate:"2026-05-10",note:""},
  {id:"11",name:"菠菜 Spinach",zone:"fridge",qty:250,unit:"g",entryDate:"2026-05-03",expiryDate:"2026-05-07",note:""},
  {id:"12",name:"黄瓜 Cucumber",zone:"fridge",qty:1,unit:"根",entryDate:"2026-05-03",expiryDate:"2026-05-08",note:""},
  {id:"13",name:"番茄 Tomato",zone:"fridge",qty:6,unit:"个",entryDate:"2026-05-03",expiryDate:"2026-05-10",note:""},
  {id:"14",name:"橙子 Orange",zone:"fridge",qty:3,unit:"个",entryDate:"2026-05-03",expiryDate:"2026-05-13",note:""},
  {id:"15",name:"牛油果 Avocado",zone:"fridge",qty:1,unit:"个",entryDate:"2026-05-03",expiryDate:"2026-05-07",note:""},
  {id:"16",name:"西兰花 Broccoli",zone:"fridge",qty:1,unit:"个",entryDate:"2026-05-03",expiryDate:"2026-05-08",note:""},
  {id:"17",name:"巧克力 Chocolate",zone:"fridge",qty:9,unit:"块",entryDate:"2026-05-03",expiryDate:"2026-08-03",note:""},
  {id:"20",name:"冰 Ice",zone:"freezer",qty:1,unit:"袋",entryDate:"2026-05-03",expiryDate:"",note:""},
  {id:"21",name:"馄饨 Wonton",zone:"freezer",qty:15,unit:"个",entryDate:"2026-05-03",expiryDate:"2026-08-03",note:""},
  {id:"22",name:"鸡肉 Chicken",zone:"freezer",qty:11,unit:"份",entryDate:"2026-05-03",expiryDate:"2026-08-03",note:""},
  {id:"23",name:"猪肉馅 Pork Mince",zone:"freezer",qty:4,unit:"份",entryDate:"2026-05-03",expiryDate:"2026-08-03",note:""},
  {id:"24",name:"猪肉 Pork",zone:"freezer",qty:2,unit:"份",entryDate:"2026-05-03",expiryDate:"2026-08-03",note:""},
  {id:"25",name:"购买丸子 Store Meatballs",zone:"freezer",qty:3,unit:"份",entryDate:"2026-05-03",expiryDate:"2026-08-03",note:""},
  {id:"26",name:"自制香菇肉丸 Mushroom Meatballs",zone:"freezer",qty:2,unit:"份",entryDate:"2026-05-03",expiryDate:"2026-07-03",note:"自制 homemade"},
  {id:"27",name:"冻毛豆 Frozen Edamame",zone:"freezer",qty:1,unit:"包",entryDate:"2026-05-03",expiryDate:"2026-08-03",note:"克重待录入 / weight TBC"},
  {id:"28",name:"虾皮 Dried Shrimp",zone:"freezer",qty:1,unit:"包",entryDate:"2026-05-03",expiryDate:"",note:"克数待录入 / weight TBC"},
  {id:"29",name:"冻米饭 Frozen Rice",zone:"freezer",qty:2,unit:"份",entryDate:"2026-05-03",expiryDate:"2026-08-03",note:""},
];

export default function App(){
  const [lang,setLang]=useState("cn"); const t=T[lang];
  const [items,setItems]=useState([]);
  const [shop,setShop]=useState([]);
  const [zone,setZone]=useState("fridge");
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(null);
  const [editItem,setEditItem]=useState(null);
  const [useAmt,setUseAmt]=useState("");
  const [loaded,setLoaded]=useState(false);
  const [newShop,setNewShop]=useState("");
  const [form,setForm]=useState({name:"",zone:"fridge",qty:"",unit:"个",entryDate:td(),expiryDate:"",note:""});

  useEffect(()=>{(async()=>{
    try{const raw=localStorage.getItem("home-inv-v4");if(raw){const d=JSON.parse(raw);setItems(d.items||[]);setShop(d.shop||[]);}else setItems(INIT);}catch{setItems(INIT);}
    setLoaded(true);
  })();},[]);

  const save=useCallback((ni,ns)=>{try{localStorage.setItem("home-inv-v4",JSON.stringify({items:ni,shop:ns}));}catch{}},[]);

  const doAdd=()=>{if(!form.name.trim()||!form.qty)return;const n=[...items,{...form,id:Date.now().toString(),qty:parseFloat(form.qty)}];setItems(n);save(n,shop);setModal(null);setForm({name:"",zone:"fridge",qty:"",unit:"个",entryDate:td(),expiryDate:"",note:""});};
  const doUse=item=>{const a=parseFloat(useAmt);if(!a||a<=0)return;const rem=item.qty-a;const n=rem<=0?items.filter(i=>i.id!==item.id):items.map(i=>i.id===item.id?{...i,qty:Math.round(rem*100)/100}:i);setItems(n);save(n,shop);setModal(null);setUseAmt("");setEditItem(null);};
  const doRm=id=>{const n=items.filter(i=>i.id!==id);setItems(n);save(n,shop);};
  const doEdit=()=>{if(!editItem)return;const n=items.map(i=>i.id===editItem.id?{...editItem,qty:parseFloat(editItem.qty)||0}:i);setItems(n);save(n,shop);setModal(null);setEditItem(null);};

  const addS=()=>{if(!newShop.trim())return;const n=[...shop,{id:Date.now().toString(),name:newShop.trim(),done:false}];setShop(n);save(items,n);setNewShop("");};
  const togS=id=>{const n=shop.map(s=>s.id===id?{...s,done:!s.done}:s);setShop(n);save(items,n);};
  const rmS=id=>{const n=shop.filter(s=>s.id!==id);setShop(n);save(items,n);};
  const clrS=()=>{const n=shop.filter(s=>!s.done);setShop(n);save(items,n);};
  const toS=name=>{if(shop.some(s=>s.name===name))return;const n=[...shop,{id:Date.now().toString(),name,done:false}];setShop(n);save(items,n);};

  const fil=items.filter(i=>i.zone===zone).filter(i=>!search||i.name.toLowerCase().includes(search.toLowerCase())||(i.note&&i.note.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>{
    const da=a.expiryDate?new Date(a.expiryDate):new Date("2099-01-01");
    const db=b.expiryDate?new Date(b.expiryDate):new Date("2099-01-01");
    return da-db;
  });
  const zc=z=>items.filter(i=>i.zone===z).length;
  const eSoon=items.filter(i=>{const d=diffD(i.expiryDate);return d>=0&&d<=2;});
  const eExp=items.filter(i=>diffD(i.expiryDate)<0);

  if(!loaded)return<div style={S.ld}>📦 Loading...</div>;

  return(
    <div style={S.w}>
      <div style={S.top}>
        <div style={{flex:1}}><h1 style={S.h1}>{t.title}</h1><p style={S.sub}>{t.sub}</p></div>
        <div style={S.tBtns}>
          <button style={S.lBtn} onClick={()=>setLang(l=>l==="cn"?"en":"cn")}>{lang==="cn"?"EN":"中"}</button>
          <button style={S.sBtn} onClick={()=>setModal("shop")}>🛒{shop.filter(s=>!s.done).length>0&&<span style={S.bdg}>{shop.filter(s=>!s.done).length}</span>}</button>
          <button style={S.aBtn} onClick={()=>{setForm(f=>({...f,zone}));setModal("add")}}>＋</button>
        </div>
      </div>

      {(eExp.length>0||eSoon.length>0)&&<div style={S.als}>
        {eExp.length>0&&<div style={S.aR}>⚠️ {eExp.length}{t.alertExp}：{eExp.slice(0,3).map(i=>i.name).join("、")}{eExp.length>3?"…":""}</div>}
        {eSoon.length>0&&<div style={S.aY}>⏰ {eSoon.length}{t.alertSoon}：{eSoon.slice(0,3).map(i=>i.name).join("、")}{eSoon.length>3?"…":""}</div>}
      </div>}

      <div style={S.zTabs}>{ZONES.map(z=>(
        <button key={z.id} onClick={()=>setZone(z.id)} style={zone===z.id?{...S.zTab,background:z.color+"18",borderColor:z.color,color:z.color}:S.zTab}>
          <span>{t[z.id]}</span><span style={S.zCnt}>{zc(z.id)}</span>
        </button>
      ))}</div>

      <div style={S.srW}><input style={S.srI} placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button style={S.srX} onClick={()=>setSearch("")}>✕</button>}</div>

      <div style={S.lst}>
        {fil.length===0&&<div style={S.emp}><div style={{fontSize:40,marginBottom:8}}>{t[zone]?.split(" ")[0]}</div><p style={{color:"#94a3b8",margin:0}}>{t.emptyZone}</p></div>}
        {fil.map(item=>{const st=stOf(item.expiryDate,lang);return(
          <div key={item.id} style={{...S.cd,borderLeftColor:st.c}}>
            <div style={S.cdT}><div style={S.cdN}>{item.name}</div><span style={{...S.stB,background:st.bg,color:st.c}}>{st.t}</span></div>
            <div style={S.cdD}><span style={S.qt}>{item.qty}{item.unit}</span>{item.note&&<span style={S.nt}>（{item.note}）</span>}</div>
            <div style={S.cdM}>
              {t.entryL} {fmtDate(item.entryDate,lang)}
              {item.expiryDate?` · ${t.expiryL} ${fmtDate(item.expiryDate,lang)}`:` · ${t.noExpiry}`}
            </div>
            {item.expiryDate&&<div style={S.bar}>{(()=>{const tot=diffD(item.expiryDate)+Math.ceil((new Date()-new Date(item.entryDate))/864e5);const rm=Math.max(0,diffD(item.expiryDate));const p=tot>0?Math.min(100,(rm/tot)*100):0;return<div style={{...S.barF,width:p+"%",background:st.c}}/>;})()}</div>}
            <div style={S.cdA}>
              <button style={S.ab} onClick={()=>{setEditItem(item);setUseAmt("");setModal("use")}}>📤</button>
              <button style={S.ab} onClick={()=>{setEditItem({...item,qty:item.qty.toString(),expiryDate:item.expiryDate||""});setModal("edit")}}>✏️</button>
              <button style={S.ab} onClick={()=>toS(item.name)}>🛒</button>
              <button style={{...S.ab,color:"#ef4444"}} onClick={()=>doRm(item.id)}>🗑</button>
            </div>
          </div>
        );})}
      </div>

      {modal&&<div style={S.ov} onClick={()=>{setModal(null);setEditItem(null)}}><div style={S.md} onClick={e=>e.stopPropagation()}>

        {modal==="add"&&<>
          <div style={S.mH}><h2 style={S.mT}>{t.addTitle}</h2><button style={S.xB} onClick={()=>setModal(null)}>✕</button></div>
          <div style={S.f}><label style={S.lb}>{t.name}</label><input style={S.ip} placeholder={t.namePh} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} autoFocus/></div>
          <div style={S.f}><label style={S.lb}>{t.zone}</label><div style={S.zG}>{ZONES.map(z=>(<button key={z.id} style={form.zone===z.id?{...S.zO,borderColor:z.color,background:z.color+"15"}:S.zO} onClick={()=>setForm(f=>({...f,zone:z.id}))}>{t[z.id]}</button>))}</div></div>
          <div style={S.rw}><div style={{flex:1}}><label style={S.lb}>{t.qty}</label><input style={S.ip} type="number" step="any" min="0" value={form.qty} onChange={e=>setForm(f=>({...f,qty:e.target.value}))}/></div><div style={{flex:1}}><label style={S.lb}>{t.unit}</label><select style={S.ip} value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div></div>
          <div style={S.rw}><div style={{flex:1}}><label style={S.lb}>{t.entryDate}</label><input style={S.ip} type="date" value={form.entryDate} onChange={e=>setForm(f=>({...f,entryDate:e.target.value}))}/></div><div style={{flex:1}}><label style={S.lb}>{t.expiryDate}</label><input style={S.ip} type="date" value={form.expiryDate} onChange={e=>setForm(f=>({...f,expiryDate:e.target.value}))}/></div></div>
          <div style={S.f}><label style={S.lb}>{t.note}</label><input style={S.ip} placeholder={t.notePh} value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></div>
          <button style={S.sub2} onClick={doAdd}>{t.confirm}</button>
        </>}

        {modal==="use"&&editItem&&<>
          <div style={S.mH}><h2 style={S.mT}>{t.useTitle} · {editItem.name}</h2><button style={S.xB} onClick={()=>{setModal(null);setEditItem(null)}}>✕</button></div>
          <p style={S.uI}>{t.current}<strong>{editItem.qty}{editItem.unit}</strong></p>
          <div style={S.f}><label style={S.lb}>{t.qty}（{editItem.unit}）</label><input style={S.ip} type="number" step="any" min="0" max={editItem.qty} value={useAmt} onChange={e=>setUseAmt(e.target.value)} autoFocus placeholder={`${t.usePh} ${editItem.qty}`}/></div>
          <div style={S.qBs}>{[1,2,Math.ceil(editItem.qty/2),editItem.qty].filter((v,i,a)=>a.indexOf(v)===i&&v<=editItem.qty&&v>0).map(v=>(<button key={v} style={S.qB} onClick={()=>setUseAmt(v.toString())}>{v}{editItem.unit}{v===editItem.qty?t.allUsed:""}</button>))}</div>
          <button style={S.sub2} onClick={()=>doUse(editItem)}>{t.confirmUse}</button>
          {parseFloat(useAmt)>=editItem.qty&&<p style={{color:"#f59e0b",fontSize:13,textAlign:"center",marginTop:8}}>{t.willClear}</p>}
        </>}

        {modal==="edit"&&editItem&&<>
          <div style={S.mH}><h2 style={S.mT}>{t.editTitle} · {editItem.name}</h2><button style={S.xB} onClick={()=>{setModal(null);setEditItem(null)}}>✕</button></div>
          <div style={S.f}><label style={S.lb}>{t.name}</label><input style={S.ip} value={editItem.name} onChange={e=>setEditItem(p=>({...p,name:e.target.value}))}/></div>
          <div style={S.f}><label style={S.lb}>{t.zone}</label><div style={S.zG}>{ZONES.map(z=>(<button key={z.id} style={editItem.zone===z.id?{...S.zO,borderColor:z.color,background:z.color+"15"}:S.zO} onClick={()=>setEditItem(p=>({...p,zone:z.id}))}>{t[z.id]}</button>))}</div></div>
          <div style={S.rw}><div style={{flex:1}}><label style={S.lb}>{t.qty}</label><input style={S.ip} type="number" step="any" value={editItem.qty} onChange={e=>setEditItem(p=>({...p,qty:e.target.value}))}/></div><div style={{flex:1}}><label style={S.lb}>{t.unit}</label><select style={S.ip} value={editItem.unit} onChange={e=>setEditItem(p=>({...p,unit:e.target.value}))}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div></div>
          <div style={S.rw}><div style={{flex:1}}><label style={S.lb}>{t.entryDate}</label><input style={S.ip} type="date" value={editItem.entryDate} onChange={e=>setEditItem(p=>({...p,entryDate:e.target.value}))}/></div><div style={{flex:1}}><label style={S.lb}>{t.expiryDate}</label><input style={S.ip} type="date" value={editItem.expiryDate} onChange={e=>setEditItem(p=>({...p,expiryDate:e.target.value}))}/></div></div>
          <div style={S.f}><label style={S.lb}>{t.note}</label><input style={S.ip} value={editItem.note||""} onChange={e=>setEditItem(p=>({...p,note:e.target.value}))}/></div>
          <button style={S.sub2} onClick={doEdit}>{t.save}</button>
        </>}

        {modal==="shop"&&<>
          <div style={S.mH}><h2 style={S.mT}>{t.shopTitle}</h2><button style={S.xB} onClick={()=>setModal(null)}>✕</button></div>
          <div style={S.sR}><input style={{...S.ip,flex:1}} placeholder={t.shopPh} value={newShop} onChange={e=>setNewShop(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addS()}/><button style={S.sA} onClick={addS}>+</button></div>
          <div style={S.sL}>{shop.length===0&&<p style={{color:"#94a3b8",textAlign:"center",padding:20}}>{t.shopEmpty}</p>}
            {shop.map(s=>(<div key={s.id} style={{...S.sI,opacity:s.done?.5:1}}><button style={S.ck} onClick={()=>togS(s.id)}>{s.done?"☑":"☐"}</button><span style={{flex:1,textDecoration:s.done?"line-through":"none"}}>{s.name}</span><button style={{...S.ab,color:"#ef4444",fontSize:13,padding:2}} onClick={()=>rmS(s.id)}>✕</button></div>))}
          </div>
          {shop.some(s=>s.done)&&<button style={S.clB} onClick={clrS}>{t.clearDone}</button>}
        </>}

      </div></div>}
    </div>
  );
}

const S={
  w:{fontFamily:"'Noto Sans SC','PingFang SC',-apple-system,sans-serif",maxWidth:680,margin:"0 auto",padding:"0 12px 80px",minHeight:"100vh",background:"linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)"},
  ld:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh",fontSize:18,color:"#64748b"},
  top:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"24px 0 12px",gap:8},
  h1:{fontSize:22,fontWeight:800,margin:0,color:"#0f172a"},
  sub:{fontSize:12,color:"#94a3b8",margin:"2px 0 0"},
  tBtns:{display:"flex",gap:6,flexShrink:0},
  lBtn:{width:38,height:38,borderRadius:11,border:"1.5px solid #cbd5e1",background:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",color:"#475569",display:"flex",alignItems:"center",justifyContent:"center"},
  aBtn:{width:38,height:38,borderRadius:11,border:"none",background:"#0ea5e9",color:"#fff",fontSize:20,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 8px #0ea5e933",display:"flex",alignItems:"center",justifyContent:"center"},
  sBtn:{width:38,height:38,borderRadius:11,border:"1px solid #e2e8f0",background:"#fff",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"},
  bdg:{position:"absolute",top:-4,right:-4,background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,borderRadius:99,padding:"1px 5px",minWidth:14,textAlign:"center"},
  als:{display:"flex",flexDirection:"column",gap:6,marginBottom:8},
  aR:{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#dc2626"},
  aY:{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#d97706"},
  zTabs:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,margin:"8px 0"},
  zTab:{padding:"9px 4px",borderRadius:11,border:"2px solid #e2e8f0",background:"#fff",fontSize:12,cursor:"pointer",textAlign:"center",fontWeight:500,color:"#64748b",display:"flex",flexDirection:"column",alignItems:"center",gap:1},
  zCnt:{fontSize:11,fontWeight:700,opacity:.7},
  srW:{position:"relative",margin:"8px 0"},
  srI:{width:"100%",padding:"10px 36px 10px 12px",borderRadius:12,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box",background:"#fff"},
  srX:{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:16,color:"#94a3b8",cursor:"pointer"},
  lst:{marginTop:8},
  emp:{textAlign:"center",padding:"48px 20px"},
  cd:{background:"#fff",borderRadius:13,padding:"13px 14px",marginBottom:8,boxShadow:"0 1px 3px #0001",borderLeft:"3px solid #22c55e"},
  cdT:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3},
  cdN:{fontSize:15,fontWeight:700,color:"#0f172a",flex:1,marginRight:8},
  stB:{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:6,whiteSpace:"nowrap",flexShrink:0},
  cdD:{fontSize:14,color:"#334155",marginBottom:2},
  qt:{fontWeight:600},
  nt:{color:"#94a3b8",fontSize:12},
  cdM:{fontSize:11,color:"#94a3b8",marginBottom:6},
  bar:{height:3,borderRadius:3,background:"#f1f5f9",overflow:"hidden",marginBottom:8},
  barF:{height:"100%",borderRadius:3,transition:"width .4s"},
  cdA:{display:"flex",gap:6},
  ab:{background:"none",border:"1px solid #f1f5f9",borderRadius:8,fontSize:13,cursor:"pointer",padding:"4px 8px",color:"#64748b"},
  ov:{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(3px)"},
  md:{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:500,maxHeight:"85vh",overflowY:"auto",padding:"22px 18px 32px",boxShadow:"0 -4px 20px #0002"},
  mH:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16},
  mT:{fontSize:17,fontWeight:700,margin:0,color:"#0f172a"},
  xB:{background:"none",border:"none",fontSize:20,color:"#94a3b8",cursor:"pointer"},
  f:{marginBottom:14},
  rw:{display:"flex",gap:10,marginBottom:14},
  lb:{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4},
  ip:{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none",boxSizing:"border-box",background:"#f8fafc"},
  zG:{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6},
  zO:{padding:"8px",borderRadius:10,border:"2px solid #e2e8f0",background:"#fafafa",fontSize:12,cursor:"pointer",textAlign:"center"},
  sub2:{width:"100%",padding:"13px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#0ea5e9,#2563eb)",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginTop:6,boxShadow:"0 4px 12px #0ea5e933"},
  uI:{fontSize:15,color:"#334155",margin:"0 0 12px",textAlign:"center"},
  qBs:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12},
  qB:{padding:"6px 14px",borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:12,cursor:"pointer"},
  sR:{display:"flex",gap:8,marginBottom:14},
  sA:{width:44,height:44,borderRadius:10,border:"none",background:"#0ea5e9",color:"#fff",fontSize:22,fontWeight:700,cursor:"pointer",flexShrink:0},
  sL:{maxHeight:300,overflowY:"auto"},
  sI:{display:"flex",alignItems:"center",gap:10,padding:"10px 4px",borderBottom:"1px solid #f1f5f9",fontSize:14},
  ck:{background:"none",border:"none",fontSize:18,cursor:"pointer",padding:0},
  clB:{width:"100%",padding:10,borderRadius:10,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",fontSize:13,cursor:"pointer",marginTop:10},
};
