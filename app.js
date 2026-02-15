// =========================
// 자기효능감 진단(초5) - GitHub Pages + Google Sheets 저장
// =========================

// ====== 0) 여기만 너 값으로 바꾸면 됨 ======
const SHEETS_ENDPOINT = "https://script.google.com/macros/s/AKfycbxc4S_FK-QAr9Gh6ZMy0bjeGrdy_29COhxH_HNJHp3IAn8M_EyXSsxHLkXE4epYStXCzw/exec"; // 예: https://script.google.com/macros/s/XXXX/exec
const SHEETS_TOKEN = "wkrlgysmdrka0215"; // Code.gs의 WRITE_TOKEN과 동일해야 함
// =========================

// ====== 1) 고정: 척도 ======
const SCALE = [
  { score: 1, emoji: "😟", label: "전혀 아니에요" },
  { score: 2, emoji: "🙁", label: "아니에요" },
  { score: 3, emoji: "😐", label: "보통이에요" },
  { score: 4, emoji: "🙂", label: "그래요" },
  { score: 5, emoji: "😄", label: "매우 그래요" },
];

// ====== 2) 고정: 도메인/문항 (사용자 제공 그대로) ======
const DOMAINS = [
  { key: "시작/도전", desc: "새로운 일도 한 번 해보려고 마음을 내는 힘" },
  { key: "노력/지속", desc: "어렵더라도 조금씩 계속 해보는 힘" },
  { key: "전략/문제해결", desc: "방법을 바꿔 보며 해결책을 찾는 힘" },
  { key: "도움요청/정서조절", desc: "마음을 가라앉히고 필요한 도움을 말로 부탁하는 힘" },
];

const ITEMS = [
  // 시작/도전
  { id:"S1", domain:"시작/도전", text:"새로운 활동이더라도 한 번 해보려고 해요.", reverse:false, weight:1, intent:"시작 의지" },
  { id:"S2", domain:"시작/도전", text:"처음 해보는 일도 “일단 시작”을 할 수 있어요.", reverse:false, weight:1, intent:"시작 행동" },
  { id:"S3", domain:"시작/도전", text:"잘 못할까 봐 아예 시작을 미룰 때가 많아요.", reverse:true, weight:1, intent:"회피 경향" },
  { id:"S4", domain:"시작/도전", text:"일단 마음 먹었으면 어려워 보여도 도전해보려 해요.", reverse:false, weight:1, intent:"도전 동기" },
  { id:"S5", domain:"시작/도전", text:"시작하기 전에 걱정이 커져서 손이 잘 안 가요.", reverse:true, weight:1, intent:"걱정으로 멈춤" },
  { id:"S6", domain:"시작/도전", text:"“해보자!”라고 스스로 말하고 움직일 때가 있어요.", reverse:false, weight:1, intent:"자기 격려" },

  // 노력/지속
  { id:"P1", domain:"노력/지속", text:"하다가 힘들어도 조금 더 해보려고 해요.", reverse:false, weight:1, intent:"지속 의지" },
  { id:"P2", domain:"노력/지속", text:"매일 조금씩이라도 꾸준히 하려 해요.", reverse:false, weight:1, intent:"꾸준함" },
  { id:"P3", domain:"노력/지속", text:"한 번 틀리면 바로 그만하고 싶어져요.", reverse:true, weight:1, intent:"실패 후 중단" },
  { id:"P4", domain:"노력/지속", text:"목표가 있으면 끝까지 해내고 싶어요.", reverse:false, weight:1, intent:"완수 지향" },
  { id:"P5", domain:"노력/지속", text:"잘 안 되면 “난 원래 못해”라고 생각해요.", reverse:true, weight:1, intent:"능력 고정 해석" },
  { id:"P6", domain:"노력/지속", text:"조금씩 좋아지는 걸 보면 더 해볼 힘이 나요.", reverse:false, weight:1, intent:"성장 신호 포착" },

  // 전략/문제해결
  { id:"T1", domain:"전략/문제해결", text:"안 되면 다른 방법을 찾아서 해봐요.", reverse:false, weight:1, intent:"전략 전환" },
  { id:"T2", domain:"전략/문제해결", text:"어떻게 하면 문제가 해결될지 순서를 생각해볼 수 있어요.", reverse:false, weight:1, intent:"계획/절차" },
  { id:"T3", domain:"전략/문제해결", text:"문제를 풀다 막히더라도 같은 방법만 계속 반복해요.", reverse:true, weight:1, intent:"고착" },
  { id:"T4", domain:"전략/문제해결", text:"필요한 정보가 있으면 찾아보거나 물어보며 해결해요.", reverse:false, weight:1, intent:"정보 활용" },
  { id:"T5", domain:"전략/문제해결", text:"어려운 문제를 보면 머릿속이 하얘져요.", reverse:true, weight:1, intent:"인지 마비" },
  { id:"T6", domain:"전략/문제해결", text:"작은 힌트를 얻으면 다시 시도할 수 있어요.", reverse:false, weight:1, intent:"힌트 기반 재시도" },

  // 도움요청/정서조절
  { id:"H1", domain:"도움요청/정서조절", text:"혼자 안 되면 도움을 부탁할 수 있어요.", reverse:false, weight:1, intent:"도움요청" },
  { id:"H2", domain:"도움요청/정서조절", text:"답답할 때는 잠깐 쉬고 다시 시작해요.", reverse:false, weight:1, intent:"감정 조절" },
  { id:"H3", domain:"도움요청/정서조절", text:"모르면 물어보는 게 창피하다고 느껴요.", reverse:true, weight:1, intent:"도움요청 회피" },
  { id:"H4", domain:"도움요청/정서조절", text:"내 기분을 말로 설명할 수 있어요.", reverse:false, weight:1, intent:"감정 언어화" },
  { id:"H5", domain:"도움요청/정서조절", text:"속상하면 말이 안 나오고 그냥 참고 있어요.", reverse:true, weight:1, intent:"억눌림" },
  { id:"H6", domain:"도움요청/정서조절", text:"“어떤 도움이 필요해요”라고 구체적으로 말할 수 있어요.", reverse:false, weight:1, intent:"구체적 요청" },
];

// ====== 3) DOM 연결 ======
const $screenStart  = document.getElementById("screen-start");
const $screenSurvey = document.getElementById("screen-survey");
const $screenResult = document.getElementById("screen-result");

const $studentName  = document.getElementById("studentName");
const $birthDate    = document.getElementById("birthDate");
const $phaseSelect  = document.getElementById("phaseSelect");

const $btnStart     = document.getElementById("btn-start");
const $btnExit      = document.getElementById("btn-exit");
const $btnPrev      = document.getElementById("btn-prev");
const $btnNext      = document.getElementById("btn-next");
const $btnRestart   = document.getElementById("btn-restart");

const $progressText = document.getElementById("progressText");
const $progressBar  = document.getElementById("progressBar");
const $domainPill   = document.getElementById("domainPill");
const $questionText = document.getElementById("questionText");
const $emojiGroup   = document.getElementById("emojiGroup");

const $summaryLine  = document.getElementById("summaryLine");
const $totalLine    = document.getElementById("totalLine");
const $missingLine  = document.getElementById("missingLine");
const $metaLine     = document.getElementById("metaLine");
const $domainTableWrap = document.getElementById("domainTableWrap");
const $strengthList = document.getElementById("strengthList");
const $growthList   = document.getElementById("growthList");
const $actionList   = document.getElementById("actionList");
const $helpSentenceList = document.getElementById("helpSentenceList");
const $adultNote    = document.getElementById("adultNote");
const $saveState    = document.getElementById("saveState");

// ====== 4) 상태 ======
let currentIndex = 0;
let answers = {}; // { [itemId]: 1~5 or null }
let didAutoSave = false;

// ====== 5) 유틸 ======
function showScreen(which){
  $screenStart.classList.add("hidden");
  $screenSurvey.classList.add("hidden");
  $screenResult.classList.add("hidden");
  if (which === "start")  $screenStart.classList.remove("hidden");
  if (which === "survey") $screenSurvey.classList.remove("hidden");
  if (which === "result") $screenResult.classList.remove("hidden");
}

function todayYMD(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function round1(n){
  return Math.round(n * 10) / 10;
}

function reverseScore(raw){
  return 6 - raw; // 1~5 -> 5~1
}

function clamp(n, min, max){
  return Math.max(min, Math.min(max, n));
}

function initAnswers(){
  answers = Object.fromEntries(ITEMS.map(it => [it.id, null]));
}

function getDomainDesc(domainKey){
  return (DOMAINS.find(d => d.key === domainKey)?.desc) || "";
}

// ====== 6) ✅ 이모지 렌더 (원래 CSS 구조: .face / .label + aria-checked) ======
function renderEmojiGroup(selectedScore){
  $emojiGroup.innerHTML = "";
  $emojiGroup.setAttribute("role", "radiogroup");

  SCALE.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "emoji";
    btn.dataset.score = String(opt.score);

    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-label", `${opt.emoji} ${opt.label} (${opt.score}점)`);

    const isSelected = selectedScore === opt.score;
    btn.setAttribute("aria-checked", isSelected ? "true" : "false");

    // 탭 이동: 선택된 것 우선, 없으면 첫 번째만 tabIndex 0
    btn.tabIndex = isSelected ? 0 : (selectedScore == null && idx === 0 ? 0 : -1);

    // ✅ 원래 CSS가 기대하는 구조
    btn.innerHTML = `
      <span class="face" aria-hidden="true">${opt.emoji}</span>
      <span class="label">${opt.label}(${opt.score})</span>
    `;

    btn.addEventListener("click", () => selectScore(opt.score));

    // 키보드: Enter/Space 선택, 방향키 이동
    btn.addEventListener("keydown", (e) => {
      const k = e.key;
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        selectScore(opt.score);
      } else if (k === "ArrowRight" || k === "ArrowDown") {
        e.preventDefault();
        focusEmojiByOffset(+1);
      } else if (k === "ArrowLeft" || k === "ArrowUp") {
        e.preventDefault();
        focusEmojiByOffset(-1);
      }
    });

    $emojiGroup.appendChild(btn);
  });
}

function setSelectedAria(score){
  const btns = Array.from($emojiGroup.querySelectorAll(".emoji"));
  btns.forEach((b) => {
    const s = Number(b.dataset.score);
    const sel = s === score;
    b.setAttribute("aria-checked", sel ? "true" : "false");
    b.tabIndex = sel ? 0 : -1;
  });
}

function focusEmojiByOffset(dir){
  const btns = Array.from($emojiGroup.querySelectorAll(".emoji"));
  const current = document.activeElement;
  const idx = btns.indexOf(current);
  const nextIdx = idx < 0 ? 0 : clamp(idx + dir, 0, btns.length - 1);
  btns[nextIdx]?.focus();
}

// ====== 7) 설문 렌더 ======
function renderQuestion(){
  const item = ITEMS[currentIndex];
  const answered = answers[item.id];

  $progressText.textContent = `${currentIndex + 1} / ${ITEMS.length}`;
  $progressBar.style.width = `${((currentIndex + 1) / ITEMS.length) * 100}%`;

  $domainPill.textContent = item.domain;   // "시작/도전" 등
  $questionText.textContent = item.text;

  renderEmojiGroup(answered);
}

function selectScore(score){
  const item = ITEMS[currentIndex];
  answers[item.id] = score;
  setSelectedAria(score);
  $btnNext.focus();
}

function goPrev(){
  if (currentIndex <= 0) return;
  currentIndex -= 1;
  renderQuestion();
  setTimeout(() => {
    const sel = answers[ITEMS[currentIndex].id];
    const btn = sel
      ? $emojiGroup.querySelector(`.emoji[data-score="${sel}"]`)
      : $emojiGroup.querySelector(".emoji");
    btn?.focus();
  }, 0);
}

function goNext(){
  const item = ITEMS[currentIndex];
  if (answers[item.id] == null) {
    alert("이 문항에 답을 골라줘요 🙂");
    return;
  }

  if (currentIndex >= ITEMS.length - 1) {
    renderResult();
    return;
  }

  currentIndex += 1;
  renderQuestion();
  setTimeout(() => {
    const sel = answers[ITEMS[currentIndex].id];
    const btn = sel
      ? $emojiGroup.querySelector(`.emoji[data-score="${sel}"]`)
      : $emojiGroup.querySelector(".emoji");
    btn?.focus();
  }, 0);
}

// ====== 8) 채점/리포트 ======
function scoreAll(){
  const scored = ITEMS.map((it) => {
    const raw = answers[it.id];
    if (raw == null) return { ...it, raw: null, score: null };
    const s = it.reverse ? reverseScore(raw) : raw;
    return { ...it, raw, score: s };
  });

  const missingCount = scored.filter(r => r.score == null).length;

  // 누락 3개 이상이면 결과 산출 불가
  if (missingCount >= 3) {
    return { ok:false, reason:"missing3", missingCount, scored };
  }

  // 도메인별 평균(소수1자리 반올림)
  const byDomain = {};
  for (const d of DOMAINS) {
    const rows = scored.filter(r => r.domain === d.key);
    const answeredScores = rows.filter(r => r.score != null).map(r => r.score);
    const avg = round1(answeredScores.reduce((a,b)=>a+b,0) / answeredScores.length);
    byDomain[d.key] = {
      key: d.key,
      desc: d.desc,
      avg,
      answeredCount: answeredScores.length,
      missingInDomain: rows.length - answeredScores.length,
    };
  }

  // 총점(24~120): 누락 0~2개는 "해당 도메인 평균(반올림)"으로 보정
  let total = 0;
  scored.forEach((r) => {
    if (r.score != null) total += r.score;
    else total += Math.round(byDomain[r.domain].avg);
  });

  // 등급 컷(규범 없이 합리적 컷): 24문항 평균 4.0 이상=높음, 3.0 이하=도움필요
  // 4.0*24=96, 3.0*24=72
  let grade = "보통";
  if (total >= 96) grade = "높음";
  if (total <= 72) grade = "도움필요";

  return { ok:true, total, grade, missingCount, byDomain, scored };
}

function topDomains(byDomain, n, order){
  const arr = Object.values(byDomain);
  arr.sort((a,b) => order === "desc" ? (b.avg - a.avg) : (a.avg - b.avg));
  return arr.slice(0, n);
}

function domainTableHTML(byDomain){
  const rows = Object.values(byDomain).map(d => `
    <tr>
      <td>${d.key}</td>
      <td><strong>${d.avg.toFixed(1)}</strong></td>
      <td>${d.desc}</td>
    </tr>
  `).join("");

  return `
    <table>
      <thead>
        <tr>
          <th>영역</th>
          <th>평균</th>
          <th>설명</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildReportText(grade){
  if (grade === "높음") {
    return "지금은 ‘할 수 있어!’ 힘이 꽤 탄탄해요. 계속 쌓아가면 더 단단해져요.";
  }
  if (grade === "도움필요") {
    return "지금은 ‘도움 받으며 다시 해보기’ 연습이 필요해요. 결과는 낙인이 아니라 ‘지금 필요한 도구’를 찾는 신호예요.";
  }
  return "지금은 ‘할 수 있어’ 힘이 자라는 중이에요. 강점은 유지하고, 약한 영역은 작게 자주 연습해봐요.";
}

function buildActions(growthTop){
  const key = growthTop[0]?.key;
  const bank = {
    "시작/도전": [
      "새로운 일은 ‘1분만 해보기’로 시작해요.",
      "시작 전 걱정이 커지면 ‘첫 단계만’ 정해서 해봐요.",
      "오늘은 ‘한 번만’ 해보고 멈춰도 괜찮아요.",
    ],
    "노력/지속": [
      "하루 목표를 ‘아주 작게’ 정하고 지키면 성공이에요.",
      "틀려도 ‘다음 한 문제’만 더 해봐요.",
      "조금 좋아진 점을 한 줄로 적어봐요.",
    ],
    "전략/문제해결": [
      "막히면 ‘다른 방법 1개’만 떠올려 바꿔봐요.",
      "해결 순서를 1→2→3으로 짧게 적어봐요.",
      "필요하면 ‘찾기/물어보기’ 중 하나를 바로 해봐요.",
    ],
    "도움요청/정서조절": [
      "답답하면 30초 쉬고 다시 ‘한 걸음’만 해봐요.",
      "기분을 ‘지금 ○○해서 ○○해요’로 말해봐요.",
      "도움 요청은 ‘어떤 도움이 필요한지’ 한 문장으로 말해봐요.",
    ],
  };

  const base = bank[key] || bank["전략/문제해결"];
  return base.slice(0, 3);
}

function buildHelpSentences(){
  return [
    "선생님, 제가 지금 ○○에서 막혔어요. 다음에 뭘 하면 좋을까요?",
    "친구야, ○○가 어려워. 이 부분만 같이 해줄 수 있어?",
  ];
}

function buildAdultNote(grade){
  if (grade === "높음") {
    return "현재는 ‘시작–지속–전략–도움요청/정서조절’ 흐름이 비교적 잘 이어지고 있어요. 성공의 이유를 ‘내 전략/내 노력’로 연결해주면 더 단단해져요.";
  }
  if (grade === "도움필요") {
    return "지금은 ‘시작/전환/도움 요청’에서 멈추는 구간이 있을 수 있어요. 결과는 낙인이 아니라 ‘지금 필요한 도구’를 찾는 신호예요. 과제를 더 작게 쪼개고, 막힐 때 쓸 질문 1개를 고정해주면 회복이 빨라져요.";
  }
  return "기본 힘은 있는데 상황에 따라 흔들릴 수 있어요. 강점은 유지하고 낮게 나온 영역은 ‘작게 자주’ 연습하면 좋아요.";
}

function setSaveState(text, type){
  // type: "", "ok", "bad"
  $saveState.textContent = text;
  $saveState.className = "save-state" + (type ? ` ${type}` : "");
}

function renderResult(){
  const name = ($studentName.value || "").trim();
  const birthDate = ($birthDate.value || "").trim();
  const phase = ($phaseSelect.value || "").trim();
  const assessedAt = todayYMD();

  const res = scoreAll();
  showScreen("result");

  didAutoSave = false;
  setSaveState("", "");

  // 메타라인
  $metaLine.textContent = `이름: ${name || "(미입력)"} / 생년월일: ${birthDate || "(미입력)"} / 진단 시점: ${phase || "(미입력)"} / 진단일: ${assessedAt}`;

  if (!res.ok) {
    $summaryLine.textContent = "아직 답이 부족해서 결과를 만들 수 없어요.";
    $totalLine.textContent = "결과 산출 불가";
    $missingLine.textContent = `누락 문항: ${res.missingCount}개 (3개 이상이면 다시 응답이 필요해요.)`;
    $domainTableWrap.innerHTML = "";
    $strengthList.innerHTML = "";
    $growthList.innerHTML = "";
    $actionList.innerHTML = "";
    $helpSentenceList.innerHTML = "";
    $adultNote.textContent = "";
    return;
  }

  const { total, grade, missingCount, byDomain } = res;

  $summaryLine.textContent = buildReportText(grade);
  $totalLine.textContent = `${total}점 / ${grade}`;
  $missingLine.textContent = missingCount > 0 ? `누락 문항: ${missingCount}개 (영역 평균으로 보정했어요.)` : "";

  $domainTableWrap.innerHTML = domainTableHTML(byDomain);

  const strengthTop = topDomains(byDomain, 2, "desc");
  const growthTop = topDomains(byDomain, 2, "asc");

  $strengthList.innerHTML = strengthTop
    .map(d => `<li><strong>${d.key}</strong> (${d.avg.toFixed(1)}) - ${d.desc}</li>`)
    .join("");

  $growthList.innerHTML = growthTop
    .map(d => `<li><strong>${d.key}</strong> (${d.avg.toFixed(1)}) - 조금씩 연습하면 더 좋아져요.</li>`)
    .join("");

  const actions = buildActions(growthTop);
  $actionList.innerHTML = actions.map(t => `<li>${t}</li>`).join("");

  const helps = buildHelpSentences();
  $helpSentenceList.innerHTML = helps.map(t => `<li>${t}</li>`).join("");

  $adultNote.textContent = buildAdultNote(grade);

  // 저장 payload
  const domain = Object.fromEntries(
  Object.values(byDomain).map(d => [d.key, d.avg])
);

const analysis = {
  summary: buildReportText(grade),
  strengthTop2: strengthTop.map(d => ({ domain: d.key, avg: d.avg })),
  growthTop2: growthTop.map(d => ({ domain: d.key, avg: d.avg })),
  actions,
  helpSentences: helps,
};

const payload = {
  assessedAt,
  phase,
  name,
  birthDate,
  total,
  grade,
  domain,     // ✅ 플젝3이 기대하는 키명으로
  analysis,   // ✅ 플젝3이 기대하던 analysis 키 유지
  answers,    // ✅ 유지
};


  autoSaveOnce(payload);
}

// ====== 9) Google Sheets 저장 ======
async function autoSaveOnce(payload){
  if (didAutoSave) return;
  didAutoSave = true;

  if (!SHEETS_ENDPOINT || SHEETS_ENDPOINT.includes("PASTE_")) {
    setSaveState("저장 설정이 아직 안 되어 있어요. (SHEETS_ENDPOINT 확인)", "");
    return;
  }
  if (!SHEETS_TOKEN || SHEETS_TOKEN.includes("PASTE_")) {
    setSaveState("저장 설정이 아직 안 되어 있어요. (SHEETS_TOKEN 확인)", "");
    return;
  }

  setSaveState("저장 중...", "");

  try {
const body = JSON.stringify({ token: SHEETS_TOKEN, data: payload });

const res = await fetch(SHEETS_ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "text/plain;charset=utf-8" },
  body
});

const json = await res.json().catch(() => ({}));
if (!res.ok || json.ok === false) {
  const msg = json?.error || `HTTP ${res.status}`;
  throw new Error(msg);
}


    setSaveState("✅ 저장 완료!", "ok");
  } catch (e) {
    setSaveState(`❌ 저장 실패: ${String(e.message || e)}`, "bad");
  }
}

// ====== 10) 이벤트 ======
$btnStart.addEventListener("click", () => {
  const name = ($studentName.value || "").trim();
  const birth = ($birthDate.value || "").trim();
  const phase = ($phaseSelect.value || "").trim();

  if (!name || !birth || !phase) {
    alert("이름, 생년월일, 진단 시점을 모두 입력해줘요.");
    return;
  }

  currentIndex = 0;
  didAutoSave = false;
  initAnswers();
  showScreen("survey");
  renderQuestion();

  setTimeout(() => {
    $emojiGroup.querySelector(".emoji")?.focus();
  }, 0);
});

$btnExit.addEventListener("click", () => {
  const ok = confirm("설문을 그만하고 처음 화면으로 돌아갈까요?");
  if (!ok) return;
  showScreen("start");
});

$btnPrev.addEventListener("click", goPrev);
$btnNext.addEventListener("click", goNext);

$btnRestart.addEventListener("click", () => {
  currentIndex = 0;
  didAutoSave = false;
  initAnswers();
  showScreen("start");
});

// 초기화
showScreen("start");
initAnswers();



