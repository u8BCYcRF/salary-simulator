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
  LucideIcon
} from 'lucide-react';

interface DevBarProps {
  label: string;
  value: number;
  colorClass: string;
  icon: LucideIcon;
  desc?: string;
}

// コンポーネントの再生成を防ぐため、Appの外側に定義を移動
const DevBar: React.FC<DevBarProps> = ({ label, value, colorClass, icon: Icon, desc }) => (
  <div className="mb-6">
    <div className="flex justify-between items-end mb-2">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <h4 className="font-bold text-gray-800">{label}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <div className="text-2xl font-black tabular-nums tracking-tighter">
        {value.toFixed(1)}
      </div>
    </div>
    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-300 z-10"></div>
      <div
        className={`h-full ${colorClass} transition-all duration-700 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, (value / 100) * 100))}%` }}
      />
    </div>
  </div>
);

interface SliderInputProps {
  icon: LucideIcon;
  iconColor: string;
  valueColor: string;
  accentColor: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
  desc?: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ icon: Icon, iconColor, valueColor, accentColor, label, value, min, max, step, unit, onChange, desc }) => {
  const displayValue = value >= max ? `${max}${unit}以上` : `${value}${unit}`;
  return (
    <div className="space-y-2">
      <label className="flex justify-between items-center font-medium">
        <span className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          {label}
        </span>
        <span className={`text-xl font-bold ${valueColor}`}>
          {displayValue}
        </span>
      </label>
      <input
        type="range" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full ${accentColor}`}
      />
      {desc && <p className="text-xs text-gray-400 text-right">{desc}</p>}
    </div>
  );
};

const App: React.FC = () => {
  // --- UI State ---
  const [activeTab, setActiveTab] = useState<'income' | 'assets'>('income'); // 'income' | 'assets'

  // --- Income & Attr State ---
  const [age, setAge] = useState<number>(30);
  const [income, setIncome] = useState<number>(500); // 単位: 万円
  const [workHours, setWorkHours] = useState<number>(40); // 週の労働時間
  const [location, setLocation] = useState<string>('tokyo');
  const [industry, setIndustry] = useState<string>('it');
  const [education, setEducation] = useState<string>('bachelor');

  // --- Assets State ---
  const [cash, setCash] = useState<number>(300); // 単位: 万円
  const [stocks, setStocks] = useState<number>(200);
  const [otherAssets, setOtherAssets] = useState<number>(0);
  const [debt, setDebt] = useState<number>(0);

  // --- Constants (Stat Data) ---
  const locations = [
    { id: 'tokyo', name: '東京都', multiplier: 1.22, costOfLiving: 1.04 },
    { id: 'kanagawa', name: '神奈川県 (概算)', multiplier: 1.15, costOfLiving: 1.033 },
    { id: 'urban', name: 'その他の都市圏 (概算)', multiplier: 1.05, costOfLiving: 1.01 },
    { id: 'rural', name: '地方・郊外 (概算)', multiplier: 0.90, costOfLiving: 0.96 },
  ];

  const industries = [
    { id: 'utilities', name: '電気・ガス・熱供給・水道業', multiplier: 1.74 },
    { id: 'finance', name: '金融業・保険業', multiplier: 1.47 },
    { id: 'it', name: '情報通信業', multiplier: 1.38 },
    { id: 'prof_services', name: '学術研究・専門・技術サービス・教育等', multiplier: 1.15 },
    { id: 'manufacturing', name: '製造業', multiplier: 1.19 },
    { id: 'construction', name: '建設業', multiplier: 1.18 },
    { id: 'real_estate', name: '不動産業・物品賃貸業', multiplier: 1.04 },
    { id: 'transport', name: '運輸業・郵便業', multiplier: 1.02 },
    { id: 'medical', name: '医療・福祉', multiplier: 0.90 },
    { id: 'wholesale_retail', name: '卸売業・小売業', multiplier: 0.86 },
    { id: 'services', name: 'サービス業', multiplier: 0.81 },
    { id: 'agri_mining', name: '農林水産・鉱業', multiplier: 0.73 },
    { id: 'accommodation', name: '宿泊業・飲食サービス業', multiplier: 0.58 },
  ];

  const educations = [
    { id: 'graduate_school', name: '大学院修了', multiplier: 1.46 },
    { id: 'university', name: '大学卒', multiplier: 1.26 },
    { id: 'kosen_junior_college', name: '高専・短大・専門卒', multiplier: 1.13 },
    { id: 'highschool', name: '高校卒', multiplier: 1.00 },
  ];

  // 国税庁『令和6年分 民間給与実態統計調査』に基づく年齢別データ (20-70+)
  const incomeStatsByAge = [
    { minAge: 18, maxAge: 24, mean: 277, median_est: 239.3, sd_est: 215.8 },
    { minAge: 25, maxAge: 29, mean: 407, median_est: 351.6, sd_est: 317.1 },
    { minAge: 30, maxAge: 34, mean: 449, median_est: 387.9, sd_est: 349.8 },
    { minAge: 35, maxAge: 39, mean: 482, median_est: 416.4, sd_est: 375.5 },
    { minAge: 40, maxAge: 44, mean: 516, median_est: 445.8, sd_est: 402.0 },
    { minAge: 45, maxAge: 49, mean: 540, median_est: 466.6, sd_est: 420.8 },
    { minAge: 50, maxAge: 54, mean: 559, median_est: 483.0, sd_est: 435.6 },
    { minAge: 55, maxAge: 59, mean: 572, median_est: 494.2, sd_est: 445.7 },
    { minAge: 60, maxAge: 64, mean: 473, median_est: 408.4, sd_est: 368.6 },
    { minAge: 65, maxAge: 69, mean: 370, median_est: 319.6, sd_est: 288.3 },
    { minAge: 70, maxAge: 100, mean: 305, median_est: 263.5, sd_est: 237.7 }
  ];

  // --- Calculations ---
  const stats = useMemo(() => {
    // 該当する年齢帯の統計データを取得
    const ageStat = incomeStatsByAge.find(s => age >= s.minAge && age <= s.maxAge)
      || incomeStatsByAge[incomeStatsByAge.length - 1]; // fallback to oldest

    // 1. 同年代の年収偏差値 (ベースは中央値)
    const baseExpectedIncome = ageStat.median_est;
    const ageSigma = ageStat.sd_est;
    let nationalDev = 50 + ((income - baseExpectedIncome) / ageSigma) * 10;

    // 2. 属性（地域・業種・学歴）補正後の期待値と偏差値
    const loc = locations.find(l => l.id === location);
    const ind = industries.find(i => i.id === industry);
    const edu = educations.find(e => e.id === education);

    // NOTE: TypeScript strict mode check to handle possible undefined fallback
    const locMultiplier = loc?.multiplier ?? 1;
    const locCostOfLiving = loc?.costOfLiving ?? 1;
    const indMultiplier = ind?.multiplier ?? 1;
    const eduMultiplier = edu?.multiplier ?? 1;

    // 属性による年収期待値は「全国ベース期待値 × 各種倍率の積」とする
    const attrExpectedIncome = baseExpectedIncome * locMultiplier * indMultiplier * eduMultiplier;
    // 分散(標準偏差)も業種や地域の倍率で同じように広がると仮定する
    const attrSigma = ageSigma * locMultiplier * indMultiplier * eduMultiplier;
    let attrDev = 50 + ((income - attrExpectedIncome) / attrSigma) * 10;

    // 3. 労働コスパ・QoL偏差値
    // 実質時給: 年間労働時間で割り、さらに生活費の倍率で生活水準を補正する
    const annualWorkHours = workHours * 52;
    const hourlyWage = (income * 10000) / annualWorkHours;

    // 期待時給: その属性が「週40時間」働いた場合の時給ベース
    const expectedAnnualWorkHours = 40 * 52;
    const expectedHourlyWage = (attrExpectedIncome * 10000) / expectedAnnualWorkHours / locCostOfLiving;
    const actualRealHourlyWage = hourlyWage / locCostOfLiving;

    // 時給のばらつきは、期待時給の一定割合(ここでは仮に0.4倍)とする
    const hourlySigma = expectedHourlyWage * 0.4;
    let qolDev = 50 + ((actualRealHourlyWage - expectedHourlyWage) / hourlySigma) * 10;

    // 4. 年代別の資産偏差値
    const netWorth = cash + stocks + otherAssets - debt;

    // 年齢に基づく期待純資産（金融広報中央委員会の世論調査ベース、中央値の近似カーブ）
    let expectedNetWorth = 0;
    if (age <= 25) { expectedNetWorth = 15; }
    else if (age <= 29) { expectedNetWorth = 50; }
    else if (age <= 34) { expectedNetWorth = 120; }
    else if (age <= 39) { expectedNetWorth = 200; }
    else if (age <= 49) { expectedNetWorth = 250; }
    else if (age <= 59) { expectedNetWorth = 300; }
    else { expectedNetWorth = 650; }

    // 資産のばらつき(Sigma)は、年齢とともに大きく広がる (仮定値)
    const netWorthSigma = 200 + Math.max(0, age - 20) * 80;
    let netWorthDev = 50 + ((netWorth - expectedNetWorth) / netWorthSigma) * 10;

    // 丸め処理と上限・下限（20〜100）
    const clamp = (val: number) => Math.min(Math.max(Math.round(val * 10) / 10, 20), 100);

    nationalDev = clamp(nationalDev);
    attrDev = clamp(attrDev);
    qolDev = clamp(qolDev);
    netWorthDev = clamp(netWorthDev);

    // 総合偏差値（年収35%、資産35%、属性15%、コスパ15%の重み付け）
    const totalDev = clamp((nationalDev * 0.35) + (netWorthDev * 0.35) + (attrDev * 0.15) + (qolDev * 0.15));

    // ランク判定
    let rankName = "";
    let rankColor = "";
    if (totalDev >= 80) { rankName = "GOD (雲の上の存在)"; rankColor = "text-yellow-500"; }
    else if (totalDev >= 70) { rankName = "Sランク (トップエリート)"; rankColor = "text-purple-500"; }
    else if (totalDev >= 65) { rankName = "Aランク (超優秀)"; rankColor = "text-blue-500"; }
    else if (totalDev >= 55) { rankName = "Bランク (優秀・上位層)"; rankColor = "text-emerald-500"; }
    else if (totalDev >= 45) { rankName = "Cランク (平均的・ボリューム層)"; rankColor = "text-gray-700"; }
    else if (totalDev >= 35) { rankName = "Dランク (伸びしろあり)"; rankColor = "text-orange-500"; }
    else { rankName = "Eランク (ハードモード)"; rankColor = "text-red-500"; }

    return {
      nationalDev,
      attrDev,
      qolDev,
      netWorthDev,
      totalDev,
      netWorth,
      rankName,
      rankColor,
      hourlyWage: Math.round(hourlyWage),
      expected: Math.round(attrExpectedIncome)
    };
  }, [age, income, workHours, location, industry, education, cash, stocks, otherAssets, debt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            年収・資産偏差値シミュレータ <span className="text-indigo-600">PRO</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            年齢・属性・総資産からあなたの「真の戦闘力」を可視化します
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Column: Inputs */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-3 mb-5">
              <Zap className="w-5 h-5 text-indigo-500" />
              ステータス入力
            </h2>

            {/* Age Slider (Always Visible) */}
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <SliderInput
                icon={Calendar} iconColor="text-blue-500" valueColor="text-blue-600" accentColor="accent-blue-500"
                label="年齢" value={age} min={18} max={65} step={1} unit="歳"
                onChange={setAge}
              />
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
              <button
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'income' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('income')}
              >
                年収・属性
              </button>
              <button
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'assets' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('assets')}
              >
                資産・負債
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 relative">
              {activeTab === 'income' && (
                <div className="space-y-6">
                  <SliderInput
                    icon={Banknote} iconColor="text-emerald-500" valueColor="text-emerald-600" accentColor="accent-emerald-500"
                    label="現在の年収" value={income} min={200} max={1500} step={10} unit="万円"
                    onChange={setIncome}
                  />
                  <SliderInput
                    icon={Clock} iconColor="text-orange-500" valueColor="text-orange-600" accentColor="accent-orange-500"
                    label="週の労働時間" value={workHours} min={10} max={100} step={1} unit="時間"
                    onChange={setWorkHours}
                    desc="※残業・副業含む実稼働"
                  />

                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" /> 居住地
                      </label>
                      <select
                        value={location} onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" /> 業種
                      </label>
                      <select
                        value={industry} onChange={(e) => setIndustry(e.target.value)}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" /> 最終学歴
                      </label>
                      <select
                        value={education} onChange={(e) => setEducation(e.target.value)}
                        className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        {educations.map(ed => <option key={ed.id} value={ed.id}>{ed.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <SliderInput
                    icon={Wallet} iconColor="text-emerald-500" valueColor="text-emerald-600" accentColor="accent-emerald-500"
                    label="現金・預貯金" value={cash} min={0} max={10000} step={50} unit="万円"
                    onChange={setCash}
                  />
                  <SliderInput
                    icon={LineChart} iconColor="text-blue-500" valueColor="text-blue-600" accentColor="accent-blue-500"
                    label="株式・投資信託・債券等" value={stocks} min={0} max={10000} step={50} unit="万円"
                    onChange={setStocks}
                  />
                  <SliderInput
                    icon={Home} iconColor="text-purple-500" valueColor="text-purple-600" accentColor="accent-purple-500"
                    label="その他資産 (不動産・車など)" value={otherAssets} min={0} max={10000} step={50} unit="万円"
                    onChange={setOtherAssets}
                    desc="※持ち家などの場合は現在の売却想定額"
                  />
                  <SliderInput
                    icon={CreditCard} iconColor="text-red-500" valueColor="text-red-600" accentColor="accent-red-500"
                    label="負債 (ローン・借入金など)" value={debt} min={0} max={10000} step={50} unit="万円"
                    onChange={setDebt}
                  />

                  <div className="mt-6 p-4 bg-amber-50 rounded-xl flex justify-between items-center border border-amber-100">
                    <span className="font-bold text-amber-800 flex items-center gap-2">
                      <Landmark className="w-4 h-4" /> 算出される純資産
                    </span>
                    <span className="text-2xl font-black text-amber-700">
                      {stats.netWorth.toLocaleString()}<span className="text-base font-normal text-amber-600"> 万円</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="md:col-span-7 space-y-6">

            {/* Top Result Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-indigo-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Award className="w-48 h-48" />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-sm font-bold tracking-wider text-indigo-500 uppercase bg-indigo-50 px-3 py-1 rounded-full">
                  総合評価
                </span>
                <div className="text-6xl md:text-7xl font-black text-gray-900 tracking-tighter py-2">
                  {stats.totalDev.toFixed(1)}
                </div>
                <div className={`text-xl md:text-2xl font-bold ${stats.rankColor}`}>
                  {stats.rankName}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-100 relative z-10">
                <div className="text-center p-2 md:p-3 bg-amber-50 rounded-2xl">
                  <div className="text-[10px] md:text-xs text-amber-600 mb-1 font-medium">純資産額</div>
                  <div className="text-sm md:text-lg font-bold text-amber-800">{stats.netWorth.toLocaleString()}万円</div>
                </div>
                <div className="text-center p-2 md:p-3 bg-gray-50 rounded-2xl">
                  <div className="text-[10px] md:text-xs text-gray-500 mb-1">推定時給換算</div>
                  <div className="text-sm md:text-lg font-bold text-gray-800">¥{stats.hourlyWage.toLocaleString()}</div>
                </div>
                <div className="text-center p-2 md:p-3 bg-gray-50 rounded-2xl">
                  <div className="text-[10px] md:text-xs text-gray-500 mb-1">同属性年収目安</div>
                  <div className="text-sm md:text-lg font-bold text-gray-800">{stats.expected}万円</div>
                </div>
              </div>
            </div>

            {/* Detail Bars */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                詳細パラメータ
              </h3>

              <DevBar
                label="全国同年代 年収偏差値"
                desc="純粋に同じ年齢の全国平均年収と比較した絶対値"
                value={stats.nationalDev}
                colorClass="bg-blue-500"
                icon={Banknote}
              />

              <DevBar
                label="同年代 資産偏差値"
                desc="同年代の平均純資産（資産合計−負債）と比較した値"
                value={stats.netWorthDev}
                colorClass="bg-amber-500"
                icon={Landmark}
              />

              <DevBar
                label="同属性 年収偏差値"
                desc="同じ業種・学歴・居住地の人の中での年収の立ち位置"
                value={stats.attrDev}
                colorClass="bg-purple-500"
                icon={Briefcase}
              />

              <DevBar
                label="労働コスパ 偏差値"
                desc="労働時間と地域物価を考慮した実質的なQoL指標"
                value={stats.qolDev}
                colorClass="bg-emerald-500"
                icon={Clock}
              />

              <div className="mt-6 text-xs text-gray-400 text-center bg-gray-50 p-3 rounded-xl">
                ※このシミュレータの数値は統計モデルを基にしたエンタメ用のおおよその目安です。
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;