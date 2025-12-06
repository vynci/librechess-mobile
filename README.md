# LibreChess Mobile

A free and open-source chess game for mobile devices built with React Native and Expo. Play chess anytime, anywhere with an elegant and intuitive interface.

> **Note**: This app is currently in active development. The current version features bot/computer play. Online multiplayer functionality will be implemented in future releases.

## Download the App

Download the latest version: [LibreChess Mobile v1.0.0](https://expo.dev/accounts/vynci/projects/librechess-mobile/builds/aeb3a1d2-b719-4772-ab55-8c1c727313bd)

<div align="center">
  <img src="assets/download-apk.png" alt="Download QR Code" width="200"/>
  <p><em>Scan to download</em></p>
</div>

## Features

- Classic chess gameplay with complete rule validation
- Play against computer/bot opponents
- Clean, modern UI with smooth animations
- Support for both iOS and Android devices
- Haptic feedback for enhanced user experience

### Coming Soon

- Online multiplayer gameplay
- Player matchmaking
- Game history and analysis

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd librechess-mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

### Running the App

After starting the development server, you can run the app on:

- **iOS Simulator**: Press `i` in the terminal or scan the QR code with the Expo Go app
- **Android Emulator**: Press `a` in the terminal or scan the QR code with the Expo Go app
- **Physical Device**: Install [Expo Go](https://expo.dev/go) and scan the QR code

## Tech Stack

- **Framework**: React Native with Expo
- **Chess Logic**: chess.js
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: Custom components with react-native-reanimated
- **Gestures**: react-native-gesture-handler
- **Icons**: Expo Symbols & Lucide React Native

## Project Structure

The project uses Expo Router's file-based routing system. You can start developing by editing files inside the **app** directory.

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
