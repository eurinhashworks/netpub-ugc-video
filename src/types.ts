export enum PortfolioCategory {
  PHOTO_UGC = 'Photo UGC',
  PHOTO_MODE = 'Photo Mode',
  PHOTO_SPOT_PUBLICITAIRE = 'Photo Spot Publicitaire',
  VIDEO_UGC = 'Vidéo UGC',
  VIDEO_MODE = 'Vidéo Mode',
  VIDEO_SPOT_PUBLICITAIRE = 'Spot Publicitaire 4K',
  INFLUENCEUSES = 'Influenceuses',
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface PortfolioProject {
  id: number;
  title: string;
  category: PortfolioCategory;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  videoUrl?: string;
  hashtags?: string[];
  tags?: string[];
  description?: string;
  // Optional fields, depending on usage
  client?: string;
  objective?: string;
  role?: string;
  thumbnailUrl?: string; // Still useful for video previews
  age?: number;
  bio?: string;
  mediaItems?: Array<{
    url: string;
    type: 'image' | 'video';
  }>;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'model';
  text: string;
  type?: 'text' | 'function_confirmation';
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}