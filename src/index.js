let container = document.getElementById('canvasContainer');
let yNumberElement = document.getElementById('yNumber');
let xNumberElement = document.getElementById('xNumber');
let tipPage = document.querySelectorAll('div.tip-page');

let dragElement = null;

let finished = false;

init();

document.getElementById('startBtn').addEventListener('click', function () {
    init();
});

document.getElementById('okBtn').addEventListener('click', function () {
    hidenTip();
});

function init() {
    let xNumber = xNumberElement.options[xNumberElement.selectedIndex].value;
    let yNumber = yNumberElement.options[yNumberElement.selectedIndex].value;
    let itemList = [];
    let order = 0;
    let img = null;
    let cellWidth, cellHeight, imageCellWidth, imageCellHeight;
    container.innerHTML = '';
    finished = false;

    getRotateImage().then((image) => {
        img = image;
        let height = container.offsetHeight - xNumber + 1;
        let width = container.offsetWidth - yNumber + 1;

        cellWidth = parseInt(width / xNumber);
        cellHeight = parseInt(height / yNumber);
        imageCellWidth = parseInt(img.width / xNumber);
        imageCellHeight = parseInt(img.height / yNumber);

        container.style['grid-template-columns'] = `repeat(${xNumber}, ${cellWidth}px`;
        container.style['grid-template-rows'] = `repeat(${yNumber}, ${cellHeight}px`;

        for (let j = 0; j < yNumber; j++) {
            itemList[j] = [];
            for (let i = 0; i < xNumber; i++) {
                initCube(i, j);
            }
        }
        moveCube();
    });

    /**
     * 初始化每一个小单元格
     * @param {*} i
     * @param {*} j
     */
    function initCube(i, j) {
        let item = document.createElement('div');

        item.className = 'item';
        item.setAttribute('data-index', order);
        item.draggable = 'true';
        item.addEventListener('dragstart', onDragStart);
        item.addEventListener('dragover', onDragOver);
        item.addEventListener('drop', onDrop);
        item.innerHTML = "<canvas class='' width='" + cellWidth + "' height='" + cellHeight + "'></canvas>";
        itemList[j][i] = item;

        let canvas = item.querySelector('canvas');
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, i * imageCellWidth, j * imageCellHeight, imageCellWidth, imageCellHeight, 0, 0, cellWidth, cellHeight);
        order++;
    }

    /**
     * 打乱单元格并绘制
     */
    function moveCube() {
        let randomChange = [-1, 1];
        const changeCount = 5;
        //横向逐行打乱
        for (let j = 0; j < yNumber; j++) {
            const maxIndex = xNumber - 1;
            for (let m = 0; m < changeCount; m++) {
                let sourceIndex = getRandomInt(xNumber);
                let targetIndex = getTargetIndex(sourceIndex, maxIndex);

                itemList[j][sourceIndex] = itemList[j].splice(targetIndex, 1, itemList[j][sourceIndex])[0];
            }
        }
        //纵向逐列打乱
        for (let i = 0; i < xNumber; i++) {
            const maxIndex = yNumber - 1;
            for (let m = 0; m < changeCount; m++) {
                let sourceIndex = getRandomInt(yNumber);
                let targetIndex = getTargetIndex(sourceIndex, maxIndex);

                itemList[sourceIndex][i] = itemList[targetIndex].splice(i, 1, itemList[sourceIndex][i])[0];
            }
        }
        for (let j = 0; j < itemList.length; j++) {
            for (let i = 0; i < itemList[j].length; i++) {
                itemList[j][i].setAttribute('data-x', i);
                itemList[j][i].setAttribute('data-y', j);
                container.appendChild(itemList[j][i]);
            }
        }

        function getTargetIndex(sourceIndex, maxIndex) {
            return sourceIndex === 0 ? 1 : sourceIndex === maxIndex ? maxIndex - 1 : sourceIndex + randomChange[getRandomInt(randomChange.length)];
        }
    }
}

/**
 * 获取本机图片并旋转角度
 * @returns
 */
function getRotateImage() {
    let image = new Image();
    image.src = 'mountain.jpg';
    let angles = [0, 90, 180, 270];
    let angle = angles[getRandomInt(angles.length)];
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

/**
 * 拖动开始
 */
function onDragStart(e) {
    // 获取当前拖拽元素
    dragElement = e.currentTarget;
}

/**
 * 停止拖动
 */
function onDragOver(e) {
    // 默认的当你dragover的时候会阻止你做drop的操作，所以需要取消这个默认
    if (!finished) {
        e.preventDefault();
    }
}

/**
 * 拖动结束
 */
function onDrop(e) {
    // 当拖动结束的时候，给拖动div所在的位置下面的div做drop事件
    let dropElement = e.currentTarget;
    if (dragElement != null && dragElement != dropElement) {
        exchangeElement(dragElement, dropElement);
        if (isFinish()) {
            showTip();
        }
    }
}

/**
 * 交换元素
 * @param {*} firstElement
 * @param {*} secondElement
 */
function exchangeElement(firstElement, secondElement) {
    if (Math.abs(secondElement.dataset.x - firstElement.dataset.x) + Math.abs(secondElement.dataset.y - firstElement.dataset.y) <= 1) {
        // 临时 div 用于存储 box
        let temp = document.createElement('div');
        let tempPosition = [secondElement.dataset.x, secondElement.dataset.y];
        // 交换
        container.replaceChild(temp, secondElement);
        container.replaceChild(secondElement, firstElement);
        container.replaceChild(firstElement, temp);
        secondElement.setAttribute('data-x', firstElement.dataset.x);
        secondElement.setAttribute('data-y', firstElement.dataset.y);
        firstElement.setAttribute('data-x', tempPosition[0]);
        firstElement.setAttribute('data-y', tempPosition[1]);
    }
}

/**
 * 获取一个随机整数
 * @param {最大值(不包含)} max
 * @returns
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * 显示提示框
 */
function showTip() {
    for (let i = 0; i < tipPage.length; i++) {
        tipPage[i].style.display = 'block';
    }
}

/**
 * 隐藏提示框
 */
function hidenTip() {
    for (let i = 0; i < tipPage.length; i++) {
        tipPage[i].style.display = 'none';
    }
}

/**
 * 判断是否结束
 * @returns
 */
function isFinish() {
    for (let i = 0; i < container.childNodes.length; i++) {
        if (container.childNodes[i].dataset.index != i) {
            return false;
        }
    }
    finished = true;
    return true;
}
