!function(win, doc) {
    win.addEventListener && win.addEventListener('load', function() {
        var Bubble = function() {
            // 默认参数
            this.config = {
                wait: 60000,             // 等待时间，默认1分钟
                num: 10,                 // 气泡数量，默认10个
                radius: 90,              // 气泡半径，默认90px
                callback: function() {}  // 显示气泡后回调
            };
            this.cache = {};
        };
        
        Bubble.initialized = false;
        
        Bubble.prototype = {
            // 初始化
            init: function(params) {
                // 如果已初始化过，则返回
                if (Bubble.initialized) { return; }
                Bubble.initialized = true;
                
                var _this = this,
                    config = _this.config;
                
                for (var i in config) {
                    config[i] = params[i] || config[i];
                }
                
                // 生成画布并铺满全屏
                var cvsEl = doc.createElement('canvas'),
                    styleEl = doc.createElement('style'),
                    styles = 'html,body{width:100%;height:100%;margin:0;padding:0;}' +
                             '#bubble_canvas{display:none;margin:0;padding:0;position:absolute;top:0;left:0;z-index:9999;}';
                             
                cvsEl.id = 'bubble_canvas';
                styleEl.type = 'text/css';
                
                if (styleEl.styleSheet) {
                    styleEl.styleSheet.cssText = styles;
                } else {
                    styleEl.appendChild(document.createTextNode(styles));
                }
                doc.body.appendChild(cvsEl);
                doc.body.appendChild(styleEl);
                
                var cvs = doc.getElementById(cvsEl.id);
                    
                if (cvs && cvs.getContext) {
                    _this.ctx = cvs.getContext('2d');
                    
                    _this.fullCvs(cvs);
                    _this.start(cvs);
                    _this.bind(cvs);
                }
            },
            start: function(cvs) {
                var _this = this;
                _this.cache.bubbles = [];
                _this.cache.bubblesNum = 0;
                _this.cache.toWait = _this.config.wait;
                
                clearTimeout(_this.cache.startSTO);
                clearTimeout(_this.cache.createSTO);
                clearTimeout(_this.cache.animateSTO);
                
                _this.cache.startSTO = setTimeout(function() {
                    var scrollTop = doc.body.scrollTop || doc.documentElement.scrollTop;
                    cvs.style.display = 'block';
                    cvs.style.top = scrollTop + 'px';
                    
                    _this.createBubble(0);
                    _this.animateBubble();
                    _this.config.callback.apply(_this);
                }, _this.cache.toWait);
            },
            restart: function(cvs) {
                cvs.style.display = 'none';
                // 清除画布
                this.ctx.clearRect(0, 0, this.cvsWidth, this.cvsHeight);
                // 重新开始
                this.start(cvs);
            },
            // 全屏画布
            fullCvs: function(cvs) {
                this.cvsWidth = doc.body.offsetWidth;
                this.cvsHeight = doc.body.offsetHeight;
                    
                cvs.setAttribute('width', this.cvsWidth);
                cvs.setAttribute('height', this.cvsHeight);
            },
            // 生成气泡
            createBubble: function(zIndex) {
                var _this = this,
                    radius = _this.config.radius;
                
                // 气泡初始化
                _this.cache.bubbles.push({
                    x: radius,                          // x 坐标
                    y: _this.cvsHeight - radius,        // y 坐标
                    zIndex: zIndex,                     // 层级
                    vX: Math.random() * 8,              // 左右速度
                    vY: Math.random() * 8 - 4,          // 上下速度
                    color: {                            // 颜色
                        r: Math.floor(Math.random()*255),
                        g: Math.floor(Math.random()*255),
                        b: Math.floor(Math.random()*255)
                    },
                    increase: {                         // 颜色值递增
                        r: true,
                        g: true,
                        b: true
                    }
                });
                
                // 每隔600ms生成一个气泡
                if (++_this.cache.bubblesNum !== _this.config.num) {
                    _this.cache.createSTO = setTimeout(function() {
                        _this.createBubble(_this.cache.bubblesNum);
                    }, 600);
                }
            },
            // 改变气泡颜色
            changeColor: function(tmpBubble) {
                var rgb = ['r', 'g', 'b'][Math.floor(Math.random() * 3)];
                
                if (tmpBubble.increase[rgb]) {
                    if (tmpBubble.color[rgb] < 0) {
                        tmpBubble.color[rgb] = 0;
                        tmpBubble.increase[rgb] = true;
                    } else if (tmpBubble.color[rgb] >= 255) {
                        tmpBubble.color[rgb] = 254;
                        tmpBubble.increase[rgb] = false;
                    } else {
                        ++tmpBubble.color[rgb];
                    }
                } else {
                    if (tmpBubble.color[rgb] <= 0) {
                        tmpBubble.color[rgb] = 1;
                        tmpBubble.increase[rgb] = true;
                    } else if (tmpBubble.color[rgb] > 255) {
                        tmpBubble.color[rgb] = 255;
                        tmpBubble.increase[rgb] = false;
                    } else {
                        --tmpBubble.color[rgb];
                    }
                }
            },
            // 气泡动画
            animateBubble: function() {
                var _this = this,
                    ctx = _this.ctx,
                    radius = _this.config.radius,
                    num = _this.cache.bubblesNum,
                    bubbles = _this.cache.bubbles;
                    
                ctx.clearRect(0, 0, _this.cvsWidth, _this.cvsHeight);
                
                for (var i=0; i<num; i++) {
                    var tmpBubble = bubbles[i];
                    for (var j=i+1; j<num; j++) {
                        var tmpBubbleB = bubbles[j],
                            randomZ = Math.round(Math.random());
                        // 层级一样时才进行碰撞检测
                        if (tmpBubble.zIndex === tmpBubbleB.zIndex) {
                            var dX = tmpBubbleB.x - tmpBubble.x,
                                dY = tmpBubbleB.y - tmpBubble.y,
                                distance = Math.sqrt(dX*dX + dY*dY);
                                
                            if (distance < 2 * radius) {
                                var angle = Math.atan2(dY, dX),
                                    sine = Math.sin(angle),
                                    cosine = Math.cos(angle),
                                    x = 0,
                                    y = 0,
                                    xB = dX * cosine + dY * sine,
                                    yB = dY * cosine - dX * sine,
                                    vX = tmpBubble.vX * cosine + tmpBubble.vY * sine,
                                    vY = tmpBubble.vY * cosine - tmpBubble.vX * sine,
                                    vXb = tmpBubbleB.vX * cosine + tmpBubbleB.vY * sine,
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
                    
                    // 设置边界
                    if (tmpBubble.x - radius < 0) {
                        tmpBubble.x = radius;
                        tmpBubble.vX *= -1;
                    } else if (tmpBubble.x + radius > _this.cvsWidth) {
                        tmpBubble.x = _this.cvsWidth - radius;
                        tmpBubble.vX *= -1;
                        tmpBubble.zIndex = randomZ;
                    }
                    if (tmpBubble.y - radius < 0) {
                        tmpBubble.y = radius;
                        tmpBubble.vY *= -1;
                        tmpBubble.zIndex = randomZ;
                    } else if (tmpBubble.y + radius > _this.cvsHeight) {
                        tmpBubble.y = _this.cvsHeight - radius;
                        tmpBubble.vY *= -1;
                    }
                    
                    _this.changeColor(tmpBubble);
                    var grd = ctx.createLinearGradient(tmpBubble.x, tmpBubble.y - radius, tmpBubble.x, tmpBubble.y + radius);
                    grd.addColorStop(0, 'rgba(' + tmpBubble.color.r + ', ' + tmpBubble.color.g + ', ' + tmpBubble.color.b + ', 0.8)');
                    grd.addColorStop(1, 'rgba(' + tmpBubble.color.b + ', ' + tmpBubble.color.g + ', ' + tmpBubble.color.r + ', 0.8)');
                    
                    ctx.fillStyle = grd;
                    // ctx.shadowBlur = 2 * radius;
                    // ctx.shadowColor = '#000';
                    // ctx.shadowOffsetX = 0.4 * radius;
                    // ctx.shadowOffsetY = 0.18 * radius;
                    ctx.beginPath();
                    ctx.arc(tmpBubble.x, tmpBubble.y, radius, 0, Math.PI * 2, false);
                    ctx.closePath();
                    ctx.fill();
                }
                
                _this.cache.animateSTO = setTimeout(function() {
                    _this.animateBubble();
                }, 20);
            },
            // 事件绑定
            bind: function(cvs) {
                var _this = this,
                    body = doc.body;
                body.addEventListener('mousemove', function() {
                    _this.restart(cvs);
                });
                body.addEventListener('keydown', function() {
                    _this.restart(cvs);
                });
                body.addEventListener('mousedown', function() {
                    _this.restart(cvs);
                });
                win.addEventListener('scroll', function() {
                    _this.restart(cvs);
                });
                win.addEventListener('resize', function() {
                    _this.fullCvs(cvs);
                    _this.restart(cvs);
                });
            }
        };
        
        new Bubble().init(win.wangeBubble || {});
    });
}(window, document);