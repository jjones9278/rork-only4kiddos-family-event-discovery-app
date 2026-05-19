export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
  address: string;
  price: number;
  ageRange: {
    min: number;
    max: number;
  };
  category: EventCategory;
  hostName: string;
  hostImage: string;
  capacity: number;
  spotsLeft: number;
  tags: string[];
  accessibilityFeatures: string[];
  isFavorite: boolean;
  latitude?: number;
  longitude?: number;
}

export type EventCategory = 
  | 'outdoor'
  | 'indoor'
  | 'educational'
  | 'sports'
  | 'arts'
  | 'music'
  | 'party'
  | 'workshop'
  | 'playdate';

export interface Child {
  id: string;
  name: string;
  age: number;
  interests: string[];
  allergies?: string[];
  specialNeeds?: string[];
  avatarColor: string;
}

export interface Booking {
  id: string;
  eventId: string;
  childIds: string[];
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate: string;
  totalAmount: number;
}

export interface Filter {
  ageRange?: { min: number; max: number };
  categories?: EventCategory[];
  dateRange?: { start: Date; end: Date };
  priceRange?: { min: number; max: number };
  distance?: number;
  accessibility?: string[];
}