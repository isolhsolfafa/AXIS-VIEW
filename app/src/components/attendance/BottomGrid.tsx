// src/components/attendance/BottomGrid.tsx
// 하단 그리드 — 퇴근 미체크 + 근무지 요약 (컨셉 HTML 완전 적용)

import type { AttendanceRecord } from '@/types/attendance';
import { format, parseISO } from 'date-fns';

interface ExtendedRecord extends AttendanceRecord {
  location?: string;
  sub_location?: string;
}

interface LocationSummary {
  company: string;
  hq: number;
  site: number;
  total: number;
}

interface BottomGridProps {
  notCheckedRecords: ExtendedRecord[];
  locationSummaries: LocationSummary[];
}

const CHECKOUT_AVATARS: Record<string, { gradient: string; initials: string }> = {
  'C&A':    { gradient: 'linear-gradient(135deg, #6366F1, #818CF8)', initials: 'CA' },
  'FNI':    { gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', initials: 'FN' },
  'BAT':    { gradient: 'linear-gradient(135deg, #EF4444, #F87171)', initials: 'BA' },
  'TMS(E)': { gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)', initials: 'TM' },
  'TMS(M)': { gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', initials: 'TM' },
  'NONE':   { gradient: 'linear-gradient(135deg, #64748B, #94A3B8)', initials: 'NA' },
  'P&S':    { gradient: 'linear-gradient(135deg, #10B981, #34D399)', initials: 'PS' },
};

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'HH:mm');
  } catch {
    return '—';
  }
}

const CHECKOUT_TABS = ['전체', '본사', '현장'] as const;

export default function BottomGrid({ notCheckedRecords, locationSummaries }: BottomGridProps) {
  const totalHq = locationSummaries.reduce((acc, l) => acc + l.hq, 0);
  const totalSite = locationSummaries.reduce((acc, l) => acc + l.site, 0);

  return (
    <div
      className="bottom-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {/* 퇴근 미체크 현황 */}
      <div
        style={{
          background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 0',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
              퇴근 미체크 인원
            </div>
            <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
              확인 필요 · {notCheckedRecords.length}명
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {CHECKOUT_TABS.map((tab) => (
              <button
                key={tab}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-gx-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  color: tab === '전체' ? 'var(--gx-accent)' : 'var(--gx-steel)',
                  background: tab === '전체' ? 'var(--gx-accent-soft)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {notCheckedRecords.slice(0, 6).map((record, idx) => {
              const avatarData = CHECKOUT_AVATARS[record.company] || { gradient: 'linear-gradient(135deg, #64748B, #94A3B8)', initials: '???' };
              const location = (record as ExtendedRecord).sub_location || (record as ExtendedRecord).location || '현장';
              const checkIn = formatTime(record.check_in_time);
              return (
                <div
                  key={`${record.worker_id}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 0',
                    borderBottom: idx < Math.min(notCheckedRecords.length - 1, 5) ? '1px solid var(--gx-cloud)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: avatarData.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    {avatarData.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
                      {record.worker_name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
                      {location} · 출근 {checkIn !== '—' ? checkIn : '미기록'}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '12px',
                      color: 'var(--gx-danger)',
                      fontWeight: 600,
                    }}
                  >
                    미체크
                  </div>
                </div>
              );
            })}
            {notCheckedRecords.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '32px 0',
                  fontSize: '13px',
                  color: 'var(--gx-steel)',
                }}
              >
                퇴근 미체크 인원이 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 근무지 요약 */}
      <div
        style={{
          background: 'var(--gx-white)',
          borderRadius: 'var(--radius-gx-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
            위치별 인원 분포
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gx-steel)', marginTop: '2px' }}>
            협력사별 본사/현장 배치 현황
          </div>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {locationSummaries.map((loc) => {
              const hqPct = loc.total > 0 ? (loc.hq / (totalHq + totalSite)) * 100 : 0;
              const sitePct = loc.total > 0 ? (loc.site / (totalHq + totalSite)) * 100 : 0;
              return (
                <div key={loc.company} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--gx-slate)',
                      width: '80px',
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {loc.company}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '24px',
                      background: 'var(--gx-cloud)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                    }}
                  >
                    {loc.hq > 0 && (
                      <div
                        style={{
                          height: '100%',
                          width: `${hqPct}%`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '8px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'white',
                          background: 'linear-gradient(90deg, #6366F1, #818CF8)',
                          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {loc.hq}
                      </div>
                    )}
                    {loc.site > 0 && (
                      <div
                        style={{
                          height: '100%',
                          width: `${sitePct}%`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          paddingRight: '8px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '10px',
                          fontWeight: 600,
                          color: 'var(--gx-slate)',
                          background: 'linear-gradient(90deg, #C7D2FE, #DDD6FE)',
                          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {loc.site}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--gx-graphite)',
                      marginLeft: '10px',
                      minWidth: '36px',
                    }}
                  >
                    {loc.total}명
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
