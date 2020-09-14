The following Component is a visual component whose primary feature
is the 'goToHalfSize' method.

package controls {
    
    import flash.display.Sprite;
    import flash.events.Event;
    
    public class ViewComponent extends Sprite {
        
        private var _width:Number;
        private var _height:Number;
        
        public function ViewComponent() {
            _width = 640;
            _height = 480;
        }
        
        public function draw():void {
            graphics.clear();
            graphics.beginFill(0xFFCC00);
            graphics.drawRect(0, 0, width, height);
            graphics.endFill();
        }
        
        public function goToHalfSize():void {
            width = Math.round(width / 2);
            height = Math.round(height / 2);
            draw();
        }
        
        override public function set width(width:Number):void {
            _width = width;
        }

        override public function get width():Number {
            return _width;
        }

        override public function set height(height:Number):void {
            _height = height;
        }

        override public function get height():Number {
            return _height;
        }
    }
}
