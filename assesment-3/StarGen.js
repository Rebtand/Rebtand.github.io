var StarGen = function()
{
   this.starImage = document.getElementById("img");
   this.starImage;
   this.xPos;
   this.yPos;
   this.velocity;
   this.speed;
   this.imgWidth;
   this.imgHeight;
   this.screenHeight;
   this.screenWidth
};

StarGen.prototype.SetGenerator = function( _screenWidth, _screenHeight, _img)
{
   this.screenWidth = _screenWidth;
   this.screenHeight = _screenHeight;

   this.Generate();
   this.SetY();
   
   
   this.starImage = _img;
}

StarGen.prototype.Generate = function()
{
   this.CreateWidth();
   this.CreateHeight();
   this.CreateVelocity();
   this.SetX();

   this.yPos = 0;
}

StarGen.prototype.RunGenerator = function()
{
   this.UpdateStarField();
   this.DrawStarField();
}

StarGen.prototype.UpdateStarField = function()
{
	this.yPos += this.velocity;

	if (this.yPos >= 700)
	{
       this.Generate();
	}
}

StarGen.prototype.CreateWidth = function()
{
	this.imgWidth = this.Rand(15, 8);
}

StarGen.prototype.CreateHeight = function()
{
	this.imgHeight = this.imgWidth;
}

StarGen.prototype.CreateVelocity = function()
{
   this.speed = 100;

   this.velocity = this.speed / this.imgHeight;
}

StarGen.prototype.SetX = function()
{
   this.xPos = this.Rand(this.screenWidth, 1);
}

StarGen.prototype.SetY = function()
{
	this.yPos = this.Rand(this.screenHeight, 1);
}

StarGen.prototype.DrawStarField = function()
{
   context.drawImage(starImage, this.xPos, this.yPos, this.imgWidth, this.imgHeight)
}

StarGen.prototype.Rand = function(_val1, _val2)
{
	return Math.floor( (Math.random() * (_val2 - _val1)) + _val1);
}