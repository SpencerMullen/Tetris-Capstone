class Tetris
{
    constructor(element)
    {
        this.element = element;
        this.canvas = element.querySelector('canvas.tetris');
        this.context = this.canvas.getContext('2d');
        this.context.scale(20, 20);

        this.holdCanvas = element.querySelector('canvas.tetris-hold')
        this.holdCanvasContext = this.holdCanvas.getContext('2d');

        this.nextCanvas = element.querySelector('canvas.tetris-next')
        this.nextCanvasContext = this.nextCanvas.getContext('2d');
        
        this.holdCanvasContext.scale(25, 25);
        this.nextCanvasContext.scale(20, 20);

        this.arena = new Arena(12, 20);
        this.player = new Player(this);

        this.started = false

        this.player.events.listen('score', score =>
            this.updateScore(score)
        )

        this.colors = [
            null,
            '#FF0000',
            '#00FFFF',
            '#00FF00',
            '#AA00FF',
            '#FFA500',
            '#FFFF00',
            '#0000FF',
            "#FFFFFF"
        ];

        let lastTime = 0;
        this._update = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            this.player.update(deltaTime);

            this.draw();
            requestAnimationFrame(this._update);
        };
        
        this.updateScore(0);
    }

    getReady() {
        setTimeout(() => {
            const $button = $("#ready_btn")
            const $canvas = $('.player.local .tetris-container canvas')
            
            let index
            $.each($('.player'), function(i) {
                if ($(this).hasClass('local')) index = i
            })

            let { top, left } = $canvas.position()

            top = top + (($canvas.height() - $button.width()) / 2)

            if (index === 1) left = left - $(window).height() * .075;
            left = left + (($canvas.width() - $button.width()) / 2)

            $button.css({ top, left, position:'absolute' })
            $button.removeClass('hidden')
            $button.click(() => { 
                this.player.events.emit('ready')
                $button.addClass('hidden')
            })
        }, 500)
    }

    draw(otherPlayer=false)
    {
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawMatrix(this.context, this.arena.matrix, {x: 0, y: 0});
        this.drawMatrix(this.context, this.player.matrix || [], this.player.pos);

        if (otherPlayer){
            if (this.player['hold-piece']) {
                this.holdCanvasContext.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height)
                this.drawMatrix(this.holdCanvasContext, this.player['hold-piece'], { x: 0, y: 0 })
            }
            if (this.player['next-pieces']) {
                this.nextCanvasContext.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height)
                this.drawMatrix(this.nextCanvasContext, this.player['next-pieces'], { x: 1, y: 0 })
            }
        }
    }

    drawMatrix(context, matrix, offset)
    {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = this.colors[value];
                    context.fillRect(x + offset.x,
                                     y + offset.y,
                                     1, 1);
                }
            });
        });
    }

    run() {
        this.player.reset()
        this._update()
    }

    serialize() {
        return {
            arena: { 
                matrix : this.arena.matrix 
            },
            player: { 
                matrix: this.player.matrix,
                pos: this.player.pos,
                score: this.player.score
            }
        }
    }

    countdown(countdown) {
        console.log('countdown', countdown)

        this.context.font = "8px Arial";
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.context.fillStyle = 'white';
        this.context.fillText(countdown, 4, 10)
    }

    deserialize(state) {
        this.arena = Object.assign(state.arena)
        this.player = Object.assign(state.player)

        this.updateScore(this.player.score)

        this.draw()
    }

    updateScore(score)
    {
        // this.element.querySelector('.score').innerText = score;
    }
}