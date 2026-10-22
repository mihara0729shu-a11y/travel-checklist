(function () {
  // WordPress 版：シートやスライドの置き場所をテーマのレイアウトの外（body 直下）へ移す
  const layer = document.getElementById("mochimono-layer");
  if (layer) document.body.appendChild(layer);

  const LS_KEY = "tabijitaku.v1", UI_KEY = "tabijitaku.ui";
  const WD = "日月火水木金土";
  const TAGS = [
    { k: "flight", l: "飛行機" },
    { k: "abroad", l: "海外" },
    { k: "pc", l: "PC作業" },
    { k: "onsen", l: "温泉" },
    { k: "beach", l: "海・プール" },
    { k: "winter", l: "寒い地域" },
    { k: "outdoor", l: "アウトドア" },
    { k: "kids", l: "子連れ" },
  ];
  // 現地での移動手段（条件と同じく trip.tags に入れる）
  const MOVES = [
    { k: "car", l: "自家用車" },
    { k: "rental", l: "レンタカー" },
    { k: "train", l: "電車・バス" },
    { k: "shinkansen", l: "新幹線" },
    { k: "taxi", l: "タクシー" },
    { k: "bicycle", l: "レンタサイクル" },
    { k: "ferry", l: "船・フェリー" },
  ];
  const ALL_TAGS = TAGS.concat(MOVES);

  const uid = () => Math.random().toString(36).slice(2, 10);
  const pad = n => String(n).padStart(2, "0");
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = s => new Date(s + "T00:00:00");
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const fmt = s => { const d = parse(s); return `${d.getMonth() + 1}/${d.getDate()}(${WD[d.getDay()]})`; };
  const stayLabel = n => (n === 0 ? "日帰り" : `${n}泊${n + 1}日`);

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat()) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(c));
    }
    return el;
  }

  // ---- 持ち物テンプレート ----
  function moveItems(tags) {
    const has = t => tags.includes(t);
    const drive = has("car") || has("rental");
    return [
      drive && "運転免許証", has("rental") && has("abroad") && "国際運転免許証", drive && "ETCカード",
      has("car") && "車検証・自賠責保険証（車内）", has("rental") && "レンタカーの予約確認",
      drive && "スマホホルダー", drive && "車載USB充電器", drive && "駐車場の予約・場所メモ",
      has("train") && "乗換案内アプリ", has("train") && "小銭（バス運賃用）",
      has("shinkansen") && "新幹線のきっぷ・予約画面",
      has("taxi") && "タクシー配車アプリ",
      has("bicycle") && "レンタサイクルのアプリ・会員登録",
      has("ferry") && "乗船券・予約画面", has("ferry") && "酔い止め",
    ].filter(Boolean);
  }

  function template(purpose, nights, tags) {
    const has = t => tags.includes(t);
    const biz = purpose === "business", stay = nights > 0;
    const q = (name, qty) => ({ name, qty });
    const cats = [];
    const cat = (name, list) => {
      const items = list.filter(Boolean).map(x => (typeof x === "string" ? { name: x } : x));
      if (items.length) cats.push({ name, items });
    };
    cat("貴重品", [
      "財布", "スマートフォン", !(has("car") || has("rental")) && "身分証（運転免許証など）", "健康保険証", "交通系ICカード", "家の鍵",
      (has("flight") || has("abroad")) && "航空券・eチケット",
      has("abroad") && "パスポート", has("abroad") && "海外旅行保険の証書",
      has("abroad") && "クレジットカード（予備）", has("abroad") && "現地通貨",
      biz && "社員証", biz && "名刺",
    ]);
    cat("現地での移動", moveItems(tags));
    cat("衣類", [
      biz && "スーツ", biz && stay && q("ワイシャツ", nights), biz && "ネクタイ", biz && "革靴",
      !biz && stay && q("トップス", nights), !biz && stay && "ボトムス",
      stay && q("下着", nights), stay && q("靴下", nights), stay && "パジャマ・部屋着",
      !stay && !biz && "羽織りもの",
      has("winter") && "コート・ダウン", has("winter") && "手袋・マフラー", has("winter") && stay && q("インナー（防寒）", nights),
      has("beach") && "水着", has("beach") && "ラッシュガード", has("beach") && "ビーチサンダル",
      has("outdoor") && "歩きやすい靴", has("outdoor") && "レインウェア",
    ]);
    cat("洗面・衛生", [
      stay && "歯ブラシ・歯磨き粉", stay && "洗顔料", stay && "スキンケア用品", stay && "メイク用品",
      stay && "髭剃り", stay && "ヘアワックス・ヘアゴム", stay && "コンタクトレンズ・ケース",
      "常備薬", "絆創膏", "マスク", "ハンカチ", "ティッシュ",
      has("abroad") && "液体用ジップ袋（100ml以下の容器）",
    ]);
    cat("電子機器", [
      "スマホ充電器・ケーブル", has("flight") ? "モバイルバッテリー（機内持ち込み）" : "モバイルバッテリー", "イヤホン",
      has("pc") && "ノートPC", has("pc") && "PC用ACアダプタ", has("pc") && "マウス", has("pc") && "変換アダプタ（HDMIなど）",
      has("abroad") && "変換プラグ", has("abroad") && "海外用SIM・Wi-Fiルーター",
    ]);
    if (biz) cat("仕事", ["会議資料", "筆記用具", "手帳・ノート", "名刺入れ", "領収書入れ（経費精算）", "手土産"]);
    if (has("onsen")) cat("温泉", ["フェイスタオル", "湯上がり用の着替え", "保湿クリーム"]);
    if (has("kids")) cat("子ども", [
      "母子手帳・子どもの保険証", "紙おむつ", "おしりふき", q("子どもの着替え", nights + 1),
      "おやつ・飲み物", "おもちゃ・絵本",
    ]);
    if (has("beach") || has("outdoor")) cat("屋外", [
      "日焼け止め", "サングラス", "帽子", has("beach") && "バスタオル", has("outdoor") && "虫除けスプレー",
    ]);
    cat("その他", [
      "エコバッグ", "折りたたみ傘", stay && "洗濯物用の袋",
      has("flight") && "ネックピロー", has("abroad") && "ガイドブック・地図アプリ",
    ]);
    return cats.map(c => ({
      id: uid(), name: c.name,
      items: c.items.map(i => ({ id: uid(), name: i.name, qty: i.qty > 1 ? i.qty : null, done: false })),
    }));
  }
  const countItems = cats => cats.reduce((n, c) => n + c.items.length, 0);

  // ---- 保存 ----
  function loadLocal() {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY));
      if (s && Array.isArray(s.trips)) return s;
    } catch (e) {}
    return { v: 1, updatedAt: 0, trips: [] };
  }
  function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
  function loadUi() {
    try { return Object.assign({ activeId: null, onlyOpen: false, showWhy: false, closed: [] }, JSON.parse(localStorage.getItem(UI_KEY))); }
    catch (e) { return { activeId: null, onlyOpen: false, closed: [] }; }
  }
  function saveUi() { try { localStorage.setItem(UI_KEY, JSON.stringify(ui)); } catch (e) {} }

  let state = loadLocal();
  let ui = loadUi();
  // 開いた直後はいつも「新しい旅」の入力から始める
  let view = "new";
  let newForm = null;

  // ---- クラウド同期（claude.ai 上で開いたときだけ。スマホ・PC間で同じリストを共有） ----
  let docRef = null, writing = false, again = false, timer = null;
  let dbApi = null, myId = null, isOwner = false;
  const syncEl = document.getElementById("mc-sync");
  function setSync(s) {
    const text = { local: "この端末に保存", sync: "同期中…", ok: "スマホ・PCで同期", err: "同期に失敗（この端末には保存済み）", full: "保存容量の上限です" };
    syncEl.dataset.s = s;
    syncEl.textContent = text[s];
  }
  async function push() {
    if (!docRef) return;
    if (writing) { again = true; return; }
    writing = true;
    try { await docRef.set(JSON.parse(JSON.stringify(state))); setSync("ok"); }
    catch (e) { setSync(e && e.code === "quota_exceeded" ? "full" : "err"); }
    writing = false;
    if (again) { again = false; push(); }
  }
  // 保存先は2通り：claude.ai で開いたときは claude.use("db")、自分のサイトで公開したときは Firebase。
  // どちらも doc(path).get/set/onSnapshot と collection(path).get が同じ形で使えるので、パスも共通にしている
  async function connect() {
    if (window.MOCHIMONO_WP) return connectWp();
    if (firebaseReady()) return connectFirebase();
    if (!window.claude || typeof window.claude.use !== "function") return;
    try {
      const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      attach(db, id, await user.isOwner());
    } catch (e) { setSync("local"); }
  }

  // ---- Firebase（公開サイト用。firebase-config.js に設定値が入っているときだけ動く） ----
  let unsub = null;
  const firebaseReady = () => !!(window.firebase && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && !/ここに/.test(window.FIREBASE_CONFIG.apiKey));
  function connectFirebase() {
    const fb = window.firebase;
    if (!fb.apps.length) fb.initializeApp(window.FIREBASE_CONFIG);
    const auth = fb.auth(), db = fb.firestore();
    const btn = document.getElementById("auth-btn");
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      const u = auth.currentUser;
      if (u && !u.isAnonymous) { await auth.signOut(); toast("ログアウトしました。リストはこの端末に残っています"); return; }
      try { await auth.signInWithPopup(new fb.auth.GoogleAuthProvider()); }
      catch (e) { if (e && e.code !== "auth/popup-closed-by-user") toast("ログインできませんでした。もう一度お試しください"); }
    });
    auth.onAuthStateChanged(u => {
      if (unsub) { unsub(); unsub = null; }
      docRef = null;
      if (!u) { dbApi = null; myId = null; isOwner = false; btn.textContent = "ログインして同期"; setSync("local"); return; }
      // 匿名ログイン（アンケート回答用）では同期しない
      dbApi = db; myId = u.uid;
      isOwner = !u.isAnonymous && !!u.email && u.email === window.SITE_OWNER_EMAIL;
      if (u.isAnonymous) { btn.textContent = "ログインして同期"; setSync("local"); return; }
      btn.textContent = "ログアウト";
      attach(db, u.uid, isOwner);
    });
  }
  // アンケート送信時、未ログインなら匿名でログインしてから送る
  async function ensureFeedbackUser() {
    if (dbApi && myId) return true;
    if (!firebaseReady()) return false;
    try { const r = await window.firebase.auth().signInAnonymously(); dbApi = window.firebase.firestore(); myId = r.user.uid; return true; }
    catch (e) { return false; }
  }

  // ---- WordPress（プラグイン版。ショートコードのページに MOCHIMONO_WP が埋め込まれているときだけ動く） ----
  async function wpFetch(path, opts = {}) {
    const wp = window.MOCHIMONO_WP;
    const res = await fetch(wp.restUrl + path, {
      method: opts.method || "GET", credentials: "same-origin",
      headers: Object.assign({ "Content-Type": "application/json" }, wp.loggedIn ? { "X-WP-Nonce": wp.nonce } : {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) throw { code: "http_" + res.status };
    return res.json();
  }
  // claude.use("db") や Firestore と同じ形（doc().set / onSnapshot）で、WordPress のユーザー情報に保存する
  const wpDb = {
    doc: () => ({
      set: data => wpFetch("state", { method: "POST", body: data }),
      onSnapshot(next, error) {
        let stopped = false;
        const pull = async () => {
          try {
            const r = await wpFetch("state");
            if (!stopped) next({ exists: !!r.exists, data: () => r.data, metadata: { hasPendingWrites: false } });
          } catch (e) { if (!stopped) { stopped = true; if (error) error(e); } }
        };
        const onVisible = () => { if (document.visibilityState === "visible") pull(); };
        pull();
        const t = setInterval(pull, 60000);
        document.addEventListener("visibilitychange", onVisible);
        return () => { stopped = true; clearInterval(t); document.removeEventListener("visibilitychange", onVisible); };
      },
    }),
  };
  function connectWp() {
    const wp = window.MOCHIMONO_WP;
    isOwner = !!wp.isOwner;
    if (wp.loggedIn) { attach(wpDb, "me", isOwner); return; }
    const btn = document.getElementById("auth-btn");
    btn.hidden = false;
    btn.textContent = "ログインして同期";
    btn.addEventListener("click", () => { location.href = wp.loginUrl; });
  }

  // アンケートの保存と読み込み（WordPress は REST API、それ以外は doc/collection の形で）
  async function saveFeedback(entry) {
    if (window.MOCHIMONO_WP) return wpFetch("feedback", { method: "POST", body: entry });
    const ref = dbApi.doc("feedback/" + myId);
    const snap = await ref.get();
    const prev = snap.exists && Array.isArray(snap.data().responses) ? snap.data().responses.slice(-19) : [];
    await ref.set({ responses: prev.concat(entry), updatedAt: Date.now() });
  }
  async function loadFeedback() {
    if (window.MOCHIMONO_WP) return wpFetch("feedback");
    let all = [];
    const qs = await dbApi.collection("feedback").get();
    qs.docs.forEach(d => { const r = d.data().responses; if (Array.isArray(r)) all = all.concat(r); });
    return all;
  }

  function attach(db, id, owner) {
    dbApi = db; myId = id; isOwner = owner;
    docRef = db.doc("data/users/" + id + "/packing");
    setSync("sync");
    unsub = docRef.onSnapshot(snap => {
      if (snap.metadata.hasPendingWrites) return;
      if (!snap.exists) { push(); return; }
      const remote = snap.data();
      const r = remote.updatedAt || 0, l = state.updatedAt || 0;
      if (r > l && Array.isArray(remote.trips)) {
        state = JSON.parse(JSON.stringify(remote));
        saveLocal();
        render();
      } else if (r < l) {
        push();
      }
      setSync("ok");
    }, () => { docRef = null; setSync("local"); });
  }

  function commit() {
    state.updatedAt = Date.now();
    saveLocal();
    render();
    if (docRef) { clearTimeout(timer); timer = setTimeout(push, 600); }
  }

  // ---- 共通 ----
  const toastEl = document.getElementById("mc-toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2200);
  }
  const activeTrip = () => state.trips.find(t => t.id === ui.activeId) || state.trips[0] || null;
  const tripStats = t => {
    let total = 0, done = 0;
    t.cats.forEach(c => c.items.forEach(i => { total++; if (i.done) done++; }));
    return { total, done };
  };
  function daysUntil(t) {
    const today = parse(iso(new Date()));
    const diff = Math.round((parse(t.start) - today) / 86400000);
    if (diff > 0) return `出発まで ${diff}日`;
    if (diff === 0) return "今日出発";
    if (-diff <= t.nights) return "旅の途中";
    return "終了";
  }

  // ---- マスコット「もちこ」（黄色いスーツケース。表情は normal / happy / alert） ----
  function mascotSvg(mood) {
    const K = "#152033";
    const eyes = mood === "happy"
      ? `<path d="M51 66 q7 -9 14 0 M75 66 q7 -9 14 0" fill="none" stroke="${K}" stroke-width="4.5" stroke-linecap="round"/>`
      : mood === "alert"
      ? `<circle cx="58" cy="64" r="8" fill="#fff" stroke="${K}" stroke-width="3.5"/><circle cx="58" cy="65" r="4" fill="${K}"/><circle cx="82" cy="64" r="8" fill="#fff" stroke="${K}" stroke-width="3.5"/><circle cx="82" cy="65" r="4" fill="${K}"/>`
      : `<ellipse cx="58" cy="65" rx="5.5" ry="7.5" fill="${K}"/><ellipse cx="82" cy="65" rx="5.5" ry="7.5" fill="${K}"/><circle cx="60" cy="62" r="2" fill="#fff"/><circle cx="84" cy="62" r="2" fill="#fff"/>`;
    const mouth = mood === "happy"
      ? `<path d="M60 80 q10 15 20 0 z" fill="#C2412D" stroke="${K}" stroke-width="3.5" stroke-linejoin="round"/>`
      : mood === "alert"
      ? `<ellipse cx="70" cy="86" rx="5" ry="6" fill="${K}"/>`
      : `<path d="M61 81 q9 9 18 0" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`;
    const sweat = mood === "alert" ? `<path d="M26 40 q7 11 0 15 q-7 -4 0 -15z" fill="#8EC5F0" stroke="${K}" stroke-width="2.5"/>` : "";
    return `<svg viewBox="-10 0 160 144" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="70" cy="138" rx="42" ry="5" fill="${K}" opacity=".12"/>
      <g class="m-body">
        <path d="M22 82 q-14 2 -15 16" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
        <g class="m-wave"><path d="M118 80 q14 -4 17 -20" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/><circle cx="136" cy="56" r="6" fill="#F2B632" stroke="${K}" stroke-width="3"/></g>
        <circle cx="42" cy="128" r="7" fill="${K}"/><circle cx="98" cy="128" r="7" fill="${K}"/>
        <path d="M54 36 V20 q0 -8 8 -8 h16 q8 0 8 8 V36" fill="none" stroke="${K}" stroke-width="6" stroke-linecap="round"/>
        <rect x="20" y="34" width="100" height="90" rx="20" fill="#F2B632" stroke="${K}" stroke-width="5"/>
        <rect x="31" y="37" width="9" height="84" fill="#E39A14"/><rect x="100" y="37" width="9" height="84" fill="#E39A14"/>
        <ellipse cx="48" cy="79" rx="6" ry="4" fill="#F59A86" opacity=".85"/><ellipse cx="92" cy="79" rx="6" ry="4" fill="#F59A86" opacity=".85"/>
        ${eyes}${mouth}
        <circle cx="86" cy="106" r="8" fill="#8EC5F0" stroke="${K}" stroke-width="2.5"/><path d="M82 106 h8 M86 102 l3 4 l-3 4" fill="none" stroke="${K}" stroke-width="2" stroke-linecap="round"/>
        <path d="M84 14 L104 36" stroke="${K}" stroke-width="2.5"/>
        <g transform="rotate(18 106 46)"><rect x="96" y="36" width="20" height="26" rx="4" fill="#F59A86" stroke="${K}" stroke-width="3"/><circle cx="106" cy="42" r="2.5" fill="#fff" stroke="${K}" stroke-width="1.5"/></g>
        ${sweat}
      </g>
    </svg>`;
  }
  function mascot(mood, size) {
    const m = h("span", { class: "mascot " + mood, style: `--ms:${size}px`, "aria-hidden": "true" });
    m.innerHTML = mascotSvg(mood);
    m.dataset.mood = mood;
    return m;
  }
  // もちこ＋吹き出し。el.say(mood, text) で表情とセリフを差し替えられる
  function guide(mood, text, size, extra, live) {
    const m = mascot(mood, size);
    const msg = h("span", { class: "bubble-text", text });
    const el = h("div", { class: "guide" }, m,
      h("div", { class: "bubble", "aria-live": live ? "polite" : null }, h("span", { class: "who", text: "もちこ" }), msg, extra));
    el.say = (mood2, text2) => {
      if (m.dataset.mood !== mood2) { m.className = "mascot " + mood2; m.innerHTML = mascotSvg(mood2); m.dataset.mood = mood2; }
      if (msg.textContent !== text2) msg.textContent = text2;
    };
    el.mascot = m;
    return el;
  }

  const TAG_TIPS = {
    flight: "モバイルバッテリーは預け荷物に入れちゃダメ。手荷物に入れておくね！",
    abroad: "海外ならパスポートの期限をチェック！残りが6か月以上必要な国もあるよ。",
    pc: "PCのACアダプタは忘れ物の常連さん。リストに入れておいたよ。",
    onsen: "温泉いいなあ。日帰り湯はタオルが有料のことが多いから、持っていこうね。",
    beach: "海やプールなら、日焼け止めは2〜3時間おきに塗り直してね。",
    winter: "寒い地域は重ね着で調節しよう。手袋とマフラーも入れておくね。",
    outdoor: "外で過ごすなら、両手が空くレインウェアが安心だよ。",
    kids: "子どもの着替えは1日分多めにしておいたよ。おやつも忘れずに！",
    car: "車ならETCカードを忘れずに！料金所で慌てないようにね。",
    rental: "レンタカーは免許証がないと借りられないよ。ETCカードもあると便利！",
    train: "電車・バスなら乗換アプリが心強い味方。地方のバスは小銭も用意してね。",
    shinkansen: "新幹線のきっぷは座席に置き忘れやすいから気をつけてね。",
    taxi: "配車アプリを入れておくと、夜や地方でもすぐ呼べるよ。",
    bicycle: "レンタサイクルはアプリ登録を先に済ませておくとスムーズ！",
    ferry: "船に乗るなら酔い止めを。乗る30分前に飲んでおこう。",
  };
  function startTip(f, lastTag) {
    if (lastTag && f.tags.includes(lastTag)) return ["happy", TAG_TIPS[lastTag]];
    const dest = f.dest.trim();
    if (!dest) return ["normal", "はじめまして、持ち物リスト作りをお手伝いする「もちこ」だよ。行き先と日数を教えてくれたら、持ち物リストを作るね！"];
    const base = f.purpose === "business" ? `${dest}へ出張だね。名刺と充電器は二重チェック！` : `${dest}かあ、いいなあ！`;
    const stay = f.nights === 0 ? "日帰りなら荷物は身軽にいこう。" : `${stayLabel(f.nights)}なら、着替えは ${f.nights} セット入れておくね。`;
    return ["happy", `${base}${stay}当てはまる条件があれば選んでね。`];
  }
  function tripTip(t) {
    const s = tripStats(t), rest = s.total - s.done;
    const diff = Math.round((parse(t.start) - parse(iso(new Date()))) / 86400000);
    const place = t.dest || "旅先";
    if (s.total && rest === 0) return ["happy", `全部そろったね！${place}、思いきり楽しんできてね。いってらっしゃい！`];
    if (diff >= 0 && diff <= 1 && rest > 0) return ["alert", `${diff === 0 ? "今日が出発日" : "出発は明日"}だよ！まだ ${rest} 個残ってる。急いで〜！`];
    if (s.done === 0) return ["normal", "まずは「貴重品」から始めよう。財布・スマホ・鍵がそろえば、あとはなんとかなる！"];
    let next = null;
    t.cats.some(c => c.items.some(i => { if (!i.done) { next = i; return true; } return false; }));
    if (!next) return ["normal", "持ち物を追加してみてね。"];
    const hint = `「${next.name}」。${SCENE_AT[sceneOf(t, next)]}使うよ。${whyOf(next)}`;
    if (s.done / s.total >= 0.5) return ["happy", `半分こえたよ、いい調子！ 次は${hint}`];
    return ["normal", `次は${hint}`];
  }
  const SCENE_AT = {
    home: "家を出る前に", station: "移動中に", drive: "運転するときに", airport: "空港で", abroad: "現地に着いたら", work: "仕事中に",
    sightseeing: "街歩きで", outdoor: "外で遊ぶときに", cold: "寒い朝晩に", kids: "子どもと一緒のときに",
    onsen: "温泉で", hotel: "宿の夜に", morning: "翌朝の身支度で", back: "帰り道で", custom: "旅のどこかで",
  };
  let lastSeen = { id: null, done: 0 };

  // ---- 描画 ----
  function render() {
    renderRail();
    renderMain();
  }

  function renderRail() {
    const box = document.getElementById("mc-trips");
    const cur = view === "trip" ? activeTrip() : null;
    // 旅がまだないときは左の列ごと消して、入力フォームを全幅で見せる
    const rail = document.getElementById("mc-rail");
    rail.hidden = state.trips.length === 0;
    rail.parentElement.classList.toggle("no-rail", rail.hidden);
    box.replaceChildren(
      h("button", {
        class: "trip-btn new-btn", "aria-current": view === "new" ? "true" : "false",
        onclick: () => { view = "new"; render(); document.getElementById("f-dest")?.focus(); },
      }, "＋ 新しい旅"),
      ...state.trips.slice().reverse().map(t => {
        const s = tripStats(t);
        return h("button", {
          class: "trip-btn", "aria-current": cur && cur.id === t.id ? "true" : "false",
          onclick: () => { view = "trip"; ui.activeId = t.id; saveUi(); render(); },
        },
          h("span", { class: "t-name", text: t.name || t.dest || "無題の旅" }),
          h("span", { class: "t-meta", text: `${fmt(t.start)}〜 · ${s.done}/${s.total}` }),
        );
      }),
    );
  }

  function renderMain() {
    const main = document.getElementById("mc-main");
    const t = activeTrip();
    if (view === "new" || !t) {
      // 同期で再描画されても入力中の内容を消さないよう、フォームは作り直さない
      if (!newForm) newForm = tripForm();
      if (main.firstChild !== newForm) main.replaceChildren(newForm);
      return;
    }
    const s = tripStats(t);
    const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
    const rest = s.total - s.done;

    const pass = h("section", { class: "pass", "aria-label": "旅の概要" },
      h("div", { class: "pass-main" },
        h("div", { class: "eyebrow" },
          h("span", { class: "pill" + (t.purpose === "business" ? " biz" : ""), text: t.purpose === "business" ? "出張" : "旅行" }),
          t.sample && h("span", { class: "pill sample", text: "サンプル" }),
          h("span", { text: daysUntil(t) }),
        ),
        h("p", { class: "dest", text: t.dest || t.name || "行き先未設定" }),
        t.name && t.dest && h("p", { class: "trip-title", text: t.name }),
        h("div", { class: "facts" },
          h("div", { class: "fact" }, h("span", { text: "日程" }), h("b", { text: `${fmt(t.start)} – ${fmt(addDays(t.start, t.nights))}` })),
          h("div", { class: "fact" }, h("span", { text: "期間" }), h("b", { text: stayLabel(t.nights) })),
          t.tags.length > 0 && h("div", { class: "fact" }, h("span", { text: "条件" }),
            h("b", { style: "font-family:var(--f-body);font-size:14px", text: t.tags.map(k => (ALL_TAGS.find(x => x.k === k) || {}).l).filter(Boolean).join("・") })),
        ),
      ),
      h("div", { class: "pass-stub" },
        h("div", { class: "count" }, String(s.done), h("small", { text: ` / ${s.total}` })),
        h("div", { class: "bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": "準備の進み具合" },
          h("i", { style: `width:${pct}%` })),
        h("div", { class: "left" + (rest === 0 && s.total ? " done" : ""), text: rest === 0 && s.total ? "準備完了。いってらっしゃい！" : `あと ${rest} 個` }),
      ),
    );

    let delArmed = false;
    const delBtn = h("button", {
      class: "btn danger", onclick: () => {
        if (!delArmed) {
          delArmed = true; delBtn.classList.add("armed"); delBtn.textContent = "もう一度押すと削除";
          setTimeout(() => { if (delBtn.isConnected) { delArmed = false; delBtn.classList.remove("armed"); delBtn.textContent = "削除"; } }, 3000);
          return;
        }
        state.trips = state.trips.filter(x => x.id !== t.id);
        ui.activeId = state.trips[0] ? state.trips[0].id : null; saveUi();
        commit(); toast("旅を削除しました");
      },
    }, "削除");

    const actions = h("div", { class: "actions" },
      h("button", { class: "btn primary", onclick: () => openSim(t) }, "当日をシミュレーション"),
      h("button", {
        class: "btn", "aria-pressed": ui.showWhy ? "true" : "false",
        onclick: () => { ui.showWhy = !ui.showWhy; saveUi(); renderMain(); },
      }, "いつ使う？を表示"),
      h("button", {
        class: "btn", "aria-pressed": ui.onlyOpen ? "true" : "false",
        onclick: () => { ui.onlyOpen = !ui.onlyOpen; saveUi(); renderMain(); },
      }, "未チェックだけ表示"),
      h("button", { class: "btn", onclick: () => copyText(t) }, "テキストでコピー"),
      h("span", { class: "spacer" }),
      h("button", { class: "btn", onclick: () => openSheet(t) }, "編集"),
      h("button", { class: "btn", onclick: () => duplicate(t) }, "複製"),
      h("button", {
        class: "btn", onclick: () => {
          t.cats.forEach(c => c.items.forEach(i => { i.done = false; }));
          commit(); toast("チェックをすべて外しました");
        },
      }, "チェックを外す"),
      delBtn,
    );

    const cats = h("div", { class: "cats" }, t.cats.map((c, n) => renderCat(t, c, n)));

    const [mood, tip] = tripTip(t);
    const tripGuide = guide(mood, tip, 76, rest > 0 && h("button", { class: "btn", onclick: () => openSim(t) }, "当日の流れで確かめる →"));
    tripGuide.classList.add("trip-guide");
    // チェックが増えたら、もちこがぴょんと跳ねる
    if (lastSeen.id === t.id && s.done > lastSeen.done) tripGuide.mascot.classList.add("hop");
    lastSeen = { id: t.id, done: s.done };

    const catInput = h("input", { type: "text", id: "add-cat", placeholder: "カテゴリを追加（例：お土産）", "aria-label": "カテゴリ名" });
    const addCat = () => {
      const v = catInput.value.trim();
      if (!v) return;
      t.cats.push({ id: uid(), name: v, items: [] });
      commit();
      document.getElementById("add-cat")?.focus();
    };
    catInput.addEventListener("keydown", e => { if (e.key === "Enter" && !e.isComposing) addCat(); });

    main.replaceChildren(pass, tripGuide, actions, cats,
      h("div", { class: "add-cat" }, catInput, h("button", { class: "btn", onclick: addCat }, "追加")),
      h("div", { class: "fb-band" },
        h("div", {}, mascot("happy", 46),
          h("p", {}, h("b", { text: "この持ち物チェックリストの使い心地はいかがですか？" }), h("span", { text: "ご意見・修正案・お問い合わせは、フォームから送れます。" }))),
        h("div", { class: "fb-band-actions" },
          h("a", { class: "btn", href: FEEDBACK_FORM_URL, target: "_blank", rel: "noopener" }, "ご意見・お問い合わせ"),
        ),
      ));
  }

  function renderCat(t, c, n) {
    const done = c.items.filter(i => i.done).length;
    const closed = ui.closed.includes(c.id);
    const visible = ui.onlyOpen ? c.items.filter(i => !i.done) : c.items;

    const list = h("ul", { class: "items" }, visible.map(i => {
      const cb = h("input", {
        type: "checkbox", id: "i-" + i.id, checked: i.done,
        onchange: () => { i.done = cb.checked; commit(); },
      });
      return h("li", { class: "item" + (i.done ? " done" : "") },
        h("label", { for: "i-" + i.id },
          cb,
          h("span", { class: "box", "aria-hidden": "true" }, checkSvg()),
          h("span", { class: "item-text" },
            h("span", { class: "item-name", text: i.name }),
            ui.showWhy && h("span", { class: "item-why" }, h("b", { text: SCENE_BY_ID[sceneOf(t, i)].title }), "　" + whyOf(i)),
          ),
          i.qty && h("span", { class: "qty", text: "×" + i.qty }),
        ),
        h("button", {
          class: "icon-btn", "aria-label": i.name + "を削除", title: "削除",
          onclick: () => { c.items = c.items.filter(x => x.id !== i.id); commit(); },
        }, "×"),
      );
    }));

    const input = h("input", { type: "text", id: "add-" + c.id, placeholder: "持ち物を追加", "aria-label": c.name + "に持ち物を追加" });
    const add = () => {
      let v = input.value.trim();
      if (!v) return;
      let qty = null;
      const m = v.match(/^(.*?)\s*[x×*]\s*(\d+)$/i);
      if (m && m[1]) { v = m[1]; qty = Math.min(+m[2], 99) > 1 ? Math.min(+m[2], 99) : null; }
      c.items.push({ id: uid(), name: v, qty, done: false });
      commit();
      document.getElementById("add-" + c.id)?.focus();
    };
    input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.isComposing) add(); });

    const body = h("div", { class: "cat-body" },
      visible.length ? list : h("div", { class: "empty-note", text: c.items.length ? "このカテゴリはすべて準備できました。" : "まだ持ち物がありません。" }),
      h("div", { class: "add-row" }, input, h("button", { class: "btn", onclick: add }, "追加")),
      c.items.length === 0 && h("div", { class: "add-row", style: "justify-content:flex-end" },
        h("button", { class: "btn danger", onclick: () => { t.cats = t.cats.filter(x => x.id !== c.id); commit(); } }, "カテゴリを削除")),
    );

    return h("section", { class: "cat" + (closed ? " closed" : "") + (c.items.length && done === c.items.length ? " complete" : "") },
      h("button", {
        class: "cat-head", "aria-expanded": closed ? "false" : "true",
        onclick: () => {
          ui.closed = closed ? ui.closed.filter(x => x !== c.id) : ui.closed.concat(c.id);
          saveUi(); renderMain();
        },
      },
        h("span", { class: "cat-name", style: `--cc:var(--cat-${(n % 6) + 1})`, text: c.name }),
        h("span", { class: "cat-count", text: `${done}/${c.items.length}` }),
        h("span", { class: "chev", "aria-hidden": "true", text: "▼" }),
      ),
      body,
    );
  }

  function duplicate(t) {
    const copy = JSON.parse(JSON.stringify(t));
    copy.id = uid();
    copy.sample = false;
    copy.name = (t.name || t.dest || "旅") + "（コピー）";
    copy.cats.forEach(c => { c.id = uid(); c.items.forEach(i => { i.id = uid(); i.done = false; }); });
    state.trips.push(copy);
    ui.activeId = copy.id; saveUi();
    commit(); toast("チェックを外した状態で複製しました");
  }

  function copyText(t) {
    const lines = [`【${t.dest || t.name}】${stayLabel(t.nights)} ${fmt(t.start)}〜`];
    t.cats.forEach(c => {
      if (!c.items.length) return;
      lines.push("", "■ " + c.name);
      c.items.forEach(i => lines.push(`${i.done ? "☑" : "☐"} ${i.name}${i.qty ? " ×" + i.qty : ""}`));
    });
    const text = lines.join("\n");
    const fallback = () => {
      const ta = h("textarea", { style: "position:fixed;top:0;left:0;opacity:0" });
      ta.value = text; document.body.append(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e) {}
      ta.remove();
      toast(ok ? "コピーしました" : "コピーできませんでした");
    };
    try {
      navigator.clipboard.writeText(text).then(() => toast("コピーしました。LINEやメモに貼り付けできます"), fallback);
    } catch (e) { fallback(); }
  }

  // ---- 持ち物の「いつ・なぜ」 ----
  const KB = {
    "財布": ["home", "交通費・食事・お土産に。現金しか使えない店もまだ多い。"],
    "スマートフォン": ["home", "地図・チケット・連絡・決済まで、旅のほとんどをこれ1台で回す。"],
    "身分証（運転免許証など）": ["home", "ホテルのチェックインやレンタカー、年齢確認で提示を求められる。"],
    "健康保険証": ["home", "旅先で急に病院にかかっても、自己負担3割で受診できる（マイナ保険証も可）。"],
    "交通系ICカード": ["station", "改札をタッチで通過。乗り換えのたびに切符を買わずに済む。"],
    "家の鍵": ["home", "玄関を出てから気づくと、帰宅したとき家に入れない。"],
    "航空券・eチケット": ["airport", "チェックインと保安検査で提示する。電波がなくても見られるようスクショも保存。"],
    "パスポート": ["airport", "出国審査で必須。残りの有効期間が足りているかも出発前に確認。"],
    "海外旅行保険の証書": ["abroad", "海外の医療費は高額。キャッシュレス診療の受付でこれを見せる。"],
    "クレジットカード（予備）": ["abroad", "メインのカードが使えない・なくしたときの保険。財布とは別の場所に。"],
    "現地通貨": ["abroad", "空港からの移動や屋台、チップなど、着いてすぐ現金が要る場面に。"],
    "社員証": ["work", "自社の拠点や訪問先のビルに入館するときに必要なことが多い。"],
    "名刺": ["work", "初対面の相手との挨拶で。会う人数より多めに。"],
    "スーツ": ["work", "商談や会議の場にふさわしい身だしなみ。"],
    "ワイシャツ": ["work", "毎日替えるので泊数ぶん。汗をかいた翌日も清潔な印象で。"],
    "ネクタイ": ["work", "訪問先や会議の格に合わせて。"],
    "革靴": ["work", "スーツに合わせる。移動用のスニーカーと履き分ける人も。"],
    "トップス": ["sightseeing", "毎日着替える分。旅先の気温に合う素材を選ぶ。"],
    "ボトムス": ["sightseeing", "たくさん歩く日は動きやすいものを。"],
    "羽織りもの": ["sightseeing", "冷房の強い電車やお店、夕方の冷え込みに。"],
    "下着": ["hotel", "お風呂のあとに毎日替える分。泊数ぶん必要。"],
    "靴下": ["morning", "朝の身支度で毎日1足ずつ。"],
    "パジャマ・部屋着": ["hotel", "宿の寝間着が合わないときや、部屋でくつろぐときに。"],
    "コート・ダウン": ["cold", "朝晩や風の強い日に体温を守る一番外側の一枚。"],
    "手袋・マフラー": ["cold", "首と手を温めると体感温度がぐっと上がる。"],
    "インナー（防寒）": ["cold", "重ね着の一番内側。毎日替えるので泊数ぶん。"],
    "水着": ["outdoor", "海やプール、ホテルのプールに。"],
    "ラッシュガード": ["outdoor", "強い日差しと擦り傷から肌を守る。"],
    "ビーチサンダル": ["outdoor", "熱い砂浜や、濡れたまま歩く場所で。"],
    "歩きやすい靴": ["outdoor", "山道や長い距離を歩いても足が痛くならないように。"],
    "レインウェア": ["outdoor", "山や屋外では傘より両手が使えるほうが安全。"],
    "歯ブラシ・歯磨き粉": ["hotel", "アメニティを置かない宿が増えている。"],
    "洗顔料": ["morning", "朝と夜の洗顔に。宿の備え付けが肌に合わないこともある。"],
    "スキンケア用品": ["hotel", "お風呂のあと、いつもの肌の手入れに。"],
    "メイク用品": ["morning", "朝の身支度に。トラベルサイズに詰め替えると軽くなる。"],
    "髭剃り": ["morning", "朝の身支度に。宿の使い捨てより肌に優しい。"],
    "ヘアワックス・ヘアゴム": ["morning", "朝、髪を整えるときに。"],
    "コンタクトレンズ・ケース": ["hotel", "夜に外したレンズの保管用。予備を1日分あると安心。"],
    "常備薬": ["hotel", "体調を崩したとき、いつもの薬が旅先ですぐ手に入るとは限らない。"],
    "絆創膏": ["sightseeing", "歩く旅の定番トラブル、靴ずれにすぐ対処できる。"],
    "マスク": ["station", "人混みの移動中や、乾燥した車内・機内で。"],
    "ハンカチ": ["sightseeing", "手洗いのあと。ハンドドライヤーがない場所も多い。"],
    "ティッシュ": ["sightseeing", "食べこぼしや紙がないトイレに備えて。"],
    "液体用ジップ袋（100ml以下の容器）": ["airport", "国際線では液体を100ml以下の容器に入れ、1L以下の透明な袋にまとめて検査を受ける。"],
    "スマホ充電器・ケーブル": ["hotel", "地図や写真で一日中使ったスマホを、夜のうちに満タンにする。"],
    "モバイルバッテリー（機内持ち込み）": ["airport", "リチウム電池は預け荷物に入れられない。必ず手荷物へ。"],
    "モバイルバッテリー": ["station", "移動中や外出先でスマホの電池が減ったときに。"],
    "イヤホン": ["station", "長い移動時間に音楽や動画を楽しむ。オンライン会議にも。"],
    "ノートPC": ["work", "資料の確認や発表、移動中の作業に。"],
    "PC用ACアダプタ": ["hotel", "翌日の会議に備えて、夜のうちに充電しておく。"],
    "マウス": ["work", "出張先でも作業の速さを落とさない。"],
    "変換アダプタ（HDMIなど）": ["work", "会議室のモニターやプロジェクターと端子が合わないことがある。"],
    "変換プラグ": ["abroad", "国によってコンセントの形が違い、日本のプラグが挿さらないことが多い。"],
    "海外用SIM・Wi-Fiルーター": ["abroad", "着いた瞬間から地図と連絡手段を使えるように。"],
    "会議資料": ["work", "打ち合わせの本番で使う。PCが動かないときに備えて紙でも。"],
    "筆記用具": ["work", "メモや書類へのサインに。"],
    "手帳・ノート": ["work", "打ち合わせの内容や次の予定を書き留める。"],
    "名刺入れ": ["work", "名刺をきれいに出し入れでき、受け取った名刺も一時的にしまえる。"],
    "領収書入れ（経費精算）": ["back", "交通費や宿泊費の領収書をなくさず持ち帰り、精算をスムーズに。"],
    "手土産": ["work", "訪問先へのご挨拶に。"],
    "フェイスタオル": ["onsen", "日帰り湯ではタオルが有料のことが多い。"],
    "湯上がり用の着替え": ["onsen", "汗をかいたあとの服に戻らずに済む。"],
    "保湿クリーム": ["onsen", "泉質によっては湯上がりに肌が乾燥しやすい。"],
    "母子手帳・子どもの保険証": ["kids", "旅先で子どもが急に熱を出したときの受診に。"],
    "紙おむつ": ["kids", "移動が長いと想定より多く使う。1日分多めに。"],
    "おしりふき": ["kids", "おむつ替えだけでなく、手や口まわりを拭くのにも使える。"],
    "子どもの着替え": ["kids", "食べこぼしや汗で、予定より早くなくなる。泊数＋1日分。"],
    "おやつ・飲み物": ["kids", "移動中のぐずり対策と水分補給に。"],
    "おもちゃ・絵本": ["kids", "電車や飛行機で静かに過ごしてもらうために。"],
    "日焼け止め": ["outdoor", "屋外で過ごす日は数時間おきに塗り直す。"],
    "サングラス": ["outdoor", "水面や雪の照り返しから目を守る。"],
    "帽子": ["outdoor", "日差しを遮り、熱中症を防ぐ。"],
    "バスタオル": ["outdoor", "海から上がったあとや、砂浜で敷くのに。"],
    "虫除けスプレー": ["outdoor", "山や水辺は虫が多い。夕方は特に。"],
    "エコバッグ": ["sightseeing", "お土産や買い物で荷物が増えたときに。袋が有料の店も多い。"],
    "折りたたみ傘": ["sightseeing", "旅先の急な雨に。日傘にもなるタイプが便利。"],
    "洗濯物用の袋": ["hotel", "着た服を分けて入れ、きれいな服と混ざらないように。"],
    "ネックピロー": ["airport", "機内や長距離移動で首を支えて眠れる。"],
    "ガイドブック・地図アプリ": ["abroad", "電波が届かない場所に備えて、オフライン地図も入れておく。"],
    "運転免許証": ["drive", "運転するなら必ず携帯。レンタカーの受け取りでも提示する。身分証の代わりにもなる。"],
    "国際運転免許証": ["drive", "海外で運転するには、日本の免許証とあわせて必要な国が多い。出発前に運転免許センターなどで発行。"],
    "ETCカード": ["drive", "高速道路の料金所を止まらずに通れて、ETC割引も受けられる。レンタカーでも車載器に挿せば使える。"],
    "車検証・自賠責保険証（車内）": ["drive", "運転するときは車内に備えておく決まり。出発前に入っているか確認。"],
    "レンタカーの予約確認": ["drive", "受け取りのカウンターで予約番号を伝える。補償の内容もここで確認できる。"],
    "スマホホルダー": ["drive", "スマホをナビにするなら固定して使う。運転中に手で持って操作するのは違反。"],
    "車載USB充電器": ["drive", "ナビで電池が減りやすいスマホを、走りながら充電できる。"],
    "駐車場の予約・場所メモ": ["drive", "観光地やホテルの駐車場は満車になりやすい。予約や場所の確認を事前に。"],
    "乗換案内アプリ": ["station", "知らない土地の電車・バスの乗り継ぎと、最終便の時間を調べられる。"],
    "小銭（バス運賃用）": ["station", "地方の路線バスは交通系ICが使えないことがある。お札の両替が必要な車両も。"],
    "新幹線のきっぷ・予約画面": ["station", "改札で使うきっぷやQRコード。紙のきっぷは座席に置き忘れやすいので注意。"],
    "タクシー配車アプリ": ["station", "流しのタクシーが少ない地方や夜でも、呼んで乗れる。行き先を口で伝えなくて済む。"],
    "レンタサイクルのアプリ・会員登録": ["drive", "駐輪ポートで借りるには登録が必要なことが多い。出発前に済ませると現地ですぐ乗れる。"],
    "乗船券・予約画面": ["station", "乗船の手続きで提示する。連休などの混む時期は予約しておくと安心。"],
    "酔い止め": ["station", "船やバスの揺れに備えて。乗る30分ほど前に飲むと効きやすい。"],
  };
  const SCENES = [
    { id: "home", day: 1, time: "出発の朝", title: "家を出る前に", line: "玄関を出たら戻れません。いつも身に着けて持ち歩く物を、まず確認します。" },
    { id: "station", day: 1, time: "移動中", title: "駅・移動中", line: "改札を通って、電車やバスで目的地へ。移動中に使う物は手元に置きます。" },
    { id: "drive", day: 1, time: "移動中", title: "車・自転車で移動", line: "ハンドルを握る前に、運転に必要な物がそろっているか確認しよう。" },
    { id: "airport", day: 1, time: "空港", title: "空港で", line: "チェックインと保安検査。手荷物に入れる物と預ける物の分け方がポイントです。" },
    { id: "abroad", day: 1, time: "到着後すぐ", title: "現地に到着", line: "入国したら、まず通信・お金・電源を確保します。" },
    { id: "work", day: 1, time: "日中", title: "仕事の時間", line: "訪問先や会議室で、すぐ取り出せるようにまとめておきます。" },
    { id: "sightseeing", day: 1, time: "日中", title: "街を歩く", line: "一日じゅう歩き回る日。天気の急変や靴ずれにも備えます。" },
    { id: "outdoor", day: 1, time: "日中", title: "外で遊ぶ", line: "日差しや虫、天気から身を守る物を持っていきます。" },
    { id: "cold", day: 1, time: "朝晩の外出", title: "寒さの中で", line: "朝晩は特に冷え込みます。重ね着で調節できるように。" },
    { id: "kids", day: null, time: "旅のあいだずっと", title: "子どもと一緒に", line: "子どもの物は「多めに・すぐ出せる場所に」が基本です。" },
    { id: "onsen", day: 1, time: "夕方", title: "温泉へ", line: "湯上がりまでを思い浮かべて、持っていく物を決めます。" },
    { id: "hotel", day: 1, time: "夜", title: "宿での夜", line: "お風呂、充電、明日の準備。夜に使う物がそろっているか確認します。" },
    { id: "morning", day: 2, time: "朝", title: "翌朝の身支度", line: "鏡の前で使う物と、今日の着替え。" },
    { id: "back", day: "last", time: "帰り道", title: "家に帰るまで", line: "帰ってからの手続きまでが旅。最後に使う物です。" },
    { id: "custom", day: null, time: "いつでも", title: "自分で追加した持ち物", line: "テンプレートにない、あなたの旅だけの持ち物です。" },
  ];
  const SCENE_BY_ID = Object.fromEntries(SCENES.map(s => [s.id, s]));
  function sceneOf(t, item) {
    const s = KB[item.name] ? KB[item.name][0] : "custom";
    return t.nights === 0 && (s === "hotel" || s === "morning") ? "station" : s;
  }
  const whyOf = item => (KB[item.name] ? KB[item.name][1] : "この旅のためにあなたが加えた持ち物です。");
  function whenText(t, s) {
    if (!s.day) return s.time;
    const n = s.day === "last" ? t.nights + 1 : s.day;
    return `${n}日目 ${fmt(addDays(t.start, n - 1))} · ${s.time}`;
  }

  // ---- シーンのイラスト（viewBox 320×200） ----
  const ILL = {
    home: `<rect class="sky" width="320" height="200"/><circle class="a" cx="262" cy="44" r="18"/><rect class="gnd" y="158" width="320" height="42"/>
      <rect class="p ln" x="70" y="80" width="130" height="80"/><path class="c ln" d="M56 86 L135 32 L214 86 Z"/><rect class="w ln" x="84" y="98" width="26" height="22"/>
      <rect class="n" x="140" y="108" width="32" height="52"/><path class="b ln" d="M172 108 L186 114 L186 160 L172 160 Z"/>
      <rect class="b ln" x="222" y="114" width="42" height="44" rx="6"/><path class="st" d="M234 114 v-10 h18 v10 M236 126 v22 M250 126 v22"/>
      <circle class="k" cx="231" cy="162" r="3.5"/><circle class="k" cx="255" cy="162" r="3.5"/>`,
    station: `<rect class="sky" width="320" height="200"/><ellipse class="p" cx="70" cy="40" rx="30" ry="10"/><ellipse class="p" cx="84" cy="32" rx="16" ry="10"/>
      <rect class="m" y="150" width="320" height="50"/><path class="st" d="M0 162 H320"/>
      <rect class="p ln" x="16" y="76" width="236" height="68" rx="20"/><rect class="b" x="18" y="116" width="232" height="10"/>
      <rect class="w ln" x="46" y="88" width="32" height="20" rx="3"/><rect class="w ln" x="92" y="88" width="32" height="20" rx="3"/><rect class="w ln" x="138" y="88" width="32" height="20" rx="3"/><rect class="w ln" x="184" y="88" width="32" height="20" rx="3"/>
      <path class="w ln" d="M226 88 h12 q8 0 8 10 v10 h-20 z"/><circle class="k" cx="60" cy="148" r="7"/><circle class="k" cx="208" cy="148" r="7"/>
      <rect class="c ln" x="272" y="104" width="24" height="46" rx="4"/><rect class="a ln" x="276" y="94" width="20" height="13" rx="2"/>`,
    drive: `<rect class="sky" width="320" height="200"/><circle class="a" cx="268" cy="40" r="16"/>
      <path class="g" d="M0 130 Q80 96 160 120 T320 110 V200 H0 Z"/><rect class="m" y="142" width="320" height="58"/>
      <path class="stp" style="opacity:1" d="M10 176 h30 M70 176 h30 M130 176 h30 M190 176 h30 M250 176 h30"/>
      <path class="c ln" d="M60 152 V130 q0 -6 6 -8 l22 -4 l16 -18 q4 -4 10 -4 h52 q6 0 10 4 l18 20 l18 2 q8 2 8 10 V152 Z"/>
      <path class="w ln" d="M110 116 l10 -14 h24 v14 z"/><path class="w ln" d="M150 102 h16 q4 0 6 3 l10 11 h-32 z"/>
      <rect class="w" x="208" y="132" width="10" height="6" rx="2"/>
      <circle class="k" cx="92" cy="154" r="12"/><circle class="m" cx="92" cy="154" r="5"/><circle class="k" cx="184" cy="154" r="12"/><circle class="m" cx="184" cy="154" r="5"/>
      <path class="st" d="M262 124 v20 M284 124 v20"/><rect class="b ln" x="250" y="98" width="46" height="26" rx="3"/>
      <text x="273" y="116" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="sans-serif">ETC</text>`,
    airport: `<rect class="sky" width="320" height="200"/><ellipse class="p" cx="250" cy="40" rx="34" ry="10"/><ellipse class="p" cx="268" cy="32" rx="18" ry="10"/>
      <rect class="gnd" y="166" width="320" height="34"/><rect class="p ln" x="252" y="96" width="18" height="70"/><path class="b ln" d="M240 74 h42 l-6 22 h-30 z"/>
      <g transform="rotate(-10 130 90)"><path class="b ln" d="M62 80 L44 50 L62 50 L88 80 Z"/>
      <path class="p ln" d="M36 92 Q46 76 74 76 L196 76 Q222 78 232 90 Q222 102 196 104 L74 104 Q46 104 36 92 Z"/>
      <path class="b ln" d="M118 94 L158 94 L128 136 L106 136 Z"/><path class="b ln" d="M210 82 q12 2 18 8 h-18 z"/>
      <circle class="w" cx="100" cy="87" r="3.5"/><circle class="w" cx="115" cy="87" r="3.5"/><circle class="w" cx="130" cy="87" r="3.5"/><circle class="w" cx="145" cy="87" r="3.5"/><circle class="w" cx="160" cy="87" r="3.5"/><circle class="w" cx="175" cy="87" r="3.5"/></g>`,
    abroad: `<rect class="sky" width="320" height="200"/><circle class="water ln" cx="112" cy="104" r="62"/>
      <path class="g" d="M78 64 q18-10 30 4 q-4 16 -20 18 q-16 -4 -10 -22z"/><path class="g" d="M120 110 q22-8 34 6 q2 22 -18 30 q-20-10 -16-36z"/><path class="g" d="M66 118 q10-4 16 6 q-4 10 -14 8z"/>
      <ellipse class="st" cx="112" cy="104" rx="26" ry="62"/><path class="st" d="M50 104 H174"/>
      <rect class="k" x="226" y="72" width="7" height="22" rx="1"/><rect class="k" x="247" y="72" width="7" height="22" rx="1"/>
      <rect class="p ln" x="214" y="90" width="52" height="46" rx="10"/><circle class="a" cx="240" cy="113" r="6"/><path class="st" d="M240 136 q0 30 44 36"/>`,
    work: `<rect class="wall" width="320" height="200"/><rect class="m" y="168" width="320" height="32"/>
      <rect class="p ln" x="26" y="26" width="140" height="88" rx="4"/><rect class="b" x="46" y="74" width="18" height="28"/><rect class="a" x="74" y="58" width="18" height="44"/><rect class="c" x="102" y="44" width="18" height="58"/><path class="st" d="M40 102 H150"/>
      <rect class="wood ln" x="150" y="138" width="156" height="12" rx="2"/><path class="st" d="M162 150 V168 M294 150 V168"/>
      <rect class="k" x="192" y="96" width="66" height="40" rx="3"/><rect class="b" x="197" y="101" width="56" height="30"/><rect class="m ln" x="182" y="134" width="86" height="5" rx="2"/>
      <rect class="p ln" x="276" y="116" width="16" height="20" rx="3"/><rect class="p ln" x="158" y="126" width="22" height="12" rx="1"/>`,
    sightseeing: `<rect class="sky" width="320" height="200"/><ellipse class="p" cx="60" cy="40" rx="30" ry="10"/><ellipse class="p" cx="76" cy="32" rx="16" ry="10"/>
      <path class="g" d="M0 150 Q70 104 150 140 T320 128 V200 H0 Z"/>
      <path class="st" d="M210 24 V46"/><rect class="c ln" x="196" y="50" width="28" height="22"/><rect class="c ln" x="190" y="78" width="40" height="24"/><rect class="c ln" x="186" y="108" width="48" height="28"/><rect class="c ln" x="182" y="142" width="56" height="26"/>
      <path class="n ln" d="M180 52 H240 L230 44 H190 Z"/><path class="n ln" d="M176 80 H244 L232 72 H188 Z"/><path class="n ln" d="M172 110 H248 L236 102 H184 Z"/><path class="n ln" d="M168 144 H252 L240 136 H180 Z"/>
      <rect class="wood" x="72" y="128" width="8" height="34"/><circle class="g ln" cx="76" cy="116" r="22"/>
      <path class="sand" d="M110 200 Q140 176 200 168 L222 168 Q186 178 166 200 Z"/>`,
    outdoor: `<rect class="sky" width="320" height="200"/><circle class="a" cx="60" cy="46" r="20"/><rect class="water" y="104" width="320" height="50"/>
      <path class="stp" d="M20 120 q10-6 20 0 t20 0 M120 132 q10-6 20 0 t20 0 M230 118 q10-6 20 0 t20 0"/>
      <path class="sand" d="M0 146 Q160 128 320 150 V200 H0 Z"/><path class="st" d="M218 96 L206 180"/>
      <path class="c ln" d="M170 104 Q218 50 266 104 Q242 94 218 104 Q194 94 170 104 Z"/>
      <circle class="a ln" cx="110" cy="168" r="12"/><path class="st" d="M98 168 H122"/>`,
    cold: `<rect class="sky" width="320" height="200"/><path class="m ln" d="M10 172 L104 56 L198 172 Z"/><path class="p" d="M104 56 L82 83 L94 78 L104 90 L116 78 L126 83 Z"/>
      <path class="m ln" d="M140 172 L222 82 L304 172 Z"/><path class="p" d="M222 82 L204 102 L214 98 L222 108 L232 98 L242 102 Z"/><rect class="p" y="166" width="320" height="34"/>
      <g class="p"><circle cx="40" cy="40" r="3"/><circle cx="150" cy="30" r="4"/><circle cx="260" cy="46" r="3"/><circle cx="200" cy="20" r="3"/><circle cx="80" cy="120" r="3"/><circle cx="290" cy="120" r="3"/><circle cx="30" cy="96" r="3"/><circle cx="176" cy="66" r="3"/></g>`,
    kids: `<rect class="sky" width="320" height="200"/><rect class="gnd" y="160" width="320" height="40"/>
      <path class="st" d="M90 112 Q96 140 122 160 M130 96 Q128 130 124 160 M170 114 Q156 140 126 160"/>
      <ellipse class="c ln" cx="90" cy="88" rx="20" ry="24"/><ellipse class="a ln" cx="130" cy="72" rx="20" ry="24"/><ellipse class="b ln" cx="170" cy="90" rx="20" ry="24"/>
      <rect class="a ln" x="210" y="130" width="30" height="30"/><rect class="b ln" x="242" y="130" width="30" height="30"/><rect class="c ln" x="226" y="100" width="30" height="30"/>`,
    onsen: `<rect class="n" width="320" height="200"/><circle class="a" cx="262" cy="42" r="16"/>
      <ellipse class="water ln" cx="150" cy="150" rx="120" ry="30"/>
      <ellipse class="m ln" cx="40" cy="146" rx="26" ry="16"/><ellipse class="m ln" cx="262" cy="150" rx="28" ry="16"/><ellipse class="m ln" cx="232" cy="170" rx="22" ry="12"/>
      <path class="stp" d="M110 118 q-10-14 0-28 t0-28 M150 114 q-10-14 0-28 t0-28 M190 118 q-10-14 0-28 t0-28"/>
      <path class="wood ln" d="M58 168 h40 l-4 24 h-32 z"/>`,
    hotel: `<rect class="wall" width="320" height="200"/><rect class="n ln" x="196" y="26" width="96" height="70" rx="4"/>
      <circle class="a" cx="266" cy="52" r="12"/><circle class="n" cx="272" cy="48" r="11"/><path class="st" d="M228 26 V96"/>
      <rect class="m" y="178" width="320" height="22"/><rect class="wood ln" x="20" y="96" width="14" height="82"/>
      <rect class="p ln" x="30" y="132" width="200" height="30" rx="4"/><rect class="b ln" x="90" y="124" width="140" height="30" rx="6"/><rect class="p ln" x="38" y="116" width="46" height="18" rx="8"/>
      <path class="st" d="M40 162 V178 M222 162 V178"/>
      <rect class="wood ln" x="250" y="146" width="44" height="32"/><path class="st" d="M282 146 V124"/><path class="a ln" d="M268 124 h28 l-6 -20 h-16 z"/><rect class="k" x="256" y="140" width="14" height="6" rx="1"/>`,
    morning: `<rect class="wall" width="320" height="200"/><rect class="sky ln" x="232" y="24" width="70" height="60" rx="4"/><circle class="a" cx="276" cy="62" r="12"/><path class="st" d="M232 54 H302 M267 24 V84"/>
      <ellipse class="water ln" cx="120" cy="70" rx="46" ry="52"/><path class="stp" d="M96 52 l18-18 M102 72 l28-28"/>
      <rect class="m" y="184" width="320" height="16"/><path class="p ln" d="M60 150 h120 l-16 34 h-88 z"/><rect class="p ln" x="50" y="128" width="140" height="22" rx="4"/><path class="st" d="M120 128 V114 h12"/>
      <path class="st" d="M166 108 l-6 -20 M172 108 l4 -22"/><rect class="c ln" x="160" y="106" width="18" height="22" rx="3"/>`,
    back: `<rect class="dusk" width="320" height="200"/><circle class="a" cx="70" cy="140" r="22"/><rect class="gnd" y="150" width="320" height="50"/>
      <rect class="p ln" x="150" y="80" width="120" height="74"/><path class="c ln" d="M138 86 L210 38 L282 86 Z"/>
      <rect class="w ln" x="166" y="98" width="26" height="22"/><rect class="w ln" x="228" y="98" width="26" height="22"/><rect class="n" x="198" y="116" width="24" height="38"/>
      <rect class="b ln" x="104" y="126" width="34" height="34" rx="5"/><path class="st" d="M114 126 v-8 h14 v8"/>
      <path class="p ln" d="M30 40 h44 v62 l-5.5 -4 l-5.5 4 l-5.5 -4 l-5.5 4 l-5.5 -4 l-5.5 4 l-5.5 -4 l-5.5 4 z"/><path class="st" d="M38 54 h28 M38 66 h28 M38 78 h18"/>`,
    custom: `<rect class="wall" width="320" height="200"/><rect class="p ln" x="80" y="30" width="150" height="140" rx="6"/>
      <path class="st" d="M116 64 h94 M116 88 h94 M116 112 h94 M116 136 h60"/>
      <rect class="p ln" x="96" y="56" width="12" height="12" rx="2"/><rect class="p ln" x="96" y="80" width="12" height="12" rx="2"/><rect class="p ln" x="96" y="104" width="12" height="12" rx="2"/><rect class="p ln" x="96" y="128" width="12" height="12" rx="2"/>
      <g transform="rotate(35 250 100)"><rect class="a ln" x="242" y="40" width="16" height="110"/><path class="wood ln" d="M242 150 h16 l-8 18 z"/></g>`,
    done: `<rect class="sky" width="320" height="200"/><rect class="gnd" y="160" width="320" height="40"/>
      <rect class="b ln" x="104" y="64" width="112" height="96" rx="12"/><path class="st" d="M140 64 v-16 h40 v16 M130 64 v96 M190 64 v96"/>
      <circle class="k" cx="124" cy="164" r="5"/><circle class="k" cx="196" cy="164" r="5"/>
      <circle class="g ln" cx="232" cy="64" r="24"/><path class="stp" style="stroke-width:4;opacity:1" d="M220 64 l8 8 l16 -16"/>`,
  };
  function illustration(id, label) {
    const box = h("div", { class: "ill", role: "img", "aria-label": label });
    box.innerHTML = `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${ILL[id]}</svg>`;
    return box;
  }
  function checkSvg() {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 16 16");
    s.innerHTML = '<path d="M3 8.5l3.2 3L13 4.5"/>';
    return s;
  }

  // ---- 当日シミュレーション ----
  function openSim(t) {
    const root = document.getElementById("sim-root");
    const by = {};
    t.cats.forEach(c => c.items.forEach(i => { const s = sceneOf(t, i); (by[s] = by[s] || []).push(i); }));
    const slides = SCENES.filter(s => by[s.id]).map(s => Object.assign({}, s, { items: by[s.id] }));
    slides.push({ id: "done", title: "出発の準備" });
    let idx = 0;

    const simItem = i => {
      const li = h("li", { class: "sim-item" + (i.done ? " done" : "") });
      const cb = h("input", {
        type: "checkbox", id: "s-" + i.id, checked: i.done,
        onchange: () => { i.done = cb.checked; li.classList.toggle("done", i.done); commit(); },
      });
      li.append(h("label", { for: "s-" + i.id },
        cb, h("span", { class: "box", "aria-hidden": "true" }, checkSvg()),
        h("span", { class: "txt" },
          h("b", { text: i.name + (i.qty ? ` ×${i.qty}` : "") }),
          h("span", { class: "why", text: whyOf(i) }),
        ),
      ));
      return li;
    };

    const stage = h("div", { class: "sim-stage" });
    const dots = h("div", { class: "sim-dots" });
    const counter = h("span", { class: "sim-counter" });
    const prev = h("button", { class: "btn", onclick: () => go(idx - 1) }, "← 前へ");
    const next = h("button", { class: "btn primary", onclick: () => (idx === slides.length - 1 ? close() : go(idx + 1)) });

    function close() {
      root.replaceChildren();
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    }
    function onKey(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(idx + 1);
      else if (e.key === "ArrowLeft") go(idx - 1);
    }
    function go(n) {
      if (n < 0 || n >= slides.length) return;
      idx = n;
      draw();
      stage.scrollTop = 0;
    }
    function draw() {
      const s = slides[idx];
      let body;
      if (s.id === "done") {
        const open = [];
        t.cats.forEach(c => c.items.forEach(i => { if (!i.done) open.push(i); }));
        body = h("article", { class: "slide" },
          illustration("done", "閉じたスーツケース"),
          h("div", {},
            h("p", { class: "when", text: `${stayLabel(t.nights)} のシミュレーション完了` }),
            h("h2", { text: open.length ? `あと ${open.length} 個です` : "準備完了。いってらっしゃい！" }),
            guide(open.length ? "alert" : "happy", open.length
              ? "まだチェックしていない持ち物だよ。ここでチェックしてもOK！"
              : `全部そろったね！${t.dest || "旅"}、楽しんできてね。いってらっしゃい！`, 64),
            open.length > 0 && h("ul", { class: "sim-items" }, open.map(simItem)),
          ));
      } else {
        body = h("article", { class: "slide" },
          illustration(s.id, s.title + "のイラスト"),
          h("div", {},
            h("p", { class: "when", text: whenText(t, s) }),
            h("h2", { text: s.title }),
            guide("normal", s.line, 64),
            h("ul", { class: "sim-items" }, s.items.map(simItem)),
          ));
      }
      stage.replaceChildren(body);
      dots.replaceChildren(...slides.map((x, i) => h("button", {
        class: "dot", "aria-current": i === idx ? "step" : false, "aria-label": `${i + 1}枚目：${x.title}`, onclick: () => go(i),
      })));
      counter.textContent = `${idx + 1} / ${slides.length}`;
      prev.disabled = idx === 0;
      next.textContent = idx === slides.length - 1 ? "リストに戻る" : "次へ →";
    }

    let sx = 0, sy = 0;
    stage.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1));
    });

    const closeBtn = h("button", { class: "btn", onclick: close }, "閉じる");
    root.replaceChildren(h("div", { class: "sim", role: "dialog", "aria-modal": "true", "aria-label": "当日シミュレーション" },
      h("div", { class: "sim-head" },
        h("span", { class: "ttl" }, "当日シミュレーション", h("small", { text: `${t.dest || t.name} ${stayLabel(t.nights)}` })),
        closeBtn,
      ),
      stage,
      h("div", { class: "sim-foot" }, prev, dots, counter, next),
    ));
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    draw();
    closeBtn.focus();
  }

  // ---- アンケート ----
  // 回答は feedback/<回答者のid> に貯める。読めるのはオーナーだけ（公開時のルールで制限）
  // ご意見・お問い合わせは Google フォームで受け付ける
  const FEEDBACK_FORM_URL = "https://forms.gle/oAMbF6xqAhsEe7yq9";
  const FEATURES = ["持ち物リストの自動作成", "チェック・進み具合", "当日シミュレーション", "いつ使う？の表示", "スマホ・PCの同期", "テキストでコピー"];
  const RATE_LABEL = ["", "不満", "やや不満", "ふつう", "満足", "とても満足"];

  // 修正案・お問い合わせの送り先：WordPress 版は管理者メール、公開サイトは Formspree（firebase-config.js で設定）
  const contactEndpoint = () => {
    const u = window.CONTACT_FORM_ENDPOINT;
    return typeof u === "string" && /^https:\/\/formspree\.io\/f\/\w+/.test(u) ? u : null;
  };
  const canContact = () => !!(window.MOCHIMONO_WP || contactEndpoint());
  async function sendContact(msg) {
    if (window.MOCHIMONO_WP) return wpFetch("contact", { method: "POST", body: msg });
    const res = await fetch(contactEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.assign({ _subject: `【持ち物チェックリスト】${msg.kind}` }, msg)),
    });
    if (!res.ok) throw { code: "http_" + res.status };
  }
  const CONTACT_KINDS = ["修正案", "不具合の報告", "お問い合わせ"];

  function openFeedback(tab) {
    const root = document.getElementById("sheet-root");
    const onKey = e => { if (e.key === "Escape") close(); };
    const close = () => { root.replaceChildren(); document.removeEventListener("keydown", onKey); };
    document.addEventListener("keydown", onKey);

    const tabs = [
      ["survey", "アンケート", () => showForm()],
      canContact() && ["contact", "修正案・お問い合わせ", () => showContact()],
      isOwner && ["results", "回答を見る", () => showResults()],
    ].filter(Boolean);
    const first = tabs.find(t => t[0] === tab) || tabs[0];
    const body = h("div", { class: "fb-body" });
    const sheet = h("div", { class: "sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "fb-title" },
      h("div", { class: "fb-head" },
        h("h2", { id: "fb-title", text: canContact() ? "ご意見・お問い合わせ" : "アンケート" }),
        tabs.length > 1 && h("div", { class: "seg fb-tabs", style: `grid-template-columns: repeat(${tabs.length}, minmax(0, 1fr))` },
          tabs.map(([k, label, show]) => h("label", {},
            h("input", { type: "radio", name: "fb-tab", id: "fb-tab-" + k, checked: k === first[0], onchange: show }),
            h("span", { text: label })))),
      ),
      body,
    );

    function showContact() {
      const msg = { kind: CONTACT_KINDS[0], message: "", email: "", _gotcha: "" };
      const err = h("p", { class: "fb-err", role: "alert" });
      const kinds = h("div", { class: "chips" }, CONTACT_KINDS.map((k, i) =>
        h("label", { class: "chip" }, h("input", {
          type: "radio", name: "ct-kind", id: "ct-kind-" + i, checked: i === 0, onchange: () => { msg.kind = k; },
        }), h("span", { text: k }))));
      const text = h("textarea", {
        id: "ct-message", rows: "5", maxlength: "2000", required: true,
        placeholder: "例：持ち物に「爪切り」を追加してほしい／スマホで〇〇ボタンが押せない など",
        oninput: e => { msg.message = e.target.value; err.textContent = ""; },
      });
      const mail = h("input", {
        type: "email", id: "ct-email", autocomplete: "email", placeholder: "返信が必要な場合のみ",
        oninput: e => { msg.email = e.target.value.trim(); },
      });
      // いたずら送信よけ（人には見えない欄。入力されていたら送らない）
      const trap = h("input", { type: "text", name: "_gotcha", tabindex: "-1", autocomplete: "off", class: "ct-trap", "aria-hidden": "true", oninput: e => { msg._gotcha = e.target.value; } });
      const sendBtn = h("button", { type: "submit", class: "btn primary" }, "送信する");

      const submit = async e => {
        e.preventDefault();
        if (!msg.message.trim()) { err.textContent = "内容を入力してください。"; return; }
        if (msg._gotcha) return;
        sendBtn.disabled = true; sendBtn.textContent = "送信中…";
        try {
          await sendContact({ kind: msg.kind, message: msg.message.trim().slice(0, 2000), email: msg.email, page: location.href });
          body.replaceChildren(h("div", { class: "fb-thanks" },
            h("p", { class: "fb-thanks-title", text: "送信しました" }),
            guide("happy", msg.email
              ? "ありがとう！内容を確認して、必要なら入力してくれたアドレスに返事するね。"
              : "ありがとう！いただいた内容は、作成者がしっかり読むよ。", 72),
            h("div", { class: "sheet-actions" }, h("button", { type: "button", class: "btn primary", onclick: close }, "閉じる")),
          ));
        } catch (x) {
          err.textContent = x && x.code === "http_429"
            ? "短い時間に何度も送信されています。しばらくしてからお試しください。"
            : "送信できませんでした。少し時間をおいて、もう一度お試しください。";
          sendBtn.disabled = false; sendBtn.textContent = "送信する";
        }
      };

      body.replaceChildren(h("form", { class: "fb-form", onsubmit: submit },
        guide("normal", "「この持ち物も入れてほしい」「ここが使いにくい」など、気づいたことを教えてね。作成者に直接届くよ。", 64),
        h("fieldset", { class: "field" }, h("legend", { text: "種類" }), kinds),
        h("label", { class: "field" }, h("span", { text: "内容（必須）" }), text),
        h("label", { class: "field" }, h("span", { text: "返信先のメールアドレス（任意）" }), mail),
        trap,
        err,
        h("div", { class: "sheet-actions" },
          h("button", { type: "button", class: "btn", onclick: close }, "キャンセル"),
          sendBtn,
        ),
      ));
    }

    function showForm() {
      const ans = { rating: 0, useful: [], purpose: "", comment: "" };
      const err = h("p", { class: "fb-err", role: "alert" });
      const rate = h("div", { class: "rate" }, [1, 2, 3, 4, 5].map(n =>
        h("label", { title: RATE_LABEL[n] }, h("input", {
          type: "radio", name: "fb-rate", id: "fb-rate-" + n, value: String(n),
          onchange: () => { ans.rating = n; rateNote.textContent = `${n} — ${RATE_LABEL[n]}`; err.textContent = ""; },
        }), h("span", { text: String(n) }))));
      const rateNote = h("span", { class: "rate-note", text: "1（不満）〜 5（とても満足）" });
      const useful = h("div", { class: "chips" }, FEATURES.map((f, i) =>
        h("label", { class: "chip" }, h("input", {
          type: "checkbox", id: "fb-use-" + i,
          onchange: e => { ans.useful = e.target.checked ? ans.useful.concat(f) : ans.useful.filter(x => x !== f); },
        }), h("span", { text: f }))));
      const purpose = h("div", { class: "chips" }, ["旅行", "出張", "両方"].map(p =>
        h("label", { class: "chip" }, h("input", {
          type: "radio", name: "fb-purpose", id: "fb-p-" + p, onchange: () => { ans.purpose = p; },
        }), h("span", { text: p }))));
      const comment = h("textarea", {
        id: "fb-comment", rows: "4", maxlength: "1000",
        placeholder: "例：持ち物に「爪切り」を入れてほしい、旅の順番を並べ替えたい など",
        oninput: e => { ans.comment = e.target.value; },
      });
      const sendBtn = h("button", { type: "submit", class: "btn primary" }, "送信する");

      const submit = async e => {
        e.preventDefault();
        if (!ans.rating) { err.textContent = "満足度を1〜5から選んでください。"; return; }
        if (!window.MOCHIMONO_WP && !(await ensureFeedbackUser())) {
          err.textContent = firebaseReady()
            ? "送信の準備ができませんでした。少し時間をおいて、もう一度お試しください。"
            : "送信するには、claude.ai にサインインした状態でこのページを開いてください。";
          return;
        }
        sendBtn.disabled = true; sendBtn.textContent = "送信中…";
        try {
          const entry = { at: new Date().toISOString(), rating: ans.rating, useful: ans.useful, purpose: ans.purpose, comment: ans.comment.trim().slice(0, 1000) };
          await saveFeedback(entry);
          body.replaceChildren(h("div", { class: "fb-thanks" },
            h("p", { class: "fb-thanks-title", text: "ご協力ありがとうございました" }),
            guide("happy", "ありがとう！いただいた声で、もっと頼れる持ち物リストにしていくね。", 72),
            h("div", { class: "sheet-actions" }, h("button", { type: "button", class: "btn primary", onclick: close }, "閉じる")),
          ));
        } catch (x) {
          err.textContent = x && x.code === "invalid_argument"
            ? "この共有方法では送信できません。共有した人に「利用者」以上の権限をもらってください。"
            : x && x.code === "http_429"
            ? "短い時間に何度も送信されています。しばらくしてからお試しください。"
            : "送信できませんでした。少し時間をおいて、もう一度お試しください。";
          sendBtn.disabled = false; sendBtn.textContent = "送信する";
        }
      };

      body.replaceChildren(h("form", { class: "fb-form", onsubmit: submit },
        guide("normal", "使ってくれてありがとう！よりよい持ち物リストにしたいから、感想を聞かせてね。回答は作成者だけが読めるよ。", 64),
        h("fieldset", { class: "field" }, h("legend", { text: "1. 満足度（必須）" }), rate, rateNote),
        h("fieldset", { class: "field" }, h("legend", { text: "2. 便利だった機能（いくつでも）" }), useful),
        h("fieldset", { class: "field" }, h("legend", { text: "3. どんな旅で使いましたか" }), purpose),
        h("label", { class: "field" }, h("span", { text: "4. 足りない持ち物・ほしい機能・不便な点" }), comment),
        err,
        h("div", { class: "sheet-actions" },
          h("button", { type: "button", class: "btn", onclick: close }, "キャンセル"),
          sendBtn,
        ),
      ));
    }

    async function showResults() {
      body.replaceChildren(h("p", { class: "start-lead", text: "回答を読み込んでいます…" }));
      let all = [];
      try {
        all = await loadFeedback();
      } catch (x) {
        body.replaceChildren(h("p", { class: "fb-err", text: "回答を読み込めませんでした。少し時間をおいて開き直してください。" }));
        return;
      }
      if (!all.length) {
        body.replaceChildren(h("p", { class: "start-lead", text: "まだ回答はありません。ページを共有すると、使った人がここから回答できます。" }));
        return;
      }
      all.sort((a, b) => (a.at < b.at ? 1 : -1));
      const avg = all.reduce((s, r) => s + (r.rating || 0), 0) / all.length;
      const dist = [5, 4, 3, 2, 1].map(n => [n, all.filter(r => r.rating === n).length]);
      const feat = FEATURES.map(f => [f, all.filter(r => (r.useful || []).includes(f)).length]).sort((a, b) => b[1] - a[1]);
      const bar = (label, n, max) => h("div", { class: "fb-bar" },
        h("span", { class: "fb-bar-label", text: label }),
        h("span", { class: "fb-bar-track" }, h("i", { style: `width:${max ? (n / max) * 100 : 0}%` })),
        h("span", { class: "fb-bar-n", text: String(n) }));
      const maxD = Math.max(...dist.map(d => d[1])), maxF = Math.max(...feat.map(f => f[1]));
      const d2 = s => { const x = new Date(s); return `${x.getMonth() + 1}/${x.getDate()}`; };

      body.replaceChildren(h("div", { class: "fb-results" },
        h("div", { class: "fb-kpis" },
          h("div", {}, h("span", { text: "回答数" }), h("b", { text: String(all.length) })),
          h("div", {}, h("span", { text: "平均満足度" }), h("b", { text: avg.toFixed(1) }, h("small", { text: " / 5" }))),
        ),
        h("section", {}, h("h3", { text: "満足度の分布" }), dist.map(([n, c]) => bar(`${n} ${RATE_LABEL[n]}`, c, maxD))),
        h("section", {}, h("h3", { text: "便利だった機能" }), feat.map(([f, c]) => bar(f, c, maxF))),
        h("section", {}, h("h3", { text: "コメント" }),
          h("ul", { class: "fb-comments" }, all.filter(r => r.comment).map(r =>
            h("li", {},
              h("span", { class: "fb-meta", text: `${d2(r.at)} · 満足度 ${r.rating}${r.purpose ? " · " + r.purpose : ""}` }),
              h("p", { text: r.comment }))))),
      ));
    }

    const overlay = h("div", { class: "overlay", onclick: e => { if (e.target === overlay) close(); } }, sheet);
    root.replaceChildren(overlay);
    first[2]();
    (document.getElementById("fb-rate-1") || document.getElementById("ct-message"))?.focus();
  }
  // ヘッダーの「ご意見・お問い合わせ」が Google フォームへのリンクなら、そのまま開く（サイト内のアンケートは使わない）
  const fbOpen = document.getElementById("fb-open");
  if (fbOpen.tagName !== "A") fbOpen.addEventListener("click", () => openFeedback());
  document.getElementById("brand-mascot").innerHTML = mascotSvg("normal");

  // ---- 新規・編集フォーム ----
  // 新規は最初の画面にそのまま置き、編集はシートで開く
  function openSheet(edit) {
    const root = document.getElementById("sheet-root");
    const onKey = e => { if (e.key === "Escape") close(); };
    const close = () => { root.replaceChildren(); document.removeEventListener("keydown", onKey); };
    document.addEventListener("keydown", onKey);
    const form = tripForm(edit, close);
    const overlay = h("div", { class: "overlay", onclick: e => { if (e.target === overlay) close(); } }, form);
    root.replaceChildren(overlay);
    document.getElementById("f-dest").focus();
  }

  function tripForm(edit, close) {
    const f = edit
      ? { name: edit.name, dest: edit.dest, start: edit.start, nights: edit.nights, purpose: edit.purpose, tags: edit.tags.slice() }
      : { name: "", dest: "", start: addDays(iso(new Date()), 7), nights: 1, purpose: "travel", tags: [] };

    const nightsOut = h("output", { id: "f-nights" });
    const preview = h("p", { class: "preview" });
    // 新規入力のときは、もちこが入力内容に合わせて話しかける
    const helper = edit ? null : guide(...startTip(f), 96, null, true);
    let lastTag = null;
    const update = () => {
      nightsOut.textContent = stayLabel(f.nights);
      if (helper) helper.say(...startTip(f, lastTag));
      preview.replaceChildren("条件に合わせて ", h("b", { text: String(countItems(template(f.purpose, f.nights, f.tags))) }), " 個の持ち物を用意します。あとから追加・削除できます。");
    };

    const nameIn = h("input", { type: "text", id: "f-name", value: f.name, placeholder: "例：大阪出張、夏休みの沖縄", oninput: e => { f.name = e.target.value; } });
    const destIn = h("input", { type: "text", id: "f-dest", value: f.dest, placeholder: "例：大阪", required: true, oninput: e => { f.dest = e.target.value; lastTag = null; update(); } });
    const dateIn = h("input", { type: "date", id: "f-date", value: f.start, oninput: e => { if (e.target.value) f.start = e.target.value; } });

    const seg = h("div", { class: "seg" }, [["travel", "旅行"], ["business", "出張"]].map(([v, l]) =>
      h("label", {}, h("input", {
        type: "radio", name: "f-purpose", id: "f-p-" + v, value: v, checked: f.purpose === v,
        onchange: () => { f.purpose = v; update(); },
      }), h("span", { text: l }))));

    const chipSet = list => h("div", { class: "chips" }, list.map(tg =>
      h("label", { class: "chip" }, h("input", {
        type: "checkbox", id: "f-t-" + tg.k, checked: f.tags.includes(tg.k),
        onchange: e => { f.tags = e.target.checked ? f.tags.concat(tg.k) : f.tags.filter(x => x !== tg.k); lastTag = tg.k; update(); },
      }), h("span", { text: tg.l }))));

    const submit = e => {
      e.preventDefault();
      if (edit) {
        // 編集で新しく選んだ移動手段の持ち物だけを「現地での移動」に足す（消した持ち物は戻さない）
        const added = f.tags.filter(k => !edit.tags.includes(k));
        const have = new Set(edit.cats.flatMap(c => c.items.map(i => i.name)));
        const names = moveItems(added.concat(f.tags.includes("abroad") ? ["abroad"] : [])).filter(n => !have.has(n));
        if (names.length) {
          let c = edit.cats.find(x => x.name === "現地での移動");
          if (!c) { c = { id: uid(), name: "現地での移動", items: [] }; edit.cats.splice(1, 0, c); }
          names.forEach(n => c.items.push({ id: uid(), name: n, qty: null, done: false }));
        }
        Object.assign(edit, { name: f.name.trim(), dest: f.dest.trim(), start: f.start, nights: f.nights, purpose: f.purpose, tags: f.tags, sample: false });
        close(); commit();
        toast(names.length ? `移動手段の持ち物を ${names.length} 個追加しました` : "旅の情報を更新しました");
        return;
      }
      const trip = {
        id: uid(), name: f.name.trim(), dest: f.dest.trim(), start: f.start, nights: f.nights,
        purpose: f.purpose, tags: f.tags, cats: template(f.purpose, f.nights, f.tags),
      };
      state.trips.push(trip);
      ui.activeId = trip.id; saveUi();
      view = "trip"; newForm = null;
      commit(); toast("持ち物リストを作りました");
      window.scrollTo(0, 0);
    };
    const cancel = edit ? close : (state.trips.length ? () => { view = "trip"; newForm = null; render(); } : null);

    const head = edit
      ? [h("h2", { id: "sheet-title", text: "旅の情報を編集" })]
      : [h("h2", { class: "start-title", text: "どこへ行きますか？" }), helper];

    const form = h("form", edit
      ? { class: "sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": "sheet-title", onsubmit: submit }
      : { class: "sheet start", "aria-label": "新しい旅を入力", onsubmit: submit },
      head,
      h("div", { class: "row2" },
        h("label", { class: "field" }, h("span", { text: "行き先" }), destIn),
        h("label", { class: "field" }, h("span", { text: "出発日" }), dateIn),
      ),
      h("label", { class: "field" }, h("span", { text: "旅の名前（任意）" }), nameIn),
      h("div", { class: "row2" },
        h("div", { class: "field" }, h("span", { text: "期間" }),
          h("div", { class: "stepper" },
            h("button", { type: "button", "aria-label": "1泊減らす", onclick: () => { f.nights = Math.max(0, f.nights - 1); update(); } }, "−"),
            nightsOut,
            h("button", { type: "button", "aria-label": "1泊増やす", onclick: () => { f.nights = Math.min(30, f.nights + 1); update(); } }, "＋"),
          )),
        h("fieldset", { class: "field" }, h("legend", { text: "目的" }), seg),
      ),
      !edit && h("fieldset", { class: "field" }, h("legend", { text: "当てはまる条件" }), chipSet(TAGS)),
      h("fieldset", { class: "field" }, h("legend", { text: "現地での移動手段" }), chipSet(MOVES)),
      edit
        ? h("p", { class: "preview", text: "日程や目的を変えても、今の持ち物リストはそのまま残ります。移動手段を新しく選ぶと、必要な持ち物が「現地での移動」に追加されます。" })
        : preview,
      h("div", { class: "sheet-actions" },
        cancel && h("button", { type: "button", class: "btn", onclick: cancel }, "キャンセル"),
        h("button", { type: "submit", class: "btn primary" }, edit ? "保存" : "持ち物リストを作る"),
      ),
    );
    update();
    return form;
  }

  render();
  connect();
})();
