const AI_PROVIDERS = {
  proxy: {
    name: 'Kimi 智能解读（免填 Key）',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    keyPrefix: '',
    storageKey: '',
    docsUrl: '',
    buildBody(prompt) {
      return {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: 0.7
      };
    },
    buildHeaders() {
      return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-g0qCfVX5ekBDmzu1QsdLhW4Sn62CObY6EIBbl0eTWe4YnWLx'
      };
    },
    parseStream(data) {
      try {
        const json = JSON.parse(data);
        if (json.choices?.[0]?.delta?.content) {
          return json.choices[0].delta.content;
        }
      } catch (e) {}
      return null;
    }
  },
  anthropic: {
    name: 'Claude (Anthropic)',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-5-sonnet-20241022',
    keyPrefix: 'sk-ant-',
    storageKey: 'tarot_anthropic_key',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    buildBody(prompt) {
      return {
        model: this.model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      };
    },
    buildHeaders(key) {
      return {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      };
    },
    parseStream(data) {
      try {
        const json = JSON.parse(data);
        if (json.type === 'content_block_delta' && json.delta?.text) {
          return json.delta.text;
        }
      } catch (e) {}
      return null;
    }
  },
  moonshot: {
    name: 'Kimi (Moonshot)',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    keyPrefix: 'sk-',
    storageKey: 'tarot_moonshot_key',
    docsUrl: 'https://platform.moonshot.cn/console/api-keys',
    buildBody(prompt) {
      return {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: 0.7
      };
    },
    buildHeaders(key) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      };
    },
    parseStream(data) {
      try {
        const json = JSON.parse(data);
        if (json.choices?.[0]?.delta?.content) {
          return json.choices[0].delta.content;
        }
      } catch (e) {}
      return null;
    }
  }
};

const AIConfig = {
  PROVIDER_KEY: 'tarot_ai_provider',

  getProvider() {
    return localStorage.getItem(this.PROVIDER_KEY) || 'anthropic';
  },

  setProvider(provider) {
    localStorage.setItem(this.PROVIDER_KEY, provider);
  },

  getProviderConfig() {
    return AI_PROVIDERS[this.getProvider()] || AI_PROVIDERS.anthropic;
  },

  getKey(provider) {
    const p = provider || this.getProvider();
    const config = AI_PROVIDERS[p];
    return localStorage.getItem(config.storageKey) || '';
  },

  setKey(provider, key) {
    const p = provider || this.getProvider();
    const config = AI_PROVIDERS[p];
    if (key) localStorage.setItem(config.storageKey, key.trim());
    else localStorage.removeItem(config.storageKey);
  },

  hasKey(provider) {
    return !!this.getKey(provider);
  }
};

function buildPrompt(question, cards, spreadName) {
  const cardDescriptions = cards.map((c, i) => {
    const pos = c.position ? `${c.position.nameCN}（${c.position.name}）` : `第${i+1}张`;
    const orientation = c.isReversed ? '逆位' : '正位';
    const meaning = c.isReversed ? c.meaningReversedCN : c.meaningUprightCN;
    return `${i+1}. ${pos}：${c.nameCN} ${c.name} — ${orientation}
   关键词：${c.keywordsCN.join('、')}
   元素：${c.elementCN || c.element}
   牌义：${meaning}`;
  }).join('\n\n');

  const reversedCards = cards.filter(c => c.isReversed);
  const elementCounts = {};
  cards.forEach(c => { elementCounts[c.element] = (elementCounts[c.element] || 0) + 1; });
  const dominantElement = Object.entries(elementCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || '';

  const elementMap = { Fire: '火', Water: '水', Air: '风', Earth: '土' };

  return `你是一位极具洞察力和共情力的塔罗解读师。你的风格温暖、真诚、有画面感，像一位知心朋友在写信。

## 用户的具体问题
「${question || '想知道自己当下的状态和未来走向'}」

## 牌阵信息
牌阵：${spreadName}
共抽出 ${cards.length} 张牌
主元素：${elementMap[dominantElement] || dominantElement}
逆位牌：${reversedCards.length > 0 ? reversedCards.map(c=>c.nameCN).join('、') : '无'}

## 抽到的牌
${cardDescriptions}

## 你的任务
请基于用户的**具体问题**，结合牌面信息，给出一个深度、个性化、有温度的解读。

### 要求：
1. **直接回答用户的问题** —— 不要只解释每张牌的牌义，要把牌义和用户的问题紧密结合
2. **有画面感** —— 用具体的场景和感受来描述，不要抽象概念
3. **分维度分析** —— 根据问题类型，从相关维度深入分析（感情、事业、人际、内心状态、行动建议）
4. **给出具体建议** —— 不是"保持信心"这种空话，而是"这周可以试着给对方发一条轻松的问候"这种可执行的建议
5. **温暖真诚** —— 像一位懂你的朋友在深夜长谈，既有洞察力又有温度
6. **承认不确定性** —— 塔罗不是算命，而是看见当下的能量。不要说"一定会"，而是说"趋势是""能量指向"

### 输出结构：
先用一段温暖的开场，然后分 2-4 个段落深入分析，最后给一个有力的总结和 2-3 条具体建议。

请用中文回答。`;
}

async function streamDeepReading(cards, spreadId, question, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const provider = AIConfig.getProvider();
  const config = AIConfig.getProviderConfig();
  const apiKey = AIConfig.getKey(provider);

  if (!apiKey && provider !== 'proxy') {
    container.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--text2)">
        <div style="font-size:2rem;margin-bottom:1rem">🔑</div>
        <div style="font-size:.9rem;margin-bottom:.5rem">需要先设置 ${config.name} API Key</div>
        <div style="font-size:.8rem;color:var(--text2);margin-bottom:1rem">在设置面板中选择 AI 提供商并输入 API Key</div>
        <button onclick="openSettings()" style="padding:.6rem 1.2rem;background:rgba(107,63,160,.2);border:1px solid var(--purple2);color:var(--purple2);border-radius:8px;font-size:.85rem;cursor:pointer">去设置</button>
      </div>
    `;
    container.style.display = 'block';
    return;
  }

  const spreadName = SPREADS.find(s => s.id === spreadId)?.nameCN || '自定义牌阵';
  const prompt = buildPrompt(question, cards, spreadName);

  container.innerHTML = `
    <div class="deep-reading-content" id="ai-stream-content">
      <div style="text-align:center;padding:1.5rem">
        <div style="font-size:1.5rem;margin-bottom:.5rem">🔮</div>
        <div style="color:var(--gold);font-size:.85rem;letter-spacing:.1em">${config.name} 正在深度解读中...</div>
        <div style="color:var(--text2);font-size:.75rem;margin-top:.3rem">基于「${question || '你的问题'}」</div>
        <div style="margin-top:1rem;font-size:1.2rem;color:var(--gold)" id="stream-cursor">▋</div>
      </div>
    </div>
  `;
  container.style.display = 'block';

  const contentDiv = document.getElementById('ai-stream-content');

  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: config.buildHeaders(apiKey),
      body: JSON.stringify(config.buildBody(prompt))
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || err.msg || `API 错误 (${response.status})`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    contentDiv.innerHTML = '<div style="padding:1.2rem;line-height:1.9;font-size:.9rem;color:var(--text)" id="stream-text"></div>';
    const textDiv = document.getElementById('stream-text');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;

        const text = config.parseStream(data);
        if (text) {
          fullText += text;
          textDiv.innerHTML = formatMarkdown(fullText) + '<span class="stream-cursor">▋</span>';
          textDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    }

    textDiv.innerHTML = formatMarkdown(fullText);

    const history = Storage.get('tarot_history') || [];
    const lastReading = history[0];
    if (lastReading) {
      lastReading.aiReading = fullText;
      lastReading.aiProvider = provider;
      Storage.set('tarot_history', history);
    }

  } catch (err) {
    contentDiv.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--red)">
        <div style="font-size:1.5rem;margin-bottom:.5rem">⚠️</div>
        <div style="font-size:.9rem">${err.message}</div>
        <div style="font-size:.8rem;color:var(--text2);margin-top:.5rem">请检查 API Key 是否正确，或稍后重试</div>
      </div>
    `;
  }
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--gold)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:var(--text2)">$1</em>')
    .replace(/###\s+(.+)/g, '<div style="color:var(--gold);font-size:.85rem;font-weight:600;margin:1rem 0 .5rem;letter-spacing:.05em">$1</div>')
    .replace(/##\s+(.+)/g, '<div style="color:var(--purple2);font-size:.9rem;font-weight:600;margin:1.2rem 0 .6rem;letter-spacing:.05em">$1</div>')
    .replace(/#\s+(.+)/g, '<div style="color:var(--gold);font-size:1rem;font-weight:600;margin:1.5rem 0 .8rem;text-align:center">$1</div>')
    .replace(/\n\n/g, '</div><div style="margin-bottom:.8rem">')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/gm, '<div>$1</div>');
}

function renderSettingsPanel() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  const currentProvider = AIConfig.getProvider();

  let html = `
    <div style="background:rgba(26,26,46,.6);border:1px solid rgba(201,168,76,.15);border-radius:12px;padding:1.2rem;margin-bottom:1rem">
      <div style="color:var(--gold);font-size:.85rem;font-weight:600;margin-bottom:.8rem">🤖 AI 深度解读设置</div>
      <div style="font-size:.8rem;color:var(--text2);line-height:1.7;margin-bottom:1rem">
        选择 AI 提供商并输入 API Key，即可启用 AI 深度解读。
      </div>

      <!-- Provider Selection -->
      <div style="margin-bottom:1rem">
        <div style="font-size:.75rem;color:var(--text2);margin-bottom:.3rem">选择 AI 提供商</div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          <button onclick="switchProvider('proxy')" class="provider-btn ${currentProvider === 'proxy' ? 'active' : ''}"
            style="flex:1;min-width:120px;padding:.6rem;border:1px solid ${currentProvider === 'proxy' ? 'var(--gold)' : 'rgba(201,168,76,.2)'};background:${currentProvider === 'proxy' ? 'rgba(201,168,76,.1)' : 'transparent'};color:${currentProvider === 'proxy' ? 'var(--gold)' : 'var(--text2)'};border-radius:8px;font-size:.85rem;cursor:pointer"
          >
            ✨ Kimi 智能解读
          </button>
          <button onclick="switchProvider('anthropic')" class="provider-btn ${currentProvider === 'anthropic' ? 'active' : ''}"
            style="flex:1;min-width:120px;padding:.6rem;border:1px solid ${currentProvider === 'anthropic' ? 'var(--gold)' : 'rgba(201,168,76,.2)'};background:${currentProvider === 'anthropic' ? 'rgba(201,168,76,.1)' : 'transparent'};color:${currentProvider === 'anthropic' ? 'var(--gold)' : 'var(--text2)'};border-radius:8px;font-size:.85rem;cursor:pointer"
          >
            🧠 Claude
          </button>
          <button onclick="switchProvider('moonshot')" class="provider-btn ${currentProvider === 'moonshot' ? 'active' : ''}"
            style="flex:1;min-width:120px;padding:.6rem;border:1px solid ${currentProvider === 'moonshot' ? 'var(--gold)' : 'rgba(201,168,76,.2)'};background:${currentProvider === 'moonshot' ? 'rgba(201,168,76,.1)' : 'transparent'};color:${currentProvider === 'moonshot' ? 'var(--gold)' : 'var(--text2)'};border-radius:8px;font-size:.85rem;cursor:pointer"
          >
            🌙 Kimi 自定义
          </button>
        </div>
      </div>
  `;

  // Render each provider config
  Object.entries(AI_PROVIDERS).forEach(([key, config]) => {
    const isActive = currentProvider === key;
    const hasKey = AIConfig.hasKey(key);
    const keyPreview = hasKey ? AIConfig.getKey(key).slice(0, 8) + '...' + AIConfig.getKey(key).slice(-4) : '';

    if (key === 'proxy') {
      html += `
        <div id="provider-config-${key}" style="display:${isActive ? 'block' : 'none'};margin-bottom:1rem">
          <div style="font-size:.8rem;color:var(--text2);line-height:1.7;padding:.8rem;background:rgba(107,63,160,.08);border:1px solid rgba(155,111,212,.2);border-radius:8px">
            ✨ 通过服务端代理直接调用 Kimi API，无需填写 Key。
          </div>
        </div>
      `;
      return;
    }

    html += `
      <div id="provider-config-${key}" style="display:${isActive ? 'block' : 'none'};margin-bottom:1rem">
        <div style="font-size:.75rem;color:var(--text2);margin-bottom:.3rem">${config.name} API Key</div>
        <div style="display:flex;gap:.5rem">
          <input type="password" id="api-key-${key}" value="${hasKey ? 'sk-xxxxxxxx' : ''}" placeholder="${config.keyPrefix}..."
            style="flex:1;padding:.6rem .8rem;background:rgba(13,11,26,.8);border:1px solid rgba(201,168,76,.25);color:var(--text);border-radius:8px;font-size:.85rem;outline:none"
          >
          <button onclick="saveProviderKey('${key}')" style="padding:.6rem 1rem;background:rgba(107,63,160,.2);border:1px solid var(--purple2);color:var(--purple2);border-radius:8px;font-size:.85rem;cursor:pointer">保存</button>
        </div>
        ${hasKey ? `<div style="font-size:.75rem;color:var(--gold);margin-top:.3rem">✓ 已设置 (${keyPreview})</div>` : ''}
        <div style="font-size:.75rem;color:var(--text2);margin-top:.5rem">
          <a href="${config.docsUrl}" target="_blank" style="color:var(--purple2)">获取 ${config.name} API Key →</a>
        </div>
      </div>
    `;
  });

  html += `
      <div style="font-size:.75rem;color:var(--text2);line-height:1.6;padding:.8rem;background:rgba(201,168,76,.05);border-radius:8px">
        🔒 你的 API Key 只存储在本地浏览器中，不会上传到任何服务器。
        <br>每次深度解读约消耗 2000-4000 tokens。
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function switchProvider(provider) {
  AIConfig.setProvider(provider);
  renderSettingsPanel();
}

function saveProviderKey(provider) {
  const input = document.getElementById(`api-key-${provider}`);
  if (!input) return;
  const key = input.value.trim();
  const config = AI_PROVIDERS[provider];

  if (key === '' || key === 'sk-xxxxxxxx') {
    AIConfig.setKey(provider, '');
    showNotif('API Key 已清除');
    renderSettingsPanel();
    return;
  }

  if (key.startsWith(config.keyPrefix) || provider === 'moonshot') {
    AIConfig.setKey(provider, key);
    showNotif(`${config.name} API Key 已保存 ✓`);
    renderSettingsPanel();
  } else {
    showNotif(`请输入有效的 ${config.name} API Key`);
  }
}

function openSettings() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.style.display = 'flex';
  renderSettingsPanel();
}

function closeSettings() {
  const modal = document.getElementById('settings-modal');
  if (modal) modal.style.display = 'none';
}
