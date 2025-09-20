import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated } from 'react-native';
import { useSeasonal } from '../../contexts/SeasonalContext';
import { SpinnerWarState, Spinner } from './SpinnerWarModel';
import { Ionicons } from '@expo/vector-icons';

interface SpinnerWarViewProps {
  state: SpinnerWarState;
  mode: "friend" | "bot";
  difficulty: "rookie" | "pro" | "legend";
  onReset: () => void;
  onBack: () => void;
  onPress: (player: "player1" | "player2", action: string) => void;
  onImpactBurst?: () => void;
  onModeChange?: (mode: "friend" | "bot") => void;
  onDifficultyChange?: (level: "rookie" | "pro" | "legend") => void;
}

export const SpinnerWarView = forwardRef(({ 
  state,
  mode,
  difficulty,
  onBack,
  onReset,
  onPress
}: SpinnerWarViewProps, ref: React.Ref<{ triggerImpact(): void }>) => {
  const burstScale = useRef(new Animated.Value(0)).current
  const shake = useRef(new Animated.Value(0)).current
  const triggerBurst = () => {
    burstScale.setValue(0)
    Animated.sequence([
      Animated.timing(burstScale, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(burstScale, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start()
  }
  const triggerShake = () => {
    shake.setValue(0)
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 40, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 90, useNativeDriver: true }),
    ]).start()
  }

  useImperativeHandle(ref, () => ({
    triggerImpact() {
      triggerBurst()
      triggerShake()
    },
  }))
  const renderSpinner = (spinner: Spinner, player: string) => {
    const boost = player === 'player1' ? state.boosts.player1 : state.boosts.player2
    const maxBoost = 1.5
    const ratio = Math.max(0, Math.min(1, (boost - 1) / (maxBoost - 1)))
    return (
      <View
        key={player}
        style={[
          styles.spinner,
          {
            left: spinner.x - spinner.radius,
            top: spinner.y - spinner.radius,
            width: spinner.radius * 2,
            height: spinner.radius * 2,
          },
        ]}
      >
        <Image
          source={require('../../assets/images/versus.png')} 
          style={styles.spinnerImage}
        />
        {/* per-player boost ring */}
        <View style={[styles.boostRing, { opacity: ratio }]} />
        {/* per-player duration bar */}
        <View style={[styles.boostBarContainer, player === 'player1' ? styles.boostBarBottom : styles.boostBarTop]}>
          <View style={[styles.boostBarFill, { width: `${Math.round(ratio * 100)}%` }]} />
        </View>
      </View>
    );
  };

  const { getSeasonalGameBackground } = useSeasonal()
  const background = useMemo(() => getSeasonalGameBackground('spinner-war') || require('../../assets/images/spinner-war-bg.png'), [getSeasonalGameBackground])

  return (
    <ImageBackground source={background} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.chip, mode === 'friend' && styles.chipActive]}
            onPress={() => onModeChange && onModeChange('friend')}
          >
            <Text style={[styles.chipText, mode === 'friend' && styles.chipTextActive]}>2P</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, mode === 'bot' && styles.chipActive]}
            onPress={() => onModeChange && onModeChange('bot')}
          >
            <Text style={[styles.chipText, mode === 'bot' && styles.chipTextActive]}>Bot</Text>
          </TouchableOpacity>
          <View style={{ width: 12 }} />
          <TouchableOpacity
            style={[styles.chip, difficulty === 'rookie' && styles.chipActive]}
            onPress={() => onDifficultyChange && onDifficultyChange('rookie')}
          >
            <Text style={[styles.chipText, difficulty === 'rookie' && styles.chipTextActive]}>Rookie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, difficulty === 'pro' && styles.chipActive]}
            onPress={() => onDifficultyChange && onDifficultyChange('pro')}
          >
            <Text style={[styles.chipText, difficulty === 'pro' && styles.chipTextActive]}>Pro</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, difficulty === 'legend' && styles.chipActive]}
            onPress={() => onDifficultyChange && onDifficultyChange('legend')}
          >
            <Text style={[styles.chipText, difficulty === 'legend' && styles.chipTextActive]}>Legend</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.gameArea, { transform: [{ translateX: shake.interpolate({ inputRange: [0,1], outputRange: [0, 6] }) }] }]}>
          <View style={[styles.arena, {width: state.areaRadius * 2, height: state.areaRadius * 2, borderRadius: state.areaRadius}]} />
          {state.powerUp && (
            <View style={[styles.powerUp, { left: state.powerUp.x - state.powerUp.radius, top: state.powerUp.y - state.powerUp.radius, width: state.powerUp.radius * 2, height: state.powerUp.radius * 2 }]} />
          )}
          <Animated.View pointerEvents="none" style={[styles.burstOverlay, { opacity: burstScale, transform: [{ scale: burstScale.interpolate({ inputRange: [0,1], outputRange: [1, 1.08] }) }] }]} />
          {renderSpinner(state.player1, 'player1')}
          {renderSpinner(state.player2, 'player2')}
          {(state.boosts.player1 > 1.02 || state.boosts.player2 > 1.02) && (
            <View style={styles.boostBadge}>
              <Text style={styles.boostText}>Speed Boost</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.controls}>
            <View style={styles.playerControls}>
                <Text style={styles.playerText}>Player 1</Text>
                <TouchableOpacity style={styles.controlButton} onPress={() => onPress("player1", "rotate")} >
                  <Ionicons name="arrow-undo-circle-outline" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={() => onPress("player1", "push")}>
                    <Ionicons name="arrow-up-circle-outline" size={32} color="white" />
                </TouchableOpacity>
            </View>
            <View style={styles.playerControls}>
                <Text style={styles.playerText}>Player 2</Text>
                <TouchableOpacity style={styles.controlButton} onPress={() => onPress("player2", "rotate")}>
                  <Ionicons name="arrow-redo-circle-outline" size={32} color="white" />
                </TouchableOpacity>
                 <TouchableOpacity style={styles.controlButton} onPress={() => onPress("player2", "push")}>
                    <Ionicons name="arrow-up-circle-outline" size={32} color="white" />
                </TouchableOpacity>
            </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    position: 'absolute',
    top: 0,
  },
  backButton: {
    padding: 10,
  },
  resetButton: {
    padding: 10,
  },
  gameArea: {
    width: '100%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arena:{
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  spinner: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 100,
    zIndex: 10,
  },
  spinnerImage:{
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  burstOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  powerUp: {
    position: 'absolute',
    backgroundColor: 'rgba(34,197,94,0.85)',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'white',
  },
  boostRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: 'rgba(34,197,94,0.9)',
  },
  boostBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  boostBarTop: { top: -10, borderRadius: 4 },
  boostBarBottom: { bottom: -10, borderRadius: 4 },
  boostBarFill: {
    height: '100%',
    backgroundColor: 'rgba(34,197,94,0.95)',
    borderRadius: 4,
  },
  controls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    paddingHorizontal: 20,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 56,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  chipActive: {
    backgroundColor: 'rgba(59,130,246,0.9)'
  },
  chipText: {
    color: 'white',
    fontWeight: '700'
  },
  chipTextActive: {
    color: '#0f172a'
  },
  boostBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(34,197,94,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  boostText: {
    color: 'white',
    fontWeight: '700',
  },
  playerControls:{
      alignItems: 'center'
  },
  playerText:{
    color: 'white',
    marginBottom: 10,
    fontWeight: 'bold'
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
    margin: 10,
  },
});

export default SpinnerWarView;
