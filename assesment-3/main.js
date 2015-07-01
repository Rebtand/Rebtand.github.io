var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");
window.addEventListener('keydown', function(evt) { onKeyDown(evt); }, false);
window.addEventListener('keyup', function(evt) { onKeyUp(evt); }, false);
getDeltaTime()

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

function getDeltaTime() 
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	if (deltaTime > 1) 
	{
		DeltaTime = 1;
	}
	return deltaTime;
	}

var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var gameState = STATE_SPLASH;
var grass = document.createElement("img");
grass.src = "assets/Level1_BG_1.jpg";

var splash = document.createElement("img");
splash.src = "assets/Splash_screen.png"

var over = document.createElement("img");
over.src = "assets/Splash_LOSE.png"

var starImage = document.createElement("img");
starImage.src = "star_ice.png"

var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

  

var startbg = [];
var background = [];
var overbg = [];

for(var y =0;y<15;y++)
{
	background[y] = [];
	for(var x =0; x<20; x++)
		background[y][x] = grass;
}

for(var y =0;y<15;y++)
{
	startbg[y] = [];
	for(var x =0; x<20; x++)
		startbg[y][x] = splash;
}	
for(var y =0;y<15;y++)
{
	overbg[y] = [];
	for(var x =0; x<20; x++)
		overbg[y][x] = over;
}

var KEY_SPACE = 32;
var KEY_LEFT =37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_A = 65;
var KEY_S = 83;
var KEY_W = 87;
var KEY_D = 68;
var KEY_Q = 81;
var KEY_E = 69;
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;
var shoot = false
var ASTEROID_SPEED = 0.6;
var CYBER_SPEED = 0.4;
var WEEPOPEN_SPEED = 1.3;
var PLAYER_SPEED = 2;
var PLAYER_TURN_SPEED = 0.04;
var BULLET_SPEED = 2.5;
var HUD = document.createElement("img");
var score = 0;
var starGen = [];
var lives = 03;
var Health_Lives = document.createElement("img");
var keyboard = new Keyboard();

var player = {
	image: document.createElement("img"),
	x: SCREEN_WIDTH/2,
	y: SCREEN_HEIGHT/2,
	width: 34,
	height: 45,
	directionX: 0,
	directionY: 0,
	angularDirection: 0,
	rotation: 0,
	isDead: false
	
};
player.image.src = "assets/player.png";

var asteroids = [];

var bullets = [];

function rand(floor, ceil)
{
	return Math.floor( (Math.random()* (ceil-floor)) +floor );
}
var splashTimer = 3;

function runSplash(deltaTime)
{

	if(keyboard.isKeyDown(keyboard.KEY_ENTER) == true) {
		gameState = STATE_GAME;
		return;
	}
	
	

	
		for(var y=0; y<15; y++)
	{
		for(var x=0; x<20; x++)
		{
			context.drawImage(startbg[y][x], x*1366, y*768);
			
			
	
		}
	}
	
}
function initialize(){
for (var i = 0; i < 50; i++)
   {
	   
	   var star = new StarGen();   
	   starGen.push(star);
	   starGen[i].SetGenerator(canvas.width, canvas.height, starImage);
	   
   }
   musicBackground = new Howl(
    {
        urls: ["assets/Game_Music.ogg"],
        loop: true,
        buffer: true,
        volume:0.2,
        onend: function() {
            musicBackground.play()
        }
    });
    
    musicTitle = new Howl(
    {
        urls: ["assets/TitleScreen_Music.ogg"],
        loop: true,
        buffer: true,
        volume: 0.2
    });
    
    musicGameOver = new Howl(
    {
        urls: ["assets/GameOver_Music.mp3"],
        loop: false,
        volume: 1.0,
        buffer: true,
    });
    
    musicWin = new Howl (
    {
        urls: ["assets/YouWin_Music.mp3"],
        loop: false,
        volume: 1,
        buffer: true,
    })
    if(gameState == STATE_SPLASH)
    {
        musicBackground.stop();
        musicTitle.play();
    }
    if(gameState == STATE_GAME)
    {
        musicTitle.stop();
        musicBackground.play();
    }  
    
    sfxFire = new Howl(
    {
        urls: ["assets/Shoot.mp3"],
        buffer: true,
        volume: 1,
        onend: function() {
            isSfxPlaying = false;
        }
    });
}

function respawn()
{
    if(player.isDead == true && lives > 1)
    {
        asteroids.length = 0;
		bullets.length = 0;
		player.rotation = 0;
		score -= 1000;
        if(score < 0)
        {
            score = 0;
        }
		player.x = SCREEN_WIDTH/2;
		player.y = SCREEN_HEIGHT/2;
        lives -= 1;
		player.isDead = false;
    }

}


function runGame(deltaTime){
for (var i = 0; i < 50; i++)
{
	starGen[i].RunGenerator();
}


{
		for(var y=0; y<15; y++)
	{
		for(var x=0; x<20; x++)
		{
			
			context.fillStyle = "#FFD700";
			context.font = "24px Arial";
			HUD.src = "assets/HUD.png";
			context.drawImage(HUD, 0, 0);
			context.fillStyle = "yellow";
			context.font = "Bold " + "20px Arial";
			context.textAlign = "end";
			context.fillText(score, 900 , 670);
	if(score <= 0)
    {
        score = 0;
    }
		}
	}
	
	fpsTime += deltaTime;
    fpsCount++;
    if(fpsTime >= 1)
    {
        fpsTime -= 1;
        fps = fpsCount;
        fpsCount = 0;
    }  

    // draw the FPS
    context.fillStyle = "yellow";
    context.font="14px Arial";
    context.fillText("FPS: " + fps, 60, 30, 100);	
	
	
	if(shootTimer > 0)
		shootTimer -= deltaTime;
	
	for(var i=0; i<bullets.length; i++)
	{
		bullets[i].x += bullets[i].velocityX;
		bullets[i].y += bullets[i].velocityY;
	}
	
	for(var i=0; i<bullets.length; i++)
	{
		if(bullets[i].x < -bullets[i].width ||
				bullets[i].x > SCREEN_WIDTH ||
				bullets[i].y < -bullets[i].height ||
				bullets[i].y > SCREEN_HEIGHT)
				{
					bullets.splice(i, 1);
					hit = true;
					score += 100
					break;
				}
			
	}
	
	for(var i=0; i<bullets.length; i++)
	{
		context.drawImage(bullets[i].image,
		bullets[i].x - bullets[i].width/2,
		bullets[i].y - bullets[i].height/2);
	}
	
	
	for(var i=0; i<asteroids.length; i++)	
	{
		
		asteroids[i].x = asteroids[i].x + asteroids[i].velocityX;
		asteroids[i].y = asteroids[i].y + asteroids[i].velocityY;
		
	}
	
	for(var i=0; i<asteroids.length; i++)
	{
		context.drawImage(asteroids[i].image, asteroids[i].x, asteroids[i].y);
	}
	
	    context.textAlign = "start";
    Health_Lives.src = "assets/lives.png";
      if(lives < 10)
        context.fillText(" x 0" + lives, 60, 670);
    else if(lives >= 10)
        context.fillText(" x " + lives, 60, 670);
    if(lives > 99)
        lives = 99;
	
    //when lives < 0, game over
    if(lives < 0)
    {
        win = false;
        gameOver();
    }
	spawnTimer -= deltaTime;
	if(spawnTimer <= 0)
	{  
		spawnTimer = 2;
		spawnAsteroid();
		spawnCyber();
		spawnWeepopen();
	}	

		
	var s = Math.sin(player.rotation);
	var c = Math.cos(player.rotation);
	
	var xDir = (player.directionX * c) + (player.directionY * s);
	var yDir = (player.directionX * s) - (player.directionY * c);
	var xVel = xDir * PLAYER_SPEED;
	var yVel = yDir * PLAYER_SPEED;
	
	player.x += xVel;
	player.y += yVel;
	
	player.rotation += player.angularDirection * PLAYER_TURN_SPEED;

	for(var i=0; i<asteroids.length; i++)
	{
		var hit = intersects(
			player.x, player.y,
			player.width, player.height,
			asteroids[i].x, asteroids[i].y,
			asteroids[i].width, asteroids[i].height);
	
		if(hit == true)
		{
			player.isDead = true;
            respawn();
		}
		if(player.isDead == true && lives < 1)
		{gameState = STATE_GAMEOVER;
		return;}
		
       }

		
	context.save();
	
	if(player.isDead == false)
		
		{
		context.translate(player.x, player.y);
		context.rotate(player.rotation);
		context.drawImage(
		      player.image, -player.width/2, -player.height/2);
	context.restore();
		}
		
			
		
		
		
		
	
	for(var i=0; i<asteroids.length; i++)
	{
		for(var j=0; j<bullets.length; j++)
		{
			if(intersects(
					bullets[j].x, bullets[j].y,
					bullets[j].width, bullets[j].height,
					asteroids[i].x, asteroids[i].y,
					asteroids[i].width, asteroids[i].height) == true)
					{
						asteroids.splice(i, 1);
						bullets.splice(j, 1);
						break;
					}
		}
	}	
	
	

		
	

}
}
function runGameOver (deltaTime)
{
	
		for(var y=0; y<15; y++)
	{
		for(var x=0; x<20; x++)
		{
			context.drawImage(overbg[y][x], x*1366, y*768);
			
			
		}
	}
	
}

function spawnAsteroid()
{
	var type = rand(0, 3);
	
	var asteroid = {};
	
	asteroid.image = document.createElement("img");
	asteroid.image.src = "assets/Enemy1.png";
	asteroid.width = 82;
	asteroid.height = 80;
	
	var x = SCREEN_WIDTH/2;
	var y = SCREEN_HEIGHT/2;
	
	var dirX = rand(-10,10);
	var dirY = rand(-10,10);
	
	var magnitude = (dirX * dirX) + (dirY * dirY);
	if(magnitude !=0)
	{
		var oneOverMag = 1 / Math.sqrt(magnitude);
		dirX *= oneOverMag;
		dirY *= oneOverMag;
	}
	
	var movX = dirX * SCREEN_WIDTH;
	var movY = dirY * SCREEN_HEIGHT;
	
	asteroid.x = x + movX;
	asteroid.y = y + movY;
	
	asteroid.velocityX = -dirX * ASTEROID_SPEED;
	asteroid.velocityY = -dirY * ASTEROID_SPEED;
	
	asteroids.push(asteroid);
	
}

function spawnCyber()
{
	var type =  rand(0, 2);
	
	var cyber = {};
	
	cyber.image = document.createElement("img");
	cyber.image.src = "assets/Enemy2.png";
	cyber.width = 100;
	cyber.height = 100;
	
	var x = SCREEN_WIDTH/2;
	var y = SCREEN_HEIGHT/2;
	
	var dirX = rand(-10,10);
	var dirY = rand(-10,10);
	
	var magnitude = (dirX * dirX) + (dirY * dirY);
	if(magnitude !=0)
	{
		var oneOverMag = 1 / Math.sqrt(magnitude);
		dirX *= oneOverMag;
		dirY *= oneOverMag;
	}

	var movX = dirX * SCREEN_WIDTH;
	var movY = dirY * SCREEN_HEIGHT;
	
	cyber.x = x + movX;
	cyber.y = y + movY;
	
	cyber.velocityX = -dirX * CYBER_SPEED;
	cyber.velocityY = -dirY * CYBER_SPEED;
	
	asteroids.push(cyber);
}

function spawnWeepopen()
{
	var type = rand(0, 1);

	var weepopen = {};
	
	weepopen.image = document.createElement("img");
	weepopen.image.src = "assets/Enemy3.png";
	weepopen.width = 92;
	weepopen.height = 120;
	
	var x = SCREEN_WIDTH/2;
	var y = SCREEN_HEIGHT/2
	
	var dirX = rand (-10, 10);
	var dirY = rand (-10, 10);
	
	var magnitude = (dirX * dirX) + (dirY * dirY);
	if (magnitude !=0)
	{
		var oneOverMag = 1 / Math.sqrt(magnitude);
		dirX *= oneOverMag;
		dirY *= oneOverMag;
	}
	
	var movX = dirX * SCREEN_WIDTH;
	var movY = dirY * SCREEN_HEIGHT;
	
	weepopen.x = x + movX;
	weepopen.y = y + movY;
	
	weepopen.velocityX = -dirX * WEEPOPEN_SPEED;
	weepopen.velocityY = -dirY * WEEPOPEN_SPEED;
	
	asteroids.push(weepopen);
}
	




function playerShoot()
{
	var bullet = {
		image:document.createElement("img"),
		x: player.x,
		y: player.y,
		width: 38,
		height: 19,
		velocityX: 0,
		velocityY: 0
		
		
	};
	
	bullet.image.src = "assets/laser.png";
	
	var velX = 0;
	var velY = 1;
	
	
	var s = Math.sin(player.rotation);
	var c = Math.cos(player.rotation);
	
	var xVel = (velX * c) + (velY * s);
	var yVel = (velX * s) -  (velY * c);
	
	bullet.velocityX = xVel * BULLET_SPEED;
	bullet.velocityY = yVel * BULLET_SPEED;
	
	bullets.push(bullet);
	
}
var spawnTimer =0;
var shootTimer = 0;
function onKeyDown(event)
{
	if(event.keyCode == KEY_UP)
	{
		player.directionY = 1;
	}
	if(event.keyCode == KEY_DOWN)
	{
		player.directionY = -1;
	}
	if(event.keyCode == KEY_LEFT)
	{
		player.angularDirection = -1;
	}
	if(event.keyCode == KEY_RIGHT)
	{
		player.angularDirection = 1;
	}
	if(event.keyCode == KEY_A)
	{
		player.angularDirection = -1;
	}
	if(event.keyCode == KEY_S)
	{
		player.directionY = -1;
	}
	if(event.keyCode == KEY_D)
	{
		player.angularDirection = 1;
	}
	if(event.keyCode == KEY_W)
	{
		player.directionY = 1;
	}
	if(event.keyCode == KEY_Q)
	{
		player.directionX = -1;
	}
	if(event.keyCode == KEY_E)
	{
		player.directionX = 1;
	}	
	if(event.keyCode == KEY_SPACE && shootTimer <=0)
	{
		shootTimer +=0.50;
		playerShoot();
	}
}

function onKeyUp(event)
{
	if(event.keyCode == KEY_UP)
	{
		player.directionY = 0;
	}
	if(event.keyCode == KEY_DOWN)
	{
		player.directionY = 0;
	}
	if(event.keyCode == KEY_LEFT)
	{
		player.angularDirection = 0;
	}
	if(event.keyCode == KEY_RIGHT)
	{
		player.angularDirection = 0;
	}
	if(event.keyCode == KEY_A)
	{
		player.angularDirection = 0;
	}
	if(event.keyCode == KEY_S)
	{
		player.directionY = 0;
	}
	if(event.keyCode == KEY_D)
	{
		player.angularDirection = 0;
	}
	if(event.keyCode == KEY_W)
	{
		player.directionY = 0;
	}
	if(event.keyCode == KEY_Q)
	{
		player.directionX = 0;
	}
	if(event.keyCode == KEY_E)
	{
		player.directionX = 0;
	}	
	
}

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
					
			
		

function run()
{
	context.fillStyle = "#000";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime =getDeltaTime();
	
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
	
	

	
        

initialize();

(function() {
 var onEachFrame;
 if (window.requestAnimationFrame) {
 onEachFrame = function(cb) {
 var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
 _cb();
 };
 } else if (window.mozRequestAnimationFrame) {
 onEachFrame = function(cb) {
 var _cb = function() { cb();
window.mozRequestAnimationFrame(_cb); }
 _cb();
 };
 } else {
 onEachFrame = function(cb) {
 setInterval(cb, 1000 / 60);
 }
 }

 window.onEachFrame = onEachFrame;
})();
window.onEachFrame(run);