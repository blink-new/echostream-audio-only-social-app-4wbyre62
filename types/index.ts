export interface VoicePost {
  id: string;
  userId?: string;
  user_id?: string;
  username: string;
  displayName?: string;
  display_name?: string;
  audioUrl?: string;
  audio_url?: string;
  duration: number;
  createdAt?: string;
  created_at?: string;
  replyCount?: number;
  reply_count?: number;
  parentId?: string;
  parent_id?: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
}