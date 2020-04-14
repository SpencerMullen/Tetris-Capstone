const tetrisManager = new TetrisManager(document)
const localTetris = tetrisManager.createPlayer()
localTetris.element.classList.add('local')

const connectionManager = new ConnectionManager(tetrisManager)
connectionManager.connect(`ws://${window.location.hostname}:3000`)

const keyListener = (event) => {
    const player = localTetris.player

    if (event.type === 'keydown') {
        if (event.keyCode === 37) // left arrow - move left
            player.move(-1);
        else if (event.keyCode === 39) // right arrow - move right
            player.move(1);
        else if (event.keyCode === 38) // up arrow - rotate
            player.rotate(1);
        else if (event.keyCode === 67) {
            if (player.canHold) 
                player.hold()
        }
    }

    // down arrow - drop
    if (event.keyCode === 40) {
        if (event.type === 'keydown') {
            if (player.dropInterval !== player.DROP_FAST) {
                player.drop();
                player.dropInterval = player.DROP_FAST;
            }
        } else {
            player.dropInterval = player.DROP_SLOW;
        }
    }

    // spacebar - hard drop
    if (event.type === 'keyup') {
        if (event.keyCode === 32) {
            let drop = player.drop()
            while (drop !== -1)  // move block down until there is a collision
                drop = player.drop()
        }
    }
}

document.addEventListener('keydown', keyListener);
document.addEventListener('keyup', keyListener);
