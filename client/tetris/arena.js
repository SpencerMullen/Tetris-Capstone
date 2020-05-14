class Arena
{
    constructor(w, h)
    {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        this.matrix = matrix;

        this.events = new Events()
    }

    clear()
    {
        this.matrix.forEach(row => row.fill(0));
        this.events.emit('matrix', this.matrix)
    }

    collide(player)
    {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (this.matrix[y + o.y] &&
                    this.matrix[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(player)
    {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.matrix[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });

        this.events.emit('matrix', this.matrix)
    }

    sweep(player)
    {
        function createGarbage(rows) {
            const player = this

            let garbage = rows
            const emptyX = player.pos.x
            console.log("player x pos:", emptyX)

            for (let y = 0; y < garbage.length; y++) {
                for (let x = 0; x < garbage[y].length; x++) {
                    if (x === emptyX) garbage[y][x] = 0
                    else garbage[y][x] = 9
                }
            }

            if (garbage.length < 4) garbage = garbage.slice(0, garbage.length-1)

            player.events.emit('send-garbage', garbage)
        }

        let rowCount = 1;
        let score = 0;
        let clearedRows = []

        outer: for (let y = this.matrix.length - 1; y > 0; --y) {
            for (let x = 0; x < this.matrix[y].length; ++x) {
                if (this.matrix[y][x] === 0) {
                    continue outer;
                }
            }

            const row = this.matrix.splice(y, 1)[0]
            clearedRows.push([...row])

            const newRow = row.fill(0)
            this.matrix.unshift(newRow)
            ++y;

            score += rowCount * 10
            rowCount *= 2
        }

        if (clearedRows.length >= 2) createGarbage.call(player, clearedRows)

        this.events.emit('matrix', this.matrix)
        return score
    }
}
