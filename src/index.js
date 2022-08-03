let config = {};

let container = document.getElementById('canvasContainer');

let cellWidth = 0;
let cellHeight = 0;
let order = 0;

init(4,3);

function init(xNumber,yNumber) {
    getRotateImage().then((img) => {
        let height = container.offsetHeight - xNumber + 1;
        let width = container.offsetWidth - yNumber + 1;

        cellWidth = parseInt(width / xNumber);
        cellHeight = parseInt(height / yNumber);
        imageCellWidth = parseInt(img.width / xNumber);
        imageCellHeight = parseInt(img.height / yNumber);

        container.style['grid-template-columns'] = `repeat(${xNumber}, ${cellWidth}px`;
        container.style['grid-template-rows'] = `repeat(${yNumber}, ${cellHeight}px`;

        for (let j = 0; j < yNumber; j++) {
            for (let i = 0; i < xNumber; i++) {
                initCube(img, i, j, imageCellWidth, imageCellHeight);
            }
        }
    });
}

function initCube(img, i, j, LevelW, LevelH) {
    // 创建一个小方块
    let item = document.createElement('div');

    item.className = 'item';
    item.setAttribute('data-index', order);
    item.innerHTML = "<canvas class='' width='" + cellWidth + "' height='" + cellHeight + "'></canvas>";
    container.appendChild(item);

    let canvas = item.querySelector('canvas');
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, i * LevelW, j * LevelH, LevelW, LevelH, 0, 0, cellWidth, cellHeight);
    order++;
}

function getRotateImage() {
    let image = new Image();
    image.src = 'mountain.jpg';
    let angles = [0, 90, 180, 270];
    let angle = angles[Math.floor(Math.random() * angles.length)];
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    const degree = (angle * Math.PI) / 180;
    return new Promise((resolve, reject) => {
        image.onload = function () {
            const height = image.height;
            const width = image.width;
            switch (angle) {
                case 0:
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(image, 0, 0, width, height);
                    break;
                case 90:
                    canvas.width = height;
                    canvas.height = width;
                    ctx.rotate(degree);
                    ctx.drawImage(image, 0, -height, width, height);
                    break;
                case 180:
                    canvas.width = width;
                    canvas.height = height;
                    ctx.rotate(degree);
                    ctx.drawImage(image, -width, -height, width, height);
                    break;
                case 270:
                    canvas.width = height;
                    canvas.height = width;
                    ctx.rotate(degree);
                    ctx.drawImage(image, -width, 0, width, height);
                    break;
            }
            resolve(canvas);
        };
    });
}
