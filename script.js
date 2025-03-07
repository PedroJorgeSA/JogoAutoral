class gameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'gameScene' }); // Define a chave da cena

        this.pontuacao = 0; // Inicializa a pontuação
        this.jogoFinalizado = false; // Controle para evitar múltiplos finais
    }

    preload() {
        // Carrega todos os assets necessários para o jogo
        this.load.image('sky', 'assets/sky.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 80, frameHeight: 198 });
        this.load.image('ground', 'assets/ground.png');
        this.load.image('platform', 'assets/plataform.png');
        this.load.image('arvore', 'assets/Arvore.png');
        this.load.image('ouro', 'assets/Ouro.png');
        this.load.spritesheet('zumbi', 'assets/zumbi.png', { frameWidth: 93, frameHeight: 132 });
        this.load.image('arvoreAlta', 'JogoAutoral/assets/Arvore2.png');
        this.load.image('button2', 'assets/continuar.png');
        this.load.image('tutorial', 'assets/tutorial.png');
        this.load.image('casa', 'assets/casa.png');
        this.load.image('parabens', 'assets/parabens.png');
    }

    create() {
        this.jogoFinalizado = false; // Reinicia controle ao criar a cena

        // Adiciona o céu ao jogo
        let ceus = [];
        for (let i = 0; i <= 1; i++) {
            ceus.push(this.add.image(400 + (i * 1600), 300, 'sky'));
        }

        // Cria o chão do jogo
        this.ground = this.physics.add.staticGroup();
        [200, 600, 1000, 1400, 1800, 2400].forEach(x => this.ground.create(x, 540, 'ground'));

        // Cria o jogador
        this.player = this.physics.add.sprite(27, 66, 'dude').setScale(0.4);
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.ground);

        // Cria as árvores
        this.trees = this.physics.add.staticGroup();
        this.trees.create(700, 412, 'arvore');
        this.trees.create(1200, 412, 'arvore');
        this.trees.create(1450, 365, 'arvoreAlta');
        this.physics.add.collider(this.player, this.trees);

        // Cria as plataformas
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 300, 'platform');
        this.physics.add.collider(this.player, this.platforms);

        // Cria a casa
        this.casa = this.physics.add.staticImage(2400, 400, 'casa').setScale(0.9);
        this.physics.add.collider(this.player, this.casa);

        // Define as teclas de controle
        this.cursors = this.input.keyboard.createCursorKeys();

        // Cria o grupo de ouro
        this.ouro = this.physics.add.group({
            key: 'ouro',
            repeat: 6,
            setXY: { x: 100, y: 260, stepX: 300 }
        });

        // Ajusta a escala do ouro
        this.ouro.children.iterate(gold => gold.setScale(0.05));
        this.physics.add.collider(this.ouro, [this.platforms, this.trees, this.ground]);
        this.physics.add.overlap(this.player, this.ouro, this.coletarOuro, null, this);

        // Adiciona o texto de pontuação
        this.pontos = this.add.text(16, 16, 'Pontos: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);

        // Cria o grupo de zumbis
        this.zumbis = this.physics.add.group();
        this.adicionarZumbi(1400, 400);
        this.adicionarZumbi(900, 400);

        // Adiciona colisões para os zumbis
        this.physics.add.collider(this.zumbis, this.ground);
        this.physics.add.collider(this.zumbis, this.trees, this.mudarDirecao, null, this);
        this.physics.add.collider(this.player, this.zumbis, this.jogadorMorre, null, this);

        // Cria as animações do jogador e dos zumbis
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('zumbi', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 3, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 0 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 1, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // Configura a câmera para seguir o jogador
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, 2500, 600);
        this.physics.world.setBounds(0, 0, 2500, 600);

        // Adiciona a imagem do tutorial e o botão para continuar
        let tutorialImage = this.add.image(400, 300, 'tutorial').setScale(0.3);
        let button2 = this.add.image(400, 450, 'button2').setScale(0.3).setInteractive();

        button2.on('pointerdown', () => {
            tutorialImage.setVisible(false);
            button2.setVisible(false);
        });
    }

    update() {
        // Controle do movimento do jogador
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }

        // Controle do pulo do jogador
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }

        // Verifica se o jogador caiu do mapa
        if (this.player.y >= 500) {
            this.jogadorMorre();
        }

        // Verifica se o jogador chegou ao final do mapa
        if (this.player.x >= 2200 && !this.jogoFinalizado) {
            this.jogoFinalizado = true;
            this.finalizarJogo();
        }

        // Garante que todos os zumbis continuem andando
        this.zumbis.children.iterate(zumbi => {
            if (zumbi.body.velocity.x === 0) {
                zumbi.setVelocityX(zumbi.flipX ? -100 : 100);
            }
        });
    }

    finalizarJogo() {
        // Adiciona a imagem de parabéns
        this.add.image(2110, 300, 'parabens').setScale(0.3);

        // Adiciona o botão para reiniciar o jogo
        let button3 = this.add.image(2110, 425, 'button2').setScale(0.3).setInteractive();

        button3.on('pointerdown', () => {
            console.log("Botão 3 clicado!");
            this.resetGame();
            this.scene.start('gameScene'); // Reinicia a cena do jogo
        });

        // Pausa a física do jogo e muda a cor do jogador
        this.physics.pause();
        this.player.setTint(0x00ff00);
        this.player.anims.play('turn');
    }

    adicionarZumbi(x, y) {
        // Adiciona um zumbi ao jogo
        let zumbi = this.zumbis.create(x, y, 'zumbi').setScale(0.6);
        zumbi.setVelocityX(-100);
        zumbi.setCollideWorldBounds(true);
        zumbi.flipX = true;
        zumbi.anims.play('walk', true);
    }

    coletarOuro(player, gold) {
        // Coleta o ouro e atualiza a pontuação
        gold.disableBody(true, true);
        this.pontuacao += 10;
        this.pontos.setText('Pontos: ' + this.pontuacao);
    }

    mudarDirecao(zumbi, obj) {
        // Muda a direção do zumbi ao colidir com um objeto
        zumbi.setVelocityX(zumbi.body.velocity.x * -1);
        zumbi.flipX = !zumbi.flipX;
    }

    jogadorMorre() {
        // Pausa o jogo e muda a cor do jogador ao morrer
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');

        // Reinicia o jogo após um atraso
        this.time.delayedCall(2000, () => {
            this.resetGame();
            this.scene.restart();
        });
    }

    resetGame() {
        // Reseta a pontuação e o estado do jogo
        this.pontuacao = 0;
        this.jogoFinalizado = false;
    }
}
