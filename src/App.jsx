import { useState, useEffect, useRef } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#0B0B12",
  surface: "#15151F",
  card: "#1E1E2E",
  cardHover: "#252538",
  border: "#2A2A3D",
  accent: "#C6F135",
  accentDim: "#8FAF1A",
  purple: "#7C5CFC",
  purpleLight: "#A084FD",
  orange: "#FF6B35",
  teal: "#00D4AA",
  textPrimary: "#F0F0F8",
  textSecondary: "#8888AA",
  textMuted: "#55556A",
  success: "#4ADE80",
  red: "#FF5C5C",
};

const exercises = [
  { id: 1, name: "Jump Squats",       sets: 3, reps: "12 reps", muscle: ["Quads", "Glutes", "Core"],    emoji: "🦵" },
  { id: 2, name: "Push-Ups",          sets: 3, reps: "10 reps", muscle: ["Chest", "Triceps", "Core"],   emoji: "💪" },
  { id: 3, name: "Mountain Climbers", sets: 3, reps: "30 sec",  muscle: ["Core", "Cardio"],              emoji: "🏔️" },
  { id: 4, name: "Glute Bridges",     sets: 3, reps: "15 reps", muscle: ["Glutes", "Hamstrings"],        emoji: "🍑" },
  { id: 5, name: "Plank Hold",        sets: 3, reps: "45 sec",  muscle: ["Core", "Shoulders"],           emoji: "🧘" },
];

const planWeeks = [
  { week: 1, title: "Foundation & Energy Boost",      goal: "Build habit, improve mobility, start fat-burning",   color: C.teal,
    days: [
      { day: 1,  label: "Full Body Activation",  duration: "22 min" },
      { day: 2,  label: "Core & Mobility",        duration: "20 min" },
      { day: 3,  label: "REST DAY",               duration: "Active rest",     rest: true },
      { day: 4,  label: "Lower Body Burn",        duration: "25 min" },
      { day: 5,  label: "Upper Body Strength",    duration: "22 min" },
      { day: 6,  label: "Cardio Blast",           duration: "28 min" },
      { day: 7,  label: "REST DAY",               duration: "Stretch & relax", rest: true },
    ]},
  { week: 2, title: "Build Strength & Fat Burn",      goal: "Increase reps, add intensity",                        color: C.accent,
    days: [
      { day: 8,  label: "Power Squats",           duration: "30 min" },
      { day: 9,  label: "Push Power",             duration: "28 min" },
      { day: 10, label: "REST DAY",               duration: "Active rest",     rest: true },
      { day: 11, label: "Glute & Hamstring",      duration: "32 min" },
      { day: 12, label: "HIIT Circuit",           duration: "35 min" },
      { day: 13, label: "Full Body Burn",         duration: "38 min" },
      { day: 14, label: "REST DAY",               duration: "Stretch & yoga",  rest: true },
    ]},
  { week: 3, title: "Progression & Challenge",        goal: "Longer sessions, higher intensity",                   color: C.purple,
    days: [
      { day: 15, label: "Explosive Power",        duration: "38 min" },
      { day: 16, label: "Core Shredder",          duration: "35 min" },
      { day: 17, label: "REST DAY",               duration: "Active rest",     rest: true },
      { day: 18, label: "Leg Day Pro",            duration: "40 min" },
      { day: 19, label: "Push & Pull",            duration: "38 min" },
      { day: 20, label: "Cardio Warfare",         duration: "42 min" },
      { day: 21, label: "REST DAY",               duration: "Recovery",        rest: true },
    ]},
  { week: 4, title: "Fat Burn + Flexibility Mastery", goal: "Combine strength, cardio & flexibility",              color: C.orange,
    days: [
      { day: 22, label: "Total Body Blast",       duration: "45 min" },
      { day: 23, label: "Core Mastery",           duration: "40 min" },
      { day: 24, label: "REST DAY",               duration: "Stretch focus",   rest: true },
      { day: 25, label: "Lower Body Elite",       duration: "42 min" },
      { day: 26, label: "Upper Finale",           duration: "38 min" },
      { day: 27, label: "Peak Performance",       duration: "50 min" },
      { day: 28, label: "GRADUATION DAY 🎉",      duration: "45 min" },
    ]},
];

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS = {
  weekDone: "fitflow_weekDone",
  water:    "fitflow_water",
  weight:   "fitflow_weight",
  height:   "fitflow_height",
};

const lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const lsSet = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};

const blankDone = () => planWeeks.map(w => w.days.map(() => false));

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  app:      { background: C.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Inter', -apple-system, sans-serif", padding: "20px 16px" },
  phone:    { width: 390, minHeight: 844, background: C.bg, borderRadius: 48, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)", position: "relative", display: "flex", flexDirection: "column" },
  statusBar:{ padding: "14px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 },
  content:  { flex: 1, overflowY: "auto", paddingBottom: 80, scrollbarWidth: "none" },
  bottomNav:{ position: "absolute", bottom: 0, left: 0, right: 0, background: `${C.surface}F0`, backdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "12px 8px 24px" },
  navItem:  (a) => ({ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 16px", borderRadius: 16, cursor: "pointer", background: a ? `${C.accent}18` : "transparent", transition: "all 0.2s" }),
  navIcon:  (a) => ({ fontSize: 22, filter: a ? "none" : "grayscale(1) opacity(0.5)" }),
  navLabel: (a) => ({ fontSize: 10, fontWeight: 600, color: a ? C.accent : C.textMuted, letterSpacing: 0.3 }),
  section:  { padding: "0 20px", marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 },
  h1:       { fontSize: 26, fontWeight: 800, color: C.textPrimary, lineHeight: 1.2 },
  h2:       { fontSize: 20, fontWeight: 700, color: C.textPrimary },
  card:     { background: C.card, borderRadius: 20, padding: 20, border: `1px solid ${C.border}` },
  btn:      (bg, txt) => ({ background: bg, color: txt, border: "none", borderRadius: 16, padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: 0.3 }),
  row:      { display: "flex", alignItems: "center", gap: 8 },
  between:  { display: "flex", alignItems: "center", justifyContent: "space-between" },
};

// ─── Shared Components ────────────────────────────────────────────────────────
const StatPill = ({ label, value, color }) => (
  <div style={{ background: C.surface, borderRadius: 16, padding: "12px 16px", flex: 1, textAlign: "center" }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: color || C.accent }}>{value}</div>
    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{label}</div>
  </div>
);

const Tag = ({ label, color }) => (
  <span style={{ background: `${color}22`, color, borderRadius: 8, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>{label}</span>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseMins = (dur) => { const m = dur.match(/(\d+)/); return m ? parseInt(m[1]) : 0; };
const CAL_PER_MIN = 9.5;

function computeStats(weekDone) {
  const allDays    = planWeeks.flatMap((w, wi) => w.days.map((d, di) => ({ ...d, weekIdx: wi, weekColor: w.color, weekNum: w.week, isDone: weekDone[wi]?.[di] ?? false })));
  const active     = allDays.filter(d => !d.rest);
  const completed  = active.filter(d => d.isDone);
  const totalWorkouts = completed.length;
  const totalMins  = completed.reduce((a, d) => a + parseMins(d.duration), 0);
  const totalCals  = Math.round(totalMins * CAL_PER_MIN);
  const ordered    = active.map(d => d.isDone);
  let streak = 0;
  for (let i = ordered.length - 1; i >= 0; i--) { if (ordered[i]) streak++; else if (streak > 0) break; }
  return { allDays, active, completed, totalWorkouts, totalMins, totalCals, streak };
}

// ─── SCREEN: Home ─────────────────────────────────────────────────────────────
function HomeScreen({ onStartWorkout, weekDone }) {
  const [water, setWater] = useState(() => lsGet(LS.water, 0));
  const maxWater = 8;
  const setWaterPersist = (v) => { setWater(v); lsSet(LS.water, v); };

  const { allDays, active, totalWorkouts, totalMins, totalCals, streak } = computeStats(weekDone);

  const nextDay        = allDays.find(d => !d.rest && !d.isDone);
  const curWeekIdx     = nextDay ? nextDay.weekIdx : planWeeks.length - 1;
  const curWeekPlan    = planWeeks[curWeekIdx];
  const thisWeekDays   = curWeekPlan.days.map((d, di) => ({ ...d, isDone: weekDone[curWeekIdx]?.[di] ?? false }));
  const thisWeekActive = thisWeekDays.filter(d => !d.rest);
  const thisWeekDone   = thisWeekActive.filter(d => d.isDone).length;
  const maxDur         = Math.max(...thisWeekDays.map(d => !d.rest && d.isDone ? parseMins(d.duration) : 0), 1);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const streakMsg = streak === 0
    ? { title: "Start your streak! 💪", sub: "Complete your first workout today", color: C.purple }
    : streak < 3
    ? { title: `${streak}-Day Streak! 🔥`, sub: "Great start — keep the momentum going", color: C.orange }
    : streak < 7
    ? { title: `${streak}-Day Streak! 🔥`, sub: "You're building a strong habit!", color: C.orange }
    : { title: `${streak}-Day Streak! 🔥`, sub: "Incredible — you're on fire!", color: C.orange };

  const dynamicBadges = [
    { icon: "⚡", name: "First Workout", color: C.accent,  earned: totalWorkouts >= 1 },
    { icon: "🔥", name: "3-Day Streak",  color: C.orange,  earned: streak >= 3 },
    { icon: "🏅", name: "5 Workouts",    color: C.teal,    earned: totalWorkouts >= 5 },
    { icon: "💎", name: "Week 1 Done",   color: C.purple,  earned: curWeekPlan.week > 1 || thisWeekDone === thisWeekActive.length },
    { icon: "🔥", name: "7-Day Streak",  color: C.orange,  earned: streak >= 7 },
    { icon: "🌟", name: "Halfway There", color: C.teal,    earned: totalWorkouts >= active.length / 2 },
  ].filter(b => b.earned).slice(0, 3);

  const fmtCal = (c) => c >= 1000 ? `${(c / 1000).toFixed(1)}k` : `${c}`;

  return (
    <div style={s.content}>
      {/* Header */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={s.between}>
          <div>
            <div style={{ fontSize: 14, color: C.textMuted, marginBottom: 4 }}>{greeting} 👋</div>
            <div style={s.h1}>Karan</div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>K</div>
            <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: C.accent, borderRadius: 7, border: `2px solid ${C.bg}` }} />
          </div>
        </div>

        {/* Streak Banner */}
        <div style={{ marginTop: 20, background: `linear-gradient(135deg, ${streakMsg.color}22, ${C.purple}22)`, border: `1px solid ${streakMsg.color}44`, borderRadius: 20, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 36 }}>{streak === 0 ? "💤" : "🔥"}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary }}>{streakMsg.title}</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>{streakMsg.sub}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ ...s.section, marginTop: 24 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <StatPill label="Workouts" value={totalWorkouts || "—"} color={C.accent} />
          <StatPill label="Calories"  value={totalCals > 0 ? fmtCal(totalCals) : "—"} color={C.orange} />
          <StatPill label="Minutes"   value={totalMins > 0 ? totalMins : "—"} color={C.purple} />
        </div>
      </div>

      {/* Up Next */}
      <div style={s.section}>
        <div style={s.sectionTitle}>UP NEXT</div>
        {nextDay ? (
          <div style={{ background: "linear-gradient(135deg, #1A1A30, #252540)", borderRadius: 24, padding: 20, border: `1px solid ${C.border}`, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: `${nextDay.weekColor}0A`, borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: -30, right: 20, width: 80, height: 80, background: `${C.purple}0A`, borderRadius: "50%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
              <div>
                <Tag label={`Week ${nextDay.weekNum} · Day ${nextDay.day}`} color={nextDay.weekColor} />
                <div style={{ ...s.h2, marginTop: 10 }}>{nextDay.label}</div>
                <div style={{ color: C.textSecondary, fontSize: 13, marginTop: 4 }}>{curWeekPlan.title}</div>
              </div>
              <div style={{ fontSize: 48 }}>🏋️</div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
              <div style={s.row}><span style={{ color: C.accent, fontSize: 14 }}>⏱</span><span style={{ fontSize: 13, color: C.textSecondary }}>{nextDay.duration}</span></div>
              <div style={s.row}><span style={{ color: C.orange, fontSize: 14 }}>🔥</span><span style={{ fontSize: 13, color: C.textSecondary }}>~{Math.round(parseMins(nextDay.duration) * CAL_PER_MIN)} cal</span></div>
              <div style={s.row}><span style={{ color: C.purple, fontSize: 14 }}>💪</span><span style={{ fontSize: 13, color: C.textSecondary }}>{exercises.length} exercises</span></div>
            </div>
            <button onClick={() => onStartWorkout(nextDay.weekNum, nextDay.day)} style={{ ...s.btn(nextDay.weekColor, C.bg), marginTop: 16, borderRadius: 14, fontSize: 15 }}>
              Start Workout →
            </button>
          </div>
        ) : (
          <div style={{ ...s.card, textAlign: "center", padding: 28 }}>
            <div style={{ fontSize: 52 }}>🏆</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.accent, marginTop: 10 }}>Program Complete!</div>
            <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 6 }}>You finished all 28 days. Incredible work!</div>
          </div>
        )}
      </div>

      {/* This Week Chart */}
      <div style={s.section}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1.5, textTransform: "uppercase" }}>Week {curWeekPlan.week} — {curWeekPlan.title}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: curWeekPlan.color }}>{thisWeekDone} / {thisWeekActive.length} <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 400 }}>days</span></div>
        </div>
        <div style={{ ...s.card, paddingTop: 16, paddingBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", height: 60 }}>
            {thisWeekDays.map((d) => {
              const mins   = d.isDone ? parseMins(d.duration) : 0;
              const h      = d.rest ? 10 : mins > 0 ? Math.max(16, (mins / maxDur) * 60) : 8;
              const isNext = nextDay && d.day === nextDay.day;
              return (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{ width: "100%", height: h, background: d.rest ? C.border : mins > 0 ? `linear-gradient(180deg, ${curWeekPlan.color}, ${curWeekPlan.color}88)` : isNext ? `${curWeekPlan.color}33` : C.surface, borderRadius: 6, border: isNext ? `1px dashed ${curWeekPlan.color}` : "none", transition: "height 0.3s" }} />
                  <div style={{ fontSize: 9, color: isNext ? curWeekPlan.color : d.isDone ? C.accent : C.textMuted, fontWeight: isNext || d.isDone ? 700 : 400 }}>D{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hydration */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Hydration</div>
        <div style={s.card}>
          <div style={s.between}>
            <div>
              <div style={{ fontSize: 13, color: C.textSecondary }}>Daily goal: 8 glasses</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.teal, marginTop: 4 }}>{water} / {maxWater} <span style={{ fontSize: 13, fontWeight: 500, color: C.textMuted }}>glasses</span></div>
            </div>
            <div style={{ fontSize: 32 }}>💧</div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            {Array.from({ length: maxWater }).map((_, i) => (
              <div key={i} onClick={() => setWaterPersist(i < water ? i : i + 1)}
                style={{ flex: 1, height: 28, borderRadius: 8, background: i < water ? C.teal : C.surface, border: `1px solid ${i < water ? C.teal : C.border}`, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                {i < water ? "💧" : ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      {dynamicBadges.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionTitle}>Recent Badges</div>
          <div style={{ display: "flex", gap: 12 }}>
            {dynamicBadges.map((b) => (
              <div key={b.name} style={{ background: C.card, borderRadius: 16, padding: "12px 16px", border: `1px solid ${b.color}44`, textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 28 }}>{b.icon}</div>
                <div style={{ fontSize: 10, color: b.color, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: Workout ──────────────────────────────────────────────────────────
function WorkoutScreen({ onBack, weekDone, updateWeekDone, resetAllProgress, startWeek, startDay }) {
  const defaultWeek = startWeek ?? 1;
  const defaultDay  = startDay  ?? planWeeks[0].days[0].day;

  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);
  const [selectedDay,  setSelectedDay]  = useState(defaultDay);
  const [activeEx,     setActiveEx]     = useState(0);
  const [sets,         setSets]         = useState(() => exercises.map(() => [false, false, false]));
  const [timer,        setTimer]        = useState(null);
  const [timeLeft,     setTimeLeft]     = useState(30);
  const [resting,      setResting]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const intervalRef = useRef(null);

  const ex            = exercises[activeEx];
  const curWeekData   = planWeeks[selectedWeek - 1];
  const curDayIdx     = curWeekData.days.findIndex(d => d.day === selectedDay);
  const curDayStatic  = curWeekData.days[curDayIdx] || curWeekData.days[0];
  const curDayDone    = weekDone[selectedWeek - 1]?.[curDayIdx] ?? false;
  const curDayData    = { ...curDayStatic, done: curDayDone };

  const totalSets     = exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets      = sets.reduce((a, s) => a + s.filter(Boolean).length, 0);
  const progress      = doneSets / totalSets;
  const completedAll  = sets.every(s => s.every(Boolean));
  const AUTO_REST     = 30;

  // Auto-mark day done when all sets completed
  useEffect(() => {
    if (completedAll && curDayIdx !== -1 && !weekDone[selectedWeek - 1]?.[curDayIdx]) {
      const next = weekDone.map((wk, wi) => wk.map((v, di) => wi === selectedWeek - 1 && di === curDayIdx ? true : v));
      updateWeekDone(next);
    }
  }, [completedAll]);

  const startTimer = (secs) => {
    clearInterval(intervalRef.current);
    setTimeLeft(secs); setTimer(secs); setResting(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(intervalRef.current); setResting(false); setTimer(null); return secs; } return t - 1; });
    }, 1000);
  };

  const toggleSet = (exIdx, setIdx) => {
    const next = sets.map((s, i) => i === exIdx ? s.map((v, j) => j === setIdx ? !v : v) : s);
    setSets(next);
    if (next[exIdx][setIdx]) {
      startTimer(AUTO_REST);
      if (next[exIdx].every(Boolean) && exIdx < exercises.length - 1) setTimeout(() => setActiveEx(exIdx + 1), 400);
    }
  };

  const resetSession = () => {
    clearInterval(intervalRef.current);
    setSets(exercises.map(() => [false, false, false]));
    setActiveEx(0); setResting(false); setTimer(null); setTimeLeft(30);
  };

  const resetWorkout = () => {
    resetSession(); resetAllProgress();
    setSelectedWeek(1); setSelectedDay(planWeeks[0].days[0].day); setShowConfirm(false);
  };

  return (
    <div style={s.content}>
      {/* Header */}
      <div style={{ padding: "16px 20px 0" }}>
        <div style={s.between}>
          <button onClick={onBack} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary, borderRadius: 12, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Back</button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color: C.textMuted }}>Week {selectedWeek} · Day {selectedDay}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>{curDayData.label}</div>
          </div>
          <button onClick={() => setShowConfirm(true)} style={{ background: `${C.red}18`, border: `1px solid ${C.red}55`, color: C.red, borderRadius: 12, padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
            ↺ Reset
          </button>
        </div>
        <div style={{ marginTop: 14, background: C.surface, borderRadius: 6, height: 6 }}>
          <div style={{ width: `${progress * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.accent}, ${C.teal})`, borderRadius: 6, transition: "width 0.4s" }} />
        </div>
        <div style={{ ...s.between, marginTop: 6 }}>
          <div style={{ fontSize: 11, color: C.textMuted }}>{doneSets} of {totalSets} sets done</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>{curDayData.duration}</div>
        </div>
      </div>

      {/* Week Selector */}
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Select Week</div>
        <div style={{ display: "flex", gap: 8 }}>
          {planWeeks.map(w => (
            <button key={w.week} onClick={() => { setSelectedWeek(w.week); setSelectedDay(w.days[0].day); resetSession(); }}
              style={{ flex: 1, background: selectedWeek === w.week ? w.color : C.surface, border: `1px solid ${selectedWeek === w.week ? w.color : C.border}`, borderRadius: 14, padding: "10px 4px", cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: selectedWeek === w.week ? C.bg : C.textMuted }}>W{w.week}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Day Selector */}
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Select Day</div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
          {curWeekData.days.map((d, di) => {
            const isSel  = d.day === selectedDay;
            const isDone = weekDone[selectedWeek - 1]?.[di] ?? false;
            return (
              <button key={d.day} onClick={() => { setSelectedDay(d.day); resetSession(); }}
                style={{ flexShrink: 0, background: isSel ? `${curWeekData.color}33` : C.surface, border: `2px solid ${isSel ? curWeekData.color : isDone ? `${C.success}55` : C.border}`, borderRadius: 14, padding: "8px 10px", cursor: "pointer", textAlign: "center", minWidth: 52, transition: "all 0.2s" }}>
                <div style={{ fontSize: 16 }}>{d.rest ? "😴" : isDone ? "✅" : "🏋️"}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: isSel ? curWeekData.color : isDone ? C.success : C.textMuted, marginTop: 3 }}>D{d.day}</div>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 10, background: `${curWeekData.color}12`, border: `1px solid ${curWeekData.color}33`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{curDayData.label}</div>
            <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{curWeekData.title}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: curWeekData.color }}>{curDayData.duration}</div>
            {curDayData.done && <div style={{ fontSize: 10, color: C.success }}>Completed ✓</div>}
            {curDayData.rest && <div style={{ fontSize: 10, color: C.textMuted }}>Rest Day</div>}
          </div>
        </div>
      </div>

      {/* Rest Timer Banner */}
      {resting && (
        <div style={{ margin: "16px 20px 0", background: `linear-gradient(135deg, ${C.purple}33, ${C.purple}11)`, border: `1px solid ${C.purple}66`, borderRadius: 18, padding: 18, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, background: C.purpleLight, borderRadius: 4 }} />
            <div style={{ fontSize: 12, color: C.purpleLight, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>Set Complete — Rest Now ✓</div>
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.textPrimary, lineHeight: 1 }}>
            {timeLeft}<span style={{ fontSize: 20, color: C.textSecondary }}>s</span>
          </div>
          <div style={{ margin: "10px auto 4px", width: "100%", background: C.surface, borderRadius: 6, height: 6 }}>
            <div style={{ width: `${(timeLeft / AUTO_REST) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.purple}, ${C.purpleLight})`, borderRadius: 6, transition: "width 1s linear" }} />
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 6 }}>
            {activeEx < exercises.length ? `Up next: ${exercises[activeEx].name}` : "Last exercise done!"}
          </div>
          <button onClick={() => { clearInterval(intervalRef.current); setResting(false); setTimer(null); }}
            style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.textSecondary, borderRadius: 10, padding: "7px 20px", cursor: "pointer", fontSize: 12, fontWeight: 600, marginTop: 10 }}>
            Skip Rest →
          </button>
        </div>
      )}

      {/* Exercise Tabs */}
      <div style={{ padding: "16px 20px 12px", display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
        {exercises.map((e, i) => {
          const done = sets[i].every(Boolean);
          return (
            <div key={e.id} onClick={() => setActiveEx(i)} style={{ flexShrink: 0, background: i === activeEx ? `${C.accent}22` : C.surface, border: `2px solid ${i === activeEx ? C.accent : done ? C.success + "55" : C.border}`, borderRadius: 14, padding: "8px 14px", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
              <div style={{ fontSize: 20 }}>{e.emoji}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: i === activeEx ? C.accent : done ? C.success : C.textMuted, marginTop: 2 }}>{done ? "✓" : e.id}</div>
            </div>
          );
        })}
      </div>

      {/* Exercise Card */}
      <div style={s.section}>
        <div style={{ ...s.card, borderColor: `${C.accent}33` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{ex.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, lineHeight: 1.2 }}>{ex.name}</div>
            </div>
            <div style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}55`, borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.accent }}>{ex.reps}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>× {ex.sets} sets</div>
            </div>
          </div>
          <div style={{ marginTop: 16, background: `linear-gradient(135deg, ${C.surface}, #1A1A2E)`, borderRadius: 16, height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${C.purple}11, transparent)` }} />
            <div style={{ fontSize: 52 }}>{ex.emoji}</div>
            <div style={{ marginTop: 8, background: `${C.bg}AA`, borderRadius: 20, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, background: C.red, borderRadius: 4 }} />
              <span style={{ fontSize: 11, color: C.textSecondary }}>Exercise Demo · Auto-plays</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            {ex.muscle.map(m => <Tag key={m} label={m} color={C.purple} />)}
          </div>
        </div>
      </div>

      {/* Set Tracker */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Set Completion</div>
        <div style={s.card}>
          {exercises.map((e, exIdx) => (
            <div key={e.id} style={{ marginBottom: exIdx < exercises.length - 1 ? 16 : 0 }}>
              <div style={{ ...s.between, marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: exIdx === activeEx ? C.accent : C.textSecondary }}>{e.name}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{sets[exIdx].filter(Boolean).length}/{e.sets}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {sets[exIdx].map((done, setIdx) => {
                  const isLast   = setIdx === e.sets - 1;
                  const prevDone = setIdx === 0 || sets[exIdx][setIdx - 1];
                  return (
                    <div key={setIdx} onClick={() => toggleSet(exIdx, setIdx)}
                      style={{ width: 40, height: 40, borderRadius: 12, background: done ? C.accent : C.surface, border: `2px solid ${done ? C.accent : prevDone && !done ? C.accentDim : C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.2s", transform: done ? "scale(1.05)" : "scale(1)", boxShadow: isLast && prevDone && !done ? `0 0 8px ${C.accent}55` : "none" }}>
                      {done ? "✓" : isLast && prevDone ? "!" : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rest Timer Buttons */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Rest Timer</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[30, 60, 90].map(sec => (
            <button key={sec} onClick={() => startTimer(sec)}
              style={{ flex: 1, background: timer === sec && resting ? `${C.purple}44` : C.surface, border: `1px solid ${timer === sec && resting ? C.purple : C.border}`, borderRadius: 14, padding: "12px 8px", cursor: "pointer", color: timer === sec && resting ? C.purpleLight : C.textSecondary, fontSize: 14, fontWeight: 700, transition: "all 0.2s" }}>
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {completedAll && (
        <div style={s.section}>
          <div style={{ background: `linear-gradient(135deg, ${C.accent}22, ${C.teal}22)`, border: `1px solid ${C.accent}44`, borderRadius: 20, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, marginTop: 8 }}>Workout Complete!</div>
            <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 6 }}>Amazing work — you crushed Day {selectedDay}!</div>
            <button style={{ ...s.btn(C.accent, C.bg), marginTop: 16, borderRadius: 14 }}>View Summary</button>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showConfirm && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: C.card, border: `1px solid ${C.red}55`, borderRadius: 24, padding: 28, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 52 }}>⚠️</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary, marginTop: 12 }}>Reset All Progress?</div>
            <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 8, lineHeight: 1.6 }}>
              This will clear <span style={{ color: C.red, fontWeight: 700 }}>all completed days</span> across all 4 weeks.
            </div>
            <div style={{ background: C.surface, borderRadius: 14, padding: 14, marginTop: 16, textAlign: "left" }}>
              {planWeeks.map((w, wi) => {
                const ct = weekDone[wi].filter(Boolean).length;
                return (
                  <div key={w.week} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: wi < planWeeks.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 5, background: w.color }} />
                      <span style={{ fontSize: 13, color: C.textSecondary }}>Week {w.week}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: ct > 0 ? C.red : C.textMuted }}>
                      {ct > 0 ? `${ct} day${ct > 1 ? "s" : ""} cleared` : "Nothing to clear"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, color: C.textPrimary, borderRadius: 14, padding: "14px 0", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Cancel</button>
              <button onClick={resetWorkout} style={{ flex: 1, background: C.red, border: "none", color: "#fff", borderRadius: 14, padding: "14px 0", cursor: "pointer", fontSize: 14, fontWeight: 800 }}>Yes, Reset All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCREEN: Progress ─────────────────────────────────────────────────────────
function ProgressScreen({ weekDone }) {
  const { active, totalWorkouts, totalMins, totalCals, streak } = computeStats(weekDone);
  const avgSession  = totalWorkouts > 0 ? Math.round(totalMins / totalWorkouts) : 0;
  const programPct  = Math.round((totalWorkouts / active.length) * 100);

  const last7   = active.slice(-7);
  const maxMins = Math.max(...last7.map(d => d.isDone ? parseMins(d.duration) : 0), 1);

  const weekStats = planWeeks.map((w, wi) => {
    const doneCt = w.days.reduce((acc, d, di) => acc + (!d.rest && weekDone[wi]?.[di] ? 1 : 0), 0);
    return { ...w, doneCt, total: w.days.filter(d => !d.rest).length };
  });

  const earnedBadges = [
    { icon: "⚡", name: "First Workout",    color: C.accent,  earned: totalWorkouts >= 1,  hint: "Complete 1 workout" },
    { icon: "🔥", name: "3-Day Streak",     color: C.orange,  earned: streak >= 3,          hint: "3 days in a row" },
    { icon: "🏅", name: "5 Workouts",       color: C.teal,    earned: totalWorkouts >= 5,   hint: "Complete 5 workouts" },
    { icon: "💎", name: "Week 1 Done",      color: C.purple,  earned: weekStats[0].doneCt === weekStats[0].total, hint: "Finish all of Week 1" },
    { icon: "🔥", name: "7-Day Streak",     color: C.orange,  earned: streak >= 7,          hint: "7 days in a row" },
    { icon: "🏆", name: "Week 2 Done",      color: C.accent,  earned: weekStats[1].doneCt === weekStats[1].total, hint: "Finish all of Week 2" },
    { icon: "🌟", name: "Halfway There",    color: C.teal,    earned: programPct >= 50,     hint: "50% program done" },
    { icon: "👑", name: "Program Complete", color: C.orange,  earned: programPct >= 100,    hint: "Complete all 28 days" },
    { icon: "🎯", name: "Perfect Week",     color: C.purple,  earned: weekStats.some(w => w.doneCt === w.total), hint: "Complete a full week" },
  ];

  const fmtTime = (m) => { if (!m) return "0m"; const h = Math.floor(m / 60), r = m % 60; return h > 0 ? `${h}h${r > 0 ? ` ${r}m` : ""}` : `${r}m`; };

  return (
    <div style={s.content}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={s.h1}>Progress</div>
        <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 4 }}>
          {totalWorkouts === 0 ? "Start your first workout to see stats" : `${totalWorkouts} workout${totalWorkouts > 1 ? "s" : ""} completed · Keep going!`}
        </div>
      </div>

      {/* Ring + streak */}
      <div style={{ ...s.section, marginTop: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...s.card, flex: 1.2, textAlign: "center", padding: 20 }}>
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto" }}>
              <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="40" cy="40" r="34" fill="none" stroke={C.surface} strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={C.accent} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - programPct / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.accent }}>{programPct}%</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>Program</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{totalWorkouts} / {active.length} days</div>
          </div>
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>{streak}</div><div style={{ fontSize: 12, color: C.textMuted }}>Day Streak</div></div>
              <span style={{ fontSize: 26 }}>🔥</span>
            </div>
            <div style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 22, fontWeight: 900, color: C.accent }}>{totalWorkouts}</div><div style={{ fontSize: 12, color: C.textMuted }}>Workouts Done</div></div>
              <span style={{ fontSize: 26 }}>🏋️</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <StatPill label="Calories"    value={totalCals > 0 ? (totalCals >= 1000 ? `${(totalCals / 1000).toFixed(1)}k` : totalCals) : "—"} color={C.orange} />
          <StatPill label="Total Time"  value={totalMins > 0 ? fmtTime(totalMins) : "—"} color={C.teal} />
          <StatPill label="Avg Session" value={avgSession > 0 ? `${avgSession}m` : "—"} color={C.purple} />
        </div>
      </div>

      {/* Week-by-week */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Week-by-Week</div>
        <div style={s.card}>
          {weekStats.map((w, i) => {
            const pct = w.total > 0 ? (w.doneCt / w.total) * 100 : 0;
            return (
              <div key={w.week} style={{ marginBottom: i < weekStats.length - 1 ? 16 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: w.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Week {w.week}</span>
                    <span style={{ fontSize: 11, color: C.textMuted }}>{w.title.split("&")[0].trim()}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? C.success : w.doneCt > 0 ? w.color : C.textMuted }}>
                    {w.doneCt}/{w.total} {pct === 100 ? "✓" : ""}
                  </span>
                </div>
                <div style={{ background: C.surface, borderRadius: 6, height: 6 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? C.success : `linear-gradient(90deg, ${w.color}, ${w.color}CC)`, borderRadius: 6, transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Chart */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Recent Activity</div>
        <div style={s.card}>
          {totalWorkouts === 0
            ? <div style={{ textAlign: "center", padding: "20px 0", color: C.textMuted, fontSize: 13 }}>Complete workouts to see your activity chart</div>
            : (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
                {last7.map((d) => {
                  const mins = d.isDone ? parseMins(d.duration) : 0;
                  const h    = mins === 0 ? 8 : Math.max(18, (mins / maxMins) * 80);
                  return (
                    <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      {mins > 0 && <div style={{ fontSize: 9, color: C.accent, fontWeight: 700 }}>{mins}m</div>}
                      <div style={{ width: "100%", height: h, background: mins > 0 ? `linear-gradient(180deg, ${C.accent}, ${C.accentDim})` : C.surface, borderRadius: 6, position: "relative" }}>
                        {mins === 0 && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.textMuted }}>—</div>}
                      </div>
                      <div style={{ fontSize: 9, color: d.isDone ? C.accent : C.textMuted, fontWeight: d.isDone ? 700 : 400 }}>D{d.day}</div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>

      {/* Achievements */}
      <div style={s.section}>
        <div style={{ ...s.between, marginBottom: 12 }}>
          <div style={s.sectionTitle}>Achievements</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{earnedBadges.filter(b => b.earned).length}/{earnedBadges.length} earned</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {earnedBadges.map((b) => (
            <div key={b.name} style={{ background: b.earned ? `${b.color}15` : C.surface, border: `1px solid ${b.earned ? b.color + "55" : C.border}`, borderRadius: 16, padding: 14, textAlign: "center", opacity: b.earned ? 1 : 0.45 }}>
              <div style={{ fontSize: 28 }}>{b.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: b.earned ? b.color : C.textMuted, marginTop: 6, lineHeight: 1.3 }}>{b.name}</div>
              <div style={{ fontSize: 9, color: b.earned ? `${b.color}AA` : C.textMuted, marginTop: 3 }}>{b.earned ? "Earned!" : b.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: Profile ──────────────────────────────────────────────────────────
function ProfileScreen({ profileStats }) {
  const [weight, setWeight] = useState(() => lsGet(LS.weight, ""));
  const [height, setHeight] = useState(() => lsGet(LS.height, ""));

  const updateWeight = (v) => { setWeight(v); lsSet(LS.weight, v); };
  const updateHeight = (v) => { setHeight(v); lsSet(LS.height, v); };

  const w   = parseFloat(weight);
  const h   = parseFloat(height);
  const bmi = w > 0 && h > 0 ? +(w / ((h / 100) ** 2)).toFixed(1) : null;

  const bmiInfo = bmi === null ? null
    : bmi < 18.5 ? { label: "Underweight", color: C.teal,    emoji: "📉", tip: "Consider adding more nutrition to support your workouts." }
    : bmi < 25   ? { label: "Normal",      color: C.success, emoji: "✅", tip: "Great shape! Keep up your active lifestyle." }
    : bmi < 30   ? { label: "Overweight",  color: C.orange,  emoji: "⚠️", tip: "Regular workouts and balanced diet will help." }
    :              { label: "Obese",        color: C.red,     emoji: "🔴", tip: "Consult a health professional and stay consistent." };

  const bmiSegments = [
    { label: "Thin",   color: C.teal },
    { label: "Normal", color: C.success },
    { label: "Over",   color: C.orange },
    { label: "Obese",  color: C.red },
  ];
  const bmiPct = bmi !== null ? Math.min(((bmi - 10) / 30) * 100, 100) : null;

  const inputStyle = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "13px 16px", color: C.textPrimary, fontSize: 16, fontWeight: 700, outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={s.content}>
      <div style={{ padding: "20px 20px 0" }}>
        {/* Header */}
        <div style={{ textAlign: "center", paddingBottom: 24 }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: `linear-gradient(135deg, ${C.purple}, ${C.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto" }}>K</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.textPrimary, marginTop: 12 }}>Karan</div>
          <div style={{ fontSize: 14, color: C.textMuted }}>karan.paghadar@kevit.io</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.orange}22`, border: `1px solid ${C.orange}44`, borderRadius: 20, padding: "6px 14px", marginTop: 10 }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>
              {profileStats.streak > 0 ? `${profileStats.streak}-Day Streak` : "No streak yet"}
            </span>
          </div>
        </div>

        <div style={s.sectionTitle}>My Stats</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <StatPill label="Workouts" value={profileStats.totalWorkouts || "—"} color={C.accent} />
          <StatPill label="Calories"  value={profileStats.totalCals > 0 ? (profileStats.totalCals >= 1000 ? `${(profileStats.totalCals / 1000).toFixed(1)}k` : profileStats.totalCals) : "—"} color={C.orange} />
          <StatPill label="Streak"    value={profileStats.streak > 0 ? `${profileStats.streak}d` : "—"} color={C.purple} />
        </div>

        <div style={s.sectionTitle}>BMI Calculator</div>
        <div style={s.card}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>WEIGHT</div>
              <div style={{ position: "relative" }}>
                <input type="number" placeholder="70" value={weight} onChange={e => updateWeight(e.target.value)} style={inputStyle} />
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.textMuted, fontWeight: 600 }}>kg</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 6, letterSpacing: 0.5 }}>HEIGHT</div>
              <div style={{ position: "relative" }}>
                <input type="number" placeholder="175" value={height} onChange={e => updateHeight(e.target.value)} style={inputStyle} />
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.textMuted, fontWeight: 600 }}>cm</span>
              </div>
            </div>
          </div>

          {bmi !== null ? (
            <>
              <div style={{ background: `${bmiInfo.color}15`, border: `1px solid ${bmiInfo.color}44`, borderRadius: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: 0.8 }}>YOUR BMI</div>
                  <div style={{ fontSize: 42, fontWeight: 900, color: bmiInfo.color, lineHeight: 1.1 }}>{bmi}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: bmiInfo.color, marginTop: 2 }}>{bmiInfo.emoji} {bmiInfo.label}</div>
                </div>
                <div style={{ textAlign: "right", maxWidth: 120 }}>
                  <div style={{ fontSize: 11, color: C.textSecondary, lineHeight: 1.5 }}>{bmiInfo.tip}</div>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 3, height: 10, borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                  {bmiSegments.map(seg => (
                    <div key={seg.label} style={{ flex: 1, background: seg.color, opacity: bmiInfo.label.toLowerCase().includes(seg.label.toLowerCase()) || (seg.label === "Normal" && bmiInfo.label === "Normal") ? 1 : 0.3 }} />
                  ))}
                </div>
                <div style={{ position: "relative", height: 16 }}>
                  <div style={{ position: "absolute", left: `${bmiPct}%`, transform: "translateX(-50%)", width: 14, height: 14, background: bmiInfo.color, borderRadius: 7, border: `2px solid ${C.bg}`, transition: "left 0.4s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  {bmiSegments.map(seg => <div key={seg.label} style={{ fontSize: 9, color: C.textMuted, flex: 1, textAlign: "center" }}>{seg.label}</div>)}
                </div>
              </div>
              {h > 0 && (
                <div style={{ background: C.surface, borderRadius: 12, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Ideal weight for {h} cm</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.success }}>
                    {(18.5 * (h / 100) ** 2).toFixed(1)} – {(24.9 * (h / 100) ** 2).toFixed(1)} kg
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "16px 0 4px", color: C.textMuted, fontSize: 13 }}>
              Enter your weight and height to calculate BMI
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 28, paddingBottom: 8 }}>
          <div style={{ fontSize: 12, color: C.textMuted }}>FitFlow v1.0 · Made with 💚 for your health</div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
const navItems = [
  { key: "home",     icon: "🏠", label: "Home" },
  { key: "workout",  icon: "⚡", label: "Workout" },
  { key: "progress", icon: "📊", label: "Progress" },
];

export default function FitFlowApp() {
  const [screen,     setScreen]     = useState("home");
  const [prevScreen, setPrevScreen] = useState(null);
  const [startWeek,  setStartWeek]  = useState(null);
  const [startDay,   setStartDay]   = useState(null);

  // Workout progress — persisted in localStorage
  const [weekDone, setWeekDone] = useState(() => {
    const saved = lsGet(LS.weekDone, null);
    if (!saved) return blankDone();
    // Guard: ensure correct shape
    return planWeeks.map((w, wi) => w.days.map((_, di) => saved[wi]?.[di] ?? false));
  });

  const updateWeekDone = (next) => { setWeekDone(next); lsSet(LS.weekDone, next); };
  const resetAllProgress = () => updateWeekDone(blankDone());

  const goTo = (scr) => { setPrevScreen(screen); setScreen(scr); };

  const launchWorkout = (weekNum, dayNum) => {
    setStartWeek(weekNum ?? null);
    setStartDay(dayNum  ?? null);
    goTo("workout");
  };

  // Shared stats for Profile
  const { totalWorkouts, totalMins, totalCals, streak } = computeStats(weekDone);
  const profileStats = { totalWorkouts, totalMins, totalCals, streak };

  // Live clock
  const [clock, setClock] = useState(() => {
    const n = new Date(); return `${n.getHours()}:${String(n.getMinutes()).padStart(2, "0")}`;
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date(); setClock(`${n.getHours()}:${String(n.getMinutes()).padStart(2, "0")}`);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // Next pipeline day (for Workout nav shortcut)
  const nextPipelineDay = planWeeks
    .flatMap((w, wi) => w.days.map((d, di) => ({ ...d, weekNum: w.week, isDone: weekDone[wi]?.[di] ?? false })))
    .find(d => !d.rest && !d.isDone);

  return (
    <div style={s.app}>
      <div style={{ position: "fixed", top: 20, left: 20, color: C.textMuted, fontSize: 12, fontFamily: "monospace" }}>
        FitFlow · UI Design Preview
      </div>

      <div style={s.phone}>
        {/* Status Bar */}
        <div style={s.statusBar}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{clock}</span>
          <div style={{ width: 120, height: 30, background: C.bg, borderRadius: 15, border: `1px solid ${C.border}` }} />
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 12 }}>●●●</span>
            <span style={{ fontSize: 12, color: C.accent }}>100%</span>
          </div>
        </div>

        {/* Screen Router */}
        {screen === "home"     && <HomeScreen onStartWorkout={launchWorkout} weekDone={weekDone} />}
        {screen === "workout"  && <WorkoutScreen onBack={() => goTo(prevScreen || "home")} weekDone={weekDone} updateWeekDone={updateWeekDone} resetAllProgress={resetAllProgress} startWeek={startWeek} startDay={startDay} />}
        {screen === "progress" && <ProgressScreen weekDone={weekDone} />}
        {screen === "profile"  && <ProfileScreen profileStats={profileStats} />}

        {/* Bottom Nav */}
        <div style={s.bottomNav}>
          {navItems.map(n => {
            const handleNav = () => n.key === "workout"
              ? launchWorkout(nextPipelineDay?.weekNum, nextPipelineDay?.day)
              : goTo(n.key);
            return (
              <div key={n.key} style={s.navItem(screen === n.key)} onClick={handleNav}>
                <span style={s.navIcon(screen === n.key)}>{n.icon}</span>
                <span style={s.navLabel(screen === n.key)}>{n.label}</span>
              </div>
            );
          })}
          <div style={s.navItem(screen === "profile")} onClick={() => goTo("profile")}>
            <span style={s.navIcon(screen === "profile")}>👤</span>
            <span style={s.navLabel(screen === "profile")}>Profile</span>
          </div>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: `${C.surface}CC`, backdropFilter: "blur(10px)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "8px 18px", fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>
        Tap the bottom nav to explore screens · Click water droplets &amp; set bubbles!
      </div>
    </div>
  );
}
