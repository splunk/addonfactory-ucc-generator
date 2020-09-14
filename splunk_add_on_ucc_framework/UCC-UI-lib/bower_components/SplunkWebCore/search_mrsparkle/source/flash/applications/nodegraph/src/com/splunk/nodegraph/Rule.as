package com.splunk.nodegraph
{
	
	import com.splunk.nodegraph.actions.IAction;
	import com.splunk.nodegraph.expressions.AbstractExpression;
	
	import flare.vis.data.DataSprite;
	import flare.vis.data.render.IRenderer;
	
	public class Rule
	{
		
		// Private Properties
		
		private var _condition:AbstractExpression;
		private var _renderer:IRenderer;
		private var _action:IAction;
		
		// Constructor
		
		public function Rule(condition:AbstractExpression, renderer:IRenderer, action:IAction)
		{
			this._condition = condition;
			this._renderer = renderer;
			this._action = action;
		}
		
		// Public Getters/Setters
		
		public function get condition() : AbstractExpression
		{
			return this._condition;
		}
		
		public function get renderer() : IRenderer
		{
			return this._renderer;
		}
		
		public function get action() : IAction
		{
			return this._action;
		}
		
		// Public Methods
		
		public function apply(dataSprite:DataSprite) : Boolean
		{
			if ((this._condition != null) && this._condition.eval(dataSprite.data))
			{
				dataSprite.renderer = this._renderer;
				dataSprite.props.action = this._action;
				dataSprite.render();
				return true;
			}
			return false;
		}
		
		public function toString() : String
		{
			return "[Rule condition=" + this._condition + " renderer=" + this._renderer+ " action=" + this._action + "]";
		}
		
	}
	
}
