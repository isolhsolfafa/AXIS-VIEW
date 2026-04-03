// src/components/production/MonthlyCalendarView.tsx
// 월마감 캘린더 뷰 — Sprint 27

import { useMemo } from 'react';
import type { MonthlySummaryResponse, WeekSummary } from '@/types/production';

interface MonthlyCalendarViewProps {
  data: MonthlySummaryResponse;
  currentWeek?: string;
  onWeekClick: (week: string) => void;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  weekLabel: string | null;
}

interface CalendarWeekRow {
  days: CalendarDay[];
  weekLabel: string | null;
  summary: WeekSummary | null;
}

function getISOWeek(d: Date): string {
  const tmp = new Date(d.getTime());
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 4);
  const weekNum = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `W${String(weekNum).padStart(2, '0')}`;
}

function buildCalendarRows(month: string, weeks: WeekSummary[]): CalendarWeekRow[] {
  const [year, mon] = month.split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1);
  const lastDate = new Date(year, mon, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7; // 월요일=0

  const weekMap = new Map<string, WeekSummary>();
  for (const w of weeks) weekMap.set(w.week, w);

  const rows: CalendarWeekRow[] = [];
  let dayIndex = 1 - startDow;

  while (dayIndex <= lastDate) {
    const days: CalendarDay[] = [];
    let rowWeekLabel: string | null = null;

    for (let col = 0; col < 7; col++) {
      if (dayIndex < 1 || dayIndex > lastDate) {
        days.push({ date: 0, isCurrentMonth: false, weekLabel: null });
      } else {
        const d = new Date(year, mon - 1, dayIndex);
        const wk = getISOWeek(d);
        days.push({ date: dayIndex, isCurrentMonth: true, weekLabel: wk });
        if (!rowWeekLabel) rowWeekLabel = wk;
      }
      dayIndex++;
    }

    rows.push({
      days,
      weekLabel: rowWeekLabel,
      summary: rowWeekLabel ? weekMap.get(rowWeekLabel) ?? null : null,
    });
  }

  return rows;
}

export default function MonthlyCalendarView({ data, currentWeek, onWeekClick }: MonthlyCalendarViewProps) {
  const rows = useMemo(() => buildCalendarRows(data.month, data.weeks ?? []), [data.month, data.weeks]);
  const DOW = ['월', '화', '수', '목', '금', '토', '일'];

  const today = new Date();
  const [tYear, tMon] = data.month.split('-').map(Number);
  const isCurrentMonth = today.getFullYear() === tYear && today.getMonth() + 1 === tMon;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  return (
    <div style={{
      background: 'var(--gx-white)', borderRadius: 'var(--radius-gx-lg)',
      boxShadow: 'var(--shadow-card)', overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{ padding: '18px 24px 12px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)', marginBottom: '3px' }}>
          {data.month} 월마감
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gx-steel)' }}>
          주차 클릭 → 해당 주간 실적으로 이동
        </div>
      </div>

      {/* 캘린더 */}
      <div style={{ padding: '0 16px 16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {DOW.map(d => (
                <th key={d} style={{
                  padding: '8px 4px', textAlign: 'center', fontSize: '12px',
                  fontWeight: 600,
                  color: d === '일' ? 'var(--gx-danger, #EF4444)' : d === '토' ? 'var(--gx-info)' : 'var(--gx-steel)',
                }}>{d}</th>
              ))}
              <th style={{
                padding: '8px 12px', textAlign: 'center', fontSize: '12px',
                fontWeight: 600, color: 'var(--gx-steel)', minWidth: '180px',
              }}>주차 실적</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              const isCurrent = row.weekLabel === currentWeek;
              const hasData = row.summary != null;
              const mechElecConfirmed = (row.summary?.mech?.confirmed ?? 0) + (row.summary?.elec?.confirmed ?? 0);
              const tmConfirmed = row.summary?.tm?.confirmed ?? 0;
              const total = mechElecConfirmed + tmConfirmed;

              return (
                <tr
                  key={ri}
                  onClick={() => row.weekLabel && onWeekClick(row.weekLabel)}
                  style={{
                    cursor: row.weekLabel ? 'pointer' : 'default',
                    borderBottom: '1px solid var(--gx-cloud)',
                    background: isCurrent ? 'rgba(99,102,241,0.03)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (row.weekLabel) e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isCurrent ? 'rgba(99,102,241,0.03)' : 'transparent'; }}
                >
                  {/* 날짜 셀 */}
                  {row.days.map((day, di) => (
                    <td key={di} style={{
                      padding: '10px 4px', textAlign: 'center',
                      fontSize: '13px', fontFamily: "'JetBrains Mono', monospace",
                      color: !day.isCurrentMonth ? 'var(--gx-mist)'
                        : day.date === todayDate ? 'var(--gx-white)'
                        : di === 6 ? 'var(--gx-danger, #EF4444)'
                        : di === 5 ? 'var(--gx-info)'
                        : 'var(--gx-charcoal)',
                      fontWeight: day.date === todayDate ? 700 : 400,
                    }}>
                      {day.isCurrentMonth && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '28px', height: '28px', borderRadius: '50%',
                          ...(day.date === todayDate ? {
                            background: 'var(--gx-accent)', color: 'var(--gx-white)',
                          } : {}),
                        }}>
                          {day.date}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* 주차 실적 셀 */}
                  <td style={{ padding: '8px 12px' }}>
                    {row.weekLabel && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '12px', fontWeight: 600,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: isCurrent ? 'var(--gx-accent)' : 'var(--gx-slate)',
                          minWidth: '30px',
                        }}>
                          {row.weekLabel}
                          {isCurrent && (
                            <span style={{
                              fontSize: '9px', fontWeight: 600, padding: '2px 5px', borderRadius: '4px',
                              background: 'rgba(99,102,241,0.08)', color: 'var(--gx-accent)',
                              marginLeft: '3px', verticalAlign: 'middle',
                            }}>현재</span>
                          )}
                        </span>

                        {hasData && (
                          <span style={{
                            fontSize: '12px', color: 'var(--gx-success)',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            기구·전장 <b>{mechElecConfirmed}</b>
                          </span>
                        )}

                        {hasData && (
                          <span style={{
                            fontSize: '12px', color: 'var(--gx-accent)',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            TM <b>{tmConfirmed}</b>
                          </span>
                        )}

                        {hasData && total > 0 && (
                          <div style={{
                            flex: 1, height: '4px', borderRadius: '2px',
                            background: 'var(--gx-cloud)', overflow: 'hidden',
                            display: 'flex',
                          }}>
                            {mechElecConfirmed > 0 && (
                              <div style={{
                                height: '100%',
                                width: `${(mechElecConfirmed / total) * 100}%`,
                                background: 'var(--gx-success)',
                              }} />
                            )}
                            {tmConfirmed > 0 && (
                              <div style={{
                                height: '100%',
                                width: `${(tmConfirmed / total) * 100}%`,
                                background: 'var(--gx-accent)',
                              }} />
                            )}
                          </div>
                        )}

                        <span style={{ fontSize: '12px', color: 'var(--gx-silver)' }}>→</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 합계 */}
        <div style={{
          display: 'flex', gap: '20px', padding: '14px 16px',
          borderTop: '2px solid var(--gx-mist)', marginTop: '4px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gx-charcoal)' }}>합계</span>
          <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
            기구·전장 확인 <b style={{ color: 'var(--gx-success)' }}>
              {(data.totals?.mech?.confirmed ?? 0) + (data.totals?.elec?.confirmed ?? 0)}
            </b>
            <span style={{ color: 'var(--gx-silver)', margin: '0 4px' }}>/</span>
            완료 {(data.totals?.mech?.completed ?? 0) + (data.totals?.elec?.completed ?? 0)}
          </span>
          <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
            TM 확인 <b style={{ color: 'var(--gx-accent)' }}>
              {data.totals?.tm?.confirmed ?? 0}
            </b>
            <span style={{ color: 'var(--gx-silver)', margin: '0 4px' }}>/</span>
            완료 {data.totals?.tm?.completed ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
