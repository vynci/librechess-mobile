import { ChessBoard } from "@/components/chess/ChessBoard";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import MoveHistory from "@/components/chess/MoveHistory";
import { useRef, useState } from "react";

// Global reset function that can be called from the header
export let resetChessGame: (() => void) | null = null;

export default function Index() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <ChessBoard
            vsComputer={true}
            computerColor="black"
            aiType="random"
            testCheckmate={false}
            onResetReady={(resetFn) => {
              resetChessGame = resetFn;
            }}
            bottomSheetRef={bottomSheetRef}
            onMoveHistoryChange={setMoveHistory}
          />
        </View>
        <MoveHistory ref={bottomSheetRef} moves={moveHistory} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#312e2b",
  },
});
