import { EventCategory } from '@/types/event';

export interface CategoryInfo {
  id: EventCategory;
  name: string;
  icon: string;
  color: string;
}

export const categories: CategoryInfo[] = [
  { id: 'outdoor', name: 'Outdoor', icon: 'Trees', color: '#10B981' },
  { id: 'indoor', name: 'Indoor', icon: 'Home', color: '#8B5CF6' },
  { id: 'educational', name: 'Educational', icon: 'GraduationCap', color: '#3B82F6' },
  { id: 'sports', name: 'Sports', icon: 'Trophy', color: '#EF4444' },
  { id: 'arts', name: 'Arts', icon: 'Palette', color: '#EC4899' },
  { id: 'music', name: 'Music', icon: 'Music', color: '#F59E0B' },
  { id: 'party', name: 'Party', icon: 'PartyPopper', color: '#FF6B6B' },
  { id: 'workshop', name: 'Workshop', icon: 'Wrench', color: '#6366F1' },
  { id: 'playdate', name: 'Playdate', icon: 'Users', color: '#14B8A6' },
];