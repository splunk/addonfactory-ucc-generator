package com.splunk.particles.filters
{

	import com.splunk.particles.IParticle;

	public class FieldFilter implements IFilter
	{

		// Public Properties

		public var fieldName:String;

		// Constructor

		public function FieldFilter(fieldName:String = null)
		{
			this.fieldName = fieldName;
		}

		// Public Methods

		public function contains(particle:IParticle) : Boolean
		{
			var data:Object = particle.metadata.data;
			if (!data)
				return false;

			var fieldValue:* = data[fieldName];
			if (fieldValue == null)
				return false;

			return true;
		}

	}

}
