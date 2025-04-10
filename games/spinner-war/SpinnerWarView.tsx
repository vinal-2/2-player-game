tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { SpinnerWarState, Spinner } from './SpinnerWarModel';
import { Ionicons } from '@expo/vector-icons';

interface SpinnerWarViewProps {
  state: SpinnerWarState;
  onReset: () => void;
  onBack: () => void;
  onPress: (player: "player1" | "player2", action: string) => void;
}

export const SpinnerWarView: React.FC<SpinnerWarViewProps> = ({
  state,
  onBack,
  onReset,
  onPress
}) => {
  const renderSpinner = (spinner: Spinner, player: string) => {
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
      </View>
    );
  };

  return (
    <ImageBackground source={require('../../assets/images/spinner-war-bg.png')} style={styles.backgroundImage}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.gameArea}>
          {renderSpinner(state.player1Spinner, 'player1')}
          {renderSpinner(state.player2Spinner, 'player2')}
          <View style={[styles.arena, {width: state.arenaRadius * 2, height: state.arenaRadius * 2, borderRadius: state.arenaRadius}]} />
        </View>

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
  controls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    paddingHorizontal: 20,
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