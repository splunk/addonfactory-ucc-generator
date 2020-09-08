package com.splunk.particles.controls
{

	import com.jasongatt.core.IObservable;
	import com.jasongatt.core.ValidateObject;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.utils.LinkedList;
	import com.splunk.particles.IParticle;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public /*abstract*/ class AbstractElementRenderer extends ValidateObject implements IObservable, IElementRenderer
	{

		// Public Static Constants

		public static const UPDATE_ELEMENTS:ValidatePass = new ValidatePass(AbstractElementRenderer, "updateElements", 0.1);

		// Private Properties

		private var _elements:LinkedList;

		// Constructor

		public function AbstractElementRenderer()
		{
			this._elements = new LinkedList();
		}

		// Public Methods

		public function updateElements() : void
		{
			this.validatePreceding(AbstractElementRenderer.UPDATE_ELEMENTS);

			if (this.isValid(AbstractElementRenderer.UPDATE_ELEMENTS))
				return;

			this.updateElementsOverride(this._elements.toArray());

			this.setValid(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

		public function createElement(fieldValue:*) : LayoutSprite
		{
			var element:LayoutSprite = this.createElementOverride(fieldValue);
			if (!element)
				return null;

			this._elements.addLast(element);

			return element;
		}

		public function disposeElement(element:LayoutSprite) : void
		{
			var elements:LinkedList = this._elements;
			if (!elements.contains(element))
				return;

			elements.remove(element);

			this.disposeElementOverride(element);
		}

		public function onParticleCollected(particle:IParticle, element:LayoutSprite) : void
		{
			if (!this._elements.contains(element))
				return;

			this.onParticleCollectedOverride(particle, element);
		}

		// Protected Methods

		protected function updateElementsOverride(elements:Array) : void
		{
		}

		protected function createElementOverride(fieldValue:*) : LayoutSprite
		{
			return null;
		}

		protected function disposeElementOverride(element:LayoutSprite) : void
		{
		}

		protected function onParticleCollectedOverride(particle:IParticle, element:LayoutSprite) : void
		{
		}

	}

}
