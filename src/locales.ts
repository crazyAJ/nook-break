export interface LocaleData {
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

  // quote islanders
  isabelle: string;
  redd: string;
  cj: string;
  flick: string;
  nook: string;
  leif: string;
  brewster: string;
}

export const locales: Record<"zh" | "en" | "ja" | "ko" | "tc", LocaleData> = {
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

    isabelle: "여울",
    redd: "여욱",
    cj: "저스틴",
    flick: "레온",
    nook: "너굴",
    leif: "늘봉이",
    brewster: "마스터",
  }
};

export const ERGONOMIC_QUOTES = (lang: "zh" | "en" | "ja" | "ko" | "tc") => {
  const originalLang = lang;
  const activeLang = lang === "tc" ? "tc" : lang;
  const char = locales[activeLang];
  // temporary map for the raw translation checks inside the array literal
  lang = (lang === "tc" ? "zh" : lang) as any;
  const rawList = [
    { text: lang === "zh" ? "工作虽然重要，但如果累垮了，狸克社长也会苦恼的哦！多眨眼、喝口水吧！" : lang === "ja" ? "仕事も大事ですけど、無理をして倒れたらたぬきち社長も心配しちゃいますよ！しっかり瞬きして、お水を飲んでくださいね！" : lang === "ko" ? "일도 중요하지만 무리해서 쓰러지면 너굴 사장님도 걱정하실 거예요! 눈을 잘 깜빡이고 물을 꼭 챙겨 드세요!" : "Work is crucial, but Tom Nook would be so worried if you push too hard! Blink twice and keep hydrated!", author: char.isabelle },
    { text: lang === "zh" ? "嗯哼！完美的艺术灵感源自于松弛的眼力。起来走两步，看看这幅完美的风景画。" : lang === "ja" ? "うふふ！完璧な芸術のひらめきは、リラックスした目元から生まれるものです。立ち上がって、この素晴らしい風景画を楽しんでください。" : lang === "ko" ? "우후후! 완벽한 예술적 영감은 편안한 눈에서 나오는 법이에요. 일어나서 이 아름다운 풍경을 감상해 보세요." : "Heheh! Exquisite artistic focus requires crisp, relaxed sights. Stretch your legs and appreciate natural landscapes!", author: char.redd },
    { text: lang === "zh" ? "想要钓起深海的旷世奇珍，眼睛必须要时刻锐利。休息五分钟，等会必定大丰收！" : lang === "ja" ? "深海の珍しい魚を釣り上げるには、常に研ぎ澄まされた視線が必要です。5分だけ休めば、大漁間違いなしです！" : lang === "ko" ? "심해의 귀한 물고기를 낚으려면 항상 날카로운 시선이 필요해요. 5분만 쉬어가면 대어가 찾아올 거예요!" : "Catching deep-sea grand fins means keeping your sight sharp as a needle. Break 5 minutes for massive reports!", author: char.cj },
    { text: lang === "zh" ? "嘿！别让那个闪光的发热盒子吞噬了你的神识。和昆虫一样，顺应天光树影休息一下吧！" : lang === "ja" ? "おい！その光る画面に魂を吸い込まれるな。虫たちのように、島の木漏れ日を感じて少し休めよ！" : lang === "ko" ? "야! 그 빛나는 화면에 영혼을 뺏기지 마. 곤충들처럼 섬의 햇살을 느끼며 잠시 쉬어가라고!" : "Hey! Don't let that shiny glowing device take over your soul. Be like insects: feel the island twilight and rest!", author: char.flick },
    { text: lang === "zh" ? "每隔一小时花时间松弛关节，不仅保护视力，还能节省好多医疗买药铃钱，超划算的交易！" : lang === "ja" ? "1時間おきに関節をほぐす時間は、目を守るだけでなく、おくすり代のベルも節約できる、とてもお得な取引だなも！" : lang === "ko" ? "1시간마다 관절을 풀어주는 시간은 눈을 보호할 뿐 아니라 약값 벨도 아낄 수 있는 아주 실속 있는 거래구리!" : "Resting every hour keeps you fit and saves thousands of medicine bells. Yes, a highly profitable venture!", author: char.nook },
    { text: lang === "zh" ? "给眼睛放个小假，看看绿色！虽然除草稍微辛苦，但盯着嫩黄绿叶放松眼睛超棒的！" : lang === "ja" ? "目にちいさな休みをあげて、緑を見ましょう！草むしりは大変ですけど、可愛い葉っぱを眺めると目が休まりますよ！" : lang === "ko" ? "눈에 작은 휴식을 주고 초록색을 보세요! 잡초 뽑기는 고되지만 푸릇푸릇한 잎사귀들을 보면 눈이 편안해져요!" : "Treat your eyes to cute green! Observing standard island foliage relaxes retina strain perfectly!", author: char.leif },
    { text: lang === "zh" ? "哼……我为你冲好了一杯极品手冲。放慢动作，现在跟随我深呼吸：吸气——呼气——" : lang === "ja" ? "コト…極上のブレンドを淹れました。少し力を抜いて、私と一緒に深呼吸を…吸って…吐いて…" : lang === "ko" ? "탁… 극상 블렌드 커피를 내렸습니다. 잠시 힘을 빼고 저와 함께 심호흡을… 들이쉬고… 내쉬고…" : "Coo... I've brewed you premium hand-pressed coffee. Gently slow down and follow me: breathe in, breathe out...", author: char.brewster },
  ];

  if (originalLang === "tc") {
    const zhToTcMap: Record<string, string> = {
      "工作虽然重要，但如果累垮了，狸克社长也会苦恼的哦！多眨眼、喝口水吧！": "工作雖然重要，但如果累垮了，狸克社長也會苦惱的哦！多眨眼、喝口水吧！",
      "嗯哼！完美的艺术灵感源自于松弛的眼力。起来走两步，看看这幅完美的风景画。": "嗯哼！完美的藝術靈感源自於鬆弛的眼力．起來走兩步，看看這幅完美的風景畫。",
      "想要钓起深海的旷世奇珍，眼睛必须要时刻锐利。休息五分钟，等会必定大丰收！": "想要釣起深海的曠世奇珍，眼睛必須要時刻銳利。休息五分鐘，等會必定大豐收！",
      "嘿！别让那个闪光的发热盒子吞噬了你的神识。和昆虫一样，顺应天光树影休息一下吧！": "嘿！別讓那個閃光的發熱盒子吞噬了你的神識。和昆蟲一樣，順應天光樹影休息一下吧！",
      "每隔一小时花时间松弛关节，不仅保护视力，还能节省好多医疗买药铃钱，超划算的交易！": "每隔一小時花時間鬆弛關節，不僅保護視力，還能節省好多醫療買藥鈴錢，超劃算的交易！",
      "给眼睛放个小假，看看绿色！虽然除草稍微辛苦，但盯着嫩黄绿叶放松眼睛超棒的！": "給眼睛放個小假，看看綠色！雖然除草稍微辛苦，但盯著嫩黃綠葉放鬆眼睛超棒的！",
      "哼……我为你冲好了一杯极品手冲。放慢动作，现在跟随我深呼吸：吸气——呼气——": "哼……我為你沖好了一杯極品手沖。放慢動作，現在跟隨我深呼吸：吸氣——呼氣——"
    };
    return rawList.map(item => ({
      ...item,
      text: zhToTcMap[item.text] || item.text
    }));
  }

  return rawList;
};
