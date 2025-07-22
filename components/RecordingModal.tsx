import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Mic, Square, Send, X } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { VoicePost } from '@/types';
import { blink } from '@/lib/blink';

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onPost: (post: VoicePost) => void;
  parentPost?: VoicePost;
}

export function RecordingModal({ visible, onClose, onPost, parentPost }: RecordingModalProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (visible) {
      setupAudio();
    } else {
      resetState();
    }
  }, [visible]);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const resetState = () => {
    setRecording(null);
    setIsRecording(false);
    setRecordingUri(null);
    setDuration(0);
    setIsPosting(false);
  };

  const startRecording = async () => {
    try {
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setDuration(status.durationMillis || 0);
        }
      });
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const postVoiceMessage = async () => {
    if (!recordingUri) return;

    try {
      setIsPosting(true);
      const user = await blink.auth.me();
      
      if (!user) {
        Alert.alert('Error', 'Please log in to post');
        return;
      }

      // Upload audio file
      const response = await fetch(recordingUri);
      const blob = await response.blob();
      const file = new File([blob], `voice-${Date.now()}.m4a`, { type: 'audio/m4a' });
      
      const { publicUrl } = await blink.storage.upload(
        file,
        `voice-posts/${user.id}/${Date.now()}.m4a`,
        { upsert: true }
      );

      // Create voice post
      const newPost = await blink.db.voicePosts.create({
        userId: user.id,
        username: user.username || user.email.split('@')[0],
        displayName: user.displayName || user.username || user.email.split('@')[0],
        audioUrl: publicUrl,
        duration: Math.floor(duration / 1000),
        parentId: parentPost?.id || null,
        replyCount: 0,
        createdAt: new Date().toISOString(),
      });

      onPost(newPost);
      onClose();
    } catch (error) {
      console.error('Error posting voice message:', error);
      Alert.alert('Error', 'Failed to post voice message');
    } finally {
      setIsPosting(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X color="#000000" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {parentPost ? 'Reply' : 'New Voice Post'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {parentPost && (
            <View style={styles.parentPost}>
              <Text style={styles.replyingTo}>Replying to @{parentPost.username}</Text>
            </View>
          )}

          <View style={styles.recordingArea}>
            <View style={styles.visualizer}>
              {isRecording && (
                <View style={styles.pulseContainer}>
                  <View style={[styles.pulse, styles.pulse1]} />
                  <View style={[styles.pulse, styles.pulse2]} />
                  <View style={[styles.pulse, styles.pulse3]} />
                </View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isPosting}
              >
                {isRecording ? (
                  <Square color="#FFFFFF" size={32} />
                ) : (
                  <Mic color="#FFFFFF" size={32} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.duration}>
              {formatDuration(duration)}
            </Text>

            <Text style={styles.instruction}>
              {isRecording 
                ? 'Tap to stop recording' 
                : recordingUri 
                ? 'Ready to post' 
                : 'Tap to start recording'
              }
            </Text>
          </View>

          {recordingUri && !isRecording && (
            <TouchableOpacity
              style={styles.postButton}
              onPress={postVoiceMessage}
              disabled={isPosting}
            >
              <Send color="#FFFFFF" size={20} />
              <Text style={styles.postButtonText}>
                {isPosting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  parentPost: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 32,
  },
  replyingTo: {
    fontSize: 14,
    color: '#666666',
  },
  recordingArea: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  visualizer: {
    position: 'relative',
    marginBottom: 32,
  },
  pulseContainer: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  pulse1: {
    animationDuration: '2s',
  },
  pulse2: {
    animationDuration: '2s',
    animationDelay: '0.5s',
  },
  pulse3: {
    animationDuration: '2s',
    animationDelay: '1s',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#FF3B30',
  },
  duration: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  instruction: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 32,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});