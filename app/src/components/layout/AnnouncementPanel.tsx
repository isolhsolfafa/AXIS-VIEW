// src/components/layout/AnnouncementPanel.tsx
// 공지사항 드롭다운 패널 — 최신(pinned) + 월별 그룹 표시

import { useState, useEffect, useRef } from 'react';
import { useNotices } from '@/hooks/useNotices';
import type { Announcement } from '@/types/announcement';

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

/* ── 우선순위 뱃지 (is_pinned 기반 매핑) ──────────────── */
const PRIORITY_CONFIG = {
  pinned: { label: '중요', bg: '#FEF3C7', color: '#D97706' },
  normal: { label: '일반', bg: '#F1F5F9', color: '#64748B' },
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

function getMonthKey(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

/* ── 공지 그룹화: pinned(최신) + 월별 ─────────────────── */
function groupAnnouncements(list: Announcement[]): { pinned: Announcement[]; monthly: { label: string; items: Announcement[] }[] } {
  const pinned = list.filter(a => a.is_pinned);
  const rest = list.filter(a => !a.is_pinned);

  const monthMap = new Map<string, Announcement[]>();
  for (const a of rest) {
    const key = getMonthKey(a.created_at);
    if (!monthMap.has(key)) monthMap.set(key, []);
    monthMap.get(key)!.push(a);
  }

  const monthly = [...monthMap.entries()].map(([label, items]) => ({ label, items }));
  return { pinned, monthly };
}

/* ── 공지 아이템 렌더링 ────────────────────────────── */
function AnnouncementItem({
  a,
  isRead,
  isExpanded,
  onExpand,
}: {
  a: Announcement;
  isRead: boolean;
  isExpanded: boolean;
  onExpand: (id: number) => void;
}) {
  const priorityCfg = a.is_pinned ? PRIORITY_CONFIG.pinned : PRIORITY_CONFIG.normal;

  return (
    <div
      onClick={() => onExpand(a.id)}
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
        {a.is_pinned && (
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
        )}
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
          display: 'flex',
          gap: '4px',
        }}
      >
        <span>{a.author_name}</span>
        <span>·</span>
        <span>{formatRelativeDate(a.created_at)}</span>
        {a.version && (
          <>
            <span>·</span>
            <span>{a.version}</span>
          </>
        )}
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
            whiteSpace: 'pre-wrap',
          }}
        >
          {a.content}
        </div>
      )}
    </div>
  );
}

/* ── 월별 섹션 헤더 ────────────────────────────────── */
function MonthHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '10px 20px 6px',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--gx-steel)',
        background: 'var(--gx-snow, #FAFBFD)',
        borderBottom: '1px solid var(--gx-mist)',
        letterSpacing: '0.3px',
      }}
    >
      {label}
    </div>
  );
}

/* ── 메인 컴포넌트 ─────────────────────────────────── */
interface AnnouncementPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function AnnouncementPanel({ open, onClose }: AnnouncementPanelProps) {
  const [readIds, setReadIds] = useState<Set<number>>(getReadIds);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // API 호출
  const { data, isLoading } = useNotices({ limit: 50 });
  const announcements: Announcement[] = data?.notices ?? [];

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    const t = setTimeout(() => document.addEventListener('mousedown', handleClick), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = announcements.filter((a) => !readIds.has(a.id)).length;
  const { pinned, monthly } = groupAnnouncements(announcements);

  function handleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
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
        {isLoading ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--gx-steel)',
              fontSize: '13px',
            }}
          >
            불러오는 중...
          </div>
        ) : announcements.length === 0 ? (
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
          <>
            {/* 고정(최신) 공지 */}
            {pinned.length > 0 && pinned.map((a) => (
              <AnnouncementItem
                key={a.id}
                a={a}
                isRead={readIds.has(a.id)}
                isExpanded={expandedId === a.id}
                onExpand={handleExpand}
              />
            ))}

            {/* 월별 그룹 */}
            {monthly.map(({ label, items }) => (
              <div key={label}>
                <MonthHeader label={label} />
                {items.map((a) => (
                  <AnnouncementItem
                    key={a.id}
                    a={a}
                    isRead={readIds.has(a.id)}
                    isExpanded={expandedId === a.id}
                    onExpand={handleExpand}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ── 읽지 않은 공지 수 (Header에서 badge용) ──────────── */
// API 연동 후에는 useNotices 훅의 결과를 사용하지만,
// Header 초기 렌더링에서 빠르게 표시하기 위한 localStorage 기반 카운트
export function getUnreadAnnouncementCount(): number {
  // API 데이터가 없는 초기 상태에서는 0 반환
  // 실제 unread 카운트는 AnnouncementPanel 내부에서 계산
  return 0;
}
