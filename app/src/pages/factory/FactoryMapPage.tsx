// src/pages/factory/FactoryMapPage.tsx
// 공정 맵 — 목업 (Sprint 28+, preparing)

import { useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';

const MAP_STYLES = `
  .fm-mono{font-family:'JetBrains Mono',monospace;}
  .fm-stats{display:flex;gap:12px;padding:0 0 16px;flex-shrink:0;}
  .fm-stat{background:var(--gx-white);border:1px solid var(--gx-mist);border-radius:var(--radius-gx-md,10px);padding:12px 16px;flex:1;box-shadow:var(--shadow-card);}
  .fm-stat-label{font-size:12px;color:var(--gx-steel);margin-bottom:4px;}
  .fm-stat-val{font-family:'JetBrains Mono',monospace;font-size:20px;font-weight:700;letter-spacing:-0.5px;}
  .fm-stat-legend{display:flex;gap:10px;margin-top:6px;}
  .fm-stat-legend span{display:flex;align-items:center;gap:3px;font-size:10px;color:var(--gx-steel);}
  .fm-stat-legend .dot{width:8px;height:8px;border-radius:2px;display:inline-block;}

  .fm-floor{display:flex;gap:14px;height:100%;width:100%;}
  .fm-factory{background:var(--gx-white);border:1px solid var(--gx-mist);border-radius:var(--radius-gx-md,10px);display:flex;flex-direction:column;overflow:hidden;box-shadow:var(--shadow-card);}
  .fm-f2{width:36%;}.fm-f1{width:64%;}
  .fm-f-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--gx-cloud);flex-shrink:0;}
  .fm-f-name{font-size:13px;font-weight:600;color:var(--gx-charcoal);}
  .fm-f-badge{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--gx-steel);background:var(--gx-cloud);padding:2px 8px;border-radius:3px;}
  .fm-f-body{flex:1;display:flex;flex-direction:column;padding:8px;gap:6px;min-height:0;}

  .fm-area{background:var(--gx-cloud);border:1px solid var(--gx-mist);border-radius:6px;display:flex;flex-direction:column;overflow:hidden;transition:border-color .4s,box-shadow .4s;}
  .fm-area.highlight{border-color:var(--gx-accent);box-shadow:0 0 0 3px rgba(99,102,241,.08);}
  .fm-area-header{display:flex;align-items:center;padding:6px 10px;border-bottom:1px solid var(--gx-mist);gap:8px;flex-shrink:0;background:var(--gx-white);}
  .fm-area-name{font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:var(--gx-slate);}
  .fm-area-tag{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--gx-steel);background:var(--gx-cloud);padding:1px 6px;border-radius:3px;margin-left:auto;}

  .fm-lane-wrap{flex:1;overflow:hidden;padding:5px 8px;display:flex;flex-direction:column;gap:3px;min-height:0;}
  .fm-lane{display:flex;align-items:center;gap:3px;}
  .fm-lane-label{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--gx-steel);width:30px;flex-shrink:0;text-align:right;}

  .fm-eq{height:22px;flex:1;border-radius:4px;border:1px solid var(--gx-mist);background:var(--gx-white);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--gx-steel);cursor:pointer;transition:all .2s;position:relative;overflow:hidden;min-width:0;}
  .fm-eq:hover{border-color:var(--gx-silver);box-shadow:var(--shadow-card);}
  .fm-eq.empty{border-style:dashed;background:transparent;opacity:.4;cursor:default;}
  .fm-eq.done{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.2);color:var(--gx-success);}
  .fm-eq.active{background:rgba(99,102,241,.06);border-color:rgba(99,102,241,.25);color:var(--gx-accent);}
  .fm-eq.active::after{content:'';position:absolute;bottom:0;left:0;height:2px;background:var(--gx-accent);animation:fmProg 3s ease-in-out infinite;width:60%;}
  @keyframes fmProg{0%{width:35%;}50%{width:75%;}100%{width:35%;}}
  .fm-eq.delayed{background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.2);color:var(--gx-warning);}
  .fm-eq.focused{border-color:var(--gx-accent);background:rgba(99,102,241,.06);box-shadow:0 0 0 3px rgba(99,102,241,.15);z-index:10;animation:fmBlink 1.5s infinite;}
  @keyframes fmBlink{0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.15);}50%{box-shadow:0 0 0 5px rgba(99,102,241,.25);}}

  .fm-rack{width:44px;background:var(--gx-cloud);border:1px solid var(--gx-mist);border-radius:6px;display:flex;flex-direction:column;align-items:center;padding:6px 3px;gap:3px;overflow:hidden;}
  .fm-rack .rack-title{writing-mode:vertical-rl;text-orientation:mixed;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;color:var(--gx-steel);margin-bottom:auto;}
  .fm-rack-slot{width:30px;height:16px;border-radius:3px;border:1px solid var(--gx-mist);background:var(--gx-white);font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--gx-steel);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
  .fm-rack-slot.occupied{background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.2);color:var(--gx-success);}

  .fm-detail{position:absolute;right:-330px;top:0;width:310px;height:100%;background:var(--gx-white);border-left:1px solid var(--gx-mist);padding:20px;transition:right .4s cubic-bezier(.25,.1,.25,1);z-index:40;overflow-y:auto;box-shadow:-4px 0 16px rgba(0,0,0,.04);}
  .fm-detail.open{right:0;}
  .fm-d-close{position:absolute;top:14px;right:14px;background:var(--gx-cloud);border:1px solid var(--gx-mist);border-radius:6px;color:var(--gx-steel);cursor:pointer;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .15s;}
  .fm-d-close:hover{background:var(--gx-mist);color:var(--gx-charcoal);}
  .fm-d-sn{font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;color:var(--gx-charcoal);}
  .fm-d-model{font-size:12px;color:var(--gx-accent);font-weight:500;margin-top:2px;margin-bottom:16px;}
  .fm-d-section{margin-bottom:16px;}
  .fm-d-title{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;color:var(--gx-silver);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;}
  .fm-d-bar{height:4px;background:var(--gx-cloud);border-radius:2px;overflow:hidden;margin-bottom:12px;}
  .fm-d-fill{height:100%;border-radius:2px;transition:width .6s;}
  .fm-d-proc{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--gx-cloud);}
  .fm-d-proc:last-child{border:none;}
  .fm-d-proc-name{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--gx-steel);width:34px;}
  .fm-d-proc-bar{flex:1;height:5px;background:var(--gx-cloud);border-radius:3px;overflow:hidden;}
  .fm-d-proc-fill{height:100%;border-radius:3px;transition:width .6s;}
  .fm-d-proc-st{font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;width:40px;text-align:right;}
  .fm-d-meta{font-size:12px;color:var(--gx-slate);line-height:2.2;}
  .fm-d-meta strong{color:var(--gx-charcoal);font-weight:600;}
  .fm-d-meta-row{display:flex;justify-content:space-between;}
`;

export default function FactoryMapPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elRef = containerRef.current;
    if (!elRef) return;
    const el = elRef;

    // 공정/모델/협력사 데이터
    const P = ['MECH', 'ELEC', 'TM', 'PI', 'QI', 'SI'];
    const MODELS = ['GAIA', 'DRAGON', 'GALLANT', 'MITHAS', 'SDS', 'IVAS', 'SWS'];
    const MP = ['FNI', 'BAT'];
    const EP = ['C&A', 'P&S', 'TMS'];
    const CUST = ['Samsung', 'SK hynix', 'LG', 'Hyundai'];
    const rnd = (a: string[]) => a[Math.floor(Math.random() * a.length)];
    const genSN = () => rnd(['GBWS', 'GCSW', 'GCDR', 'GVMT', 'GSDS']) + '-' + (6900 + Math.floor(Math.random() * 130));

    interface Eq { id: number; sn: string; on: string; model: string; prog: number; delayed: boolean; area: string; factory: string; mp: string; ep: string; cust: string; currentProc: string; }
    const allEq: Eq[] = [];
    let eid = 0;

    function makeEq(areaId: string, factoryId: string): Eq {
      const prog = Math.random() < .2 ? 6 : Math.floor(Math.random() * 6);
      const delayed = prog < 6 && Math.random() < .1;
      const eq: Eq = { id: eid++, sn: genSN(), on: 'ON-2026-' + (300 + eid), model: rnd(MODELS), prog, delayed, area: areaId, factory: factoryId, mp: rnd(MP), ep: rnd(EP), cust: rnd(CUST), currentProc: prog < 6 ? P[prog] : 'DONE' };
      allEq.push(eq);
      return eq;
    }

    // 상세 패널
    const detail = el.querySelector('.fm-detail') as HTMLElement;
    const dContent = el.querySelector('#fm-dContent') as HTMLElement;
    const dClose = el.querySelector('#fm-dClose') as HTMLElement;

    function resetView() {
      detail.classList.remove('open');
      el.querySelectorAll('.fm-eq.focused').forEach(e => e.classList.remove('focused'));
      el.querySelectorAll('.fm-area.highlight').forEach(e => e.classList.remove('highlight'));
    }

    dClose.addEventListener('click', resetView);

    function showDetail(eq: Eq) {
      let ph = '';
      P.forEach((proc, i) => {
        let st: string, c: string, pct: number;
        if (i < eq.prog || eq.prog === 6) { st = '완료'; c = 'var(--gx-success)'; pct = 100; }
        else if (i === eq.prog && eq.prog < 6) { pct = 20 + Math.floor(Math.random() * 60); st = eq.delayed ? '지연' : '진행'; c = eq.delayed ? 'var(--gx-warning)' : 'var(--gx-accent)'; }
        else { st = '대기'; c = 'var(--gx-silver)'; pct = 0; }
        ph += `<div class="fm-d-proc"><span class="fm-d-proc-name">${proc}</span><div class="fm-d-proc-bar"><div class="fm-d-proc-fill" style="width:${pct}%;background:${c};"></div></div><span class="fm-d-proc-st" style="color:${c};">${st}</span></div>`;
      });
      const ov = Math.round(eq.prog / 6 * 100);
      const loc = eq.factory === 'f2' ? '2공장' : '1공장';
      const an: Record<string, string> = { 'f2-ship': '출하 라인', 'f2-prod': '생산라인', 'f2-test': 'TEST-공정라인', 'f1-test': 'TEST-공정라인', 'f1-prod': '생산라인' };
      dContent.innerHTML = `
        <div class="fm-d-sn">${eq.sn}</div>
        <div class="fm-d-model">${eq.model} · ${eq.cust}</div>
        <div class="fm-d-section"><div class="fm-d-title">전체 진행률 ${ov}%</div><div class="fm-d-bar"><div class="fm-d-fill" style="width:${ov}%;background:${eq.prog === 6 ? 'var(--gx-success)' : 'var(--gx-accent)'};"></div></div></div>
        <div class="fm-d-section"><div class="fm-d-title">공정 상세</div>${ph}</div>
        <div class="fm-d-section"><div class="fm-d-title">Information</div><div class="fm-d-meta">
          <div class="fm-d-meta-row"><span>O/N</span><strong>${eq.on}</strong></div>
          <div class="fm-d-meta-row"><span>위치</span><strong>${loc} · ${an[eq.area] || eq.area}</strong></div>
          <div class="fm-d-meta-row"><span>현재 공정</span><strong>${eq.currentProc}</strong></div>
          <div class="fm-d-meta-row"><span>기구 협력사</span><strong>${eq.mp}</strong></div>
          <div class="fm-d-meta-row"><span>전장 협력사</span><strong>${eq.ep}</strong></div>
          <div class="fm-d-meta-row"><span>고객</span><strong>${eq.cust}</strong></div>
        </div></div>`;
      detail.classList.add('open');
    }

    function focusEquipment(eq: Eq) {
      resetView();
      el.querySelectorAll(`.fm-eq[data-eq-id="${eq.id}"]`).forEach(e => { e.classList.add('focused'); const a = e.closest('.fm-area'); if (a) a.classList.add('highlight'); });
      showDetail(eq);
    }

    // 영역 생성
    function createArea(areaId: string, name: string, slotCount: number, factoryId: string, isShip: boolean): HTMLElement {
      const area = document.createElement('div');
      area.className = 'fm-area';
      const eqs: Eq[] = [];
      for (let i = 0; i < slotCount; i++) eqs.push(makeEq(areaId, factoryId));
      const doneCount = isShip ? slotCount : eqs.filter(e => e.prog === 6).length;
      area.innerHTML = `<div class="fm-area-header"><span class="fm-area-name">${name}</span><span class="fm-area-tag">${doneCount}/${eqs.length}</span></div>`;
      const wrap = document.createElement('div');
      wrap.className = 'fm-lane-wrap';
      const emptyCount = isShip ? 1 : Math.floor(Math.random() * 2) + 1;

      if (isShip) {
        const lane = document.createElement('div'); lane.className = 'fm-lane';
        lane.innerHTML = '<span class="fm-lane-label">OUT</span>';
        eqs.forEach(eq => { eq.prog = 6; eq.currentProc = 'DONE'; const c = document.createElement('div'); c.className = 'fm-eq done'; c.dataset.eqId = String(eq.id); c.textContent = eq.sn.split('-')[1]; c.addEventListener('click', () => focusEquipment(eq)); lane.appendChild(c); });
        for (let i = 0; i < emptyCount; i++) { const e = document.createElement('div'); e.className = 'fm-eq empty'; e.textContent = '—'; lane.appendChild(e); }
        wrap.appendChild(lane);
      } else {
        P.forEach((proc, pi) => {
          const lane = document.createElement('div'); lane.className = 'fm-lane';
          lane.innerHTML = `<span class="fm-lane-label">${proc}</span>`;
          eqs.forEach(eq => {
            const c = document.createElement('div'); c.className = 'fm-eq'; c.dataset.eqId = String(eq.id);
            if (pi < eq.prog) { c.classList.add('done'); c.textContent = '✓'; }
            else if (pi === eq.prog && eq.prog < 6) { c.classList.add(eq.delayed ? 'delayed' : 'active'); c.textContent = eq.sn.split('-')[1]; }
            else if (eq.prog === 6) { c.classList.add('done'); c.textContent = '✓'; }
            else { c.style.opacity = '.12'; c.textContent = '·'; }
            c.addEventListener('click', () => focusEquipment(eq));
            lane.appendChild(c);
          });
          for (let i = 0; i < emptyCount; i++) { const e = document.createElement('div'); e.className = 'fm-eq empty'; e.textContent = '—'; lane.appendChild(e); }
          wrap.appendChild(lane);
        });
      }
      area.appendChild(wrap);
      return area;
    }

    const floor = el.querySelector('#fm-floor') as HTMLElement;

    // 2공장
    const f2 = document.createElement('div'); f2.className = 'fm-factory fm-f2';
    f2.innerHTML = '<div class="fm-f-header"><span class="fm-f-name">2공장</span><span class="fm-f-badge">SCR</span></div>';
    const f2body = document.createElement('div'); f2body.className = 'fm-f-body';
    const f2top = document.createElement('div'); f2top.style.cssText = 'display:flex;gap:6px;flex:1;min-height:0;';
    const ship = createArea('f2-ship', '출하 라인', 3, 'f2', true); ship.style.width = '42%'; f2top.appendChild(ship);
    const f2prod = createArea('f2-prod', '생산라인', 5, 'f2', false); f2prod.style.flex = '1'; f2top.appendChild(f2prod);
    f2body.appendChild(f2top);
    const f2test = createArea('f2-test', 'TEST-공정라인', 4, 'f2', false); f2test.style.flex = '1'; f2body.appendChild(f2test);
    f2.appendChild(f2body); floor.appendChild(f2);

    // 1공장
    const f1 = document.createElement('div'); f1.className = 'fm-factory fm-f1';
    f1.innerHTML = '<div class="fm-f-header"><span class="fm-f-name">1공장</span><span class="fm-f-badge">SCR</span></div>';
    const f1body = document.createElement('div'); f1body.className = 'fm-f-body';
    const f1main = document.createElement('div'); f1main.style.cssText = 'display:flex;gap:6px;flex:1;min-height:0;';
    const f1left = document.createElement('div'); f1left.style.cssText = 'flex:1;display:flex;flex-direction:column;gap:6px;min-height:0;';
    const f1test = createArea('f1-test', 'TEST-공정라인', 6, 'f1', false); f1test.style.flex = '45'; f1left.appendChild(f1test);
    const f1prod = createArea('f1-prod', '생산라인', 8, 'f1', false); f1prod.style.flex = '55'; f1left.appendChild(f1prod);
    f1main.appendChild(f1left);
    const rack = document.createElement('div'); rack.className = 'fm-rack';
    rack.innerHTML = '<span class="rack-title">랙 라인</span>';
    for (let i = 0; i < 10; i++) { const s = document.createElement('div'); s.className = 'fm-rack-slot' + (Math.random() < .6 ? ' occupied' : ''); s.textContent = Math.random() < .6 ? 'R' + (i + 1) : ''; rack.appendChild(s); }
    f1main.appendChild(rack); f1body.appendChild(f1main); f1.appendChild(f1body); floor.appendChild(f1);

    // 통계
    const active = allEq.filter(e => e.prog < 6 && !e.delayed).length;
    const done = allEq.filter(e => e.prog === 6).length;
    const delayed = allEq.filter(e => e.delayed).length;
    const sActive = el.querySelector('#fm-sActive'); if (sActive) sActive.textContent = String(active);
    const sDone = el.querySelector('#fm-sDone'); if (sDone) sDone.textContent = String(done);
    const sDelay = el.querySelector('#fm-sDelay'); if (sDelay) sDelay.textContent = String(delayed);

    // 검색
    const searchInput = el.querySelector('#fm-search') as HTMLInputElement;
    searchInput?.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;
      const m = allEq.find(eq => eq.sn.toLowerCase().includes(q) || eq.on.toLowerCase().includes(q));
      if (!m) { searchInput.style.borderColor = 'var(--gx-danger)'; setTimeout(() => { searchInput.style.borderColor = ''; }, 1500); return; }
      searchInput.style.borderColor = 'var(--gx-success)'; setTimeout(() => { searchInput.style.borderColor = ''; }, 1500);
      focusEquipment(m);
    });

    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') { resetView(); if (searchInput) searchInput.value = ''; } };
    document.addEventListener('keydown', handleEsc);
    return () => { document.removeEventListener('keydown', handleEsc); };
  }, []);

  return (
    <Layout title="공정 맵">
      <style>{MAP_STYLES}</style>
      <div ref={containerRef} style={{ padding: '20px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 통계 + 검색 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'stretch' }}>
          <div className="fm-stat">
            <div className="fm-stat-label">진행 중</div>
            <div className="fm-stat-val" id="fm-sActive" style={{ color: 'var(--gx-charcoal)' }}>—</div>
          </div>
          <div className="fm-stat">
            <div className="fm-stat-label">완료 (금일)</div>
            <div className="fm-stat-val" id="fm-sDone" style={{ color: 'var(--gx-success)' }}>—</div>
          </div>
          <div className="fm-stat">
            <div className="fm-stat-label">지연 경고</div>
            <div className="fm-stat-val" id="fm-sDelay" style={{ color: 'var(--gx-warning)' }}>—</div>
          </div>
          <div className="fm-stat">
            <div className="fm-stat-label">범례</div>
            <div className="fm-stat-legend" style={{ marginTop: '6px' }}>
              <span><span className="dot" style={{ background: 'var(--gx-success)' }} /> 완료</span>
              <span><span className="dot" style={{ background: 'var(--gx-accent)' }} /> 진행</span>
              <span><span className="dot" style={{ background: 'var(--gx-warning)' }} /> 지연</span>
            </div>
          </div>
          <div className="fm-stat" style={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="fm-search"
              type="text"
              placeholder="S/N or O/N 검색 (Enter)"
              style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
                padding: '8px 12px', border: '1px solid var(--gx-mist)',
                borderRadius: '6px', background: 'var(--gx-cloud)',
                color: 'var(--gx-charcoal)', width: '100%', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* 맵 */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div id="fm-floor" className="fm-floor" style={{ height: '100%' }} />
          <div className="fm-detail" id="fm-detail">
            <button className="fm-d-close" id="fm-dClose">&times;</button>
            <div id="fm-dContent" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
