# AXIS-OPS BE API 요청사항

> AXIS-VIEW FE 개발 중 AXIS-OPS BE에 필요한 엔드포인트/수정 사항을 관리합니다.
> AXIS-VIEW는 BE 코드 수정 금지 — 이 문서로 요청 전달.
> 마지막 업데이트: 2026-03-07

---

## 요청 상태 범례

| 상태 | 설명 |
|------|------|
| PENDING | FE 구현 완료, BE 작업 대기 |
| DONE | BE 반영 완료, FE 연동 확인 |
| BLOCKED | BE 측 제약으로 보류 |

---

## QR 관리 (`/api/admin/qr`)

### 1. QR 목록 날짜 필터 파라미터 지원 — DONE (2026-03-08)

**엔드포인트**: `GET /api/admin/qr/list`

**요청 내용**: 아래 쿼리 파라미터 추가 지원

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `date_field` | string | 필터 기준 컬럼 (`mech_start` 또는 `module_start`) |
| `date_from` | string (YYYY-MM-DD) | 시작일 (이상) |
| `date_to` | string (YYYY-MM-DD) | 종료일 (이하) |

**FE 사용 예시**:
```
GET /api/admin/qr/list?date_field=mech_start&date_from=2026-03-01&date_to=2026-03-15
```

**목적**: QR 관리 페이지에서 기구시작/모듈시작 일정 기준으로 조회

**FE 현황**: 파라미터 전송 구현 완료 (`src/api/qr.ts`, `src/pages/qr/QrManagementPage.tsx`)

---

## 해결 완료

### QR 목록 조회 500 에러 — DONE (2026-03-07)

**엔드포인트**: `GET /api/admin/qr/list`

**증상**: JWT 토큰 정상 전송 시 500 INTERNAL_ERROR 반환

**해결**: BE 측 수정 완료 → 200 정상 반환
