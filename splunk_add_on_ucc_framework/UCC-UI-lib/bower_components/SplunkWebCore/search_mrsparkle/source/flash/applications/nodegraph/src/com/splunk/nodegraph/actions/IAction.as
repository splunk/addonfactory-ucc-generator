package com.splunk.nodegraph.actions
{
	
	import flare.vis.data.DataSprite;
	
	public interface IAction
	{
		
		function exec(sprite:DataSprite) : void;
		
	}
	
}
