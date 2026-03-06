// src/components/attendance/FilterBar.tsx
// 필터 바 — 회사, 날짜, 검색어, 상태 탭

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COMPANIES = ['전체', 'FNI', 'BAT', 'TMS(M)', 'TMS(E)', 'P&S', 'C&A'];

type StatusFilter = 'all' | 'working' | 'left' | 'not_checked';

interface FilterBarProps {
  selectedCompany: string;
  onCompanyChange: (company: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

export default function FilterBar({
  selectedCompany,
  onCompanyChange,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 상태 탭 */}
      <Tabs value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
        <TabsList className="h-8 bg-gx-cloud">
          <TabsTrigger value="all" className="text-xs h-7 px-3">전체</TabsTrigger>
          <TabsTrigger value="working" className="text-xs h-7 px-3">근무중</TabsTrigger>
          <TabsTrigger value="left" className="text-xs h-7 px-3">퇴근</TabsTrigger>
          <TabsTrigger value="not_checked" className="text-xs h-7 px-3">미체크</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 회사 드롭다운 */}
      <Select value={selectedCompany} onValueChange={onCompanyChange}>
        <SelectTrigger className="h-8 w-32 text-xs border-gx-mist">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMPANIES.map((c) => (
            <SelectItem key={c} value={c} className="text-xs">
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 날짜 선택 */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="h-8 text-xs px-3 rounded-md border border-gx-mist bg-white text-gx-charcoal focus:outline-none focus:ring-1 focus:ring-gx-accent"
      />

      {/* 검색 */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gx-steel pointer-events-none" />
        <Input
          type="text"
          placeholder="이름 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 w-40 text-xs border-gx-mist"
        />
      </div>
    </div>
  );
}
