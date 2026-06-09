const TAROT_DATA = {
  major: [
    { id: 0, name: "The Fool", nameCN: "愚人", keywords: ["beginnings", "innocence", "spontaneity"], keywordsCN: ["开端", "纯真", "自发性"], meaningUpright: "A new journey begins. Trust in the universe and take the leap.", meaningUprightCN: "新的旅程即将开始。相信宇宙，勇敢 leap。", meaningReversed: "Recklessness or holding back due to fear. Think before you leap.", meaningReversedCN: "鲁莽或因恐惧而退缩。三思而后行。", element: "Air" },
    { id: 1, name: "The Magician", nameCN: "魔术师", keywords: ["manifestation", "resourcefulness", "power"], keywordsCN: ["显化", "足智多谋", "力量"], meaningUpright: "You have all the tools you need. Manifest your desires.", meaningUprightCN: "你拥有所需的一切工具。显化你的愿望。", meaningReversed: "Manipulation or untapped potential. Don't waste your gifts.", meaningReversedCN: "操控或未开发的潜力。不要浪费你的天赋。", element: "Air" },
    { id: 2, name: "The High Priestess", nameCN: "女祭司", keywords: ["intuition", "sacred knowledge", "subconscious"], keywordsCN: ["直觉", "神圣知识", "潜意识"], meaningUpright: "Listen to your inner voice. The answers lie within.", meaningUprightCN: "倾听你内心的声音。答案就在其中。", meaningReversed: "Secrets or disconnected intuition. Trust yourself more.", meaningReversedCN: "秘密或与直觉脱节。多相信自己。", element: "Water" },
    { id: 3, name: "The Empress", nameCN: "女皇", keywords: ["fertility", "nurturing", "abundance"], keywordsCN: ["丰饶", "滋养", "丰盛"], meaningUpright: "Abundance flows to you. Nurture yourself and others.", meaningUprightCN: "丰盛流向你。滋养自己和他人。", meaningReversed: "Creative blocks or over-dependence. Find balance in giving.", meaningReversedCN: "创意阻塞或过度依赖。在给予中找到平衡。", element: "Earth" },
    { id: 4, name: "The Emperor", nameCN: "皇帝", keywords: ["authority", "structure", "father figure"], keywordsCN: ["权威", "结构", "父权形象"], meaningUpright: "Take charge with confidence. Structure brings success.", meaningUprightCN: "自信地掌控局面。结构带来成功。", meaningReversed: "Tyranny or lack of discipline. Don't be too rigid.", meaningReversedCN: "暴政或缺乏纪律。不要过于僵化。", element: "Fire" },
    { id: 5, name: "The Hierophant", nameCN: "教皇", keywords: ["tradition", "conformity", "spiritual guidance"], keywordsCN: ["传统", "遵从", "灵性指引"], meaningUpright: "Honor tradition and seek wise counsel. Learn from the past.", meaningUprightCN: "尊重传统，寻求明智的建议。向过去学习。", meaningReversed: "Rebellion or unconventional paths. Break free if needed.", meaningReversedCN: "反叛或非传统道路。如有需要，打破束缚。", element: "Earth" },
    { id: 6, name: "The Lovers", nameCN: "恋人", keywords: ["love", "harmony", "choices"], keywordsCN: ["爱", "和谐", "选择"], meaningUpright: "A meaningful relationship or choice awaits. Follow your heart.", meaningUprightCN: "一段有意义的关系或选择在等待。跟随你的心。", meaningReversed: "Imbalance or difficult choices. Align your values.", meaningReversedCN: "失衡或艰难的选择。调整你的价值观。", element: "Air" },
    { id: 7, name: "The Chariot", nameCN: "战车", keywords: ["control", "willpower", "victory"], keywordsCN: ["控制", "意志力", "胜利"], meaningUpright: "Push forward with determination. Victory is within reach.", meaningUprightCN: "坚定地向前推进。胜利触手可及。", meaningReversed: "Lack of control or aggression. Channel your energy wisely.", meaningReversedCN: "失控或侵略性。明智地引导你的能量。", element: "Water" },
    { id: 8, name: "Strength", nameCN: "力量", keywords: ["courage", "persuasion", "influence"], keywordsCN: ["勇气", "说服", "影响力"], meaningUpright: "Inner strength triumphs. Gentle persistence wins the day.", meaningUprightCN: "内在力量获胜。温和的坚持赢得胜利。", meaningReversed: "Self-doubt or raw force. Trust your inner resilience.", meaningReversedCN: "自我怀疑或蛮力。相信你内在的韧性。", element: "Fire" },
    { id: 9, name: "The Hermit", nameCN: "隐士", keywords: ["introspection", "solitude", "guidance"], keywordsCN: ["内省", "独处", "指引"], meaningUpright: "Withdraw to find clarity. The lantern lights your path.", meaningUprightCN: "退后一步寻找清晰。灯笼照亮你的道路。", meaningReversed: "Isolation or loneliness. Don't hide from the world forever.", meaningReversedCN: "孤立或孤独。不要永远躲避世界。", element: "Earth" },
    { id: 10, name: "Wheel of Fortune", nameCN: "命运之轮", keywords: ["change", "cycles", "inevitable fate"], keywordsCN: ["变化", "循环", "不可避免的命运"], meaningUpright: "The wheel turns in your favor. Embrace change.", meaningUprightCN: "命运之轮转向你有利的一面。拥抱变化。", meaningReversed: "Bad luck or resisting change. Go with the flow.", meaningReversedCN: "坏运气或抗拒变化。顺其自然。", element: "Fire" },
    { id: 11, name: "Justice", nameCN: "正义", keywords: ["fairness", "truth", "law"], keywordsCN: ["公平", "真相", "法则"], meaningUpright: "Balance and truth prevail. Act with integrity.", meaningUprightCN: "平衡与真理占上风。以正直行事。", meaningReversed: "Dishonesty or unfairness. Seek the truth.", meaningReversedCN: "不诚实或不公平。寻求真相。", element: "Air" },
    { id: 12, name: "The Hanged Man", nameCN: "倒吊人", keywords: ["surrender", "new perspective", "sacrifice"], keywordsCN: ["投降", "新视角", "牺牲"], meaningUpright: "Let go and see things differently. Pause before acting.", meaningUprightCN: "放手，从不同角度看待事物。行动前暂停。", meaningReversed: "Stalling or fear of sacrifice. Embrace the pause.", meaningReversedCN: "拖延或害怕牺牲。拥抱暂停。", element: "Water" },
    { id: 13, name: "Death", nameCN: "死神", keywords: ["endings", "transformation", "transition"], keywordsCN: ["结束", "转化", "过渡"], meaningUpright: "A chapter closes so another can begin. Embrace transformation.", meaningUprightCN: "一个章节结束，另一个才能开始。拥抱转化。", meaningReversed: "Resistance to change or stagnation. Let go to grow.", meaningReversedCN: "抗拒改变或停滞。放手才能成长。", element: "Water" },
    { id: 14, name: "Temperance", nameCN: "节制", keywords: ["balance", "moderation", "patience"], keywordsCN: ["平衡", "节制", "耐心"], meaningUpright: "Find middle ground. Balance brings healing.", meaningUprightCN: "找到中间地带。平衡带来治愈。", meaningReversed: "Extremes or imbalance. Seek harmony within.", meaningReversedCN: "极端或失衡。在内心寻找和谐。", element: "Fire" },
    { id: 15, name: "The Devil", nameCN: "恶魔", keywords: ["shadow self", "attachment", "materialism"], keywordsCN: ["阴影自我", "依附", "物质主义"], meaningUpright: "You may be trapped by your own desires. Break free.", meaningUprightCN: "你可能被自己的欲望困住。挣脱束缚。", meaningReversed: "Release from bondage. Reclaim your power.", meaningReversedCN: "从束缚中释放。 reclaim 你的力量。", element: "Earth" },
    { id: 16, name: "The Tower", nameCN: "塔", keywords: ["sudden change", "upheaval", "awakening"], keywordsCN: ["突变", "动荡", "觉醒"], meaningUpright: "Sudden revelation shakes your foundations. Rebuild stronger.", meaningUprightCN: "突然的启示动摇了你的根基。更坚强地重建。", meaningReversed: "Avoiding disaster or delayed upheaval. Face the truth.", meaningReversedCN: "避免灾难或延迟的动荡。面对真相。", element: "Fire" },
    { id: 17, name: "The Star", nameCN: "星星", keywords: ["hope", "faith", "purpose"], keywordsCN: ["希望", "信念", "目的"], meaningUpright: "Hope shines brightly. Trust in the divine plan.", meaningUprightCN: "希望闪耀。相信神圣计划。", meaningReversed: "Lost faith or despair. Reconnect with your inner light.", meaningReversedCN: "失去信念或绝望。重新连接你内在的光芒。", element: "Air" },
    { id: 18, name: "The Moon", nameCN: "月亮", keywords: ["illusion", "fear", "subconscious"], keywordsCN: ["幻觉", "恐惧", "潜意识"], meaningUpright: "Things are not as they seem. Trust your intuition through the fog.", meaningUprightCN: "事情并非表面所见。在迷雾中相信你的直觉。", meaningReversed: "Confusion subsides. Clarity emerges from the shadows.", meaningReversedCN: " confusion 消退。清晰从阴影中浮现。", element: "Water" },
    { id: 19, name: "The Sun", nameCN: "太阳", keywords: ["positivity", "success", "vitality"], keywordsCN: ["积极", "成功", "活力"], meaningUpright: "Joy and success abound. Bask in the light.", meaningUprightCN: "喜悦和成功无处不在。沐浴在光明中。", meaningReversed: "Temporary sadness or ego issues. The sun still shines.", meaningReversedCN: "暂时的悲伤或自我问题。太阳依然在闪耀。", element: "Fire" },
    { id: 20, name: "Judgement", nameCN: "审判", keywords: ["rebirth", "inner calling", "absolution"], keywordsCN: ["重生", "内在召唤", "赦免"], meaningUpright: "A call to rise. Heed your inner truth and awaken.", meaningUprightCN: "一个崛起的召唤。倾听你内在的真理并觉醒。", meaningReversed: "Self-doubt or ignoring the call. The time is now.", meaningReversedCN: "自我怀疑或忽视召唤。时机就是现在。", element: "Fire" },
    { id: 21, name: "The World", nameCN: "世界", keywords: ["completion", "integration", "accomplishment"], keywordsCN: ["完成", "整合", "成就"], meaningUpright: "A cycle completes. Celebrate your journey and wholeness.", meaningUprightCN: "一个循环完成。庆祝你的旅程和完整性。", meaningReversed: "Incompletion or seeking closure. You're almost there.", meaningReversedCN: "未完成或寻求 closure。你几乎到达了。", element: "Earth" }
  ],
  suits: {
    wands: { name: "Wands", nameCN: "权杖", element: "Fire", elementCN: "火" },
    cups: { name: "Cups", nameCN: "圣杯", element: "Water", elementCN: "水" },
    swords: { name: "Swords", nameCN: "宝剑", element: "Air", elementCN: "风" },
    pentacles: { name: "Pentacles", nameCN: "星币", element: "Earth", elementCN: "土" }
  }
};

// 生成小阿尔卡那 (56张)
const minorArcana = [];
const suits = ['wands', 'cups', 'swords', 'pentacles'];
const numbers = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const courts = [
  { name: 'Page', nameCN: '侍从', keywords: ['exploration', 'messages'], keywordsCN: ['探索', '讯息'] },
  { name: 'Knight', nameCN: '骑士', keywords: ['action', 'ambition'], keywordsCN: ['行动', '野心'] },
  { name: 'Queen', nameCN: '王后', keywords: ['compassion', 'mastery'], keywordsCN: [' compassion ', '精通'] },
  { name: 'King', nameCN: '国王', keywords: ['authority', 'leadership'], keywordsCN: ['权威', '领导力'] }
];

let minorId = 22;
suits.forEach(suit => {
  const suitInfo = TAROT_DATA.suits[suit];
  numbers.forEach((num, idx) => {
    minorArcana.push({
      id: minorId++,
      name: `${num} of ${suitInfo.name}`,
      nameCN: `${suitInfo.nameCN}${num === 'Ace' ? '首牌' : num}`,
      suit: suit,
      suitCN: suitInfo.nameCN,
      number: num,
      isCourt: false,
      element: suitInfo.element,
      elementCN: suitInfo.elementCN,
      keywords: [suitInfo.element.toLowerCase(), 'action'],
      keywordsCN: [suitInfo.elementCN, '行动'],
      meaningUpright: `The ${num} of ${suitInfo.name} brings ${suitInfo.element.toLowerCase()} energy to your situation.`,
      meaningUprightCN: `${suitInfo.nameCN}${num === 'Ace' ? '首牌' : num}为你的处境带来${suitInfo.elementCN}能量。`,
      meaningReversed: `Blocked or delayed ${suitInfo.element.toLowerCase()} energy. Reassess your approach.`,
      meaningReversedCN: `${suitInfo.elementCN}能量受阻或延迟。重新评估你的方法。`
    });
  });
  courts.forEach(court => {
    minorArcana.push({
      id: minorId++,
      name: `${court.name} of ${suitInfo.name}`,
      nameCN: `${suitInfo.nameCN}${court.nameCN}`,
      suit: suit,
      suitCN: suitInfo.nameCN,
      number: court.name,
      isCourt: true,
      element: suitInfo.element,
      elementCN: suitInfo.elementCN,
      keywords: court.keywords,
      keywordsCN: court.keywordsCN,
      meaningUpright: `The ${court.name} of ${suitInfo.name} embodies ${court.keywords[0]} with ${suitInfo.element.toLowerCase()} energy.`,
      meaningUprightCN: `${suitInfo.nameCN}${court.nameCN}以${suitInfo.elementCN}能量体现${court.keywordsCN[0]}。`,
      meaningReversed: `Imbalanced ${court.keywords[0]}. Step back and reflect.`,
      meaningReversedCN: `${court.keywordsCN[0]}失衡。退后一步反思。`
    });
  });
});

TAROT_DATA.minor = minorArcana;
TAROT_DATA.all = [...TAROT_DATA.major, ...TAROT_DATA.minor];

// 牌阵定义
const SPREADS = [
  { id: 'single', name: 'Single Card', nameCN: '单张牌', cardCount: 1, desc: 'A quick insight for the day.', descCN: '今日快速指引。', positions: [{ name: 'The Message', nameCN: '讯息' }] },
  { id: 'three', name: 'Three Cards', nameCN: '三张牌', cardCount: 3, desc: 'Past / Present / Future', descCN: '过去 / 现在 / 未来', positions: [{ name: 'Past', nameCN: '过去' }, { name: 'Present', nameCN: '现在' }, { name: 'Future', nameCN: '未来' }] },
  { id: 'celtic', name: 'Celtic Cross', nameCN: '凯尔特十字', cardCount: 10, desc: 'A deep dive into complex situations.', descCN: '复杂处境的深度探索。', positions: [
    { name: 'Present', nameCN: '现状' }, { name: 'Challenge', nameCN: '挑战' }, { name: 'Foundation', nameCN: '根基' },
    { name: 'Past', nameCN: '过去' }, { name: 'Crown', nameCN: '目标' }, { name: 'Future', nameCN: '未来' },
    { name: 'Self', nameCN: '自我' }, { name: 'Environment', nameCN: '环境' }, { name: 'Hopes', nameCN: '希望' }, { name: 'Outcome', nameCN: '结果' }
  ]},
  { id: 'relationship', name: 'Relationship', nameCN: '关系牌阵', cardCount: 5, desc: 'Dynamics between you and another.', descCN: '你与他人的关系动态。', positions: [
    { name: 'You', nameCN: '你' }, { name: 'Them', nameCN: '对方' }, { name: 'Relationship', nameCN: '关系' },
    { name: 'Strength', nameCN: '优势' }, { name: 'Challenge', nameCN: '挑战' }
  ]},
  { id: 'horseshoe', name: 'Horseshoe', nameCN: '马蹄牌阵', cardCount: 7, desc: 'A thorough view with hidden influences.', descCN: '包含隐藏因素的全面视角。', positions: [
    { name: 'Past', nameCN: '过去' }, { name: 'Present', nameCN: '现在' }, { name: 'Hidden', nameCN: '隐藏' },
    { name: 'Obstacles', nameCN: '障碍' }, { name: 'Environment', nameCN: '环境' }, { name: 'Advice', nameCN: '建议' }, { name: 'Outcome', nameCN: '结果' }
  ]}
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TAROT_DATA, SPREADS };
}
