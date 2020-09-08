package com.splunk.particles.controls
{

	import com.jasongatt.layout.LayoutSprite;
	import com.splunk.particles.IParticle;

	public interface IElementRenderer
	{

		// Methods

		function createElement(fieldValue:*) : LayoutSprite;
		function disposeElement(element:LayoutSprite) : void;
		function onParticleCollected(particle:IParticle, element:LayoutSprite) : void;

	}

}
