<!-- ABOUT THE PROJECT -->

## About The Project

![Capture](https://user-images.githubusercontent.com/70218822/137228522-74a7b0f0-1b42-40c0-bf0b-e414747cb3f5.PNG)

### Built With

- [Babylon.js](https://www.babylonjs.com)
- [Express.js](https://expressjs.com)
- [Socket.io](https://socket.io)
- [TypeScript](https://www.typescriptlang.org)
- [Webpack](https://webpack.js.org/)
- [Node.js](https://nodejs.org/en)

<!-- GETTING STARTED -->

## Getting Started

To get this project installed locally on your machine, follow the below steps.

### Prerequisites

Install the latest node package manager before installing dependencies

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/eliyav/chess-game.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Serve app **Does not currently support sockets**
   ```js
   npm start
   ```
4. **Optional: Instead of #3** Serve app on http://localhost:3000/ **Supports sockets, but does not support compression**
   ```js
   npm start server
   ```

## Usage

This project is meant to be played. If you are having fun playing chess it is being used right!

## Roadmap

- [x] Create working offline mode
- [x] Implement back-end to enable websockets
- [] Create online matches
  - [] create player to player communication via buttons (ex. reset board, undo move)
  - [] fix game time sync
- [] update game mesh models
- [] add animations

See the [Projects tasks](https://github.com/eliyav/chess-game/projects/1) for a full list of tasks.

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Eliya Vahl - eliyavahl@gmail.com

Project Link: [https://github.com/eliyav/chess-game](https://github.com/eliyav/chess-game)

<p align="right">(<a href="#top">back to top</a>)</p>
