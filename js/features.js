const Storage = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

/* ========== 每日一卡（拓展版） ========== */
const DailyCard = {
  KEY: 'tarot_daily',
  STREAK_KEY: 'tarot_streak',
  HISTORY_KEY: 'tarot_daily_history',

  getTodaySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  },

  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  },

  getTodayCard() {
    const saved = Storage.get(this.KEY);
    const today = this.getTodaySeed();
    if (saved && saved.date === today) return saved;

    const all = TAROT_DATA.all;
    const idx = Math.floor(this.seededRandom(today) * all.length);
    const isReversed = this.seededRandom(today + 1) > 0.7;
    const card = { ...all[idx], isReversed, date: today, drawnAt: new Date().toISOString() };
    Storage.set(this.KEY, card);
    this.updateStreak();
    this.saveToHistory(card);
    return card;
  },

  updateStreak() {
    const today = new Date();
    today.setHours(0,0,0,0);
    const saved = Storage.get(this.STREAK_KEY) || { count: 0, lastDate: null, maxStreak: 0 };
    const last = saved.lastDate ? new Date(saved.lastDate) : null;

    if (last) {
      last.setHours(0,0,0,0);
      const diff = (today - last) / (1000 * 60 * 60 * 24);
      if (diff === 1) saved.count++;
      else if (diff > 1) saved.count = 1;
    } else {
      saved.count = 1;
    }
    if (saved.count > (saved.maxStreak || 0)) saved.maxStreak = saved.count;
    saved.lastDate = today.toISOString();
    Storage.set(this.STREAK_KEY, saved);
    return saved;
  },

  getStreak() {
    return Storage.get(this.STREAK_KEY) || { count: 0, lastDate: null, maxStreak: 0 };
  },

  saveToHistory(card) {
    const history = Storage.get(this.HISTORY_KEY) || [];
    const exists = history.find(h => h.date === card.date);
    if (!exists) {
      history.push({
        date: card.date,
        cardId: card.id,
        name: card.nameCN,
        isReversed: card.isReversed,
        element: card.element
      });
      // Keep last 365 days
      if (history.length > 365) history.shift();
      Storage.set(this.HISTORY_KEY, history);
    }
  },

  getHistory() {
    return Storage.get(this.HISTORY_KEY) || [];
  },

  getMonthData(year, month) {
    const history = this.getHistory();
    const map = {};
    history.forEach(h => {
      const d = String(h.date);
      const y = parseInt(d.slice(0,4));
      const m = parseInt(d.slice(4,6));
      if (y === year && m === month) {
        const day = parseInt(d.slice(6,8));
        map[day] = h;
      }
    });
    return map;
  },

  getLuckyInfo(card) {
    const map = {
      Fire: { color: '#e74c3c', colorCN: '赤红 / 橙色', number: [1,3,9], direction: '南方', advice: '今日宜主动出击，勇敢表达你的想法。' },
      Water: { color: '#3498db', colorCN: '湛蓝 / 深紫', number: [2,6,7], direction: '北方', advice: '今日宜倾听内心，感受情绪流动的指引。' },
      Air: { color: '#f1c40f', colorCN: '明黄 / 银白', number: [4,5,8], direction: '东方', advice: '今日宜理性思考，用文字或沟通理清思路。' },
      Earth: { color: '#27ae60', colorCN: '翠绿 / 琥珀', number: [0,5,10], direction: '西方', advice: '今日宜脚踏实地，关注物质与身体的需要。' }
    };
    return map[card.element] || map.Fire;
  },

  renderBanner() {
    const card = this.getTodayCard();
    const streak = this.getStreak();
    const banner = document.getElementById('daily-banner');
    if (!banner) return;

    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;width:100%">
        <div style="font-size:1.8rem">${card.isReversed ? '🔃' : '✨'}</div>
        <div>
          <div style="color:var(--gold);font-size:.9rem;letter-spacing:.1em">今日神谕 · ${card.nameCN}</div>
          <div style="color:var(--text2);font-size:.75rem;margin-top:.2rem">${card.keywordsCN.join(' · ')}</div>
        </div>
        <div style="margin-left:auto;text-align:right;display:flex;gap:1rem;align-items:center">
          <div>
            <div style="color:var(--gold);font-size:1.2rem;font-weight:bold">${streak.count}</div>
            <div style="color:var(--text2);font-size:.65rem">连续天数</div>
          </div>
          ${streak.maxStreak ? `<div><div style="color:var(--purple2);font-size:1.2rem;font-weight:bold">${streak.maxStreak}</div><div style="color:var(--text2);font-size:.65rem">最高纪录</div></div>` : ''}
        </div>
        <button onclick="DailyCard.toggleDetail()" style="background:none;border:1px solid rgba(201,168,76,.3);color:var(--gold);padding:.3rem .8rem;border-radius:2px;cursor:pointer;font-size:.75rem">展开</button>
      </div>
    `;
    banner.style.display = 'block';
  },

  toggleDetail() {
    const detail = document.getElementById('daily-detail');
    const card = this.getTodayCard();
    if (!detail) return;

    if (detail.style.display === 'block') {
      detail.style.display = 'none';
    } else {
      const lucky = this.getLuckyInfo(card);
      detail.innerHTML = `
        <div style="padding:1.2rem;background:rgba(107,63,160,.08);border:1px solid rgba(155,111,212,.15);border-radius:0 0 4px 4px;margin-top:-1px">
          <!-- 卡牌信息 -->
          <div style="display:flex;gap:1rem;margin-bottom:1rem">
            <div style="width:60px;height:100px;border:2px solid ${card.isReversed ? 'var(--red)' : 'var(--gold)'};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:linear-gradient(160deg,#0a1428,#160a26)">${card.isReversed ? '🔃' : '✨'}</div>
            <div style="flex:1">
              <div style="color:var(--gold);font-size:1rem;margin-bottom:.3rem">${card.nameCN} ${card.name}</div>
              <div style="font-size:.75rem;color:${card.isReversed ? 'var(--red)' : 'var(--gold)'};margin-bottom:.5rem">${card.isReversed ? '逆位 Reversed' : '正位 Upright'}</div>
              <div style="display:flex;gap:.3rem;flex-wrap:wrap">${card.keywordsCN.map(k => `<span style="font-size:.7rem;padding:.15rem .5rem;border:1px solid rgba(201,168,76,.3);border-radius:12px;color:var(--text2)">${k}</span>`).join('')}</div>
            </div>
          </div>

          <!-- 牌义 -->
          <div style="font-size:.85rem;color:var(--text);line-height:1.7;margin-bottom:1rem;padding:.8rem;background:rgba(13,11,26,.5);border-radius:4px;border-left:3px solid var(--gold)">
            ${card.isReversed ? card.meaningReversedCN : card.meaningUprightCN}
          </div>

          <!-- 幸运元素 -->
          <div style="background:rgba(26,26,46,.6);border:1px solid rgba(201,168,76,.2);border-radius:4px;padding:1rem;margin-bottom:1rem">
            <div style="color:var(--gold);font-size:.8rem;letter-spacing:.1em;margin-bottom:.8rem">✦ 今日幸运指引 · Lucky Guide</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:.8rem">
              <div style="display:flex;align-items:center;gap:.5rem">
                <div style="width:24px;height:24px;border-radius:50%;background:${lucky.color};box-shadow:0 0 8px ${lucky.color}80"></div>
                <div><div style="font-size:.7rem;color:var(--text2)">幸运色</div><div style="font-size:.8rem;color:var(--text)">${lucky.colorCN}</div></div>
              </div>
              <div style="display:flex;align-items:center;gap:.5rem">
                <div style="font-size:1.2rem">🔢</div>
                <div><div style="font-size:.7rem;color:var(--text2)">幸运数字</div><div style="font-size:.8rem;color:var(--text)">${lucky.number.join(' · ')}</div></div>
              </div>
              <div style="display:flex;align-items:center;gap:.5rem">
                <div style="font-size:1.2rem">🧭</div>
                <div><div style="font-size:.7rem;color:var(--text2)">幸运方位</div><div style="font-size:.8rem;color:var(--text)">${lucky.direction}</div></div>
              </div>
              <div style="display:flex;align-items:center;gap:.5rem">
                <div style="font-size:1.2rem">⚡</div>
                <div><div style="font-size:.7rem;color:var(--text2)">元素</div><div style="font-size:.8rem;color:var(--text)">${card.elementCN || card.element}</div></div>
              </div>
            </div>
            <div style="margin-top:.8rem;padding:.6rem;background:rgba(201,168,76,.08);border-radius:3px;font-size:.82rem;color:var(--gold2);line-height:1.6;border-left:2px solid var(--gold)">
              💡 ${lucky.advice}
            </div>
          </div>

          <!-- 月历 -->
          <div style="margin-bottom:1rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.8rem">
              <div style="color:var(--gold);font-size:.8rem;letter-spacing:.1em">📅 本月打卡日历</div>
              <div style="display:flex;gap:.5rem">
                <button onclick="DailyCard.changeMonth(-1)" style="background:none;border:1px solid rgba(201,168,76,.3);color:var(--gold);padding:.2rem .5rem;border-radius:2px;cursor:pointer;font-size:.8rem">◀</button>
                <span id="cal-month-label" style="color:var(--text);font-size:.8rem;min-width:80px;text-align:center"></span>
                <button onclick="DailyCard.changeMonth(1)" style="background:none;border:1px solid rgba(201,168,76,.3);color:var(--gold);padding:.2rem .5rem;border-radius:2px;cursor:pointer;font-size:.8rem">▶</button>
              </div>
            </div>
            <div id="daily-calendar"></div>
          </div>

          <!-- 收藏按钮 -->
          <div style="text-align:center">
            <div id="daily-fav-btn" style="display:inline-block"></div>
          </div>
        </div>
      `;
      detail.style.display = 'block';
      this.renderCalendar();
      Favorites.renderFavoriteButton(card.id, 'daily-fav-btn');
    }
  },

  calYear: null,
  calMonth: null,

  changeMonth(delta) {
    this.calMonth += delta;
    if (this.calMonth > 12) { this.calMonth = 1; this.calYear++; }
    if (this.calMonth < 1) { this.calMonth = 12; this.calYear--; }
    this.renderCalendar();
  },

  renderCalendar() {
    const now = new Date();
    if (this.calYear === null) { this.calYear = now.getFullYear(); this.calMonth = now.getMonth() + 1; }

    const label = document.getElementById('cal-month-label');
    if (label) label.textContent = `${this.calYear}年${this.calMonth}月`;

    const container = document.getElementById('daily-calendar');
    if (!container) return;

    const monthData = this.getMonthData(this.calYear, this.calMonth);
    const firstDay = new Date(this.calYear, this.calMonth - 1, 1).getDay();
    const daysInMonth = new Date(this.calYear, this.calMonth, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === this.calYear && today.getMonth() + 1 === this.calMonth;
    const todayDate = today.getDate();

    let html = `
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:.7rem;color:var(--text2);margin-bottom:.3rem">
        <div>日</div><div>一</div><div>二</div><div>三</div>
        <div>四</div><div>五</div><div>六</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
    `;

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      html += `<div></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const data = monthData[d];
      const isToday = isCurrentMonth && d === todayDate;
      let bg = 'rgba(26,26,46,.5)';
      let border = '1px solid rgba(201,168,76,.1)';
      let content = `<span style="font-size:.75rem;color:var(--text2)">${d}</span>`;

      if (data) {
        bg = data.isReversed ? 'rgba(192,57,43,.15)' : 'rgba(201,168,76,.15)';
        border = `1px solid ${data.isReversed ? 'rgba(192,57,43,.4)' : 'rgba(201,168,76,.4)'}`;
        content = `<span style="font-size:.6rem;color:${data.isReversed ? 'var(--red)' : 'var(--gold)'}">${data.name}</span>`;
      }

      if (isToday) {
        border = '2px solid var(--gold)';
      }

      html += `
        <div style="aspect-ratio:1;background:${bg};border:${border};border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:${data ? 'pointer' : 'default'};transition:all .3s"
          onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"
          ${data ? `onclick="DailyCard.showDayDetail(${this.calYear},${this.calMonth},${d})"` : ''}
          title="${data ? data.name + (data.isReversed ? ' 逆位' : ' 正位') : ''}">
          ${isToday ? '<div style="font-size:.55rem;color:var(--gold);margin-bottom:1px">今天</div>' : ''}
          ${content}
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  showDayDetail(year, month, day) {
    const history = this.getHistory();
    const dateKey = year * 10000 + month * 100 + day;
    const record = history.find(h => h.date === dateKey);
    if (!record) return;

    const card = TAROT_DATA.all.find(c => c.id === record.cardId);
    if (!card) return;

    const lucky = this.getLuckyInfo(card);
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');

    content.innerHTML = `
      <div style="color:var(--gold);font-size:1rem;margin-bottom:.5rem">${year}年${month}月${day}日 · 每日神谕</div>
      <div style="display:flex;gap:1rem;margin-bottom:1rem">
        <div style="width:60px;height:100px;border:2px solid ${record.isReversed ? 'var(--red)' : 'var(--gold)'};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;background:linear-gradient(160deg,#0a1428,#160a26)">${record.isReversed ? '🔃' : '✨'}</div>
        <div>
          <div style="color:var(--gold);font-size:1rem">${card.nameCN} ${card.name}</div>
          <div style="font-size:.75rem;color:${record.isReversed ? 'var(--red)' : 'var(--gold)'};margin:.3rem 0">${record.isReversed ? '逆位 Reversed' : '正位 Upright'}</div>
          <div style="display:flex;gap:.3rem;flex-wrap:wrap">${card.keywordsCN.map(k => `<span style="font-size:.7rem;padding:.15rem .5rem;border:1px solid rgba(201,168,76,.3);border-radius:12px;color:var(--text2)">${k}</span>`).join('')}</div>
        </div>
      </div>
      <div style="font-size:.85rem;color:var(--text);line-height:1.7;margin-bottom:1rem">${record.isReversed ? card.meaningReversedCN : card.meaningUprightCN}</div>
      <div style="background:rgba(26,26,46,.6);border:1px solid rgba(201,168,76,.2);border-radius:4px;padding:1rem">
        <div style="color:var(--gold);font-size:.8rem;margin-bottom:.5rem">当日幸运指引</div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem;font-size:.8rem">
          <div><span style="color:var(--text2)">幸运色：</span><span style="color:var(--text)">${lucky.colorCN}</span></div>
          <div><span style="color:var(--text2)">幸运数字：</span><span style="color:var(--text)">${lucky.number.join('·')}</span></div>
          <div><span style="color:var(--text2)">方位：</span><span style="color:var(--text)">${lucky.direction}</span></div>
          <div><span style="color:var(--text2)">元素：</span><span style="color:var(--text)">${card.elementCN || card.element}</span></div>
        </div>
        <div style="margin-top:.5rem;font-size:.82rem;color:var(--gold2)">💡 ${lucky.advice}</div>
      </div>
    `;
    modal.style.display = 'flex';
  },

  requestNotification() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showNotif('已开启每日提醒 ✦');
        }
      });
    }
  },

  scheduleDailyNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    // Check every hour if it's 9 AM and we haven't notified today
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 9) {
        const lastNotify = Storage.get('tarot_last_notify');
        const today = this.getTodaySeed();
        if (lastNotify !== today) {
          new Notification('☽ 塔罗神谕 · 今日卡牌已就绪', {
            body: '今日的神谕卡牌已为你准备好，来看看吧 ✦',
            icon: '✨'
          });
          Storage.set('tarot_last_notify', today);
        }
      }
    }, 3600000); // Check every hour
  }
};

/* ========== 历史统计（拓展版） ========== */
const Stats = {
  KEY: 'tarot_history',
  DAILY_KEY: 'tarot_daily_history',

  addRecord(spreadId, question, cards) {
    const history = Storage.get(this.KEY) || [];
    history.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      spreadId,
      question,
      cards: cards.map(c => ({ id: c.id, name: c.nameCN, isReversed: c.isReversed, position: c.position }))
    });
    if (history.length > 100) history.pop();
    Storage.set(this.KEY, history);
  },

  getHistory() {
    return Storage.get(this.KEY) || [];
  },

  clearHistory() {
    Storage.set(this.KEY, []);
  },

  computeStats() {
    const history = Storage.get(this.KEY) || [];
    const dailyHistory = Storage.get(DailyCard.HISTORY_KEY) || [];

    const stats = {
      totalReadings: history.length,
      totalCards: 0,
      reversedCount: 0,
      spreadCounts: {},
      cardCounts: {},
      elementCounts: { Fire: 0, Water: 0, Air: 0, Earth: 0 },
      suitCounts: { wands: 0, cups: 0, swords: 0, pentacles: 0 },
      dailyCounts: {},
      recent7: [],
      monthlyCounts: {},
      questionThemes: {},
      totalDailyCards: dailyHistory.length,
      dailyStreak: DailyCard.getStreak()
    };

    // Process regular readings
    history.forEach(h => {
      stats.totalCards += h.cards.length;
      stats.spreadCounts[h.spreadId] = (stats.spreadCounts[h.spreadId] || 0) + 1;

      const day = h.date.split('T')[0];
      stats.dailyCounts[day] = (stats.dailyCounts[day] || 0) + 1;

      const month = day.slice(0, 7);
      stats.monthlyCounts[month] = (stats.monthlyCounts[month] || 0) + 1;

      // Extract themes from question
      if (h.question) {
        const themes = ['爱情', '感情', '事业', '工作', '财富', '钱', '健康', '学习', '考试', '家庭', '人际', '选择', '未来'];
        themes.forEach(t => {
          if (h.question.includes(t)) {
            stats.questionThemes[t] = (stats.questionThemes[t] || 0) + 1;
          }
        });
      }

      h.cards.forEach(c => {
        if (c.isReversed) stats.reversedCount++;
        stats.cardCounts[c.name] = (stats.cardCounts[c.name] || 0) + 1;
        const cardData = TAROT_DATA.all.find(a => a.id === c.id);
        if (cardData) {
          if (cardData.element) stats.elementCounts[cardData.element]++;
          if (cardData.suit) stats.suitCounts[cardData.suit]++;
        }
      });
    });

    // Also include daily cards in element/suit stats
    dailyHistory.forEach(h => {
      const cardData = TAROT_DATA.all.find(a => a.id === h.cardId);
      if (cardData) {
        if (cardData.element) stats.elementCounts[cardData.element]++;
        if (cardData.suit) stats.suitCounts[cardData.suit]++;
        stats.cardCounts[h.name] = (stats.cardCounts[h.name] || 0) + 1;
        if (h.isReversed) stats.reversedCount++;
        stats.totalCards++;
      }
    });

    stats.reversedRate = stats.totalCards > 0 ? ((stats.reversedCount / stats.totalCards) * 100).toFixed(1) : 0;
    stats.topCards = Object.entries(stats.cardCounts).sort((a,b) => b[1] - a[1]).slice(0, 8);
    stats.topThemes = Object.entries(stats.questionThemes).sort((a,b) => b[1] - a[1]).slice(0, 5);

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      last7.push({ date: ds.slice(5), count: stats.dailyCounts[ds] || 0 });
    }
    stats.recent7 = last7;

    return stats;
  },

  renderHistoryPanel() {
    const history = this.getHistory();
    const container = document.getElementById('history-list');
    if (!container) return;

    if (history.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:var(--text2);padding:3rem;font-size:.9rem">还没有占卜记录<br>去抽一张牌吧 ✦</div>';
      return;
    }

    container.innerHTML = history.map(h => {
      const spread = SPREADS.find(s => s.id === h.spreadId);
      const date = new Date(h.date);
      const dateStr = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
      return `
        <div class="hist-item" style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem;margin-bottom:.8rem;cursor:pointer;transition:all .3s" onclick="Stats.showDetail(${h.id})" onmouseover="this.style.borderColor='var(--gold)'" onmouseout="this.style.borderColor='rgba(201,168,76,.18)'">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
            <span style="color:var(--gold);font-size:.85rem">${spread ? spread.nameCN : h.spreadId}</span>
            <span style="color:var(--text2);font-size:.7rem">${dateStr}</span>
          </div>
          <div style="color:var(--text2);font-size:.8rem;margin-bottom:.5rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h.question || '无问题'}</div>
          <div style="display:flex;gap:.4rem;flex-wrap:wrap">
            ${h.cards.map(c => `<span style="font-size:.7rem;padding:.15rem .4rem;border-radius:3px;background:${c.isReversed ? 'rgba(192,57,43,.15)' : 'rgba(201,168,76,.1)'};color:${c.isReversed ? 'var(--red)' : 'var(--gold)'};border:1px solid ${c.isReversed ? 'rgba(192,57,43,.3)' : 'rgba(201,168,76,.2)'}">${c.name}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  renderStatsPanel() {
    const stats = this.computeStats();
    const container = document.getElementById('stats-content');
    if (!container) return;

    const maxChart = Math.max(...stats.recent7.map(d => d.count), 1);
    const maxMonthly = Math.max(...Object.values(stats.monthlyCounts), 1);

    container.innerHTML = `
      <!-- Top Stats Cards -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-bottom:1.5rem">
        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem;text-align:center">
          <div style="font-size:1.8rem;color:var(--gold);font-weight:bold">${stats.totalReadings}</div>
          <div style="font-size:.75rem;color:var(--text2);margin-top:.3rem">占卜次数</div>
        </div>
        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem;text-align:center">
          <div style="font-size:1.8rem;color:var(--gold);font-weight:bold">${stats.totalDailyCards}</div>
          <div style="font-size:.75rem;color:var(--text2);margin-top:.3rem">每日一卡</div>
        </div>
        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem;text-align:center">
          <div style="font-size:1.8rem;color:var(--gold);font-weight:bold">${stats.totalCards}</div>
          <div style="font-size:.75rem;color:var(--text2);margin-top:.3rem">总抽牌数</div>
        </div>
        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem;text-align:center">
          <div style="font-size:1.8rem;color:var(--red);font-weight:bold">${stats.reversedRate}%</div>
          <div style="font-size:.75rem;color:var(--text2);margin-top:.3rem">逆位率</div>
        </div>
      </div>

      <!-- Streak Info -->
      ${stats.dailyStreak.count > 0 ? `
      <div style="background:linear-gradient(135deg,rgba(107,63,160,.18),rgba(201,168,76,.08));border:1px solid rgba(155,111,212,.35);border-radius:4px;padding:1rem;margin-bottom:1.5rem;display:flex;justify-content:space-around;align-items:center">
        <div style="text-align:center">
          <div style="font-size:1.5rem;color:var(--gold);font-weight:bold">${stats.dailyStreak.count}</div>
          <div style="font-size:.75rem;color:var(--text2)">当前连续</div>
        </div>
        <div style="font-size:2rem;color:var(--gold)">✦</div>
        <div style="text-align:center">
          <div style="font-size:1.5rem;color:var(--purple2);font-weight:bold">${stats.dailyStreak.maxStreak || stats.dailyStreak.count}</div>
          <div style="font-size:.75rem;color:var(--text2)">最高纪录</div>
        </div>
      </div>` : ''}

      <!-- Weekly Trend -->
      <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem;margin-bottom:1.5rem">
        <div style="color:var(--gold);font-size:.8rem;letter-spacing:.1em;margin-bottom:.8rem">📊 近7天活跃趋势</div>
        <div style="display:flex;align-items:flex-end;gap:.5rem;height:100px;padding-bottom:1.5rem;position:relative">
          ${stats.recent7.map((d, i) => `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:.3rem;height:100%;justify-content:flex-end">
              <div style="width:100%;background:linear-gradient(to top,${d.count > 0 ? 'rgba(201,168,76,.6)' : 'rgba(201,168,76,.1)'},${d.count > 0 ? 'rgba(201,168,76,.2)' : 'rgba(201,168,76,.05)'});border-radius:3px 3px 0 0;transition:height .6s ${i*.05}s;height:${Math.max((d.count / maxChart * 80), 4)}px"></div>
              <span style="font-size:.65rem;color:var(--text2);position:absolute;bottom:0">${d.date}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
        <!-- Top Cards -->
        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem">
          <div style="color:var(--gold);font-size:.8rem;letter-spacing:.1em;margin-bottom:.8rem">🏆 你的本命牌 · Top Cards</div>
          ${stats.topCards.length === 0 ? '<div style="color:var(--text2);font-size:.8rem">暂无数据</div>' : stats.topCards.map((c, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:.5rem 0;border-bottom:1px solid rgba(201,168,76,.1)">
              <div style="display:flex;align-items:center;gap:.5rem">
                <span style="font-size:.7rem;color:var(--text2);width:16px">${i+1}</span>
                <span style="color:var(--text);font-size:.8rem">${c[0]}</span>
              </div>
              <span style="color:var(--gold);font-size:.8rem">${c[1]}次</span>
            </div>
          `).join('')}
        </div>

        <!-- Element Distribution -->
        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem">
          <div style="color:var(--gold);font-size:.8rem;letter-spacing:.1em;margin-bottom:.8rem">🌍 元素分布</div>
          ${Object.entries(stats.elementCounts).map(([el, count]) => {
            const total = Object.values(stats.elementCounts).reduce((a,b) => a+b, 0);
            const pct = total > 0 ? (count/total*100).toFixed(0) : 0;
            const labels = { Fire: '🔥 火', Water: '💧 水', Air: '🌬 风', Earth: '🌍 土' };
            const colors = { Fire: '#e74c3c', Water: '#3498db', Air: '#f1c40f', Earth: '#27ae60' };
            return `<div style="margin-bottom:.7rem">
              <div style="display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.3rem"><span>${labels[el]}</span><span style="color:var(--text2)">${count}张 · ${pct}%</span></div>
              <div style="width:100%;height:8px;background:rgba(201,168,76,.1);border-radius:4px;overflow:hidden">
                <div style="width:${pct}%;height:100%;background:${colors[el]};border-radius:4px;transition:width 1s"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Suit Distribution & Themes -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem">
          <div style="color:var(--gold);font-size:.8rem;letter-spacing:.1em;margin-bottom:.8rem">⚔ 牌组分布</div>
          ${Object.entries(stats.suitCounts).map(([suit, count]) => {
            const total = Object.values(stats.suitCounts).reduce((a,b) => a+b, 0);
            const pct = total > 0 ? (count/total*100).toFixed(0) : 0;
            const labels = { wands: '权杖', cups: '圣杯', swords: '宝剑', pentacles: '星币' };
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid rgba(201,168,76,.1)">
              <span style="color:var(--text);font-size:.8rem">${labels[suit]}</span>
              <span style="color:var(--gold);font-size:.8rem">${count} (${pct}%)</span>
            </div>`;
          }).join('')}
        </div>

        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem">
          <div style="color:var(--gold);font-size:.8rem;letter-spacing:.1em;margin-bottom:.8rem">💭 最常问的主题</div>
          ${stats.topThemes.length === 0 ? '<div style="color:var(--text2);font-size:.8rem">暂无数据</div>' : stats.topThemes.map((t, i) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:.4rem 0;border-bottom:1px solid rgba(201,168,76,.1)">
              <span style="color:var(--text);font-size:.8rem">${t[0]}</span>
              <span style="color:var(--gold);font-size:.8rem">${t[1]}次</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  showDetail(id) {
    const history = this.getHistory();
    const record = history.find(h => h.id === id);
    if (!record) return;

    const spread = SPREADS.find(s => s.id === record.spreadId);
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');

    content.innerHTML = `
      <div style="color:var(--gold);font-size:1rem;margin-bottom:.5rem">${spread ? spread.nameCN : record.spreadId}</div>
      <div style="color:var(--text2);font-size:.8rem;margin-bottom:1rem">${record.question || '无问题'}</div>
      <div style="display:flex;flex-direction:column;gap:.8rem">
        ${record.cards.map((c, i) => {
          const cardData = TAROT_DATA.all.find(a => a.id === c.id);
          const pos = spread && spread.positions[i] ? spread.positions[i].nameCN : `位置${i+1}`;
          return `
            <div style="display:flex;gap:1rem;padding:.8rem;background:rgba(201,168,76,.05);border-radius:4px;border:1px solid rgba(201,168,76,.1)">
              <div style="width:50px;height:80px;border:2px solid var(--gold);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;background:linear-gradient(160deg,#0a1428,#160a26);flex-shrink:0">${c.isReversed ? '🔃' : '✨'}</div>
              <div style="flex:1">
                <div style="font-size:.75rem;color:var(--text2)">${pos}</div>
                <div style="color:var(--gold);font-size:.9rem">${c.name} <span style="color:${c.isReversed ? 'var(--red)' : 'var(--gold)'};font-size:.75rem">${c.isReversed ? '逆位' : '正位'}</span></div>
                <div style="font-size:.8rem;color:var(--text);margin-top:.3rem;line-height:1.5">${c.isReversed ? (cardData?.meaningReversedCN || '') : (cardData?.meaningUprightCN || '')}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    modal.style.display = 'flex';
  }
};

/* ========== 收藏笔记（拓展版） ========== */
const Favorites = {
  KEY: 'tarot_favorites',
  TAGS_KEY: 'tarot_fav_tags',

  getAll() {
    return Storage.get(this.KEY) || [];
  },

  getAllTags() {
    return Storage.get(this.TAGS_KEY) || ['重要', '感悟', '提醒', '灵感'];
  },

  add(cardId, note = '', tags = []) {
    const all = this.getAll();
    const existing = all.find(f => f.cardId === cardId);
    if (existing) {
      existing.note = note;
      existing.tags = tags;
      existing.updatedAt = new Date().toISOString();
    } else {
      all.push({ cardId, note, tags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    Storage.set(this.KEY, all);
  },

  remove(cardId) {
    const all = this.getAll().filter(f => f.cardId !== cardId);
    Storage.set(this.KEY, all);
  },

  isFavorited(cardId) {
    return this.getAll().some(f => f.cardId === cardId);
  },

  getByCardId(cardId) {
    return this.getAll().find(f => f.cardId === cardId);
  },

  toggle(cardId) {
    if (this.isFavorited(cardId)) {
      this.remove(cardId);
      return false;
    } else {
      this.add(cardId);
      return true;
    }
  },

  saveNote(cardId, note, tags = []) {
    this.add(cardId, note, tags);
    showNotif('笔记已保存 ✦');
  },

  search(query) {
    const all = this.getAll();
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(f => {
      const card = TAROT_DATA.all.find(c => c.id === f.cardId);
      if (!card) return false;
      return (card.nameCN + card.name + (f.note || '') + (f.tags || []).join(' ')).toLowerCase().includes(q);
    });
  },

  filterByTag(tag) {
    const all = this.getAll();
    if (!tag) return all;
    return all.filter(f => f.tags && f.tags.includes(tag));
  },

  renderFavoritesPanel() {
    const container = document.getElementById('favorites-list');
    if (!container) return;

    container.innerHTML = `
      <!-- Search & Filter -->
      <div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">
        <input type="text" id="fav-search" placeholder="搜索收藏的牌..." oninput="Favorites.renderFavoritesList()"
          style="flex:1;min-width:150px;padding:.5rem .8rem;background:rgba(13,11,26,.85);border:1px solid rgba(201,168,76,.28);color:var(--text);font-family:Georgia,serif;font-size:.85rem;border-radius:2px;outline:none"
        >
        <select id="fav-tag-filter" onchange="Favorites.renderFavoritesList()"
          style="padding:.5rem .8rem;background:rgba(13,11,26,.85);border:1px solid rgba(201,168,76,.28);color:var(--text);font-family:Georgia,serif;font-size:.85rem;border-radius:2px;outline:none;cursor:pointer"
        >
          <option value="">全部标签</option>
          ${this.getAllTags().map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <div id="favorites-list-inner"></div>
    `;
    this.renderFavoritesList();
  },

  renderFavoritesList() {
    const searchInput = document.getElementById('fav-search');
    const tagFilter = document.getElementById('fav-tag-filter');
    const container = document.getElementById('favorites-list-inner');
    if (!container) return;

    const query = searchInput ? searchInput.value : '';
    const tag = tagFilter ? tagFilter.value : '';

    let favs = this.getAll();
    if (tag) favs = this.filterByTag(tag);
    if (query) favs = this.search(query);

    if (favs.length === 0) {
      container.innerHTML = '<div style="text-align:center;color:var(--text2);padding:3rem;font-size:.9rem">' + (query || tag ? '没有找到匹配的收藏' : '还没有收藏任何卡牌<br>在占卜中点击 ♡ 收藏') + '</div>';
      return;
    }

    container.innerHTML = favs.map(f => {
      const card = TAROT_DATA.all.find(c => c.id === f.cardId);
      if (!card) return '';
      const allTags = this.getAllTags();
      return `
        <div style="background:rgba(26,26,46,.72);border:1px solid rgba(201,168,76,.18);border-radius:4px;padding:1rem;margin-bottom:.8rem">
          <div style="display:flex;gap:1rem;align-items:flex-start">
            <div style="width:50px;height:80px;border:2px solid var(--gold);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;background:linear-gradient(160deg,#0a1428,#160a26);flex-shrink:0;cursor:pointer" onclick="Favorites.showCardDetail(${f.cardId})">✨</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="color:var(--gold);font-size:.9rem;cursor:pointer" onclick="Favorites.showCardDetail(${f.cardId})">${card.nameCN} ${card.name}</div>
                <button onclick="Favorites.remove(${f.cardId}); Favorites.renderFavoritesList(); showNotif('已取消收藏');" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:1rem">✕</button>
              </div>
              <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin:.3rem 0">
                ${card.keywordsCN.map(k => `<span style="font-size:.65rem;padding:.1rem .4rem;border:1px solid rgba(201,168,76,.3);border-radius:12px;color:var(--text2)">${k}</span>`).join('')}
              </div>
              <div style="font-size:.75rem;color:var(--text2);margin-bottom:.3rem">收藏于 ${new Date(f.createdAt).toLocaleDateString('zh-CN')}</div>
            </div>
          </div>

          <!-- Note display -->
          ${f.note ? `<div style="font-size:.85rem;color:var(--text);line-height:1.6;margin:.5rem 0;padding:.6rem;background:rgba(201,168,76,.05);border-radius:3px;border-left:2px solid var(--gold)">
            ${f.note}
          </div>` : ''}

          <!-- Tags display -->
          ${f.tags.length > 0 ? `<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin:.3rem 0">
            ${f.tags.map(t => `<span style="font-size:.7rem;color:var(--purple2);background:rgba(107,63,160,.15);padding:.15rem .5rem;border-radius:12px;cursor:pointer" onclick="document.getElementById('fav-tag-filter').value='${t}';Favorites.renderFavoritesList();">#${t}</span>`).join('')}
          </div>` : ''}

          <!-- Edit area -->
          <div style="margin-top:.8rem;padding-top:.8rem;border-top:1px solid rgba(201,168,76,.1)">
            <div style="margin-bottom:.5rem">
              <textarea id="note-${f.cardId}" placeholder="写下你对这张牌的感悟..." rows="2"
                style="width:100%;padding:.5rem;background:rgba(13,11,26,.85);border:1px solid rgba(201,168,76,.2);color:var(--text);font-family:Georgia,serif;font-size:.85rem;border-radius:2px;resize:vertical;outline:none">${f.note || ''}</textarea>
            </div>
            <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
              <span style="font-size:.75rem;color:var(--text2)">标签：</span>
              <div id="tags-${f.cardId}" style="display:flex;gap:.3rem;flex-wrap:wrap">
                ${allTags.map(t => `
                  <label style="font-size:.75rem;padding:.2rem .5rem;border-radius:3px;cursor:pointer;border:1px solid ${(f.tags||[]).includes(t) ? 'var(--purple2)' : 'rgba(201,168,76,.2)'};background:${(f.tags||[]).includes(t) ? 'rgba(107,63,160,.25)' : 'transparent'};color:${(f.tags||[]).includes(t) ? 'var(--purple2)' : 'var(--text2)'}"
                  >
                    <input type="checkbox" style="display:none" ${(f.tags||[]).includes(t) ? 'checked' : ''} onchange="Favorites.toggleTag(${f.cardId}, '${t}')">
                    ${t}
                  </label>
                `).join('')}
              </div>
              <div style="display:flex;gap:.3rem;margin-left:auto">
                <input type="text" id="new-tag-${f.cardId}" placeholder="新标签" style="width:70px;padding:.3rem .5rem;background:rgba(13,11,26,.85);border:1px solid rgba(201,168,76,.2);color:var(--text);font-size:.75rem;border-radius:2px;outline:none">
                <button onclick="Favorites.addNewTag(${f.cardId})" style="padding:.3rem .6rem;border:1px solid var(--gold);background:rgba(201,168,76,.1);color:var(--gold);cursor:pointer;font-size:.75rem;border-radius:2px">+</button>
              </div>
            </div>
            <div style="text-align:right;margin-top:.5rem">
              <button onclick="Favorites.saveNote(${f.cardId}, document.getElementById('note-${f.cardId}').value)" style="padding:.4rem 1rem;border:1px solid var(--gold);background:rgba(201,168,76,.12);color:var(--gold);cursor:pointer;font-family:Georgia,serif;font-size:.8rem;border-radius:2px">保存笔记</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleTag(cardId, tag) {
    const all = this.getAll();
    const item = all.find(f => f.cardId === cardId);
    if (!item) return;
    if (!item.tags) item.tags = [];
    if (item.tags.includes(tag)) {
      item.tags = item.tags.filter(t => t !== tag);
    } else {
      item.tags.push(tag);
    }
    item.updatedAt = new Date().toISOString();
    Storage.set(this.KEY, all);
    this.renderFavoritesList();
  },

  addNewTag(cardId) {
    const input = document.getElementById(`new-tag-${cardId}`);
    if (!input || !input.value.trim()) return;
    const tag = input.value.trim();
    const allTags = this.getAllTags();
    if (!allTags.includes(tag)) {
      allTags.push(tag);
      Storage.set(this.TAGS_KEY, allTags);
    }
    this.toggleTag(cardId, tag);
    input.value = '';
  },

  showCardDetail(cardId) {
    const card = TAROT_DATA.all.find(c => c.id === cardId);
    if (!card) return;
    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');

    content.innerHTML = `
      <div style="text-align:center;margin-bottom:1rem">
        <div style="width:80px;height:130px;border:2px solid var(--gold);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:2rem;background:linear-gradient(160deg,#0a1428,#160a26);margin:0 auto .5rem">✨</div>
        <div style="color:var(--gold);font-size:1.2rem">${card.nameCN}</div>
        <div style="color:var(--text2);font-size:.9rem">${card.name}</div>
        <div style="display:flex;gap:.3rem;justify-content:center;margin:.5rem 0">
          ${card.keywordsCN.map(k => `<span style="font-size:.75rem;padding:.15rem .5rem;border:1px solid rgba(201,168,76,.3);border-radius:12px;color:var(--text2)">${k}</span>`).join('')}
        </div>
      </div>

      <div style="background:rgba(26,26,46,.5);border:1px solid rgba(201,168,76,.15);border-radius:4px;padding:1rem;margin-bottom:1rem">
        <div style="color:var(--gold);font-size:.85rem;margin-bottom:.5rem">正位含义 · Upright</div>
        <div style="font-size:.85rem;color:var(--text);line-height:1.7">${card.meaningUprightCN}</div>
        <div style="font-size:.8rem;color:var(--text2);margin-top:.3rem;font-style:italic">${card.meaningUpright}</div>
      </div>

      <div style="background:rgba(26,26,46,.5);border:1px solid rgba(192,57,43,.2);border-radius:4px;padding:1rem;margin-bottom:1rem">
        <div style="color:var(--red);font-size:.85rem;margin-bottom:.5rem">逆位含义 · Reversed</div>
        <div style="font-size:.85rem;color:var(--text);line-height:1.7">${card.meaningReversedCN}</div>
        <div style="font-size:.8rem;color:var(--text2);margin-top:.3rem;font-style:italic">${card.meaningReversed}</div>
      </div>

      <div style="display:flex;gap:1rem;justify-content:center">
        <div id="detail-fav-btn"></div>
      </div>
    `;
    modal.style.display = 'flex';
    this.renderFavoriteButton(cardId, 'detail-fav-btn');
  },

  renderFavoriteButton(cardId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const isFav = this.isFavorited(cardId);
    container.innerHTML = `<button onclick="Favorites.toggle(${cardId}); Favorites.renderFavoriteButton(${cardId}, '${containerId}'); showNotif('${isFav ? '已取消收藏' : '已收藏 ♡'}')" style="background:none;border:none;color:${isFav ? 'var(--red)' : 'var(--text2)'};cursor:pointer;font-size:1.5rem;transition:all .3s" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">${isFav ? '♥' : '♡'}</button>`;
  }
};

function showNotif(text) {
  const n = document.getElementById('notif');
  if (!n) return;
  n.textContent = text;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 2500);
}
