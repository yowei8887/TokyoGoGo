
export type ActivityType = 'spot' | 'food' | 'transport' | 'shopping' | 'accommodation';

export interface Activity {
  id: string;
  time: string; // e.g., "10:00", "上午", "下午"
  title: string;
  description: string;
  type: ActivityType;
  tags?: string[]; // e.g., ["必吃", "必逛"]
  aiNotes?: string; // Cache for specific AI tips for this activity
}

export interface ItineraryItem {
  id: string;
  date: string;
  dayLabel: string; // e.g., "Day 1" or "12/23"
  icon?: string; // Icon name for the day (e.g., 'plane', 'ski', 'fuji')
  location: string; // Main Title/Location summary
  transport: string; // General transport info
  accommodation: string;
  notes: string;
  weather?: string; // Cache for weather info
  activities: Activity[]; // Detailed timeline
}

// --- NEW EXPENSE TYPES ---
export type Currency = 'TWD' | 'JPY';
export type ExpenseCategory = string; // Changed from union to string to support custom categories
export type Member = 'Pin' | 'Yowei';

// Sticker Types
export type StickerMood = 'default' | 'happy' | 'eating' | 'sleeping' | 'traveling' | 'shopping' | 'shock';

export interface ExpenseItem {
  id: string;
  name: string;
  originalAmount: number;
  currency: Currency;
  exchangeRate: number; // The rate used when this record was created
  calculatedAmountTWD: number; // The final TWD amount
  category: ExpenseCategory;
  payer: Member | string; // Allow string for backward compatibility
  sharedBy: (Member | string)[]; // List of members who share this expense
  date: string;
}

export type ShoppingOwner = 'Pin' | 'Yowei';

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  owner: ShoppingOwner; // Who wants this?
  quantity: number;     // How many?
  price?: number;       // Price in JPY (estimated or actual)
  note?: string;        // Memo for color, size, etc.
}

export interface FlightInfo {
  airline: string;
  flightNo: string;
  route: string;
  time: string;
  terminal: string;
}

export interface HotelInfo {
  name: string;
  dates: string;
  address?: string;
}

export interface PackingItem {
  id: string;
  name: string;
  checked: boolean;
  owner: 'Pin' | 'Yowei';
}

export enum Tab {
  ITINERARY = 'itinerary',
  INFO = 'info',
  SHOPPING = 'shopping',
  EXPENSES = 'expenses'
}