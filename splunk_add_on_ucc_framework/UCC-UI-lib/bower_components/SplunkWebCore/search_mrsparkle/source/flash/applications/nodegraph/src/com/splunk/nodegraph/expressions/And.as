package com.splunk.nodegraph.expressions
{
	
	public class And extends AbstractExpression
	{
		
		// Constructor
		
		public function And(...rest)
		{
			super(2, -1);
			
			this.addChildren(rest);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			for each (var child:AbstractExpression in children)
			{
				if (!child.eval(o))
					return false;
			}
			return true;
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var str:String = "";
			for each (var child:AbstractExpression in children)
			{
				if (str == "")
					str += child.toString();
				else
					str += " && " + child.toString();
			}
			return "(" + str + ")";
		}
		
	}
	
}
