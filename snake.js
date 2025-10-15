      const canvas = document.getElementById("gameCanvas");
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      const blockSize = 10;
      const widthInBlocks = width / blockSize;
      const heightInBlocks = height / blockSize;

      let score = 0;

      const drawBorder = function () {
        ctx.fillStyle = "Teal";
        ctx.fillRect(0, 0, width, blockSize);
        ctx.fillRect(0, height - blockSize, width, blockSize);
        ctx.fillRect(0, 0, blockSize, height);
        ctx.fillRect(width - blockSize, 0, blockSize, height);
      };

      const drawScore = function () {
        ctx.font = "20px Courier";
        ctx.fillStyle = "White";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Счет: " + score, blockSize, blockSize);
      };

      const gameOver = function () {
        clearInterval(intervalId);
        ctx.font = "60px Courier";
        ctx.fillStyle = "White";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Конец игры", width / 2, height / 2);
      };

      function toUpper(str) {
        return str
          .toLowerCase()
          .split(" ")
          .map(function (word) {
            return word[0].toUpperCase() + word.substr(1);
          })
          .join(" ");
      }

      const circle = function (x, y, radius, fillCircle, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI * 2, false);
        ctx.fillStyle = color;
        if (fillCircle) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
      };

      class Block {
        constructor(col, row) {
          this.col = col;
          this.row = row;
        }
      };

      Block.prototype.drawSquare = function (color) {
        const x = this.col * blockSize;
        const y = this.row * blockSize;
        ctx.fillStyle = toUpper(color);
        ctx.fillRect(x, y, blockSize, blockSize);
      };

      Block.prototype.drawCircle = function (color) {
        const centerX = this.col * blockSize + blockSize / 2;
        const centerY = this.row * blockSize + blockSize / 2;
        ctx.fillStyle = toUpper(color);
        circle(centerX, centerY, blockSize / 2, true);
      };

      Block.prototype.equal = function (otherBlock) {
        return this.col === otherBlock.col && this.row === otherBlock.row;
      };

      const Snake = function () {
        this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];

        this.direction = "right";
        this.nextDirection = "right";
      };

      Snake.prototype.draw = function () {
        for (let i = 0; i < this.segments.length; i++) {
          this.segments[i].drawSquare(i % 2 === 0 ? "gold" : "blue");
          this.segments[0].drawSquare("LimeGreen");
        }
      };

      Snake.prototype.move = function () {
        const head = this.segments[0];
        let newHead;

        this.direction = this.nextDirection;

        if (this.direction === "right") {
          newHead = new Block(head.col + 1, head.row);
        } else if (this.direction === "down") {
          newHead = new Block(head.col, head.row + 1);
        } else if (this.direction === "left") {
          newHead = new Block(head.col - 1, head.row);
        } else if (this.direction === "up") {
          newHead = new Block(head.col, head.row - 1);
        }

        if (this.checkCollision(newHead)) {
          gameOver();
          return;
        }

        this.segments.unshift(newHead);

        if (newHead.equal(apple.position)) {
          score++;
          apple.move();
        } else {
          this.segments.pop();
        }
      };

      Snake.prototype.checkCollision = function (head) {
        const leftCollision = head.col === 0;
        const topCollision = head.row === 0;
        const rightCollision = head.col === widthInBlocks - 1;
        const bottomCollision = head.row === heightInBlocks - 1;

        const wallCollision =
          leftCollision || topCollision || rightCollision || bottomCollision;

        let selfCollision = false;

        for (let i = 0; i < this.segments.length; i++) {
          if (head.equal(this.segments[i])) {
            selfCollision = true;
          }
        }

        return wallCollision || selfCollision;
      };

      Snake.prototype.setDirection = function (newDirection) {
        if (this.direction === "up" && newDirection === "down") {
          return;
        } else if (this.direction === "right" && newDirection === "left") {
          return;
        } else if (this.direction === "down" && newDirection === "up") {
          return;
        } else if (this.direction === "left" && newDirection === "right") {
          return;
        }

        this.nextDirection = newDirection;
      };

      class Apple {
    constructor() {
        this.position = new Block(10, 10);
    }
    draw() {
        this.position.drawCircle(
            colorsForApple[Math.floor(Math.random() * colorsForApple.length)]
        );
    }
    move() {
        const randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        const randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        this.position = new Block(randomCol, randomRow);
    }
}

      const colorsForApple = ["Red", "LimeGreen", "Gold"];



      const snake = new Snake();
      const apple = new Apple();

      const bgImage = new Image();
      bgImage.src = "./public/background.png";
      let bgReady = false;
      bgImage.onload = function () {
        bgReady = true;
      };

      const intervalId = setInterval(function () {
        ctx.clearRect(0, 0, width, height);

        if (bgReady) {
          ctx.drawImage(bgImage, 0, 0, width, height);
        } else {
          ctx.fillStyle = "#f0f0f0";
          ctx.fillRect(0, 0, width, height);
        }

        drawBorder();
        drawScore();
        snake.move();
        snake.draw();
        apple.draw();
      }, 100);

      const directions = {
        37: "left",
        38: "up",
        39: "right",
        40: "down",
      };

      $("body").keydown(function (event) {
        const newDirection = directions[event.keyCode];
        if (newDirection !== undefined) {
          snake.setDirection(newDirection);
        }
      });