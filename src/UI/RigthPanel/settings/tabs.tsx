import { Sun, Camera, Move3D, Palette } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import type { SettingsTab } from '../../../core/ui';
import RenderPanel from './RenderPanel';
import CameraPanel from './CameraPanel';
import TransformPanel from './TransformPanel';
import MaterialPanel from './MaterialPanel';

export interface TabDef {
  id: SettingsTab;
  label: string;
  icon: ReactNode;
  component: ComponentType;
}

export const TABS: TabDef[] = [
  { id: 'render', label: 'Render', icon: <Sun size={18} />, component: RenderPanel },
  { id: 'camera',    label: 'Camera',    icon: <Camera size={18} />,   component: CameraPanel },
  { id: 'transform', label: 'Transform', icon: <Move3D size={18} />,   component: TransformPanel },
  { id: 'material',  label: 'Material',  icon: <Palette size={18} />,  component: MaterialPanel },
];