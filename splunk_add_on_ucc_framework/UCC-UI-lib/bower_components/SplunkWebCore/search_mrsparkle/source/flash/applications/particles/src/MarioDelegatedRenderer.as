package
{

	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import com.splunk.particles.renderers.DelegatedRenderer;
	import flash.display.BitmapData;
	import flash.display.Graphics;
	import flash.geom.Matrix;
	import flash.geom.Point;

	public class MarioDelegatedRenderer extends DelegatedRenderer
	{

		// Private Properties

		private var _marioMode:Boolean = false;

		private var _fireImages:Array;
		private var _tick:int = 0;

		// Constructor

		public function MarioDelegatedRenderer()
		{
			var fireImage1:BitmapData = new mario_fire_ball(0, 0);

			var matrix:Matrix = new Matrix();
			matrix.rotate(Math.PI / 2);
			matrix.translate(fireImage1.width, 0);

			var fireImage2:BitmapData = new BitmapData(fireImage1.width, fireImage1.width, true, 0x00000000);
			fireImage2.draw(fireImage1, matrix);

			var fireImage3:BitmapData = new BitmapData(fireImage2.width, fireImage2.width, true, 0x00000000);
			fireImage3.draw(fireImage2, matrix);

			var fireImage4:BitmapData = new BitmapData(fireImage3.width, fireImage3.width, true, 0x00000000);
			fireImage4.draw(fireImage3, matrix);

			this._fireImages = [ fireImage1, fireImage2, fireImage3, fireImage4 ];
		}

		// Public Getters/Setters

		public function get marioMode() : Boolean
		{
			return this._marioMode;
		}
		public function set marioMode(value:Boolean) : void
		{
			this._marioMode = value;
		}

		// Protected Methods

		protected override function processParticlesOverride(particles:Array) : void
		{
			if (!this._marioMode)
			{
				super.processParticlesOverride(particles);
				return;
			}

			super.processParticlesOverride([]);
		}

		protected override function renderParticlesOverride(particles:Array, layoutWidth:Number, layoutHeight:Number) : void
		{
			var graphics:Graphics = this.graphics;
			graphics.clear();

			if (!this._marioMode)
			{
				super.renderParticlesOverride(particles, layoutWidth, layoutHeight);
				return;
			}

			var tick:int = this._tick;
			this._tick = ((tick + 1) < 8) ? tick + 1 : 0;

			var fireImages:Array = this._fireImages;
			var fireWidth:int = fireImages[0].width;
			var fireHeight:int = fireImages[0].height;
			var fireX:Number = Math.round(fireWidth / 2);
			var fireY:Number = Math.round(fireHeight / 2);
			var fireMatrix:Matrix = new Matrix();
			var fireImage:BitmapData;

			var numParticles:int = particles.length;
			var particle:IParticle;
			var particle2D:IParticle2D;
			var position:Point;

			for each (particle in particles)
			{
				particle2D = particle as IParticle2D;
				if (particle2D)
				{
					position = particle2D.position;

					fireMatrix.tx = Math.round(position.x - fireX);
					fireMatrix.ty = Math.round(position.y - fireY);

					fireImage = fireImages[Math.floor(tick / 2) % 4];

					graphics.beginBitmapFill(fireImage, fireMatrix);
					graphics.drawRect(fireMatrix.tx, fireMatrix.ty, fireWidth, fireHeight);
					graphics.endFill();
				}
			}
		}

	}

}
