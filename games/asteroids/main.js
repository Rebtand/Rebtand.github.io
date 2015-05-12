//REMEMBER:
//this uses wasd for the controls.
var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");


//define game state values
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;

//key inputs
window.addEventListener('keydown',function(evt){onKeyDown(evt);},false);
window.addEventListener('keyup',function(evt){onKeyUp(evt);},false);

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	if (deltaTime > 1)
	{
		deltaTime = 1;
	}
	return deltaTime;
}

var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;
var spawnTimer = 0;
var shootTimer = 0;
var ASTEROID_SPEED = 4;
var PLAYER_SPEED = 5;
var PLAYER_TURN_SPEED = 0.06;
var BULLET_SPEED = 7.5;
var score = 0;
var hscore1 = 0;
var hscore2 = 0;
var hscore3 = 0;
var hscore4 = 0;
var hscore5 = 0;
var hscoretxt = {}


//objects

	//splash screen image
var splashImg = document.createElement("img");
splashImg.src = "assets/splash.png";
	//game over image
var deadImg = document.createElement("img");
deadImg.src = "assets/gameover.png";
	//background sprite
var grass = document.createElement("img");
grass.src = "assets/grass.png";
	//create background
var background = [];

for(var y=0;y<30;y++)
{
	background[y] = [];
	for(var x=0; x<60; x++)
		background[y][x] = grass;
}
	//player and its properties
var player = {
	image: document.createElement("img"),
	x: SCREEN_WIDTH/2,
	y: SCREEN_HEIGHT/2,
	width: 93,
	height: 80,
	directionX: 0,
	directionY: 0,
	angularDirection: 0,
	rotation: 0,
	isDead: false
};
	//set the image for the player to use
player.image.src = "assets/ship.png";

	//create asteroid array
var asteroids = [];
function rand(floor, ceil)
{
	return Math.floor((Math.random()*(ceil-floor))+floor);
}
//spawn asteroid in array
function spawnAsteroid()
{
	//choose which asteroid size
	var type = rand(0,3);
	
	//create asteroid
	var asteroid = {
		image: document.createElement("img"),
		width: 69,
		height: 75,
	};
	asteroid.image.src = "assets/rock_large.png";
	//set asteroid at centre or screen then move in direction
	var x = SCREEN_WIDTH/2;
	var y = SCREEN_WIDTH/2;
	
	var dirX = rand(-10,10);
	var dirY = rand(-10,10);
	//normalise direction
	var magnitude = (dirX * dirX) + (dirY * dirY);
	if(magnitude !== 0)
	{
		var oneOverMag = 1 / Math.sqrt(magnitude);
		dirX *= oneOverMag;
		dirY *= oneOverMag;
	}
	//multiply directions by screen width to move away from centre of screen
	var movX = dirX * SCREEN_WIDTH;
	var movY = dirY * SCREEN_HEIGHT;
	
	//add diretion to og position to set starting position
	asteroid.x = x + movX;
	asteroid.y = y + movY;
	
	//set asteroid velocity
	asteroid.velocityX = -dirX * ASTEROID_SPEED;
	asteroid.velocityY = -dirY * ASTEROID_SPEED;
	
	//add asteroid to the asteroids array
	asteroids.push(asteroid);
}
	//create all bullets
var bullets = [];

function playerShoot()
{
	var bullet = {
		image: document.createElement("img"),
		x: player.x,
		y: player.y,
		width: 5,
		height: 5,
		velocityX: 0,
		velocityY: 0
	};
	bullet.image.src = "assets/bullet.png";
	
	//start with a velocity that shoots the bullet up
	var velX = 0;
	var velY = 1;
	
	//rotate vector according to the ship's rotation
	var s = Math.sin(player.rotation);
	var c = Math.cos(player.rotation);
	
	var xVel = (velX * c) - (velY * s);
	var yVel = (velX * s) + (velY * c);
	
	bullet.velocityX = xVel * BULLET_SPEED;
	bullet.velocityY = yVel * BULLET_SPEED;
	
	//add bullet to bullets array
	bullets.push(bullet);
}
//key mappings (uses wasd)
var KEY_SPACE = 32;
var KEY_LEFT = 65;
var KEY_UP = 87;
var KEY_RIGHT = 68;
var KEY_DOWN = 83;

function onKeyDown(event)
{
	if(event.keyCode==KEY_UP)
	{
		player.directionY = 1;
	}
	if(event.keyCode==KEY_DOWN)
	{
		player.directionY = -1;
	}
	
	if(event.keyCode==KEY_LEFT)
	{
		player.angularDirection = -1;
	}
	if(event.keyCode==KEY_RIGHT)
	{
		player.angularDirection = 1;
	}
	
	if(event.keyCode == KEY_SPACE && shootTimer <= 0 && player.isDead === false)
	{
		shootTimer += 0.3;
		playerShoot();
	}
	if(event.keyCode == KEY_SPACE && gameState == STATE_SPLASH)
	{
		spawnAsteroid();
		spawnAsteroid();
		spawnAsteroid();
		spawnAsteroid();
		spawnAsteroid();
		spawnAsteroid();
		spawnAsteroid();
		gameState = STATE_GAME;
		return;
	}
	if(event.keyCode == KEY_SPACE && gameState == STATE_GAMEOVER)
	{
		asteroids.length = 0;
		bullets.length = 0;
		player.rotation = 0;
		score = 0;
		player.x = SCREEN_WIDTH/2;
		player.y = SCREEN_HEIGHT/2;
		player.isDead = false;
		gameState = STATE_SPLASH;
		return;

	}
}
function onKeyUp(event)
{
	if(event.keyCode==KEY_UP)
	{
		player.directionY = 0;
	}
	if(event.keyCode==KEY_DOWN)
	{
		player.directionY = 0;
	}
	
	if(event.keyCode==KEY_LEFT)
	{
		player.angularDirection = 0;
	}
	if(event.keyCode==KEY_RIGHT)
	{
		player.angularDirection = 0;
	}
}

//tests if two rectangles are intersecting
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if(y2 + h2 < y1 ||
	x2 + w2 < x1 ||
	x2 > x1 + w1 ||
	y2 > y1 + h1)
	{
		return false;
	}
	return true;
}

function runSplash(deltaTime)
{
	context.drawImage(splashImg, 0, 0);
}
function runGame(deltaTime)
{
	
		//draw tiled bg
	for(var y=0; y<1; y++)
	{
		for(var x=0; x<1; x++)
		{
			context.drawImage(background[y][x], x*1900, y*900);
		}
	}
		//update shoot timer
	if(shootTimer > 0)
		shootTimer -= deltaTime;
	
	for (var i=0; i<bullets.length; i++)
	{
		bullets[i].x += bullets[i].velocityX;
		bullets[i].y += bullets [i].velocityY;
	}
	
	for(var i=0; i<bullets.length; i++)
	{
		if(bullets[i].x < -bullets[i].width ||
			bullets[i].x > SCREEN_WIDTH ||
			bullets[i].y < -bullets[i].height ||
			bullets[i].y > SCREEN_HEIGHT)
		{
			bullets.splice(i, 1);
			break;
		}
	}
	
	for(var i=0; i<bullets.length; i++)
	{
		context.drawImage(bullets[i].image,
			bullets[i].x - bullets[i].width/2,
			bullets[i].y - bullets[i].height/2);
	}
	//calc sin and cos for player
	var s = Math.sin(player.rotation);
	var c = Math.cos(player.rotation);
	
		//player velocity
	var xDir = (player.directionX * c) - (player.directionY * s);
	var yDir = (player.directionX * s) + (player.directionY * c);
	var xVel = xDir * PLAYER_SPEED;
	var yVel = yDir * PLAYER_SPEED;
	
	player.x += xVel;
	player.y += yVel;
	
	player.rotation += player.angularDirection * PLAYER_TURN_SPEED;
	
	context.save();
		if(player.isDead === false)
		{
			context.translate(player.x,player.y);
			context.rotate(player.rotation);
			context.drawImage(
			player.image, -player.width/2, -player.height/2);
		}
		if(player.x > SCREEN_WIDTH + 40 || player.y > SCREEN_HEIGHT + 40 ||
		   player.x < -40 || player.y < -40)
		{
			player.x = SCREEN_WIDTH - player.x;
			player.y = SCREEN_HEIGHT - player.y;
		}
	context.restore();
	
	//update all asteroids in array
	for(var i=0; i<asteroids.length; i++)
	{
		//update asteroids position according to its velocity
		asteroids[i].x = asteroids[i].x + asteroids[i].velocityX;
		asteroids[i].y = asteroids[i].y + asteroids[i].velocityY;
		
		if(asteroids[i].x > SCREEN_WIDTH + 40 || 
           asteroids[i].y > SCREEN_HEIGHT + 40 ||
           asteroids[i].x < -40 || 
           asteroids[i].y < -40)
		{
			asteroids[i].x = SCREEN_WIDTH - asteroids[i].x;
			asteroids[i].y = SCREEN_HEIGHT - asteroids[i].y;
		}
	}
	//draw all asteroids
	if(player.isDead === false)
	{
		for(var i=0; i<asteroids.length; i++)
			{
				context.drawImage(asteroids[i].image, asteroids[i].x, asteroids[i].y);
				
			}
	}
	spawnTimer -= deltaTime;
	if(spawnTimer <= 0)
	{
		spawnTimer = 0.3;
		spawnAsteroid();
	}
	
	//bullet and asteroid intersect
	for(var i=0; i<asteroids.length; i++)
	{
		for(var j=0; j<bullets.length; j++)
		{
			if(intersects(
				bullets[j].x, bullets[j].y,
				bullets[j].width, bullets[j].height,
				asteroids[i].x, asteroids[i].y,
				asteroids[i].width, asteroids[i].height) === true)
			{
				asteroids.splice(i, 1);
				bullets.splice(j, 1);
				score +=100;
				break;
			}
		}
	}
	//ship and asteroid intersect
	for(var i=0; i<asteroids.length; i++)
	{
		if (player.isDead == false)
		{
			if(intersects(
				player.x, player.y,
				player.width, player.height,
				asteroids[i].x, asteroids[i].y,
				asteroids[i].width, asteroids[i].height) == true)
			{
				asteroids.splice(i, 1);
				player.isDead = true;
			}
		}
	}
	if(player.isDead == true)
	{
		gameState = STATE_GAMEOVER;
		return;
	}
	context.fillStyle = "#354696";
	context.fillRect(0,0, 290, 75);
	context.fillStyle = "#1F2A5A";
	context.font="50px Imagine Font";
	context.fillText(score, 15, 55);
	context.fillStyle = "#FFFFFF";
	context.font="50px Imagine Font";
	context.fillText(score, 20, 50);
	
}
function runGameOver(deltaTime)
{
	context.drawImage(deadImg, 0, 0);
	if(score > localStorage.getItem("hscore1"))
	{
		localStorage.setItem("hscore3", localStorage.getItem("hscore2"));
		localStorage.setItem("hscore2", localStorage.getItem("hscore1"));
		localStorage.setItem("hscore1", score);
	}
	if(score > localStorage.getItem("hscore2") && score < localStorage.getItem("hscore1"))
	{
		localStorage.setItem("hscore3", localStorage.getItem("hscore2"));
		localStorage.setItem("hscore2", score);
	}
	if(score > localStorage.getItem("hscore3") && score < localStorage.getItem("hscore2") && 
	score < localStorage.getItem("hscore1"))
	{
		localStorage.setItem("hscore3", score);
	}
	hscoretxt.s1 = ' 1 - ' + localStorage.getItem("hscore1");
	hscoretxt.s2 = '2 - ' + localStorage.getItem("hscore2");
	hscoretxt.s3 = '3 - ' + localStorage.getItem("hscore3");


	context.font ="60px DS-Digital";
	context.fillStyle = "#FFFFFF";
	context.fillText(hscoretxt.s1, 560, 300);
	context.fillText(hscoretxt.s2, 560, 355);
	context.fillText(hscoretxt.s3, 560, 410);

}
function run()
{		
	context.fillStyle = "#ccc";
	context.fillRect(0,0,canvas.width,canvas.height);
	
	var deltaTime = getDeltaTime();
	
	switch(gameState)
	{
		case STATE_SPLASH:
			runSplash(deltaTime);
			break;
		case STATE_GAME:
			runGame(deltaTime);
			break;
		case STATE_GAMEOVER:
			runGameOver(deltaTime);
			break;
		
	}
}
	

//60FPS framework
(function() 
{
var onEachFrame;

if (window.requestAnimationFrame) 
{
  onEachFrame = function(cb) 
  {
   var _cb = function() { cb(); window.requestAnimationFrame(_cb); };
   _cb();
  };
  
} 
else if (window.mozRequestAnimationFrame) 
	{
	onEachFrame = function(cb) {
		var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); };
		_cb();
	};
	
} 
else 
{
	onEachFrame = function(cb) 
	{
		setInterval(cb, 1000 / 60);
	};
}

	window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);	

