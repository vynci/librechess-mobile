import * as Haptics from "expo-haptics";
import React, { useImperativeHandle, forwardRef } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  SharedValue,
} from "react-native-reanimated";
import { ChessPieceSVG } from "./ChessPieceSVG";

interface DraggablePieceProps {
  piece: string;
  color: "w" | "b";
  squareSize: number;
  squareCenterX: number;
  squareCenterY: number;
  onDragStart?: () => void;
  onDragMove?: (absoluteX: number, absoluteY: number) => void;
  onDragEnd?: (absoluteX: number, absoluteY: number) => void;
}

export interface DraggablePieceRef {
  reset: () => void;
}

export const DraggablePiece = forwardRef<DraggablePieceRef, DraggablePieceProps>(
  (
    {
      piece,
      color,
      squareSize,
      squareCenterX,
      squareCenterY,
      onDragStart,
      onDragMove,
      onDragEnd,
    },
    ref
  ) => {
    // Visual state
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const isActive = useSharedValue(false);

    // Expose reset function to parent
    useImperativeHandle(ref, () => ({
      reset: () => {
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
        isActive.value = false;
      },
    }));

    const haptic = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

  const gesture = Gesture.Pan()
    .minDistance(5)
    .onBegin(() => {
      'worklet';
      // Provide immediate visual feedback on touch
      scale.value = 1.2;
      runOnJS(haptic)();
      if (onDragStart) {
        runOnJS(onDragStart)();
      }
    })
    .onStart(() => {
      'worklet';
      console.log('DraggablePiece: onStart, isActive was:', isActive.value);
      // Now the drag has truly started (moved 5+ pixels)
      isActive.value = true;
      scale.value = 1.5;
    })
    .onUpdate((event) => {
      'worklet';
      console.log('DraggablePiece: onUpdate, translation:', event.translationX, event.translationY);
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      if (onDragMove) {
        // Calculate current absolute position
        const currentX = squareCenterX + event.translationX;
        const currentY = squareCenterY + event.translationY;
        runOnJS(onDragMove)(currentX, currentY);
      }
    })
    .onEnd((event) => {
      'worklet';
      runOnJS(haptic)();

      if (onDragEnd) {
        // Calculate final absolute position
        const finalX = squareCenterX + event.translationX;
        const finalY = squareCenterY + event.translationY;
        runOnJS(onDragEnd)(finalX, finalY);
      }

      // Reset visual state
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      isActive.value = false;
    })
    .onFinalize(() => {
      'worklet';
      // Ensure reset even if gesture is cancelled
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      isActive.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: isActive.value ? 1000 : 0,
  }));

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <ChessPieceSVG
            type={piece}
            color={color}
            size={squareSize * 0.85}
          />
        </Animated.View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
