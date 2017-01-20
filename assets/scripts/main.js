jQuery(function ($) {

    'use strict';

    var offset = 30;
    var level = 1;

    var Canvas = function (selector) {
        this.$node = $(selector);
        this.width = this.$node.width();
        this.height = this.$node.height();
        this.player = null;
        this.throwing = null;
        this.attachEvents();
        this.initScene();
    };

    Canvas.prototype.attachEvents = function () {
        var self = this;
        $(window).on('resize', function () {
            self.width = self.$node.width();
            self.height = self.$node.height();
        });
        $(document).on('click', '#restart', function (event) {
            event.preventDefault();
            window.location.reload();
        });
    };

    Canvas.prototype.initScene = function () {
        var self = this;
        self.balls = [];
        for (var i = 0; i < level; i++) {
            var ball = new Ball(self);
            self.balls.push(ball);
        }
        self.throwing = window.setInterval(function () {
            self.balls.forEach(function (ball) {
                ball.throw();
            });
        }, 1000);
    };

    var Ball = function (canvas) {
        this.canvas = canvas;
        this.$node = $('<span class="ball"></span>');
        this.x = 0;
        this.y = 0;
        this.canvas.$node.append(this.$node);
        this.width = this.$node.width();
        this.height = this.$node.height();
    };

    Ball.prototype.throw = function () {
        this.x = Math.round(Math.random() * this.canvas.width);
        this.y = this.canvas.height - Math.round(Math.random() * 100) - offset;
        this._move();
        this.catch();
    };

    Ball.prototype.catch = function () {
        var self = this;
        var player = self.canvas.player;
        if (!self.canvas.throwing) {
            return;
        }
        if (self.x > player.x && self.x + self.width < player.x + player.width && self.y > player.y && self.y + self.height < player.y + player.height) {
            window.clearInterval(self.canvas.throwing);
            self.canvas.throwing = null;
            window.setTimeout(function () {
                self.canvas.$node.append('<div id="yay">Yay! You catched it!!!</div>');
            });
        }
    };

    Ball.prototype._move = function () {
        this.$node.css('transform', 'translate(' + this.x + 'px, ' + this.y + 'px)');
    };

    var Player = function (canvas, selector) {
        this.canvas = canvas;
        this.canvas.player = this;
        this.$node = $(selector);
        this.width = this.$node.width();
        this.height = this.$node.height();
        this.x = offset;
        this.y = this.canvas.height - this.height - offset;
        this._move();
        this.jumping = false;
        this.attachEvents();
    };

    Player.prototype.attachEvents = function () {
        var self = this;
        $(document).on('keydown', function (event) {
            switch (event.which) {
            case 38: // Up
                self.jump();
                break;
            case 39: // Right
                self.walkRight();
                break;
            case 37: // Left
                self.walkLeft();
                break;
            }
        });
    };

    Player.prototype.jump = function () {
        var self = this;
        if (!self.jumping) {
            self.jumping = true;
            self.y -= (offset * 2);
            self._move();
            window.setTimeout(function () {
                self.y += (offset * 2);
                self._move();
                window.setTimeout(function () {
                    self.jumping = false;
                }, 500);
            }, 500);
        }
    };

    Player.prototype.walkRight = function () {
        return this.walk(1);
    };

    Player.prototype.walkLeft = function () {
        return this.walk(-1);
    };

    Player.prototype.walk = function (direction) {
        var x = this.x + (direction * offset);
        if (x >= offset && x + this.width <= this.canvas.width - offset) {
            this.x = x;
        }
        this._move();
    };

    Player.prototype._move = function () {
        var self = this;
        self.$node.css('transform', 'translate(' + self.x + 'px, ' + self.y + 'px)');
        self.canvas.balls.forEach(function (ball) {
            ball.catch();
        });
    };

    var canvas = new Canvas('#canvas');
    var pocoyo = new Player(canvas, '#pocoyo');

});
