package com.splunk.particles.actions
{

	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import com.splunk.particles.distributions.IDistribution2D;
	import flash.geom.Point;

	public class KillZoneAction implements IAction
	{

		// Public Properties

		public var zone:IDistribution2D;
		public var invert:Boolean;

		// Constructor

		public function KillZoneAction(zone:IDistribution2D = null, invert:Boolean = false)
		{
			this.zone = zone;
			this.invert = invert;
		}

		// Public Methods

		public function apply(particle:IParticle, time:Number) : void
		{
			var particle2D:IParticle2D = particle as IParticle2D;
			if (!particle2D)
				return;

			var zone:IDistribution2D = this.zone;
			if (!zone)
				return;

			if (zone.containsPoint(particle2D.position) != this.invert)
				particle2D.die = true;
		}

	}

}
