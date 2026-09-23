import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../game/constants';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#d9d0bd');

    this.add
      .text(GAME_WIDTH / 2, 170, 'ROLL FOR TROUBLE', {
        fontFamily: 'Georgia, serif',
        fontSize: '64px',
        color: '#1b1b1b',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 240, 'Horde Survival Roguelike', {
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
        color: '#3f3a32',
      })
      .setOrigin(0.5);

    const button = this.add
      .rectangle(GAME_WIDTH / 2, 400, 300, 78, 0x2b2926)
      .setStrokeStyle(3, 0x8c7448)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(GAME_WIDTH / 2, 400, 'RUN STARTEN', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#f2ead8',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    button.on('pointerover', () => button.setFillStyle(0x3a3732));
    button.on('pointerout', () => button.setFillStyle(0x2b2926));
    button.on('pointerdown', () => this.scene.start('GameScene'));
    label.setDepth(1);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 55, 'Prototyp 0.1', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: '#5b554c',
      })
      .setOrigin(0.5);
  }
}
