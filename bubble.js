/*
 @name wg-bubble
 @url https://github.com/wange1228/wg-bubble
 @author WanGe
 @blog http://wange.im
 @version 2.4
*/
var Bubble,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Bubble = (function() {
  var doc, win;

  win = window;

  doc = document;

  function Bubble() {
    this.inBubble = __bind(this.inBubble, this);
    this.animateBubble = __bind(this.animateBubble, this);
    this.createBubble = __bind(this.createBubble, this);
    this.fullCvs = __bind(this.fullCvs, this);
    this.restart = __bind(this.restart, this);
    this.start = __bind(this.start, this);
    this.init = __bind(this.init, this);    this.config = {
      wait: 60000,
      radius: 90,
      avatar: [],
      speed: 6,
      callback: function() {
        win.console && console.log('@name wg-bubble' + '\n' + '@url https://github.com/wange1228/wg-bubble' + '\n' + '@author WanGe' + '\n' + '@blog http://wange.im' + '\n' + '@version 2.4');
      }
    };
    this.cache = {};
  }

  Bubble.initialized = false;

  Bubble.prototype.init = function(params) {
    var config, cvs, cvsEl, i, styleEl, styles;
    if (params == null) params = this.config;
    if (Bubble.initialized) return null;
    Bubble.initialized = true;
    config = this.config;
    for (i in params) {
      config[i] = params[i] || config[i];
    }
    cvsEl = doc.createElement('canvas');
    styleEl = doc.createElement('style');
    styles = 'html,body{width:100%;height:100%;margin:0;padding:0;}' + '#bubble_canvas{display:none;margin:0;padding:0;position:absolute;top:0;left:0;z-index:9999;}';
    cvsEl.id = 'bubble_canvas';
    styleEl.type = 'text/css';
    if (styleEl.styleSheet) {
      styleEl.styleSheet.cssText = styles;
    } else {
      styleEl.appendChild(doc.createTextNode(styles));
    }
    doc.body.appendChild(cvsEl);
    doc.body.appendChild(styleEl);
    cvs = doc.getElementById(cvsEl.id);
    if (cvs && cvs.getContext) {
      this.ctx = cvs.getContext('2d');
      this.fullCvs(cvs);
      this.start(cvs);
      this.bind(cvs);
    }
  };

  Bubble.prototype.start = function(cvs) {
    var _this = this;
    this.cache.bubbles = [];
    this.cache.imgs = [];
    this.cache.bubblesNum = 0;
    this.cache.toWait = this.config.wait;
    this.cache.avatar = this.config.avatar.concat();
    clearTimeout(this.cache.startSTO);
    clearTimeout(this.cache.createSTO);
    clearTimeout(this.cache.animateSTO);
    this.cache.startSTO = setTimeout(function() {
      var scrollTop;
      scrollTop = doc.body.scrollTop || doc.documentElement.scrollTop;
      cvs.style.display = 'block';
      cvs.style.top = scrollTop + 'px';
      _this.createBubble();
      _this.animateBubble(cvs);
      _this.config.callback.apply(_this);
    }, this.cache.toWait);
  };

  Bubble.prototype.restart = function(cvs) {
    cvs.style.display = 'none';
    this.ctx.clearRect(0, 0, this.cvsWidth, this.cvsHeight);
    this.start(cvs);
  };

  Bubble.prototype.fullCvs = function(cvs) {
    this.cvsWidth = doc.body.offsetWidth;
    this.cvsHeight = doc.body.offsetHeight;
    cvs.setAttribute('width', this.cvsWidth);
    cvs.setAttribute('height', this.cvsHeight);
  };

  Bubble.prototype.createBubble = function() {
    var avatar, avatarArr, avatarNum, radius, speed,
      _this = this;
    radius = this.config.radius;
    speed = this.config.speed;
    avatar = this.cache.avatar;
    avatarArr = avatar.shift();
    avatarNum = avatar.length;
    this.cache.bubblesNum++;
    this.cache.bubbles.push({
      x: radius,
      y: this.cvsHeight - radius,
      zIndex: avatarNum,
      vX: Math.random() * speed,
      vY: Math.random() * speed - speed / 2,
      src: avatarArr.src,
      url: avatarArr.url,
      name: avatarArr.name
    });
    this.cache.reverseBubbles = this.cache.bubbles.concat().reverse();
    if (avatarNum !== 0) {
      this.cache.createSTO = setTimeout(function() {
        _this.createBubble();
      }, 600);
    }
  };

  Bubble.prototype.animateBubble = function(cvs) {
    var angle, bubbles, cosine, ctx, dX, dY, distance, i, img, j, num, radius, randomZ, sine, tmpBubble, tmpBubbleB, vX, vXb, vY, vYb, x, xB, y, yB, _ref,
      _this = this;
    ctx = this.ctx;
    radius = this.config.radius;
    num = this.cache.bubblesNum;
    bubbles = this.cache.bubbles;
    ctx.clearRect(0, 0, this.cvsWidth, this.cvsHeight);
    this.setCursor(this.cache.clientX, this.cache.clientY, cvs);
    for (i = 0; 0 <= num ? i < num : i > num; 0 <= num ? i++ : i--) {
      tmpBubble = bubbles[i];
      for (j = _ref = i + 1; _ref <= num ? j < num : j > num; _ref <= num ? j++ : j--) {
        tmpBubbleB = bubbles[j];
        randomZ = Math.round(Math.random());
        if (tmpBubble.zIndex === tmpBubbleB.zIndex) {
          dX = tmpBubbleB.x - tmpBubble.x;
          dY = tmpBubbleB.y - tmpBubble.y;
          distance = Math.sqrt(dX * dX + dY * dY);
          if (distance < 2 * radius) {
            angle = Math.atan2(dY, dX);
            sine = Math.sin(angle);
            cosine = Math.cos(angle);
            x = 0;
            y = 0;
            xB = dX * cosine + dY * sine;
            yB = dY * cosine - dX * sine;
            vX = tmpBubble.vX * cosine + tmpBubble.vY * sine;
            vY = tmpBubble.vY * cosine - tmpBubble.vX * sine;
            vXb = tmpBubbleB.vX * cosine + tmpBubbleB.vY * sine;
            vYb = tmpBubbleB.vY * cosine - tmpBubbleB.vX * sine;
            vX *= -1;
            vXb *= -1;
            xB = x + 2 * radius;
            tmpBubble.x = tmpBubble.x + (x * cosine - y * sine);
            tmpBubble.y = tmpBubble.y + (y * cosine + x * sine);
            tmpBubbleB.x = tmpBubble.x + (xB * cosine - yB * sine);
            tmpBubbleB.y = tmpBubble.y + (yB * cosine + xB * sine);
            tmpBubble.vX = vX * cosine - vY * sine;
            tmpBubble.vY = vY * cosine + vX * sine;
            tmpBubbleB.vX = vXb * cosine - vYb * sine;
            tmpBubbleB.vY = vYb * cosine + vXb * sine;
          }
        }
      }
      tmpBubble.x += tmpBubble.vX;
      tmpBubble.y += tmpBubble.vY;
      if (tmpBubble.x - radius < 0) {
        tmpBubble.x = radius;
        tmpBubble.vX *= -1;
      } else if (tmpBubble.x + radius > this.cvsWidth) {
        tmpBubble.x = this.cvsWidth - radius;
        tmpBubble.vX *= -1;
        tmpBubble.zIndex = randomZ;
      }
      if (tmpBubble.y - radius < 0) {
        tmpBubble.y = radius;
        tmpBubble.vY *= -1;
        tmpBubble.zIndex = randomZ;
      } else if (tmpBubble.y + radius > this.cvsHeight) {
        tmpBubble.y = this.cvsHeight - radius;
        tmpBubble.vY *= -1;
      }
      if (this.cache.imgs[i]) {
        img = this.cache.imgs[i];
      } else {
        img = new Image();
        img.src = tmpBubble.src;
        this.cache.imgs.push(img);
      }
      ctx.fillStyle = '#000';
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = '700 ' + radius * 0.3 + 'px "Microsoft YaHei",SimSun';
      ctx.save();
      ctx.beginPath();
      ctx.arc(tmpBubble.x, tmpBubble.y, radius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.clip();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.save();
      ctx.scale(radius * 2 / img.width, radius * 2 / img.height);
      ctx.drawImage(img, (tmpBubble.x - radius) / (radius * 2 / img.width), (tmpBubble.y - radius) / (radius * 2 / img.height));
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillText(tmpBubble.name, tmpBubble.x, tmpBubble.y);
      ctx.strokeText(tmpBubble.name, tmpBubble.x, tmpBubble.y);
      ctx.restore();
      ctx.closePath();
    }
    this.cache.animateSTO = setTimeout(function() {
      _this.animateBubble(cvs);
    }, 20);
  };

  Bubble.prototype.inBubble = function(x, y) {
    var bubbles, distance, dx, dy, i, _ref;
    bubbles = this.cache.reverseBubbles || [];
    for (i = 0, _ref = bubbles.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      dx = bubbles[i].x - x;
      dy = bubbles[i].y - y;
      distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= this.config.radius) {
        this.cache.curBubble = bubbles[i];
        return true;
      }
    }
    return false;
  };

  Bubble.prototype.setCursor = function(x, y, cvs) {
    var cursor;
    if (this.inBubble(x, y)) {
      cursor = 'pointer';
    } else {
      cursor = 'default';
    }
    cvs.style.cursor = cursor;
  };

  Bubble.prototype.bind = function(cvs) {
    var body,
      _this = this;
    body = doc.body;
    body.addEventListener('mousemove', function(ev) {
      var x, y;
      x = _this.cache.clientX = ev.clientX;
      y = _this.cache.clientY = ev.clientY;
      _this.setCursor(x, y, cvs);
    });
    body.addEventListener('mousedown', function(ev) {
      var x, y;
      x = ev.clientX;
      y = ev.clientY;
      if (_this.inBubble(x, y) && _this.cache.bubbles.length !== 0) {
        win.location.href = _this.cache.curBubble.url;
      } else {
        _this.restart(cvs);
      }
    });
    body.addEventListener('keydown', function() {
      _this.restart(cvs);
    });
    win.addEventListener('scroll', function() {
      _this.restart(cvs);
    });
    win.addEventListener('resize', function() {
      _this.fullCvs(cvs);
      _this.restart(cvs);
    });
  };

  return Bubble;

})();
