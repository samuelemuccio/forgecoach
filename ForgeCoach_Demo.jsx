import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─────────────────────────────────────────────────
// DEMO DATA — 5 clienti completi
// ─────────────────────────────────────────────────
const CLIENTS = [
  { id:"C001", name:"Luca Rossi",     avatar:"LR", color:"#C8F135", email:"luca.rossi@gmail.com",      dob:"1995-03-12", sex:"M", height:175, weight:78, goal:"Dimagrimento",    program:"Fat Loss 12 Settimane",      start:"2025-12-01", end:"2026-02-28", status:"active"    },
  { id:"C002", name:"Sofia Marino",   avatar:"SM", color:"#60a5fa", email:"sofia.marino@gmail.com",    dob:"1998-07-22", sex:"F", height:163, weight:58, goal:"Tonificazione",   program:"Toning & Strength 8 Sett.",  start:"2026-01-10", end:"2026-03-10", status:"active"    },
  { id:"C003", name:"Andrea Conti",   avatar:"AC", color:"#f59e0b", email:"andrea.conti@gmail.com",    dob:"1990-11-05", sex:"M", height:182, weight:92, goal:"Massa muscolare", program:"Hypertrophy 16 Settimane",   start:"2025-11-01", end:"2026-03-01", status:"active"    },
  { id:"C004", name:"Giulia Ferrari", avatar:"GF", color:"#a78bfa", email:"giulia.ferrari@gmail.com",  dob:"2000-04-18", sex:"F", height:168, weight:62, goal:"Resistenza",      program:"Endurance & Core 10 Sett.", start:"2026-01-20", end:"2026-04-01", status:"active"    },
  { id:"C005", name:"Marco Ricci",    avatar:"MR", color:"#34d399", email:"marco.ricci@gmail.com",     dob:"1988-09-30", sex:"M", height:178, weight:85, goal:"Forza massimale", program:"Powerlifting 12 Sett.",      start:"2025-09-01", end:"2025-12-01", status:"completed" },
];

const WORKOUTS = {
  C001: {
    "Lunedì — Gambe":   [{ name:"Back Squat",          sets:4, reps:"8-10",  load:"72kg",  rest:"90s",  muscles:"Quadricipiti · Glutei",      note:"↗ +2kg ogni 2 settimane" },{ name:"Romanian Deadlift",   sets:3, reps:"10-12", load:"62kg",  rest:"75s",  muscles:"Femorali · Glutei",          note:"" },{ name:"Leg Press",           sets:3, reps:"12-15", load:"130kg", rest:"60s",  muscles:"Quadricipiti",               note:"" },{ name:"Walking Lunges",      sets:3, reps:"12/lato",load:"20kg", rest:"60s",  muscles:"Glutei · Quadricipiti",      note:"" },{ name:"Calf Raise",          sets:4, reps:"20",    load:"70kg",  rest:"30s",  muscles:"Polpacci",                   note:"" }],
    "Mercoledì — Petto": [{ name:"Bench Press",         sets:4, reps:"8-10",  load:"72kg",  rest:"90s",  muscles:"Pettorali · Tricipiti",       note:"↗ Priorità tecnica" },{ name:"Incline DB Press",    sets:3, reps:"10-12", load:"28kg",  rest:"75s",  muscles:"Petto superiore",            note:"" },{ name:"Cable Fly",           sets:3, reps:"13-15", load:"14kg",  rest:"60s",  muscles:"Pettorali interni",          note:"" },{ name:"Dip",                 sets:3, reps:"AMRAP",  load:"BW",    rest:"60s",  muscles:"Tricipiti · Pettorali",      note:"" },{ name:"Tricep Pushdown",     sets:3, reps:"15",    load:"22kg",  rest:"45s",  muscles:"Tricipiti",                  note:"" }],
    "Venerdì — Schiena": [{ name:"Pull-Up",             sets:4, reps:"6-8",   load:"BW",    rest:"90s",  muscles:"Dorsali · Bicipiti",          note:"Aggiungere zavorra al progresso" },{ name:"Barbell Row",         sets:4, reps:"8-10",  load:"65kg",  rest:"90s",  muscles:"Dorsali · Romboidi",         note:"" },{ name:"Seated Cable Row",    sets:3, reps:"12",    load:"58kg",  rest:"75s",  muscles:"Dorsali medi",               note:"" },{ name:"Face Pull",           sets:3, reps:"20",    load:"18kg",  rest:"45s",  muscles:"Deltoidi posteriori",        note:"" },{ name:"Barbell Curl",        sets:3, reps:"10-12", load:"32kg",  rest:"60s",  muscles:"Bicipiti",                   note:"" }],
    "Sabato — Spalle":   [{ name:"Military Press",      sets:4, reps:"8-10",  load:"52kg",  rest:"90s",  muscles:"Deltoidi anteriori",          note:"" },{ name:"Lateral Raise",       sets:4, reps:"15",    load:"12kg",  rest:"45s",  muscles:"Deltoidi laterali",          note:"Dropset nell'ultima serie" },{ name:"Rear Delt Fly",       sets:3, reps:"15",    load:"10kg",  rest:"45s",  muscles:"Deltoidi posteriori",        note:"" },{ name:"Ab Wheel Rollout",    sets:3, reps:"12",    load:"BW",    rest:"45s",  muscles:"Core · Addominali",          note:"" },{ name:"Plank",               sets:3, reps:"60s",   load:"BW",    rest:"30s",  muscles:"Core",                       note:"" }],
  },
  C002: {
    "Lunedì — Lower":    [{ name:"Hip Thrust",          sets:4, reps:"12-15", load:"65kg",  rest:"75s",  muscles:"Glutei massimi",              note:"Squeeze in cima" },{ name:"Bulgarian Split Squat",sets:3,reps:"10/lato",load:"22kg", rest:"75s",  muscles:"Quadricipiti · Glutei",      note:"" },{ name:"Romanian Deadlift",   sets:3, reps:"12",    load:"45kg",  rest:"60s",  muscles:"Femorali",                   note:"" },{ name:"Abductor Machine",    sets:3, reps:"15",    load:"38kg",  rest:"45s",  muscles:"Abduttori",                  note:"" },{ name:"Standing Calf Raise", sets:3, reps:"20",    load:"40kg",  rest:"30s",  muscles:"Polpacci",                   note:"" }],
    "Mercoledì — Upper": [{ name:"Push Up (weighted)",  sets:4, reps:"12-15", load:"10kg",  rest:"60s",  muscles:"Pettorali · Tricipiti",       note:"" },{ name:"Lat Pulldown",        sets:3, reps:"10-12", load:"45kg",  rest:"75s",  muscles:"Dorsali",                    note:"" },{ name:"DB Shoulder Press",   sets:3, reps:"12",    load:"14kg",  rest:"60s",  muscles:"Deltoidi",                   note:"" },{ name:"Lateral Raise",       sets:3, reps:"15-20", load:"8kg",   rest:"45s",  muscles:"Deltoidi laterali",          note:"" },{ name:"Tricep Dip",          sets:3, reps:"12",    load:"BW",    rest:"45s",  muscles:"Tricipiti",                  note:"" }],
    "Venerdì — Full":    [{ name:"Goblet Squat",        sets:3, reps:"15",    load:"24kg",  rest:"60s",  muscles:"Full legs",                   note:"" },{ name:"DB Row",              sets:3, reps:"12/lato",load:"18kg", rest:"60s",  muscles:"Dorsali",                    note:"" },{ name:"Glute Bridge",        sets:3, reps:"20",    load:"BW",    rest:"45s",  muscles:"Glutei",                     note:"" },{ name:"Plank Hold",          sets:3, reps:"45s",   load:"BW",    rest:"30s",  muscles:"Core",                       note:"" },{ name:"Mountain Climbers",   sets:3, reps:"30s",   load:"BW",    rest:"30s",  muscles:"Core · Cardio",              note:"" }],
  },
  C003: {
    "Lunedì — Squat":    [{ name:"Back Squat",          sets:5, reps:"5",     load:"115kg", rest:"180s", muscles:"Quadricipiti · Glutei",       note:"↗ Lavoro sulla profondità" },{ name:"Front Squat",         sets:3, reps:"5",     load:"80kg",  rest:"150s", muscles:"Quadricipiti",               note:"" },{ name:"Leg Press",           sets:4, reps:"8-10",  load:"210kg", rest:"120s", muscles:"Quadricipiti",               note:"" },{ name:"Leg Curl",            sets:3, reps:"12",    load:"55kg",  rest:"75s",  muscles:"Femorali",                   note:"" }],
    "Martedì — Petto":   [{ name:"Bench Press",         sets:5, reps:"5",     load:"97kg",  rest:"180s", muscles:"Pettorali",                   note:"Powerlifting setup" },{ name:"Incline Bench",       sets:4, reps:"6-8",   load:"75kg",  rest:"120s", muscles:"Petto superiore",            note:"" },{ name:"DB Flye",             sets:3, reps:"12",    load:"24kg",  rest:"75s",  muscles:"Pettorali",                  note:"" },{ name:"Close Grip Bench",    sets:3, reps:"8",     load:"70kg",  rest:"90s",  muscles:"Tricipiti",                  note:"" },{ name:"Skull Crusher",       sets:3, reps:"12",    load:"32kg",  rest:"60s",  muscles:"Tricipiti",                  note:"" }],
    "Giovedì — Deadlift":[{ name:"Conventional DL",     sets:5, reps:"5",     load:"145kg", rest:"180s", muscles:"Catena posteriore completa",  note:"↗ PR target 160kg" },{ name:"Barbell Row",         sets:4, reps:"6-8",   load:"88kg",  rest:"120s", muscles:"Dorsali",                    note:"" },{ name:"Pull-Up (weighted)",  sets:3, reps:"6",     load:"+15kg", rest:"120s", muscles:"Dorsali · Bicipiti",          note:"" },{ name:"Barbell Shrug",       sets:3, reps:"12",    load:"100kg", rest:"75s",  muscles:"Trapezi",                    note:"" }],
    "Sabato — OHP":      [{ name:"Overhead Press",      sets:5, reps:"5",     load:"62kg",  rest:"150s", muscles:"Deltoidi",                    note:"" },{ name:"Incline DB Press",    sets:4, reps:"8",     load:"32kg",  rest:"90s",  muscles:"Petto superiore",            note:"" },{ name:"Lateral Raise",       sets:4, reps:"15",    load:"14kg",  rest:"45s",  muscles:"Deltoidi laterali",          note:"" },{ name:"Face Pull",           sets:4, reps:"20",    load:"22kg",  rest:"45s",  muscles:"Deltoidi posteriori",        note:"" },{ name:"EZ Bar Curl",         sets:3, reps:"10",    load:"35kg",  rest:"60s",  muscles:"Bicipiti",                   note:"" }],
  },
  C004: {
    "Lunedì — Core&Run": [{ name:"Plank Variazioni",    sets:4, reps:"45s",   load:"BW",    rest:"30s",  muscles:"Core completo",               note:"Frontale, laterale, RKC" },{ name:"Dead Bug",            sets:3, reps:"12",    load:"BW",    rest:"30s",  muscles:"Core profondo",              note:"" },{ name:"Hollow Hold",         sets:3, reps:"30s",   load:"BW",    rest:"30s",  muscles:"Addominali",                 note:"" },{ name:"Treadmill HIIT",      sets:1, reps:"20 min", load:"—",     rest:"—",    muscles:"Cardio · Gambe",             note:"30s sprint / 90s walk" }],
    "Mercoledì — Full":  [{ name:"Trap Bar Deadlift",   sets:4, reps:"8",     load:"80kg",  rest:"90s",  muscles:"Full body",                   note:"" },{ name:"Pull-Up",             sets:3, reps:"8",     load:"BW",    rest:"75s",  muscles:"Dorsali",                    note:"" },{ name:"Dumbbell Bench",      sets:3, reps:"12",    load:"20kg",  rest:"60s",  muscles:"Pettorali",                  note:"" },{ name:"Step-Up",             sets:3, reps:"12/lato",load:"24kg", rest:"60s",  muscles:"Glutei · Quadricipiti",      note:"" },{ name:"Pallof Press",        sets:3, reps:"12",    load:"15kg",  rest:"45s",  muscles:"Core antirotazione",         note:"" }],
    "Venerdì — Corsa":   [{ name:"Riscaldamento",       sets:1, reps:"10 min",load:"—",     rest:"—",    muscles:"Cardio",                      note:"Corsa leggera" },{ name:"Corsa progressiva",   sets:1, reps:"30 min",load:"—",     rest:"—",    muscles:"Cardiovascolare",            note:"Ritmo gara 5:30/km" },{ name:"Stretching dinamico", sets:1, reps:"10 min",load:"—",     rest:"—",    muscles:"Full body",                  note:"" }],
    "Domenica — Yoga":   [{ name:"Vinyasa Flow",        sets:1, reps:"45 min",load:"—",     rest:"—",    muscles:"Mobilità · Flessibilità",     note:"Focus anche sulla respirazione" },{ name:"Hip Opener",          sets:3, reps:"60s",   load:"BW",    rest:"—",    muscles:"Flessori dell'anca",         note:"" },{ name:"Spinal Twist",        sets:2, reps:"60s",   load:"BW",    rest:"—",    muscles:"Colonna vertebrale",         note:"" }],
  },
  C005: {
    "Lunedì — Squat":    [{ name:"Back Squat",          sets:5, reps:"3",     load:"135kg", rest:"240s", muscles:"Full legs",                   note:"Preparazione gara" },{ name:"Pause Squat",         sets:3, reps:"3",     load:"100kg", rest:"180s", muscles:"Quadricipiti",               note:"2s pausa in buca" }],
    "Mercoledì — Bench": [{ name:"Bench Press",         sets:5, reps:"3",     load:"110kg", rest:"240s", muscles:"Pettorali",                   note:"Grip largo" },{ name:"Close Grip",          sets:3, reps:"5",     load:"85kg",  rest:"180s", muscles:"Tricipiti",                  note:"" }],
    "Venerdì — DL":      [{ name:"Deadlift",            sets:5, reps:"3",     load:"172kg", rest:"300s", muscles:"Full posterior",              note:"↗ PR personale raggiunto!" }],
  },
};

const MEALS = {
  C001: {
    "Lunedì": [
      { time:"07:00", label:"Colazione",    items:"Avena 80g · Latte scremato 200ml · Banana · Mirtilli 50g",               kcal:520, p:22, c:82, f:10 },
      { time:"10:00", label:"Spuntino",     items:"Yogurt greco 0% 200g · Noci 20g · Miele 10g",                             kcal:230, p:20, c:14, f:10 },
      { time:"13:00", label:"Pranzo",       items:"Riso basmati 100g · Petto di pollo 180g · Verdure grigliate · EVO 10ml",  kcal:560, p:50, c:68, f:10 },
      { time:"16:30", label:"Pre-workout",  items:"Pane integrale 60g · Burro di arachidi 20g · Marmellata 10g",             kcal:310, p:11, c:40, f:12 },
      { time:"20:30", label:"Cena",         items:"Salmone 200g · Patate dolci 150g · Broccoli al vapore · Limone",          kcal:530, p:46, c:40, f:16 },
    ],
    "Martedì": [
      { time:"07:00", label:"Colazione",    items:"Uova intere 3 · Pane di segale 60g · Avocado ½",                         kcal:490, p:28, c:36, f:26 },
      { time:"10:00", label:"Spuntino",     items:"Mela · Mandorle 25g",                                                     kcal:185, p:5,  c:24, f:9  },
      { time:"13:00", label:"Pranzo",       items:"Pasta integrale 90g · Tonno 160g · Pomodorini · Capperi · Olive 20g",    kcal:540, p:42, c:64, f:12 },
      { time:"19:30", label:"Cena",         items:"Petto di tacchino 220g · Farro 80g · Zucchine · EVO 10ml",               kcal:500, p:52, c:44, f:10 },
    ],
  },
  C002: {
    "Lunedì": [
      { time:"08:00", label:"Colazione",    items:"Uova 2 + Albumi 3 · Avocado ½ · Pane integrale 50g",                     kcal:440, p:34, c:28, f:22 },
      { time:"11:00", label:"Spuntino",     items:"Skyr 150g · Frutti di bosco 80g",                                         kcal:170, p:18, c:18, f:1  },
      { time:"13:30", label:"Pranzo",       items:"Pollo 150g · Quinoa 80g · Insalata mista · Olio 8ml",                    kcal:430, p:40, c:44, f:10 },
      { time:"17:00", label:"Post-workout", items:"Banana · Ricotta 100g",                                                   kcal:200, p:14, c:28, f:4  },
      { time:"20:00", label:"Cena",         items:"Merluzzo 200g · Farro 70g · Asparagi · EVO 8ml",                         kcal:390, p:42, c:34, f:8  },
    ],
  },
  C003: {
    "Lunedì": [
      { time:"07:00", label:"Colazione",    items:"Avena 120g · Latte intero 300ml · Banana · Whey 30g · PB 20g",           kcal:820, p:54, c:110,f:18 },
      { time:"10:00", label:"Spuntino 1",   items:"Pane integrale 80g · Tonno 160g · Olio EVO 10ml",                        kcal:450, p:40, c:46, f:14 },
      { time:"13:00", label:"Pranzo",       items:"Pasta 150g · Carne macinata 200g · Sugo pomodoro · Parmigiano 20g",      kcal:740, p:56, c:84, f:20 },
      { time:"16:30", label:"Pre-workout",  items:"Riso 100g · Petto pollo 150g · EVO 8ml",                                 kcal:450, p:46, c:54, f:8  },
      { time:"20:30", label:"Cena",         items:"Bistecca manzo 280g · Patate 200g · Verdure · EVO 12ml",                 kcal:700, p:70, c:44, f:22 },
      { time:"23:00", label:"Pre-nanna",    items:"Ricotta 200g · Casein Whey 25g · Miele 15g",                             kcal:350, p:44, c:28, f:6  },
    ],
  },
  C004: {
    "Lunedì": [
      { time:"07:30", label:"Colazione",    items:"Porridge avena 60g · Latte vegetale · Banana · Semi chia 10g",           kcal:380, p:14, c:62, f:8  },
      { time:"10:00", label:"Spuntino",     items:"Hummus 80g · Gallette di riso 3 · Cetrioli",                             kcal:200, p:8,  c:30, f:6  },
      { time:"13:00", label:"Pranzo",       items:"Salmone 160g · Quinoa 80g · Spinaci saltati · Limone",                   kcal:490, p:42, c:44, f:14 },
      { time:"16:00", label:"Pre-corsa",    items:"Banana · Dattero 2 · Acqua di cocco 200ml",                              kcal:180, p:2,  c:42, f:1  },
      { time:"20:00", label:"Cena",         items:"Tempeh 160g · Riso integrale 80g · Verdure miste",                       kcal:420, p:34, c:48, f:10 },
    ],
  },
  C005: {
    "Lunedì": [
      { time:"07:00", label:"Colazione",    items:"6 uova strapazzate · Pancetta 50g · Pane tostato 80g",                   kcal:680, p:50, c:44, f:32 },
      { time:"12:00", label:"Pranzo",       items:"Filetto manzo 300g · Riso 150g · Verdure · Burro 15g",                   kcal:780, p:72, c:66, f:22 },
      { time:"19:30", label:"Cena",         items:"Pollo intero ½ · Patate arrosto 200g · Insalata",                        kcal:720, p:68, c:48, f:18 },
    ],
  },
};

const MEASUREMENTS = {
  C001: [
    { date:"2025-12-01", weight:78.0, bf:22.0, waist:88.0, chest:100.0, arm:35.0 },
    { date:"2025-12-08", weight:77.4, bf:21.7, waist:87.5, chest:99.8,  arm:35.1 },
    { date:"2025-12-15", weight:77.0, bf:21.4, waist:87.0, chest:99.6,  arm:35.2 },
    { date:"2025-12-22", weight:76.5, bf:21.0, waist:86.5, chest:99.4,  arm:35.3 },
    { date:"2026-01-05", weight:76.0, bf:20.6, waist:86.0, chest:99.2,  arm:35.5 },
    { date:"2026-01-12", weight:75.4, bf:20.2, waist:85.4, chest:99.0,  arm:35.6 },
    { date:"2026-01-19", weight:74.9, bf:19.8, waist:84.8, chest:98.8,  arm:35.8 },
    { date:"2026-02-02", weight:74.2, bf:19.3, waist:84.0, chest:98.6,  arm:36.0 },
  ],
  C002: [
    { date:"2026-01-10", weight:58.0, bf:26.0, waist:72.0, chest:88.0,  arm:29.0 },
    { date:"2026-01-17", weight:57.7, bf:25.6, waist:71.5, chest:87.8,  arm:29.2 },
    { date:"2026-01-24", weight:57.4, bf:25.2, waist:71.0, chest:87.6,  arm:29.4 },
    { date:"2026-01-31", weight:57.1, bf:24.8, waist:70.5, chest:87.4,  arm:29.6 },
    { date:"2026-02-07", weight:56.8, bf:24.4, waist:70.0, chest:87.2,  arm:29.8 },
  ],
  C003: [
    { date:"2025-11-01", weight:92.0, bf:17.5, waist:92.0, chest:110.0, arm:40.0 },
    { date:"2025-11-15", weight:92.8, bf:17.3, waist:91.8, chest:110.5, arm:40.4 },
    { date:"2025-12-01", weight:93.6, bf:17.1, waist:91.6, chest:111.0, arm:40.8 },
    { date:"2025-12-15", weight:94.4, bf:16.9, waist:91.4, chest:111.6, arm:41.2 },
    { date:"2026-01-01", weight:95.0, bf:16.7, waist:91.2, chest:112.0, arm:41.5 },
    { date:"2026-01-15", weight:95.8, bf:16.5, waist:91.0, chest:112.6, arm:42.0 },
    { date:"2026-02-01", weight:96.4, bf:16.3, waist:90.8, chest:113.0, arm:42.4 },
  ],
  C004: [
    { date:"2026-01-20", weight:62.0, bf:24.0, waist:70.0, chest:90.0,  arm:28.0 },
    { date:"2026-01-27", weight:61.7, bf:23.7, waist:69.5, chest:89.8,  arm:28.2 },
    { date:"2026-02-03", weight:61.5, bf:23.4, waist:69.2, chest:89.6,  arm:28.4 },
  ],
  C005: [
    { date:"2025-09-01", weight:85.0, bf:16.0, waist:88.0, chest:112.0, arm:42.0 },
    { date:"2025-09-15", weight:85.2, bf:15.8, waist:87.8, chest:112.4, arm:42.2 },
    { date:"2025-10-01", weight:85.5, bf:15.6, waist:87.6, chest:112.8, arm:42.5 },
    { date:"2025-10-15", weight:85.8, bf:15.4, waist:87.4, chest:113.0, arm:42.7 },
    { date:"2025-11-01", weight:86.0, bf:15.2, waist:87.2, chest:113.4, arm:43.0 },
    { date:"2025-11-15", weight:86.2, bf:15.0, waist:87.0, chest:113.8, arm:43.2 },
    { date:"2025-12-01", weight:86.4, bf:14.8, waist:86.8, chest:114.0, arm:43.5 },
  ],
};

// ─────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────
const fmtDate = d => { try { return new Date(d).toLocaleDateString("it-IT",{day:"2-digit",month:"short"}); } catch { return d; }};
const calcAge = dob => Math.floor((Date.now()-new Date(dob))/(365.25*24*3600*1000));
const calcBMI = (w,h) => (w/((h/100)**2)).toFixed(1);
const bmiCat = b => {
  const n=parseFloat(b);
  if(n<18.5) return {label:"Sottopeso",c:"#60a5fa"};
  if(n<25)   return {label:"Normopeso",c:"#C8F135"};
  if(n<30)   return {label:"Sovrappeso",c:"#f59e0b"};
  return {label:"Obeso",c:"#f87171"};
};
const progPct = (s,e) => {
  const now=Date.now(),st=new Date(s).getTime(),en=new Date(e).getTime();
  return Math.min(100,Math.max(0,Math.round(((now-st)/(en-st))*100)));
};
const calcTDEE = (w,h,age,sex) => {
  const bmr = sex==="M" ? 10*w+6.25*h-5*age+5 : 10*w+6.25*h-5*age-161;
  return Math.round(bmr*1.55);
};

// ─────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}

:root{
  --bg:#070707;
  --surface:#0f0f0f;
  --surface2:#161616;
  --surface3:#1d1d1d;
  --border:#222;
  --border2:#2a2a2a;
  --lime:#c8f135;
  --lime-10:rgba(200,241,53,.10);
  --lime-20:rgba(200,241,53,.20);
  --lime-30:rgba(200,241,53,.30);
  --text:#f0f0f0;
  --text2:#888;
  --text3:#444;
  --blue:#60a5fa;
  --amber:#f59e0b;
  --red:#f87171;
  --violet:#a78bfa;
  --green:#34d399;
  --r:18px;
  --r-sm:12px;
}

html,body,#root{ height:100%; }
body{
  background:var(--bg);
  color:var(--text);
  font-family:'Outfit',sans-serif;
  -webkit-font-smoothing:antialiased;
  overflow-x:hidden;
}
::-webkit-scrollbar{ width:0; height:0; }

/* ── LAYOUT ── */
.shell{
  min-height:100svh;
  max-width:430px;
  margin:0 auto;
  background:var(--bg);
  position:relative;
  padding-bottom:72px;
  overflow-x:hidden;
}

/* ── ANIMATIONS ── */
@keyframes fadeUp{
  from{opacity:0;transform:translateY(16px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes fadeIn{
  from{opacity:0} to{opacity:1}
}
@keyframes pulse{
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:.35;transform:scale(.65)}
}
@keyframes shimmer{
  from{background-position:-200% 0}
  to{background-position:200% 0}
}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideIn{
  from{opacity:0;transform:translateX(-12px)}
  to{opacity:1;transform:translateX(0)}
}
@keyframes countUp{
  from{opacity:0;transform:translateY(8px) scale(.9)}
  to{opacity:1;transform:translateY(0) scale(1)}
}

.fade-up{ animation:fadeUp .3s cubic-bezier(.22,.68,0,1.2) both; }
.fade-in{ animation:fadeIn .25s ease both; }

/* staggered children */
.stagger > *:nth-child(1){ animation-delay:.04s }
.stagger > *:nth-child(2){ animation-delay:.09s }
.stagger > *:nth-child(3){ animation-delay:.14s }
.stagger > *:nth-child(4){ animation-delay:.19s }
.stagger > *:nth-child(5){ animation-delay:.24s }
.stagger > *:nth-child(6){ animation-delay:.29s }

/* ── HEADER ── */
.hdr{
  padding:16px 20px 14px;
  position:sticky;top:0;z-index:100;
  background:rgba(7,7,7,.9);
  backdrop-filter:blur(24px);
  border-bottom:1px solid var(--border);
}
.hdr-row{ display:flex;justify-content:space-between;align-items:center; }
.brand{ font-family:'Bebas Neue';font-size:22px;letter-spacing:2.5px;color:var(--lime); }
.hdr-sub{ font-size:9px;text-transform:uppercase;letter-spacing:3px;color:var(--text3);margin-top:2px; }
.big-name{ font-family:'Bebas Neue';font-size:28px;letter-spacing:1.5px;line-height:1; }

/* ── BOTTOM TABS ── */
.nav{
  position:fixed;bottom:0;left:50%;transform:translateX(-50%);
  width:100%;max-width:430px;
  display:flex;
  background:rgba(7,7,7,.96);
  backdrop-filter:blur(24px);
  border-top:1px solid var(--border);
  z-index:200;
  padding:10px 0 max(14px,env(safe-area-inset-bottom));
}
.nav-tab{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
  cursor:pointer;transition:color .18s;color:var(--text3);padding:2px 0;
}
.nav-tab.on{ color:var(--lime); }
.nav-ico{ font-size:19px;line-height:1; }
.nav-lbl{ font-size:8px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600; }

/* ── SECTION ── */
.sec{ padding:18px 20px 24px; }

/* ── CARDS ── */
.card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--r);
  padding:16px;
  margin-bottom:10px;
}
.card-lime{ border-color:var(--lime-30); }
.card-glow{
  border-color:var(--lime-30);
  box-shadow:0 0 32px rgba(200,241,53,.06);
}
.ctitle{
  font-size:9px;text-transform:uppercase;
  letter-spacing:3px;color:var(--text3);
  margin-bottom:14px;font-weight:600;
}

/* ── AVATAR ── */
.av{
  border-radius:14px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Bebas Neue';letter-spacing:1px;color:#080808;
  font-weight:900;flex-shrink:0;
}

/* ── STATUS PILL ── */
.pill-live{
  display:inline-flex;align-items:center;gap:6px;
  margin-top:10px;
  background:var(--lime-10);
  border:1px solid var(--lime-20);
  border-radius:20px;padding:4px 12px;
  font-size:10px;color:var(--lime);font-weight:500;
}
.dot{
  width:6px;height:6px;border-radius:50%;background:var(--lime);
  animation:pulse 1.8s ease infinite;flex-shrink:0;
}

/* ── BUTTONS ── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;
  border:none;border-radius:var(--r-sm);cursor:pointer;
  font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;
  transition:all .15s;padding:11px 18px;letter-spacing:.3px;
}
.btn-lime{ background:var(--lime);color:#080808; }
.btn-lime:hover{ opacity:.88;transform:translateY(-1px); }
.btn-lime:active{ transform:translateY(0); }
.btn-ghost{ background:transparent;border:1px solid var(--border2);color:var(--text2); }
.btn-ghost:hover{ border-color:var(--text3);color:var(--text); }
.btn-red{ background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:var(--red); }
.btn-red:hover{ background:rgba(248,113,113,.18); }
.btn-sm{ padding:6px 14px;font-size:11px;border-radius:10px; }
.btn-xs{ padding:4px 10px;font-size:10px;border-radius:8px; }
.ico-btn{
  width:34px;height:34px;border-radius:10px;border:1px solid var(--border2);
  background:var(--surface2);color:var(--text);cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:14px;
  transition:all .15s;flex-shrink:0;
}
.ico-btn:hover{ border-color:var(--text3);color:var(--lime); }

/* ── INPUTS ── */
.inp{
  width:100%;background:var(--surface2);border:1px solid var(--border);
  border-radius:10px;padding:10px 13px;color:var(--text);
  font-family:'Outfit',sans-serif;font-size:13px;outline:none;transition:border-color .2s;
}
.inp:focus{ border-color:var(--lime-30); }
.inp::placeholder{ color:var(--text3); }
.inp-sm{ padding:7px 10px;font-size:12px;border-radius:8px; }
textarea.inp{ resize:vertical;min-height:54px;line-height:1.5; }
.sel{
  width:100%;background:var(--surface2);border:1px solid var(--border);
  border-radius:10px;padding:10px 13px;color:var(--text);
  font-family:'Outfit',sans-serif;font-size:13px;outline:none;cursor:pointer;appearance:none;
}
.lbl{ font-size:10px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:5px;font-weight:600; }
.field{ margin-bottom:12px; }
.row2{ display:grid;grid-template-columns:1fr 1fr;gap:10px; }
.row3{ display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px; }
.row4{ display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px; }

/* ── STAT BOXES ── */
.grid2{ display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px; }
.sbox{
  background:var(--surface);border:1px solid var(--border);
  border-radius:16px;padding:14px;
  transition:border-color .2s;
}
.sbox:hover{ border-color:var(--border2); }
.slbl{ font-size:9px;text-transform:uppercase;letter-spacing:2px;color:var(--text3);margin-bottom:6px;font-weight:600; }
.sval{ font-family:'Bebas Neue';font-size:34px;line-height:1;animation:countUp .4s .1s both; }
.sunit{ font-size:11px;color:var(--text3);font-family:'JetBrains Mono'; }
.sdelta{ font-size:10px;margin-top:4px;font-family:'JetBrains Mono'; }
.pos{ color:var(--lime); } .neg{ color:var(--red); }

/* ── PROGRESS BAR ── */
.pbar-wrap{ margin-bottom:14px; }
.pbar-head{ display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:6px; }
.pbar-head span:last-child{ color:var(--lime);font-weight:600; }
.pbar-bg{ height:5px;background:var(--surface3);border-radius:5px;overflow:hidden; }
.pbar-fill{
  height:100%;
  background:linear-gradient(90deg,var(--lime),#a3e635);
  border-radius:5px;
  transition:width 1.2s cubic-bezier(.22,.68,0,1);
}

/* ── DAY TABS ── */
.dtabs{
  display:flex;gap:6px;overflow-x:auto;
  padding-bottom:4px;margin-bottom:16px;
}
.dtab{
  flex-shrink:0;padding:6px 14px;border-radius:20px;font-size:11px;
  cursor:pointer;border:1px solid var(--border);color:var(--text3);
  background:var(--surface);white-space:nowrap;transition:all .18s;font-weight:500;
}
.dtab.on{
  background:var(--lime);color:#080808;
  border-color:var(--lime);font-weight:700;
  box-shadow:0 0 16px rgba(200,241,53,.25);
}

/* ── EXERCISE CARD ── */
.ex-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:16px;padding:14px;margin-bottom:8px;
  display:flex;gap:12px;transition:border-color .18s;
}
.ex-card:hover{ border-color:var(--border2); }
.ex-num{
  font-family:'Bebas Neue';font-size:28px;color:var(--surface3);
  line-height:1;min-width:28px;
}
.ex-name{ font-size:14px;font-weight:700;color:var(--text);margin-bottom:3px; }
.ex-muscles{ font-size:10px;color:var(--text3);margin-bottom:10px;font-weight:500; }
.ex-pills{ display:flex;gap:5px;flex-wrap:wrap; }
.xpill{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:7px;padding:4px 8px;font-size:10px;color:var(--text3);
  font-family:'JetBrains Mono';display:flex;align-items:center;gap:3px;
}
.xpill strong{ color:var(--text);font-weight:500; }
.ex-note{ font-size:10px;color:var(--lime);margin-top:8px;font-weight:500; }

/* ── MEAL CARD ── */
.meal-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:16px;padding:14px;margin-bottom:8px;
}
.meal-hdr{ display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px; }
.meal-time{ font-family:'JetBrains Mono';font-size:10px;color:var(--lime);font-weight:500; }
.meal-lbl{ font-size:15px;font-weight:700; }
.meal-items{ font-size:11px;color:var(--text2);margin-bottom:10px;line-height:1.7; }
.macro-row{ display:flex;gap:6px; }
.mac{
  flex:1;text-align:center;background:var(--surface2);
  border-radius:9px;padding:6px 3px;
}
.mv{ font-family:'JetBrains Mono';font-size:12px;font-weight:500; }
.ml{ font-size:8px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:2px;font-weight:600; }

/* daily total */
.dtotal{
  background:var(--lime-10);border:1px solid var(--lime-20);
  border-radius:16px;padding:16px;margin-bottom:12px;
}
.dt-title{ font-size:9px;color:var(--lime);text-transform:uppercase;letter-spacing:3px;margin-bottom:12px;font-weight:700; }
.macro-big{ display:flex;justify-content:space-between;margin-bottom:14px; }
.mval-big{ font-family:'JetBrains Mono';font-size:16px;font-weight:500; }
.mlbl-big{ font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-top:3px;font-weight:600; }
.bar-row{ display:flex;align-items:center;gap:10px;margin-bottom:6px; }
.bar-lbl{ font-size:10px;color:var(--text3);width:22px;font-family:'JetBrains Mono'; }
.bar-bg{ flex:1;height:4px;background:var(--surface3);border-radius:4px;overflow:hidden; }
.bar-fill{ height:100%;border-radius:4px;transition:width .8s cubic-bezier(.22,.68,0,1); }
.bar-val{ font-family:'JetBrains Mono';font-size:10px;color:var(--text);width:40px;text-align:right; }

/* ── PROGRESS PAGE ── */
.metric-hero{ margin-bottom:18px; }
.metric-label{ font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:3px;margin-bottom:5px;font-weight:600; }
.metric-val{ font-family:'Bebas Neue';font-size:56px;line-height:1;animation:countUp .4s .05s both; }
.metric-delta{ font-size:11px;color:var(--text3);margin-top:4px;font-family:'JetBrains Mono'; }
.mtabs{ display:flex;gap:6px;margin-bottom:16px;overflow-x:auto; }
.mtab{
  flex-shrink:0;padding:5px 12px;border-radius:20px;font-size:11px;cursor:pointer;
  border:1px solid var(--border);color:var(--text3);background:var(--surface);
  white-space:nowrap;transition:all .18s;font-weight:500;
}
.mtab.on{ background:var(--surface2);color:var(--text);border-color:var(--border2); }

/* ── INFO ROWS ── */
.irow{
  display:flex;justify-content:space-between;align-items:center;
  padding:9px 0;border-bottom:1px solid var(--border);font-size:12px;
}
.irow:last-child{ border-bottom:none; }
.ilbl{ color:var(--text2); }
.ival{ font-family:'JetBrains Mono';font-size:11px;color:var(--text); }

/* ── LOGIN ── */
.login-wrap{
  min-height:100svh;display:flex;align-items:center;justify-content:center;
  padding:24px;background:var(--bg);
}
.login-box{
  background:var(--surface);border:1px solid var(--border);
  border-radius:24px;padding:36px;width:100%;max-width:360px;
  animation:fadeUp .4s cubic-bezier(.22,.68,0,1.2);
}
.login-brand{
  font-family:'Bebas Neue';font-size:52px;letter-spacing:3px;color:var(--lime);
  text-align:center;margin-bottom:2px;
}
.login-sub{
  font-size:10px;color:var(--text3);text-align:center;
  letter-spacing:3px;text-transform:uppercase;margin-bottom:32px;font-weight:600;
}
.login-err{ font-size:12px;color:var(--red);text-align:center;margin-top:10px; }

/* ── MODAL ── */
.overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.8);
  z-index:500;display:flex;align-items:flex-end;justify-content:center;
  animation:fadeIn .18s ease;
}
.modal{
  background:var(--surface);border-radius:24px 24px 0 0;
  border:1px solid var(--border);border-bottom:none;
  padding:24px 22px max(24px,env(safe-area-inset-bottom));
  width:100%;max-width:430px;
  max-height:92svh;overflow-y:auto;
  animation:fadeUp .22s cubic-bezier(.22,.68,0,1.2);
}
.modal-title{ font-family:'Bebas Neue';font-size:22px;letter-spacing:2px; }

/* ── COACH CLIENT LIST ── */
.c-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:18px;padding:16px;margin-bottom:10px;
  cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:14px;
}
.c-card:hover{ border-color:var(--lime-20);transform:translateY(-1px); }
.c-card:active{ transform:translateY(0);border-color:var(--lime-30); }
.c-info{ flex:1;min-width:0; }
.c-name{ font-size:16px;font-weight:700;margin-bottom:2px; }
.c-prog{ font-size:10px;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px; }
.c-arrow{ color:var(--text3);font-size:18px;transition:transform .2s;flex-shrink:0; }
.c-card:hover .c-arrow{ transform:translateX(3px);color:var(--lime); }

/* ── BACK ── */
.back{
  display:flex;align-items:center;gap:6px;cursor:pointer;color:var(--text3);
  font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;
  padding:0 20px 12px;transition:color .18s;
}
.back:hover{ color:var(--lime); }

/* ── SUB TABS (coach detail) ── */
.stabs{
  display:flex;border-bottom:1px solid var(--border);
  position:sticky;top:71px;z-index:90;
  background:rgba(7,7,7,.9);backdrop-filter:blur(20px);
}
.stab{
  flex:1;padding:12px 4px;text-align:center;font-size:10px;cursor:pointer;
  color:var(--text3);border-bottom:2px solid transparent;
  transition:all .18s;letter-spacing:.5px;font-weight:600;
}
.stab.on{ color:var(--lime);border-bottom-color:var(--lime); }

/* ── SHARE ── */
.share-box{
  background:var(--lime-10);border:1px solid var(--lime-20);
  border-radius:16px;padding:18px;margin-bottom:12px;
}
.share-code{
  font-family:'JetBrains Mono';font-size:12px;color:var(--text);
  background:var(--bg);padding:12px 14px;border-radius:10px;
  border:1px solid var(--border);word-break:break-all;
  margin-top:10px;line-height:1.8;
}

/* ── EDIT ROW ── */
.edit-row{
  background:var(--bg);border:1px solid var(--border);
  border-radius:12px;padding:12px;margin-bottom:8px;
}

/* ── EMPTY ── */
.empty{
  text-align:center;padding:56px 24px;color:var(--text3);
  animation:fadeIn .3s ease;
}
.empty-ico{ font-size:40px;margin-bottom:14px; }
.empty-txt{ font-size:13px;line-height:1.7; }

/* ── SAVED ── */
.saved-toast{
  font-size:10px;color:var(--lime);text-align:right;
  margin-bottom:8px;font-family:'JetBrains Mono';
  transition:opacity .3s;font-weight:500;
}

/* ── LOADER ── */
.loader{
  display:flex;align-items:center;justify-content:center;
  min-height:50svh;
}
.spin{
  width:28px;height:28px;border:2px solid var(--border);
  border-top-color:var(--lime);border-radius:50%;
  animation:spin .75s linear infinite;
}

/* ── TOOLTIP ── */
.recharts-tooltip-wrapper{ z-index:50; }

/* ── DEMO SWITCHER ── */
.demo-bar{
  position:fixed;top:0;left:50%;transform:translateX(-50%);
  width:100%;max-width:430px;z-index:9999;
  background:rgba(200,241,53,.95);padding:8px 16px;
  display:flex;align-items:center;justify-content:space-between;
  gap:8px;
}
.demo-bar-label{ font-size:10px;font-weight:700;color:#080808;letter-spacing:1px; }
.demo-select{
  background:rgba(0,0,0,.12);border:1px solid rgba(0,0,0,.2);
  border-radius:8px;padding:4px 8px;color:#080808;
  font-family:'Outfit',sans-serif;font-size:11px;font-weight:700;
  cursor:pointer;outline:none;
}

/* ── RADAR ── */
.radar-wrap{ height:220px;margin:4px 0 8px; }

/* ── COACH STATS ROW ── */
.coach-stats{
  display:flex;gap:8px;overflow-x:auto;padding:0 20px 16px;
}
.cstat{
  flex-shrink:0;background:var(--surface);border:1px solid var(--border);
  border-radius:14px;padding:14px 18px;min-width:100px;
  animation:fadeUp .35s both;
}
.cstat-val{ font-family:'Bebas Neue';font-size:30px;line-height:1; }
.cstat-lbl{ font-size:9px;text-transform:uppercase;letter-spacing:2px;color:var(--text3);margin-top:3px;font-weight:600; }

/* BMI CALC */
.calc-row{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:12px;padding:14px;margin-bottom:8px;
  display:flex;justify-content:space-between;align-items:center;
}
.calc-lbl{ font-size:13px;color:var(--text2); }
.calc-ctrl{ display:flex;align-items:center;gap:10px; }
.calc-btn{
  width:34px;height:34px;border-radius:50%;border:1px solid var(--border2);
  background:var(--surface);color:var(--text);font-size:20px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:all .15s;
}
.calc-btn:hover{ background:var(--lime);color:#080808;border-color:var(--lime); }
.calc-num{ font-family:'JetBrains Mono';font-size:20px;font-weight:500;min-width:60px;text-align:center; }
.bmi-result{
  border-radius:18px;padding:24px;text-align:center;
  margin-top:16px;border:1px solid;
}
.bmi-big{ font-family:'Bebas Neue';font-size:80px;line-height:1;animation:countUp .4s both; }
.bmi-cat{ font-size:13px;letter-spacing:3px;text-transform:uppercase;margin-top:4px;font-weight:600; }
.bmi-bar-bg{ height:8px;border-radius:8px;background:var(--surface3);margin:16px 0 6px;overflow:hidden; }
.bmi-bar-lbls{ display:flex;justify-content:space-between;font-size:9px;color:var(--text3); }
.tdee-row{
  display:flex;justify-content:space-between;align-items:center;
  padding:10px 0;border-bottom:1px solid var(--border);
}
.tdee-row:last-child{ border-bottom:none; }
.tdee-lbl{ font-size:12px;color:var(--text2); }
.tdee-val{ font-family:'JetBrains Mono';font-size:13px;font-weight:500; }
`;

// ─────────────────────────────────────────────────
// SMALL ATOMS
// ─────────────────────────────────────────────────
function Loader() { return <div className="loader"><div className="spin"/></div>; }
function Empty({ icon, text }) {
  return (
    <div className="empty">
      <div className="empty-ico">{icon}</div>
      <div className="empty-txt">{text}</div>
    </div>
  );
}
function Field({ label, children }) {
  return <div className="field"><div className="lbl">{label}</div>{children}</div>;
}
function SavedToast({ show }) {
  return <div className="saved-toast" style={{ opacity: show ? 1 : 0 }}>✓ Salvato</div>;
}
function PBar({ pct, color = "var(--lime)" }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(pct), 80); }, [pct]);
  return (
    <div className="pbar-bg">
      <div className="pbar-fill" style={{ width: `${w}%`, background: color === "var(--lime)" ? "linear-gradient(90deg,var(--lime),#a3e635)" : color }} />
    </div>
  );
}

// Custom Tooltip for recharts
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", fontSize: 11, fontFamily: "'JetBrains Mono'" }}>
      <div style={{ color: "var(--text3)", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "var(--lime)" }}>{p.value}{p.unit || ""}</div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const go = () => {
    if (pw === "coach123") { onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-brand">ForgeCoach</div>
        <div className="login-sub">Accesso Riservato</div>
        <Field label="Password">
          <input className="inp" type="password" placeholder="••••••••"
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && go()} autoFocus />
        </Field>
        <button className="btn btn-lime" style={{ width: "100%", padding: "14px", fontSize: 15, marginTop: 4 }} onClick={go}>
          ACCEDI →
        </button>
        {err && <div className="login-err">Password non corretta</div>}
        <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          Demo password: <span style={{ fontFamily: "'JetBrains Mono'", color: "var(--text)" }}>coach123</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// COACH — HOME
// ─────────────────────────────────────────────────
function CoachHome({ onSelect, onLogout }) {
  const active = CLIENTS.filter(c => c.status === "active");
  const done = CLIENTS.filter(c => c.status === "completed");
  const totalKg = CLIENTS.reduce((s, c) => {
    const ms = MEASUREMENTS[c.id] || [];
    if (ms.length < 2) return s;
    return s + parseFloat((ms[ms.length - 1].weight - ms[0].weight).toFixed(1));
  }, 0);

  return (
    <div style={{ minHeight: "100svh", background: "var(--bg)", paddingBottom: 40 }}>
      <div className="hdr">
        <div className="hdr-row">
          <div>
            <div className="brand">ForgeCoach</div>
            <div className="hdr-sub">Dashboard Coach</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-lime btn-sm">+ Nuovo</button>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Esci</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="coach-stats stagger">
        {[
          { v: CLIENTS.length, l: "Clienti", c: "var(--text)" },
          { v: active.length, l: "Attivi", c: "var(--lime)" },
          { v: done.length, l: "Completati", c: "var(--green)" },
          { v: `${Math.abs(totalKg).toFixed(1)}kg`, l: "Tot. persi", c: "var(--blue)" },
        ].map((s, i) => (
          <div key={i} className="cstat" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="cstat-val" style={{ color: s.c }}>{s.v}</div>
            <div className="cstat-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 20px 40px" }}>
        {/* Active */}
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 3, color: "var(--text3)", marginBottom: 12, fontWeight: 600 }}>Attivi</div>
        <div className="stagger">
          {active.map((c, i) => {
            const ms = MEASUREMENTS[c.id] || [];
            const pct = progPct(c.start, c.end);
            const latest = ms[ms.length - 1];
            const first = ms[0];
            const delta = latest && first ? (latest.weight - first.weight).toFixed(1) : null;
            return (
              <div key={c.id} className="c-card fade-up" style={{ animationDelay: `${i * 0.07}s` }} onClick={() => onSelect(c)}>
                <div className="av" style={{ width: 48, height: 48, background: c.color, fontSize: 15 }}>{c.avatar}</div>
                <div className="c-info">
                  <div className="c-name">{c.name}</div>
                  <div className="c-prog">{c.program}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><PBar pct={pct} /></div>
                    <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "'JetBrains Mono'", flexShrink: 0 }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  {delta !== null && (
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono'", color: parseFloat(delta) < 0 ? "var(--lime)" : "var(--amber)" }}>
                      {parseFloat(delta) > 0 ? "+" : ""}{delta}kg
                    </span>
                  )}
                  <span className="c-arrow">›</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed */}
        {done.length > 0 && (
          <>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 3, color: "var(--text3)", margin: "24px 0 12px", fontWeight: 600 }}>Completati</div>
            {done.map((c) => (
              <div key={c.id} className="c-card" onClick={() => onSelect(c)} style={{ opacity: .55 }}>
                <div className="av" style={{ width: 44, height: 44, background: c.color, fontSize: 14 }}>{c.avatar}</div>
                <div className="c-info">
                  <div className="c-name">{c.name}</div>
                  <div className="c-prog">{c.program}</div>
                </div>
                <span style={{ fontSize: 11, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 20, padding: "3px 10px", color: "var(--green)" }}>✓ Fine</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// WORKOUT SECTION (used by both coach edit + client read)
// ─────────────────────────────────────────────────
function WorkoutSection({ clientId, editable = false }) {
  const data = WORKOUTS[clientId] || {};
  const days = Object.keys(data);
  const [activeDay, setActiveDay] = useState(days[0] || "");
  const exercises = activeDay ? (data[activeDay] || []) : [];

  if (days.length === 0) return <Empty icon="🏋️" text="Nessun allenamento assegnato ancora" />;

  return (
    <div className="sec fade-in">
      <div className="dtabs">
        {days.map(d => (
          <div key={d} className={`dtab${activeDay === d ? " on" : ""}`} onClick={() => setActiveDay(d)}>{d}</div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 14, letterSpacing: 1, fontWeight: 600 }}>
        {exercises.length} ESERCIZI · {activeDay?.split("—")[0]?.trim()}
      </div>
      <div className="stagger">
        {exercises.map((ex, i) => (
          <div key={i} className="ex-card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="ex-num">{String(i + 1).padStart(2, "0")}</div>
            <div style={{ flex: 1 }}>
              <div className="ex-name">{ex.name}</div>
              {ex.muscles && <div className="ex-muscles">{ex.muscles}</div>}
              <div className="ex-pills">
                {[["Serie", ex.sets], ["Reps", ex.reps], ex.load && ex.load !== "—" && ["Carico", ex.load], ex.rest && ex.rest !== "—" && ["Rec", ex.rest]].filter(Boolean).map(([l, v]) => (
                  <div key={l} className="xpill"><span>{l}</span><strong>{v}</strong></div>
                ))}
              </div>
              {ex.note && <div className="ex-note">↗ {ex.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// NUTRITION SECTION
// ─────────────────────────────────────────────────
function NutritionSection({ clientId }) {
  const data = MEALS[clientId] || {};
  const days = Object.keys(data);
  const [activeDay, setActiveDay] = useState(days[0] || "");
  const meals = activeDay ? (data[activeDay] || []) : [];
  const total = meals.reduce((a, m) => ({
    kcal: a.kcal + Number(m.kcal), p: a.p + Number(m.p),
    c: a.c + Number(m.c), f: a.f + Number(m.f),
  }), { kcal: 0, p: 0, c: 0, f: 0 });

  if (days.length === 0) return <Empty icon="🥗" text="Piano alimentare non ancora assegnato" />;

  return (
    <div className="sec fade-in">
      <div className="dtabs">
        {days.map(d => (
          <div key={d} className={`dtab${activeDay === d ? " on" : ""}`} onClick={() => setActiveDay(d)}>{d}</div>
        ))}
      </div>

      {/* Daily total */}
      <div className="dtotal">
        <div className="dt-title">Totale giornaliero</div>
        <div className="macro-big">
          {[
            [total.kcal, "kcal", "var(--lime)"],
            [`${total.p}g`, "Prot", "var(--blue)"],
            [`${total.c}g`, "Carb", "var(--amber)"],
            [`${total.f}g`, "Gras", "var(--red)"],
          ].map(([v, l, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="mval-big" style={{ color: c }}>{v}</div>
              <div className="mlbl-big">{l}</div>
            </div>
          ))}
        </div>
        {[
          ["P", total.p, 160, "var(--blue)"],
          ["C", total.c, 220, "var(--amber)"],
          ["G", total.f, 65, "var(--red)"],
        ].map(([l, v, t, c]) => (
          <div key={l} className="bar-row">
            <span className="bar-lbl" style={{ color: c }}>{l}</span>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: `${Math.min(100, (v / t) * 100)}%`, background: c }} />
            </div>
            <span className="bar-val">{v}g</span>
          </div>
        ))}
      </div>

      {/* Meal cards */}
      <div className="stagger">
        {meals.map((m, i) => (
          <div key={i} className="meal-card fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="meal-hdr">
              <div>
                <div className="meal-time">{m.time}</div>
                <div className="meal-lbl">{m.label}</div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 15, color: "var(--lime)", fontWeight: 500 }}>{m.kcal} kcal</div>
            </div>
            <div className="meal-items">{m.items}</div>
            <div className="macro-row">
              {[["Prot", `${m.p}g`, "var(--blue)"], ["Carb", `${m.c}g`, "var(--amber)"], ["Gras", `${m.f}g`, "var(--red)"]].map(([l, v, c]) => (
                <div key={l} className="mac">
                  <div className="mv" style={{ color: c }}>{v}</div>
                  <div className="ml">{l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// PROGRESS SECTION
// ─────────────────────────────────────────────────
const RADAR_LABELS = ["Forza", "Resistenza", "Flessibilità", "Composizione", "Recupero", "Costanza"];
const RADAR_DATA = {
  C001: [62, 55, 40, 58, 70, 80],
  C002: [45, 65, 72, 60, 68, 88],
  C003: [88, 42, 38, 64, 58, 75],
  C004: [50, 85, 78, 55, 74, 82],
  C005: [95, 50, 42, 70, 60, 90],
};

function ProgressSection({ client }) {
  const ms = MEASUREMENTS[client.id] || [];
  const METRICS = [
    { key: "weight", label: "Peso", unit: "kg", color: client.color },
    { key: "bf", label: "Grasso %", unit: "%", color: "var(--blue)" },
    { key: "waist", label: "Vita", unit: "cm", color: "var(--amber)" },
    { key: "arm", label: "Braccio", unit: "cm", color: "var(--violet)" },
  ].filter(m => ms.some(x => x[m.key] != null));

  const [activeMet, setActiveMet] = useState(METRICS[0]);

  if (ms.length === 0) return <Empty icon="📈" text="I progressi appariranno dopo la prima misurazione" />;

  const latest = ms[ms.length - 1];
  const first = ms[0];
  const lv = latest[activeMet.key];
  const fv = first[activeMet.key];
  const delta = lv != null && fv != null ? (lv - fv).toFixed(1) : null;
  const chartMs = ms.filter(m => m[activeMet.key] != null).map(m => ({ ...m, date: fmtDate(m.date) }));

  const radarData = RADAR_LABELS.map((label, i) => ({
    label, score: (RADAR_DATA[client.id] || [65, 65, 65, 65, 65, 65])[i],
  }));

  return (
    <div className="sec fade-in">
      {/* Metric tabs */}
      <div className="mtabs">
        {METRICS.map(m => (
          <div key={m.key} className={`mtab${activeMet.key === m.key ? " on" : ""}`} onClick={() => setActiveMet(m)}>{m.label}</div>
        ))}
      </div>

      {/* Hero number */}
      <div className="metric-hero">
        <div className="metric-label">{activeMet.label} attuale</div>
        <div className="metric-val" style={{ color: activeMet.color }}>{lv} <span style={{ fontSize: 22, color: "var(--text3)" }}>{activeMet.unit}</span></div>
        {delta && (
          <div className="metric-delta">
            Dall'inizio: <span style={{ color: parseFloat(delta) < 0 ? "var(--lime)" : "var(--red)", fontWeight: 600 }}>
              {parseFloat(delta) > 0 ? "+" : ""}{delta} {activeMet.unit}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      {chartMs.length > 1 && (
        <div className="card card-lime">
          <div className="ctitle">Andamento {activeMet.label}</div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartMs} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id={`grad-${activeMet.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeMet.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={activeMet.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 9 }} />
              <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fill: "#444", fontSize: 9 }} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey={activeMet.key} stroke={activeMet.color} strokeWidth={2.5}
                fill={`url(#grad-${activeMet.key})`} dot={{ fill: activeMet.color, r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Radar */}
      <div className="card">
        <div className="ctitle">Performance atletica</div>
        <div className="radar-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e1e1e" />
              <PolarAngleAxis dataKey="label" tick={{ fill: "#555", fontSize: 10 }} />
              <Radar dataKey="score" stroke={client.color} strokeWidth={2} fill={client.color} fillOpacity={0.12} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History table */}
      <div className="card">
        <div className="ctitle">Storico misurazioni</div>
        {[...ms].reverse().map((m, i) => (
          <div key={i} className="irow">
            <span className="ilbl" style={{ fontFamily: "'JetBrains Mono'", fontSize: 10 }}>{fmtDate(m.date)}</span>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, display: "flex", gap: 10 }}>
              <span style={{ color: client.color }}>{m.weight}kg</span>
              {m.bf && <span style={{ color: "var(--blue)" }}>{m.bf}%</span>}
              {m.waist && <span style={{ color: "var(--amber)" }}>{m.waist}cm</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// BMI CALCULATOR
// ─────────────────────────────────────────────────
function CalcSection({ client }) {
  const [weight, setWeight] = useState(client.weight);
  const [height, setHeight] = useState(client.height);
  const [age, setAge] = useState(calcAge(client.dob));
  const bmi = calcBMI(weight, height);
  const cat = bmiCat(bmi);
  const tdee = calcTDEE(weight, height, age, client.sex);
  const deficit = tdee - 400;
  const bmiN = parseFloat(bmi);
  const bmiPct = Math.min(100, Math.max(0, ((bmiN - 15) / 20) * 100));

  const Spin = ({ val, set, label, step = 1, min = 1 }) => (
    <div className="calc-row">
      <span className="calc-lbl">{label}</span>
      <div className="calc-ctrl">
        <button className="calc-btn" onClick={() => set(v => Math.max(min, parseFloat((v - step).toFixed(1))))}>−</button>
        <span className="calc-num">{val}</span>
        <button className="calc-btn" onClick={() => set(v => parseFloat((v + step).toFixed(1)))}>+</button>
      </div>
    </div>
  );

  return (
    <div className="sec fade-in">
      <div className="ctitle" style={{ marginBottom: 12 }}>Calcolatori personalizzati</div>
      <Spin val={weight} set={setWeight} label="Peso (kg)" step={0.5} min={30} />
      <Spin val={height} set={setHeight} label="Altezza (cm)" min={100} />
      <Spin val={age} set={setAge} label="Età (anni)" min={10} />

      <div className="bmi-result" style={{ background: `${cat.c}0d`, borderColor: `${cat.c}40` }}>
        <div style={{ fontSize: 9, color: cat.c, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>Indice di Massa Corporea</div>
        <div className="bmi-big" style={{ color: cat.c }}>{bmi}</div>
        <div className="bmi-cat" style={{ color: cat.c }}>{cat.label}</div>
        <div className="bmi-bar-bg">
          <div style={{ height: "100%", width: `${bmiPct}%`, background: `linear-gradient(90deg,var(--blue),${cat.c})`, borderRadius: 8, transition: "width .6s ease" }} />
        </div>
        <div className="bmi-bar-lbls"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>35</span></div>
      </div>

      <div style={{ fontSize: 9, color: "var(--text3)", textTransform: "uppercase", letterSpacing: 3, margin: "18px 0 10px", fontWeight: 600 }}>Fabbisogno calorico</div>
      <div className="card">
        {[
          ["TDEE (attività moderata)", `${tdee} kcal`, null],
          ["Target deficit (−400)", `${deficit} kcal`, "var(--lime)"],
          ["Proteine", `${Math.round(weight * 2)}g`, "var(--blue)"],
          ["Carboidrati", `${Math.round((deficit * 0.4) / 4)}g`, "var(--amber)"],
          ["Grassi", `${Math.round((deficit * 0.25) / 9)}g`, "var(--red)"],
          ["BMI Ideale range", `18.5 – 24.9`, null],
        ].map(([l, v, c]) => (
          <div key={l} className="tdee-row">
            <span className="tdee-lbl">{l}</span>
            <span className="tdee-val" style={{ color: c || "var(--text)" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "var(--text3)", textAlign: "center", marginTop: 10, lineHeight: 1.7 }}>
        Formula Mifflin-St Jeor · Solo indicativo<br />Consulta sempre un professionista
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// SHARE TAB (coach)
// ─────────────────────────────────────────────────
function ShareTab({ client }) {
  const link = `https://tuodominio.com/?c=${client.id}`;
  const [copied, setCopied] = useState(false);
  const copy = () => {
    try { navigator.clipboard.writeText(link); } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };
  return (
    <div className="sec fade-in">
      <div className="share-box">
        <div style={{ fontSize: 9, color: "var(--lime)", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Link personale</div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 6, lineHeight: 1.7 }}>
          Invia questo link a <strong style={{ color: "var(--text)" }}>{client.name}</strong> su WhatsApp.<br />
          Vedrà solo i suoi dati, aggiornati in tempo reale.
        </div>
        <div className="share-code">{link}</div>
        <button className="btn btn-lime" style={{ width: "100%", marginTop: 12 }} onClick={copy}>
          {copied ? "✅ Copiato!" : "📋 Copia link"}
        </button>
      </div>

      <div className="card">
        <div className="ctitle">Scheda anagrafica completa</div>
        {[
          ["ID cliente", client.id],
          ["Email", client.email],
          ["Età", `${calcAge(client.dob)} anni`],
          ["Sesso", client.sex === "M" ? "Maschio" : "Femmina"],
          ["Altezza", `${client.height} cm`],
          ["Peso iniziale", `${client.weight} kg`],
          ["BMI", `${calcBMI(client.weight, client.height)} — ${bmiCat(calcBMI(client.weight, client.height)).label}`],
          ["TDEE est.", `${calcTDEE(client.weight, client.height, calcAge(client.dob), client.sex)} kcal`],
          ["Obiettivo", client.goal],
          ["Inizio programma", fmtDate(client.start)],
          ["Fine programma", client.end ? fmtDate(client.end) : "—"],
          ["Stato", client.status === "active" ? "🟢 Attivo" : client.status === "completed" ? "✅ Completato" : "⏸ In pausa"],
        ].map(([l, v]) => (
          <div key={l} className="irow"><span className="ilbl">{l}</span><span className="ival">{v}</span></div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// COACH DETAIL VIEW
// ─────────────────────────────────────────────────
const COACH_STABS = [
  { id: "workout", l: "🏋️ Workout" },
  { id: "nutrition", l: "🥗 Dieta" },
  { id: "progress", l: "📈 Progressi" },
  { id: "calc", l: "🧮 Calcoli" },
  { id: "share", l: "🔗 Link" },
];

function CoachDetail({ client, onBack }) {
  const [tab, setTab] = useState("workout");
  const pct = progPct(client.start, client.end);

  return (
    <div className="shell">
      <div className="hdr">
        <div className="back" onClick={onBack}>← Tutti i clienti</div>
        <div className="hdr-row">
          <div>
            <div className="big-name">{client.name}</div>
            <div className="hdr-sub">{client.program}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn btn-ghost btn-sm">✏️ Modifica</button>
            <div className="av" style={{ width: 40, height: 40, background: client.color, fontSize: 13 }}>{client.avatar}</div>
          </div>
        </div>
        {client.status === "active" && (
          <div className="pill-live"><span className="dot" />{client.program} · {pct}%</div>
        )}
      </div>

      <div className="stabs">
        {COACH_STABS.map(t => (
          <div key={t.id} className={`stab${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>{t.l}</div>
        ))}
      </div>

      {tab === "workout" && <WorkoutSection clientId={client.id} editable />}
      {tab === "nutrition" && <NutritionSection clientId={client.id} />}
      {tab === "progress" && <ProgressSection client={client} />}
      {tab === "calc" && <CalcSection client={client} />}
      {tab === "share" && <ShareTab client={client} />}
    </div>
  );
}

// ─────────────────────────────────────────────────
// CLIENT HOME TAB
// ─────────────────────────────────────────────────
function ClientHome({ client }) {
  const ms = MEASUREMENTS[client.id] || [];
  const latest = ms[ms.length - 1];
  const first = ms[0];
  const bmi = calcBMI(latest?.weight || client.weight, client.height);
  const cat = bmiCat(bmi);
  const pct = progPct(client.start, client.end);
  const wDelta = latest && first ? (latest.weight - first.weight).toFixed(1) : null;
  const bfDelta = latest && first ? (latest.bf - first.bf).toFixed(1) : null;
  const waistDelta = latest && first ? (latest.waist - first.waist).toFixed(1) : null;

  const chartData = ms.map(m => ({ ...m, date: fmtDate(m.date) }));

  return (
    <div className="sec">
      {/* Program progress */}
      {client.status === "active" && (
        <div className="pbar-wrap">
          <div className="pbar-head">
            <span>Completamento programma</span>
            <span>{pct}%</span>
          </div>
          <PBar pct={pct} />
        </div>
      )}

      {/* Stats grid */}
      {latest && (
        <div className="grid2 stagger">
          <div className="sbox">
            <div className="slbl">Peso</div>
            <div><span className="sval">{latest.weight}</span><span className="sunit">kg</span></div>
            {wDelta && <div className={`sdelta ${parseFloat(wDelta) < 0 ? "pos" : "neg"}`}>{parseFloat(wDelta) > 0 ? "+" : ""}{wDelta}kg</div>}
          </div>
          <div className="sbox">
            <div className="slbl">BMI</div>
            <div><span className="sval" style={{ color: cat.c, fontSize: 28 }}>{bmi}</span></div>
            <div className="sdelta" style={{ color: cat.c }}>{cat.label}</div>
          </div>
          {latest.bf && (
            <div className="sbox">
              <div className="slbl">Grasso corp.</div>
              <div><span className="sval">{latest.bf}</span><span className="sunit">%</span></div>
              {bfDelta && <div className={`sdelta ${parseFloat(bfDelta) < 0 ? "pos" : "neg"}`}>{bfDelta}%</div>}
            </div>
          )}
          {latest.waist && (
            <div className="sbox">
              <div className="slbl">Vita</div>
              <div><span className="sval">{latest.waist}</span><span className="sunit">cm</span></div>
              {waistDelta && <div className={`sdelta ${parseFloat(waistDelta) < 0 ? "pos" : "neg"}`}>{waistDelta}cm</div>}
            </div>
          )}
        </div>
      )}

      {/* Weight chart */}
      {chartData.length > 1 && (
        <div className="card card-lime">
          <div className="ctitle">Andamento peso</div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={client.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={client.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fill: "#444", fontSize: 9 }} />
              <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fill: "#444", fontSize: 9 }} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="weight" stroke={client.color} strokeWidth={2.5}
                fill="url(#hg)" dot={{ fill: client.color, r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Info card */}
      <div className="card">
        <div className="ctitle">La tua scheda</div>
        {[
          ["Obiettivo", client.goal],
          ["Programma", client.program],
          ["Altezza", `${client.height} cm`],
          ["Inizio", fmtDate(client.start)],
          client.end && ["Fine", fmtDate(client.end)],
          ["Coach", "Marco Bianchi"],
        ].filter(Boolean).map(([l, v]) => (
          <div key={l} className="irow"><span className="ilbl">{l}</span><span className="ival">{v}</span></div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// CLIENT APP
// ─────────────────────────────────────────────────
const CLIENT_TABS = [
  { id: "home", icon: "⚡", lbl: "Home" },
  { id: "workout", icon: "🏋️", lbl: "Training" },
  { id: "nutrition", icon: "🥗", lbl: "Dieta" },
  { id: "progress", icon: "📈", lbl: "Progressi" },
  { id: "calc", icon: "🧮", lbl: "Calcoli" },
];

function ClientApp({ client }) {
  const [tab, setTab] = useState("home");
  const pct = progPct(client.start, client.end);

  return (
    <div className="shell">
      <div className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-sub">ForgeCoach</div>
            <div className="big-name">{client.name}</div>
          </div>
          <div className="av" style={{ width: 44, height: 44, background: client.color, fontSize: 14 }}>{client.avatar}</div>
        </div>
        {client.status === "active" && (
          <div className="pill-live"><span className="dot" />{client.program} · Settimana {Math.max(1, Math.ceil((Date.now() - new Date(client.start)) / (7 * 24 * 3600 * 1000)))}</div>
        )}
      </div>

      <div key={tab} className="fade-in">
        {tab === "home" && <ClientHome client={client} />}
        {tab === "workout" && <WorkoutSection clientId={client.id} />}
        {tab === "nutrition" && <NutritionSection clientId={client.id} />}
        {tab === "progress" && <ProgressSection client={client} />}
        {tab === "calc" && <CalcSection client={client} />}
      </div>

      <div className="nav">
        {CLIENT_TABS.map(t => (
          <div key={t.id} className={`nav-tab${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
            <span className="nav-ico">{t.icon}</span>
            <span className="nav-lbl">{t.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// DEMO SWITCHER BAR
// ─────────────────────────────────────────────────
function DemoBar({ mode, setMode, clientId, setClientId }) {
  return (
    <div className="demo-bar">
      <span className="demo-bar-label">🎯 DEMO</span>
      <select className="demo-select" value={mode === "coach" ? "coach" : `client:${clientId}`}
        onChange={e => {
          const v = e.target.value;
          if (v === "coach") { setMode("coach"); }
          else { setClientId(v.split(":")[1]); setMode("client"); }
        }}>
        <option value="coach">🧑‍💼 Vista Coach</option>
        {CLIENTS.map(c => (
          <option key={c.id} value={`client:${c.id}`}>👤 {c.name.split(" ")[0]}</option>
        ))}
      </select>
    </div>
  );
}

// ─────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("login"); // login | coach | client
  const [selected, setSelected] = useState(null);
  const [clientId, setClientId] = useState(CLIENTS[0].id);
  const [showDemo, setShowDemo] = useState(false);

  const currentClient = CLIENTS.find(c => c.id === clientId) || CLIENTS[0];

  return (
    <>
      <style>{CSS}</style>

      {/* Demo switcher (appears after login) */}
      {showDemo && (
        <DemoBar
          mode={mode}
          setMode={m => { setMode(m); setSelected(null); }}
          clientId={clientId}
          setClientId={id => { setClientId(id); setSelected(null); }}
        />
      )}

      <div style={{ paddingTop: showDemo ? 42 : 0 }}>
        {mode === "login" && (
          <Login onLogin={() => { setMode("coach"); setShowDemo(true); }} />
        )}

        {mode === "coach" && !selected && (
          <CoachHome
            onSelect={c => setSelected(c)}
            onLogout={() => { setMode("login"); setShowDemo(false); }}
          />
        )}

        {mode === "coach" && selected && (
          <CoachDetail client={selected} onBack={() => setSelected(null)} />
        )}

        {mode === "client" && (
          <ClientApp client={currentClient} />
        )}
      </div>
    </>
  );
}
