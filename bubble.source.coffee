###
 @name wg-bubble
 @url https://github.com/wange1228/wg-bubble
 @author WanGe
 @blog http://wange.im
 @version 2.3
###
class Bubble
    win = window
    doc = document
    constructor: ->
        @config = 
            wait: 60000             # 等待时间，默认1分钟
            radius: 90              # 气泡半径，默认90px
            avatar: []              # 头像数组 {src: '', url: '', name: ''}
            speed: 6                # 速度
            callback: ->            # 显示气泡后回调
                win.console && console.log '@name wg-bubble' + '\n' +
                                           '@url https://github.com/wange1228/wg-bubble' + '\n' +
                                           '@author WanGe' + '\n' +
                                           '@blog http://wange.im' + '\n' +
                                           '@version 2.3'
                return
        @cache = {}
    @initialized = false
    
    # 初始化
    init: (params = @config) ->
        # 如果已初始化过，则返回
        if Bubble.initialized
            return null
        Bubble.initialized = true
        
        _this = this
        config = _this.config
        
        for i of params
            config[i] = params[i] || config[i]
        
        # 生成画布并铺满全屏
        cvsEl = doc.createElement 'canvas'
        styleEl = doc.createElement 'style'
        styles = 'html,body{width:100%;height:100%;margin:0;padding:0;}' +
                 '#bubble_canvas{display:none;margin:0;padding:0;position:absolute;top:0;left:0;z-index:9999;}'
                     
        cvsEl.id = 'bubble_canvas'
        styleEl.type = 'text/css'
        
        if styleEl.styleSheet
            styleEl.styleSheet.cssText = styles
        else 
            styleEl.appendChild doc.createTextNode styles
        doc.body.appendChild cvsEl
        doc.body.appendChild styleEl
        
        cvs = doc.getElementById cvsEl.id
        
        if cvs && cvs.getContext
            _this.ctx = cvs.getContext '2d'
            _this.fullCvs cvs
            _this.start cvs
            _this.bind cvs
        return
        
    # 动画开始
    start: (cvs) ->
        _this = this
        _this.cache.bubbles = []
        _this.cache.imgs = []
        _this.cache.bubblesNum = 0
        _this.cache.toWait = _this.config.wait
        _this.cache.avatar = _this.config.avatar.concat()
        
        clearTimeout _this.cache.startSTO
        clearTimeout _this.cache.createSTO
        clearTimeout _this.cache.animateSTO
        
        _this.cache.startSTO = setTimeout ->
            scrollTop = doc.body.scrollTop || doc.documentElement.scrollTop
            cvs.style.display = 'block'
            cvs.style.top = scrollTop + 'px'
            _this.createBubble()
            _this.animateBubble cvs
            _this.config.callback.apply _this
            return
        , _this.cache.toWait
    
        return
        
    # 重新开始
    restart: (cvs) ->
        _this = this
        cvs.style.display = 'none'
        _this.ctx.clearRect 0, 0, _this.cvsWidth, _this.cvsHeight
        _this.start cvs
        return
        
    # 全屏画布
    fullCvs: (cvs) ->
        _this = this
        _this.cvsWidth = doc.body.offsetWidth
        _this.cvsHeight = doc.body.offsetHeight
            
        cvs.setAttribute 'width', _this.cvsWidth
        cvs.setAttribute 'height', _this.cvsHeight
        return
        
    # 生成气泡
    createBubble: ->
        _this = this
        radius = _this.config.radius
        speed = _this.config.speed
        avatar = _this.cache.avatar
        avatarArr = avatar.shift()
        avatarNum = avatar.length
            
        _this.cache.bubblesNum++
        
        # 气泡初始化
        _this.cache.bubbles.push {
            x: radius                                   # x 坐标
            y: _this.cvsHeight - radius                 # y 坐标
            zIndex: avatarNum                           # 层级
            vX: Math.random() * speed                   # 左右速度
            vY: Math.random() * speed - speed/2         # 上下速度
            src: avatarArr.src                          # 图片地址
            url: avatarArr.url                          # 图片链接
            name: avatarArr.name                        # 图片名称
        }
        
        _this.cache.reverseBubbles = _this.cache.bubbles.concat().reverse()
        
        # 每隔600ms生成一个气泡
        if avatarNum isnt 0
            _this.cache.createSTO = setTimeout ->
                _this.createBubble()
                return
            , 600
        return
        
    # 气泡动画
    animateBubble: (cvs) ->
        _this = this
        ctx = _this.ctx
        radius = _this.config.radius
        num = _this.cache.bubblesNum
        bubbles = _this.cache.bubbles
                
        ctx.clearRect 0, 0, _this.cvsWidth, _this.cvsHeight
        _this.setCursor _this.cache.clientX, _this.cache.clientY, cvs
        
        for i in [0...num]
            tmpBubble = bubbles[i]
            
            for j in [i+1...num]
                tmpBubbleB = bubbles[j]
                randomZ = Math.round Math.random()
                
                # 层级一样时才进行碰撞检测
                if tmpBubble.zIndex is tmpBubbleB.zIndex
                    dX = tmpBubbleB.x - tmpBubble.x
                    dY = tmpBubbleB.y - tmpBubble.y
                    distance = Math.sqrt dX*dX + dY*dY
                            
                    if distance < 2 * radius
                        angle = Math.atan2 dY, dX
                        sine = Math.sin angle
                        cosine = Math.cos angle
                        x = 0
                        y = 0
                        xB = dX * cosine + dY * sine
                        yB = dY * cosine - dX * sine
                        vX = tmpBubble.vX * cosine + tmpBubble.vY * sine
                        vY = tmpBubble.vY * cosine - tmpBubble.vX * sine
                        vXb = tmpBubbleB.vX * cosine + tmpBubbleB.vY * sine
                        vYb = tmpBubbleB.vY * cosine - tmpBubbleB.vX * sine
                            
                        vX *= -1
                        vXb *= -1
                        xB = x + 2 * radius
                        tmpBubble.x = tmpBubble.x + (x * cosine - y * sine)
                        tmpBubble.y = tmpBubble.y + (y * cosine + x * sine)
                        tmpBubbleB.x = tmpBubble.x + (xB * cosine - yB * sine)
                        tmpBubbleB.y = tmpBubble.y + (yB * cosine + xB * sine)
                        tmpBubble.vX = vX * cosine - vY * sine
                        tmpBubble.vY = vY * cosine + vX * sine
                        tmpBubbleB.vX = vXb * cosine - vYb * sine
                        tmpBubbleB.vY = vYb * cosine + vXb * sine
                        
                    
            
            tmpBubble.x += tmpBubble.vX
            tmpBubble.y += tmpBubble.vY
            
            # 设置边界
            if tmpBubble.x - radius < 0 
                tmpBubble.x = radius
                tmpBubble.vX *= -1
            else if tmpBubble.x + radius > _this.cvsWidth
                tmpBubble.x = _this.cvsWidth - radius
                tmpBubble.vX *= -1
                tmpBubble.zIndex = randomZ
            
            if tmpBubble.y - radius < 0
                tmpBubble.y = radius
                tmpBubble.vY *= -1
                tmpBubble.zIndex = randomZ
            else if tmpBubble.y + radius > _this.cvsHeight
                tmpBubble.y = _this.cvsHeight - radius
                tmpBubble.vY *= -1

            if _this.cache.imgs[i]
                img = _this.cache.imgs[i]
            else
                img = new Image()
                img.src = tmpBubble.src
                _this.cache.imgs.push img
                
                
            # 径向渐变，在 firefox 下太卡，忍痛删之
            # grd = ctx.createLinearGradient tmpBubble.x, tmpBubble.y - radius, tmpBubble.x, tmpBubble.y + radius
            # grd.addColorStop 0, '#000'
            # grd.addColorStop 1, '#fff'
            ctx.fillStyle = '#000'
            ctx.globalAlpha = 0.9
            ctx.strokeStyle = '#fff'
            ctx.textBaseline = 'middle'
            ctx.textAlign = 'center'
            ctx.font = '700 ' + radius * 0.3 + 'px "Microsoft YaHei",SimSun'
            
            # 阴影，在 firefox 下太卡，忍痛删之
            # ctx.shadowColor = '#000'
            # ctx.shadowBlur = radius * 0.055
            # ctx.shadowOffsetX = radius * 0.055
            # ctx.shadowOffsetY = radius * 0.055
            ctx.save()
            ctx.beginPath()
            ctx.arc(tmpBubble.x, tmpBubble.y, radius, 0, Math.PI * 2, false)
            ctx.fill()
            ctx.clip()
            ctx.globalCompositeOperation = 'source-atop'
            ctx.save()
            ctx.scale(radius * 2 / img.width, radius * 2 / img.height)
            ctx.drawImage(img, (tmpBubble.x - radius) / (radius * 2 / img.width), (tmpBubble.y - radius) / (radius * 2 / img.height))
            # ctx.drawImage(img, tmpBubble.x - radius, tmpBubble.y - radius)
            ctx.restore()
            ctx.globalCompositeOperation = 'source-over'
            ctx.fillText(tmpBubble.name, tmpBubble.x, tmpBubble.y)
            ctx.strokeText(tmpBubble.name, tmpBubble.x, tmpBubble.y)
            ctx.restore()
            ctx.closePath()
                
        _this.cache.animateSTO = setTimeout ->
            _this.animateBubble cvs
            return
        , 20
        return
        
    # 判断当前坐标是否在气泡中
    inBubble: (x, y) ->
        _this = this
        bubbles = _this.cache.reverseBubbles || []
            
        for i in [0...bubbles.length]
            dx = bubbles[i].x - x
            dy = bubbles[i].y - y
            distance = Math.sqrt dx*dx + dy*dy
            
            if distance <= _this.config.radius
                _this.cache.curBubble = bubbles[i]
                return true
        return false
        
    # 设置鼠标样式
    setCursor: (x, y, cvs) ->
        if this.inBubble x, y
            cursor = 'pointer'
        else
            cursor = 'default'
        cvs.style.cursor = cursor
        return
        
    # 事件绑定
    bind: (cvs) ->
        _this = this
        body = doc.body
        
        body.addEventListener 'mousemove', (ev) ->
            x = _this.cache.clientX = ev.clientX
            y = _this.cache.clientY = ev.clientY
                
            _this.setCursor x, y, cvs
            return
        
        body.addEventListener 'mousedown', (ev) ->
            x = ev.clientX
            y = ev.clientY
            if _this.inBubble(x, y) && _this.cache.bubbles.length isnt 0
                win.location.href = _this.cache.curBubble.url
            else
                _this.restart cvs
            return
        
        body.addEventListener 'keydown', ->
            _this.restart cvs
            return
        
        win.addEventListener 'scroll', ->
            _this.restart cvs
            return
        
        win.addEventListener 'resize', ->
            _this.fullCvs cvs
            _this.restart cvs
            return
        return