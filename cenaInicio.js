class cenaInicio extends Phaser.Scene {
    constructor() {
        super({ key: 'CenaInicio' });
    }

    preload() {
        this.load.image('bg', 'assets/bg.jpg');
        this.load.image('Title', 'assets/Minecraft 2D.png');
        this.load.image('button', 'assets/button.png');
    }

    create() {
        this.add.image(400, 300, 'bg').setScale(0.6);
        this.add.image(400, 150, 'Title').setScale(0.9);

        // Criando o botão com interatividade
        let button = this.add.image(400, 300, 'button').setScale(0.7).setInteractive();

        // Animação de hover
        button.on('pointerover', () => {
            button.setScale(0.8);
        });

        button.on('pointerout', () => {
            button.setScale(0.7);
        });

        // Evento de clique para trocar de cena
        button.on('pointerdown', () => {
            this.scene.start('gameScene'); // Troca para a cena do jogo
        });
    }

    update() {
        // Lógica de atualização, se necessário
    }
}
