
import React, { useState, useEffect } from 'react';
import { ItineraryItem, Activity, ActivityType } from '../types';
import { 
  MapPin, 
  Utensils, 
  Bed, 
  Sparkles, 
  CloudSun, 
  ShoppingBag,
  Train,
  Plus,
  Trash2,
  Navigation,
  Edit2,
  Check,
  RefreshCw,
  GripVertical
} from 'lucide-react';
import { getWeatherPrediction } from '../services/geminiService';

interface ItineraryCardProps {
  item: ItineraryItem;
  onUpdate: (id: string, field: keyof ItineraryItem, value: any) => void;
  onActivityUpdate: (dayId: string, activityId: string, activity: Activity) => void;
  onActivityAdd: (dayId: string) => void;
  onActivityDelete: (dayId: string, activityId: string) => void;
  onActivitiesReorder?: (dayId: string, newActivities: Activity[]) => void;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ 
  item, 
  onUpdate,
  onActivityUpdate,
  onActivityAdd,
  onActivityDelete,
  onActivitiesReorder
}) => {
  const [weather, setWeather] = useState<string>(item.weather || "讀取中...");
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);
  const [draggedActivityIndex, setDraggedActivityIndex] = useState<number | null>(null);

  const fetchWeather = async () => {
    setIsRefreshingWeather(true);
    setWeather("更新中...");
    const w = await getWeatherPrediction(item.date, item.location);
    setWeather(w);
    onUpdate(item.id, 'weather', w);
    setIsRefreshingWeather(false);
  };

  // Auto-fetch weather if missing
  useEffect(() => {
    if (!item.weather || item.weather === "讀取中...") {
      fetchWeather();
    } else {
      setWeather(item.weather);
    }
  }, [item.id, item.location]);

  const openGoogleMaps = (loc: string, mode: 'search' | 'driving' = 'search') => {
    const query = encodeURIComponent(loc.trim());
    const url = mode === 'driving' 
      ? `https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'food': return <Utensils size={14} className="text-[#8c6b5d]" />;
      case 'shopping': return <ShoppingBag size={14} className="text-[#8a6868]" />;
      case 'transport': return <Train size={14} className="text-[#5d707a]" />;
      case 'accommodation': return <Bed size={14} className="text-[#6d647a]" />;
      default: return <MapPin size={14} className="text-[#6b7a5d]" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    // Morandi / Muted Palette
    switch (type) {
      case 'food': return 'bg-[#e0c9bc] border-[#d4b5a3]'; // Muted Terracotta
      case 'shopping': return 'bg-[#e2d2d2] border-[#d6bfbf]'; // Dusty Rose
      case 'transport': return 'bg-[#c4ced4] border-[#b0bec6]'; // Hazy Blue
      case 'accommodation': return 'bg-[#dcd6e0] border-[#cecad6]'; // Muted Lavender
      default: return 'bg-[#ccd5ae] border-[#bdc99e]'; // Sage Green
    }
  };

  // DnD Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (editingActivityId) {
        e.preventDefault();
        return;
    }
    setDraggedActivityIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Make transparent
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedActivityIndex(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedActivityIndex === null || draggedActivityIndex === dropIndex) return;
    
    if (onActivitiesReorder) {
        const newActivities = [...item.activities];
        const [movedItem] = newActivities.splice(draggedActivityIndex, 1);
        newActivities.splice(dropIndex, 0, movedItem);
        onActivitiesReorder(item.id, newActivities);
    }
    setDraggedActivityIndex(null);
  };

  return (
    <div className="h-full overflow-y-auto p-5 no-scrollbar pb-32 bg-[#f7f5f3] relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#f7f5f3]/95 backdrop-blur-sm p-4 -m-5 mb-2 border-b border-stone-200 z-20 shadow-sm">
        <div className="flex-1 mr-4">
          <input 
            value={item.location}
            onChange={(e) => onUpdate(item.id, 'location', e.target.value)}
            className="text-xl font-bold text-stone-700 tracking-wide bg-transparent outline-none border-b border-transparent focus:border-stone-400 w-full placeholder:text-stone-400 transition-colors"
            placeholder="輸入地點..."
          />
          <div className="text-xs text-stone-500 mt-1 font-medium">{item.date} {item.transport}</div>
        </div>
        <button 
          onClick={fetchWeather}
          className="bg-white text-stone-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center border border-stone-200 shadow-sm hover:bg-stone-50 transition-colors flex-shrink-0"
        >
          {isRefreshingWeather ? <RefreshCw size={14} className="mr-1.5 animate-spin text-stone-400" /> : <CloudSun size={14} className="mr-1.5 text-stone-400" />}
          <span>{weather}</span>
        </button>
      </div>

      {/* Timeline Activities */}
      <div className="relative pl-4 space-y-6 mt-6">
        {/* Vertical Line */}
        <div className="absolute left-[27px] top-2 bottom-0 w-[2px] border-l-2 border-dashed border-stone-300" />

        {item.activities.map((activity, index) => (
          <div 
            key={activity.id} 
            className={`relative flex items-start group transition-all duration-200 ${draggedActivityIndex === index ? 'opacity-40 scale-95' : ''}`}
            draggable={!editingActivityId}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            
            {/* Timeline Icon */}
            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm mr-4 ${getActivityColor(activity.type)} cursor-grab active:cursor-grabbing`}>
              {getActivityIcon(activity.type)}
            </div>

            {/* Content Card */}
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-stone-200 hover:border-stone-300 transition-all relative">
              
              {/* Drag Handle Indicator (Only in view mode) */}
              {!editingActivityId && (
                  <div className="absolute top-2 right-2 text-stone-200 cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={14} />
                  </div>
              )}

              {editingActivityId === activity.id ? (
                // EDIT MODE
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input 
                      value={activity.time}
                      onChange={(e) => onActivityUpdate(item.id, activity.id, { ...activity, time: e.target.value })}
                      className="w-1/3 text-xs bg-stone-50 p-2 rounded-lg outline-none border border-stone-200 focus:border-stone-400 text-stone-700"
                      placeholder="時間"
                    />
                    <select 
                      value={activity.type}
                      onChange={(e) => onActivityUpdate(item.id, activity.id, { ...activity, type: e.target.value as ActivityType })}
                      className="w-2/3 text-xs bg-stone-50 p-2 rounded-lg outline-none border border-stone-200 focus:border-stone-400 text-stone-700"
                    >
                      <option value="spot">景點</option>
                      <option value="food">美食</option>
                      <option value="shopping">購物</option>
                      <option value="transport">交通</option>
                      <option value="accommodation">住宿</option>
                    </select>
                  </div>
                  <input 
                    value={activity.title}
                    onChange={(e) => onActivityUpdate(item.id, activity.id, { ...activity, title: e.target.value })}
                    className="w-full font-bold text-stone-700 bg-stone-50 p-2 rounded-lg outline-none border border-stone-200 focus:border-stone-400"
                    placeholder="標題"
                  />
                  <textarea 
                    value={activity.description}
                    onChange={(e) => onActivityUpdate(item.id, activity.id, { ...activity, description: e.target.value })}
                    className="w-full text-sm text-stone-600 bg-stone-50 p-2 rounded-lg outline-none border border-stone-200 focus:border-stone-400"
                    rows={2}
                    placeholder="描述"
                  />
                  {/* Manual AI Note / Guide Input */}
                  <textarea 
                    value={activity.aiNotes || ''}
                    onChange={(e) => onActivityUpdate(item.id, activity.id, { ...activity, aiNotes: e.target.value })}
                    className="w-full text-xs text-[#8a7967] bg-[#f5f0e6] p-2 rounded-lg outline-none border border-[#e6dcc8] placeholder:text-[#d4c5b0]"
                    rows={2}
                    placeholder="攻略 / 筆記 (必吃、必買...)"
                  />
                  <div className="flex justify-end pt-2">
                     <button onClick={() => setEditingActivityId(null)} className="text-stone-600 p-1 bg-stone-100 rounded-lg hover:bg-stone-200">
                       <Check size={16} />
                     </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <>
                  <div className="flex justify-between items-start mb-2 pr-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-stone-500 tracking-wider mb-0.5 bg-stone-100 px-1.5 py-0.5 rounded w-fit">
                        {activity.time}
                      </span>
                      <h3 className="font-bold text-stone-700 text-lg">{activity.title}</h3>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 z-10">
                      <button onClick={() => setEditingActivityId(activity.id)} className="text-stone-400 hover:text-stone-600 p-1.5 hover:bg-stone-50 rounded-full transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => onActivityDelete(item.id, activity.id)} className="text-stone-400 hover:text-[#d96b6b] p-1.5 hover:bg-stone-50 rounded-full transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-stone-600 leading-relaxed mb-3 font-medium">
                    {activity.description}
                  </p>

                  {/* Tags */}
                  {activity.tags && activity.tags.length > 0 && (
                     <div className="flex gap-1.5 mb-3 flex-wrap">
                        {activity.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-500 border border-stone-200 rounded-full">
                            #{tag}
                          </span>
                        ))}
                     </div>
                  )}

                  {/* Manual Note Section */}
                  {activity.aiNotes && (
                    <div className="bg-[#fcf9f2] p-3 rounded-lg border border-[#f0eadd] mb-3 flex items-start gap-2">
                      <Sparkles size={14} className="text-[#cbb592] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">{activity.aiNotes}</p>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-end border-t border-stone-100 pt-3 mt-1">
                     <button 
                       onClick={() => openGoogleMaps(activity.title, 'driving')}
                       className="flex items-center justify-center text-xs text-stone-100 bg-[#7d8c94] hover:bg-[#6b7980] transition-colors w-8 h-8 rounded-full shadow-sm hover:shadow-md"
                       title="導航"
                     >
                       <Navigation size={14} />
                     </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        
        {/* Add Button */}
        <button 
          onClick={() => onActivityAdd(item.id)}
          className="ml-12 w-[calc(100%-3rem)] border border-dashed border-stone-300 rounded-xl p-3 flex items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 transition-all bg-white hover:bg-stone-50"
        >
          <Plus size={16} className="mr-2" />
          <span className="text-xs font-bold">新增行程</span>
        </button>

      </div>

      {/* Global Day Notes */}
      <div className="mt-8 ml-12 mb-8 relative">
        <div className="absolute -top-3 left-4 bg-[#f7f5f3] px-2 text-xs font-bold text-stone-400 z-10">MEMO</div>
        <textarea
          className="w-full text-sm text-stone-700 bg-white border border-stone-300 rounded-xl p-4 outline-none focus:border-stone-400 transition-colors resize-none shadow-sm"
          value={item.notes}
          onChange={(e) => onUpdate(item.id, 'notes', e.target.value)}
          rows={3}
          placeholder="寫點筆記..."
        />
      </div>

    </div>
  );
};

export default ItineraryCard;
