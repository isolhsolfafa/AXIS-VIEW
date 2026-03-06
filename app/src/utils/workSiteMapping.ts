/** DB work_site 값 → 표시용 라벨 매핑 */
export const WORK_SITE_LABEL: Record<string, string> = {
  GST: 'GST공장',
  HQ: '협력사본사',
};

/** product_line 중 현재 운영 대상 */
export const ACTIVE_PRODUCT_LINES = ['SCR'] as const;

export function getWorkSiteLabel(workSite: string): string {
  return WORK_SITE_LABEL[workSite] ?? workSite;
}

export function isActiveProductLine(productLine: string): boolean {
  return (ACTIVE_PRODUCT_LINES as readonly string[]).includes(productLine);
}
