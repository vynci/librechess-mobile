import { ChessBoard } from "@/components/chess/ChessBoard";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Global reset function that can be called from the header
export let resetChessGame: (() => void) | null = null;

export default function Index() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <ChessBoard
          vsComputer={true}
          computerColor="black"
          aiType="random"
          testCheckmate={true}
          onResetReady={(resetFn) => {
            resetChessGame = resetFn;
          }}
        />
      </View>
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
