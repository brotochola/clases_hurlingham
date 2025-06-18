import { NPC } from "./npc.js";
import * as PIXI from "https://cdn.skypack.dev/pixi.js@8.0.0";
export class UI {
  constructor(game) {
    this.game = game;
    this.container = new PIXI.Container();

    this.container.name = "ui";
    this.container.y = game.height * 2;
    this.game.app.stage.addChild(this.container);

    this.addBG();

    this.nombre = new PIXI.Text();
    this.vida = new PIXI.Text();
    this.vida.x = this.game.width * 0.3;
    this.vida.zIndex = 100;

    this.estado = new PIXI.Text();
    this.estado.x = this.game.width * 0.3;
    this.estado.y = 30;
    this.estado.zIndex = 101;

    this.nombre.x = 0;
    this.nombre.y = 0;
    this.nombre.text = "oadufsodfhdsf";

    this.nombre.zIndex = 100;
    this.container.addChild(this.nombre);
    this.container.addChild(this.vida);
    this.container.addChild(this.estado);
  }

  async addBG() {
    const bg = await PIXI.Assets.load("fondo_ui.png");
    const bgSprite = new PIXI.Sprite(bg);
    bgSprite.anchor.set(0);
    bgSprite.x = 0;
    bgSprite.y = 0;
    this.container.addChild(bgSprite);
  }
  mostrarDataDeEntidad(entity) {
    if (entity instanceof NPC) {
      this.mostrandoEntidad = entity;
    }
  }

  cambiarNombre(nombre) {
    this.nombre.text = nombre;
    this.subir();
  }

  cambiarVida(vida) {
    this.vida.text = vida;
  }

  mostrarEstado(estado) {
    this.estado.text = estado;
  }

  subir() {
    this.container.y = game.height * 0.85;
  }

  bajar() {
    this.container.y = game.height * 2;
  }

  update() {
    if (!this.mostrandoEntidad) return;
    this.cambiarNombre(this.mostrandoEntidad.id);
    this.cambiarVida(this.mostrandoEntidad.health);
    this.mostrarEstado(this.mostrandoEntidad.fsm.currentState);
  }
}
