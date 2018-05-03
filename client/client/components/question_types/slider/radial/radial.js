module.exports = function(target, options){

    var returnable =  {
        colors: {
            red: [210, 98, 112],
            orange: [228, 146, 78],
            yellow: [240, 204, 91],
            green: [148, 196, 85],
            blue: [101, 165, 163]
            },
        init: function(){

            var width = options.width || 600;
            self.target = target;
            var renderer = PIXI.autoDetectRenderer(width, width*0.9583, {transparent: true}, true);
            self.renderer = renderer;
            renderer.plugins.interaction.autoPreventDefault = false

            target.append(renderer.view)
            // create the root of the scene graph
            self.stage = new PIXI.Container();
            self.radius = width/2.6;
            self.circleOrigo = {x: width/2, y: width/2}

            var stage = self.stage;
            var radius = self.radius;
            var circleOrigo = self.circleOrigo;
            var circleLineWidth = Math.ceil(width*0.015)
            self.circleLineWidth = circleLineWidth;
            var smallCircleRadius = Math.floor(width*0.1)
            self.smallCircleRadius = smallCircleRadius;

            var hiddenSectorSize = 0.6
            self.hiddenSectorSize = hiddenSectorSize;

            var dialEndPoint = {x: circleOrigo.x + radius*hiddenSectorSize, y: Math.floor(circleOrigo.y + Math.sqrt(Math.pow(radius, 2) + Math.pow(radius*hiddenSectorSize, 2)))-smallCircleRadius}
            var dialStartPoint = {x: circleOrigo.x - radius*hiddenSectorSize, y: dialEndPoint.y}

            self.dialStartPoint = dialStartPoint;

            var bigCircleGraphic = new PIXI.Graphics();
            bigCircleGraphic.beginFill(0xFFFFFF, 0);
            bigCircleGraphic.lineStyle(circleLineWidth, 0xFF3300);
            bigCircleGraphic.drawCircle(circleOrigo.x, circleOrigo.y, radius);
            bigCircleGraphic.endFill();
            stage.addChild(bigCircleGraphic)
            self.bigCircleGraphic = bigCircleGraphic;

            var maskTriangle = new PIXI.Graphics();
            maskTriangle.beginFill();
            maskTriangle.moveTo(circleOrigo.x, circleOrigo.y)
            maskTriangle.lineTo(circleOrigo.x-radius*hiddenSectorSize, circleOrigo.y+radius+width/10)
            maskTriangle.lineTo(0, circleOrigo.y+radius+width/10)
            maskTriangle.lineTo(0, 0)
            maskTriangle.lineTo(width, 0)
            maskTriangle.lineTo(width, width)
            maskTriangle.lineTo(circleOrigo.x+radius*hiddenSectorSize, circleOrigo.y+radius+width/10)
            maskTriangle.lineTo(circleOrigo.x, circleOrigo.y)
            maskTriangle.endFill;
            stage.addChild(maskTriangle)
            bigCircleGraphic.mask = maskTriangle;

            var smallCircleGraphic = new PIXI.Graphics();
            smallCircleGraphic.beginFill(0xFFFFFF);
            smallCircleGraphic.lineStyle(circleLineWidth, 0xFF3300);
            smallCircleGraphic.drawCircle(circleOrigo.x+radius, circleOrigo.y+radius, smallCircleRadius); // drawCircle(x, y, radius)
            smallCircleGraphic.endFill();
            var smallCircleTexture = smallCircleGraphic.generateTexture()
            self.smallCircleGraphic = smallCircleGraphic;


            var dial = new PIXI.Sprite(smallCircleTexture);
            dial.interactive = true;
            dial.buttonMode = true;
            dial.anchor.set(0.5);

            dial.position.x = circleOrigo.x - radius;
            dial.position.y = circleOrigo.y;


            // adds event listeners to dial. the events are found at the bottom of this file
            _.forEach(self.events, function(fn, event){
              dial.on(event, fn);
            })



            stage.addChild(dial);
            self.dial = dial;
            self.renderer.render(self.stage);

        },

        destroy: function(){
          _.forEach(self.events, function(fn, event){
            self.dial.off(event, fn);
          })

          var number = self.target.find('.number');
          number.attr("data", "");
          number.text("0")
          number.css("color", "inherit")
        },

        _onDragStart: function(event){
             // store a reference to the data
            // the reason for this is because of multitouch
            // we want to track the movement of this particular touch
            this.data = event.data;
            this.dragging = true;
            PubSub.publish('SLIDER_DRAGMOVE_START')
        },

        _onDragEnd: function(){
            this.dragging = false;
            // set the interaction data to null
            this.data = null;
            PubSub.publish('SLIDER_DRAGMOVE_END')
        },

        _onDragMove: function(e){
            if (this.dragging){
                var newPosition = this.data.getLocalPosition(this.parent);
                var posOnCircle = self._getClosestPointToCircle(self.circleOrigo, self.radius, newPosition.x, newPosition.y)
                if(posOnCircle){
                  this.position.x = posOnCircle.x;
                  this.position.y = posOnCircle.y;
                  self._updateColor(this)
                  self._updateNumber()
                }
          }

        },

        _getClosestPointToCircle: function(circleCenter, cRadius, x, y){
            var newX = circleCenter.x + (cRadius * (( x- circleCenter.x ) / Math.sqrt(Math.pow(x-circleCenter.x, 2) + Math.pow(y-circleCenter.y, 2))))
            var newY = circleCenter.y + (cRadius * (( y- circleCenter.y ) / Math.sqrt(Math.pow(x-circleCenter.x, 2) + Math.pow(y-circleCenter.y, 2))))
          //  if(newX > (circleCenter.x - cRadius* self.hiddenSectorSize) && newX < circleCenter.x + cRadius*self.hiddenSectorSize && newY > circleCenter.y) return false
            if(newY > self.dialStartPoint.y) return false;
            return {x: Math.floor(newX), y: Math.floor(newY)}
        },

        _updateColor: function(dialObject){
            var x = dialObject.position.x;
            var y = dialObject.position.y;

            var progress = self._getDialProgress(dialObject);
            var color = self._rgb2hex(self._getColorFromProgress(progress))

            self.bigCircleGraphic.clear();
            self.bigCircleGraphic.beginFill(0xFFFFFF, 0);
            self.bigCircleGraphic.lineStyle(self.circleLineWidth, color);
            self.bigCircleGraphic.drawCircle(self.circleOrigo.x, self.circleOrigo.y, self.radius);
            self.bigCircleGraphic.endFill();

            self.smallCircleGraphic.clear()
            self.smallCircleGraphic.beginFill(0xFFFFFF); // Red
            self.smallCircleGraphic.lineStyle(self.circleLineWidth, color);
            self.smallCircleGraphic.drawCircle(x, y, self.smallCircleRadius); // drawCircle(x, y, radius)
            self.smallCircleGraphic.endFill();
            dialObject.texture = self.smallCircleGraphic.generateTexture();

            self.renderer.render(self.stage);
        },

        _rgb2hex: function(rgb){
             rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
             var j= (rgb && rgb.length === 4) ? "0x" +
              ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
              ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
              ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
              return parseInt(j)
        },

        _getDialProgress: function(dialObject){
            var x = dialObject.position.x;
            var y = dialObject.position.y;

            var yMin = self.dialStartPoint.y
            var yMax = self.circleOrigo.y - self.radius;
            var range = yMin-yMax;
            var divider = range / -50;

            if(x <= self.circleOrigo.x){
                    var percentage = Math.ceil((y - yMin)/divider)

            } else {
                  var percentage = Math.ceil(50 - (y - yMax)/divider)
            }

            return percentage
        },

        _getColorFromProgress: function(i){
            var color;

            if (i <= 25) color = self._fadeTwoColors(self.colors.red, self.colors.orange, 0, 25, i)
            else if (i > 25 && i <= 50) color = self._fadeTwoColors(self.colors.orange, self.colors.yellow, 25, 50, i)
            else if (i > 50 && i <= 75) color = self._fadeTwoColors(self.colors.yellow, self.colors.green, 50, 75, i)
            else if (i > 75) color = self._fadeTwoColors(self.colors.green, self.colors.blue, 75, 100, i)

            return color
        },

        _fadeTwoColors: function(fromArr, toArr, min, max, val){
            var range = max - min;
            var newVal = val - min

            var rRange = toArr[0] - fromArr[0]
            var rMultiplier = rRange/range
            var rVal = newVal*rMultiplier

            var gRange = toArr[1] - fromArr[1]
            var gMultiplier = gRange/range
            var gVal = newVal * gMultiplier

            var bRange = toArr[2] - fromArr[2]
            var bMultiplier = bRange/range
            var bVal = newVal * bMultiplier

            return "rgba(" + Math.floor(fromArr[0] + rVal) + ", " + Math.floor(fromArr[1] + gVal) + ", " + Math.floor(fromArr[2] + bVal) + ", 1)"
        },

        getValue: function(){
            return self._getDialProgress(self.dial)
        },

        _updateNumber: function() {
            var number = self.target.find('.number')
            var value = self.getValue();
            number.text(Math.round( value / 10))
            number.attr("data", value )
            number.css("color", self._getColorFromProgress(value))
        }

    }

    var self = returnable;
    self.events = {
      'mousedown' : self._onDragStart,
      'touchstart': self._onDragStart,
      'mouseup': self._onDragEnd,
      'mouseupoutside': self._onDragEnd,
      'touchend': self._onDragEnd,
      'touchendoutside': self._onDragEnd,
      'mousemove': self._onDragMove,
      'touchmove': self._onDragMove
    }
    return returnable;

}
