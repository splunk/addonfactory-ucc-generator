package com.jasongatt.utils
{

	import flash.utils.setTimeout;

	public final class ErrorUtil
	{

		// Public Static Methods

		public static function asyncThrow(e:Error) : void
		{
			setTimeout(function() : void { throw e; }, 0);
		}

	}

}
