import { useState, useEffect } from "react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

// ══════════════════════════════════════════════════
// ⚙️ CONFIGURAZIONE — modifica solo qui
// ══════════════════════════════════════════════════
const BRAND = "ForgeCoach";
const COACH_PASSWORD = "coach123"; // cambia con la tua password
const COLORS = ["#C8F135","#60a5fa","#f59e0b","#f87171","#a78bfa","#34d399","#fb923c","#e879f9"];
const DAYS_OPTIONS = ["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"];

// ══════════════════════════════════════════════════
// 💾 STORAGE — localStorage (persiste nel browser)
// ══════════════════════════════════════════════════
const SK = {
  clients: "forge:clients",
  workouts: (id) => `forge:workouts:${id}`,
  meals: (id) => `forge:meals:${id}`,
  measurements: (id) => `forge:measurements:${id}`,
  coachSession: "forge:coach-session",
};

function lsGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}
function lsDel(key) {
  try { localStorage.removeItem(key); } catch {}
}

// ══════════════════════════════════════════════════
// 🌐 FIREBASE / CLOUD SYNC
// Per produzione vera: sostituisci lsGet/lsSet con
// chiamate a Firebase Realtime DB o Supabase.
// Per ora: localStorage è perfetto per iniziare.
// ══════════════════════════════════════════════════

// ══════════════════════════════════════════════════
// 📦 DATI SEED (primo avvio)
// ══════════════════════════════════════════════════
const SEED_CLIENTS = [
  { id:"C001", name:"Luca Rossi", email:"luca@example.com", dob:"1995-03-12", sex:"M", height:175, weight:78, goal:"Dimagrimento", program:"Perdita Grasso 12 sett.", start:"2026-02-01", end:"2026-04-24", status:"active", color:"#C8F135", avatar:"LR" },
  { id:"C002", name:"Sofia Marino", email:"sofia@example.com", dob:"1998-07-22", sex:"F", height:163, weight:58, goal:"Tonificazione", program:"Toning 8 sett.", start:"2026-01-15", end:"2026-03-15", status:"active", color:"#60a5fa", avatar:"SM" },
];
const SEED_WORKOUTS = {
  C001: {
    "Lunedì": [
      {name:"Back Squat",sets:4,reps:"8-10",load:"70kg",rest:"90s",muscles:"Quadricipiti · Glutei",note:"Aumenta carico ogni 2 sett."},
      {name:"Romanian Deadlift",sets:3,reps:"10-12",load:"60kg",rest:"75s",muscles:"Femorali · Glutei",note:""},
      {name:"Leg Press",sets:3,reps:"12-15",load:"120kg",rest:"60s",muscles:"Quadricipiti",note:""},
    ],
    "Mercoledì": [
      {name:"Bench Press",sets:4,reps:"8-10",load:"70kg",rest:"90s",muscles:"Pettorali",note:""},
      {name:"Incline DB Press",sets:3,reps:"10-12",load:"28kg",rest:"75s",muscles:"Petto superiore",note:""},
      {name:"Tricep Pushdown",sets:3,reps:"12-15",load:"20kg",rest:"45s",muscles:"Tricipiti",note:""},
    ],
    "Venerdì": [
      {name:"Pull-Up",sets:4,reps:"6-8",load:"BW",rest:"90s",muscles:"Dorsali",note:""},
      {name:"Barbell Row",sets:4,reps:"8-10",load:"65kg",rest:"90s",muscles:"Dorsali",note:""},
      {name:"Barbell Curl",sets:3,reps:"10-12",load:"30kg",rest:"45s",muscles:"Bicipiti",note:""},
    ],
  },
  C002: {
    "Lunedì": [
      {name:"Hip Thrust",sets:4,reps:"12-15",load:"60kg",rest:"75s",muscles:"Glutei",note:""},
      {name:"Split Squat",sets:3,reps:"10 cad.",load:"20kg",rest:"60s",muscles:"Quadricipiti",note:""},
    ],
    "Giovedì": [
      {name:"Push Up",sets:4,reps:"15-20",load:"BW",rest:"60s",muscles:"Pettorali",note:""},
      {name:"Plank",sets:3,reps:"45s",load:"BW",rest:"45s",muscles:"Core",note:""},
    ],
  },
};
const SEED_MEALS = {
  C001: {
    "Lunedì": [
      {time:"07:30",label:"Colazione",items:"Avena 80g + Latte 200ml + Banana",kcal:520,p:20,c:80,f:12},
      {time:"13:00",label:"Pranzo",items:"Riso 100g + Petto pollo 180g + Verdure",kcal:540,p:48,c:65,f:8},
      {time:"20:00",label:"Cena",items:"Salmone 200g + Patate dolci 150g",kcal:520,p:44,c:38,f:18},
    ],
  },
  C002: {
    "Lunedì": [
      {time:"08:00",label:"Colazione",items:"Uova 2 + Avocado + Pane integrale",kcal:440,p:32,c:28,f:22},
      {time:"12:30",label:"Pranzo",items:"Pollo 150g + Quinoa 80g + Insalata",kcal:420,p:38,c:42,f:10},
      {time:"19:30",label:"Cena",items:"Merluzzo 200g + Verdure + Farro 70g",kcal:380,p:40,c:32,f:6},
    ],
  },
};
const SEED_MEASUREMENTS = {
  C001: [
    {date:"2026-02-01",weight:78.0,bf:22.0,waist:88},
    {date:"2026-02-08",weight:77.4,bf:21.6,waist:87.3},
    {date:"2026-02-15",weight:77.0,bf:21.2,waist:86.8},
    {date:"2026-02-19",weight:76.5,bf:20.8,waist:86.0},
  ],
  C002: [
    {date:"2026-01-15",weight:58.0,bf:26.0,waist:72},
    {date:"2026-01-29",weight:57.2,bf:25.0,waist:71.0},
    {date:"2026-02-12",weight:56.9,bf:24.6,waist:70.5},
  ],
};

// ══════════════════════════════════════════════════
// 🔧 UTILS
// ══════════════════════════════════════════════════
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("it-IT",{day:"2-digit",month:"short"}); } catch { return d; } };
const calcAge = (dob) => Math.floor((Date.now()-new Date(dob))/(365.25*24*3600*1000));
const calcBMI = (w,h) => (w/((h/100)**2)).toFixed(1);
const bmiCat = (b) => {
  const n=parseFloat(b);
  if(n<18.5) return {label:"Sottopeso",color:"#60a5fa"};
  if(n<25)   return {label:"Normopeso",color:"#C8F135"};
  if(n<30)   return {label:"Sovrappeso",color:"#f59e0b"};
  return            {label:"Obeso",color:"#f87171"};
};
const progPct = (s,e) => {
  const now=Date.now(),st=new Date(s).getTime(),en=new Date(e).getTime();
  return Math.min(100,Math.max(0,Math.round(((now-st)/(en-st))*100)));
};
const genId = (clients) => {
  const nums=clients.map(c=>parseInt(c.id.slice(1))||0);
  return `C${String((nums.length?Math.max(...nums):0)+1).padStart(3,"0")}`;
};
const initials = (name) => name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

// ══════════════════════════════════════════════════
// 💅 CSS
// ══════════════════════════════════════════════════
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#080808;--card:#101010;--card2:#161616;--border:#1e1e1e;
  --lime:#C8F135;--ld:rgba(200,241,53,0.09);--lb:rgba(200,241,53,0.22);
  --text:#EFEFEF;--muted:#555;--dim:#333;
  --blue:#60a5fa;--amber:#f59e0b;--red:#f87171;
}
html,body,#root{height:100%;}
body{background:var(--bg);color:var(--text);font-family:'Syne',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
::-webkit-scrollbar{width:0;height:0;}

.shell{min-height:100dvh;max-width:440px;margin:0 auto;background:var(--bg);position:relative;padding-bottom:80px;}
.full{min-height:100dvh;max-width:440px;margin:0 auto;background:var(--bg);}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade{animation:fadeUp .25s ease;}

/* HEADER */
.hdr{padding:14px 20px 12px;position:sticky;top:0;z-index:100;
  background:rgba(8,8,8,.94);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);}
.hdr-brand{font-family:'Bebas Neue';font-size:22px;letter-spacing:2px;color:var(--lime);}
.hdr-sub{font-size:9px;text-transform:uppercase;letter-spacing:2.5px;color:var(--muted);}
.hdr-row{display:flex;justify-content:space-between;align-items:center;}

/* BOTTOM TABS */
.tabs{position:fixed;bottom:0;left:50%;transform:translateX(-50%);
  width:100%;max-width:440px;display:flex;
  background:rgba(8,8,8,.97);backdrop-filter:blur(20px);
  border-top:1px solid var(--border);z-index:200;padding:8px 0 max(14px,env(safe-area-inset-bottom));}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  cursor:pointer;transition:color .2s;color:var(--muted);padding:4px 0;}
.tab.on{color:var(--lime);}
.tab-ico{font-size:18px;line-height:1;}
.tab-lbl{font-size:8px;text-transform:uppercase;letter-spacing:1.5px;}

.sec{padding:16px 20px 24px;}

/* CARDS */
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px;}
.card-lime{border-color:var(--lb);}
.ctitle{font-size:9px;text-transform:uppercase;letter-spacing:2.5px;color:var(--muted);margin-bottom:12px;}

/* AVATAR */
.av{border-radius:12px;display:flex;align-items:center;justify-content:center;
  font-family:'Bebas Neue';letter-spacing:1px;color:#080808;flex-shrink:0;}

/* PILLS */
.pill-active{display:inline-flex;align-items:center;gap:6px;margin-top:8px;
  background:var(--ld);border:1px solid var(--lb);border-radius:20px;padding:3px 10px;font-size:10px;color:var(--lime);}
.dot{width:6px;height:6px;border-radius:50%;background:var(--lime);animation:pulse 1.8s ease infinite;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;
  border:none;border-radius:12px;cursor:pointer;font-family:'Syne',sans-serif;
  font-size:13px;font-weight:700;transition:all .15s;padding:10px 16px;}
.btn-lime{background:var(--lime);color:#080808;}
.btn-lime:hover{opacity:.88;}
.btn-ghost{background:transparent;border:1px solid var(--dim);color:var(--muted);}
.btn-ghost:hover{border-color:var(--muted);color:var(--text);}
.btn-red{background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.3);color:var(--red);}
.btn-red:hover{background:rgba(248,113,113,.2);}
.btn-sm{padding:6px 12px;font-size:11px;border-radius:10px;}
.btn-icon{width:30px;height:30px;border-radius:9px;padding:0;background:var(--card2);
  border:1px solid var(--border);color:var(--text);cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s;}
.btn-icon:hover{border-color:var(--muted);color:var(--lime);}

/* INPUTS */
.inp{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:10px;
  padding:10px 12px;color:var(--text);font-family:'Syne',sans-serif;font-size:13px;outline:none;transition:border-color .2s;}
.inp:focus{border-color:var(--lb);}
.inp-sm{padding:7px 10px;font-size:12px;border-radius:8px;}
.inp::placeholder{color:var(--dim);}
textarea.inp{resize:vertical;min-height:56px;line-height:1.5;}
.sel{width:100%;background:var(--card2);border:1px solid var(--border);border-radius:10px;
  padding:10px 12px;color:var(--text);font-family:'Syne',sans-serif;font-size:13px;outline:none;cursor:pointer;appearance:none;}
.lbl{font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;}
.field{margin-bottom:12px;}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.row4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;}

/* STATS */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.sbox{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px;}
.slbl{font-size:9px;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:5px;}
.sval{font-family:'Bebas Neue';font-size:30px;line-height:1;}
.sunit{font-size:10px;color:var(--muted);font-family:'JetBrains Mono';}
.sdelta{font-size:10px;margin-top:3px;font-family:'JetBrains Mono';}
.pos{color:var(--lime);} .neg{color:var(--red);}

/* PROGRESS BAR */
.pbar-wrap{margin-bottom:12px;}
.pbar-head{display:flex;justify-content:space-between;font-size:10px;color:var(--muted);margin-bottom:5px;}
.pbar-bg{height:5px;background:var(--card2);border-radius:5px;overflow:hidden;}
.pbar-fill{height:100%;background:linear-gradient(90deg,var(--lime),#a3e635);border-radius:5px;transition:width 1s ease;}

/* CLIENT LIST */
.ccard{background:var(--card);border:1px solid var(--border);border-radius:16px;
  padding:14px;margin-bottom:10px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:12px;}
.ccard:hover{border-color:var(--lb);transform:translateY(-1px);}
.ccard:active{transform:translateY(0);}
.cinfo{flex:1;min-width:0;}
.cname{font-size:15px;font-weight:700;margin-bottom:2px;}
.cprog{font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px;}

/* DAY TABS */
.dtabs{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px;}
.dtab{flex-shrink:0;padding:5px 12px;border-radius:20px;font-size:11px;cursor:pointer;
  border:1px solid var(--border);color:var(--muted);background:var(--card);white-space:nowrap;transition:all .2s;}
.dtab.on{background:var(--lime);color:#080808;border-color:var(--lime);font-weight:700;}

/* EXERCISE */
.excard{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px;margin-bottom:8px;}
.exname{font-size:14px;font-weight:700;margin-bottom:2px;}
.exmuscles{font-size:10px;color:var(--muted);margin-bottom:8px;}
.expills{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:4px;}
.expill{background:var(--card2);border:1px solid var(--border);border-radius:7px;
  padding:3px 8px;font-size:10px;color:var(--muted);font-family:'JetBrains Mono';display:flex;align-items:center;gap:3px;}
.expill strong{color:var(--text);font-weight:500;}
.exnote{font-size:10px;color:var(--lime);margin-top:4px;}

/* EDIT ROW */
.edit-row{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px;}

/* MEAL */
.mcard{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px;margin-bottom:8px;}
.mhdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;}
.mtime{font-family:'JetBrains Mono';font-size:10px;color:var(--lime);}
.mlbl{font-size:14px;font-weight:700;}
.mitems{font-size:11px;color:var(--muted);margin-bottom:8px;line-height:1.6;}
.macrow{display:flex;gap:5px;}
.mac{flex:1;text-align:center;background:var(--card2);border-radius:8px;padding:5px 3px;}
.macval{font-family:'JetBrains Mono';font-size:12px;font-weight:500;}
.maclbl{font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;}
.dtotal{background:var(--ld);border:1px solid var(--lb);border-radius:14px;padding:14px;margin-bottom:12px;}

/* SHARE */
.share-box{background:var(--ld);border:1px solid var(--lb);border-radius:14px;padding:16px;margin-bottom:12px;}
.share-code{font-family:'JetBrains Mono';font-size:12px;color:var(--text);background:var(--bg);
  padding:10px 12px;border-radius:10px;border:1px solid var(--border);word-break:break-all;margin-top:8px;line-height:1.7;}

/* INFO ROWS */
.irow{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;}
.irow:last-child{border-bottom:none;}
.ilbl{color:var(--muted);}
.ival{font-family:'JetBrains Mono';font-size:11px;}

/* LOGIN */
.login-wrap{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;background:var(--bg);}
.login-box{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:32px;width:100%;max-width:360px;}
.login-brand{font-family:'Bebas Neue';font-size:48px;letter-spacing:3px;color:var(--lime);text-align:center;margin-bottom:4px;}
.login-sub{font-size:10px;color:var(--muted);text-align:center;letter-spacing:2px;text-transform:uppercase;margin-bottom:28px;}
.login-err{font-size:12px;color:var(--red);text-align:center;margin-top:10px;}

/* BACK */
.back{display:flex;align-items:center;gap:6px;cursor:pointer;color:var(--muted);
  font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:0 20px 10px;transition:color .2s;}
.back:hover{color:var(--lime);}

/* MODAL */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:flex;align-items:flex-end;justify-content:center;}
.modal{background:var(--card);border-radius:24px 24px 0 0;border:1px solid var(--border);border-bottom:none;
  padding:24px 24px max(24px,env(safe-area-inset-bottom));width:100%;max-width:440px;
  max-height:90dvh;overflow-y:auto;animation:fadeUp .2s ease;}

/* METRIC TABS */
.mtabs{display:flex;gap:6px;margin-bottom:14px;overflow-x:auto;}
.mtab{flex-shrink:0;padding:5px 12px;border-radius:20px;font-size:11px;cursor:pointer;
  border:1px solid var(--border);color:var(--muted);background:var(--card);white-space:nowrap;transition:all .2s;}
.mtab.on{background:var(--card2);color:var(--text);border-color:var(--dim);}

/* LOADER */
.loader{display:flex;align-items:center;justify-content:center;min-height:60dvh;}
.spin{width:28px;height:28px;border:2px solid var(--border);border-top-color:var(--lime);border-radius:50%;animation:spin .8s linear infinite;}

/* EMPTY */
.empty{text-align:center;padding:48px 24px;color:var(--muted);}
.empty-ico{font-size:36px;margin-bottom:12px;}

/* SAVED INDICATOR */
.saved{font-size:10px;color:var(--lime);text-align:right;margin-bottom:8px;transition:opacity .3s;}

/* SUB TABS (coach client detail) */
.stabs{display:flex;border-bottom:1px solid var(--border);}
.stab{flex:1;padding:11px 4px;text-align:center;font-size:10px;cursor:pointer;
  color:var(--muted);border-bottom:2px solid transparent;transition:all .2s;letter-spacing:.5px;}
.stab.on{color:var(--lime);border-bottom-color:var(--lime);}
`;

// ══════════════════════════════════════════════════
// MINI COMPONENTS
// ══════════════════════════════════════════════════
function Loader() { return <div className="loader"><div className="spin"/></div>; }
function Field({label,children}) { return <div className="field"><div className="lbl">{label}</div>{children}</div>; }
function Empty({icon,text,action}) {
  return (
    <div className="empty">
      <div className="empty-ico">{icon}</div>
      <div style={{fontSize:13,lineHeight:1.6}}>{text}</div>
      {action && <div style={{marginTop:16}}>{action}</div>}
    </div>
  );
}
function Saved({show}) {
  return <div className="saved" style={{opacity:show?1:0}}>💾 Salvato</div>;
}

// ══════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════
function Login({onLogin}) {
  const [pw,setPw]=useState("");
  const [err,setErr]=useState(false);
  const go=()=>{
    if(pw===COACH_PASSWORD){lsSet(SK.coachSession,true);onLogin();}
    else{setErr(true);setTimeout(()=>setErr(false),2000);}
  };
  return (
    <div className="login-wrap">
      <div className="login-box fade">
        <div className="login-brand">{BRAND}</div>
        <div className="login-sub">Accesso Coach</div>
        <Field label="Password">
          <input className="inp" type="password" placeholder="••••••••" value={pw}
            onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} autoFocus/>
        </Field>
        <button className="btn btn-lime" style={{width:"100%",padding:"13px",fontSize:15}} onClick={go}>ACCEDI →</button>
        {err && <div className="login-err">Password errata</div>}
        <div style={{fontSize:11,color:"var(--muted)",textAlign:"center",marginTop:20,lineHeight:1.6}}>
          Password demo: <span style={{fontFamily:"'JetBrains Mono'",color:"var(--text)"}}>coach123</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// CLIENT MODAL
// ══════════════════════════════════════════════════
function ClientModal({client,clients,onSave,onClose}) {
  const isNew=!client;
  const [form,setForm]=useState(client||{
    name:"",email:"",dob:"",sex:"M",height:170,weight:70,
    goal:"Dimagrimento",program:"",
    start:new Date().toISOString().slice(0,10),end:"",status:"active",
  });
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=()=>{
    if(!form.name.trim()||!form.program.trim()) return;
    const id=isNew?genId(clients):client.id;
    const color=isNew?COLORS[clients.length%COLORS.length]:client.color;
    onSave({...form,id,color,avatar:initials(form.name),height:Number(form.height),weight:Number(form.weight)});
  };
  return (
    <div className="overlay" onClick={e=>e.target.className==="overlay"&&onClose()}>
      <div className="modal">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Bebas Neue'",fontSize:22,letterSpacing:2}}>{isNew?"NUOVO CLIENTE":"MODIFICA"}</div>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="row2">
          <Field label="Nome *"><input className="inp" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Nome Cognome"/></Field>
          <Field label="Email"><input className="inp" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@..."/></Field>
        </div>
        <div className="row2">
          <Field label="Data di nascita"><input className="inp" type="date" value={form.dob} onChange={e=>set("dob",e.target.value)}/></Field>
          <Field label="Sesso">
            <select className="sel" value={form.sex} onChange={e=>set("sex",e.target.value)}>
              <option value="M">Maschio</option><option value="F">Femmina</option>
            </select>
          </Field>
        </div>
        <div className="row2">
          <Field label="Altezza (cm)"><input className="inp" type="number" value={form.height} onChange={e=>set("height",e.target.value)}/></Field>
          <Field label="Peso (kg)"><input className="inp" type="number" value={form.weight} onChange={e=>set("weight",e.target.value)}/></Field>
        </div>
        <Field label="Obiettivo">
          <select className="sel" value={form.goal} onChange={e=>set("goal",e.target.value)}>
            {["Dimagrimento","Tonificazione","Massa muscolare","Resistenza","Forza","Benessere generale"].map(g=><option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Nome programma *"><input className="inp" value={form.program} onChange={e=>set("program",e.target.value)} placeholder="es. Forza 8 settimane"/></Field>
        <div className="row2">
          <Field label="Inizio"><input className="inp" type="date" value={form.start} onChange={e=>set("start",e.target.value)}/></Field>
          <Field label="Fine"><input className="inp" type="date" value={form.end} onChange={e=>set("end",e.target.value)}/></Field>
        </div>
        <Field label="Stato">
          <select className="sel" value={form.status} onChange={e=>set("status",e.target.value)}>
            <option value="active">Attivo</option>
            <option value="paused">In pausa</option>
            <option value="completed">Completato</option>
          </select>
        </Field>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Annulla</button>
          <button className="btn btn-lime" style={{flex:2}} onClick={save}>{isNew?"CREA":"SALVA"}</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// WORKOUT EDITOR
// ══════════════════════════════════════════════════
function WorkoutEditor({clientId}) {
  const [data,setData]=useState(null);
  const [activeDay,setActiveDay]=useState("");
  const [newDay,setNewDay]=useState("");
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    const d=lsGet(SK.workouts(clientId))||{};
    setData(d);
    const days=Object.keys(d);
    setActiveDay(days[0]||"");
  },[clientId]);

  const persist=(d)=>{lsSet(SK.workouts(clientId),d);setSaved(true);setTimeout(()=>setSaved(false),1500);};

  const addDay=()=>{
    if(!newDay||data[newDay]) return;
    const u={...data,[newDay]:[]};
    setData(u);setActiveDay(newDay);setNewDay("");persist(u);
  };
  const removeDay=()=>{
    const u={...data};delete u[activeDay];
    const days=Object.keys(u);setData(u);setActiveDay(days[0]||"");persist(u);
  };
  const addEx=()=>{
    const u={...data,[activeDay]:[...(data[activeDay]||[]),{name:"",sets:3,reps:"10-12",load:"",rest:"60s",muscles:"",note:""}]};
    setData(u);persist(u);
  };
  const updateEx=(i,k,v)=>{
    const exs=[...(data[activeDay]||[])];exs[i]={...exs[i],[k]:v};
    const u={...data,[activeDay]:exs};setData(u);persist(u);
  };
  const removeEx=(i)=>{
    const exs=[...(data[activeDay]||[])].filter((_,idx)=>idx!==i);
    const u={...data,[activeDay]:exs};setData(u);persist(u);
  };

  if(!data) return <Loader/>;
  const days=Object.keys(data);
  const exercises=activeDay?(data[activeDay]||[]):[];

  return (
    <div className="sec fade">
      <div className="dtabs">
        {days.map(d=><div key={d} className={`dtab${activeDay===d?" on":""}`} onClick={()=>setActiveDay(d)}>{d}</div>)}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <select className="sel" style={{flex:1,padding:"7px 10px",fontSize:12}} value={newDay} onChange={e=>setNewDay(e.target.value)}>
          <option value="">+ Aggiungi giorno</option>
          {DAYS_OPTIONS.filter(d=>!days.includes(d)).map(d=><option key={d}>{d}</option>)}
        </select>
        <button className="btn btn-lime btn-sm" onClick={addDay} disabled={!newDay}>OK</button>
        {activeDay&&<button className="btn btn-red btn-sm" onClick={removeDay}>✕</button>}
      </div>
      <Saved show={saved}/>
      {!activeDay ? (
        <Empty icon="📅" text="Seleziona o aggiungi un giorno di allenamento"/>
      ) : (
        <>
          {exercises.map((ex,i)=>(
            <div key={i} className="edit-row">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono'"}}>#{String(i+1).padStart(2,"0")}</span>
                <button className="btn-icon" onClick={()=>removeEx(i)}>✕</button>
              </div>
              <div className="row2" style={{marginBottom:8}}>
                <Field label="Esercizio"><input className="inp inp-sm" value={ex.name} onChange={e=>updateEx(i,"name",e.target.value)} placeholder="es. Back Squat"/></Field>
                <Field label="Muscoli"><input className="inp inp-sm" value={ex.muscles} onChange={e=>updateEx(i,"muscles",e.target.value)} placeholder="Quadricipiti"/></Field>
              </div>
              <div className="row3" style={{marginBottom:8}}>
                <Field label="Serie"><input className="inp inp-sm" type="number" value={ex.sets} onChange={e=>updateEx(i,"sets",Number(e.target.value))}/></Field>
                <Field label="Reps"><input className="inp inp-sm" value={ex.reps} onChange={e=>updateEx(i,"reps",e.target.value)} placeholder="8-10"/></Field>
                <Field label="Carico"><input className="inp inp-sm" value={ex.load} onChange={e=>updateEx(i,"load",e.target.value)} placeholder="70kg"/></Field>
              </div>
              <div className="row2">
                <Field label="Recupero"><input className="inp inp-sm" value={ex.rest} onChange={e=>updateEx(i,"rest",e.target.value)} placeholder="90s"/></Field>
                <Field label="Note"><input className="inp inp-sm" value={ex.note} onChange={e=>updateEx(i,"note",e.target.value)} placeholder="..."/></Field>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" style={{width:"100%"}} onClick={addEx}>+ Aggiungi esercizio</button>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// MEAL EDITOR
// ══════════════════════════════════════════════════
function MealEditor({clientId}) {
  const [data,setData]=useState(null);
  const [activeDay,setActiveDay]=useState("");
  const [newDay,setNewDay]=useState("");
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    const d=lsGet(SK.meals(clientId))||{};
    setData(d);
    setActiveDay(Object.keys(d)[0]||"");
  },[clientId]);

  const persist=(d)=>{lsSet(SK.meals(clientId),d);setSaved(true);setTimeout(()=>setSaved(false),1500);};
  const addDay=()=>{if(!newDay||data[newDay])return;const u={...data,[newDay]:[]};setData(u);setActiveDay(newDay);setNewDay("");persist(u);};
  const removeDay=()=>{const u={...data};delete u[activeDay];const days=Object.keys(u);setData(u);setActiveDay(days[0]||"");persist(u);};
  const addMeal=()=>{const u={...data,[activeDay]:[...(data[activeDay]||[]),{time:"12:00",label:"Pasto",items:"",kcal:0,p:0,c:0,f:0}]};setData(u);persist(u);};
  const upd=(i,k,v)=>{const ms=[...(data[activeDay]||[])];ms[i]={...ms[i],[k]:v};const u={...data,[activeDay]:ms};setData(u);persist(u);};
  const rem=(i)=>{const ms=[...(data[activeDay]||[])].filter((_,idx)=>idx!==i);const u={...data,[activeDay]:ms};setData(u);persist(u);};

  if(!data) return <Loader/>;
  const days=Object.keys(data);
  const meals=activeDay?(data[activeDay]||[]):[];
  const tot=meals.reduce((a,m)=>({kcal:a.kcal+Number(m.kcal),p:a.p+Number(m.p),c:a.c+Number(m.c),f:a.f+Number(m.f)}),{kcal:0,p:0,c:0,f:0});

  return (
    <div className="sec fade">
      <div className="dtabs">
        {days.map(d=><div key={d} className={`dtab${activeDay===d?" on":""}`} onClick={()=>setActiveDay(d)}>{d}</div>)}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <select className="sel" style={{flex:1,padding:"7px 10px",fontSize:12}} value={newDay} onChange={e=>setNewDay(e.target.value)}>
          <option value="">+ Aggiungi giorno</option>
          {DAYS_OPTIONS.filter(d=>!days.includes(d)).map(d=><option key={d}>{d}</option>)}
        </select>
        <button className="btn btn-lime btn-sm" onClick={addDay} disabled={!newDay}>OK</button>
        {activeDay&&<button className="btn btn-red btn-sm" onClick={removeDay}>✕</button>}
      </div>
      <Saved show={saved}/>
      {!activeDay ? <Empty icon="🥗" text="Aggiungi un giorno per strutturare la dieta"/> : (
        <>
          {meals.length>0&&(
            <div className="dtotal">
              <div style={{fontSize:9,color:"var(--lime)",textTransform:"uppercase",letterSpacing:2.5,marginBottom:10}}>Totale giornaliero</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                {[["kcal",tot.kcal,"var(--lime)"],["Prot",`${tot.p}g`,"var(--blue)"],["Carb",`${tot.c}g`,"var(--amber)"],["Gras",`${tot.f}g`,"var(--red)"]].map(([l,v,c])=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'JetBrains Mono'",fontSize:15,color:c}}>{v}</div>
                    <div style={{fontSize:8,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {meals.map((m,i)=>(
            <div key={i} className="edit-row">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontFamily:"'JetBrains Mono'",fontSize:10,color:"var(--lime)"}}>{m.time} — {m.label}</span>
                <button className="btn-icon" onClick={()=>rem(i)}>✕</button>
              </div>
              <div className="row2" style={{marginBottom:8}}>
                <Field label="Orario"><input className="inp inp-sm" type="time" value={m.time} onChange={e=>upd(i,"time",e.target.value)}/></Field>
                <Field label="Nome pasto"><input className="inp inp-sm" value={m.label} onChange={e=>upd(i,"label",e.target.value)} placeholder="Colazione"/></Field>
              </div>
              <Field label="Alimenti"><textarea className="inp inp-sm" value={m.items} onChange={e=>upd(i,"items",e.target.value)} placeholder="es. Avena 80g + Latte 200ml"/></Field>
              <div className="row4">
                {[["kcal","Kcal"],["p","Prot g"],["c","Carb g"],["f","Gras g"]].map(([k,l])=>(
                  <Field key={k} label={l}><input className="inp inp-sm" type="number" value={m[k]} onChange={e=>upd(i,k,Number(e.target.value))}/></Field>
                ))}
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" style={{width:"100%"}} onClick={addMeal}>+ Aggiungi pasto</button>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// MEASUREMENTS EDITOR
// ══════════════════════════════════════════════════
function MeasurementsEditor({clientId}) {
  const [data,setData]=useState(null);
  const [form,setForm]=useState({date:new Date().toISOString().slice(0,10),weight:"",bf:"",waist:""});
  const [saved,setSaved]=useState(false);

  useEffect(()=>{setData(lsGet(SK.measurements(clientId))||[]);},[clientId]);

  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const add=()=>{
    if(!form.weight) return;
    const updated=[...(data||[]),{...form,weight:Number(form.weight),bf:Number(form.bf)||null,waist:Number(form.waist)||null}];
    updated.sort((a,b)=>a.date.localeCompare(b.date));
    lsSet(SK.measurements(clientId),updated);
    setData(updated);setSaved(true);setTimeout(()=>setSaved(false),1500);
    setForm({date:new Date().toISOString().slice(0,10),weight:"",bf:"",waist:""});
  };
  const del=(i)=>{
    const updated=data.filter((_,idx)=>idx!==i);
    lsSet(SK.measurements(clientId),updated);setData(updated);
  };

  if(!data) return <Loader/>;
  const chartData=data.map(m=>({...m,date:fmtDate(m.date)}));

  return (
    <div className="sec fade">
      <div className="card card-lime">
        <div className="ctitle">Aggiungi misurazione</div>
        <div className="row2" style={{marginBottom:8}}>
          <Field label="Data"><input className="inp inp-sm" type="date" value={form.date} onChange={e=>setF("date",e.target.value)}/></Field>
          <Field label="Peso kg *"><input className="inp inp-sm" type="number" step="0.1" value={form.weight} onChange={e=>setF("weight",e.target.value)} placeholder="78.5"/></Field>
        </div>
        <div className="row2" style={{marginBottom:14}}>
          <Field label="Grasso % (opz.)"><input className="inp inp-sm" type="number" step="0.1" value={form.bf} onChange={e=>setF("bf",e.target.value)} placeholder="22.0"/></Field>
          <Field label="Vita cm (opz.)"><input className="inp inp-sm" type="number" step="0.1" value={form.waist} onChange={e=>setF("waist",e.target.value)} placeholder="88"/></Field>
        </div>
        <button className="btn btn-lime" style={{width:"100%"}} onClick={add}>+ Registra</button>
        <Saved show={saved}/>
      </div>
      {data.length>1&&(
        <div className="card" style={{marginBottom:12}}>
          <div className="ctitle">Andamento peso</div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={chartData} margin={{top:4,right:4,bottom:0,left:-24}}>
              <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C8F135" stopOpacity={0.3}/><stop offset="100%" stopColor="#C8F135" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
              <XAxis dataKey="date" tick={{fill:"#444",fontSize:9}}/>
              <YAxis domain={["dataMin - 0.5","dataMax + 0.5"]} tick={{fill:"#444",fontSize:9}}/>
              <Tooltip contentStyle={{background:"#111",border:"1px solid #222",borderRadius:8,fontSize:11}}/>
              <Area type="monotone" dataKey="weight" stroke="#C8F135" strokeWidth={2} fill="url(#mg)" dot={{fill:"#C8F135",r:3,strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {[...data].reverse().map((m,i)=>(
        <div key={i} className="card" style={{padding:"10px 14px",marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono'",marginBottom:3}}>{fmtDate(m.date)}</div>
              <div style={{fontFamily:"'JetBrains Mono'",fontSize:13}}>
                <span style={{color:"var(--lime)"}}>{m.weight}kg</span>
                {m.bf&&<span style={{color:"var(--blue)",marginLeft:10}}>{m.bf}%</span>}
                {m.waist&&<span style={{color:"var(--amber)",marginLeft:10}}>{m.waist}cm</span>}
              </div>
            </div>
            <button className="btn-icon" style={{fontSize:12}} onClick={()=>del(data.length-1-i)}>✕</button>
          </div>
        </div>
      ))}
      {data.length===0&&<Empty icon="📏" text="Aggiungi la prima misurazione sopra"/>}
    </div>
  );
}

// ══════════════════════════════════════════════════
// COACH — DETAIL VIEW
// ══════════════════════════════════════════════════
function CoachClientDetail({client,clients,onBack,onEdit,onDelete}) {
  const [tab,setTab]=useState("workout");
  const appUrl = `${window.location.origin}${window.location.pathname}?c=${client.id}`;
  const [copied,setCopied]=useState(false);
  const copy=()=>{
    navigator.clipboard.writeText(appUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}).catch(()=>{});
  };
  const STABS=[{id:"workout",l:"🏋️ Workout"},{id:"nutrition",l:"🥗 Dieta"},{id:"measurements",l:"📏 Misure"},{id:"share",l:"🔗 Link"}];
  return (
    <div className="shell">
      <div className="hdr">
        <div className="back" onClick={onBack}>← Tutti i clienti</div>
        <div className="hdr-row">
          <div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:24,letterSpacing:2,lineHeight:1}}>{client.name}</div>
            <div className="hdr-sub">{client.program}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button className="btn btn-ghost btn-sm" onClick={onEdit}>✏️</button>
            <div className="av" style={{width:38,height:38,background:client.color,fontSize:13}}>{client.avatar}</div>
          </div>
        </div>
        {client.status==="active"&&<div className="pill-active"><span className="dot"/>{progPct(client.start,client.end)}% completato</div>}
      </div>
      <div className="stabs">
        {STABS.map(t=><div key={t.id} className={`stab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.l}</div>)}
      </div>
      {tab==="workout"&&<WorkoutEditor clientId={client.id}/>}
      {tab==="nutrition"&&<MealEditor clientId={client.id}/>}
      {tab==="measurements"&&<MeasurementsEditor clientId={client.id}/>}
      {tab==="share"&&(
        <div className="sec fade">
          <div className="share-box">
            <div style={{fontSize:9,color:"var(--lime)",textTransform:"uppercase",letterSpacing:2.5}}>Link per {client.name}</div>
            <div style={{fontSize:12,color:"var(--muted)",marginTop:6,marginBottom:4,lineHeight:1.6}}>
              Manda questo link su WhatsApp. Il cliente vede solo i suoi dati.
            </div>
            <div className="share-code">{appUrl}</div>
            <button className="btn btn-lime" style={{width:"100%",marginTop:12}} onClick={copy}>
              {copied?"✅ Copiato!":"📋 Copia link"}
            </button>
          </div>
          <div className="card">
            <div className="ctitle">Scheda anagrafica</div>
            {[
              ["ID", client.id],
              ["Email", client.email||"—"],
              ["Età", client.dob?`${calcAge(client.dob)} anni`:"—"],
              ["Sesso", client.sex==="M"?"Maschio":"Femmina"],
              ["Altezza", `${client.height} cm`],
              ["Peso iniziale", `${client.weight} kg`],
              ["BMI", `${calcBMI(client.weight,client.height)} — ${bmiCat(calcBMI(client.weight,client.height)).label}`],
              ["Obiettivo", client.goal],
              ["Inizio", fmtDate(client.start)],
              ["Fine", client.end?fmtDate(client.end):"—"],
              ["Stato", client.status],
            ].map(([l,v])=>(
              <div key={l} className="irow"><span className="ilbl">{l}</span><span className="ival">{v}</span></div>
            ))}
          </div>
          <button className="btn btn-red" style={{width:"100%",marginTop:4}} onClick={()=>{if(window.confirm(`Eliminare ${client.name}?`))onDelete(client.id);}}>
            🗑 Elimina cliente
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// COACH — HOME (lista clienti)
// ══════════════════════════════════════════════════
function CoachHome({clients,onSelect,onAdd,onLogout}) {
  const active=clients.filter(c=>c.status==="active");
  const others=clients.filter(c=>c.status!=="active");
  return (
    <div style={{minHeight:"100dvh",background:"var(--bg)",paddingBottom:40}}>
      <div className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-brand">{BRAND}</div>
            <div className="hdr-sub">Dashboard Coach</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-lime btn-sm" onClick={onAdd}>+ Nuovo</button>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Esci</button>
          </div>
        </div>
      </div>
      <div style={{padding:"16px 20px"}}>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[{v:clients.length,l:"Totali",c:"var(--text)"},{v:active.length,l:"Attivi",c:"var(--lime)"},{v:others.length,l:"Archiviati",c:"var(--muted)"}].map((s,i)=>(
            <div key={i} style={{flex:1,background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontFamily:"'Bebas Neue'",fontSize:30,color:s.c,lineHeight:1}}>{s.v}</div>
              <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:1.5,color:"var(--muted)",marginTop:3}}>{s.l}</div>
            </div>
          ))}
        </div>
        {active.length>0&&<>
          <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:2.5,color:"var(--muted)",marginBottom:10}}>Attivi</div>
          {active.map(c=>{
            const pct=progPct(c.start,c.end);
            const ms=lsGet(SK.measurements(c.id))||[];
            const wDelta=ms.length>=2?(ms[ms.length-1].weight-ms[0].weight).toFixed(1):null;
            return (
              <div key={c.id} className="ccard" onClick={()=>onSelect(c)}>
                <div className="av" style={{width:44,height:44,background:c.color,fontSize:15}}>{c.avatar}</div>
                <div className="cinfo">
                  <div className="cname">{c.name}</div>
                  <div className="cprog">{c.program}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div className="pbar-bg" style={{flex:1}}><div className="pbar-fill" style={{width:`${pct}%`}}/></div>
                    <span style={{fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono'",flexShrink:0}}>{pct}%</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                  {wDelta!==null&&<span style={{fontSize:11,fontFamily:"'JetBrains Mono'",color:parseFloat(wDelta)<0?"var(--lime)":"var(--red)"}}>{wDelta}kg</span>}
                  <span style={{color:"var(--muted)",fontSize:18}}>›</span>
                </div>
              </div>
            );
          })}
        </>}
        {others.length>0&&<>
          <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:2.5,color:"var(--muted)",margin:"20px 0 10px"}}>Archiviati / Pausa</div>
          {others.map(c=>(
            <div key={c.id} className="ccard" onClick={()=>onSelect(c)} style={{opacity:.55}}>
              <div className="av" style={{width:40,height:40,background:c.color,fontSize:13}}>{c.avatar}</div>
              <div className="cinfo"><div className="cname">{c.name}</div><div className="cprog">{c.program}</div></div>
              <span style={{color:"var(--muted)",fontSize:18}}>›</span>
            </div>
          ))}
        </>}
        {clients.length===0&&<Empty icon="👥" text="Nessun cliente ancora. Crea il primo!" action={<button className="btn btn-lime" onClick={onAdd}>+ Nuovo cliente</button>}/>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// CLIENT VIEW (read-only)
// ══════════════════════════════════════════════════
const CLIENT_TABS=[
  {id:"home",icon:"⚡",lbl:"Home"},
  {id:"workout",icon:"🏋️",lbl:"Training"},
  {id:"nutrition",icon:"🥗",lbl:"Dieta"},
  {id:"progress",icon:"📈",lbl:"Progressi"},
];

function ClientView({clientId}) {
  const [client,setClient]=useState(null);
  const [workouts,setWorkouts]=useState({});
  const [meals,setMeals]=useState({});
  const [ms,setMs]=useState([]);
  const [tab,setTab]=useState("home");

  useEffect(()=>{
    const clients=lsGet(SK.clients)||[];
    const c=clients.find(x=>x.id===clientId);
    if(!c) return;
    setClient(c);
    setWorkouts(lsGet(SK.workouts(clientId))||{});
    setMeals(lsGet(SK.meals(clientId))||{});
    setMs(lsGet(SK.measurements(clientId))||[]);
  },[clientId]);

  if(!client) return (
    <div style={{minHeight:"100dvh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",padding:24}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>❌</div>
        <div style={{fontFamily:"'Bebas Neue'",fontSize:22,color:"var(--muted)"}}>Link non valido</div>
        <div style={{fontSize:12,color:"var(--muted)",marginTop:8}}>Contatta il tuo coach per il link corretto</div>
      </div>
    </div>
  );

  const bmi=calcBMI(client.weight,client.height);
  const cat=bmiCat(bmi);
  const latest=ms.length?ms[ms.length-1]:null;
  const first=ms.length?ms[0]:null;
  const wDelta=latest&&first?(latest.weight-first.weight).toFixed(1):null;
  const days_w=Object.keys(workouts);
  const days_m=Object.keys(meals);

  return (
    <div className="shell">
      <div className="hdr">
        <div className="hdr-row">
          <div>
            <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:2.5,color:"var(--muted)",marginBottom:2}}>{BRAND}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:26,letterSpacing:2,lineHeight:1}}>{client.name}</div>
          </div>
          <div className="av" style={{width:42,height:42,background:client.color,fontSize:14}}>{client.avatar}</div>
        </div>
        {client.status==="active"&&<div className="pill-active"><span className="dot"/>{client.program} · {progPct(client.start,client.end)}%</div>}
      </div>

      <div key={tab} className="fade">
        {/* HOME */}
        {tab==="home"&&(
          <div className="sec">
            {client.status==="active"&&(
              <div className="pbar-wrap">
                <div className="pbar-head"><span>Completamento programma</span><span>{progPct(client.start,client.end)}%</span></div>
                <div className="pbar-bg"><div className="pbar-fill" style={{width:`${progPct(client.start,client.end)}%`}}/></div>
              </div>
            )}
            {latest?(
              <>
                <div className="grid2">
                  <div className="sbox"><div className="slbl">Peso</div><div><span className="sval">{latest.weight}</span><span className="sunit">kg</span></div>{wDelta&&<div className={`sdelta ${parseFloat(wDelta)<0?"pos":"neg"}`}>{wDelta}kg</div>}</div>
                  {latest.bf&&<div className="sbox"><div className="slbl">Grasso</div><div><span className="sval">{latest.bf}</span><span className="sunit">%</span></div></div>}
                  <div className="sbox"><div className="slbl">BMI</div><div><span className="sval" style={{color:cat.color,fontSize:26}}>{bmi}</span></div><div className="sdelta" style={{color:cat.color}}>{cat.label}</div></div>
                  {latest.waist&&<div className="sbox"><div className="slbl">Vita</div><div><span className="sval">{latest.waist}</span><span className="sunit">cm</span></div></div>}
                </div>
                {ms.length>1&&(
                  <div className="card card-lime">
                    <div className="ctitle">Andamento peso</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={ms.map(m=>({...m,date:fmtDate(m.date)}))} margin={{top:4,right:4,bottom:0,left:-24}}>
                        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={client.color} stopOpacity={0.3}/><stop offset="100%" stopColor={client.color} stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
                        <XAxis dataKey="date" tick={{fill:"#444",fontSize:9}}/>
                        <YAxis domain={["dataMin - 0.5","dataMax + 0.5"]} tick={{fill:"#444",fontSize:9}}/>
                        <Tooltip contentStyle={{background:"#111",border:"1px solid #222",borderRadius:8,fontSize:11}}/>
                        <Area type="monotone" dataKey="weight" stroke={client.color} strokeWidth={2.5} fill="url(#cg)" dot={{fill:client.color,r:3,strokeWidth:0}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ):<Empty icon="📊" text="Il tuo coach aggiungerà le misurazioni qui"/>}
            <div className="card">
              <div className="ctitle">La tua scheda</div>
              {[["Obiettivo",client.goal],["Programma",client.program],["Altezza",`${client.height}cm`],["Inizio",fmtDate(client.start)],client.end&&["Fine",fmtDate(client.end)]].filter(Boolean).map(([l,v])=>(
                <div key={l} className="irow"><span className="ilbl">{l}</span><span className="ival">{v}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* WORKOUT */}
        {tab==="workout"&&(
          <div className="sec">
            {days_w.length===0?<Empty icon="🏋️" text="Il tuo coach sta preparando il piano di allenamento"/>:(()=>{
              const [aDay,setADay]=useState(days_w[0]);
              const exs=workouts[aDay]||[];
              return (<>
                <div className="dtabs">{days_w.map(d=><div key={d} className={`dtab${aDay===d?" on":""}`} onClick={()=>setADay(d)}>{d}</div>)}</div>
                {exs.map((ex,i)=>(
                  <div key={i} className="excard">
                    <div style={{display:"flex",gap:10}}>
                      <div style={{fontFamily:"'Bebas Neue'",fontSize:26,color:"var(--dim)",lineHeight:1,minWidth:26}}>{String(i+1).padStart(2,"0")}</div>
                      <div style={{flex:1}}>
                        <div className="exname">{ex.name}</div>
                        {ex.muscles&&<div className="exmuscles">{ex.muscles}</div>}
                        <div className="expills">
                          {[["Serie",ex.sets],["Reps",ex.reps],ex.load&&["Carico",ex.load],ex.rest&&["Rec",ex.rest]].filter(Boolean).map(([l,v])=>(
                            <div key={l} className="expill"><span>{l}</span><strong>{v}</strong></div>
                          ))}
                        </div>
                        {ex.note&&<div className="exnote">↗ {ex.note}</div>}
                      </div>
                    </div>
                  </div>
                ))}
                {exs.length===0&&<Empty icon="💪" text="Nessun esercizio per questo giorno ancora"/>}
              </>);
            })()}
          </div>
        )}

        {/* NUTRITION */}
        {tab==="nutrition"&&(
          <div className="sec">
            {days_m.length===0?<Empty icon="🥗" text="Il tuo coach sta preparando il piano alimentare"/>:(()=>{
              const [aDay,setADay]=useState(days_m[0]);
              const ms2=meals[aDay]||[];
              const tot=ms2.reduce((a,m)=>({kcal:a.kcal+Number(m.kcal),p:a.p+Number(m.p),c:a.c+Number(m.c),f:a.f+Number(m.f)}),{kcal:0,p:0,c:0,f:0});
              return (<>
                <div className="dtabs">{days_m.map(d=><div key={d} className={`dtab${aDay===d?" on":""}`} onClick={()=>setADay(d)}>{d}</div>)}</div>
                <div className="dtotal">
                  <div style={{fontSize:9,color:"var(--lime)",textTransform:"uppercase",letterSpacing:2.5,marginBottom:10}}>Totale giornaliero</div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    {[["kcal",tot.kcal,"var(--lime)"],["Prot",`${tot.p}g`,"var(--blue)"],["Carb",`${tot.c}g`,"var(--amber)"],["Gras",`${tot.f}g`,"var(--red)"]].map(([l,v,c])=>(
                      <div key={l} style={{textAlign:"center"}}>
                        <div style={{fontFamily:"'JetBrains Mono'",fontSize:15,color:c}}>{v}</div>
                        <div style={{fontSize:8,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1}}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {ms2.map((m,i)=>(
                  <div key={i} className="mcard">
                    <div className="mhdr">
                      <div><div className="mtime">{m.time}</div><div className="mlbl">{m.label}</div></div>
                      <div style={{fontFamily:"'JetBrains Mono'",fontSize:14,color:"var(--lime)"}}>{m.kcal} kcal</div>
                    </div>
                    <div className="mitems">{m.items}</div>
                    <div className="macrow">
                      {[["Prot",`${m.p}g`,"var(--blue)"],["Carb",`${m.c}g`,"var(--amber)"],["Gras",`${m.f}g`,"var(--red)"]].map(([l,v,c])=>(
                        <div key={l} className="mac"><div className="macval" style={{color:c}}>{v}</div><div className="maclbl">{l}</div></div>
                      ))}
                    </div>
                  </div>
                ))}
              </>);
            })()}
          </div>
        )}

        {/* PROGRESS */}
        {tab==="progress"&&(
          <div className="sec">
            {ms.length===0?<Empty icon="📈" text="I progressi appariranno dopo la prima misurazione"/>:(()=>{
              const METRICS=[{key:"weight",label:"Peso",unit:"kg",color:client.color},{key:"bf",label:"Grasso %",unit:"%",color:"#60a5fa"},{key:"waist",label:"Vita",unit:"cm",color:"#f59e0b"}].filter(m=>ms.some(x=>x[m.key]!=null));
              const [am,setAm]=useState(METRICS[0]);
              const lv=ms[ms.length-1][am.key];
              const fv=ms[0][am.key];
              const delta=lv!=null&&fv!=null?(lv-fv).toFixed(1):null;
              const chartMs=ms.filter(m=>m[am.key]!=null).map(m=>({...m,date:fmtDate(m.date)}));
              return (<>
                <div className="mtabs">{METRICS.map(m=><div key={m.key} className={`mtab${am.key===m.key?" on":""}`} onClick={()=>setAm(m)}>{m.label}</div>)}</div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2.5,marginBottom:4}}>Valore attuale</div>
                  <div style={{fontFamily:"'Bebas Neue'",fontSize:52,color:am.color,lineHeight:1}}>{lv} <span style={{fontSize:18,color:"var(--muted)"}}>{am.unit}</span></div>
                  {delta&&<div style={{fontSize:11,color:"var(--muted)",marginTop:4,fontFamily:"'JetBrains Mono'"}}>Dall'inizio: <span style={{color:parseFloat(delta)<0?"var(--lime)":"var(--red)"}}>{delta}{am.unit}</span></div>}
                </div>
                {chartMs.length>1&&(
                  <div className="card card-lime">
                    <div className="ctitle">Andamento {am.label}</div>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chartMs} margin={{top:4,right:4,bottom:0,left:-24}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a"/>
                        <XAxis dataKey="date" tick={{fill:"#444",fontSize:9}}/>
                        <YAxis domain={["dataMin - 1","dataMax + 1"]} tick={{fill:"#444",fontSize:9}}/>
                        <Tooltip contentStyle={{background:"#111",border:"1px solid #222",borderRadius:8,fontSize:11}}/>
                        <Line type="monotone" dataKey={am.key} stroke={am.color} strokeWidth={2.5} dot={{fill:am.color,r:4,strokeWidth:0}}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="card">
                  <div className="ctitle">Storico</div>
                  {[...ms].reverse().map((m,i)=>(
                    <div key={i} className="irow">
                      <span className="ilbl" style={{fontFamily:"'JetBrains Mono'",fontSize:10}}>{fmtDate(m.date)}</span>
                      <span style={{fontFamily:"'JetBrains Mono'",fontSize:11}}>
                        {m.weight}kg{m.bf&&<span style={{color:"var(--blue)",marginLeft:8}}>{m.bf}%</span>}{m.waist&&<span style={{color:"var(--amber)",marginLeft:8}}>{m.waist}cm</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </>);
            })()}
          </div>
        )}
      </div>

      <div className="tabs">
        {CLIENT_TABS.map(t=>(
          <div key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>
            <span className="tab-ico">{t.icon}</span>
            <span className="tab-lbl">{t.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════
export default function App() {
  const [mode,setMode]=useState("init");
  const [clients,setClients]=useState([]);
  const [selected,setSelected]=useState(null);
  const [editing,setEditing]=useState(null);
  const [showModal,setShowModal]=useState(false);

  useEffect(()=>{
    // Legge URL param reale
    const param=new URLSearchParams(window.location.search).get("c");
    if(param){setMode("client:"+param);return;}

    // Controlla sessione coach
    const session=lsGet(SK.coachSession);
    const saved=lsGet(SK.clients);
    if(saved&&saved.length>0){
      setClients(saved);
    } else {
      // Seed dati demo
      lsSet(SK.clients,SEED_CLIENTS);
      Object.entries(SEED_WORKOUTS).forEach(([id,d])=>lsSet(SK.workouts(id),d));
      Object.entries(SEED_MEALS).forEach(([id,d])=>lsSet(SK.meals(id),d));
      Object.entries(SEED_MEASUREMENTS).forEach(([id,d])=>lsSet(SK.measurements(id),d));
      setClients(SEED_CLIENTS);
    }
    setMode(session?"coach":"login");
  },[]);

  const saveClients=(updated)=>{lsSet(SK.clients,updated);setClients(updated);};

  const handleSaveClient=(c)=>{
    const updated=clients.find(x=>x.id===c.id)?clients.map(x=>x.id===c.id?c:x):[...clients,c];
    saveClients(updated);
    setShowModal(false);setEditing(null);
    if(selected?.id===c.id)setSelected(c);
  };

  const handleDelete=(id)=>{
    saveClients(clients.filter(c=>c.id!==id));
    lsDel(SK.workouts(id));lsDel(SK.meals(id));lsDel(SK.measurements(id));
    setSelected(null);
  };

  if(mode==="init") return <><style>{css}</style><div style={{background:"var(--bg)",minHeight:"100dvh"}}><Loader/></div></>;
  if(mode.startsWith("client:")) return <><style>{css}</style><ClientView clientId={mode.split(":")[1]}/></>;
  if(mode==="login") return <><style>{css}</style><Login onLogin={()=>setMode("coach")}/></>;

  return (
    <>
      <style>{css}</style>
      {showModal&&<ClientModal client={editing} clients={clients} onSave={handleSaveClient} onClose={()=>{setShowModal(false);setEditing(null);}}/>}
      {!selected?(
        <CoachHome clients={clients} onSelect={setSelected}
          onAdd={()=>{setEditing(null);setShowModal(true);}}
          onLogout={()=>{lsDel(SK.coachSession);setMode("login");}}/>
      ):(
        <CoachClientDetail client={selected} clients={clients}
          onBack={()=>setSelected(null)}
          onEdit={()=>{setEditing(selected);setShowModal(true);}}
          onDelete={handleDelete}/>
      )}
    </>
  );
}
