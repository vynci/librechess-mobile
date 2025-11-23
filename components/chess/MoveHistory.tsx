import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { forwardRef, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface MoveHistoryEntry {
  moveNumber: number;
  white?: string;
  black?: string;
}

interface MoveHistoryProps {
  moves: string[]; // Array of moves from chess.history()
}

const MoveHistory = forwardRef<BottomSheet, MoveHistoryProps>(
  ({ moves }, ref) => {
    // Snap points for the bottom sheet: 15% is peek, 60% is expanded
    const snapPoints = useMemo(() => ["15%", "60%"], []);

    // Convert flat array of moves into paired format
    const moveHistory: MoveHistoryEntry[] = useMemo(() => {
      const history: MoveHistoryEntry[] = [];
      for (let i = 0; i < moves.length; i += 2) {
        history.push({
          moveNumber: Math.floor(i / 2) + 1,
          white: moves[i],
          black: moves[i + 1],
        });
      }
      return history;
    }, [moves]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {moveHistory.length === 0 ? (
            <Text style={styles.emptyText}>No moves yet</Text>
          ) : (
            moveHistory.map((entry) => (
              <View key={entry.moveNumber} style={styles.moveRow}>
                <Text style={styles.moveNumber}>{entry.moveNumber}.</Text>
                <View style={styles.movePair}>
                  <Text style={[styles.move, styles.whiteMove]}>
                    {entry.white || "..."}
                  </Text>
                  <Text style={[styles.move, styles.blackMove]}>
                    {entry.black || "..."}
                  </Text>
                </View>
              </View>
            ))
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

MoveHistory.displayName = "MoveHistory";

export default MoveHistory;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "#312e2b",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleIndicator: {
    backgroundColor: "#f0d9b5",
    width: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#4a4845",
  },
  emptyHeaderText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  previewContainer: {
    gap: 4,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewMoveNumber: {
    color: "#b58863",
    fontSize: 13,
    fontWeight: "600",
    width: 30,
  },
  previewMove: {
    color: "#d0b595",
    fontSize: 13,
    fontFamily: "Courier",
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  moveRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  moveNumber: {
    color: "#b58863",
    fontSize: 14,
    fontWeight: "600",
    width: 35,
  },
  movePair: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  move: {
    fontSize: 15,
    fontFamily: "Courier",
    minWidth: 60,
  },
  whiteMove: {
    color: "#f0d9b5",
    fontWeight: "500",
  },
  blackMove: {
    color: "#d0b595",
    fontWeight: "500",
  },
});
