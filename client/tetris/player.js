class Player
{
    constructor(tetris)
    {
        this.DROP_SLOW = 1000;
        this.DROP_FAST = 50;

        this.events = new Events()

        this.tetris = tetris;
        this.arena = tetris.arena;

        this.bag = []
        this.bagIndex = 0

        this.dropCounter = 0;
        this.dropInterval = this.DROP_SLOW;

        this.pos = {x: 0, y: 0};
        this.matrix = null;
        this.score = 0;

        this.canHold = true
        this.heldPiece = null

        this.nextPieces = []

        this.gameRunning = false
    }

    // returns matrix given piece letter
    createPiece(type) {
        if (type === 'T') {
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        } else if (type === 'O') {
            return [
                [2, 2],
                [2, 2],
            ];
        } else if (type === 'L') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ];
        } else if (type === 'J') {
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0],
            ];
        } else if (type === 'I') {
            return [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        } else if (type === 'Z') {
            return [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0],
            ];
        }
    }

    // holds current piece
    hold() {
        const heldPiece = this.matrix // sets held piece to current piece
        this.reset(this.heldPiece) // calls reset with currently held piece (either next piece will be held piece or next piece)
        this.heldPiece = heldPiece
        this.canHold = false

        // resets canvas and draws new held piece
        this.tetris.holdCanvasContext.clearRect(0, 0, this.tetris.holdCanvas.width, this.tetris.holdCanvas.height)
        this.tetris.drawMatrix(this.tetris.holdCanvasContext, this.heldPiece, { x: 0, y: 0 })

        this.events.emit('hold-piece', this.heldPiece)
    }

    drop()
    {
        this.pos.y++;
        this.dropCounter = 0

        if (this.arena.collide(this)) {
            console.log("player x pos:", this.pos.x)
            this.pos.y--;
            this.arena.merge(this);
            this.score += this.arena.sweep(this);
            this.reset();
            this.canHold = true
            this.events.emit('score', this.score);
            return -1
        }

        this.events.emit('pos', this.pos)
    }

    move(dir)
    {
        this.pos.x += dir;
        if (this.arena.collide(this)) {
            this.pos.x -= dir;
        }
    }

    // gets next piece
    getNextPiece() {
        const piece = this.bag[this.bagIndex] // gets piece at current index
        
        // if current index is within 7 of the end of the bag, send event to update bag and add more pieces
        if (this.bagIndex >= this.bag.length - 7) 
            this.events.emit('get-bag', this.bagIndex)

        return this.createPiece(piece)
    }

    updateNextPieces() {
        this.nextPieces = []
        const nextPieces = this.bag.slice(++this.bagIndex, this.bagIndex+5) // returns array with next 5 pieces

        // loops through the pieces and create a matrix for each and append to this.nextPieces array
        for (let i = 0; i < nextPieces.length; i++) {
            const piece = this.createPiece(nextPieces[i])
            this.nextPieces = this.nextPieces.concat(piece).concat([[0]])
        }

        // remove last element which is just the [[0]] from the concat
        this.nextPieces.pop()
    }

    reset(matrix)
    {
        this.matrix = matrix || this.getNextPiece() // if a matrix was passed in, use that as the next piece -- if not getNextPiece()
        this.pos.y = 0;
        this.pos.x = (this.arena.matrix[0].length / 2 | 0) -
                     (this.matrix[0].length / 2 | 0);

        if (this.arena.collide(this)) {
            this.arena.clear();
            this.score = 0;
            this.gameOver = true
            this.events.emit('player-lost')
        }

        this.updateNextPieces() // update next pieces array

        // clear next pieces canvas and draw new next pieces
        this.tetris.nextCanvasContext.clearRect(0, 0, this.tetris.nextCanvas.width, this.tetris.nextCanvas.height)
        this.tetris.drawMatrix(this.tetris.nextCanvasContext, this.nextPieces, { x:1, y:0 })
        
        this.events.emit('pos', this.pos);
        this.events.emit('matrix', this.matrix);
        this.events.emit('score', this.score);
        this.events.emit('next-pieces', this.nextPieces)
    }

    rotate(dir)
    {
        const pos = this.pos.x;
        let offset = 1;
        this._rotateMatrix(this.matrix, dir);
        while (this.arena.collide(this)) {
            this.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.matrix[0].length) {
                this._rotateMatrix(this.matrix, -dir);
                this.pos.x = pos;
                return;
            }
        }
        this.events.emit('matrix', this.matrix)
    }

    _rotateMatrix(matrix, dir)
    {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x],
                ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    update(deltaTime)
    {
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            this.drop();
        }
    }
}