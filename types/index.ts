export interface VoicePost {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  audioUrl: string;
  duration: number;
  createdAt: string;
  replyCount: number;
  parentId?: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
}