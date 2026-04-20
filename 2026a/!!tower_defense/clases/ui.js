const BOTON_TAMANO = 64;
const BOTON_PADDING = 8;
const PANEL_ANCHO = BOTON_TAMANO * 2 + BOTON_PADDING * 3;
const PANEL_ALTO = BOTON_TAMANO + BOTON_PADDING * 2;

class UI {
  constructor(juego) {
    this.juego = juego;
    this.fantasma = null;
    this.ignorarProximoClick = false;

    this.container = new PIXI.Container();
    this.container.zIndex = 1000;
    juego.app.stage.addChild(this.container);

    this.crearPanel();
    this.posicionarPanel();

    this.onMouseMove = this.onMouseMove.bind(this);
    document.body.addEventListener("mousemove", this.onMouseMove);
  }

  crearPanel() {
    const fondo = new PIXI.Graphics();
    fondo.roundRect(0, 0, PANEL_ANCHO, PANEL_ALTO, 10);
    fondo.fill({ color: 0x000000, alpha: 0.55 });
    this.container.addChild(fondo);

    this.crearBoton(1, BOTON_PADDING, BOTON_PADDING);
    this.crearBoton(2, BOTON_PADDING * 2 + BOTON_TAMANO, BOTON_PADDING);
  }

  crearBoton(tipo, x, y) {
    const textura = this.juego.texturas[`torre${tipo}`];

    const marco = new PIXI.Graphics();
    marco.roundRect(0, 0, BOTON_TAMANO, BOTON_TAMANO, 6);
    marco.fill({ color: 0x334455, alpha: 1 });
    marco.x = x;
    marco.y = y;
    this.container.addChild(marco);

    const sprite = new PIXI.Sprite(textura);
    sprite.width = BOTON_TAMANO - 8;
    sprite.height = BOTON_TAMANO - 8;
    sprite.x = x + 4;
    sprite.y = y + 4;
    sprite.interactive = true;
    sprite.cursor = "pointer";

    sprite.on("pointerover", () => {
      marco.clear();
      marco.roundRect(0, 0, BOTON_TAMANO, BOTON_TAMANO, 6);
      marco.fill({ color: 0x4488cc, alpha: 1 });
    });

    sprite.on("pointerout", () => {
      marco.clear();
      marco.roundRect(0, 0, BOTON_TAMANO, BOTON_TAMANO, 6);
      marco.fill({ color: 0x334455, alpha: 1 });
    });

    sprite.on("pointerdown", () => {
      this.ignorarProximoClick = true;
      this.activarModoColocacion(tipo);
    });

    this.container.addChild(sprite);
  }

  posicionarPanel() {
    this.container.x = 12;
    this.container.y = window.innerHeight - PANEL_ALTO - 12;
  }

  activarModoColocacion(tipo) {
    this.cancelarColocacion();

    const textura = this.juego.texturas[`torre${tipo}`];
    const sprite = new PIXI.Sprite(textura);
    sprite.anchor.set(0.5, 1);
    sprite.alpha = 0.5;
    sprite.tint = 0x4499ff;
    sprite.zIndex = 9999;

    this.fantasma = { sprite, tipo };
    this.juego.mundo.addChild(sprite);
  }

  onMouseMove(event) {
    if (!this.fantasma) return;

    const zoom = this.juego.mundo.scale.x;
    const mundoX = (event.pageX - this.juego.mundo.x) / zoom;
    const mundoY = (event.pageY - this.juego.mundo.y) / zoom;

    this.fantasma.sprite.x = mundoX;
    this.fantasma.sprite.y = mundoY;
  }

  confirmarColocacion(mundoX, mundoY) {
    if (!this.fantasma) return false;

    const tipo = this.fantasma.tipo;
    this.cancelarColocacion();
    this.juego.spawnTorre(mundoX, mundoY, tipo);
    return true;
  }

  cancelarColocacion() {
    if (!this.fantasma) return;

    this.juego.mundo.removeChild(this.fantasma.sprite);
    this.fantasma.sprite.destroy();
    this.fantasma = null;
  }
}

window.UI = UI;
