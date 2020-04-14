var canvasW = 1280;
var canvasH = 720;
var src = 'img/'
var canvas = document.getElementById('canvas')
canvas.width = canvasW
canvas.height = canvasH
var ctx = canvas.getContext('2d')
ctx.lineWidth = 40;
ctx.strokeStyle = '#000';
ctx.font = '160px SimHei';
ctx.fillStyle = '#000';

var PHASE_DOWNLOADING = 1; //图片下载阶段
var PHASE_READY = 2; //就绪阶段
var PHASE_STARTING = 3; //启动中阶段，过场动画
var PHASE_PLAY = 4; //游戏进行中阶段
var PHASE_PAUSE = 5; //游戏暂停阶段
var PHASE_GAMEOVER = 6; //游戏结束阶段
var cur_phase = PHASE_DOWNLOADING; //游戏当前阶段

var imgourPart = 'ourPart' //图片变量
var imgbg = 'bg'
var imgbullet = 'zidan'

var ourPartX = canvasW / 2
var ourPartY = canvasH - 70
var angel = 0
var txt = 3;
var txtWidth = ctx.measureText(txt).width;
var timer = null
var result = {}

var goldArr = []
var goldRun = [];
var intger = '000000';
var intgerArr = getInteger(0);
var bottomL = intgerArr.length * 80;
var drawBg = null //背景对象初始化
var bulletList = null //子弹列表初始化
var bullet = null //子弹列表初始化
var targetList = null //目标列表初始化
var ourPart = null //我方初始化
var loading = null //过场动画对象初始化
var mousedownfun = null // 鼠标点击方法
var countDown = null //倒计时
var keyupfun = null
var pig = null;
var arr = ['bg.jpg', 'pig.png', 'ourPart.png', 'zidan.png', 'gold.png', 'fish1.png', 'fish1_1.png', 'fish2.png',
	'fish2_1.png',
	'fish3.png', 'fish3_1.png', 'fish4.png', 'fish4_1.png', 'integer.png', 'bottom.jpg'
]
var fashArr = [{
		name: 'fish1',
		endPoy: 12,
		step: 0.1,
		w: 80,
		h: 80,
		intger: 2
	},
	{
		name: 'fish2',
		endPoy: 8,
		step: 0.1,
		w: 60,
		h: 64,
		intger: 3
	},
	{
		name: 'fish3',
		endPoy: 9,
		step: 0.1,
		w: 50,
		h: 56,
		intger: 1
	},
	/* {
		name: 'fish4',
		endPoy: 12,
		step: 0.1,
		w: 80,
		h: 80,
		intger: 1
	} */
]


function loadImg(arr) {
	result = {}
	var length = arr.length
	var num = 0
	for (var i = 0; i < length; i++) {
		var img = new Image();
		var key = arr[i].split('.')[0];
		result[key] = img;
		img.src = src + arr[i];
		img.onload = function() {
			num++
			if (num == length) {
				cur_phase = PHASE_READY;
				drawBg = new DrawBg(result[imgbg]); //创建对象就行了，后面放在引擎里执行
				loading = new Loading() //创建过场动画
				countDown = new CountDown() // 创建倒计时
				pig = new Pig()
				/* pig.arcX = result['pig'].width / 2;
				pig.arcY = (canvasH - result['pig'].height / 2);
				pig.curPoy = 0.5; */

				startEngine();
			}
		}
	}
}


//背景
function DrawBg(img) {
	this.draw = function() {
		ctx.drawImage(img, 0, 0, canvasW, canvasH)
	}

}

//加载中，过场动画
function Loading() {
	this.moveCount = 0;
	this.draw = function() {
		this.moveCount++
		if (this.moveCount % 10 == 0) {
			txt--
		}
		ctx.lineWidth = 40;
		ctx.strokeStyle = '#000';
		ctx.font = '160px SimHei';
		ctx.fillStyle = '#000';
		if (txt <= 0) {
			cur_phase = PHASE_PLAY;
			ourPart = new OurPart();
			bulletList = new BulletList();
			targetList = new TargetList();
		} else {
			ctx.fillText(txt, canvasW / 2 - txtWidth / 2, canvasH / 2 + 15);
		}

	}
}

//猪
function Pig() {
	this.img = result['pig']
	this.W = this.img.width
	this.H = this.img.height
	this.X = this.W / 2;
	this.Y = (canvasH - this.H / 2);
	this.curPoy = 0.5;

	this.draw = function() {
		ctx.drawImage(this.img, 0, Math.round(this.curPoy) * 90, 90, 90, 0, canvasH - 90, 90, 90);
	}
	this.move = function() {
		if (this.curPoy > 0.5) {
			this.curPoy -= 0.08;
		} else {
			this.curPoy = 0;
		}
	}

}

// 倒计时
function CountDown() {
	this.moveCount = 0
	this.num = 5
	this.draw = function() {
		fontfun(this.num)
	}
	this.move = function() {
		this.moveCount++
		if (this.moveCount % 60 == 0) { //1秒
			this.num--
			if (this.num == 0) { //结束了
				cur_phase = PHASE_GAMEOVER
				this.num = 5
			}
		}
	}
}

// 我方
function OurPart() {
	this.direction = 1; //旋转方向
	this.speed = 0.5; //旋转速度
	this.moveCount = 0; //draw()函数被调用的次数;

	this.draw = function() {
		ctx.save()
		ctx.translate(ourPartX, ourPartY + 32)
		ctx.rotate(angel)
		ctx.drawImage(result[imgourPart], 0, 0, 64, 64, -32, -32, 64, 64);
		ctx.restore()
	}

	this.move = function() {
		this.moveCount += this.speed * this.direction
		if (this.moveCount >= 90) {
			this.direction = -1
		}
		if (this.moveCount <= -90) {
			this.direction = 1
		}
		angel = this.moveCount * Math.PI / 180
	}

	// 监听鼠标移动
	/* canvas.addEventListener('mousemove', function(e) {
		var e = e || event
		var layerX = e.layerX;
		var layerY = e.layerY;
		angel = -(Math.atan2(layerX - x, layerY - y) + 180 * Math.PI / 180);

		ctx.save()
		ctx.translate(x, y + 32)
		ctx.rotate(angel)
		ctx.drawImage(result[imgourPart], 0, 0, 64, 64, -32, -32, 64, 64);
		ctx.restore()
	}, false); */

	//监听鼠标点击事件
	mousedownfun = function(e) {
		var e = e || event
		// 添加子弹
		if (cur_phase == PHASE_PLAY) {
			bullet = new Bullet()
			bullet.startX = e.layerX //用鼠标位置的话，有用，放不放都无所谓了
			bullet.startY = e.layerY
			bulletList.add(bullet);
		}
	}
	if (mousedownfun) {
		// 只添加一次方法
		canvas.addEventListener('mousedown', mousedownfun, false);
	}
}

// 子弹
function Bullet() {
	this.removable = false; //删除吗
	this.x = ourPartX
	this.y = ourPartY
	this.w = 30
	this.h = 46
	this.startX = 0
	this.startY = 0
	this.iRatio = 0
	this.hudu = angel
	this.curPoy = 1
	var img = result[imgbullet]

	this.draw = function() {
		var theY = Math.floor(24 - Math.cos(this.hudu) * 24 - 10);
		var theX = Math.ceil(Math.sin(this.hudu) * 24);
		var arcX = this.x + theX;
		var arcY = this.y + theY;
		this.iRatio = (this.startX - arcX) / (this.startY - arcY);

		ctx.save();
		ctx.translate(arcX, arcY); //设置原点
		ctx.rotate(this.hudu);
		ctx.drawImage(img, 0, parseInt(this.curPoy) * 48, 30, 48, theX - 15, theY - 24, 30, 48);
		ctx.restore();
	}

	this.move = function() {
		this.y -= 6;
		// this.x -= 6 * this.iRatio.toFixed(2);//不用算比例了
		this.x -= -6 * this.hudu.toFixed(2);
		this.curPoy += 0.3;
		if (this.curPoy > 3) {
			this.curPoy = 0;
		}
		if (this.x <= 0 || this.x >= canvasW || this.y <= 0 || this.y >= canvasH) {
			this.removable = true;
		}
	}
}

//子弹列表
function BulletList() {
	this.list = []; //保存当前需要绘制的所有子弹
	this.add = function(bullet) { //添加子弹
		this.list.push(bullet);
	}
	this.draw = function() {
		for (var i = 0; i < this.list.length; i++) {
			this.list[i].draw();
		}
	}
	this.move = function() {
		for (var i = 0; i < this.list.length; i++) {
			this.list[i].move();
			if (this.list[i].removable) {
				this.list.splice(i, 1);
				i--; //注意
			}
		}
	}
}

// 目标
function Target() {
	this.x = 0
	this.y = 0
	this.w = 0
	this.h = 0
	this.type = 1
	this.hudu = 0
	this.name = ''
	this.curPoy = 0
	this.step = 0
	this.endPoy = 0
	this.speedX = 0
	this.speedY = 0
	this.crashed = false;
	this.removable = false; //可以删除吗

	this.draw = function() {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.hudu);
		ctx.drawImage(result[this.name], 0, parseInt(this.curPoy) * this.h, this.w, this.h,
			this.speedX, this.speedY, this.w, this.h);
		ctx.restore();
	}

	this.move = function() {
		this.speedX = 2;
		if (this.type == 1) {
			this.speedX = -2;
		}
		this.speedY = parseFloat(this.speedX * Math.tan(this.hudu));
		this.x += this.speedX;
		this.y += this.speedY;
		this.curPoy += this.step;
		if (this.curPoy > this.endPoy) {
			this.curPoy = 0;
		}
		if (this.type == 0 && this.x > canvasW || this.x < -this.w || this.crashed) {
			this.removable = true;
		}
	}
}

// 目标列表
function TargetList() {
	this.list = []; //所有的
	this.moveCount = 0;
	this.add = function(target) {
		this.list.push(target);
	}
	this.draw = function() {
		for (var i = 0; i < this.list.length; i++) {
			this.list[i].draw();
		}
	}
	this.move = function() {
		/*****添加鱼*********/
		this.moveCount++
		if (this.moveCount % 70 == 0) {
			var rand = Math.round(Math.random() * (fashArr.length - 1));
			var iType = Math.round(Math.random() * 1);
			var target = new Target()
			target.x = -fashArr[rand].w,
				target.y = canvasH / 2 - 150,
				target.hudu = (Math.PI / 180) * (parseInt(Math.random() * 60 - 20)),
				target.curPoy = 0,
				target.step = fashArr[rand].step,
				target.endPoy = fashArr[rand].endPoy,
				target.name = fashArr[rand].name,
				target.w = fashArr[rand].w,
				target.h = fashArr[rand].h,
				target.intger = fashArr[rand].intger,
				target.type = 0
			if (iType === 1) {
				target.type = 1;
				target.x = canvasW + target.w;
				target.name = target.name + '_1';
			}
			this.add(target);
		}
		/**********炮弹与鱼碰撞****************/
		for (var i = 0; i < this.list.length; i++) {
			var enemy = this.list[i];
			for (var j = 0; j < bulletList.list.length; j++) {
				var bullet = bulletList.list[j];
				if (collideTest(enemy.x, enemy.y, enemy.w, enemy.h, bullet.x, bullet.y, bullet.w, bullet.h)) {
					var goldTmp = {
						x: enemy.x,
						y: enemy.y,
						curPoy: 0,
					};
					intgerArr = getInteger(enemy.intger); //设置积分
					goldArr.push(goldTmp);
					bullet.removable = true; //子弹消失
					enemy.crashed = true;
				}
			}
		}

		//金币
		for (i = 0; i < goldArr.length; i++) {
			ctx.drawImage(result['gold'], 0, parseInt(goldArr[i].curPoy) * 51, 49, 51, goldArr[i].x, goldArr[i].y, 49, 51);
			if (goldArr[i].curPoy >= 5) {
				goldRun.push({
					curX: goldArr[i].x,
					curY: goldArr[i].y,
				});
				goldArr.splice(i, 1);
			} else {
				goldArr[i].curPoy += 0.5;
			}
		}

		//猪
		pig.draw()
		pig.move()

		//金币运动
		for (i = 0; i < goldRun.length; i++) {
			ctx.drawImage(result['gold'], 0, 0, 49, 51, goldRun[i].curX, goldRun[i].curY, 49, 51);
			var speedX = parseInt((pig.X - goldRun[i].curX) * 0.2);
			var speedY = parseInt((pig.Y - 20 - goldRun[i].curY) * 0.2);
			goldRun[i].curX += speedX;
			goldRun[i].curY += speedY;
			if (speedX == 0) {
				goldRun.splice(i, 1);
				i--;
				pig.curPoy = 1;
			}

		}
		//积分运动
		for (i = 0; i < intgerArr.length; i++) {
			ctx.drawImage(result['integer'], 0, intgerArr[i].old, result['integer'].width, result['integer'].height / 10,
				bottomL + (i * result['integer'].width), 5, result['integer'].width, result['integer'].height / 10);
			var intSpeed = (intgerArr[i].number - intgerArr[i].old) / 8;
			intSpeed = intSpeed > 0 ? Math.ceil(intSpeed) : Math.floor(intSpeed);
			intgerArr[i].old += intSpeed;
		}
		/**********移动敌机****************/
		for (var i = 0; i < this.list.length; i++) {
			var e = this.list[i];
			e.move();
			if (e.removable) { //删除敌机
				this.list.splice(i, 1);
				i--;
			}
		}

	}
}

function getInteger(num) {
	var intgerArr = [];
	for (var i = 0; i < String(intger).length; i++) {
		intgerArr.push({
			old: Number(String(intger)[i]) * 53,
			curPoy: 0,
		});
	}
	/* intger = parseFloat(intger) + num;
	//补齐前面的0，还有一种方式是乘一万然后加个空字符串，在截取后面的数字
	for (i = String(intger).length; i < 6; i++) {
		intger = '0' + intger;
	} */
	intger = (parseFloat(intger) + num + 1000000 + '').slice(1)
	for (i = 0; i < intgerArr.length; i++) {
		//现在的位置
		intgerArr[i].number = Number(String(intger)[i]) * 53;
	}
	return intgerArr;
}

//碰撞检测
function collideTest(x1, y1, w1, h1, x2, y2, w2, h2) {
	var r1 = x1 + w1;
	var b1 = y1 + h1;

	var r2 = x2 + w2;
	var b2 = y2 + h2;

	if (x1 > r2 || r1 < x2 || b1 < y2 || y1 > b2) {
		return false;
	} else {
		return true;
	}

}

// 字体
function fontfun(t) {
	ctx.lineWidth = 40;
	ctx.strokeStyle = '#aaa';
	ctx.font = '60px SimHei';
	ctx.fillStyle = '#000';
	var w = ctx.measureText(t).width;
	ctx.fillText(t, canvasW / 2 - w / 2, canvasH / 2 + 15);
}


//游戏引擎
function startEngine() {
	timer = setInterval(function() {
		// ctx.clearRect(0,0,canvasW,canvasH);
		drawBg.draw() //一直画背景，相当于清除画布
		switch (cur_phase) {
			case PHASE_READY: //准备状态
				console.log('准备中');
				fontfun('点击屏幕开始游戏')
				break;
			case PHASE_STARTING: //启动中，过场动画
				loading.draw()
				break;
			case PHASE_PLAY: //游戏中
				// countDown.draw()
				// countDown.move()
				ourPart.draw();
				ourPart.move();
				bulletList.draw();
				bulletList.move();
				targetList.draw();
				targetList.move();
				break;
			case PHASE_PAUSE: //游戏暂停
				fontfun('已暂停')
				ourPart.draw();
				bulletList.draw();
				targetList.draw();
				break;
			case PHASE_GAMEOVER: //游戏结束
				fontfun('游戏结束,点击屏幕继续开始')
				clearInterval(timer)
				timer = null
				break;
		}
	}, 1000 / 60)
}



// 点击事件
canvas.addEventListener('click', function() {
	switch (cur_phase) {
		case PHASE_READY: //准备状态，点击开始
			cur_phase = PHASE_STARTING;
			break;
		case PHASE_GAMEOVER: //结束状态，点击重新开始
			txt = 3
			cur_phase = PHASE_STARTING;
			startEngine();
			break;
		default:
			break;
	}
	/* if(!timer){
		loading = new Loading()
	} */
}, false);

keyupfun = function(e) {
	var e = e || event
	var code = e.keyCode
	switch (code) {
		case 13: //enter 发射
			if (cur_phase == PHASE_PLAY) {
				bullet = new Bullet()
				bulletList.add(bullet);
			}
			break;
		case 8: //backspace 暂停
			if (cur_phase == PHASE_PAUSE) {
				cur_phase = PHASE_PLAY
			} else {
				cur_phase = PHASE_PAUSE
			}
			break;
		case 27: //esc 结束游戏
			cur_phase = PHASE_GAMEOVER
			break;
		default:
			break;
	}
	console.log(e.keyCode);
}
if (keyupfun) {
	document.body.addEventListener('keyup', keyupfun, false);
}

window.onload = loadImg(arr)
