import type { AppLanguage, Preset } from "./types";

interface LocaleQuoteSet {
  isabelle: string;
  redd: string;
  cj: string;
  flick: string;
  nook: string;
  leif: string;
  brewster: string;
}

export interface LocaleData extends LocaleQuoteSet {
  appName: string;
  subTitle: string;
  standardRhythm: string;
  presetText: string;
  workScheduleTitle: string;
  workStartLabel: string;
  workEndLabel: string;

  beforeWorkTitle: string;
  workHoursTitle: string;
  afterWorkTitle: string;
  afterWorkCelebrate: string;
  afterWorkSub: string;
  combinationTab: string;
  hoursTab: string;
  minutesTab: string;
  secondsTab: string;
  percentageTab: string;

  progressLabel: string;
  mainToggleTitle: string;
  mainToggleSub: string;
  masterToggleOn: string;
  masterToggleOff: string;
  clockPaceLabel: string;
  recomHealthMode: string;
  customRhythmMode: string;
  notWorkHoursStatus: string;
  countdownNextRest: string;
  mechanismToggleLabel: string;
  optDefaultTitle: string;
  optCustomTitle: string;
  workIntervalLabel: string;
  singleRestLabel: string;
  minutesUnit: string;
  tipTitle: string;
  tipContent: string;
  simulateBtn: string;
  benchRestTitle: string;
  suggestedRestTime: string;
  skipRestBtn: string;
  finishRestBtn: string;
  modalSubtext: string;
  modalTip1: string;
  modalTip2: string;
  modalTip3: string;

  displayUnitsLabel: string;
  submitClockOutBtn: string;
  languageSwitchTitle: string;
  brandBadgeLabel: string;
  mobileDashboardTab: string;
  mobilePhoneTab: string;
  clockOutResumeAriaLabel: string;
  clockOutPauseAriaLabel: string;
  modalConfirmBtn: string;
  phoneVersionLabel: string;
  phoneNetworkLabel: string;
  hourDisplayUnit: string;
  minuteDisplayUnit: string;
  secondDisplayUnit: string;
  hourDurationUnit: string;
  minuteDurationUnit: string;
  secondDurationUnit: string;
  restMinuteCompactUnit: string;
  restSecondCompactUnit: string;
  quoteHeadingTemplate: string;
  standardPreset965: string;
  relaxedPreset855: string;
  hardcorePreset996: string;
  halfDayPreset84: string;
  helperBeforeWork: string;
  helperAfterWork: string;
  helperEarlyWork: string;
  helperMidWork: string;
  helperLateWork: string;
  hudWeekdays: [string, string, string, string, string, string, string];
  hudMonthDayTemplate: string;
  ergonomicQuotes: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
}

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  zh: "🇨🇳 简体中文",
  tc: "🇭🇰 繁體中文",
  en: "🇺🇸 English",
  ja: "🇯🇵 日本語",
  ko: "🇰🇷 한국어",
};

export const locales: Record<AppLanguage, LocaleData> = {
  zh: {
    appName: "狸哩下班探针与健康工坊",
    subTitle: "守护你的节奏，让每一次下班都是快乐的离岛！",
    standardRhythm: "标准作息",
    presetText: "💡 应用预设：",
    workScheduleTitle: "工作作息设定",
    workStartLabel: "上班时间:",
    workEndLabel: "下班时间:",

    beforeWorkTitle: "🌞 上班倒计时",
    workHoursTitle: "距离快乐下班还有",
    afterWorkTitle: "已经顺利下班！",
    afterWorkCelebrate: "下班啦！🎉",
    afterWorkSub: "辛苦啦！今晚去找傅达研究化石，或者去海滩钓河豚吧！",
    combinationTab: "⏱️ 时分秒",
    hoursTab: "⏰ 纯小时",
    minutesTab: "💬 纯分钟",
    secondsTab: "⚡ 纯秒数",
    percentageTab: "📈 百分比",

    progressLabel: "工作进度",
    mainToggleTitle: "息眼伸展提醒",
    mainToggleSub: "保持身体活力与视力健康",
    masterToggleOn: "开启",
    masterToggleOff: "关闭",
    clockPaceLabel: "时钟节拍：",
    recomHealthMode: "推荐健康模式",
    customRhythmMode: "自定义节奏",
    notWorkHoursStatus: "☕ 尚未到上班时间，提醒钟暂未开始摆动。",
    countdownNextRest: "休息钟下一次敲响:",
    mechanismToggleLabel: "⚙️ 提醒机制切换",
    optDefaultTitle: "🧘 默认 (每小时息5分)",
    optCustomTitle: "✍️ 自定义间隔/时长",
    workIntervalLabel: "工作间隔时长:",
    singleRestLabel: "单次休息时间:",
    minutesUnit: "分钟",
    tipTitle: "📖 提示：",
    tipContent: "每隔1小时自动弹窗提醒并推荐做离屏休息调整。不仅能护眼，还能额外赚取健康里数哦！",
    simulateBtn: "🎮 立即尝鲜弹窗休息效果",
    benchRestTitle: "🍃 树荫长椅休息时刻 🍃",
    suggestedRestTime: "建议休息倒计时",
    skipRestBtn: "跳过休息",
    finishRestBtn: "休息完毕 (+100)",
    modalSubtext: "🌟 耐心静候倒计时结束，返回可解锁最大 +350 积分奖励！",
    modalTip1: "💧 起身活动活动，补充适量水分",
    modalTip2: "👀 极目远眺，放松修整视疲劳眼部肌肉",
    modalTip3: "🧘 深呼吸并活动肩颈，缓解久坐酸痛",

    displayUnitsLabel: "切换显示单位：",
    submitClockOutBtn: "提交今日成果，敲响快乐下班钟！",
    languageSwitchTitle: "切换语言",
    brandBadgeLabel: "NOOK INC.",
    mobileDashboardTab: "主页",
    mobilePhoneTab: "健康",
    clockOutResumeAriaLabel: "继续播放背景音乐",
    clockOutPauseAriaLabel: "暂停背景音乐",
    modalConfirmBtn: "好的，收到！",
    phoneVersionLabel: "NookPhone v3.5",
    phoneNetworkLabel: "LTE",
    hourDisplayUnit: "小时",
    minuteDisplayUnit: "分钟",
    secondDisplayUnit: "秒",
    hourDurationUnit: "小时",
    minuteDurationUnit: "分钟",
    secondDurationUnit: "秒",
    restMinuteCompactUnit: "分",
    restSecondCompactUnit: "秒",
    quoteHeadingTemplate: "📢 岛民【{author}】嘱咐：",
    standardPreset965: "标准作息 965",
    relaxedPreset855: "国企养生 855",
    hardcorePreset996: "奋斗极客 996",
    halfDayPreset84: "半天班 84",
    helperBeforeWork: "还没有开始正式工作哟。放轻松，享受静谧清晨吧！",
    helperAfterWork: "下班探针任务圆满达成！快背上行囊散步去吧！",
    helperEarlyWork: "刚开启元气满满的一天！狸村今日也是充满动力 and 生机！",
    helperMidWork: "不知不觉工作过半！让我们的心情就像岛上的晴天一样灿烂。",
    helperLateWork: "太棒啦！夕阳已染红椰树梢，今天的下班钟声就要敲响啦！",
    hudWeekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    hudMonthDayTemplate: "{month}月{day}日",
    ergonomicQuotes: [
      "工作虽然重要，但如果累垮了，狸克社长也会苦恼的哦！多眨眼、喝口水吧！",
      "嗯哼！完美的艺术灵感源自于松弛的眼力。起来走两步，看看这幅完美的风景画。",
      "想要钓起深海的旷世奇珍，眼睛必须要时刻锐利。休息五分钟，等会必定大丰收！",
      "嘿！别让那个闪光的发热盒子吞噬了你的神识。和昆虫一样，顺应天光树影休息一下吧！",
      "每隔一小时花时间松弛关节，不仅保护视力，还能节省好多医疗买药铃钱，超划算的交易！",
      "给眼睛放个小假，看看绿色！虽然除草稍微辛苦，但盯着嫩黄绿叶放松眼睛超棒的！",
      "哼……我为你冲好了一杯极品手冲。放慢动作，现在跟随我深呼吸：吸气——呼气——",
    ],

    isabelle: "西施惠",
    redd: "狐利",
    cj: "俞司廷",
    flick: "龙克斯",
    nook: "狸克",
    leif: "然姐",
    brewster: "老板",
  },
  tc: {
    appName: "狸哩下班探針與健康工坊",
    subTitle: "守護你的節奏，讓每一次下班都是快樂的離島！",
    standardRhythm: "標準作息",
    presetText: "💡 應用預設：",
    workScheduleTitle: "工作作息設定",
    workStartLabel: "上班時間:",
    workEndLabel: "下班時間:",

    beforeWorkTitle: "🌞 上班倒計時",
    workHoursTitle: "距離快樂下班還有",
    afterWorkTitle: "已經順利下班！",
    afterWorkCelebrate: "下班啦！🎉",
    afterWorkSub: "辛苦啦！今晚去找傅達研究化石，或者去海灘釣河豚吧！",
    combinationTab: "⏱️ 時分秒",
    hoursTab: "⏰ 純小時",
    minutesTab: "💬 純分鐘",
    secondsTab: "⚡ 純秒數",
    percentageTab: "📈 百分比",

    progressLabel: "工作進度",
    mainToggleTitle: "息眼伸展提醒",
    mainToggleSub: "保持身體活力與視力健康",
    masterToggleOn: "開啟",
    masterToggleOff: "關閉",
    clockPaceLabel: "時鐘節拍：",
    recomHealthMode: "推薦健康模式",
    customRhythmMode: "自定義節奏",
    notWorkHoursStatus: "☕ 尚未到上班時間，提醒鐘暫未開始擺動。",
    countdownNextRest: "休息鐘下一次敲響:",
    mechanismToggleLabel: "⚙️ 提醒機制切換",
    optDefaultTitle: "🧘 默認 (每小時息5分)",
    optCustomTitle: "✍️ 自定義間隔/時長",
    workIntervalLabel: "工作間隔時長:",
    singleRestLabel: "單次休息時間:",
    minutesUnit: "分鐘",
    tipTitle: "📖 提示：",
    tipContent: "每隔1小時自動彈窗提醒並推薦做離屏休息調整。不僅能護眼，還能額外賺取健康里數哦！",
    simulateBtn: "🎮 立即嘗鮮彈窗休息效果",
    benchRestTitle: "🍃 樹蔭長椅休息時刻 🍃",
    suggestedRestTime: "建議休息倒計時",
    skipRestBtn: "跳過休息",
    finishRestBtn: "休息完畢 (+100)",
    modalSubtext: "🌟 耐心靜候倒計時結束，返回可解鎖最大 +350 積分獎勵！",
    modalTip1: "💧 起身活動活動，補充足量水分",
    modalTip2: "👀 極目遠眺，放鬆修整視疲勞眼部肌肉",
    modalTip3: "🧘 深呼吸並活動肩頸，緩解久坐酸痛",

    displayUnitsLabel: "切換顯示單位：",
    submitClockOutBtn: "提交今日成果，敲響快樂下班鐘！",
    languageSwitchTitle: "切換語言",
    brandBadgeLabel: "NOOK INC.",
    mobileDashboardTab: "主頁",
    mobilePhoneTab: "健康",
    clockOutResumeAriaLabel: "繼續播放背景音樂",
    clockOutPauseAriaLabel: "暫停背景音樂",
    modalConfirmBtn: "好的，收到！",
    phoneVersionLabel: "NookPhone v3.5",
    phoneNetworkLabel: "LTE",
    hourDisplayUnit: "小時",
    minuteDisplayUnit: "分鐘",
    secondDisplayUnit: "秒",
    hourDurationUnit: "小時",
    minuteDurationUnit: "分鐘",
    secondDurationUnit: "秒",
    restMinuteCompactUnit: "分",
    restSecondCompactUnit: "秒",
    quoteHeadingTemplate: "📢 島民【{author}】囑咐：",
    standardPreset965: "標準作息 965",
    relaxedPreset855: "國企養生 855",
    hardcorePreset996: "奮鬥極客 996",
    halfDayPreset84: "半天班 84",
    helperBeforeWork: "還沒有開始正式工作喲。放輕鬆，享受靜謐清晨吧！",
    helperAfterWork: "下班探針任務圓滿達成！快背上行囊散步去吧！",
    helperEarlyWork: "剛開啟元氣滿滿的一天！狸村今日也是充滿動力 and 生機！",
    helperMidWork: "不知不覺工作過半！讓我們的心情就像島上的晴天一樣燦爛。",
    helperLateWork: "太棒啦！夕陽已染紅椰樹梢，今天的下班鐘聲就要敲響啦！",
    hudWeekdays: ["週日", "週一", "週二", "週三", "週四", "週五", "週六"],
    hudMonthDayTemplate: "{month}月{day}日",
    ergonomicQuotes: [
      "工作雖然重要，但如果累垮了，狸克社長也會苦惱的哦！多眨眼、喝口水吧！",
      "嗯哼！完美的藝術靈感源自於鬆弛的眼力．起來走兩步，看看這幅完美的風景畫。",
      "想要釣起深海的曠世奇珍，眼睛必須要時刻銳利。休息五分鐘，等會必定大豐收！",
      "嘿！別讓那個閃光的發熱盒子吞噬了你的神識。和昆蟲一樣，順應天光樹影休息一下吧！",
      "每隔一小時花時間鬆弛關節，不僅保護視力，還能節省好多醫療買藥鈴錢，超劃算的交易！",
      "給眼睛放個小假，看看綠色！雖然除草稍微辛苦，但盯著嫩黃綠葉放鬆眼睛超棒的！",
      "哼……我為你沖好了一杯極品手沖。放慢動作，現在跟隨我深呼吸：吸氣——呼氣——",
    ],

    isabelle: "西施惠",
    redd: "狐利",
    cj: "俞司廷",
    flick: "龍克斯",
    nook: "狸克",
    leif: "然姐",
    brewster: "老板",
  },
  en: {
    appName: "Nook's Work Rhythm & Health Lab",
    subTitle: "Guard your rhythm, make every clock-out a happy island cruise!",
    standardRhythm: "Standard Shift",
    presetText: "💡 Quick Presets:",
    workScheduleTitle: "Shift Setting",
    workStartLabel: "Start Time:",
    workEndLabel: "End Time:",

    beforeWorkTitle: "🌞 Countdown to shift start",
    workHoursTitle: "Countdown to Clock-out!",
    afterWorkTitle: "Successfully Off Work!",
    afterWorkCelebrate: "Off duty! 🎉",
    afterWorkSub: "Great job today! Go investigate fossils with Blathers, or catch some puffers on the beach!",
    combinationTab: "⏱️ H/M/S",
    hoursTab: "⏰ Hours Only",
    minutesTab: "💬 Mins Only",
    secondsTab: "⚡ Secs Only",
    percentageTab: "📈 Percent %",

    progressLabel: "Shift completed",
    mainToggleTitle: "Rest Stretch Reminder",
    mainToggleSub: "Preserve posture and eye health",
    masterToggleOn: "On",
    masterToggleOff: "Off",
    clockPaceLabel: "Timer Cadence:",
    recomHealthMode: "Optimal",
    customRhythmMode: "Custom",
    notWorkHoursStatus: "☕ Off shift. The health pendulum is resting.",
    countdownNextRest: "Next rest break chime in:",
    mechanismToggleLabel: "⚙️ Rule Config",
    optDefaultTitle: "🧘 Default (5m rest / hr)",
    optCustomTitle: "✍️ Custom Interval",
    workIntervalLabel: "Work Interval:",
    singleRestLabel: "Rest Duration:",
    minutesUnit: "mins",
    tipTitle: "📖 Tips:",
    tipContent: "Autopopup guides eye breaks every hour. Protects vision and awards lovely extra health miles!",
    simulateBtn: "🎮 Preview Pop-up Rest Interaction",
    benchRestTitle: "🍃 Shady Bench Rest Moment 🍃",
    suggestedRestTime: "Healthy Relaxation Timer",
    skipRestBtn: "Skip Rest",
    finishRestBtn: "Well Rested (+100)",
    modalSubtext: "🌟 Patiently await countdown, click finish to unlock high bonus Nook points!",
    modalTip1: "💧 Rise up, get active and hydrate yourself",
    modalTip2: "👀 Look far into the distance to rest optic muscles",
    modalTip3: "🧘 Deep breaths and roll shoulders to untether strain",

    displayUnitsLabel: "Switch display units:",
    submitClockOutBtn: "Submit work & ring the clock-out chime!",
    languageSwitchTitle: "Switch language",
    brandBadgeLabel: "NOOK INC.",
    mobileDashboardTab: "Home",
    mobilePhoneTab: "Health",
    clockOutResumeAriaLabel: "Resume background music",
    clockOutPauseAriaLabel: "Pause background music",
    modalConfirmBtn: "Got it!",
    phoneVersionLabel: "NookPhone v3.5",
    phoneNetworkLabel: "LTE",
    hourDisplayUnit: "hrs",
    minuteDisplayUnit: "mins",
    secondDisplayUnit: "secs",
    hourDurationUnit: "h",
    minuteDurationUnit: "m",
    secondDurationUnit: "s",
    restMinuteCompactUnit: "m",
    restSecondCompactUnit: "s",
    quoteHeadingTemplate: "📢 Resident [ {author} ] says:",
    standardPreset965: "Standard 965",
    relaxedPreset855: "Relaxed 855",
    hardcorePreset996: "Hardcore 996",
    halfDayPreset84: "Half-Day 84",
    helperBeforeWork: "Shift hasn't officially started. Sit back, relax, and enjoy the quiet morning!",
    helperAfterWork: "Off-work objective secured! Travel safe and have a delightful evening!",
    helperEarlyWork: "Plunge into an energetic shift! The village is thriving with a vivid breeze today!",
    helperMidWork: "Midshift completed! May your mood be as radiant as the island's clear sky.",
    helperLateWork: "Marvelous! Sunset has gilded the coconut palms, clock-out chimes are imminent!",
    hudWeekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    hudMonthDayTemplate: "{month}/{day}",
    ergonomicQuotes: [
      "Work is crucial, but Tom Nook would be so worried if you push too hard! Blink twice and keep hydrated!",
      "Heheh! Exquisite artistic focus requires crisp, relaxed sights. Stretch your legs and appreciate natural landscapes!",
      "Catching deep-sea grand fins means keeping your sight sharp as a needle. Break 5 minutes for massive reports!",
      "Hey! Don't let that shiny glowing device take over your soul. Be like insects: feel the island twilight and rest!",
      "Resting every hour keeps you fit and saves thousands of medicine bells. Yes, a highly profitable venture!",
      "Treat your eyes to cute green! Observing standard island foliage relaxes retina strain perfectly!",
      "Coo... I've brewed you premium hand-pressed coffee. Gently slow down and follow me: breathe in, breathe out...",
    ],

    isabelle: "Isabelle",
    redd: "Redd",
    cj: "C.J.",
    flick: "Flick",
    nook: "Tom Nook",
    leif: "Leif",
    brewster: "Brewster",
  },
  ja: {
    appName: "たぬき退勤計と健康ワークショップ",
    subTitle: "あなたのリズムを守り、退勤を楽しい島への旅に！",
    standardRhythm: "標準シフト",
    presetText: "💡 プリセット：",
    workScheduleTitle: "勤務スケジュール設定",
    workStartLabel: "始業時間:",
    workEndLabel: "終業時間:",

    beforeWorkTitle: "🌞 始業カウントダウン",
    workHoursTitle: "退勤まであと",
    afterWorkTitle: "無事に退勤しました！",
    afterWorkCelebrate: "退勤ですよ！🎉",
    afterWorkSub: "お疲れ様でした！今夜はフータと化石研究をするか、ビーチでフグ釣りに行きましょう！",
    combinationTab: "⏱️ 時分秒",
    hoursTab: "⏰ 時間のみ",
    minutesTab: "💬 分のみ",
    secondsTab: "⚡ 秒のみ",
    percentageTab: "📈 パーセント",

    progressLabel: "勤務進捗",
    mainToggleTitle: "ストレッチ・休憩リマインダー",
    mainToggleSub: "姿勢と目の健康を維持する",
    masterToggleOn: "オン",
    masterToggleOff: "オフ",
    clockPaceLabel: "タイマーペース：",
    recomHealthMode: "推奨健康",
    customRhythmMode: "カスタム",
    notWorkHoursStatus: "☕ 現在は勤務時間外です。健康の振り子は休止中です。",
    countdownNextRest: "次の休憩チャイムまで：",
    mechanismToggleLabel: "⚙️ ルール設定",
    optDefaultTitle: "🧘 デフォルト (1時間おきに5分休憩)",
    optCustomTitle: "✍️ カスタム設定",
    workIntervalLabel: "勤務の間隔:",
    singleRestLabel: "休憩の長さ:",
    minutesUnit: "分",
    tipTitle: "📖 ヒント：",
    tipContent: "1時間おきに自動ポップアップでアイブレイクを推奨。目の負担を軽減し、ボーナスマイルを獲得できます！",
    simulateBtn: "🎮 ポップアップ休憩をプレビューする",
    benchRestTitle: "🍃 木陰のベンチの休憩タイム 🍃",
    suggestedRestTime: "健康リラクゼーションタイマー",
    skipRestBtn: "休憩をスキップ",
    finishRestBtn: "しっかり休んだ (+100)",
    modalSubtext: "🌟 カウントダウンを辛抱強く待ち、終了すると最大 +350 ボーナスマイルを獲得できます！",
    modalTip1: "💧 立ち上がって、適度に水分を補給しましょう",
    modalTip2: "👀 遠くを見つめて、目のピント調整筋肉を休ませてください",
    modalTip3: "🧘 深呼吸して肩を回し、座りっぱなしのこりをほぐします",

    displayUnitsLabel: "表示単位の切り替え：",
    submitClockOutBtn: "仕事の提出＆終業チャイムを鳴らす！",
    languageSwitchTitle: "言語を切り替える",
    brandBadgeLabel: "NOOK INC.",
    mobileDashboardTab: "メイン",
    mobilePhoneTab: "スマホ",
    clockOutResumeAriaLabel: "背景音楽を再生する",
    clockOutPauseAriaLabel: "背景音楽を一時停止する",
    modalConfirmBtn: "了解です！",
    phoneVersionLabel: "NookPhone v3.5",
    phoneNetworkLabel: "LTE",
    hourDisplayUnit: "時間",
    minuteDisplayUnit: "分",
    secondDisplayUnit: "秒",
    hourDurationUnit: "時間",
    minuteDurationUnit: "分",
    secondDurationUnit: "秒",
    restMinuteCompactUnit: "分",
    restSecondCompactUnit: "秒",
    quoteHeadingTemplate: "📢 島民【{author}】からのお願い：",
    standardPreset965: "標準 965",
    relaxedPreset855: "健康養生 855",
    hardcorePreset996: "不屈ハード 996",
    halfDayPreset84: "半日 84",
    helperBeforeWork: "まだ勤務時間が始まっていませんね。リラックスして静かな朝を楽しみましょう！",
    helperAfterWork: "退勤時間がやってきました！急いで荷物をまとめてお散歩に行きましょう！",
    helperEarlyWork: "一日が元気よく始まりました！今日もたぬき村はパワーいっぱいです！",
    helperMidWork: "いつの間にか勤務時間が半分に！島の晴れ渡る空のように元気に行きましょう！",
    helperLateWork: "素晴らしい！夕日がココナッツの木陰を赤く染め、終業ベルが鳴り響きます！",
    hudWeekdays: ["日", "月", "火", "水", "木", "金", "土"],
    hudMonthDayTemplate: "{month}月{day}日",
    ergonomicQuotes: [
      "仕事も大事ですけど、無理をして倒れたらたぬきち社長も心配しちゃいますよ！しっかり瞬きして、お水を飲んでくださいね！",
      "うふふ！完璧な芸術のひらめきは、リラックスした目元から生まれるものです。立ち上がって、この素晴らしい風景画を楽しんでください。",
      "深海の珍しい魚を釣り上げるには、常に研ぎ澄まされた視線が必要です。5分だけ休めば、大漁間違いなしです！",
      "おい！その光る画面に魂を吸い込まれるな。虫たちのように、島の木漏れ日を感じて少し休めよ！",
      "1時間おきに関節をほぐす時間は、目を守るだけでなく、おくすり代のベルも節約できる、とてもお得な取引だなも！",
      "目にちいさな休みをあげて、緑を見ましょう！草むしりは大変ですけど、可愛い葉っぱを眺めると目が休まりますよ！",
      "コト…極上のブレンドを淹れました。少し力を抜いて、私と一緒に深呼吸を…吸って…吐いて…",
    ],

    isabelle: "しずえ",
    redd: "つねきち",
    cj: "ジャスティン",
    flick: "レックス",
    nook: "たぬきち",
    leif: "レイジ",
    brewster: "マスター",
  },
  ko: {
    appName: "너굴 퇴근 탐침과 건강 연구소",
    subTitle: "당신의 리듬을 지키고, 매 퇴근을 행복한 섬 여행으로!",
    standardRhythm: "표준 근무",
    presetText: "💡 프리셋:",
    workScheduleTitle: "근무 일정 설정",
    workStartLabel: "출근 시간:",
    workEndLabel: "퇴근 시간:",

    beforeWorkTitle: "🌞 출근 카운트다운",
    workHoursTitle: "퇴근까지 남은 시간",
    afterWorkTitle: "무사히 퇴근했습니다!",
    afterWorkCelebrate: "퇴근입니다! 🎉",
    afterWorkSub: "오늘도 수고하셨어요! 오늘 밤에는 부박사와 화석 연구를 하거나 해변에서 복어 낚시를 해보세요!",
    combinationTab: "⏱️ 시분초",
    hoursTab: "⏰ 시간만",
    minutesTab: "💬 분만",
    secondsTab: "⚡ 초만",
    percentageTab: "📈 퍼센트",

    progressLabel: "근무 진행률",
    mainToggleTitle: "스트레칭 및 휴식 알림",
    mainToggleSub: "자세와 눈 건강 유지하기",
    masterToggleOn: "켜짐",
    masterToggleOff: "꺼짐",
    clockPaceLabel: "타이머 페이스:",
    recomHealthMode: "추천 건강",
    customRhythmMode: "사용자 정의",
    notWorkHoursStatus: "☕ 근무 시간 외입니다. 건강 시계 추가 정지 상태입니다.",
    countdownNextRest: "다음 휴식 차임벨까지:",
    mechanismToggleLabel: "⚙️ 규칙 구성",
    optDefaultTitle: "🧘 기본값 (매시간 5분 휴식)",
    optCustomTitle: "✍️ 맞춤 설정",
    workIntervalLabel: "근무 간격:",
    singleRestLabel: "휴식 시간:",
    minutesUnit: "분",
    tipTitle: "📖 팁:",
    tipContent: "매시간 자동 팝업으로 안구 휴식을 권장합니다. 시력을 보호하고 마일리지를 적립해 보세요!",
    simulateBtn: "🎮 팝업 휴식 미리보기",
    benchRestTitle: "🍃 그늘진 벤치 휴식 시간 🍃",
    suggestedRestTime: "건강 힐링 타이머",
    skipRestBtn: "휴식 건너뛰기",
    finishRestBtn: "휴식 완료 (+100)",
    modalSubtext: "🌟 카운트다운 완료를 조용히 기다리시면 최대 +350 보너스 포인트를 받을 수 있습니다!",
    modalTip1: "💧 일어나서 가볍게 움직이며 수분을 보충하세요",
    modalTip2: "👀 먼 곳을 바라보며 눈 피로를 완화시켜 줍니다",
    modalTip3: "🧘 깊게 호흡하며 어깨와 목을 가볍게 푸세요",

    displayUnitsLabel: "표시 단위 전환：",
    submitClockOutBtn: "오늘의 성과물 제출하고 퇴근벨 치기!",
    languageSwitchTitle: "언어 전환",
    brandBadgeLabel: "NOOK INC.",
    mobileDashboardTab: "계측판",
    mobilePhoneTab: "너굴폰",
    clockOutResumeAriaLabel: "배경 음악 다시 재생",
    clockOutPauseAriaLabel: "배경 음악 일시정지",
    modalConfirmBtn: "알겠습니다!",
    phoneVersionLabel: "NookPhone v3.5",
    phoneNetworkLabel: "LTE",
    hourDisplayUnit: "시간",
    minuteDisplayUnit: "분",
    secondDisplayUnit: "초",
    hourDurationUnit: "시간",
    minuteDurationUnit: "분",
    secondDurationUnit: "초",
    restMinuteCompactUnit: "분",
    restSecondCompactUnit: "초",
    quoteHeadingTemplate: "📢 섬 주민【{author}】의 조언:",
    standardPreset965: "표준 965",
    relaxedPreset855: "웰빙 855",
    hardcorePreset996: "하드코어 996",
    halfDayPreset84: "반일 84",
    helperBeforeWork: "아직 공식 근무 시간이 시작되지 않았어요. 편안하게 조용한 아침을 즐겨보세요!",
    helperAfterWork: "즐거운 퇴근 시간입니다오늘 하루 최고였구리 어서 퇴근해서 산책을 가볼까요!",
    helperEarlyWork: "가뿐하게 아침을 시작했구리! 오늘도 건강하고 생기 넘치는 섬 생활을 시작해봐요!",
    helperMidWork: "어느덧 근무 시간의 절반이 훌쩍 지나갔어요! 쾌청한 하늘처럼 행복한 하루 보내세요!",
    helperLateWork: "근무 종료가 임박했구리 야자수 사이로 지는 멋진 노을을 감상하며 하루를 마무리해요!",
    hudWeekdays: ["일", "월", "화", "수", "목", "금", "토"],
    hudMonthDayTemplate: "{month}월 {day}일",
    ergonomicQuotes: [
      "일도 중요하지만 무리해서 쓰러지면 너굴 사장님도 걱정하실 거예요! 눈을 잘 깜빡이고 물을 꼭 챙겨 드세요!",
      "우후후! 완벽한 예술적 영감은 편안한 눈에서 나오는 법이에요. 일어나서 이 아름다운 풍경을 감상해 보세요.",
      "심해의 귀한 물고기를 낚으려면 항상 날카로운 시선이 필요해요. 5분만 쉬어가면 대어가 찾아올 거예요!",
      "야! 그 빛나는 화면에 영혼을 뺏기지 마. 곤충들처럼 섬의 햇살을 느끼며 잠시 쉬어가라고!",
      "1시간마다 관절을 풀어주는 시간은 눈을 보호할 뿐 아니라 약값 벨도 아낄 수 있는 아주 실속 있는 거래구리!",
      "눈에 작은 휴식을 주고 초록색을 보세요! 잡초 뽑기는 고되지만 푸릇푸릇한 잎사귀들을 보면 눈이 편안해져요!",
      "탁… 극상 블렌드 커피를 내렸습니다. 잠시 힘을 빼고 저와 함께 심호흡을… 들이쉬고… 내쉬고…",
    ],

    isabelle: "여울",
    redd: "여욱",
    cj: "저스틴",
    flick: "레온",
    nook: "너굴",
    leif: "늘봉이",
    brewster: "마스터",
  },
};

const ERGONOMIC_QUOTE_AUTHORS: Array<keyof LocaleQuoteSet> = [
  "isabelle",
  "redd",
  "cj",
  "flick",
  "nook",
  "leif",
  "brewster",
];

export function buildPresets(lang: AppLanguage): Preset[] {
  const t = locales[lang];
  return [
    { name: t.standardPreset965, start: "09:00", end: "18:00" },
    { name: t.relaxedPreset855, start: "08:00", end: "17:00" },
    { name: t.hardcorePreset996, start: "09:00", end: "21:00" },
    { name: t.halfDayPreset84, start: "08:30", end: "12:30" },
  ];
}

export function formatLocalizedDuration(
  lang: AppLanguage,
  hoursPart: number,
  minutesPart: number,
  secondsPart: number,
) {
  const t = locales[lang];
  return `${hoursPart}${t.hourDurationUnit} ${minutesPart}${t.minuteDurationUnit} ${secondsPart}${t.secondDurationUnit}`;
}

export function formatNextBreakTimerLabel(lang: AppLanguage, nextBreakSeconds: number) {
  const t = locales[lang];
  const h = Math.floor(nextBreakSeconds / 3600);
  const m = Math.floor((nextBreakSeconds % 3600) / 60);
  const s = nextBreakSeconds % 60;
  return `${h ? `${h}${t.hourDurationUnit} ` : ""}${m}${t.minuteDurationUnit} ${s}${t.secondDurationUnit}`;
}

export function formatRestCountdownLabel(lang: AppLanguage, restTimeLeft: number) {
  const t = locales[lang];
  const minutes = Math.floor(restTimeLeft / 60);
  const seconds = restTimeLeft % 60;
  return `${minutes}${t.restMinuteCompactUnit} ${seconds}${t.restSecondCompactUnit}`;
}

export function formatResidentQuoteHeading(lang: AppLanguage, author: string) {
  return locales[lang].quoteHeadingTemplate.replace("{author}", author);
}

export function formatHudMonthDay(lang: AppLanguage, date: Date) {
  const t = locales[lang];
  return t.hudMonthDayTemplate
    .replace("{month}", String(date.getMonth() + 1))
    .replace("{day}", String(date.getDate()));
}

export function getHudWeekday(lang: AppLanguage, date: Date) {
  return locales[lang].hudWeekdays[date.getDay()];
}

export function getHelperSubtext(
  lang: AppLanguage,
  progressPercentage: string,
  statusText: string,
) {
  const t = locales[lang];

  if (statusText === "beforeWork") {
    return t.helperBeforeWork;
  }

  if (statusText === "afterWork") {
    return t.helperAfterWork;
  }

  const percentNum = parseFloat(progressPercentage);
  if (percentNum < 30) {
    return t.helperEarlyWork;
  }

  if (percentNum < 70) {
    return t.helperMidWork;
  }

  return t.helperLateWork;
}

export function getErgonomicQuotes(lang: AppLanguage) {
  const t = locales[lang];
  return ERGONOMIC_QUOTE_AUTHORS.map((authorKey, index) => ({
    author: t[authorKey],
    text: t.ergonomicQuotes[index],
  }));
}
