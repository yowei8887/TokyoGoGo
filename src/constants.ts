
import { ItineraryItem, ShoppingItem, ExpenseItem, FlightInfo, HotelInfo, Member, ExpenseCategory, PackingItem, PackingCategory } from './types';

// --- STICKER CONFIGURATION ---
export const STICKER_URLS = {
  Pin: '', 
  Yowei: '' 
};

export const STICKER_COORDS = {
  default: '0 0',
  happy: '100% 0',
  eating: '0 100%',
  sleeping: '100% 100%'
};

export const FLIGHTS: FlightInfo[] = [
  {
    airline: 'Scoot (酷航)',
    flightNo: 'TR898',
    route: '台北(TPE) → 東京成田(NRT)',
    time: '06:40 - 10:40',
    terminal: '成田第1航廈'
  },
  {
    airline: 'Peach (樂桃)',
    flightNo: 'MM625',
    route: '東京成田(NRT) → 台北(TPE)',
    time: '16:35 - 20:00',
    terminal: '成田第1航廈'
  }
];

export const HOTELS: HotelInfo[] = [
  {
    name: '岩原大飯店',
    dates: '12/23 - 12/25 (2 Nights)',
    address: 'Niigata, Yuzawa'
  },
  {
    name: 'APA Hotel 上野 稻荷町駅北',
    dates: '12/25 - 12/31 (6 Nights)',
    address: 'Ueno, Tokyo'
  }
];

// 依照圖片內容重新定義清單樣板
const PACKING_TEMPLATE: { category: PackingCategory; items: string[] }[] = [
  {
    category: '重要物品',
    items: [
      "護照(含影本)",
      "國際駕照",
      "台灣駕照",
      "身分證",
      "信用卡",
      "日幣",
      "保險中英文",
      "機票紙本",
      "住宿憑證"
    ]
  },
  {
    category: '衛生用品及藥物',
    items: [
      "口罩",
      "酒精紙巾",
      "衛生紙 / 濕紙巾",
      "衛生棉、棉條",
      "B群",
      "驅異樂",
      "暈車藥",
      "腸胃藥",
      "急救包"
    ]
  },
  {
    category: '電器相關',
    items: [
      "充電線",
      "轉接頭",
      "行動電源",
      "腳架"
    ]
  },
  {
    category: '個人衣物',
    items: [
      "免洗內褲",
      "衣服褲子",
      "防風外套",
      "羽絨外套",
      "遮陽帽 / 毛帽",
      "襪子",
      "涼鞋 / 登山鞋",
      "拖鞋"
    ]
  },
  {
    category: '盥洗用品',
    items: [
      "牙刷 / 牙膏",
      "毛巾",
      "洗面乳",
      "保養品",
      "髮品",
      "泳衣",
      "污衣袋"
    ]
  },
  {
    category: '其它',
    items: [
      "後背包",
      "水壺 / 保溫瓶",
      "行李秤(拆電池)",
      "頸枕 / 耳塞",
      "購物袋",
      "雨傘雨衣",
      "防曬乳",
      "太陽眼鏡",
      "暖暖包",
      "塑膠袋 / 夾鏈袋"
    ]
  }
];

// 產生兩份清單，分別給 Pin 和 Yowei
const generateListForMember = (owner: 'Pin' | 'Yowei'): PackingItem[] => {
  let list: PackingItem[] = [];
  PACKING_TEMPLATE.forEach(group => {
    group.items.forEach((itemName, index) => {
      list.push({
        id: `${owner.toLowerCase()}_${group.category}_${index}`,
        name: itemName,
        checked: false,
        category: group.category,
        owner: owner
      });
    });
  });
  return list;
};

export const INITIAL_PACKING_LIST: PackingItem[] = [
  ...generateListForMember('Pin'),
  ...generateListForMember('Yowei')
];

export const INITIAL_SHOPPING: ShoppingItem[] = [
  { id: '1', name: 'Uniqlo 發熱衣', checked: false, owner: 'Pin', quantity: 3, price: 1500, note: '黑色 M 號 x2, 白色 L 號 x1' },
  { id: '2', name: '大國藥妝 - 合力他命', checked: false, owner: 'Yowei', quantity: 2, price: 5000, note: '要買 270 錠裝的' },
  { id: '3', name: 'New York Perfect Cheese', checked: false, owner: 'Pin', quantity: 5, price: 1200, note: '送禮用，要在機場買' },
  { id: '4', name: '富士山杯', checked: false, owner: 'Yowei', quantity: 1, price: 6000, note: '' }
];

export const MEMBERS: Member[] = ['Pin', 'Yowei'];
export const INITIAL_CATEGORIES: ExpenseCategory[] = ['餵豬', '買快樂', '交通', '住宿', '雜支'];
export const PACKING_CATEGORIES: PackingCategory[] = ['重要物品', '衛生用品及藥物', '電器相關', '個人衣物', '盥洗用品', '其它'];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  { 
    id: '1', 
    name: 'Skyliner 雙人票', 
    originalAmount: 5140, 
    currency: 'JPY', 
    exchangeRate: 0.22, 
    calculatedAmountTWD: 1130, 
    category: '交通', 
    payer: 'Pin', 
    sharedBy: ['Pin', 'Yowei'],
    date: '2025/12/23'
  },
  { 
    id: '2', 
    name: '販賣機飲料', 
    originalAmount: 160, 
    currency: 'JPY', 
    exchangeRate: 0.22, 
    calculatedAmountTWD: 35, 
    category: '餵豬', 
    payer: 'Yowei', 
    sharedBy: ['Yowei'],
    date: '2025/12/23'
  }
];

export const INITIAL_ITINERARY: ItineraryItem[] = [
  {
    id: '1',
    date: '2025/12/23',
    dayLabel: '12/23',
    icon: 'train',
    location: '成田 → 上野 → 越後湯澤',
    transport: 'Skyliner, 上越新幹線',
    accommodation: '岩原大飯店',
    notes: '租雪具',
    activities: [
      { id: 'a1', time: '10:40', title: '抵達東京成田', description: '入境審查，領取 JR Pass', type: 'transport' },
      { id: 'a2', time: '13:00', title: '京成上野站', description: '轉乘新幹線，順便吃午餐', type: 'food' },
      { id: 'a3', time: '15:00', title: '越後湯澤站', description: '前往飯店 check-in', type: 'transport' },
      { id: 'a4', time: '16:00', title: '租借雪具', description: '為明天滑雪做準備', type: 'spot' }
    ]
  },
  {
    id: '2',
    date: '2025/12/24',
    dayLabel: '12/24',
    icon: 'ski',
    location: '岩原滑雪場',
    transport: '飯店接駁',
    accommodation: '岩原大飯店',
    notes: '整天滑雪 🏂',
    activities: [
      { id: 'b1', time: '09:00', title: '岩原滑雪場', description: '全日滑雪體驗', type: 'spot', tags: ['滑雪'] },
      { id: 'b2', time: '18:00', title: '溫泉與晚餐', description: '飯店內享用', type: 'food' }
    ]
  },
  {
    id: '3',
    date: '2025/12/25',
    dayLabel: '12/25',
    icon: 'tree',
    location: '湯澤 → 上野 → 六本木',
    transport: '新幹線',
    accommodation: 'APA Hotel 上野',
    notes: '聖誕節🎄',
    activities: [
      { id: 'c1', time: '09:00', title: '早晨滑雪', description: '最後衝刺滑一波', type: 'spot', tags: ['滑雪'] },
      { id: 'c2', time: '13:00', title: '移動回東京', description: '搭乘新幹線返回上野，Check-in', type: 'transport' },
      { id: 'c3', time: '18:00', title: '六本木', description: '六本木之丘聖誕燈飾、東京鐵塔夜景', type: 'spot', tags: ['聖誕節'] }
    ]
  },
  {
    id: '4',
    date: '2025/12/26',
    dayLabel: '12/26',
    icon: 'mountain',
    location: '富士山一日遊',
    transport: 'Tour Bus',
    accommodation: 'APA Hotel 上野',
    notes: 'Klook 行程',
    activities: [
      { id: 'd1', time: '08:00', title: '新宿集合', description: '搭乘巴士出發', type: 'transport' },
      { id: 'd2', time: '10:30', title: '新倉山淺間公園', description: '經典場景：五重塔 + 富士山', type: 'spot', tags: ['拍照'] },
      { id: 'd3', time: '12:00', title: '日川時計店', description: '富士吉田市隱藏版街景', type: 'spot' },
      { id: 'd4', time: '13:30', title: '忍野八海', description: '清澈湧泉，有小九寨溝之稱', type: 'spot' },
      { id: 'd5', time: '15:00', title: '羅森便利店', description: '河口湖站前網紅打卡點', type: 'spot' },
      { id: 'd6', time: '16:00', title: '大石公園', description: '河口湖畔欣賞富士山全景', type: 'spot' }
    ]
  },
  {
    id: '5',
    date: '2025/12/27',
    dayLabel: '12/27',
    icon: 'fish',
    location: '築地 → 澀谷',
    transport: '地鐵',
    accommodation: 'APA Hotel 上野',
    notes: '',
    activities: [
      { id: 'e1', time: '上午', title: '築地市場', description: '吃海鮮丼、玉子燒', type: 'food', tags: ['必吃'] },
      { id: 'e2', time: '下午', title: '澀谷 / 表參道', description: '逛街購物，SHIBUYA SKY', type: 'shopping' }
    ]
  },
  {
    id: '6',
    date: '2025/12/28',
    dayLabel: '12/28',
    icon: 'money',
    location: '越谷 Outlet',
    transport: 'JR 武藏野線',
    accommodation: 'APA Hotel 上野',
    notes: '大買特買',
    activities: [
      { 
        id: 'f1', 
        time: '上午', 
        title: '越谷 Lake Town', 
        description: '分 Kaze/Mori 兩區，日本最大 Outlet，建議先看地圖規劃路線。', 
        type: 'shopping',
        tags: ['必逛']
      },
      { 
        id: 'f2', 
        time: '晚上', 
        title: '上野', 
        description: '居酒屋晚餐，鳥貴族或肉的大山', 
        type: 'food' 
      }
    ]
  },
  {
    id: '7',
    date: '2025/12/29',
    dayLabel: '12/29',
    icon: 'buddha',
    location: '鎌倉 / 江之島',
    transport: '江之電',
    accommodation: 'APA Hotel 上野',
    notes: '古都巡禮',
    activities: [
      { id: 'g1', time: '09:30', title: '鶴岡八幡宮', description: '鎌倉最具代表性的神社', type: 'spot' },
      { id: 'g2', time: '11:00', title: '小町通老街', description: '吃街邊美食，買伴手禮', type: 'food' },
      { id: 'g3', time: '13:00', title: '鎌倉大佛', description: '高德院國寶銅像', type: 'spot' },
      { id: 'g4', time: '14:30', title: '鎌倉高校前', description: '灌籃高手平交道拍照', type: 'spot' },
      { id: 'g5', time: '16:00', title: '江之島神社', description: '參拜辯財天，吃吻仔魚丼', type: 'spot' }
    ]
  },
  {
    id: '8',
    date: '2025/12/30',
    dayLabel: '12/30',
    icon: 'lantern',
    location: '淺草 → 阿美橫町',
    transport: '步行',
    accommodation: 'APA Hotel 上野',
    notes: '',
    activities: [
      { id: 'h1', time: '上午', title: '淺草寺', description: '雷門拍照，仲見世通吃小吃', type: 'spot' },
      { id: 'h2', time: '下午', title: '阿美橫町', description: '採買藥妝、零食伴手禮', type: 'shopping', tags: ['補貨'] }
    ]
  },
  {
    id: '9',
    date: '2025/12/31',
    dayLabel: '12/31',
    icon: 'plane',
    location: '返台',
    transport: 'Skyliner → 飛機',
    accommodation: 'Home',
    notes: '',
    activities: [
      { id: 'i1', time: '13:00', title: '前往機場', description: '搭乘 Skyliner 前往成田', type: 'transport' },
      { id: 'i2', time: '16:35', title: '起飛', description: 'Bye Bye Japan!', type: 'transport' }
    ]
  }
];
