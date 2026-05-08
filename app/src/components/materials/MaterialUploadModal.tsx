// src/components/materials/MaterialUploadModal.tsx
// Excel 업로드 모달 — Sprint 42 (4단계: file → preview → strategy → commit)

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadMaterialsPreview, uploadMaterialsCommit } from '@/api/materials';
import type { UploadPreview } from '@/api/materials';

type Step = 'file' | 'preview' | 'committing' | 'done';
type Strategy = 'all' | 'selected' | 'skip';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaterialUploadModal({ onClose, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>('file');
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [strategy, setStrategy] = useState<Strategy>('all');
  const [selectedItemCodes, setSelectedItemCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && step !== 'committing') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, step]);

  const previewMutation = useMutation({
    mutationFn: (f: File) => uploadMaterialsPreview(f),
    onSuccess: (data) => {
      setPreview(data);
      setStep('preview');
      // 변경된 항목 default = 전부 선택
      const codes = new Set(data.changed_materials.map(c => c.item_code));
      setSelectedItemCodes(codes);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.error;
      if (detail === 'ENCODING_DETECTION_FAILED') {
        toast.error('CSV 인코딩 감지 실패. UTF-8 양식으로 다시 저장 후 시도하세요.');
      } else {
        toast.error('미리보기 중 오류가 발생했습니다.');
      }
    },
  });

  const commitMutation = useMutation({
    mutationFn: () => {
      const codes = strategy === 'selected' ? [...selectedItemCodes] : undefined;
      return uploadMaterialsCommit(file!, strategy, codes);
    },
    onSuccess: (result) => {
      toast.success(`업로드 완료 — 신규 ${result.inserted} / 수정 ${result.updated} / 스킵 ${result.skipped}${result.rejected > 0 ? ` / 거부 ${result.rejected}` : ''}`);
      onSuccess();
    },
    onError: () => {
      toast.error('업로드 중 오류가 발생했습니다.');
      setStep('preview');  // 미리보기로 복귀
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    previewMutation.mutate(f);
  };

  const handleCommit = () => {
    setStep('committing');
    commitMutation.mutate();
  };

  const toggleRow = (itemCode: string) => {
    setSelectedItemCodes(prev => {
      const next = new Set(prev);
      if (next.has(itemCode)) next.delete(itemCode);
      else next.add(itemCode);
      return next;
    });
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="upload-title" style={overlayStyle} onClick={() => step !== 'committing' && onClose()}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 id="upload-title" style={titleStyle}>Excel 업로드 (자재 일괄 등록)</h2>

        {step === 'file' && (
          <>
            <p style={hintStyle}>
              CSV 또는 Excel 파일 (한글 헤더 10컬럼: 품번/고객사/모델/자재코드/자재내역/규격1/규격2/수량/단위/생성일).
              <br />
              UTF-8 권장 (다른 이름으로 저장 → CSV UTF-8). CP949/EUC-KR 도 자동 인식.
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={previewMutation.isPending}
              style={{ marginTop: '12px' }}
            />
            {previewMutation.isPending && <p style={{ marginTop: '12px', color: 'var(--gx-steel)', fontSize: '12px' }}>미리보기 분석 중...</p>}
          </>
        )}

        {step === 'preview' && preview && (
          <>
            <div style={summaryStyle}>
              <Stat label="신규" count={preview.new_materials.length} color="var(--gx-success)" />
              <Stat label="변경" count={preview.changed_materials.length} color="var(--gx-warning)" />
              <Stat label="동일" count={preview.unchanged_materials.length} color="var(--gx-steel)" />
              <Stat label="신규 BOM 매핑" count={preview.bom_mappings_new} color="var(--gx-info)" />
            </div>

            {/* strategy 선택 */}
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--gx-snow)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gx-slate)', margin: '0 0 8px 0' }}>처리 방식 선택</p>
              <Radio name="strategy" value="all" checked={strategy === 'all'} onChange={() => setStrategy('all')}>
                <strong>일괄 UPDATE</strong> — 변경된 자재 모두 갱신 (권장)
              </Radio>
              <Radio name="strategy" value="selected" checked={strategy === 'selected'} onChange={() => setStrategy('selected')}>
                <strong>변경된 것만 UPDATE</strong> — 아래 체크박스로 직접 선택
              </Radio>
              <Radio name="strategy" value="skip" checked={strategy === 'skip'} onChange={() => setStrategy('skip')}>
                <strong>skip 모두</strong> — 신규만 추가, 기존 보존
              </Radio>
            </div>

            {/* 변경 자재 diff */}
            {preview.changed_materials.length > 0 && strategy === 'selected' && (
              <div style={{ marginTop: '12px', maxHeight: '240px', overflowY: 'auto', border: '1px solid var(--gx-mist)', borderRadius: '6px' }}>
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--gx-snow)', position: 'sticky', top: 0 }}>
                      <th style={diffThStyle}><input type="checkbox" checked={selectedItemCodes.size === preview.changed_materials.length} onChange={(e) => {
                        if (e.target.checked) setSelectedItemCodes(new Set(preview.changed_materials.map(c => c.item_code)));
                        else setSelectedItemCodes(new Set());
                      }} /></th>
                      <th style={diffThStyle}>자재코드</th>
                      <th style={diffThStyle}>변경 영역</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.changed_materials.map(c => (
                      <tr key={c.item_code} style={{ borderTop: '1px solid var(--gx-mist)' }}>
                        <td style={diffTdStyle}>
                          <input type="checkbox" checked={selectedItemCodes.has(c.item_code)} onChange={() => toggleRow(c.item_code)} />
                        </td>
                        <td style={{ ...diffTdStyle, fontFamily: "'JetBrains Mono', monospace" }}>{c.item_code}</td>
                        <td style={diffTdStyle}>
                          {c.changes.map((ch, i) => (
                            <div key={i} style={{ fontSize: '10px', color: 'var(--gx-steel)' }}>
                              <strong>{ch.field}</strong>: <span style={{ textDecoration: 'line-through' }}>{ch.before ?? '—'}</span> → <span style={{ color: 'var(--gx-charcoal)' }}>{ch.after ?? '—'}</span>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button type="button" onClick={onClose} style={btnSecondaryStyle}>취소</button>
              <button type="button" onClick={handleCommit} style={btnPrimaryStyle}>업로드 실행</button>
            </div>
          </>
        )}

        {step === 'committing' && (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--gx-steel)', fontSize: '13px' }}>업로드 중... 잠시만 기다려주세요.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '8px', borderRight: '1px solid var(--gx-mist)' }}>
      <div style={{ fontSize: '11px', color: 'var(--gx-steel)' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>{count}</div>
    </div>
  );
}

function Radio({ name, value, checked, onChange, children }: { name: string; value: string; checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0', fontSize: '12px', color: 'var(--gx-charcoal)', cursor: 'pointer' }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} style={{ marginTop: '2px' }} />
      <span>{children}</span>
    </label>
  );
}

const overlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { background: 'var(--gx-white)', borderRadius: '12px', padding: '24px', width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' };
const titleStyle: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: 'var(--gx-charcoal)', margin: '0 0 12px 0' };
const hintStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--gx-steel)', margin: 0, lineHeight: 1.6 };
const summaryStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', background: 'var(--gx-snow)', borderRadius: '8px', padding: '4px 0' };
const diffThStyle: React.CSSProperties = { padding: '6px 8px', textAlign: 'left', fontSize: '10px', fontWeight: 600, color: 'var(--gx-slate)' };
const diffTdStyle: React.CSSProperties = { padding: '6px 8px', verticalAlign: 'top' };
const btnSecondaryStyle: React.CSSProperties = { padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: '1px solid var(--gx-mist)', borderRadius: '6px', background: 'var(--gx-white)', color: 'var(--gx-charcoal)', cursor: 'pointer' };
const btnPrimaryStyle: React.CSSProperties = { padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: 'none', borderRadius: '6px', background: 'var(--gx-accent)', color: 'white', cursor: 'pointer' };
