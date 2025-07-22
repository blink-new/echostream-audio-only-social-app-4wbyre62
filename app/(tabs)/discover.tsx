import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { VoicePost } from '@/types';
import { VoicePostCard } from '@/components/VoicePostCard';
import { RecordingModal } from '@/components/RecordingModal';
import { blink } from '@/lib/blink';

export default function DiscoverScreen() {
  const [posts, setPosts] = useState<VoicePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRecording, setShowRecording] = useState(false);

  const loadPosts = async () => {
    try {
      const voicePosts = await blink.db.voicePosts.list({
        where: { parentId: null }, // Only main posts, not replies
        orderBy: { createdAt: 'desc' },
        limit: 50,
      });
      setPosts(voicePosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleNewPost = (newPost: VoicePost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VoicePostCard post={item} onReply={() => {}} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => setShowRecording(true)}
        activeOpacity={0.8}
      >
        <Plus color="#FFFFFF" size={24} />
      </TouchableOpacity>

      <RecordingModal
        visible={showRecording}
        onClose={() => setShowRecording(false)}
        onPost={handleNewPost}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  listContent: {
    paddingBottom: 100,
  },
  recordButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});