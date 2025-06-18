class Tree extends Entity {
  static types = ["oak", "pine", "birch", "palm", "maple"];

  constructor(x = 0, y = 0, game = null, type = null) {
    super(x, y, game);

    // Trees are static entities - they don't move
    this.static = true;

    // Tree-specific properties
    this.treeType = type || this.generateTreeType();
    this.health = 100; // Full health
    this.maxHealth = 100;

    // Set tree appearance based on type using images
    this.setupTreeAppearance();
  }

  /**
   * Generate a random tree type
   * @returns {string} Tree type
   */
  generateTreeType() {
    return Tree.types[Math.floor(Math.random() * Tree.types.length)];
  }

  /**
   * Setup the visual appearance of the tree based on its type using images
   */
  setupTreeAppearance() {
    // Clear any existing graphics
    this.graphics.clear();

    // Remove any existing sprite
    if (this.sprite) {
      this.container.removeChild(this.sprite);
      this.sprite = null;
    }

    // Map tree types to preloaded asset aliases
    const treeImageMap = {
      oak: "tree1",
      pine: "tree2",
      birch: "tree3",
      palm: "tree4",
      maple: "tree5",
    };

    const assetAlias = treeImageMap[this.treeType] || "tree1";

    // Create sprite from preloaded asset
    this.sprite = PIXI.Sprite.from(assetAlias);

    // Center the sprite
    this.sprite.anchor.set(0.5, 1); // Anchor at bottom center

    // Scale the sprite to appropriate size
    this.sprite.scale.set(0.5, 0.5); // Adjust scale as needed

    // Add sprite to container
    this.container.addChild(this.sprite);
  }

  /**
   * Override the update method - trees are now static, no growth
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    if (!this.active) return;

    // Update Z position based on current cell height
    if (this.currentCell) {
      this.z = this.currentCell.z;
      this.container.y = this.position.y - this.z;
    }

    // Update visibility
    this.container.visible = this.visible && this.active;
  }

  /**
   * Check if this tree can be harvested
   * @returns {boolean} Whether the tree can be harvested
   */
  canHarvest() {
    return this.health > 50;
  }

  /**
   * Harvest the tree (reduces health, might kill it)
   * @returns {Object} Resources gained from harvesting
   */
  harvest() {
    if (!this.canHarvest()) {
      return { wood: 0, seeds: 0 };
    }

    const woodYield = Math.floor(Math.random() * 5) + 3; // 3-7 wood
    const seedYield = Math.random() < 0.3 ? 1 : 0; // 30% chance for seeds

    this.health -= 50;

    // Tree dies if health drops too low
    if (this.health <= 0) {
      this.setActive(false);
    }

    return {
      wood: woodYield,
      seeds: seedYield,
      treeType: this.treeType,
    };
  }

  /**
   * Plant a new tree (static method for creating trees)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Game} game - Game instance
   * @param {string} treeType - Optional tree type
   * @returns {Tree} New tree instance
   */
  static plant(x, y, game, treeType = null) {
    const tree = new Tree(x, y, game, treeType);
    return tree;
  }

  /**
   * Get information about this tree
   * @returns {Object} Tree information
   */
  getTreeInfo() {
    return {
      ...this.getDebugInfo(),
      treeType: this.treeType,
      health: this.health,
      maxHealth: this.maxHealth,
      canHarvest: this.canHarvest(),
    };
  }
}
