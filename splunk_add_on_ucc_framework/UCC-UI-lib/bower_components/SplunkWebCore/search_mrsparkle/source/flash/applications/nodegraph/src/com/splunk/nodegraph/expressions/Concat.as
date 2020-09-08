package com.splunk.nodegraph.expressions
{
	
	public class Concat extends AbstractExpression
	{
		
		// Constructor
		
		public function Concat(...rest)
		{
			super(2, -1);
			
			this.addChildren(rest);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			var str:String = "";
			for each (var child:AbstractExpression in children)
				str += String(child.eval(o));
			return str;
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var str:String = "";
			for each (var child:AbstractExpression in children)
			{
				if (str == "")
					str += child.toString();
				else
					str += ", " + child.toString();
			}
			return "Concat(" + str + ")";
		}
		
	}
	
}
