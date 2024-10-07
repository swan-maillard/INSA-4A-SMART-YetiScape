# YetiScape — SMART Project

## Description

**YetiScape** is a collaborative **escape game** where three players, each located in different 3D rooms, must work together to solve puzzles and progress. Players can communicate via **chat** and **voice** (using **PeerJS**), and can exchange items and information to help each other unlock their respective puzzles and escape their rooms. The game uses a **Node.js** server for real-time communication via **WebSockets** (using **Socket.io**) and features a **Vue.js** client with 3D scenes rendered using **Babylon.js**.

## Features

- **3D Multiplayer Escape Game**: Three players each explore separate 3D rooms and interact with objects to solve puzzles. Once all puzzles in each room are solved and the final doors are unlocked, the players escape.
- **Real-time Communication**:
  - **Chat**: Players can send text messages to each other via **Socket.io**.
  - **Voice**: Peer-to-peer voice communication via **PeerJS**.
- **Item Sharing**: Players can pass items and clues between rooms to help each other progress. Many puzzles are interconnected and some items are essential to unlocking new areas or progressing in other rooms.
- **3D Environment**: Each room is rendered in 3D using **Babylon.js**, with interactive objects such as doors, traps, gears, etc. 
- **Multiplayer Synchronization**: Players’ actions (e.g., opening a door, solving a puzzle) are synchronized across all rooms using real-time WebSockets or HTTP requests to update the game state.

## Technologies

### Backend (Node.js)
- **Express.js**: API and static file server.
- **Socket.io**: Real-time communication between server and clients.
- **PeerJS**: WebRTC for peer-to-peer voice communication.
- **JWT**: JSON Web Tokens for user authentication and access control.
- **HTTPS**: Secure connection with SSL certificates for communication.

### Frontend (Vue.js)
- **Vue.js**: Framework for building the game's UI and client-side logic.
- **Babylon.js**: 3D rendering library for creating and interacting with rooms and objects in the game.
- **Socket.io-client**: Client-side socket communication with the server.
- **PeerJS-client**: Client-side peer-to-peer voice communication.

## Setup and Installation

### Prerequisites
- **Node.js** (v14.x or later)
- **Vue.js CLI** (for running the frontend)
- **PeerJS** (for voice communication)

### Backend Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/swan-maillard/INSA-4A-SMART-EscapeGame.git
   cd INSA-4A-SMART-EscapeGame/server
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Generate SSL certificates for HTTPS (or provide your own):
   ```bash
   mkdir cert
   openssl req -nodes -new -x509 -keyout cert/key.pem -out cert/cert.pem
   ```
4. Run the server:
   ```bash
   npm start
   ```

### Frontend Installation
1. Navigate to the `client` directory:
   ```bash
   cd ../client
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vue.js client:
   ```bash
   npm run serve
   ```

### Access the Game
- **Backend API** runs at `https://localhost:3000` or at the given adress.
- **Frontend Game** runs at `https://localhost:8080` or at the given adress.


## Voice Communication (PeerJS)
Players can start a voice call by connecting through PeerJS. The server facilitates the connection by acting as a signaling server, and players communicate directly via WebRTC.


## Authors

- Alexandre BIAUD (alexandre.biaud@insa-lyon.fr)
- Raoul EL MIR (raoul.el-mir@insa-lyon.fr)
- Ambre HUTIER (ambre.hutier@insa-lyon.fr)
- Lilia KAROUIA (lilia.karouia@insa-lyon.fr)
- Swan MAILLARD (maillard.swan@gmail.com)


## License

This project is licensed under the Apache 2.0 license. Please consult the `LICENSE` file for more information.

