import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Play, Pause, MessageCircle } from 'lucide-react-native';
import { VoicePost } from '@/types';
import { AudioPlayer } from './AudioPlayer';

interface VoicePostCardProps {
  post: VoicePost;
  onReply: (post: VoicePost) => void;
}

export function VoicePostCard({ post, onReply }: VoicePostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{post.displayName}</Text>
          <Text style={styles.username}>@{post.username}</Text>
        </View>
        <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt)}</Text>
      </View>

      <View style={styles.audioContainer}>
        <AudioPlayer
          audioUrl={post.audioUrl}
          duration={post.duration}
        />
        <Text style={styles.duration}>{formatDuration(post.duration)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onReply(post)}
        >
          <MessageCircle color="#666666" size={18} />
          <Text style={styles.actionText}>
            {post.replyCount > 0 ? post.replyCount : 'Reply'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: '#666666',
  },
  timestamp: {
    fontSize: 14,
    color: '#666666',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  duration: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
});