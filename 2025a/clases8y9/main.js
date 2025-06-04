import { Game } from "./game.js";
import { NPC } from "./npc.js";

// Create the game instance
const game = new Game(window.innerWidth, window.innerHeight - 100);

// Function to wait for game initialization
async function waitForGameInit() {
  while (!game.initialized) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Wait for PixiJS to initialize, then start the game
waitForGameInit().then(() => {
  // Start the game
  game.start();

  // Spawn a complete test level with enemies, resources, and home
  game.spawnTestLevel();

  window.game = game;

  console.log("Game initialized with", game.entities.length, "entities");
});

// Handle window resize
window.addEventListener("resize", () => {
  if (game.initialized) {
    game.resize(window.innerWidth, window.innerHeight);
  }
});
