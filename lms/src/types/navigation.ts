import { LucideIcon } from 'lucide-react';
import { UserRole } from './roles';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  roles?: UserRole[];
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
  roles?: UserRole[];
}
