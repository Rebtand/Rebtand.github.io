var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();

// This function will return the time in seconds since the function 
// was last called
// You should only call this function once per frame
function getDeltaTime()
{
    endFrameMillis = startFrameMillis;
    startFrameMillis = Date.now();

        // Find the delta time (dt) - the change in time since the last drawFrame
        // We need to modify the delta time to something we can use.
        // We want 1 to represent 1 second, so if the delta is in milliseconds
        // we divide it by 1000 (or multiply by 0.001). This will make our 
        // animations appear at the right speed, though we may need to use
        // some large values to get objects movement and rotation correct
    var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
    
        // validate that the delta is within range
    if(deltaTime > 1)
        deltaTime = 1;
        
    return deltaTime;
}

//-------------------- Don't modify anything above here

//define game state values
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;

var titleImg = document.createElement("img");
var gameoverImg = document.createElement("img");

titleImg.src = "assets/title.png";

var win = false;
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;
var LAYER_COUNT = 5;
var LAYER_BACKGROUND = 0;
var LAYER_BACKGROUND2 = 1;
var LAYER_PLATFORMS = 2;
var LAYER_GRASS_EDGES = 3;
var LAYER_LADDERS = 4;
var LAYER_OBJECT_ENEMIES = 5;
var LAYER_OBJECT_TRIGGERS = 6;
var MAP = {tw: 170, th: 15};
var TILE = 35;
var TILESET_TILE = TILE * 2;
var TILESET_PADDING = 2;
var TILESET_SPACING = 2;
var TILESET_COUNT_X = 14;
var TILESET_COUNT_Y = 14;
var tileset = document.createElement("img");
var cells = [];
var enemies = [];
var bullets = [];
var METER = TILE;
var GRAVITY = METER * 9.8 * 4;
var MAXDX = METER * 10;
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 6;
var JUMP = METER * 5000;
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;
var worldOffsetX = 0;
var score = 0;
var lives = 03;
var hp = 3;
var scoreBG = document.createElement("img");
var heroHead = document.createElement("img");
var heart = document.createElement("img");
var gameOverTimer = 9.22;

// some variables to calculate the Frames Per Second (FPS - this tells use
// how fast our game is running, and allows us to make the game run at a 
// constant speed)
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

// load an image to draw

var player = new Player();
var keyboard = new Keyboard();

tileset.src = "assets/tileset.png";

function cellAtPixelCoord(layer, x,y)
{
    if(x<0 || x>SCREEN_WIDTH || y<0)
        return 1;
    if(y>SCREEN_HEIGHT)
        return 0;
    return cellAtTileCoord(layer, pixelToTile(x), pixelToTile(y));
};

function cellAtTileCoord(layer, tx, ty)
{
    if(tx<0 || tx>=MAP.tw || ty<0)
        return 1;
    if(ty>=MAP.th)
        return 0;
    return cells[layer][ty][tx];
};

function tileToPixel(tile)
{
    return tile * TILE;
};

function pixelToTile(pixel)
{
    return Math.floor(pixel/TILE);
};

function bound(value, min, max)
{
    if(value < min)
        return min;
    if(value > max)
        return max;
    return value;
}

function drawMap()
{
    var startX = -1;
    var maxTiles = Math.floor(SCREEN_WIDTH / TILE) + 4;
    var tileX = pixelToTile (player.position.x);
    var offsetX = TILE + Math.floor(player.position.x%TILE);
    
    startX = tileX - Math.floor(maxTiles / 2);
    
    if(startX < -1)
    {
        startX = 0;
        offsetX = 0;
    }
    if(startX > MAP.tw - maxTiles)
    {
        startX = MAP.tw - maxTiles + 1;
        offsetX = TILE;
    }
    
    worldOffsetX = startX * TILE + offsetX;
    
     for( var layerIdx=0; layerIdx < LAYER_COUNT; layerIdx++ )
     {
         for( var y = 0; y < level1.layers[layerIdx].height; y++ )
         {
             var idx = y * level1.layers[layerIdx].width + startX;
             for( var x = startX; x < startX + maxTiles; x++ )
             {
                 if( level1.layers[layerIdx].data[idx] != 0 )
                 {
                     // the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile),
                     // so subtract one from the tileset id to get the correct tile
                     var tileIndex = level1.layers[layerIdx].data[idx] - 1;
                     var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) *
                    (TILESET_TILE + TILESET_SPACING);
                     var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) *
                    (TILESET_TILE + TILESET_SPACING);
                     context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE,
                    (x-startX)*TILE - offsetX, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
                 }
                idx++;
             }
         }
     }
}
 
function addEnemies() {
    enemies.splice(0,enemies.length);
    idx = 0;
    for(var y = 0; y < level1.layers[LAYER_OBJECT_ENEMIES].height; y++) {
        for(var x = 0; x < level1.layers[LAYER_OBJECT_ENEMIES].width; x++) {
            if(level1.layers[LAYER_OBJECT_ENEMIES].data[idx] != 0) {
            var px = tileToPixel(x);
            var py = tileToPixel(y);
            var e = new Enemy(px,py);
            enemies.push(e);
            }
        idx++;
        }
    }
}
function initialize() {
    for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
        cells[layerIdx] = [];
        var idx = 0;
        for(var y = 0; y < level1.layers[layerIdx].height; y++) {
            cells[layerIdx][y] = [];
            for(var x = 0; x < level1.layers[layerIdx].width; x++) {
                if(level1.layers[layerIdx].data[idx] != 0) {
                    cells[layerIdx][y][x] = 1;
                    cells[layerIdx][y-1][x-1] = 1;
                    cells[layerIdx][y-1][x+1] = 1;
                    cells[layerIdx][y][x+1] = 1;
                }
                else if(cells[layerIdx][y][x] != 1) {
                    cells[layerIdx][y][x] = 0;
                }
                idx++;
            }
        }
    }
    musicBackground = new Howl(
    {
        urls: ["assets/levelbgm.mp3"],
        loop: true,
        buffer: true,
        volume:0.5,
        onend: function() {
            musicBackground.play()
        }
    });
    
    musicTitle = new Howl(
    {
        urls: ["assets/titlebgm.mp3"],
        loop: true,
        buffer: true,
        volume: 0.5
    });
    
    musicGameOver = new Howl(
    {
        urls: ["assets/gameovernew.mp3"],
        loop: false,
        volume: 0.5,
        buffer: true,
    });
    
    musicWin = new Howl (
    {
        urls: ["assets/win.mp3"],
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
        urls: ["assets/Laser_Shoot37.wav"],
        buffer: true,
        volume: 1,
        onend: function() {
            isSfxPlaying = false;
        }
    });
    
    sfxJump = new Howl(
    {
        urls: ["assets/Jump.wav"],
        buffer: true,
        volume: 1,
        onend: function() {
            isSfxPlaying = false;
        }
    });

    addEnemies();
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

function respawn()
{
    if(player.isAlive == false)
    {
        player.position.x = player.defaultpos.x;
        player.position.y = player.defaultpos.y;
        lives -= 1;
        score -= 500;
        hp = 3;
        musicBackground.stop();
        if(lives >= 0)
            musicBackground.play();
        addEnemies();
        player.isAlive = true;
    }
}
function splashScreen()
{
    
    gameState = STATE_SPLASH;
    musicGameOver.stop();
    musicBackground.stop();
    musicTitle.play();
}
function startGame()
{
    win = false;
    musicTitle.stop();
    gameState = STATE_GAME;
    player.isAlive = false;
    lives = 4;
    score = 0;
    hp = 3;
}

function gameOver()
{
    
    musicBackground.stop();
    musicTitle.stop();
    if(win == false)
    {
        gameoverImg.src = "assets/gameover.png";
        musicGameOver.play();
    }
    if(win == true)
    {
        gameoverImg.src = "assets/win.png";
        musicWin.play();
    }
    gameState = STATE_GAMEOVER;
        gameOverTimer = 9.6;
}
function runSplash()
{
    context.drawImage(titleImg, 0, 0);
    if(keyboard.isKeyDown(keyboard.KEY_SHIFT) == true) {
		startGame();
	}
}
function runGame()
{   
    var deltaTime = getDeltaTime();
    
    
    player.update(deltaTime);
    for(var i=0; i<enemies.length; i++)
    {
        enemies[i].update(deltaTime);
        if (player.isAlive == true)
        {
            if(intersects(
                player.position.x, player.position.y,
                player.width-100, player.height-100,
                enemies[i].position.x, enemies[i].position.y,
                enemies[i].width, enemies[i].height) === true)
                {
                    hp -= 1;
                    enemies.splice(i, 1);
                }
        }
        
    }
    
    drawMap();
    for(var i=0; i<enemies.length; i++) {
        enemies[i].draw();
    }
    
    var hit=false;
        
    for(var i=0; i<bullets.length; i++)
    {
        bullets[i].update(deltaTime);
        if(bullets[i].position.x - worldOffsetX < 0 || bullets[i].position.x - worldOffsetX > SCREEN_WIDTH)
        {
            hit = true;
        }
        
        for(var j=0; j<enemies.length; j++)
        {
            if(intersects(bullets[i].position.x, bullets[i].position.y, TILE, TILE, enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
            {
                // kill both the bullet and the enemy
                enemies.splice(j, 1);
                hit = true;
                // increment the player score
                score += 100;
                break;
            }
        }
        
        if(hit == true)
        {
            bullets.splice(i, 1);
            break;
        }
    }
    for(var i=0; i<bullets.length; i++)
    {
        bullets[i].draw ();
    }

    player.draw();
    
    if(player.isAlive == false) {
        respawn();
    }
    // update the frame counter 
    fpsTime += deltaTime;
    fpsCount++;
    if(fpsTime >= 1)
    {
        fpsTime -= 1;
        fps = fpsCount;
        fpsCount = 0;
    }       
        
    //draw score
    scoreBG.src = "assets/score-bg.png";
    context.drawImage(scoreBG, 0, 0);
    context.fillStyle = "gray";
    context.font = "Bold " + "20px Arial";
    context.textAlign = "end";
    context.fillText(score, 634 , 470);
    if(score <= 0)
    {
        score = 0;
    }
    //draw lives
    context.textAlign = "start";
    heroHead.src = "assets/hero-head.png";
    context.drawImage(heroHead, 0, 0);
    if(lives < 10)
        context.fillText(" x 0" + lives, 50, 60);
    else if(lives >= 10)
        context.fillText(" x " + lives, 50, 60);
    if(lives > 99)
        lives = 99;
    //draw hp
    heart.src = "assets/heart.png";
    if (hp >= 1)
        context.drawImage(heart, 52, 23);
    if (hp >= 2)
        context.drawImage(heart, 52 + (heart.width + 2), 23);
    if (hp >= 3)
        context.drawImage(heart, 52 + ((heart.width + 2) + (heart.width + 2)), 23);
    
    //when hp < 1, lose a life
    if (hp < 1)
    {
        player.isAlive = false;
    }
    //when lives < 0, game over
    if(lives < 0)
    {
        win = false;
        gameOver();
    }
    //when player is at the exit, win
    if(player.position.x > (METER * 171) - 71)
    {
        player.isAlive = false;
        win = true;
        gameOver();
    }
    // draw the FPS
    context.fillStyle = "#f00";
    context.font="14px Arial";
    context.fillText("FPS: " + fps, 5, 20, 100);
}

function runGameOver()
{
    var deltaTime = getDeltaTime();
    gameOverTimer -= deltaTime;
    context.drawImage(gameoverImg, 0, 0);
    if(gameOverTimer <= 0)
    {
        splashScreen();
    }
}
function run()
{
    context.fillStyle = "#CCE3F9";     
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    switch(gameState)
	{
		case STATE_SPLASH:
			runSplash();
			break;
		case STATE_GAME:
			runGame();
			break;
		case STATE_GAMEOVER:
			runGameOver();
			break;
		
	}
}

initialize();


//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); };
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); };
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    };
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
