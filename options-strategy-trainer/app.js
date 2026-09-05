const THEME_KEY = "ost-theme";
const DEFAULT_THEME = "dark";

function safeGetTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function safeSaveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Local files can still work when browser storage is unavailable.
  }
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  const isDark = nextTheme === "dark";
  const toggle = document.querySelector("#theme-toggle");
  const label = document.querySelector("#theme-toggle-label");
  const themeColor = document.querySelector("#theme-color");

  document.documentElement.dataset.theme = nextTheme;
  if (toggle) {
    toggle.setAttribute("aria-label", isDark ? "当前为黑夜模式，点击切换到白天模式" : "当前为白天模式，点击切换到黑夜模式");
    toggle.setAttribute("aria-pressed", String(isDark));
  }
  if (label) label.textContent = isDark ? "黑夜" : "白天";
  if (themeColor) themeColor.setAttribute("content", isDark ? "#10171b" : "#f5f7f8");
}

function toggleTheme() {
  const currentTheme = document.documentElement.dataset.theme || safeGetTheme();
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  safeSaveTheme(nextTheme);
}

const strategies = {
  longCall: {
    name: "买入看涨期权",
    english: "Long Call",
    structure: "买入 ATM 或略 OTM 的 Call。",
    profit: "赚标的快速上涨的钱；IV 上升时，期权变贵也可能帮你赚钱。",
    loss: "亏权利金和时间损耗；标的不涨、涨太慢，或 IV 回落都会拖后腿。",
    why: "适合强看涨且 IV 偏低时，用有限权利金换取向上凸性。",
    avoid: "IV 已经很高、只小幅看涨，或时间不站在你这边时，不适合裸买 Call。",
    greeks: { Delta: "+", Gamma: "+", Theta: "-", Vega: "+" },
    risk: "有限风险 (Defined risk)",
    notes: ["最大亏损是权利金。", "需要方向和时间都配合。", "低 IV 环境更友好。"],
    payoff: "M18 62 L56 62 L92 24"
  },
  bullCallSpread: {
    name: "牛市看涨价差",
    english: "Bull Call Debit Spread",
    structure: "买入较低执行价 Call（ATM/略 ITM）+ 卖出较高执行价 OTM Call。",
    profit: "赚价格向目标价上涨的钱；卖出的上方 Call 帮你少付一部分权利金。",
    loss: "亏净支出的权利金；涨不够或涨太慢会被时间损耗吃掉，上方收益也被封顶。",
    why: "适合看涨但不想为高 IV 付太多权利金，用卖出上方 Call 降低成本。",
    avoid: "如果你预期会大幅突破上方行权价，价差会限制最大收益。",
    greeks: { Delta: "+", Gamma: "+/0", Theta: "-/0", Vega: "+/0" },
    risk: "有限风险 (Defined risk)",
    notes: ["上涨空间被封顶。", "比单买 Call 更抗 IV 回落。", "适合有明确目标价。"],
    payoff: "M18 62 L44 62 L76 30 L96 30"
  },
  bullPutSpread: {
    name: "牛市认沽信用价差",
    english: "Bull Put Credit Spread",
    structure: "卖出较高执行价 OTM Put + 买入更低执行价 OTM Put；这是两条 Put 腿，不用 Call。",
    profit: "赚卖出 Put 收到的权利金，主要来自时间流逝和 IV 回落。",
    loss: "亏价格跌破卖出 Put 后的价差风险；急跌会让短 Gamma 变得很难受。",
    why: "适合温和看涨或不看跌，尤其在 IV 偏高时用时间价值换取胜率。",
    avoid: "如果你认为标的可能快速跌破卖出 Put，信用价差会很难管理。",
    greeks: { Delta: "+", Gamma: "-", Theta: "+", Vega: "-" },
    risk: "有限风险 (Defined risk)",
    notes: ["最大亏损由价差宽度减去权利金决定。", "更像是在卖一个不会跌破的观点。", "高 IV 时权利金更充足。"],
    payoff: "M18 28 L42 58 L96 58"
  },
  cashSecuredPut: {
    name: "现金担保卖出认沽",
    english: "Cash-Secured Put",
    structure: "卖出 OTM Put，并预留足够现金准备被指派接货。",
    profit: "赚卖 Put 的权利金和时间价值；如果接货后反弹，也赚正股回升的钱。",
    loss: "亏标的跌破接货价后的正股风险；收到的权利金只能缓冲一部分下跌。",
    why: "适合看涨或愿意更低价格买入正股，IV 偏高时能收取更厚权利金。",
    avoid: "如果你不愿意接货，或标的基本面可能快速恶化，不该用这个结构。",
    greeks: { Delta: "+", Gamma: "-", Theta: "+", Vega: "-" },
    risk: "接货风险 (Assignment risk)",
    notes: ["需要预留足够现金。", "下跌时可能以行权价买入股票。", "更适合你本来就想拥有的标的。"],
    payoff: "M18 25 L48 58 L96 58"
  },
  longPut: {
    name: "买入看跌期权",
    english: "Long Put",
    structure: "买入 ATM 或略 OTM 的 Put。",
    profit: "赚标的快速下跌的钱；IV 上升时，Put 变贵也可能帮你赚钱。",
    loss: "亏权利金和时间损耗；不跌、跌太慢，或 IV 回落都会伤害这笔交易。",
    why: "适合强看跌且 IV 偏低时，用有限权利金表达下跌观点。",
    avoid: "IV 高或只是温和看跌时，权利金成本可能吞掉判断优势。",
    greeks: { Delta: "-", Gamma: "+", Theta: "-", Vega: "+" },
    risk: "有限风险 (Defined risk)",
    notes: ["最大亏损是权利金。", "方向、速度和时间都重要。", "也可作为短期保护。"],
    payoff: "M18 24 L54 62 L94 62"
  },
  bearPutSpread: {
    name: "熊市看跌价差",
    english: "Bear Put Debit Spread",
    structure: "买入较高执行价 Put（ATM/略 ITM）+ 卖出较低执行价 OTM Put。",
    profit: "赚价格下跌到目标区间的钱；卖出的下方 Put 帮你降低成本。",
    loss: "亏净支出的权利金；跌不够或跌太慢会输给时间，暴跌收益也被封顶。",
    why: "适合看跌但希望控制成本，卖出更低行权价 Put 抵消一部分 IV 和时间成本。",
    avoid: "如果你预期会暴跌，价差会限制下方收益。",
    greeks: { Delta: "-", Gamma: "+/0", Theta: "-/0", Vega: "+/0" },
    risk: "有限风险 (Defined risk)",
    notes: ["收益和亏损都被限定。", "适合有明确下跌目标。", "比单买 Put 更抗高 IV。"],
    payoff: "M18 30 L46 30 L78 62 L96 62"
  },
  bearCallSpread: {
    name: "熊市看涨信用价差",
    english: "Bear Call Credit Spread",
    structure: "卖出较低执行价 OTM Call + 买入更高执行价 OTM Call。",
    profit: "赚卖出 Call 收到的权利金，来自时间流逝、IV 回落，以及价格留在卖出 Call 下方。",
    loss: "亏价格突破卖出 Call 后的上方价差风险；急涨会让短 Gamma 变得很痛。",
    why: "适合温和看跌或不看涨，IV 偏高时通过卖出上方 Call 收取权利金。",
    avoid: "如果标的可能快速突破卖出 Call，亏损会放大到价差上限。",
    greeks: { Delta: "-", Gamma: "-", Theta: "+", Vega: "-" },
    risk: "有限风险 (Defined risk)",
    notes: ["最大亏损由价差宽度减去权利金决定。", "更适合阻力位清晰的场景。", "需要提前设置止损或调整规则。"],
    payoff: "M18 58 L70 58 L96 28"
  },
  protectivePut: {
    name: "保护性认沽",
    english: "Protective Put",
    structure: "持有正股 + 买入 ATM 或 OTM Put 做下方保护。",
    profit: "主要不是为了赚期权钱，而是下跌时用 Put 对冲正股亏损；正股继续涨时仍赚正股上涨。",
    loss: "亏保险费和时间损耗；如果没跌，Put 可能慢慢归零。",
    why: "适合已有正股但担心下跌，用 Put 给仓位加一个明确的下方保护。",
    avoid: "如果 IV 很高且只是轻微担心，保险费可能过贵。",
    greeks: { Delta: "+/0", Gamma: "+", Theta: "-", Vega: "+" },
    risk: "保险成本 (Premium risk)",
    notes: ["保护越近，成本越高。", "不改变你持有正股的上行空间。", "适合事件前或趋势破位前。"],
    payoff: "M18 58 L38 58 L92 24"
  },
  collar: {
    name: "领口策略",
    english: "Collar",
    structure: "持有正股 + 买入 OTM Put + 卖出 OTM Call。",
    profit: "赚正股在保护区间内上涨的钱；卖 Call 的权利金用来抵消 Put 保险费。",
    loss: "亏保险净成本和正股下跌的剩余风险；大涨时，上方收益会被卖出的 Call 封住。",
    why: "适合已有正股、想保护下跌，同时愿意卖出上方收益来降低保险成本。",
    avoid: "如果你不愿意牺牲大涨空间，就不适合卖出上方 Call。",
    greeks: { Delta: "+/0", Gamma: "0", Theta: "+/0", Vega: "-/0" },
    risk: "有限区间 (Capped range)",
    notes: ["下方有保护，上方收益被封顶。", "常用于保护已有利润。", "Call 收入可抵消 Put 成本。"],
    payoff: "M18 56 L40 56 L78 30 L96 30"
  },
  coveredCall: {
    name: "备兑看涨",
    english: "Covered Call",
    structure: "持有正股 + 卖出 OTM Call。",
    profit: "赚正股小涨或横盘的钱，再加上卖 Call 收到的权利金和时间价值。",
    loss: "亏正股下跌的钱；大涨时，超过行权价的收益让给买 Call 的人。",
    why: "适合已有正股、温和看涨或横盘，用卖出 Call 增加收入。",
    avoid: "如果你不愿意在行权价卖出股票，或预期会急涨，不适合备兑。",
    greeks: { Delta: "+", Gamma: "-", Theta: "+", Vega: "-" },
    risk: "上行封顶 (Capped upside)",
    notes: ["需要持有正股。", "收取权利金但牺牲部分上行。", "IV 高时收入更好。"],
    payoff: "M18 62 L72 30 L96 30"
  },
  ironCondor: {
    name: "铁鹰",
    english: "Iron Condor",
    structure: "卖出 OTM Put + 买入更低 OTM Put，同时卖出 OTM Call + 买入更高 OTM Call。",
    profit: "赚上下两侧卖出期权的权利金，主要来自时间流逝和 IV 回落。",
    loss: "亏价格突破区间后的单侧价差风险；大波动和 IV 上升都不利。",
    why: "适合中性观点且 IV 偏高，卖出上下两侧区间来收取时间价值。",
    avoid: "如果你预期会出现单边大波动，铁鹰容易被突破。",
    greeks: { Delta: "0", Gamma: "-", Theta: "+", Vega: "-" },
    risk: "有限风险 (Defined risk)",
    notes: ["核心是判断价格会留在区间内。", "风险有限但需要管理突破。", "高 IV 收入更有吸引力。"],
    payoff: "M18 28 L36 58 L76 58 L94 28"
  },
  calendar: {
    name: "日历价差",
    english: "Calendar Spread",
    structure: "同一执行价附近，买入远月 Call/Put + 卖出近月同方向 Call/Put，常放在 ATM 附近。",
    profit: "赚近月期权更快衰减的钱，也可能赚远月 Vega；价格停在中心附近最舒服。",
    loss: "亏价格离开中心太远的钱；期限结构变化或远月 IV 下跌也会伤害远月腿。",
    why: "适合中性或温和方向、近月 IV 较高而远月相对合理时，利用时间结构。",
    avoid: "如果价格可能迅速远离中心行权价，日历价差会失去优势。",
    greeks: { Delta: "0/+", Gamma: "-", Theta: "+", Vega: "+" },
    risk: "有限风险 (Defined risk)",
    notes: ["更依赖价格停留在附近。", "受期限结构影响明显。", "需要关注近月到期后的处理。"],
    payoff: "M18 62 C38 28 72 28 94 62"
  },
  longStraddle: {
    name: "买入跨式",
    english: "Long Straddle",
    structure: "买入 ATM Call + 买入 ATM Put。",
    profit: "赚大波动的钱，不管向上还是向下；IV 上升也有利。",
    loss: "亏双边权利金和时间损耗；如果价格不动，两边期权都会慢慢缩水。",
    why: "适合 IV 偏低但预期会出现大波动，方向不确定也可以表达波动观点。",
    avoid: "如果 IV 已经很高或预期只是小幅震荡，时间损耗会很重。",
    greeks: { Delta: "0", Gamma: "+", Theta: "-", Vega: "+" },
    risk: "有限风险 (Defined risk)",
    notes: ["需要足够大的波动来覆盖权利金。", "方向不重要，幅度很重要。", "事件后 IV 回落是主要风险。"],
    payoff: "M18 24 L56 62 L94 24"
  }
};

const labels = {
  direction: {
    bullish: "看涨 (Bullish)",
    bearish: "看跌 (Bearish)",
    neutral: "中性 (Neutral)"
  },
  iv: {
    low: "低 IV (Low IV)",
    normal: "正常 IV (Normal IV)",
    high: "高 IV (High IV)"
  },
  objective: {
    directional: "方向交易 (Directional)",
    income: "收取权利金 (Income)",
    own: "愿意接货 (Willing to own stock)",
    hedge: "保护持仓 (Hedge)"
  }
};

const state = {
  direction: "",
  iv: "",
  objective: ""
};

const libraryOrder = [
  "longCall",
  "bullCallSpread",
  "bullPutSpread",
  "cashSecuredPut",
  "longPut",
  "bearPutSpread",
  "bearCallSpread",
  "protectivePut",
  "collar",
  "coveredCall",
  "ironCondor",
  "calendar",
  "longStraddle"
];

const cases = [
  {
    title: "看涨，但 IV Rank 已经 72",
    prompt: "你认为未来一个月小涨到目标价附近，不需要大涨。",
    answer: "bullCallSpread",
    options: ["longCall", "bullCallSpread", "cashSecuredPut"],
    reason: "高 IV 下单买 Call 成本高；价差能保留方向，同时卖出一部分贵的波动率。"
  },
  {
    title: "愿意更低价格买入正股",
    prompt: "你喜欢这家公司，但只想在当前价格下方接货。",
    answer: "cashSecuredPut",
    options: ["cashSecuredPut", "longCall", "ironCondor"],
    reason: "目标不是追涨，而是用卖 Put 把接货价和权利金放在一起考虑。"
  },
  {
    title: "看跌但不想支付太贵保护费",
    prompt: "IV 偏高，观点是跌到某个支撑位附近，不是崩盘。",
    answer: "bearPutSpread",
    options: ["longPut", "bearPutSpread", "bearCallSpread"],
    reason: "熊市 Put 价差限制收益，但能显著降低高 IV 下的成本。"
  },
  {
    title: "横盘，高 IV，想收时间价值",
    prompt: "你认为价格大概率留在一个清晰区间里。",
    answer: "ironCondor",
    options: ["ironCondor", "longStraddle", "protectivePut"],
    reason: "中性 + 高 IV 更适合短波动结构；关键风险是区间被突破。"
  },
  {
    title: "已有正股，担心财报下跌",
    prompt: "你想保住仓位，但短期事件风险很高。",
    answer: "protectivePut",
    options: ["coveredCall", "protectivePut", "bullPutSpread"],
    reason: "保护性 Put 是直接买保险；如果愿意牺牲上方空间，再考虑 Collar。"
  },
  {
    title: "低 IV，中性，但预计会大波动",
    prompt: "方向不确定，核心判断是波动可能被低估。",
    answer: "longStraddle",
    options: ["longStraddle", "ironCondor", "calendar"],
    reason: "低 IV + 大波动预期是 Long Vol 的场景，买入跨式更贴近这个观点。"
  }
];

function recommend({ direction, iv, objective }) {
  if (objective === "hedge") {
    if (iv === "high") return pick("collar", ["protectivePut", "coveredCall"]);
    return pick("protectivePut", ["collar", direction === "bearish" ? "bearPutSpread" : "coveredCall"]);
  }

  if (objective === "own") {
    if (direction === "bearish") return pick("bearPutSpread", ["longPut", "protectivePut"]);
    if (iv === "low") return pick("cashSecuredPut", ["bullCallSpread", "longCall"]);
    return pick("cashSecuredPut", ["bullPutSpread", "coveredCall"]);
  }

  if (direction === "bullish") {
    if (objective === "income") {
      return iv === "low"
        ? pick("coveredCall", ["bullCallSpread", "cashSecuredPut"])
        : pick("bullPutSpread", ["cashSecuredPut", "coveredCall"]);
    }
    if (iv === "low") return pick("longCall", ["bullCallSpread", "cashSecuredPut"]);
    if (iv === "normal") return pick("bullCallSpread", ["longCall", "bullPutSpread"]);
    return pick("bullCallSpread", ["bullPutSpread", "cashSecuredPut"]);
  }

  if (direction === "bearish") {
    if (objective === "income") {
      return iv === "high"
        ? pick("bearCallSpread", ["bearPutSpread", "ironCondor"])
        : pick("bearCallSpread", ["bearPutSpread", "longPut"]);
    }
    if (iv === "low") return pick("longPut", ["bearPutSpread", "bearCallSpread"]);
    if (iv === "normal") return pick("bearPutSpread", ["longPut", "bearCallSpread"]);
    return pick("bearPutSpread", ["bearCallSpread", "longPut"]);
  }

  if (direction === "neutral") {
    if (objective === "directional") {
      return iv === "low"
        ? pick("calendar", ["longStraddle", "ironCondor"])
        : pick("calendar", ["ironCondor", "coveredCall"]);
    }
    if (iv === "low") return pick("longStraddle", ["calendar", "ironCondor"]);
    if (iv === "normal") return pick("calendar", ["ironCondor", "coveredCall"]);
    return pick("ironCondor", ["calendar", "coveredCall"]);
  }

  return pick("bullCallSpread", ["bullPutSpread", "cashSecuredPut"]);
}

function pick(main, alternatives) {
  return { main, alternatives: alternatives.slice(0, 2) };
}

function strategyCard(key, options = {}) {
  const strategy = strategies[key];
  const tagClass = options.compact ? "tag-row compact-tags" : "tag-row";
  return `
    <div class="strategy-name">
      <strong>${strategy.name}</strong>
      <span>${strategy.english}</span>
    </div>
    <div class="field-block structure-block">
      <h3>结构 (Legs)</h3>
      <p>${strategy.structure}</p>
    </div>
    <div class="money-grid">
      <div class="money-block earn-block">
        <h3>赚哪部分钱</h3>
        <p>${strategy.profit}</p>
      </div>
      <div class="money-block lose-block">
        <h3>亏哪部分钱</h3>
        <p>${strategy.loss}</p>
      </div>
    </div>
    <div class="field-block">
      <h3>Why</h3>
      <p>${strategy.why}</p>
    </div>
    <div class="field-block">
      <h3>When not to use</h3>
      <p>${strategy.avoid}</p>
    </div>
    <div class="${tagClass}">
      ${greekTags(strategy.greeks)}
      <span class="tag risk">${strategy.risk}</span>
    </div>
    <div class="strategy-details">
      <details>
        <summary>展开细节</summary>
        <div class="detail-grid">
          ${payoffSvg(strategy)}
          <ul class="notes">
            ${strategy.notes.map((note) => `<li>${note}</li>`).join("")}
          </ul>
        </div>
      </details>
    </div>
  `;
}

function greekTags(greeks) {
  return Object.entries(greeks)
    .map(([name, value]) => `<span class="tag ${name.toLowerCase()}">${name} ${value}</span>`)
    .join("");
}

function payoffSvg(strategy) {
  return `
    <svg class="payoff" viewBox="0 0 112 86" aria-label="${strategy.name} 到期损益示意">
      <line class="axis" x1="14" y1="62" x2="100" y2="62" />
      <line class="axis" x1="18" y1="16" x2="18" y2="72" />
      <path class="curve" d="${strategy.payoff}" />
    </svg>
  `;
}

function renderRecommendation() {
  if (!state.direction || !state.iv || !state.objective) return;

  const result = recommend(state);
  const context = `${labels.direction[state.direction]} / ${labels.iv[state.iv]} / ${labels.objective[state.objective]}`;

  document.querySelector("#result-context").textContent = context;
  document.querySelector("#main-result").innerHTML = strategyCard(result.main);
  document.querySelector("#alternatives").innerHTML = `
    <p class="kicker">Alternatives</p>
    ${result.alternatives
      .map(
        (key) => `
          <article class="alt-item">
            ${strategyCard(key, { compact: true })}
          </article>
        `
      )
      .join("")}
  `;

  document.querySelector("#result-empty").classList.add("is-hidden");
  document.querySelector("#result").classList.remove("is-hidden");
}

function unlockStep(field) {
  const step = document.querySelector(`[data-step="${field}"]`);
  if (!step) return;
  step.classList.remove("is-muted");
  step.querySelectorAll("button").forEach((button) => {
    button.disabled = false;
  });
}

function lockStep(field) {
  const step = document.querySelector(`[data-step="${field}"]`);
  if (!step) return;
  step.classList.add("is-muted");
  step.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
    button.classList.remove("is-selected");
  });
}

function selectChoice(button) {
  const field = button.dataset.field;
  const value = button.dataset.value;
  state[field] = value;

  document
    .querySelectorAll(`[data-field="${field}"]`)
    .forEach((item) => item.classList.toggle("is-selected", item === button));

  if (field === "direction") {
    state.iv = "";
    state.objective = "";
    unlockStep("iv");
    lockStep("objective");
    hideResult();
  }

  if (field === "iv") {
    state.objective = "";
    unlockStep("objective");
    hideResult();
  }

  if (field === "objective") {
    renderRecommendation();
  }
}

function hideResult() {
  document.querySelector("#result").classList.add("is-hidden");
  document.querySelector("#result-empty").classList.remove("is-hidden");
}

function resetGuide() {
  state.direction = "";
  state.iv = "";
  state.objective = "";
  document.querySelectorAll(".choice").forEach((button) => {
    button.classList.remove("is-selected");
  });
  lockStep("iv");
  lockStep("objective");
  hideResult();
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-active", view.id === viewId);
  });
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.view === viewId);
  });
  window.location.hash = viewId;
}

function renderLibrary() {
  document.querySelector("#library-grid").innerHTML = libraryOrder
    .map((key) => {
      const item = strategies[key];
      return `
        <article class="library-card">
          <h2>${item.name}</h2>
          <p>${item.english}</p>
          <p class="structure-line">${item.structure}</p>
          <div class="library-money">
            <p><strong>赚：</strong>${item.profit}</p>
            <p><strong>亏：</strong>${item.loss}</p>
          </div>
          <p>${item.why}</p>
          <div class="library-meta">
            ${greekTags(item.greeks)}
            <span class="tag risk">${item.risk}</span>
          </div>
          <details>
            <summary>查看使用边界</summary>
            <p>${item.avoid}</p>
          </details>
        </article>
      `;
    })
    .join("");
}

function renderCases() {
  document.querySelector("#case-list").innerHTML = cases
    .map(
      (item, index) => `
        <article class="case-card" data-case="${index}">
          <div>
            <h2>${item.title}</h2>
            <p>${item.prompt}</p>
            <div class="case-options">
              ${item.options
                .map(
                  (key) => `
                    <button class="case-option" type="button" data-answer="${key}">
                      ${strategies[key].name}
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
          <aside class="case-answer" aria-live="polite">
            <strong>选择一个策略</strong>
            <span>答案会显示在这里。</span>
          </aside>
        </article>
      `
    )
    .join("");
}

function answerCase(button) {
  const card = button.closest(".case-card");
  const item = cases[Number(card.dataset.case)];
  const selected = button.dataset.answer;
  const isRight = selected === item.answer;

  card.querySelectorAll(".case-option").forEach((option) => {
    option.classList.remove("is-right", "is-wrong");
    if (option.dataset.answer === item.answer) option.classList.add("is-right");
  });

  if (!isRight) button.classList.add("is-wrong");

  card.querySelector(".case-answer").innerHTML = `
    <strong>${isRight ? "判断正确" : "更优答案"}：${strategies[item.answer].name}</strong>
    <span>${item.reason}</span>
  `;
}

document.addEventListener("click", (event) => {
  const themeToggle = event.target.closest("#theme-toggle");
  if (themeToggle) toggleTheme();

  const choice = event.target.closest(".choice");
  if (choice && !choice.disabled) selectChoice(choice);

  const tab = event.target.closest(".tab");
  if (tab) switchView(tab.dataset.view);

  const caseOption = event.target.closest(".case-option");
  if (caseOption) answerCase(caseOption);
});

applyTheme(safeGetTheme());

document.querySelector("#reset-button").addEventListener("click", resetGuide);

renderLibrary();
renderCases();

const startingView = window.location.hash.replace("#", "");
if (["guide", "library", "cases"].includes(startingView)) {
  switchView(startingView);
}
