/**
 * 
 * @param {dom} canvas 
 * @param {string} imgsrc
 * @param {object} options?
 */
function Particle(canvas, imgsrc, options={}){
  this.canvas = canvas;
  this.imgsrc = imgsrc;
  this.method = options.method || 'float';
  this.duration = options.duration || 100;
  this.floatDuration = options.floatDuration || 3;
  this.delayRatio = options.delayRatio || 0.2;
  this.cols = options.cols || 100;
  this.rows = options.rows || 100;
  this.dx = options.dx || 100;
  this.dy = options.dy || 100;
  this.sx = options.sx || 200;
  this.sy = options.sy || 320;

  this.particles = [];
  this.imageData = null;
  this.imageInfo = {};
  this.canvasInfo = {};
  this.ctx = null;
}

Particle.prototype.calculate = function() {
  var s_width = parseInt(this.imageInfo.width/this.rows);
  var s_height = parseInt(this.imageInfo.height/this.cols);
  var now = new Date().getTime();
  for(var i=1;i<=this.rows;i++){
    for(var j=1;j<=this.cols;j++){
      var pos = [(j*s_height - 1)*this.imageInfo.width + (i*s_width - 1)]*4;
      if(imageData.data[pos] != 0) {
        var particle = {
          x: this.dx + i*s_width + (Math.random() - 0.5)*20,
          y: this.dy + j*s_height + (Math.random() - 0.5)*20,
          fillStyle: `rgba(${imageData.data[pos]},${imageData.data[pos+1]},${imageData.data[pos+2]},${imageData.data[pos+3]})`
        }
        if(this.method === 'float') calFloat.call(this, pos, particle);
        else if(this.method === 'tween') calTween.call(this, j, particle);
        this.particles.push(particle);
      }
    }
  }
  function calFloat(position, particle){
    if(position%5 === 0){
      Object.assign(particle, {
        startTime: now+parseInt(Math.random()*20*1000),
        killTime: now+parseInt(Math.random()*(20+this.floatDuration)*1000),
        speedX: (Math.random() - 0.5)*0.9,
        speedY: (Math.random() - 0.5)*0.9,
        initialX: particle.x,
        initialY: particle.y,
        willFloat: true
      });
    }
  }
  function calTween(row, particle){
    Object.assign(particle, {
      initialX: particle.x,
      initialY: particle.y,
      x: this.sx,
      y: this.sy,
      currTime: 0,
      delay: parseInt((row*this.delayRatio+Math.random())*10)
    });
  }
}
Particle.prototype.tween = {
  easeInOut(t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
  }
}

Particle.prototype.init = function() {
  var img = new Image();
  var that = this;
  img.onload = function() {
    Object.assign(this.imageInfo, {
      width: img.width,
      height: img.height
    });
    Object.assign(this.canvasInfo, {
      width: this.canvas.width,
      height: this.canvas.height,
    });
    this.ctx = this.canvas.getContext('2d');
    this.ctx.drawImage(img, this.dx, this.dy);
    imageData = this.ctx.getImageData(this.dx, this.dy, this.imageInfo.width, this.imageInfo.height);
    this.calculate();
    this.draw();
  }.bind(that);
  img.src = this.imgsrc;
}
Particle.prototype._drawFloat = function(){
  var len = this.particles.length;
  this.ctx.fillStyle = '#0c1328';
  this.ctx.fillRect(0, 0, this.canvasInfo.width, this.canvasInfo.height);
  var curr_particle = null;
  var time = new Date().getTime();
  for(var i=0;i<len;i++){
    curr_particle = this.particles[i];
    if(curr_particle.willFloat && curr_particle.startTime<time){
      curr_particle.x += curr_particle.speedX,
      curr_particle.y += curr_particle.speedY
    }
    if(curr_particle.willFloat && curr_particle.killTime<time){
      curr_particle.x = curr_particle.initialX;
      curr_particle.y = curr_particle.initialY;
      curr_particle.startTime = time+parseInt(Math.random()*20*1000);
      curr_particle.killTime = time+parseInt(Math.random()*(20+this.floatDuration)*1000);
    }
    this.ctx.fillStyle = curr_particle.fillStyle;
    this.ctx.fillRect(curr_particle.x, curr_particle.y, 1, 1);
  }
  requestAnimationFrame(this._drawFloat.bind(this));
}
Particle.prototype._drawTween = function(){
  var len = this.particles.length;
  var curr_particle = null;
  var cur_time = 0;
  if(this.particles[len-1].currTime<=this.duration) {
    this.ctx.fillStyle = '#0c1328';
    this.ctx.fillRect(0, 0, this.canvasInfo.width, this.canvasInfo.height);
  }
  for(var i=0;i<len;i++){
    var curr_particle = this.particles[i];
    if(curr_particle.delay>0){
      curr_particle.delay--;
    }else if(curr_particle.currTime<=this.duration){
      curr_particle.x = this.tween.easeInOut(curr_particle.currTime, this.sx, curr_particle.initialX-this.sx, this.duration);
      curr_particle.y = this.tween.easeInOut(curr_particle.currTime, this.sy, curr_particle.initialY-this.sy, this.duration);
      this.ctx.fillStyle = curr_particle.fillStyle;
      this.ctx.fillRect(curr_particle.x, curr_particle.y, 1, 1);
      if(curr_particle.currTime<this.duration) curr_particle.currTime++;
    }else{
      cancelAnimationFrame(animId);
    }
  }
  animId = requestAnimationFrame(this._drawTween.bind(this));
}
Particle.prototype.draw = function(){
  if(this.method === 'float') this._drawFloat();
  else if(this.method === 'tween') this._drawTween();
}