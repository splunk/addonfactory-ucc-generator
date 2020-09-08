package com.splunk.nodegraph.expressions
{
	
	public class Xor extends AbstractExpression
	{
		
		// Constructor
		
		public function Xor(...rest)
		{
			super(2, -1);
			
			this.addChildren(rest);
		}
		
		// Protected Methods
		
		protected override function evalChildren(children:Array, o:Object) : *
		{
			var isTrue:Boolean = false;
			for each (var child:AbstractExpression in children)
			{
				if (child.eval(o))
				{
					if (isTrue)
						return false;
					else
						isTrue = true;
				}
			}
			return isTrue;
		}
		
		protected override function toStringChildren(children:Array) : String
		{
			var str:String = "";
			for each (var child:AbstractExpression in children)
			{
				if (str == "")
					str += child.toString();
				else
					str += " xor " + child.toString();
			}
			return "(" + str + ")";
		}
		
	}
	
}
