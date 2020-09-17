package com.splunk.nodegraph
{
	
	public class ConfigError extends Error
	{
		
		public function ConfigError(message:String = "")
		{
			super(message);
		}
		
		public function toString() : String
		{
			return "ConfigError: " + this.message;
		}
		
	}
	
}
