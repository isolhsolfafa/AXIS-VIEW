// src/components/partner/ChecklistReportView.tsx
// 체크리스트 성적서 뷰 — Sprint 28

import { Download } from 'lucide-react';
import { maskName, formatDateTime } from '@/utils/format';
import type { ChecklistReportData, ChecklistReportCategory } from '@/types/checklist';

// GST 로고
import logoSrc from '@/assets/images/gst-logo.png';

const CATEGORY_LABEL: Record<string, string> = {
  MECH: '기구',
  ELEC: '전장',
  TM: 'TM (모듈)',
};

/** description "SPEC / 검사방법" → [spec, method] 분리 */
function splitDescription(desc: string | null): [string, string] {
  if (!desc) return ['—', '—'];
  const idx = desc.indexOf(' / ');
  if (idx >= 0) return [desc.slice(0, idx), desc.slice(idx + 3)];
  return [desc, '—'];
}

// ── PDF Export ──
async function exportPDF(data: ChecklistReportData) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const el = document.getElementById('checklist-report-print');
  if (!el) return;

  // PDF 출력 시 마스킹 해제: data-fullname 속성의 텍스트로 교체
  const maskedEls = el.querySelectorAll('[data-fullname]');
  const originals: { el: Element; text: string }[] = [];
  maskedEls.forEach((mel) => {
    originals.push({ el: mel, text: mel.textContent ?? '' });
    mel.textContent = mel.getAttribute('data-fullname') ?? mel.textContent;
  });

  // html2canvas oklch() 미지원 우회
  // html2canvas가 stylesheet 자체를 파싱하면서 oklch()를 만나 에러 발생
  // 해결: 캡처 시 모든 stylesheet를 임시 비활성화 (inline style만으로 렌더링)
  const sheets = document.querySelectorAll('style, link[rel="stylesheet"]');
  const disabledSheets: { el: HTMLElement; wasDisabled: boolean }[] = [];
  sheets.forEach((s) => {
    const sheet = s as HTMLStyleElement | HTMLLinkElement;
    const wasDisabled = (sheet as any).disabled ?? false;
    (sheet as any).disabled = true;
    disabledSheets.push({ el: sheet, wasDisabled });
  });

  // 캡처 대상 + 내부 요소에 computed style을 inline으로 강제 적용
  const allEls = [el, ...el.querySelectorAll('*')] as HTMLElement[];
  const styleBackups: { el: HTMLElement; original: string }[] = [];

  // stylesheet 활성 상태에서 computed style 수집을 위해 잠시 복원
  disabledSheets.forEach(({ el: s, wasDisabled }) => { (s as any).disabled = wasDisabled; });

  for (const htmlEl of allEls) {
    styleBackups.push({ el: htmlEl, original: htmlEl.getAttribute('style') ?? '' });
    const computed = getComputedStyle(htmlEl);
    const important = [
      'color', 'background-color', 'background', 'border-color',
      'border-top-color', 'border-bottom-color', 'border-left-color', 'border-right-color',
      'outline-color', 'box-shadow', 'text-decoration-color',
    ];
    for (const prop of important) {
      const val = computed.getPropertyValue(prop);
      if (val && val !== 'none' && val !== 'rgba(0, 0, 0, 0)') {
        htmlEl.style.setProperty(prop, val);
      }
    }
  }

  // 이제 stylesheet 비활성화하고 캡처 (oklch 없는 inline만 남음)
  disabledSheets.forEach(({ el: s }) => { (s as any).disabled = true; });

  const canvas = await html2canvas(el, { scale: 2, useCORS: true });

  // stylesheet 복원 + inline style 복원
  disabledSheets.forEach(({ el: s, wasDisabled }) => { (s as any).disabled = wasDisabled; });
  styleBackups.forEach(({ el: htmlEl, original }) => {
    if (original) htmlEl.setAttribute('style', original);
    else htmlEl.removeAttribute('style');
  });

  // 마스킹 복원
  originals.forEach(({ el: mel, text }) => { mel.textContent = text; });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = (canvas.height * pdfW) / canvas.width;

  // 페이지 분할
  let yOffset = 0;
  const pageH = pdf.internal.pageSize.getHeight();
  while (yOffset < pdfH) {
    if (yOffset > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, -yOffset, pdfW, pdfH);
    yOffset += pageH;
  }

  pdf.save(`체크리스트_성적서_${data.serial_number}.pdf`);
}

interface Props {
  data: ChecklistReportData;
}

export default function ChecklistReportView({ data }: Props) {
  return (
    <div style={{
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-md, 10px)',
      border: '1px solid var(--gx-mist)', overflow: 'hidden',
    }}>
      {/* 툴바 — PDF 다운로드 */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', padding: '14px 20px',
        borderBottom: '1px solid var(--gx-cloud)',
      }}>
        <button
          onClick={() => exportPDF(data)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--gx-accent)', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '10px 20px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          <Download size={15} /> PDF 다운로드
        </button>
      </div>

      {/* 성적서 본문 — PDF 캡처 영역 */}
      <div id="checklist-report-print" style={{ padding: '36px', maxWidth: '860px', margin: '0 auto' }}>
        {/* 헤더: 로고(좌) + 타이틀(중앙) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
          <img src={logoSrc} alt="GST" style={{ height: '44px' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gx-charcoal)', margin: '0 0 4px' }}>
              공정 체크리스트 성적서
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--gx-steel)', margin: 0 }}>
              Process Checklist Inspection Report
            </p>
          </div>
          <div style={{ width: '44px' }} /> {/* 로고 균형 spacer */}
        </div>

        {/* 기본정보 테이블 */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '28px', fontSize: '14px' }}>
          <tbody>
            <tr>
              <td style={infoLabelStyle}>S/N</td>
              <td style={infoValueStyle}>{data.serial_number}</td>
              <td style={infoLabelStyle}>모델</td>
              <td style={infoValueStyle}>{data.model}</td>
            </tr>
            <tr>
              <td style={infoLabelStyle}>O/N (수주번호)</td>
              <td style={infoValueStyle}>{data.sales_order ?? '—'}</td>
              <td style={infoLabelStyle}>고객사</td>
              <td style={infoValueStyle}>{data.customer ?? '—'}</td>
            </tr>
            <tr>
              <td style={infoLabelStyle}>출력일시</td>
              <td style={infoValueStyle} colSpan={3}>{formatDateTime(data.generated_at)}</td>
            </tr>
          </tbody>
        </table>

        {/* 카테고리별 체크리스트 */}
        {data.categories.map((cat) => (
          <CategoryTable key={cat.category} cat={cat} />
        ))}

        {/* 하단 */}
        <div style={{ marginTop: '36px', borderTop: '1px solid var(--gx-cloud)', paddingTop: '14px', fontSize: '12px', color: 'var(--gx-silver)', textAlign: 'center' }}>
          본 성적서는 G-AXIS OPS에서 체크 완료된 데이터를 기반으로 자동 생성되었습니다.
        </div>
      </div>
    </div>
  );
}

// ── 카테고리 테이블 ──
function CategoryTable({ cat }: { cat: ChecklistReportCategory }) {
  if (cat.items.length === 0) return null;

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* 카테고리 헤더 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', background: 'var(--gx-cloud)', borderRadius: '6px 6px 0 0',
      }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--gx-charcoal)' }}>
          {CATEGORY_LABEL[cat.category] ?? cat.category}
          {cat.phase_label && ` — ${cat.phase_label}`}
        </span>
        <span style={{
          fontSize: '13px', fontWeight: 600,
          color: cat.summary.percent === 100 ? 'var(--gx-success)' : 'var(--gx-steel)',
        }}>
          {cat.summary.completed ?? cat.summary.checked ?? 0} / {cat.summary.total} 완료 ({cat.summary.percent}%)
        </span>
      </div>

      {/* 테이블 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'var(--gx-mist)' }}>
            <th style={thStyle}>No</th>
            <th style={thStyle}>검사항목</th>
            <th style={thStyle}>검사내용</th>
            <th style={thStyle}>기준/SPEC</th>
            <th style={thStyle}>검사방법</th>
            <th style={thStyle}>판정</th>
            <th style={thStyle}>작업자</th>
            <th style={thStyle}>확인일시</th>
          </tr>
        </thead>
        <tbody>
          {cat.items.map((item, idx) => {
            const [spec, method] = splitDescription(item.description);
            return (
            <tr key={idx} style={{ borderBottom: '1px solid var(--gx-cloud)' }}>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={tdStyle}>
                {item.item_group}
                {item.checker_role === 'QI' && (
                  <span style={{
                    fontSize: '10px', fontWeight: 600,
                    background: 'rgba(124, 58, 237, 0.08)', color: '#7C3AED',
                    padding: '1px 5px', borderRadius: '3px', marginLeft: '5px',
                  }}>QI</span>
                )}
              </td>
              <td style={tdStyle}>{item.item_name}</td>
              <td style={tdStyle}>{spec}</td>
              <td style={tdStyle}>{method}</td>
              <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: resultColor(item) }}>
                {item.item_type === 'INPUT'
                  ? (item.input_value ?? '—')
                  : item.item_type === 'SELECT'
                    ? (item.selected_value ?? '—')
                    : (item.result ?? '—')}
              </td>
              <td style={tdStyle}>
                <span data-fullname={item.worker_name ?? ''}>
                  {item.worker_name ? maskName(item.worker_name) : '—'}
                </span>
              </td>
              <td style={{ ...tdStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
                {formatDateTime(item.checked_at)}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function resultColor(item: { result: string | null; item_type: string; selected_value?: string | null }): string {
  if (item.item_type === 'INPUT') return 'var(--gx-charcoal)';
  if (item.item_type === 'SELECT') return item.selected_value ? 'var(--gx-accent)' : 'var(--gx-silver)';
  if (item.result === 'PASS') return 'var(--gx-success)';
  if (item.result === 'NA') return 'var(--gx-steel)';
  return 'var(--gx-silver)';
}

// ── 스타일 상수 ──
const infoLabelStyle: React.CSSProperties = {
  padding: '8px 12px', fontWeight: 600, color: 'var(--gx-slate)',
  background: 'var(--gx-cloud)', border: '1px solid var(--gx-mist)', width: '130px',
};
const infoValueStyle: React.CSSProperties = {
  padding: '8px 12px', color: 'var(--gx-charcoal)',
  border: '1px solid var(--gx-mist)',
};
const thStyle: React.CSSProperties = {
  padding: '8px 10px', textAlign: 'left', fontWeight: 600,
  color: 'var(--gx-slate)', borderBottom: '2px solid var(--gx-mist)',
};
const tdStyle: React.CSSProperties = {
  padding: '8px 10px', color: 'var(--gx-charcoal)',
};
