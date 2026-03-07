// src/components/layout/AnnouncementPanel.tsx
// 공지사항 드롭다운 패널 — OPS 연동 전까지 Mock 데이터 사용

import { useState, useEffect, useRef } from 'react';
import type { Announcement, AnnouncementPriority } from '@/types/announcement';

/* ── Mock 공지사항 데이터 ───────────────────────────── */
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: '3월 안전교육 일정 안내',
    content: '3월 10일(화) 오전 10시, GST공장 대회의실에서 정기 안전교육을 실시합니다. 모든 협력사 작업자 필참입니다.',
    priority: 'important',
    is_active: true,
    created_by: '관리자',
    created_at: '2026-03-07T09:00:00+09:00',
    updated_at: '2026-03-07T09:00:00+09:00',
  },
  {
    id: 2,
    title: '출입게이트 시스템 점검 공지',
    content: '3월 8일(일) 02:00~06:00 출입게이트 시스템 정기점검이 예정되어 있습니다. 해당 시간 자동 체크인/아웃이 일시 중단됩니다.',
    priority: 'urgent',
    is_active: true,
    created_by: '시스템관리자',
    created_at: '2026-03-06T14:30:00+09:00',
    updated_at: '2026-03-06T14:30:00+09:00',
  },
  {
    id: 3,
    title: '신규 협력사 등록 완료 (DEF산업)',
    content: 'DEF산업이 신규 협력사로 등록되었습니다. MECH 직군 작업자 6명이 배정 예정입니다.',
    priority: 'normal',
    is_active: true,
    created_by: '관리자',
    created_at: '2026-03-05T11:00:00+09:00',
    updated_at: '2026-03-05T11:00:00+09:00',
  },
  {
    id: 4,
    title: '퇴근 미체크 관련 안내',
    content: '퇴근 시 반드시 출입게이트를 통과하여 체크아웃을 완료해 주세요. 미체크가 반복되면 협력사에 통보됩니다.',
    priority: 'normal',
    is_active: true,
    created_by: '관리자',
    created_at: '2026-03-03T16:00:00+09:00',
    updated_at: '2026-03-03T16:00:00+09:00',
  },
];

/* ── 읽음 상태 관리 (localStorage) ──────────────────── */
const STORAGE_KEY = 'axis_view_read_announcements';

function getReadIds(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

/* ── 우선순위 뱃지 ─────────────────────────────────── */
const PRIORITY_CONFIG: Record<AnnouncementPriority, { label: string; bg: string; color: string }> = {
  urgent:    { label: '긴급', bg: '#FEE2E2', color: '#DC2626' },
  important: { label: '중요', bg: '#FEF3C7', color: '#D97706' },
  normal:    { label: '일반', bg: '#F1F5F9', color: '#64748B' },
};

/* ── 날짜 포맷 ─────────────────────────────────────── */
function formatRelativeDate(isoStr: string): string {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ── 컴포넌트 ──────────────────────────────────────── */
interface AnnouncementPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AnnouncementPanel({ open, onClose }: AnnouncementPanelProps) {
  const [readIds, setReadIds] = useState<Set<number>>(getReadIds);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // 약간 지연시켜 toggle 충돌 방지
    const t = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  const announcements = MOCK_ANNOUNCEMENTS.filter((a) => a.is_active);
  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length;

  function handleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
    // 읽음 처리
    if (!readIds.has(id)) {
      const next = new Set(readIds);
      next.add(id);
      setReadIds(next);
      saveReadIds(next);
    }
  }

  function handleMarkAllRead() {
    const next = new Set(readIds);
    announcements.forEach((a) => next.add(a.id));
    setReadIds(next);
    saveReadIds(next);
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: '48px',
        right: 0,
        width: '360px',
        maxHeight: '480px',
        background: 'var(--gx-white)',
        borderRadius: 'var(--radius-gx-lg, 12px)',
        border: '1px solid var(--gx-mist)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--gx-mist)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--gx-charcoal)' }}>
            공지사항
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#fff',
                background: 'var(--gx-danger, #EF4444)',
                borderRadius: '10px',
                padding: '1px 7px',
                lineHeight: '18px',
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              fontSize: '12px',
              color: 'var(--gx-accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* 공지 목록 */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {announcements.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--gx-steel)',
              fontSize: '13px',
            }}
          >
            등록된 공지사항이 없습니다
          </div>
        ) : (
          announcements.map((a) => {
            const isRead = readIds.has(a.id);
            const isExpanded = expandedId === a.id;
            const priorityCfg = PRIORITY_CONFIG[a.priority];

            return (
              <div
                key={a.id}
                onClick={() => handleExpand(a.id)}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--gx-mist)',
                  cursor: 'pointer',
                  background: isRead ? 'var(--gx-white)' : 'var(--gx-cloud, #F8FAFC)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--gx-cloud, #F8FAFC)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = isRead
                    ? 'var(--gx-white)'
                    : 'var(--gx-cloud, #F8FAFC)';
                }}
              >
                {/* 제목 행 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {!isRead && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--gx-accent, #3B82F6)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: priorityCfg.bg,
                      color: priorityCfg.color,
                      flexShrink: 0,
                    }}
                  >
                    {priorityCfg.label}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: isRead ? 400 : 600,
                      color: 'var(--gx-charcoal)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {a.title}
                  </span>
                </div>

                {/* 메타 정보 */}
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--gx-steel)',
                    marginLeft: isRead ? 0 : '14px',
                  }}
                >
                  {a.created_by} · {formatRelativeDate(a.created_at)}
                </div>

                {/* 내용 (확장 시) */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '12px',
                      background: 'var(--gx-snow, #F1F5F9)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: 'var(--gx-graphite)',
                      marginLeft: isRead ? 0 : '14px',
                    }}
                  >
                    {a.content}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 푸터 */}
      <div
        style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--gx-mist)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: 'var(--gx-steel)',
          }}
        >
          OPS 연동 후 실시간 공지 표시 예정
        </span>
      </div>
    </div>
  );
}

/* ── 읽지 않은 공지 수 (Header에서 badge용) ──────────── */
export function getUnreadAnnouncementCount(): number {
  const readIds = getReadIds();
  return MOCK_ANNOUNCEMENTS.filter((a) => a.is_active && !readIds.has(a.id)).length;
}
