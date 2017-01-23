(function ($, doc, win) {

    'use strict';

    var Game = function (selector) {
        this.level = 0;
        this.$node = $(selector);
        this.addCanvas();
        this.addPlayer();
        this.bindControls();
        this.nextLevel();
    };

    Game.NODE_PREFIX = 'game-';

    Game.DIRECTION_RIGHT = 1;

    Game.DIRECTION_LEFT = -1;

    Game.waitForTransition = function (callback) {
        win.setTimeout(function () {
            callback();
        }, 510);
    };

    Game.prototype.addCanvas = function () {
        this.canvas = new Canvas();
        this.canvas.render(this.$node);
    };

    Game.prototype.addPlayer = function () {
        this.player = new Player();
        this.player.render(this.canvas.$node);
        if (this.canvas) {
            var x = this.canvas.gridSize;
            var y = this.canvas.height - this.player.height - this.canvas.gridSize;
            this.player.moveTo(x, y);
        }
    };

    Game.prototype.addBalls = function () {
        this.balls = [];
        for (var i = 0; i < this.level; i++) {
            var ball = new Ball(i);
            ball.render(this.canvas.$node);
            this.balls.push(ball);
        }
    };

    Game.prototype.removeBall = function (index) {
        var ball = this.balls[index];
        this.balls.splice(index, 1);
        Game.waitForTransition(function () {
            ball.$node.remove();
        });
    };

    Game.prototype.bindControls = function () {
        var self = this;
        $(doc).on('keydown', function (event) {
            switch (event.which) {
            case 38: // Up
                self.player.jump(self.canvas.gridSize * 2);
                break;
            case 39: // Right
                if (self.player.x + self.player.width < self.canvas.width - self.canvas.gridSize) {
                    self.player.moveRight(self.canvas.gridSize);
                }
                break;
            case 37: // Left
                if (self.player.x > self.canvas.gridSize) {
                    self.player.moveLeft(self.canvas.gridSize);
                }
                break;
            }
            self.catchBalls();
        });
    };

    Game.prototype.loop = function () {
        var self = this;
        self.looping = win.setInterval(function () {
            self.balls.forEach(function (ball) {
                var x;
                do {
                    x = Math.round(Math.random() * (self.canvas.gridSteps - 2)) * self.canvas.gridSize + self.canvas.gridSize;
                } while (Math.abs(x - self.player.x) < self.canvas.gridSize * 3);
                var y = self.canvas.height - self.canvas.gridSize - 75;
                ball.moveTo(x, y);
            });
            self.catchBalls();
        }, 1000);
    };

    Game.prototype.catchBalls = function () {
        var self = this;
        for (var i = self.balls.length; --i >= 0;) {
            var ball = self.balls[i];
            if (ball.wasCaught(self.player)) {
                self.removeBall(i);
                if (self.balls.length === 0) {
                    win.clearInterval(self.looping);
                    self.looping = null;
                    Game.waitForTransition(function () {
                        self.showMessage('Yay! You caught them all!!!');
                    });
                    win.setTimeout(function () {
                        self.nextLevel();
                    }, 4010);
                }
            }
        }
    };

    Game.prototype.nextLevel = function () {
        this.level++;
        this.showMessage('Level ' + this.level);
        this.addBalls();
        this.loop();
    };

    Game.prototype.showMessage = function (text) {
        var self = this;
        var message = new Message(text);
        message.render(self.canvas.$node);
        win.setTimeout(function () {
            message.$node.remove();
        }, 3500);
    };

    var Shape = function () {
        this.$node = null;
        this.width = null;
        this.height = null;
    };

    Shape.prototype.render = function ($container) {
        $container.append(this.$node);
        this.width = this.$node.width();
        this.height = this.$node.height();
    };

    Shape.prototype.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
        if (this.$node) {
            this.$node.css('transform', 'translate(' + this.x + 'px,' + this.y + 'px)');
        }
    };

    var Canvas = function () {
        this.$node = $(doc.createElement('div'));
        this.$node.attr('id', Game.NODE_PREFIX + 'canvas');
        this.bindControls();
        this.width = null;
        this.height = null;
        this.gridSize = 30;
        this.gridSteps = 50;
    };

    Canvas.prototype = new Shape();

    Canvas.prototype.render = function ($container) {
        Shape.prototype.render.call(this, $container);
        this.gridSize = this.width / this.gridSteps;
    };

    Canvas.prototype.bindControls = function () {
        var self = this;
        self.$restart = $(doc.createElement('a'));
        self.$restart.attr({
            id: Game.NODE_PREFIX + 'restart',
            href: '#'
        });
        self.$restart.text('Restart');
        self.$node.append(self.$restart);
        $(doc).on('click', function (event) {
            if (event.target !== self.$restart.get(0)) {
                return;
            }
            event.preventDefault();
            win.location.reload();
        });
    };

    var Player = function () {
        this.$node = $(doc.createElement('div'));
        this.$node.attr('id', Game.NODE_PREFIX + 'player');
        this.x = 0;
        this.y = 0;
        this.width = null;
        this.height = null;
    };

    Player.prototype = new Shape();

    Player.prototype.jump = function (size) {
        var self = this;
        if (!self.jumping) {
            self.jumping = true;
            var x = self.x;
            var y = self.y - size;
            self.moveTo(x, y);
            Game.waitForTransition(function () {
                var x = self.x;
                var y = self.y + size;
                self.moveTo(x, y);
                Game.waitForTransition(function () {
                    self.jumping = false;
                });
            });
        }
    };

    Player.prototype.moveRight = function (size) {
        this.move(Game.DIRECTION_RIGHT, size);
    };

    Player.prototype.moveLeft = function (size) {
        this.move(Game.DIRECTION_LEFT, size);
    };

    Player.prototype.move = function (direction, size) {
        var x = this.x + (direction * size);
        var y = this.y;
        this.moveTo(x, y);
    };

    var Ball = function (id) {
        this.$node = $(doc.createElement('div'));
        this.$node.attr('id', Game.NODE_PREFIX + 'ball-' + id.toString());
        this.$node.addClass(Game.NODE_PREFIX + 'ball');
        this.x = 0;
        this.y = 0;
        this.width = null;
        this.height = null;
    };

    Ball.prototype = new Shape();

    Ball.prototype.moveTo = function (x, y) {
        Shape.prototype.moveTo.call(this, x, y);
        this.$node.css('opacity', 1);
    };

    Ball.prototype.wasCaught = function (player) {
        return this.x > player.x && this.x + this.width < player.x + player.width && 
            this.y > player.y && this.y + this.height < player.y + player.height;
    };

    var Message = function (text) {
        this.$node = $(doc.createElement('div'));
        this.$node.attr('id', Game.NODE_PREFIX + 'message');
        this.$node.text(text);
    };

    Message.prototype = new Shape();

    win.Game = Game;

})(jQuery, document, window);
