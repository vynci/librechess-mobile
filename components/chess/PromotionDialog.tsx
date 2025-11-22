import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChessPieceSVG } from "./ChessPieceSVG";

interface PromotionDialogProps {
  visible: boolean;
  color: "w" | "b";
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
}

export const PromotionDialog: React.FC<PromotionDialogProps> = ({
  visible,
  color,
  onSelect,
}) => {
  const pieces: Array<{ type: "q" | "r" | "b" | "n"; label: string }> = [
    { type: "q", label: "Queen" },
    { type: "r", label: "Rook" },
    { type: "b", label: "Bishop" },
    { type: "n", label: "Knight" },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Choose Promotion Piece</Text>
          <View style={styles.piecesContainer}>
            {pieces.map((piece) => (
              <TouchableOpacity
                key={piece.type}
                style={styles.pieceButton}
                onPress={() => onSelect(piece.type)}
                activeOpacity={0.7}
              >
                <View style={styles.pieceWrapper}>
                  <ChessPieceSVG type={piece.type} color={color} size={60} />
                </View>
                <Text style={styles.pieceLabel}>{piece.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "#312e2b",
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    maxWidth: "90%",
    borderWidth: 2,
    borderColor: "#b58863",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f0d9b5",
    textAlign: "center",
    marginBottom: 20,
  },
  piecesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 12,
  },
  pieceButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#b58863",
    minWidth: 80,
  },
  pieceWrapper: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  pieceLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f0d9b5",
    textAlign: "center",
  },
});
