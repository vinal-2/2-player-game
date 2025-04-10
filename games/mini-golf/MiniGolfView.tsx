tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, PanResponder, Dimensions } from 'react-native';
import { MiniGolfState } from './MiniGolfModel';
import { Ionicons } from '@expo/vector-icons';

interface MiniGolfViewProps {
    state: MiniGolfState;
    onReset: () => void;
    onBack: () => void;
    onHitBall: (direction: number, force: number) => void;
    onUpdate: () => void;
}

const MiniGolfView: React.FC<MiniGolfViewProps> = ({ state, onReset, onBack, onHitBall, onUpdate }) => {
    const { width, height } = Dimensions.get('window');
    const courseWidth = width * 0.8;
    const courseHeight = height * 0.6;
    const ballSize = state.ball.radius * 2;
    const holeSize = state.course.hole.radius * 2;

    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [endPosition, setEndPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        onUpdate();
    }, [state]);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
            setIsDragging(true);
            setStartPosition({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
        },
        onPanResponderMove: (event) => {
            setEndPosition({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
        },
        onPanResponderRelease: () => {
            if (isDragging) {
                const dx = endPosition.x - startPosition.x;
                const dy = endPosition.y - startPosition.y;
                const direction = Math.atan2(dy, dx);
                const force = Math.sqrt(dx * dx + dy * dy);
                onHitBall(direction, force);
            }
        },
    });

    const renderCourse = () => {
        const obstacles = state.course.obstacles.map((obstacle, index) => {
            const obstacleStyle = {
                position: 'absolute',
                left: obstacle.x,
                top: obstacle.y,
                width: obstacle.width,
                height: obstacle.height,
                backgroundColor: 'brown',
            };
            return <View key={`obstacle-${index}`} style={obstacleStyle} />;
        });
        const holeStyle = {
            position: 'absolute',
            left: state.course.hole.x - holeSize / 2,
            top: state.course.hole.y - holeSize / 2,
            width: holeSize,
            height: holeSize,
            borderRadius: holeSize / 2,
            backgroundColor: 'black',
        };

        return <>{obstacles}<View style={holeStyle} /></>;
    };

    const renderBall = () => {
        const ballStyle = {
            position: 'absolute',
            left: state.ball.x - ballSize / 2,
            top: state.ball.y - ballSize / 2,
            width: ballSize,
            height: ballSize,
            borderRadius: ballSize / 2,
            backgroundColor: 'white',
        };
        return <View style={ballStyle} />;
    };

    const renderDragIndicator = () => {
        if (isDragging) {
            const indicatorStyle = {
                position: 'absolute',
                left: startPosition.x,
                top: startPosition.y,
                width: 2,
                height: Math.sqrt(
                    (endPosition.x - startPosition.x) ** 2 + (endPosition.y - startPosition.y) ** 2
                ),
                backgroundColor: 'red',
                transform: [
                    { translateX: -1 },
                    { rotate: `${Math.atan2(endPosition.y - startPosition.y, endPosition.x - startPosition.x)}rad` },
                ],
            };
            return <View style={indicatorStyle} />;
        }
        return null;
    };
    return (<ImageBackground source={require('../../assets/images/mini-golf-bg.png')} style={styles.backgroundImage}>
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                    <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
            </View>
            <View style={[styles.course, { width: courseWidth, height: courseHeight }]} {...panResponder.panHandlers}>
                {renderCourse()}
                {renderBall()}
                {renderDragIndicator()}
            </View>
            {state.gameOver && <View style={styles.winnerContainer}><Text style={styles.winner}>You Win!</Text></View>}
        </View>
    </ImageBackground>);
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
  course: {
    backgroundColor: 'lightgreen',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
  },
  winnerContainer: {
    position: 'absolute',
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 10,
  },
  winner: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  }
});

export default MiniGolfView;