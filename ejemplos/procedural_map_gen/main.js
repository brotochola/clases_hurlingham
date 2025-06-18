// Main game instance
let game;

// Wait for DOM to be loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeGame();
});

/**
 * Initialize the game and create demo entities
 */
async function initializeGame() {
  // Create the game instance with custom noise frequencies
  const gameOptions = {
    cellSize: 50,
    noiseFrequencies: {
      soilFertility: 0.11, // Medium frequency for soil fertility
      height: 0.131, // Low frequency for large terrain features
      temperature: 0.012, // High frequency for detailed temperature variation
    },
  };

  game = new Game(
    window.innerWidth,
    window.innerHeight,
    "gameCanvas",
    gameOptions
  );

  // Wait a bit for PIXI to initialize
  setTimeout(() => {
    createDemoEntities();
    setupInputHandlers();
    setupDebugPanel();
  }, 500);
}

/**
 * Create some demo entities to test the spatial hashing system
 */
function createDemoEntities() {
  // Create entities in different positions (including negative coordinates)
  const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf39c12, 0x9b59b6, 0xe67e22];

  // Create a player using the new Player class
  const player = new Player(0, 0, game);

  // Add player to the game's entities Set so it gets updated

  // Store player reference for input handling
  window.player = player;

  // Create some animals using the new Animal class
  for (let i = 0; i < 10; i++) {
    const x = (Math.random() - 0.5) * 500; // Random position from -250 to 250
    const y = (Math.random() - 0.5) * 500; // Random position from -250 to 250
    const animal = Animal.createRandom(x, y, game);

    // Add animal to the game's entities Set so it gets updated
    game.animals.add(animal);
  }
}

/**
 * Setup input handlers for player movement
 */
function setupInputHandlers() {
  const keys = {};

  // Track key states
  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  // Custom update for player movement
  const originalUpdate = game.update.bind(game);
  game.update = function (deltaTime) {
    // Call original update
    originalUpdate(deltaTime);

    // Handle player movement using the new Player class input system
    if (window.player && window.player.active) {
      const input = {
        up: keys["KeyW"] || keys["ArrowUp"],
        down: keys["KeyS"] || keys["ArrowDown"],
        left: keys["KeyA"] || keys["ArrowLeft"],
        right: keys["KeyD"] || keys["ArrowRight"],
      };

      window.player.handleInput(input);

      // Make camera follow player
      game.setCameraPosition(
        window.player.position.x,
        window.player.position.y
      );
    }
  };

  // Toggle flow field visualization
  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyF") {
      game.grid.showFlowField = !game.grid.showFlowField;
      console.log(
        "Flow field visualization:",
        game.grid.showFlowField ? "ON" : "OFF"
      );
    }
  });

  // Mouse click to create animals
  game.app.canvas.addEventListener("click", (e) => {
    const rect = game.app.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const worldPos = game.screenToWorld(screenX, screenY);

    // Get the cell at the clicked position
    const cell = game.grid.getCellAtWorldPos(worldPos.x, worldPos.y);

    // Console log the cell information
    console.log(cell);

    game.spawnPlant(worldPos.x, worldPos.y);
  });
}

/**
 * Setup debug panel to show spatial hashing information
 */
function setupDebugPanel() {
  // Create debug panel HTML
  const debugPanel = document.createElement("div");
  debugPanel.id = "debugPanel";
  debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        border-radius: 5px;
        z-index: 1000;
        min-width: 250px;
    `;
  document.body.appendChild(debugPanel);

  // Update debug info every second
  setInterval(() => {
    if (game && game.running) {
      const debugInfo = game.getDebugInfo();

      let html = "<h3>Debug Information</h3>";
      html += `<div>FPS: ${debugInfo.fps}</div>`;
      html += `<div>Entities: ${debugInfo.entities} (${debugInfo.activeEntities} active)</div>`;
      html += `<div>Grid Cells: ${debugInfo.grid.totalCells}</div>`;
      html += `<div>Grid Entities: ${debugInfo.grid.totalEntities}</div>`;
      html += `<div>Camera: (${debugInfo.camera.x.toFixed(
        1
      )}, ${debugInfo.camera.y.toFixed(1)})</div>`;

      if (window.player) {
        const playerDebug = window.player.getDebugInfo();
        html += `<div>Player: (${playerDebug.position.x.toFixed(
          1
        )}, ${playerDebug.position.y.toFixed(1)})</div>`;
        if (playerDebug.currentCell) {
          html += `<div>Player Cell: ${playerDebug.currentCell.key}</div>`;
        }
      }

      html += '<div style="margin-top: 10px;">Controls:</div>';
      html += "<div>WASD/Arrows: Move player</div>";
      html += "<div>Click: Create animal</div>";
      html += "<div>F: Toggle flow field visualization</div>";

      debugPanel.innerHTML = html;
    }
  }, 1000);
}

// Expose game instance to global scope for debugging
window.game = game;
