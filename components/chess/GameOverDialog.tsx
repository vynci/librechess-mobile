import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GameOverDialogProps {
  visible: boolean;
  winner: "white" | "black" | null;
  isDraw: boolean;
  onPlayAgain: () => void;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({
  visible,
  winner,
  isDraw,
  onPlayAgain,
}) => {
  const getTitle = () => {
    if (isDraw) {
      return "Game Draw!";
    }
    return "Checkmate!";
  };

  const getMessage = () => {
    if (isDraw) {
      return "The game ended in a draw";
    }
    return `${winner === "white" ? "White" : "Black"} wins!`;
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onPlayAgain}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.message}>{getMessage()}</Text>
          <TouchableOpacity style={styles.button} onPress={onPlayAgain}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
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
    backgroundColor: "#2c2c2c",
    borderRadius: 16,
    padding: 32,
    minWidth: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  message: {
    fontSize: 20,
    color: "#ddd",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
