import React, { useEffect, useMemo, useState } from 'react';

const STORE = 'studentstory-v1';
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const categories = ['Reading', 'Writing', 'Math', 'Participation', 'Work Habits', 'Social', 'Homework', 'Assessment'];
const tags = ['Strength', 'Growth', 'Concern', 'Needs support', 'On track', 'Ready for challenge', 'Parent follow-up'];
const tones = ['Warm', 'Balanced', 'Direct', 'Very concise'];
const outputs = ['Conference script', 'Parent email', 'Report card comment', 'Support plan', 'Student encouragement note'];

const quickNotes = [
  { label: 'Used evidence independently', category: 'Reading', tag: 'Strength', icon:'📖', accent:'violet', text: 'used text evidence independently to support an answer' },
  { label: 'Needs evidence reminder', category: 'Reading', tag: 'Growth', icon:'↗', accent:'rose', text: 'needed reminders to include evidence rather than only giving an answer' },
  { label: 'Strong writing idea', category: 'Writing', tag: 'Strength', icon:'💡', accent:'amber', text: 'shared a thoughtful idea and strong opening for the writing task' },
  { label: 'Incomplete response', category: 'Writing', tag: 'Needs support', icon:'💬', accent:'blue', text: 'started the response but did not fully answer every part of the prompt' },
  { label: 'Rushed work', category: 'Work Habits', tag: 'Concern', icon:'⏱', accent:'green', text: 'rushed through the task and benefited from slowing down and checking work' },
  { label: 'Participated well', category: 'Participation', tag: 'Strength', icon:'☻', accent:'teal', text: 'participated appropriately and contributed to the class discussion' },
  { label: 'Quiet but attentive', category: 'Participation', tag: 'On track', icon:'⚑', accent:'violet', text: 'was quiet but attentive and followed the lesson steps' },
  { label: 'Ready for challenge', category: 'Writing', tag: 'Ready for challenge', icon:'⛰', accent:'orange', text: 'showed readiness for a more advanced extension task' },
  { label: 'Parent follow-up needed', category: 'Work Habits', tag: 'Parent follow-up', icon:'👥', accent:'pink', text: 'may benefit from a brief parent follow-up about consistency and task completion' },
];

const starters = [
  'benefits from reminders to check that the full prompt has been answered',
  'is building confidence when given a clear model and success checklist',
  'shows growth when tasks are broken into smaller steps',
  'is ready for extension opportunities that require deeper explanation',
  'continues to benefit from support with organization and follow-through',
  'contributes positively during partner or group work',
];

const sampleStudents = [
  {
    id: uid(), name: 'Ariana', grade: 'Grade 4', familyNotes: '',
    evidence: [
      { id: uid(), date: today(), category: 'Writing', tag: 'Growth', text: 'started with creative ideas but needed support to complete the response', privateNote: '' },
      { id: uid(), date: today(), category: 'Participation', tag: 'Strength', text: 'shared a thoughtful oral answer during discussion', privateNote: '' },
    ]
  },
  {
    id: uid(), name: 'Mikaela', grade: 'Grade 4', familyNotes: '',
    evidence: [
      { id: uid(), date: today(), category: 'Writing', tag: 'Ready for challenge', text: 'wrote fluently and was ready for a more detailed evidence-based extension', privateNote: '' },
      { id: uid(), date: today(), category: 'Reading', tag: 'Strength', text: 'used text details independently during reading response', privateNote: '' },
    ]
  },
  { id: uid(), name: 'Sample Student', grade: 'Grade 3', familyNotes: '', evidence: [] },
];

function load() {
  try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; }
}
function save(data) { localStorage.setItem(STORE, JSON.stringify(data)); }
function esc(s='') { return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function cx(...a) { return a.filter(Boolean).join(' '); }
function sentence(text, fallback) {
  const v = (text || '').trim() || fallback;
  return /[.!?]$/.test(v) ? v : `${v}.`;
}

function coverage(student) {
  const ev = student.evidence || [];
  const has = c => ev.some(e => e.category === c);
  const supportCount = ev.filter(e => ['Growth','Concern','Needs support'].includes(e.tag)).length;
  const strengthCount = ev.filter(e => ['Strength','On track','Ready for challenge'].includes(e.tag)).length;
  const parentFlag = ev.some(e => e.tag === 'Parent follow-up');
  const missing = [];
  if (!has('Reading')) missing.push('reading evidence');
  if (!has('Writing')) missing.push('writing evidence');
  if (strengthCount === 0) missing.push('a clear strength');
  if (supportCount === 0) missing.push('a growth/support note');
  if (ev.length < 3) missing.push('at least 3 observations');
  const score = Math.max(0, 100 - missing.length * 18 - (parentFlag ? 0 : 0));
  return { score, missing, supportCount, strengthCount, parentFlag, ready: missing.length <= 1 };
}

function summarize(student, tagList) {
  const ev = (student.evidence || []).filter(e => !tagList || tagList.includes(e.tag));
  if (!ev.length) return '';
  return ev.slice(-3).map(e => `${e.category}: ${e.text}`).join('; ');
}

function makeOutput(student, outputType, tone) {
  const name = student.name || 'the student';
  const strengths = summarize(student, ['Strength','On track','Ready for challenge']) || `${name} shows positive classroom habits and is continuing to build confidence`;
  const growth = summarize(student, ['Growth','Concern','Needs support']) || `${name} is working on consistency, independence, and completing each part of the task`;
  const parentFollow = (student.evidence || []).filter(e => e.tag === 'Parent follow-up').map(e => e.text).join('; ');
  const nextStep = parentFollow || starters[(student.evidence || []).length % starters.length];
  const toneLine = tone === 'Direct' ? 'clear and specific' : tone === 'Very concise' ? 'brief and parent-friendly' : tone === 'Warm' ? 'warm and encouraging' : 'balanced and professional';
  const recent = (student.evidence || []).slice(-5).reverse().map(e => `- ${e.date} · ${e.category} · ${e.tag}: ${e.text}`).join('\n') || '- No evidence added yet.';

  if (outputType === 'Parent email') {
    return `Subject: ${name} — classroom progress update\n\nHello,\n\nI wanted to share a ${toneLine} update about ${name}. One strength I am seeing is that ${sentence(strengths, '')}\n\nA current growth area is that ${sentence(growth, '')} At school, our next step will be to support ${name} with ${sentence(nextStep, 'a clear checklist and short teacher check-ins').toLowerCase()}\n\nAt home, a helpful routine would be to ask ${name} to explain the directions, complete one part at a time, and check that the response answers the full prompt.\n\nThank you for your support,\nTeacher`;
  }
  if (outputType === 'Report card comment') {
    return `${name} is continuing to grow as a learner. A current strength is that ${sentence(strengths, '')} A growth area is that ${sentence(growth, '')} Moving forward, ${name} will benefit from ${sentence(nextStep, 'consistent practice with complete responses and self-checking').toLowerCase()}`;
  }
  if (outputType === 'Support plan') {
    return `Student: ${name}\n\nEvidence summary:\n${recent}\n\nStrength to build on:\n- ${sentence(strengths, '')}\n\nGrowth need:\n- ${sentence(growth, '')}\n\n2-week teacher action plan:\n- Start independent work with a 30-second direction check.\n- Provide a visible success checklist.\n- Review one model before release.\n- Check the first response before the student continues.\n\nHome support:\n- Ask ${name} to explain the task in their own words.\n- Use short, consistent practice rather than long sessions.\n\nProgress measure:\n- Track whether ${name} completes all required parts in 3 of 5 classroom opportunities.`;
  }
  if (outputType === 'Student encouragement note') {
    return `${name}, I noticed that ${sentence(strengths, '')} Your next goal is to keep working on ${sentence(growth, '').toLowerCase()} I believe you can keep growing by taking your time, checking the directions, and using the success checklist.`;
  }
  return `Conference opening:\nThank you for meeting with me. I want to share a clear picture of ${name}'s progress using classroom evidence.\n\nStrengths:\n${sentence(strengths, '')}\n\nGrowth area:\n${sentence(growth, '')}\n\nEvidence I am using:\n${recent}\n\nNext step at school:\nWe will support ${name} with ${sentence(nextStep, 'a clear checklist and brief check-ins').toLowerCase()}\n\nHow home can help:\nA helpful home routine is to ask ${name} to explain the directions first, complete one part at a time, and then check whether the response answers the full prompt.\n\nClosing:\nOverall, ${name} has clear strengths to build on. With consistent support and a focused next step, we can help ${name} make steady progress.`;
}

export default function App() {
  const stored = typeof window !== 'undefined' ? load() : null;
  const [students, setStudents] = useState(stored?.students || sampleStudents);
  const [selectedId, setSelectedId] = useState(stored?.selectedId || sampleStudents[0].id);
  const [screen, setScreen] = useState(stored?.screen || 'capture');
  const [tone, setTone] = useState(stored?.tone || 'Balanced');
  const [outputType, setOutputType] = useState(stored?.outputType || 'Conference script');
  const [newName, setNewName] = useState('');
  const [note, setNote] = useState({ date: today(), category: 'Writing', tag: 'Growth', text: '', privateNote: '' });
  const [search, setSearch] = useState('');

  const selected = students.find(s => s.id === selectedId) || students[0];
  useEffect(() => save({ students, selectedId, screen, tone, outputType }), [students, selectedId, screen, tone, outputType]);

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const classStats = useMemo(() => {
    const cards = students.map(s => coverage(s));
    return {
      ready: cards.filter(c => c.ready).length,
      missing: cards.filter(c => c.missing.length > 1).length,
      follow: cards.filter(c => c.parentFlag).length,
      total: students.length
    };
  }, [students]);
  const generated = useMemo(() => selected ? makeOutput(selected, outputType, tone) : '', [selected, outputType, tone]);
  const selectedCoverage = selected ? coverage(selected) : { missing: [], score: 0 };

  function updateSelected(patch) {
    setStudents(prev => prev.map(s => s.id === selected.id ? { ...s, ...patch } : s));
  }
  function addStudent() {
    const name = newName.trim();
    if (!name) return;
    const s = { id: uid(), name, grade: 'Grade 4', familyNotes: '', evidence: [] };
    setStudents(prev => [...prev, s]);
    setSelectedId(s.id); setNewName('');
  }
  function addEvidence(custom) {
    const entry = custom || note;
    if (!entry.text.trim()) return;
    updateSelected({ evidence: [...(selected.evidence || []), { ...entry, id: uid(), date: entry.date || today() }] });
    if (!custom) setNote({ ...note, text: '', privateNote: '' });
  }
  function removeEvidence(id) {
    updateSelected({ evidence: (selected.evidence || []).filter(e => e.id !== id) });
  }
  function copy(text) { navigator.clipboard?.writeText(text); }
  function printPack() {
    const all = students.map(s => `<section><h2>${esc(s.name)}</h2><p><b>Coverage:</b> ${coverage(s).score}%</p><pre>${esc(makeOutput(s, outputType, tone))}</pre></section>`).join('');
    const html = `<!doctype html><html><head><title>StudentStory Pack</title><style>body{font-family:Arial,sans-serif;padding:28px;color:#111}section{page-break-after:always;border-bottom:1px solid #ddd;padding-bottom:20px}pre{white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.45}h1{font-size:26px}h2{font-size:20px}</style></head><body><h1>StudentStory ${esc(outputType)} Pack</h1>${all}</body></html>`;
    const win = window.open('', '_blank'); win.document.write(html); win.document.close(); win.focus(); win.print();
  }
  function exportJSON() {
    const blob = new Blob([JSON.stringify({ students }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'studentstory-evidence.json'; a.click(); URL.revokeObjectURL(url);
  }
  function importJSON(ev) {
    const file = ev.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const data = JSON.parse(reader.result); if (Array.isArray(data.students)) { setStudents(data.students); setSelectedId(data.students[0]?.id); } } catch { alert('Could not read that JSON file.'); } };
    reader.readAsText(file);
  }

  return <div className="app">
    <aside className="side">
      <div className="brand">
        <div className="logo">S</div>
        <div><b>StudentStory</b><span>Evidence → conferences</span></div>
      </div>

      <label className="search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student" /></label>

      <div className="sideSectionTitle">Students</div>
      <div className="studentList">
        {filtered.map(s => {
          const c = coverage(s);
          return <button key={s.id} onClick={() => setSelectedId(s.id)} className={cx('studentButton', selected?.id===s.id && 'active')}>
            <span>{s.name}</span><small>{c.ready ? 'ready' : `${c.missing.length} gaps`}</small>
          </button>;
        })}
      </div>

      <div className="sideBottom">
        <div className="addRow"><input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addStudent()} placeholder="Add student" /><button onClick={addStudent}>+</button></div>
        <div className="utility"><button onClick={exportJSON}><span>↓</span>Export</button><label><span>↑</span>Import<input type="file" accept="application/json" onChange={importJSON}/></label></div>
      </div>
    </aside>

    <main>
      <section className="heroCard">
        <div className="heroTop">
          <div className="heroCopy"><p className="eyebrow">Not another AI comment writer</p><h1>Build each student’s story from real classroom evidence.</h1></div>
          <div className="stats">
            <div className="stat ready"><i>✓</i><b>{classStats.ready}</b><span>ready</span></div>
            <div className="stat missing"><i>✎</i><b>{classStats.missing}</b><span>need evidence</span></div>
            <div className="stat follow"><i>◷</i><b>{classStats.follow}</b><span>follow-up</span></div>
          </div>
        </div>

        <nav className="tabs">
          {[
            ['capture','▣','Capture evidence'], ['board','▦','Evidence board'], ['generate','✦','Generate'], ['class','▥','Class report']
          ].map(([id,icon,label]) => <button key={id} className={screen===id?'on':''} onClick={()=>setScreen(id)}><span>{icon}</span>{label}</button>)}
        </nav>
      </section>

      {screen === 'capture' && <section className="contentGrid">
        <div className="panel mainPanel">
          <div className="studentHero">
            <div><p className="eyebrow">Selected student</p><h2>{selected.name}</h2></div>
            <div className="donut" style={{'--p': `${selectedCoverage.score * 3.6}deg`}}><span>{selectedCoverage.score}%</span><small>evidence<br/>ready</small></div>
          </div>

          <div className="formGrid two">
            <label>Grade<input value={selected.grade} onChange={e=>updateSelected({grade:e.target.value})}/></label>
            <label>Family context / reminder<input value={selected.familyNotes||''} onChange={e=>updateSelected({familyNotes:e.target.value})} placeholder="Optional private context"/></label>
          </div>

          <div className="divider" />

          <div className="noteBox">
            <div className="formGrid three">
              <label>Date<input type="date" value={note.date} onChange={e=>setNote({...note,date:e.target.value})}/></label>
              <label>Category<select value={note.category} onChange={e=>setNote({...note,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
              <label>Tag<select value={note.tag} onChange={e=>setNote({...note,tag:e.target.value})}>{tags.map(t=><option key={t}>{t}</option>)}</select></label>
            </div>
            <label>Observation<div className="textareaWrap"><textarea maxLength="500" value={note.text} onChange={e=>setNote({...note,text:e.target.value})} placeholder="Example: used text evidence independently but needed reminder to explain how it supports the answer." /><em>{note.text.length} / 500</em></div></label>
            <button className="primary" onClick={()=>addEvidence()}><span>□</span>Save evidence note</button>
          </div>
        </div>

        <div className="panel bankPanel">
          <p className="eyebrow">One-tap observation bank</p>
          <h3>Fast classroom evidence starters</h3>
          <p className="muted">Use these after class, then edit the language if you want. These are evidence starters, not final comments.</p>
          <div className="quickGrid">{quickNotes.map(q => <button key={q.label} className={`quick ${q.accent}`} onClick={()=>addEvidence({date:today(), category:q.category, tag:q.tag, text:q.text, privateNote:''})}><i>{q.icon}</i><b>{q.label}</b><span>{q.category} · {q.tag}</span></button>)}</div>
        </div>
      </section>}

      {screen === 'board' && <section className="contentGrid">
        <div className="panel">
          <p className="eyebrow">Evidence board</p><h2>Coverage for {selected.name}</h2><p className="muted">This is the part ChatGPT does not do by itself: it shows whether your conference/report-card comment is actually supported.</p>
          <div className="bigMeter"><div style={{width:`${selectedCoverage.score}%`}} /><b>{selectedCoverage.score}% ready</b></div>
          {selectedCoverage.missing.length ? <ul className="checklist">{selectedCoverage.missing.map(m=><li key={m}>Needs {m}</li>)}</ul> : <p className="good">This student has enough balanced evidence for a parent-safe narrative.</p>}
          <h3>Consistency checker</h3>
          <div className="flags">
            <span className={selectedCoverage.strengthCount?'ok':'warn'}>{selectedCoverage.strengthCount?'Has strength':'Missing strength'}</span>
            <span className={selectedCoverage.supportCount?'ok':'warn'}>{selectedCoverage.supportCount?'Has growth area':'Missing growth area'}</span>
            <span className={selectedCoverage.parentFlag?'warn':'ok'}>{selectedCoverage.parentFlag?'Parent follow-up flagged':'No parent flag'}</span>
          </div>
        </div>
        <div className="panel timelinePanel">
          <p className="eyebrow">Timeline</p><h2>Evidence notes</h2>
          {(selected.evidence||[]).length === 0 && <p className="empty">No evidence yet. Add one quick observation to start the story.</p>}
          {(selected.evidence||[]).slice().reverse().map(e => <article className="event" key={e.id}><div><b>{e.category}</b><span>{e.date} · {e.tag}</span></div><p>{e.text}</p><button onClick={()=>removeEvidence(e.id)}>Remove</button></article>)}
        </div>
      </section>}

      {screen === 'generate' && <section className="contentGrid">
        <div className="panel">
          <p className="eyebrow">Generate</p><h2>Generate from evidence</h2><p className="muted">The app uses saved evidence first, then shapes it into the format you need.</p>
          <div className="formGrid two"><label>Output<select value={outputType} onChange={e=>setOutputType(e.target.value)}>{outputs.map(o=><option key={o}>{o}</option>)}</select></label><label>Tone<select value={tone} onChange={e=>setTone(e.target.value)}>{tones.map(t=><option key={t}>{t}</option>)}</select></label></div>
          <div className="starterBank"><h3>Parent-safe phrase bank</h3>{starters.map(s=><button key={s} onClick={()=>copy(s)}>{s}</button>)}</div>
        </div>
        <div className="panel outputPanel"><div className="outputHead"><div><p className="eyebrow">Copy-ready</p><h2>{outputType}</h2></div><div><button onClick={()=>copy(generated)}>Copy</button><button onClick={printPack}>Print class pack</button></div></div><pre>{generated}</pre></div>
      </section>}

      {screen === 'class' && <section className="panel full">
        <div className="outputHead"><div><p className="eyebrow">Class report</p><h2>Class evidence report</h2><p className="muted">Use this before conferences to see who is actually ready and who needs more documentation.</p></div><button onClick={printPack}>Print / Save as PDF</button></div>
        <div className="classGrid">{students.map(s => { const c = coverage(s); return <article className="classCard" key={s.id} onClick={()=>{setSelectedId(s.id); setScreen('board')}}><div className="classTop"><h3>{s.name}</h3><b>{c.score}%</b></div><p>{c.ready ? 'Conference evidence is balanced enough.' : `Needs ${c.missing.join(', ')}.`}</p><div className="mini"><span>{(s.evidence||[]).length} notes</span>{c.parentFlag&&<span>parent follow-up</span>}</div></article> })}</div>
      </section>}

      <footer className="privacyStrip"><span>♢</span><strong>Private by default.</strong><p>Only visible to you and shared when you choose.</p><button>Learn more ›</button></footer>
    </main>
  </div>;
}
