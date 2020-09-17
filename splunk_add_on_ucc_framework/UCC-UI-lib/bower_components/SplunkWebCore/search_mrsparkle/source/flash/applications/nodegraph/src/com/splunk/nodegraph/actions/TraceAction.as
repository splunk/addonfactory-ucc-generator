package com.splunk.nodegraph.actions
{
	
	import flare.vis.data.DataSprite;
	
	public class TraceAction implements IAction
	{
		
		public var fieldName:String;
		
		public function TraceAction(fieldName:String = null)
		{
			this.fieldName = fieldName;
		}
		
		public function exec(sprite:DataSprite) : void
		{
			trace(sprite.data[this.fieldName]);
		}
		
	}
	
}
