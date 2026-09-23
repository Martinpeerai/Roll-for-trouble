import Phaser from 'phaser';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  RunPhase,
  TOTAL_WAVES,
  WAVE_DURATION_SECONDS,
} from '../game/constants';

const WORLD_WIDTH = 2400;
const WORLD_HEIGHT = 1600;
const PLAYER_SPEED = 260;

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image;
  private enemies!: Phaser.Physics.Arcade.Group;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  private wave = 1;
  private phase = RunPhase.Combat;
  private combatEndsAt = 0;
  private gold = 0;
  private xp = 0;
  private hp = 100;
  private lastDamageAt = 0;
  private runEnded = false;

  private waveText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private phaseText!: Phaser.GameObjects.Text;
  private resourceText!: Phaser.GameObjects.Text;
  private hpText!: Phaser.GameObjects.Text;
  private rewardContainer?: Phaser.GameObjects.Container;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.createPlaceholderTextures();
    this.createWorld();

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.player = this.physics.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 'player-placeholder');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(20);

    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (projectileObject, enemyObject) => this.onProjectileHit(projectileObject, enemyObject),
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      (_playerObject, enemyObject) => this.onPlayerContact(enemyObject),
    );

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input is required for the current prototype.');
    }

    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setZoom(1);

    this.createHud();

    this.time.addEvent({
      delay: 850,
      loop: true,
      callback: () => {
        if (this.phase === RunPhase.Combat && !this.runEnded) {
          this.spawnEnemy();
        }
      },
    });

    this.time.addEvent({
      delay: 420,
      loop: true,
      callback: () => this.fireAtNearestEnemy(),
    });

    this.startCombatPhase();
  }

  update(): void {
    if (this.runEnded || this.phase === RunPhase.Reward) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.updatePlayerMovement();
    this.updateEnemies();
    this.updateWaveClock();
  }

  private createPlaceholderTextures(): void {
    const makeCircle = (key: string, diameter: number, color: number, stroke = 0x1b1b1b): void => {
      if (this.textures.exists(key)) return;
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.lineStyle(3, stroke, 1);
      graphics.fillCircle(diameter / 2, diameter / 2, diameter / 2 - 2);
      graphics.strokeCircle(diameter / 2, diameter / 2, diameter / 2 - 2);
      graphics.generateTexture(key, diameter, diameter);
      graphics.destroy();
    };

    makeCircle('player-placeholder', 44, 0x3f70a8);
    makeCircle('enemy-placeholder', 36, 0x9e3d32);
    makeCircle('boss-placeholder', 76, 0x6d3f86);
    makeCircle('projectile-placeholder', 12, 0x252525, 0x252525);
  }

  private createWorld(): void {
    this.cameras.main.setBackgroundColor('#d9d0bd');
    const graphics = this.add.graphics();

    graphics.fillStyle(0xd9d0bd, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    graphics.lineStyle(1, 0x978f80, 0.3);
    const gridSize = 64;
    for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
      graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
      graphics.lineBetween(0, y, WORLD_WIDTH, y);
    }

    graphics.lineStyle(5, 0x81725d, 0.7);
    graphics.lineBetween(0, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT / 2);
    graphics.lineBetween(WORLD_WIDTH / 2, 0, WORLD_WIDTH / 2, WORLD_HEIGHT);

    graphics.fillStyle(0xaaa08c, 1);
    graphics.fillCircle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, 80);
    graphics.setDepth(-10);
  }

  private createHud(): void {
    const hudStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#f5f0e6',
      stroke: '#171717',
      strokeThickness: 4,
    };

    this.waveText = this.add.text(22, 18, '', hudStyle).setScrollFactor(0).setDepth(100);
    this.timerText = this.add.text(GAME_WIDTH / 2, 18, '', hudStyle).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    this.phaseText = this.add.text(GAME_WIDTH - 22, 18, '', hudStyle).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this.resourceText = this.add.text(22, GAME_HEIGHT - 48, '', hudStyle).setScrollFactor(0).setDepth(100);
    this.hpText = this.add.text(GAME_WIDTH - 22, GAME_HEIGHT - 48, '', hudStyle).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

    this.refreshHud();
  }

  private startCombatPhase(): void {
    this.phase = RunPhase.Combat;
    this.combatEndsAt = this.time.now + WAVE_DURATION_SECONDS * 1000;
    this.clearEnemies();

    const initialCount = Math.min(3 + this.wave, 10);
    for (let index = 0; index < initialCount; index += 1) {
      this.spawnEnemy();
    }

    this.refreshHud();
  }

  private updateWaveClock(): void {
    if (this.phase !== RunPhase.Combat) return;

    const remainingMs = Math.max(0, this.combatEndsAt - this.time.now);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    this.timerText.setText(`${remainingSeconds}s`);

    if (remainingMs <= 0) {
      this.startWaveBossPhase();
    }
  }

  private startWaveBossPhase(): void {
    if (this.phase !== RunPhase.Combat) return;

    this.phase = RunPhase.WaveBoss;
    this.clearEnemies();
    this.spawnBoss();
    this.timerText.setText('BOSS');
    this.refreshHud();
  }

  private spawnEnemy(): void {
    const position = this.getSpawnPositionAroundPlayer(520, 760);
    const enemy = this.enemies.create(position.x, position.y, 'enemy-placeholder') as Phaser.Physics.Arcade.Image;
    enemy.setData('hp', 1 + Math.floor((this.wave - 1) / 5));
    enemy.setData('maxHp', enemy.getData('hp'));
    enemy.setData('boss', false);
    enemy.setData('speed', 75 + this.wave * 3);
    enemy.setDepth(15);
  }

  private spawnBoss(): void {
    const position = this.getSpawnPositionAroundPlayer(520, 620);
    const boss = this.enemies.create(position.x, position.y, 'boss-placeholder') as Phaser.Physics.Arcade.Image;
    const hp = 14 + this.wave * 4;
    boss.setData('hp', hp);
    boss.setData('maxHp', hp);
    boss.setData('boss', true);
    boss.setData('speed', 58 + this.wave * 2);
    boss.setDepth(16);
    boss.setScale(1 + Math.min(this.wave * 0.01, 0.25));
  }

  private getSpawnPositionAroundPlayer(minRadius: number, maxRadius: number): Phaser.Math.Vector2 {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const radius = Phaser.Math.Between(minRadius, maxRadius);
    const x = Phaser.Math.Clamp(this.player.x + Math.cos(angle) * radius, 60, WORLD_WIDTH - 60);
    const y = Phaser.Math.Clamp(this.player.y + Math.sin(angle) * radius, 60, WORLD_HEIGHT - 60);
    return new Phaser.Math.Vector2(x, y);
  }

  private updatePlayerMovement(): void {
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    const velocity = new Phaser.Math.Vector2(
      (right ? 1 : 0) - (left ? 1 : 0),
      (down ? 1 : 0) - (up ? 1 : 0),
    );

    if (velocity.lengthSq() > 0) {
      velocity.normalize().scale(PLAYER_SPEED);
    }

    this.player.setVelocity(velocity.x, velocity.y);
  }

  private updateEnemies(): void {
    const children = this.enemies.getChildren() as Phaser.Physics.Arcade.Image[];
    for (const enemy of children) {
      if (!enemy.active) continue;
      const speed = Number(enemy.getData('speed') ?? 80);
      this.physics.moveToObject(enemy, this.player, speed);
    }
  }

  private fireAtNearestEnemy(): void {
    if (this.runEnded || this.phase === RunPhase.Reward || !this.player?.active) return;

    const enemies = (this.enemies.getChildren() as Phaser.Physics.Arcade.Image[]).filter((enemy) => enemy.active);
    if (enemies.length === 0) return;

    let target = enemies[0];
    let nearestDistance = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);

    for (const enemy of enemies.slice(1)) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance < nearestDistance) {
        target = enemy;
        nearestDistance = distance;
      }
    }

    if (nearestDistance > 620) return;

    const projectile = this.projectiles.create(this.player.x, this.player.y, 'projectile-placeholder') as Phaser.Physics.Arcade.Image;
    projectile.setDepth(30);
    this.physics.moveToObject(projectile, target, 720);

    this.time.delayedCall(1100, () => {
      if (projectile.active) projectile.destroy();
    });
  }

  private onProjectileHit(
    projectileObject: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    enemyObject: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  ): void {
    const projectile = projectileObject as Phaser.Physics.Arcade.Image;
    const enemy = enemyObject as Phaser.Physics.Arcade.Image;
    if (!projectile.active || !enemy.active) return;

    projectile.destroy();

    const nextHp = Number(enemy.getData('hp') ?? 1) - 1;
    enemy.setData('hp', nextHp);

    if (nextHp <= 0) {
      const isBoss = Boolean(enemy.getData('boss'));
      enemy.destroy();
      this.xp += isBoss ? 12 + this.wave * 2 : 1;
      this.gold += isBoss ? 10 + this.wave : Phaser.Math.Between(0, 4) === 0 ? 1 : 0;
      this.refreshHud();

      if (isBoss && this.phase === RunPhase.WaveBoss) {
        this.showRewardPhase();
      }
    }
  }

  private onPlayerContact(
    enemyObject: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
  ): void {
    if (this.time.now - this.lastDamageAt < 500 || this.runEnded) return;

    const enemy = enemyObject as Phaser.Physics.Arcade.Image;
    this.lastDamageAt = this.time.now;
    this.hp -= Boolean(enemy.getData('boss')) ? 10 : 5;
    this.cameras.main.shake(90, 0.006);
    this.refreshHud();

    if (this.hp <= 0) {
      this.endRun(false);
    }
  }

  private showRewardPhase(): void {
    this.phase = RunPhase.Reward;
    this.clearEnemies();
    this.player.setVelocity(0, 0);
    this.refreshHud();

    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 610, 390, 0x171717, 0.95)
      .setStrokeStyle(3, 0x9a8050)
      .setScrollFactor(0);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 130, `WELLE ${this.wave} GESCHAFFT`, {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      color: '#f1e7cf',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0);

    const reward = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 45,
      `Wellenbelohnung: +${5 + this.wave} Gold\n\nShop und Itemauswahl werden als nächster Systemblock ergänzt.`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ded6c8',
        align: 'center',
      }).setOrigin(0.5).setScrollFactor(0);

    this.gold += 5 + this.wave;
    this.refreshHud();

    const button = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120, 270, 64, 0x6f5834)
      .setStrokeStyle(2, 0xc2a56e)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);

    const buttonText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 120,
      this.wave >= TOTAL_WAVES ? 'RUN ABSCHLIESSEN' : 'NÄCHSTE WELLE',
      {
        fontFamily: 'Georgia, serif',
        fontSize: '21px',
        color: '#fff6e3',
        fontStyle: 'bold',
      },
    ).setOrigin(0.5).setScrollFactor(0);

    this.rewardContainer = this.add.container(0, 0, [panel, title, reward, button, buttonText]).setDepth(500);

    button.on('pointerdown', () => {
      this.rewardContainer?.destroy(true);
      this.rewardContainer = undefined;

      if (this.wave >= TOTAL_WAVES) {
        this.endRun(true);
        return;
      }

      this.wave += 1;
      this.startCombatPhase();
    });
  }

  private endRun(victory: boolean): void {
    if (this.runEnded) return;
    this.runEnded = true;
    this.physics.pause();

    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 650, 380, 0x121212, 0.96)
      .setStrokeStyle(3, victory ? 0xb99b5e : 0x8f3e36)
      .setScrollFactor(0);

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 110, victory ? 'RUN GESCHAFFT' : 'DU BIST TOT', {
      fontFamily: 'Georgia, serif',
      fontSize: '42px',
      color: '#f3ead6',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0);

    const stats = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, `Welle: ${this.wave}/${TOTAL_WAVES}\nXP: ${this.xp}\nGold: ${this.gold}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ddd4c5',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0);

    const button = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 115, 270, 64, 0x34302b)
      .setStrokeStyle(2, 0x8c7448)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);

    const buttonText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 115, 'HAUPTMENÜ', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#f3ead6',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0);

    this.add.container(0, 0, [panel, title, stats, button, buttonText]).setDepth(600);
    button.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }

  private clearEnemies(): void {
    this.enemies?.clear(true, true);
    this.projectiles?.clear(true, true);
  }

  private refreshHud(): void {
    if (!this.waveText) return;

    this.waveText.setText(`Welle ${this.wave}/${TOTAL_WAVES}`);
    this.phaseText.setText(
      this.phase === RunPhase.Combat
        ? 'KAMPF'
        : this.phase === RunPhase.WaveBoss
          ? 'WELLENBOSS'
          : 'SHOP / BELOHNUNG',
    );
    this.resourceText.setText(`XP ${this.xp}   Gold ${this.gold}`);
    this.hpText.setText(`HP ${Math.max(0, this.hp)}/100`);

    if (this.phase === RunPhase.Combat) {
      const remainingMs = Math.max(0, this.combatEndsAt - this.time.now);
      this.timerText.setText(`${Math.ceil(remainingMs / 1000)}s`);
    } else if (this.phase === RunPhase.WaveBoss) {
      this.timerText.setText('BOSS');
    } else {
      this.timerText.setText('PAUSE');
    }
  }
}
