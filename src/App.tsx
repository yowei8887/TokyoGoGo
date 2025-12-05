
import React, { useState, useEffect } from 'react';
import { INITIAL_ITINERARY, INITIAL_EXPENSES, INITIAL_SHOPPING, FLIGHTS, HOTELS, MEMBERS, INITIAL_CATEGORIES, INITIAL_PACKING_LIST } from './constants';
import { ItineraryItem, ExpenseItem, ShoppingItem, Tab, Activity, Currency, ExpenseCategory, Member, ShoppingOwner, PackingItem } from './types';
import ItineraryCard from './components/ItineraryCard';
import { 
  Map, 
  ShoppingBag, 
  CreditCard, 
  Info, 
  Trash2, 
  CheckCircle2, 
  Circle,
  Plane,
  Hotel,
  Plus,
  RefreshCw,
  JapaneseYen,
  ArrowRightLeft,
  Check,
  X,
  StickyNote,
  Navigation,
  Luggage,
  Train,
  Snowflake,
  Mountain,
  Landmark,
  MapPin,
  Fish,
  Banknote,
  Tent,
  TreePine,
  QrCode,
  List,
  PenLine,
  Dog,
  Cat
} from 'lucide-react';

// Firebase imports
import { db } from './services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const DOC_ID = "main_trip_v2"; 

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ITINERARY);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  
  // Data State
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(INITIAL_ITINERARY);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(INITIAL_SHOPPING);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [packingList, setPackingList] = useState<PackingItem[]>(INITIAL_PACKING_LIST);
  const [currentRate, setCurrentRate] = useState<number>(0.22); // Default JPY to TWD

  // UI State
  const [selectedDayId, setSelectedDayId] = useState<string>(INITIAL_ITINERARY[0].id);
  const [draggedDayIndex, setDraggedDayIndex] = useState<number | null>(null);
  
  // Shopping State
  const [selectedShopper, setSelectedShopper] = useState<ShoppingOwner>('Pin');
  const [newItemName, setNewItemName] = useState('');
  
  // Expense Form State
  const [expenseView, setExpenseView] = useState<'entry' | 'list'>('entry');
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCurrency, setExpCurrency] = useState<Currency>('JPY');
  const [expCategory, setExpCategory] = useState<string>(INITIAL_CATEGORIES[0]);
  const [expPayer, setExpPayer] = useState<Member>('Pin');
  const [expSharedBy, setExpSharedBy] = useState<Member[]>(['Pin', 'Yowei']);
  
  // New Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Packing List UI State
  const [selectedPacker, setSelectedPacker] = useState<'Pin' | 'Yowei'>('Pin');
  const [newPackItem, setNewPackItem] = useState('');

  // --- FIREBASE SYNC ---
  
  // 核心修復：Firebase 不接受 undefined，必須將其轉為 null 或移除
  const cleanData = (data: any): any => {
    if (Array.isArray(data)) {
      return data.map(cleanData);
    }
    if (data !== null && typeof data === 'object') {
      return Object.entries(data).reduce((acc, [key, value]) => {
        // 如果值是 undefined，轉為 null
        acc[key] = value === undefined ? null : cleanData(value);
        return acc;
      }, {} as any);
    }
    return data;
  };

  useEffect(() => {
    const tripRef = doc(db, "trips", DOC_ID);

    const unsubscribe = onSnapshot(tripRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.itinerary) {
          const mergedItinerary = data.itinerary.map((item: ItineraryItem, index: number) => {
             const initialItem = INITIAL_ITINERARY.find(i => i.id === item.id);
             return {
                ...item,
                icon: item.icon || initialItem?.icon
             };
          });
          setItinerary(mergedItinerary);
        }
        if (data.shoppingList) setShoppingList(data.shoppingList);
        if (data.expenses) setExpenses(data.expenses);
        if (data.categories) setCategories(data.categories);
        if (data.packingList) setPackingList(data.packingList);
        if (data.exchangeRate) setCurrentRate(data.exchangeRate);
        setStatus('connected');
      } else {
        // 初始化資料庫
        setDoc(tripRef, cleanData({
          itinerary: INITIAL_ITINERARY,
          shoppingList: INITIAL_SHOPPING,
          expenses: INITIAL_EXPENSES,
          categories: INITIAL_CATEGORIES,
          packingList: INITIAL_PACKING_LIST,
          exchangeRate: 0.22
        })).then(() => setStatus('connected'));
      }
    }, (error) => {
      console.error("Firebase sync error:", error);
      setStatus('error');
      // 如果是權限錯誤，通常是因為 Firestore Rules 沒開
      if (error.code === 'permission-denied') {
          alert("讀取失敗：權限不足。請到 Firebase Console > Firestore Database > Rules 將 allow read, write 改為 true。");
      }
    });

    return () => unsubscribe();
  }, []);

  const syncToFirebase = async (data: any) => {
    try {
      const tripRef = doc(db, "trips", DOC_ID);
      // 使用 setDoc + merge: true，並經過 cleanData 處理
      await setDoc(tripRef, cleanData(data), { merge: true });
      setStatus('connected');
    } catch (err: any) {
      console.error("Failed to sync", err);
      setStatus('error');
      if (err.code === 'permission-denied') {
        alert("存檔失敗：權限不足。請到 Firebase Console > Firestore Database > Rules 將 allow read, write 改為 true。");
      } else {
        alert(`存檔失敗：${err.message}`);
      }
    }
  };

  // --- HANDLERS ---
  const handleRateUpdate = (newRate: number) => {
    setCurrentRate(newRate);
    syncToFirebase({ exchangeRate: newRate });
  };

  const handleItineraryUpdate = (id: string, field: keyof ItineraryItem, value: any) => {
    const newItinerary = itinerary.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItinerary(newItinerary);
    syncToFirebase({ itinerary: newItinerary });
  };

  const handleActivityUpdate = (dayId: string, activityId: string, updatedActivity: Activity) => {
    const newItinerary = itinerary.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        activities: day.activities.map(act => act.id === activityId ? updatedActivity : act)
      };
    });
    setItinerary(newItinerary);
    syncToFirebase({ itinerary: newItinerary });
  };

  const handleActivitiesReorder = (dayId: string, newActivities: Activity[]) => {
    const newItinerary = itinerary.map(day => 
        day.id === dayId ? { ...day, activities: newActivities } : day
    );
    setItinerary(newItinerary);
    syncToFirebase({ itinerary: newItinerary });
  };

  const handleActivityAdd = (dayId: string) => {
    const newId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newActivity: Activity = {
      id: newId,
      time: '待定',
      title: '新行程',
      description: '',
      type: 'spot',
      tags: [],
      aiNotes: null as any // 顯式給 null
    };
    const newItinerary = itinerary.map(day => 
      day.id === dayId ? { ...day, activities: [...day.activities, newActivity] } : day
    );
    setItinerary(newItinerary);
    syncToFirebase({ itinerary: newItinerary });
  };

  const handleActivityDelete = (dayId: string, activityId: string) => {
    const newItinerary = itinerary.map(day => 
      day.id === dayId ? { ...day, activities: day.activities.filter(a => a.id !== activityId) } : day
    );
    setItinerary(newItinerary);
    syncToFirebase({ itinerary: newItinerary });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedDayIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedDayIndex === null || draggedDayIndex === dropIndex) return;

    const newItinerary = [...itinerary];
    const calendarSkeleton = itinerary.map(item => ({
      date: item.date,
      dayLabel: item.dayLabel
    }));

    const [movedItem] = newItinerary.splice(draggedDayIndex, 1);
    newItinerary.splice(dropIndex, 0, movedItem);

    const finalItinerary = newItinerary.map((item, index) => {
      const skeleton = calendarSkeleton[index] || { date: item.date, dayLabel: item.dayLabel };
      return {
        ...item,
        date: skeleton.date,
        dayLabel: skeleton.dayLabel,
      };
    });

    setItinerary(finalItinerary);
    syncToFirebase({ itinerary: finalItinerary });
    setDraggedDayIndex(null);
  };

  const openGoogleMaps = (query: string, mode: 'search' | 'driving' = 'search') => {
      const q = encodeURIComponent(query);
      const url = mode === 'driving' 
        ? `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${q}`;
      window.open(url, '_blank');
  };

  const toggleShopItem = (id: string) => {
    const newList = shoppingList.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(newList);
    syncToFirebase({ shoppingList: newList });
  };

  const addShopItem = () => {
    if (!newItemName.trim()) return;
    const newId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newItem: ShoppingItem = {
      id: newId,
      name: newItemName,
      checked: false,
      owner: selectedShopper,
      quantity: 1,
      price: 0,
      note: ''
    };
    const newList = [...shoppingList, newItem];
    setShoppingList(newList);
    syncToFirebase({ shoppingList: newList });
    setNewItemName('');
  };

  const updateShopItem = (id: string, field: keyof ShoppingItem, value: any) => {
    const newList = shoppingList.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setShoppingList(newList);
    syncToFirebase({ shoppingList: newList });
  };

  const removeShopItem = (id: string) => {
    const newList = shoppingList.filter(i => i.id !== id);
    setShoppingList(newList);
    syncToFirebase({ shoppingList: newList });
  };

  const togglePackItem = (id: string) => {
    const newList = packingList.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setPackingList(newList);
    syncToFirebase({ packingList: newList });
  };

  const addPackItem = () => {
    if (!newPackItem.trim()) return;
    const newId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newItem: PackingItem = {
      id: newId,
      name: newPackItem.trim(),
      checked: false,
      owner: selectedPacker
    };
    const newList = [...packingList, newItem];
    setPackingList(newList);
    syncToFirebase({ packingList: newList });
    setNewPackItem('');
  };

  const removePackItem = (id: string) => {
    const newList = packingList.filter(item => item.id !== id);
    setPackingList(newList);
    syncToFirebase({ packingList: newList });
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat = newCategoryName.trim();
    if (!categories.includes(newCat)) {
        const newCats = [...categories, newCat];
        setCategories(newCats);
        syncToFirebase({ categories: newCats });
    }
    setExpCategory(newCat);
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const addExpense = () => {
    if (!expName.trim() || !expAmount) return;
    const amountVal = parseFloat(expAmount);
    if (isNaN(amountVal)) return;
    const calculatedTWD = expCurrency === 'JPY' 
      ? Math.round(amountVal * currentRate) 
      : Math.round(amountVal);
    const newExpense: ExpenseItem = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: expName,
      originalAmount: amountVal,
      currency: expCurrency,
      exchangeRate: currentRate,
      calculatedAmountTWD: calculatedTWD,
      category: expCategory,
      payer: expPayer,
      sharedBy: expSharedBy.length > 0 ? expSharedBy : [expPayer],
      date: new Date().toLocaleDateString()
    };
    const newList = [newExpense, ...expenses];
    setExpenses(newList);
    syncToFirebase({ expenses: newList });
    setExpName('');
    setExpAmount('');
  };

  const removeExpense = (id: string) => {
    const newList = expenses.filter(e => e.id !== id);
    setExpenses(newList);
    syncToFirebase({ expenses: newList });
  };

  const toggleSharedBy = (member: Member) => {
    if (expSharedBy.includes(member)) {
      setExpSharedBy(expSharedBy.filter(m => m !== member));
    } else {
      setExpSharedBy([...expSharedBy, member]);
    }
  };

  const normalizeMember = (name: string): string => {
      if (name === '條碼貓') return 'Pin';
      if (name === '拖把狗') return 'Yowei';
      return name;
  };

  const calculateSettlement = () => {
    const balances: Record<string, number> = { 'Pin': 0, 'Yowei': 0 };
    let totalSpent = 0;
    expenses.forEach(item => {
      const rawPayer = (item.payer as string) || 'Pin'; 
      const payer = normalizeMember(rawPayer);
      const rawSharedBy = (item.sharedBy as string[]) || ['Pin', 'Yowei'];
      const sharedBy = rawSharedBy.map(normalizeMember);
      const amount = item.calculatedAmountTWD || 0;
      totalSpent += amount;
      if (typeof balances[payer] === 'undefined') balances[payer] = 0;
      balances[payer] += amount;
      if (sharedBy.length > 0) {
        const splitAmount = amount / sharedBy.length;
        sharedBy.forEach(member => {
            if (typeof balances[member] === 'undefined') balances[member] = 0;
            balances[member] -= splitAmount;
        });
      }
    });
    return { balances, totalSpent };
  };

  // Helper for Member Avatar (Morandi Palette)
  const MemberAvatar = ({ member, size = 32, active = false }: { member: string, size?: number, active?: boolean }) => {
     const isPin = member === 'Pin';
     const bgColor = isPin 
        ? (active ? 'bg-[#c5b5a2]' : 'bg-[#e8ded1]') 
        : (active ? 'bg-[#c9a7a7]' : 'bg-[#e2d2d2]');
     const textColor = isPin 
        ? (active ? 'text-white' : 'text-[#8a7967]') 
        : (active ? 'text-white' : 'text-[#8a6868]');
     
     return (
       <div className={`${bgColor} ${textColor} rounded-full flex items-center justify-center border border-white/50 shadow-sm transition-all`} style={{ width: size, height: size }}>
          {isPin ? <Dog size={size * 0.6} /> : <Cat size={size * 0.6} />}
       </div>
     );
  };

  // --- RENDERERS ---

  const renderItinerary = () => {
    const selectedItem = itinerary.find(i => i.id === selectedDayId) || itinerary[0];
    const getDayIconComponent = (iconName?: string) => {
       switch(iconName) {
         case 'train': return <Train size={20} />;
         case 'plane': return <Plane size={20} />;
         case 'ski': return <Snowflake size={20} />;
         case 'tree': return <TreePine size={20} />;
         case 'mountain': return <Mountain size={20} />;
         case 'shopping': return <ShoppingBag size={20} />;
         case 'temple': return <Landmark size={20} />;
         case 'fish': return <Fish size={20} />;
         case 'money': return <Banknote size={20} />;
         case 'buddha': return <Landmark size={20} />;
         case 'lantern': return <Tent size={20} />;
         default: return <MapPin size={20} />;
       }
    };

    return (
      <div className="flex flex-1 bg-[#f7f5f3] relative overflow-hidden h-full">
        {/* Sidebar */}
        <div className="w-[80px] flex-shrink-0 bg-white border-r border-stone-200 overflow-y-auto no-scrollbar pb-24 flex flex-col items-center py-4 space-y-3 z-10">
          {itinerary.map((item, index) => {
            return (
              <button
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => setSelectedDayId(item.id)}
                className={`w-16 h-24 rounded-lg flex flex-col items-center justify-center gap-1 transition-all relative group cursor-grab active:cursor-grabbing border ${
                  selectedDayId === item.id 
                    ? 'bg-stone-600 border-stone-600 text-white shadow-md scale-105' 
                    : 'bg-white border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-600'
                } ${draggedDayIndex === index ? 'opacity-50 border-dashed border-stone-400' : ''}`}
              >
                <div className={`mb-1 ${selectedDayId === item.id ? 'text-stone-200' : 'text-stone-300'}`}>
                   {getDayIconComponent(item.icon)}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  DAY {index + 1}
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="flex-1 bg-[#f7f5f3] h-full relative overflow-hidden">
          <ItineraryCard 
            item={selectedItem} 
            onUpdate={handleItineraryUpdate}
            onActivityUpdate={handleActivityUpdate}
            onActivityAdd={handleActivityAdd}
            onActivityDelete={handleActivityDelete}
            onActivitiesReorder={handleActivitiesReorder}
          />
        </div>
      </div>
    );
  };

  const renderInfo = () => {
    const myPackList = packingList.filter(item => item.owner === selectedPacker);
    const completedCount = myPackList.filter(i => i.checked).length;
    const isPin = selectedPacker === 'Pin';
    const barColor = isPin ? 'bg-[#c5b5a2]' : 'bg-[#c9a7a7]';

    return (
    <div className="p-6 pb-24 space-y-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-y-auto h-full no-scrollbar bg-[#f7f5f3]">
      <div className="flex items-center space-x-2 mb-2">
        <Info className="text-stone-600" size={24} />
        <h2 className="text-2xl font-bold text-stone-700">旅程資訊</h2>
      </div>

      <section>
        <h3 className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
          <QrCode className="mr-2" size={14} /> 入境手續
        </h3>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
           <div>
              <h4 className="font-bold text-stone-700">Visit Japan Web</h4>
              <p className="text-xs text-stone-500 mt-1">入境審查與海關申報</p>
           </div>
           <a 
             href="https://www.vjw.digital.go.jp/main/#/vjwplo001" 
             target="_blank"
             rel="noreferrer"
             className="flex items-center text-xs text-white bg-stone-600 hover:bg-stone-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
           >
             前往填寫
           </a>
        </div>
      </section>
      
      <section>
        <h3 className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
          <Plane className="mr-2" size={14} /> 航班資訊
        </h3>
        <div className="space-y-4">
          {FLIGHTS.map((flight, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-stone-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-stone-700 text-lg">{flight.airline}</h4>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-stone-500 font-mono font-bold">{flight.flightNo}</span>
                    <span className="text-xs text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">{flight.terminal}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-stone-700 font-bold text-lg">{flight.time}</p>
                  <p className="text-xs text-stone-500 mt-1">{flight.route}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
          <Hotel className="mr-2" size={14} /> 住宿資訊
        </h3>
        <div className="space-y-4">
          {HOTELS.map((hotel, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
              <div>
                 <h4 className="font-bold text-stone-700">{hotel.name}</h4>
                 <p className="text-xs text-stone-500 mt-1">{hotel.address}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs font-bold text-stone-600 bg-stone-100 border border-stone-200 px-2 py-1 rounded inline-block">{hotel.dates}</p>
                <button 
                  onClick={() => openGoogleMaps(hotel.name, 'driving')}
                  className="flex items-center text-xs text-stone-100 bg-[#7d8c94] hover:bg-[#6b7980] px-3 py-1.5 rounded-full shadow-sm transition-colors"
                >
                  <Navigation size={12} className="mr-1" />
                  導航
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
         <h3 className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
          <Luggage className="mr-2" size={14} /> 行李清單
        </h3>
        
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
           <div className="flex border-b border-stone-200">
              {(['Pin', 'Yowei'] as const).map(p => {
                 const isActive = selectedPacker === p;
                 const activeClass = p === 'Pin' ? 'bg-[#e8ded1] text-[#8a7967]' : 'bg-[#e2d2d2] text-[#8a6868]';
                 return (
                   <button
                     key={p}
                     onClick={() => setSelectedPacker(p)}
                     className={`flex-1 py-3 flex items-center justify-center transition-all ${isActive ? activeClass : 'text-stone-400 hover:bg-stone-50'}`}
                   >
                     <MemberAvatar member={p} size={24} active={isActive} />
                     <span className="text-sm font-bold ml-2">{p}</span>
                   </button>
                 );
              })}
           </div>

           <div className="p-4 bg-stone-50">
              <div className="flex justify-between text-xs mb-1.5 px-1">
                 <span className="font-bold text-stone-500">完成度</span>
                 <span className="font-bold text-stone-600">{myPackList.length > 0 ? Math.round((completedCount / myPackList.length) * 100) : 0}%</span>
              </div>
              <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden mb-4">
                 <div 
                   className={`h-full transition-all duration-500 ${barColor}`} 
                   style={{ width: `${myPackList.length > 0 ? (completedCount / myPackList.length) * 100 : 0}%` }}
                 />
              </div>

              <div className="flex gap-2 mb-4">
                <input 
                  value={newPackItem}
                  onChange={(e) => setNewPackItem(e.target.value)}
                  placeholder="新增行李項目..."
                  className="flex-1 text-sm px-3 py-2 rounded-lg border border-stone-300 outline-none focus:border-stone-400 bg-white placeholder:text-stone-400"
                  onKeyDown={(e) => e.key === 'Enter' && addPackItem()}
                />
                <button onClick={addPackItem} className={`px-3 py-2 rounded-lg text-white shadow-sm transition-colors ${barColor} hover:opacity-90`}>
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-2">
                 {myPackList.map(item => (
                   <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-stone-200 shadow-sm group hover:border-stone-300 transition-colors">
                      <button onClick={() => togglePackItem(item.id)} className="flex items-center space-x-3 flex-1 text-left">
                         {item.checked ? <CheckCircle2 className="text-[#a0b0a5]" size={18} /> : <Circle className="text-stone-300" size={18} />}
                         <span className={`text-sm ${item.checked ? 'text-stone-400 line-through decoration-stone-300' : 'text-stone-700'}`}>{item.name}</span>
                      </button>
                      <button onClick={() => removePackItem(item.id)} className="text-stone-300 hover:text-[#d96b6b] p-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={14} />
                      </button>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </section>
    </div>
  );
  };

  const renderShopping = () => {
    const shoppers: ShoppingOwner[] = ['Pin', 'Yowei'];
    const currentItems = shoppingList.filter(item => 
      selectedShopper === 'Pin' ? (item.owner === 'Pin' || !item.owner) : item.owner === 'Yowei'
    );
    const calculateTotal = (owner: ShoppingOwner) => {
        return shoppingList
            .filter(item => owner === 'Pin' ? (item.owner === 'Pin' || !item.owner) : item.owner === 'Yowei')
            .reduce((acc, curr) => acc + ((curr.price || 0) * (curr.quantity || 1)), 0);
    };
    const currentTotalCost = calculateTotal(selectedShopper);
    const isPin = selectedShopper === 'Pin';
    const headerColor = isPin ? 'text-[#8a7967]' : 'text-[#8a6868]';
    const buttonColor = isPin ? 'bg-[#c5b5a2]' : 'bg-[#c9a7a7]';

    return (
      <div className="flex flex-1 bg-[#f7f5f3] relative overflow-hidden h-full">
         {/* Sidebar for Shoppers */}
         <div className="w-1/4 bg-white border-r border-stone-200 overflow-y-auto no-scrollbar pt-2">
            {shoppers.map(shopper => {
               const total = calculateTotal(shopper);
               const isSelected = selectedShopper === shopper;
               
               return (
                 <button
                   key={shopper}
                   onClick={() => setSelectedShopper(shopper)}
                   className={`w-full text-center py-6 px-1 transition-all relative group flex flex-col items-center ${
                     isSelected ? 'bg-stone-50' : 'text-stone-400 hover:text-stone-600'
                   }`}
                 >
                   {isSelected && (
                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-stone-400 rounded-r-full" />
                   )}
                   <div className="mb-2">
                      <MemberAvatar member={shopper} size={48} active={isSelected} />
                   </div>
                   <span className={`block text-sm font-bold ${isSelected ? 'text-stone-700' : 'text-stone-400'}`}>
                     {shopper}
                   </span>
                   <span className="text-[10px] font-mono mt-1 opacity-60">
                     ¥{total > 1000 ? (total/1000).toFixed(1) + 'k' : total}
                   </span>
                 </button>
               );
            })}
         </div>

         {/* Main List Area */}
         <div className="w-3/4 bg-[#f7f5f3] h-full flex flex-col relative">
            <div className={`p-4 border-b border-stone-200 bg-white sticky top-0 z-10 transition-colors duration-300 shadow-sm`}>
                <div className="flex justify-between items-end">
                   <div>
                       <h2 className={`text-xl font-bold ${headerColor}`}>{selectedShopper} 的清單</h2>
                       <p className="text-xs text-stone-500 mt-1">{currentItems.length} 個項目</p>
                   </div>
                   <div className="text-right">
                       <p className="text-[10px] text-stone-400 uppercase tracking-wider">預估總額</p>
                       <p className={`text-lg font-mono font-bold ${headerColor}`}>¥{currentTotalCost.toLocaleString()}</p>
                   </div>
                </div>

                <div className="mt-4 flex bg-stone-50 rounded-lg border border-stone-200 p-1">
                    <input 
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={`幫 ${selectedShopper} 新增...`}
                      className="flex-1 bg-transparent px-3 py-2 outline-none text-stone-800 text-sm placeholder:text-stone-400"
                      onKeyDown={(e) => e.key === 'Enter' && addShopItem()}
                    />
                    <button onClick={addShopItem} className={`${buttonColor} text-white rounded-md px-3 transition-colors shadow-sm`}>
                      <Plus size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar space-y-3">
              {currentItems.map(item => (
                <div key={item.id} className={`bg-white p-3 rounded-xl border transition-all duration-300 ${item.checked ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-stone-200 shadow-sm'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3 cursor-pointer flex-1" onClick={() => toggleShopItem(item.id)}>
                      {item.checked ? <CheckCircle2 className="text-[#a0b0a5] flex-shrink-0" size={20} /> : <Circle className="text-stone-300 flex-shrink-0" size={20} />}
                      <span className={`text-sm ${item.checked ? 'line-through text-stone-400' : 'text-stone-800 font-bold'}`}>{item.name}</span>
                    </div>
                    <button onClick={() => removeShopItem(item.id)} className="text-stone-300 hover:text-[#d96b6b] p-1.5 hover:bg-stone-50 rounded-full transition-colors flex-shrink-0"><Trash2 size={14} /></button>
                  </div>
                  
                  <div className="flex items-center gap-2 pl-8">
                      <div className="flex items-center bg-stone-50 rounded px-2 py-1 border border-stone-100">
                         <span className="text-[10px] text-stone-400 mr-1">數量</span>
                         <input 
                           type="number" 
                           defaultValue={item.quantity || 1}
                           onBlur={(e) => updateShopItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                           className="w-8 text-center bg-transparent text-xs font-bold text-stone-700 outline-none"
                         />
                      </div>
                      <div className="flex items-center bg-stone-50 rounded px-2 py-1 border border-stone-100 flex-1">
                         <span className="text-[10px] text-stone-400 mr-1">單價 ¥</span>
                         <input 
                           type="number" 
                           defaultValue={item.price || ''}
                           onBlur={(e) => updateShopItem(item.id, 'price', parseInt(e.target.value))}
                           placeholder="0"
                           className="w-full bg-transparent text-xs font-mono font-bold text-stone-700 outline-none"
                         />
                      </div>
                  </div>

                  <div className="mt-2 pl-8 pt-2 border-t border-stone-100 flex items-center">
                     <StickyNote size={12} className="text-stone-300 mr-2 flex-shrink-0" />
                     <input 
                       defaultValue={item.note || ''}
                       onBlur={(e) => updateShopItem(item.id, 'note', e.target.value)}
                       placeholder="備註 (規格、顏色...)"
                       className="w-full bg-transparent text-xs text-stone-600 outline-none placeholder:text-stone-300"
                     />
                  </div>
                </div>
              ))}
              
              {currentItems.length === 0 && (
                <div className="text-center py-8 border border-dashed border-stone-300 rounded-xl text-xs text-stone-400 mx-1">
                   {selectedShopper} 的購物車是空的 🛒
                </div>
              )}
            </div>
         </div>
      </div>
    );
  };

  const renderExpenses = () => {
    const { balances, totalSpent } = calculateSettlement();
    const balanceYowei = balances['Yowei'] || 0;
    const balancePin = balances['Pin'] || 0;

    return (
      <div className="p-6 pb-24 h-full flex flex-col max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[#f7f5f3]">
         {/* Toggle View */}
         <div className="flex items-center bg-white p-1 rounded-lg mb-4 border border-stone-200 shadow-sm">
             <button 
               onClick={() => setExpenseView('entry')}
               className={`flex-1 flex items-center justify-center text-xs font-bold py-2 rounded-md transition-all ${expenseView === 'entry' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
             >
                <PenLine size={14} className="mr-2" />
                記帳輸入
             </button>
             <button 
               onClick={() => setExpenseView('list')}
               className={`flex-1 flex items-center justify-center text-xs font-bold py-2 rounded-md transition-all ${expenseView === 'list' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
             >
                <List size={14} className="mr-2" />
                已登帳明細
             </button>
         </div>

         {/* ENTRY VIEW */}
         {expenseView === 'entry' && (
             <div className="space-y-6">
                 {/* Dashboard */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#57534e] p-4 rounded-xl shadow-md text-white relative overflow-hidden">
                        <div className="absolute -right-2 -top-2 opacity-10 rotate-12"><Banknote size={60}/></div>
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">Total Cost (TWD)</p>
                        <p className="text-2xl font-bold mt-1 font-mono">${Math.round(totalSpent).toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-2">Settlement</p>
                    {balanceYowei > 0 ? (
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-1 text-xs text-stone-600 font-bold mb-1">
                                <MemberAvatar member="Pin" size={16} />
                                <span>給</span>
                                <MemberAvatar member="Yowei" size={16} />
                            </div>
                            <span className="text-[#8a6868] font-mono text-lg font-bold">${Math.round(balanceYowei).toLocaleString()}</span>
                        </div>
                    ) : balancePin > 0 ? (
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-1 text-xs text-stone-600 font-bold mb-1">
                                <MemberAvatar member="Yowei" size={16} />
                                <span>給</span>
                                <MemberAvatar member="Pin" size={16} />
                            </div>
                            <span className="text-[#8a7967] font-mono text-lg font-bold">${Math.round(balancePin).toLocaleString()}</span>
                        </div>
                    ) : (
                        <p className="text-xs text-stone-400 flex items-center"><CheckCircle2 size={12} className="mr-1 text-[#a0b0a5]" /> 目前結清！</p>
                    )}
                    </div>
                </div>

                {/* Rate Setting */}
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex items-center text-xs font-bold text-stone-600">
                    <JapaneseYen size={14} className="mr-1" />
                    匯率設定
                    </div>
                    <div className="flex items-center">
                    <span className="text-xs text-stone-400 mr-2">1 JPY ≈</span>
                    <input 
                        type="number" 
                        step="0.001"
                        value={currentRate}
                        onChange={(e) => handleRateUpdate(parseFloat(e.target.value))}
                        className="w-16 text-center bg-stone-50 border border-stone-200 rounded text-sm py-1 font-mono font-bold text-stone-700 focus:border-stone-400 outline-none"
                    />
                    <span className="text-xs text-stone-400 ml-1">TWD</span>
                    </div>
                </div>

                {/* Input Form */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-200 space-y-4">
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <input 
                            value={expName}
                            onChange={(e) => setExpName(e.target.value)}
                            placeholder="品項名稱"
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 text-stone-800"
                            />
                        </div>
                        <div className="relative w-1/3 flex items-center gap-1">
                            {isAddingCategory ? (
                            <div className="flex items-center flex-1 space-x-1 animate-in fade-in zoom-in duration-200">
                                <input 
                                autoFocus
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="名稱"
                                className="w-full min-w-0 bg-stone-50 border border-stone-400 rounded-lg px-2 py-2 text-sm outline-none"
                                />
                                <button onClick={handleAddCategory} className="bg-stone-500 text-white p-2 rounded-lg flex-shrink-0"><Check size={14}/></button>
                                <button onClick={() => setIsAddingCategory(false)} className="bg-stone-200 text-stone-500 p-2 rounded-lg flex-shrink-0"><X size={14}/></button>
                            </div>
                            ) : (
                            <>
                                <select 
                                value={expCategory}
                                onChange={(e) => setExpCategory(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none appearance-none text-stone-800"
                                >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button 
                                onClick={() => setIsAddingCategory(true)}
                                className="bg-stone-50 border border-stone-200 text-stone-400 hover:bg-stone-200 hover:text-stone-600 p-2 rounded-lg transition-colors flex-shrink-0"
                                >
                                <Plus size={16} />
                                </button>
                            </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-stone-50 rounded-lg border border-stone-200 p-1">
                            {(['JPY', 'TWD'] as Currency[]).map(curr => (
                            <button
                                key={curr}
                                onClick={() => setExpCurrency(curr)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${expCurrency === curr ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400'}`}
                            >
                                {curr}
                            </button>
                            ))}
                        </div>
                        <input 
                            type="number"
                            value={expAmount}
                            onChange={(e) => setExpAmount(e.target.value)}
                            placeholder="金額"
                            className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-stone-400 font-mono text-stone-800 font-bold text-lg"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                        <div className="flex items-center space-x-2">
                            <span className="text-stone-400 font-bold mr-1">付款:</span>
                            {MEMBERS.map(m => {
                                const isSelected = expPayer === m;
                                return (
                                    <button 
                                        key={m} 
                                        onClick={() => setExpPayer(m)}
                                        className={`rounded-full transition-all ${isSelected ? 'scale-110 shadow-sm ring-2 ring-stone-100' : 'opacity-60 grayscale'}`}
                                    >
                                        <MemberAvatar member={m} size={32} active={isSelected} />
                                    </button>
                                )
                            })}
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-stone-400 font-bold mr-1">分攤:</span>
                            {MEMBERS.map(m => {
                            const isSelected = expSharedBy.includes(m);
                            return (
                                <button 
                                    key={m} 
                                    onClick={() => toggleSharedBy(m)}
                                    className={`rounded-full transition-all ${isSelected ? 'shadow-sm' : 'opacity-40 grayscale'}`}
                                >
                                    <MemberAvatar member={m} size={28} active={isSelected} />
                                </button>
                            );
                            })}
                        </div>
                    </div>

                    <button 
                        onClick={addExpense}
                        className="w-full bg-[#57534e] text-white rounded-lg py-3 text-sm font-bold hover:bg-[#44403c] transition-colors shadow-sm mt-2 flex justify-center items-center active:translate-y-0.5 active:shadow-none"
                    >
                        <Plus size={16} className="mr-1" /> 新增帳目
                    </button>
                </div>
             </div>
         )}

         {/* LIST VIEW */}
         {expenseView === 'list' && (
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
              {expenses.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 border border-dashed border-stone-300 rounded-xl">
                      還沒有記帳紀錄 📝
                  </div>
              ) : (
                expenses.map(item => {
                    const rawPayer = (item.payer as string) || 'Pin';
                    const payer = normalizeMember(rawPayer);
                    const rawSharedBy = (item.sharedBy as string[]) || ['Pin', 'Yowei'];
                    const sharedBy = rawSharedBy.map(normalizeMember);

                    return (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative group">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold mr-2 ${
                                item.category === '餵豬' ? 'bg-[#e0c9bc]' : 
                                item.category === '買快樂' ? 'bg-[#e2d2d2]' : 
                                item.category === '交通' ? 'bg-[#c4ced4]' : 'bg-stone-400'
                                }`}>
                                {item.category}
                                </span>
                                <span className="font-bold text-stone-800 text-sm">{item.name}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-stone-800 font-bold text-sm">NT$ {item.calculatedAmountTWD?.toLocaleString()}</p>
                                {item.currency === 'JPY' && (
                                <p className="text-[10px] text-stone-400">¥{item.originalAmount?.toLocaleString()}</p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-end mt-2">
                            <div className="flex items-center space-x-2 text-[10px] text-stone-400">
                                {/* Payer Icon */}
                                <div className="flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-full border border-stone-100">
                                    <MemberAvatar member={payer as Member} size={14} />
                                    <span className="font-bold text-[9px] text-stone-600">{payer}</span>
                                </div>
                                
                                <ArrowRightLeft size={10} className="text-stone-300" />
                                
                                {/* Shared By Icons */}
                                <div className="flex -space-x-1.5 pl-1">
                                    {sharedBy.map((m, i) => (
                                      <div key={i} className="relative z-0 hover:z-10 transition-all">
                                         <MemberAvatar member={m as Member} size={16} />
                                      </div>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => removeExpense(item.id)} className="text-stone-300 hover:text-[#d96b6b] p-1.5 bg-stone-50 rounded-lg hover:bg-[#ffeaea] transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                        </div>
                    );
                })
              )}
            </div>
         )}
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#f7f5f3] text-stone-800 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative">
      <nav className="bg-white border-b border-stone-200 flex justify-between items-center px-2 py-1 sticky top-0 z-30 shadow-sm">
        <div className="flex w-full">
          {[
            { id: Tab.ITINERARY, icon: Map, label: '每日行程' },
            { id: Tab.INFO, icon: Info, label: '旅程資訊' },
            { id: Tab.SHOPPING, icon: ShoppingBag, label: '購物清單' },
            { id: Tab.EXPENSES, icon: CreditCard, label: '魔法小卡' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className="flex-1 flex flex-col items-center justify-center py-2 relative transition-all group"
            >
              <div className={`mb-1 transition-transform group-active:scale-95 ${activeTab === tab.id ? 'text-stone-600' : 'text-stone-300'}`}>
                 <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold ${activeTab === tab.id ? 'text-stone-800' : 'text-stone-400'}`}>{tab.label}</span>
              {activeTab === tab.id && <span className="absolute bottom-0 w-8 h-0.5 bg-stone-600 rounded-full" />}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative bg-[#f7f5f3]">
        {activeTab === Tab.ITINERARY && renderItinerary()}
        {activeTab === Tab.INFO && renderInfo()}
        {activeTab === Tab.SHOPPING && renderShopping()}
        {activeTab === Tab.EXPENSES && renderExpenses()}
      </main>

      {/* Subtle Sync Indicator at Bottom Right */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur rounded-full border border-stone-100 shadow-sm pointer-events-none z-50 opacity-60">
         <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-[#a0b0a5]' : status === 'error' ? 'bg-[#d96b6b]' : 'bg-[#e0c9bc] animate-pulse'}`} />
         <span className="text-[9px] text-stone-400 font-mono uppercase">{status === 'connected' ? 'SYNC' : '...'}</span>
      </div>
    </div>
  );
};

export default App;
