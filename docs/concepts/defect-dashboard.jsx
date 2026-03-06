import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Treemap } from "recharts";

// 2025년 실제 데이터 (Teams Excel: 가압 불량내역 + 제조품질 불량내역)
const RAW_SUMMARY = {
  total_count: 899,
  date_range: { start: "2025-01-02", end: "2025-12-30" },
  by_month: {"2025-01":49,"2025-02":63,"2025-03":55,"2025-04":61,"2025-05":55,"2025-06":32,"2025-07":98,"2025-08":106,"2025-09":124,"2025-10":72,"2025-11":85,"2025-12":99},
  by_model: {"GAIA-I DUAL":379,"GAIA-I":154,"GAIA-II":66,"DRAGON AB DUAL":61,"GAIA-II DUAL":57,"GAIA-P DUAL":53,"GAIA-P":47,"DRAGON AB SINGLE":16,"DRAGON AB":16,"WET 1000":16,"DRAGON LE DUAL":15,"SCR":6,"MITHAS SINGLE":5,"SDS-V DUAL":3,"GALLANT SINGLE":2,"SWS-V 450":1,"MITHAS DUAL":1,"DRAGON LE SINGLE":1},
  by_component: {"SPEED CONTROLLER":159,"MALE ELBOW (PP)":143,"MALE CONNECTOR (PP)":53,"REDUCER DOUBLE Y UNION":32,"UNION ELBOW":27,"BULKHEAD UNION":23,"CLAMP":21,"MALE CONNECTOR (SUS)":20,"O-RING":20,"REDUCING UNION TEE":20,"UNION TEE":19,"ELBOW":16,"SPEED CONTROLLER ASSY":15,"MALE ELBOW (SUS)":14,"TUBING":13,"VALVE":12,"CHECK VALVE":11,"MAGNETIC PUMP":10,"NUT":10,"REDUCER":10},
  by_category_major: {"기구작업불량":616,"부품불량":242,"전장작업불량":41},
  by_category_minor: {"Leak":649,"오조립":82,"눈관리":49,"작업누락":32,"부품누락":25,"동작불량":15,"파손":14,"사양불일치":11,"오배선":6,"조립불량":5,"불완전체결":4,"설정오류":3,"배선누락":2,"핀빠짐":1,"외관불량":1},
  by_detection_stage: {"가압검사":543,"제조품질검사":351,"공정검사":5},
  by_source: {"가압 불량내역":543,"제조품질 불량내역":356},
};

// model_config 매핑 (AXIS-OPS model_config 테이블 기반)
const MODEL_GROUPS = {
  GAIA: ["GAIA-I DUAL","GAIA-I","GAIA-II","GAIA-II DUAL","GAIA-P DUAL","GAIA-P"],
  DRAGON: ["DRAGON AB DUAL","DRAGON AB SINGLE","DRAGON AB","DRAGON LE DUAL","DRAGON LE SINGLE"],
  OTHERS: ["WET 1000","SCR","MITHAS SINGLE","SDS-V DUAL","GALLANT SINGLE","SWS-V 450","MITHAS DUAL"],
};

const COLORS = ["#3B82F6","#EF4444","#F59E0B","#10B981","#8B5CF6","#EC4899","#06B6D4","#F97316","#6366F1","#14B8A6","#E11D48","#7C3AED"];
const SEVERITY_COLORS = { "기구작업불량": "#F59E0B", "부품불량": "#EF4444", "전장작업불량": "#8B5CF6" };

function StatCard({ label, value, sub, color = "#3B82F6" }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-lg font-semibold text-gray-800 mb-3 mt-6 border-b pb-2">{children}</h2>;
}

export default function DefectDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const s = RAW_SUMMARY;

  // 월별 트렌드 데이터
  const monthlyData = useMemo(() =>
    Object.entries(s.by_month).map(([m, c]) => ({
      month: m.replace("2025-", ""),
      count: c,
      label: m,
    })).sort((a, b) => a.label.localeCompare(b.label)),
  []);

  // 모델별 데이터
  const modelData = useMemo(() =>
    Object.entries(s.by_model).slice(0, 12).map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 13) + ".." : name, fullName: name, count })),
  []);

  // 모델군별 집계
  const modelGroupData = useMemo(() =>
    Object.entries(MODEL_GROUPS).map(([group, models]) => ({
      name: group,
      count: models.reduce((sum, m) => sum + (s.by_model[m] || 0), 0),
    })).sort((a, b) => b.count - a.count),
  []);

  // 부품 TOP 10
  const componentData = useMemo(() =>
    Object.entries(s.by_component).slice(0, 10).map(([name, count]) => ({
      name: name.length > 20 ? name.slice(0, 18) + ".." : name,
      fullName: name,
      count,
    })),
  []);

  // 대분류 파이 데이터
  const categoryData = useMemo(() =>
    Object.entries(s.by_category_major).map(([name, value]) => ({ name, value })),
  []);

  // 중분류 데이터
  const minorCategoryData = useMemo(() =>
    Object.entries(s.by_category_minor).slice(0, 10).map(([name, value]) => ({ name, value })),
  []);

  // 검출단계 데이터
  const stageData = useMemo(() =>
    Object.entries(s.by_detection_stage).map(([name, value]) => ({ name, value })),
  []);

  // 하반기 vs 상반기
  const h1 = Object.entries(s.by_month).filter(([m]) => m <= "2025-06").reduce((s, [, c]) => s + c, 0);
  const h2 = Object.entries(s.by_month).filter(([m]) => m > "2025-06").reduce((s, [, c]) => s + c, 0);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "model", label: "Model" },
    { id: "component", label: "Component" },
    { id: "category", label: "Category" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AXIS-VIEW Defect Analysis</h1>
            <p className="text-sm text-gray-500">2025 Teams Excel Data | {s.date_range.start} ~ {s.date_range.end}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">{s.total_count}건</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">가압: {s.by_source["가압 불량내역"]} | 품질: {s.by_source["제조품질 불량내역"]}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard label="Total Defects" value={s.total_count} sub="2025 Full Year" />
            <StatCard label="Monthly Avg" value={Math.round(s.total_count / 12)} sub="per month" color="#10B981" />
            <StatCard label="Peak Month" value="Sep (124)" sub="2025-09" color="#EF4444" />
            <StatCard label="Top Component" value="SPEED CTRL" sub={`${s.by_component["SPEED CONTROLLER"]}건 (${(s.by_component["SPEED CONTROLLER"] / s.total_count * 100).toFixed(1)}%)`} color="#F59E0B" />
          </div>

          {/* Monthly Trend */}
          <SectionTitle>Monthly Defect Trend</SectionTitle>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v}건`, "Defects"]} labelFormatter={(l) => `2025-${l}`} />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: "#3B82F6", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-gray-500 justify-center">
              <span>H1 (1~6월): <strong className="text-blue-600">{h1}건</strong></span>
              <span>H2 (7~12월): <strong className="text-red-500">{h2}건</strong> ({h2 > h1 ? "+" : ""}{((h2 - h1) / h1 * 100).toFixed(0)}%)</span>
            </div>
          </div>

          {/* Detection Stage + Major Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SectionTitle>Detection Stage</SectionTitle>
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={stageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                      {stageData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}건`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <SectionTitle>Major Category</SectionTitle>
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                      {categoryData.map((entry) => <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || "#ccc"} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}건`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Tab */}
      {activeTab === "model" && (
        <div>
          {/* Model Group Summary */}
          <SectionTitle>Model Group (model_config)</SectionTitle>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {modelGroupData.map((g, i) => (
              <StatCard key={g.name} label={g.name} value={`${g.count}건`} sub={`${(g.count / s.total_count * 100).toFixed(1)}% of total`} color={COLORS[i]} />
            ))}
          </div>

          {/* Model Bar Chart */}
          <SectionTitle>Model Defect Count (TOP 12)</SectionTitle>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={modelData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n, p) => [`${v}건`, p.payload.fullName]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {modelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* GAIA Breakdown */}
          <SectionTitle>GAIA Sub-model Breakdown</SectionTitle>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="space-y-2">
              {MODEL_GROUPS.GAIA.map((m) => {
                const cnt = s.by_model[m] || 0;
                const pct = (cnt / s.total_count * 100).toFixed(1);
                const gaiaTotal = MODEL_GROUPS.GAIA.reduce((s, mm) => s + (RAW_SUMMARY.by_model[mm] || 0), 0);
                const barWidth = (cnt / gaiaTotal * 100);
                return (
                  <div key={m} className="flex items-center gap-3">
                    <span className="text-sm w-32 text-gray-700 truncate">{m}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                      <div className="bg-blue-500 h-5 rounded-full flex items-center justify-end pr-2" style={{ width: `${barWidth}%` }}>
                        <span className="text-xs text-white font-medium">{cnt}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Component Tab */}
      {activeTab === "component" && (
        <div>
          <SectionTitle>Component Defect Ranking (TOP 10)</SectionTitle>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={componentData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n, p) => [`${v}건`, p.payload.fullName]} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {componentData.map((_, i) => {
                    const color = i === 0 ? "#EF4444" : i === 1 ? "#F59E0B" : i === 2 ? "#3B82F6" : "#94A3B8";
                    return <Cell key={i} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Component Table */}
          <SectionTitle>Component Detail</SectionTitle>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-600">#</th>
                  <th className="px-4 py-2 text-left text-gray-600">Component</th>
                  <th className="px-4 py-2 text-right text-gray-600">Count</th>
                  <th className="px-4 py-2 text-right text-gray-600">Rate</th>
                  <th className="px-4 py-2 text-left text-gray-600">Risk</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(s.by_component).slice(0, 15).map(([name, count], i) => {
                  const pct = (count / s.total_count * 100).toFixed(1);
                  const risk = count >= 50 ? "CRITICAL" : count >= 20 ? "HIGH" : count >= 10 ? "MEDIUM" : "LOW";
                  const riskColor = { CRITICAL: "bg-red-100 text-red-700", HIGH: "bg-orange-100 text-orange-700", MEDIUM: "bg-yellow-100 text-yellow-700", LOW: "bg-green-100 text-green-700" };
                  return (
                    <tr key={name} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-800">{name}</td>
                      <td className="px-4 py-2 text-right font-mono">{count}</td>
                      <td className="px-4 py-2 text-right text-gray-500">{pct}%</td>
                      <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColor[risk]}`}>{risk}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Tab */}
      {activeTab === "category" && (
        <div>
          {/* Major Category Cards */}
          <SectionTitle>Major Category</SectionTitle>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(s.by_category_major).map(([name, count]) => (
              <StatCard key={name} label={name} value={`${count}건`} sub={`${(count / s.total_count * 100).toFixed(1)}%`} color={SEVERITY_COLORS[name]} />
            ))}
          </div>

          {/* Minor Category (중분류) */}
          <SectionTitle>Minor Category (TOP 10)</SectionTitle>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-4">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={minorCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}건`]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {minorCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leak Dominance Insight */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-red-800 mb-1">Insight: Leak Dominance</p>
            <p className="text-sm text-red-700">
              Leak(누수)가 전체 불량의 <strong>{(649 / s.total_count * 100).toFixed(1)}%</strong>를 차지합니다 (649건 / {s.total_count}건).
              SPEED CONTROLLER(159건)와 MALE ELBOW(143건)가 주요 Leak 발생 부품이며,
              가압검사 단계에서 60% 이상이 검출됩니다.
            </p>
          </div>

          {/* Summary Insight */}
          <SectionTitle>Key Insights</SectionTitle>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">1.</span>
                <p>하반기({h2}건) 불량이 상반기({h1}건) 대비 <strong>{((h2 - h1) / h1 * 100).toFixed(0)}% 증가</strong>했습니다. 7~9월 급증 구간 집중 관리가 필요합니다.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">2.</span>
                <p>GAIA 모델군이 전체의 <strong>{(modelGroupData.find(g => g.name === "GAIA")?.count / s.total_count * 100).toFixed(1)}%</strong>를 차지하며, GAIA-I DUAL 단일 모델이 {s.by_model["GAIA-I DUAL"]}건으로 가장 많습니다.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">3.</span>
                <p>기구작업불량({s.by_category_major["기구작업불량"]}건)이 대분류의 <strong>{(s.by_category_major["기구작업불량"] / s.total_count * 100).toFixed(1)}%</strong>를 차지하며, 대부분 Leak 유형입니다.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500 font-bold">4.</span>
                <p>SPEED CONTROLLER + MALE ELBOW 두 부품이 전체 불량의 <strong>{((159 + 143) / s.total_count * 100).toFixed(1)}%</strong>를 차지합니다. 이 두 부품에 대한 품질 개선이 가장 효과적입니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-400 pb-4">
        AXIS-VIEW Defect Dashboard v1.0 | Data: 2025 Teams Excel ({s.total_count} records) | Phase 1: Railway DB + React
      </div>
    </div>
  );
}
