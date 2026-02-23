import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  MapPin,
  GraduationCap,
  Clock,
  TrendingUp,
  Award,
  Banknote,
  Calendar,
  Zap,
  Wallet,
  Landmark,
  Home,
  CreditCard,
  LineChart,
  LucideIcon,
  Sparkles
} from 'lucide-react';
import locations from './data/locations.json';
import industries from './data/industries.json';
import educations from './data/educations.json';
import incomeStatsByAge from './data/incomeStatsByAge.json';

// ─── DevBar (偏差値バー) ───
interface DevBarProps {
  label: string;
  value: number;
  barClass: string;
  emoji: string;
  desc?: string;
}

const DevBar: React.FC<DevBarProps> = ({ label, value, barClass, emoji, desc }) => (
  <div className="mb-5">
    <div className="flex justify-between items-end mb-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <div>
          <h4 className="font-bold text-gray-700 text-sm">{label}</h4>
          <p className="text-[11px] text-gray-400">{desc}</p>
        </div>
      </div>
      <div className="text-2xl font-black tabular-nums tracking-tighter text-gray-700">
        {value.toFixed(1)}
      </div>
    </div>
    <div className="h-3.5 w-full bg-pink-50 rounded-full overflow-hidden relative">
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-pink-200/60 z-10"></div>
      <div
        className={`h-full ${barClass} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, (value / 100) * 100))}%` }}
      />
    </div>
  </div>
);

// ─── SliderInput (スライダー) ───
interface SliderInputProps {
  emoji: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
  desc?: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ emoji, label, value, min, max, step, unit, onChange, desc }) => {
  const displayValue = value >= max ? `${max}${unit}以上` : `${value}${unit}`;
  return (
    <div className="space-y-2">
      <label className="flex justify-between items-center font-medium text-gray-600">
        <span className="flex items-center gap-2">
          <span className="text-base">{emoji}</span>
          <span className="text-sm">{label}</span>
        </span>
        <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          {displayValue}
        </span>
      </label>
      <input
        type="range" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      {desc && <p className="text-[11px] text-gray-400 text-right">{desc}</p>}
    </div>
  );
};

// ─── SelectInput (セレクト) ───
interface SelectInputProps {
  emoji: string;
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (val: string) => void;
}

const SelectInput: React.FC<SelectInputProps> = ({ emoji, label, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
      <span>{emoji}</span> {label}
    </label>
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-pink-200 bg-white/80 px-4 py-2.5 text-sm text-gray-600 focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none transition-all"
    >
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  </div>
);

// ─── App ───
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'income' | 'assets'>('income');

  // Income & Attr State
  const [age, setAge] = useState<number>(30);
  const [income, setIncome] = useState<number>(500);
  const [workHours, setWorkHours] = useState<number>(40);
  const [location, setLocation] = useState<string>('tokyo');
  const [industry, setIndustry] = useState<string>('it');
  const [education, setEducation] = useState<string>('bachelor');

  // Assets State
  const [cash, setCash] = useState<number>(300);
  const [stocks, setStocks] = useState<number>(200);
  const [otherAssets, setOtherAssets] = useState<number>(0);
  const [debt, setDebt] = useState<number>(0);

  // --- Calculations --- (ロジックは一切変更なし)
  const stats = useMemo(() => {
    const ageStat = incomeStatsByAge.find(s => age >= s.minAge && age <= s.maxAge)
      || incomeStatsByAge[incomeStatsByAge.length - 1];

    const baseExpectedIncome = ageStat.median_est;
    const ageSigma = ageStat.sd_est;
    let nationalDev = 50 + ((income - baseExpectedIncome) / ageSigma) * 10;

    const loc = locations.find(l => l.id === location);
    const ind = industries.find(i => i.id === industry);
    const edu = educations.find(e => e.id === education);

    const locMultiplier = loc?.multiplier ?? 1;
    const locCostOfLiving = loc?.costOfLiving ?? 1;
    const indMultiplier = ind?.multiplier ?? 1;
    const eduMultiplier = edu?.multiplier ?? 1;

    const attrExpectedIncome = baseExpectedIncome * locMultiplier * indMultiplier * eduMultiplier;
    const attrSigma = ageSigma * locMultiplier * indMultiplier * eduMultiplier;
    let attrDev = 50 + ((income - attrExpectedIncome) / attrSigma) * 10;

    const annualWorkHours = workHours * 52;
    const hourlyWage = (income * 10000) / annualWorkHours;
    const expectedAnnualWorkHours = 40 * 52;
    const expectedHourlyWage = (attrExpectedIncome * 10000) / expectedAnnualWorkHours / locCostOfLiving;
    const actualRealHourlyWage = hourlyWage / locCostOfLiving;
    const hourlySigma = expectedHourlyWage * 0.4;
    let qolDev = 50 + ((actualRealHourlyWage - expectedHourlyWage) / hourlySigma) * 10;

    const netWorth = cash + stocks + otherAssets - debt;
    let expectedNetWorth = 0;
    if (age <= 25) { expectedNetWorth = 15; }
    else if (age <= 29) { expectedNetWorth = 50; }
    else if (age <= 34) { expectedNetWorth = 120; }
    else if (age <= 39) { expectedNetWorth = 200; }
    else if (age <= 49) { expectedNetWorth = 250; }
    else if (age <= 59) { expectedNetWorth = 300; }
    else { expectedNetWorth = 650; }
    const netWorthSigma = 200 + Math.max(0, age - 20) * 80;
    let netWorthDev = 50 + ((netWorth - expectedNetWorth) / netWorthSigma) * 10;

    const clamp = (val: number) => Math.min(Math.max(Math.round(val * 10) / 10, 20), 100);
    nationalDev = clamp(nationalDev);
    attrDev = clamp(attrDev);
    qolDev = clamp(qolDev);
    netWorthDev = clamp(netWorthDev);
    const totalDev = clamp((nationalDev * 0.35) + (netWorthDev * 0.35) + (attrDev * 0.15) + (qolDev * 0.15));

    let rankName = "";
    let rankEmoji = "";
    let rankGradient = "";
    if (totalDev >= 80) { rankName = "GOD ─ 雲の上の存在"; rankEmoji = "👑"; rankGradient = "from-yellow-400 via-amber-400 to-orange-400"; }
    else if (totalDev >= 70) { rankName = "Sランク ─ トップエリート"; rankEmoji = "💎"; rankGradient = "from-purple-400 via-fuchsia-400 to-pink-400"; }
    else if (totalDev >= 65) { rankName = "Aランク ─ 超優秀"; rankEmoji = "✨"; rankGradient = "from-blue-400 via-cyan-400 to-teal-400"; }
    else if (totalDev >= 55) { rankName = "Bランク ─ 上位層"; rankEmoji = "🌸"; rankGradient = "from-pink-400 via-rose-400 to-red-300"; }
    else if (totalDev >= 45) { rankName = "Cランク ─ ボリューム層"; rankEmoji = "🌿"; rankGradient = "from-emerald-400 via-green-400 to-teal-400"; }
    else if (totalDev >= 35) { rankName = "Dランク ─ 伸びしろあり"; rankEmoji = "🍀"; rankGradient = "from-orange-400 via-amber-400 to-yellow-400"; }
    else { rankName = "Eランク ─ ハードモード"; rankEmoji = "💪"; rankGradient = "from-red-400 via-rose-400 to-pink-400"; }

    return {
      nationalDev, attrDev, qolDev, netWorthDev, totalDev, netWorth,
      rankName, rankEmoji, rankGradient,
      hourlyWage: Math.round(hourlyWage),
      expected: Math.round(attrExpectedIncome)
    };
  }, [age, income, workHours, location, industry, education, cash, stocks, otherAssets, debt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-50 py-8 px-4 relative overflow-hidden">
      {/* 背景デコレーション */}
      <div className="absolute top-10 left-10 text-4xl opacity-20 animate-float pointer-events-none select-none">🌸</div>
      <div className="absolute top-32 right-16 text-3xl opacity-15 animate-float pointer-events-none select-none" style={{ animationDelay: '1s' }}>✨</div>
      <div className="absolute bottom-20 left-20 text-3xl opacity-15 animate-float pointer-events-none select-none" style={{ animationDelay: '2s' }}>💫</div>
      <div className="absolute bottom-40 right-10 text-4xl opacity-10 animate-float pointer-events-none select-none" style={{ animationDelay: '0.5s' }}>🫧</div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">

        {/* ─── Header ─── */}
        <div className="text-center space-y-2 py-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            <span className="gradient-text">年収・資産偏差値</span>
            <br className="md:hidden" />
            <span className="text-gray-700"> シミュレータ</span>
            <span className="ml-1 text-xl animate-float inline-block">✨</span>
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            あなたの「経済力」をかわいく診断しちゃいます 🔮
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

          {/* ─── Left: 入力パネル ─── */}
          <div className="md:col-span-5 glass-card p-5 rounded-3xl animate-pulse-glow flex flex-col">
            <h2 className="text-base font-bold flex items-center gap-2 border-b border-pink-100 pb-3 mb-4 text-gray-600">
              <Sparkles className="w-4 h-4 text-pink-400" />
              ステータス入力
            </h2>

            {/* Age */}
            <div className="mb-5 p-3.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100/50">
              <SliderInput
                emoji="🎂" label="年齢" value={age} min={18} max={65} step={1} unit="歳"
                onChange={setAge}
              />
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-pink-50/80 rounded-2xl mb-5">
              <button
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'income'
                  ? 'bg-white text-pink-500 shadow-sm shadow-pink-100'
                  : 'text-gray-400 hover:text-pink-400'}`}
                onClick={() => setActiveTab('income')}
              >
                💰 年収・属性
              </button>
              <button
                className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'assets'
                  ? 'bg-white text-pink-500 shadow-sm shadow-pink-100'
                  : 'text-gray-400 hover:text-pink-400'}`}
                onClick={() => setActiveTab('assets')}
              >
                🏦 資産・負債
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 relative">
              {activeTab === 'income' && (
                <div className="space-y-5">
                  <SliderInput
                    emoji="💴" label="現在の年収" value={income} min={200} max={1500} step={10} unit="万円"
                    onChange={setIncome}
                  />
                  <SliderInput
                    emoji="⏰" label="週の労働時間" value={workHours} min={10} max={100} step={1} unit="時間"
                    onChange={setWorkHours}
                    desc="※残業・副業含む実稼働"
                  />

                  <div className="space-y-3.5 pt-4 border-t border-pink-100/50">
                    <SelectInput emoji="📍" label="居住地" value={location} options={locations} onChange={setLocation} />
                    <SelectInput emoji="🏢" label="業種" value={industry} options={industries} onChange={setIndustry} />
                    <SelectInput emoji="🎓" label="最終学歴" value={education} options={educations} onChange={setEducation} />
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="space-y-5">
                  <SliderInput emoji="🏧" label="現金・預貯金" value={cash} min={0} max={10000} step={50} unit="万円" onChange={setCash} />
                  <SliderInput emoji="📈" label="株式・投資信託・債券等" value={stocks} min={0} max={10000} step={50} unit="万円" onChange={setStocks} />
                  <SliderInput emoji="🏠" label="その他資産 (不動産・車など)" value={otherAssets} min={0} max={10000} step={50} unit="万円" onChange={setOtherAssets} desc="※持ち家などの場合は売却想定額" />
                  <SliderInput emoji="💳" label="負債 (ローン・借入金など)" value={debt} min={0} max={10000} step={50} unit="万円" onChange={setDebt} />

                  <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl flex justify-between items-center border border-amber-100/50">
                    <span className="font-bold text-amber-700 flex items-center gap-1.5 text-sm">
                      🏛️ 算出される純資産
                    </span>
                    <span className="text-xl font-black text-amber-600">
                      {stats.netWorth.toLocaleString()}<span className="text-sm font-normal text-amber-500"> 万円</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: 結果パネル ─── */}
          <div className="md:col-span-7 space-y-5">

            {/* 総合評価カード */}
            <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden animate-pulse-glow">
              {/* 背景装飾 */}
              <div className="absolute top-0 right-0 p-6 opacity-[0.04]">
                <Award className="w-40 h-40 text-pink-500" />
              </div>
              <div className="absolute -bottom-4 -left-4 text-6xl opacity-[0.06] rotate-12 select-none">🌸</div>

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-xs font-bold tracking-widest text-pink-400 uppercase bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                  ✨ 総合評価 ✨
                </span>
                <div className="text-6xl md:text-7xl font-black tracking-tighter py-1">
                  <span className="gradient-text">{stats.totalDev.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{stats.rankEmoji}</span>
                  <span className={`text-lg md:text-xl font-bold bg-gradient-to-r ${stats.rankGradient} bg-clip-text text-transparent`}>
                    {stats.rankName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mt-6 pt-5 border-t border-pink-100/50 relative z-10">
                <div className="text-center p-2.5 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100/50">
                  <div className="text-[10px] md:text-xs text-amber-500 mb-0.5 font-medium">💰 純資産額</div>
                  <div className="text-sm md:text-base font-bold text-amber-700">{stats.netWorth.toLocaleString()}万円</div>
                </div>
                <div className="text-center p-2.5 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100/50">
                  <div className="text-[10px] md:text-xs text-pink-400 mb-0.5">⏱️ 推定時給</div>
                  <div className="text-sm md:text-base font-bold text-pink-600">¥{stats.hourlyWage.toLocaleString()}</div>
                </div>
                <div className="text-center p-2.5 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl border border-purple-100/50">
                  <div className="text-[10px] md:text-xs text-purple-400 mb-0.5">🎯 属性年収目安</div>
                  <div className="text-sm md:text-base font-bold text-purple-600">{stats.expected}万円</div>
                </div>
              </div>
            </div>

            {/* 詳細パラメータ */}
            <div className="glass-card p-5 rounded-3xl">
              <h3 className="text-base font-bold mb-5 flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-4 h-4 text-pink-400" />
                詳細パラメータ
              </h3>

              <DevBar
                label="全国同年代 年収偏差値"
                desc="同じ年齢の全国平均年収と比較"
                value={stats.nationalDev}
                barClass="bar-pink"
                emoji="💴"
              />

              <DevBar
                label="同年代 資産偏差値"
                desc="同年代の平均純資産と比較"
                value={stats.netWorthDev}
                barClass="bar-sky"
                emoji="🏦"
              />

              <DevBar
                label="同属性 年収偏差値"
                desc="同業種・学歴・居住地の中での立ち位置"
                value={stats.attrDev}
                barClass="bar-purple"
                emoji="🎯"
              />

              <DevBar
                label="労働コスパ 偏差値"
                desc="労働時間と物価を考慮したQoL指標"
                value={stats.qolDev}
                barClass="bar-mint"
                emoji="🌿"
              />

              <div className="mt-4 text-[11px] text-gray-400 text-center bg-pink-50/50 p-2.5 rounded-xl border border-pink-100/30">
                ※ このシミュレータの数値は統計モデルを基にしたエンタメ用のおおよその目安です 🫧
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;