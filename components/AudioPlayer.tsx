import { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import { Audio } from 'expo-av';

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
}

export function AudioPlayer({ audioUrl, duration }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false }
      );
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setIsPlaying(status.isPlaying || false);
          
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });
      
      setSound(newSound);
    } catch (error) {
      console.error('Error loading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = async () => {
    try {
      if (!sound) {
        await loadAudio();
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const progressWidth = duration > 0 ? (position / (duration * 1000)) * 100 : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        {isPlaying ? (
          <Pause color="#FFFFFF" size={16} />
        ) : (
          <Play color="#FFFFFF" size={16} />
        )}
      </TouchableOpacity>

      <View style={styles.waveformContainer}>
        <View style={styles.waveformBackground} />
        <View 
          style={[
            styles.waveformProgress,
            { width: `${progressWidth}%` }
          ]} 
        />
        <View style={styles.waveform}>
          {Array.from({ length: 20 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: Math.random() * 20 + 8,
                  opacity: index < (progressWidth / 5) ? 1 : 0.3,
                }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waveformContainer: {
    flex: 1,
    height: 32,
    position: 'relative',
    justifyContent: 'center',
  },
  waveformBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  waveformProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    height: '100%',
  },
  waveformBar: {
    width: 2,
    backgroundColor: '#666666',
    borderRadius: 1,
  },
});