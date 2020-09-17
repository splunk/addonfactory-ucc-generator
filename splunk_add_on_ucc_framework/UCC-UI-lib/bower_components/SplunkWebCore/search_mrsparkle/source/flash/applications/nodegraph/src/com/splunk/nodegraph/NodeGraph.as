package com.splunk.nodegraph
{
	
	import com.splunk.nodegraph.actions.IAction;
	import com.splunk.nodegraph.renderers.DefaultEdgeRenderer;
	import com.splunk.nodegraph.renderers.DefaultNodeRenderer;
	
	import flare.animate.Easing;
	import flare.animate.Transitioner;
	import flare.vis.Visualization;
	import flare.vis.data.Data;
	import flare.vis.data.DataSprite;
	import flare.vis.data.EdgeSprite;
	import flare.vis.data.NodeSprite;
	import flare.vis.data.render.IRenderer;
	import flare.vis.operator.layout.CircleLayout;
	import flare.vis.operator.layout.ForceDirectedLayout;
	import flare.vis.operator.layout.RadialTreeLayout;
	import flare.vis.operator.layout.RandomLayout;
	
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	import flash.geom.Rectangle;
	
	public class NodeGraph extends Sprite
	{
		
		// Private Properties
		
		private var _defaultNodeRenderer:IRenderer;
		private var _defaultEdgeRenderer:IRenderer;
		private var _defaultNodeAction:IAction;
		private var _defaultEdgeAction:IAction;
		private var _nodeRules:Array;
		private var _edgeRules:Array;
		
		private var _nodes:Object;
		private var _data:Data;
		private var _layout1:RadialTreeLayout;
		private var _layout2:ForceDirectedLayout;
		private var _layout3:RandomLayout;
		private var _vis:Visualization;
		private var _transitioner:Transitioner;
		
		// Constructor
		
		public function NodeGraph()
		{
			this._defaultNodeRenderer = new DefaultNodeRenderer();
			this._defaultEdgeRenderer = new DefaultEdgeRenderer();
			
			this._nodes = new Object();
			
			this._data = new Data(true);
			
			this._layout1 = new RadialTreeLayout(100, true, true);
			//this._layout1.autoScale = false;
			//this._layout1.useNodeSize = true;
			//this._layout1.radiusIncrement = 30;
			
			this._layout2 = new ForceDirectedLayout(false, 1, null);
			//this._layout2.layoutBounds = new Rectangle(-400, -300, 800, 600);
			//this._layout2.defaultParticleMass = 1;
			this._layout2.defaultSpringLength = 100;
			this._layout2.defaultSpringTension = 0;
			//this._layout2.enforceBounds = false;
			
			this._layout3 = new RandomLayout();
			this._layout3.layoutBounds = new Rectangle(-400, -300, 800, 600);
			
			//var layout:NodeLinkTreeLayout = new NodeLinkTreeLayout(Orientation.TOP_TO_BOTTOM, 50, 5, 25);
			//var layout:IndentedTreeLayout = new IndentedTreeLayout(50, 5);
			var layout:CircleLayout = new CircleLayout();
			layout.layoutBounds = new Rectangle(0, 0, 500, 500);
			
			this._vis = new Visualization(null, null);
			this._vis.x = 40;
			this._vis.y = 0;
			//this._vis.continuousUpdates = true;
			this._vis.data = this._data;
			this._vis.operators.add(layout);
			this._vis.addEventListener(MouseEvent.CLICK, this._vis_click);
			
			this._transitioner = new Transitioner(0.5, Easing.easeInOutPoly(2));
			
			this.addChild(this._vis);
		}
		
		// Public Getters/Setters
		
		public function get defaultNodeRenderer() : IRenderer
		{
			return this._defaultNodeRenderer;
		}
		public function set defaultNodeRenderer(value:IRenderer) : void
		{
			this._defaultNodeRenderer = value;
		}
		
		public function get defaultEdgeRenderer() : IRenderer
		{
			return this._defaultEdgeRenderer;
		}
		public function set defaultEdgeRenderer(value:IRenderer) : void
		{
			this._defaultEdgeRenderer = value;
		}
		
		public function get defaultNodeAction() : IAction
		{
			return this._defaultNodeAction;
		}
		public function set defaultNodeAction(value:IAction) : void
		{
			this._defaultNodeAction = value;
		}
		
		public function get defaultEdgeAction() : IAction
		{
			return this._defaultEdgeAction;
		}
		public function set defaultEdgeAction(value:IAction) : void
		{
			this._defaultEdgeAction = value;
		}
		
		public function get nodeRules() : Array
		{
			return this._nodeRules;
		}
		public function set nodeRules(value:Array) : void
		{
			this._nodeRules = value;
		}
		
		public function get edgeRules() : Array
		{
			return this._edgeRules;
		}
		public function set edgeRules(value:Array) : void
		{
			this._edgeRules = value;
		}
		
		// Public Methods
		
		public function connectNodes(nodeName1:String, nodeName2:String = null) : void
		{
			if (nodeName1 == null)
				throw new TypeError("Parameter nodeName1 must be non-null.");
			if (nodeName1.length == 0)
				throw new TypeError("Parameter nodeName1 must be non-empty.");
			
			this.addNode(nodeName1);
			if ((nodeName2 != null) && (nodeName2.length != 0))
			{
				this.addNode(nodeName2);
				this.addEdge(nodeName1, nodeName2);
			}
		}
		
		public function disconnectNodes(nodeName1:String, nodeName2:String = null) : Boolean
		{
			if (nodeName1 == null)
				throw new TypeError("Parameter nodeName1 must be non-null.");
			if (nodeName1.length == 0)
				throw new TypeError("Parameter nodeName1 must be non-empty.");
			
			if ((nodeName2 == null) || (nodeName2.length == 0))
				return (this.removeNode(nodeName1) != null);
			else
				return (this.removeEdge(nodeName1, nodeName2) != null);
		}
		
		public function setData(data:Object, nodeName1:String, nodeName2:String = null) : Boolean
		{
			if (data == null)
				throw new TypeError("Parameter data must be non-null");
			if (nodeName1 == null)
				throw new TypeError("Parameter nodeName1 must be non-null.");
			if (nodeName1.length == 0)
				throw new TypeError("Parameter nodeName1 must be non-empty.");
			
			var dataSprite:DataSprite;
			if ((nodeName2 == null) || (nodeName2.length == 0))
				dataSprite = this.getNode(nodeName1);
			else
				dataSprite = this.getEdge(nodeName1, nodeName2);
			
			if (dataSprite == null)
				return false;
			
			this._copyData(data, dataSprite);
			this._applyRules(dataSprite);
			
			return true;
		}
		
		public function addNode(nodeName:String) : NodeSprite
		{
			if (nodeName == null)
				throw new TypeError("Parameter nodeName must be non-null.");
			if (nodeName.length == 0)
				throw new TypeError("Parameter nodeName must be non-empty.");
			
			var nodeObject:Object = this._nodes[nodeName];
			if (nodeObject != null)
				return nodeObject.node;
			
			var node:NodeSprite = this._data.addNode({});
			node.name = nodeName;
			this._applyNodeRules(node);
			
			nodeObject = this._nodes[nodeName] = new Object();
			nodeObject.node = node;
			nodeObject.edgesTo = new Object();
			nodeObject.edgesFrom = new Object();
			
			this.update();
			
			return node;
		}
		
		public function removeNode(nodeName:String) : NodeSprite
		{
			if (nodeName == null)
				throw new TypeError("Parameter nodeName must be non-null.");
			if (nodeName.length == 0)
				throw new TypeError("Parameter nodeName must be non-empty.");
			
			var nodeObject:Object = this._nodes[nodeName];
			if (nodeObject == null)
				return null;
			
			for (var nodeNameTo:String in nodeObject.edgesTo)
				this.removeEdge(nodeName, nodeNameTo);
			for (var nodeNameFrom:String in nodeObject.edgesFrom)
				this.removeEdge(nodeNameFrom, nodeName);
			
			this._data.removeNode(nodeObject.node);
			
			delete this._nodes[nodeName];
			
			this.update();
			
			return nodeObject.node;
		}
		
		public function getNode(nodeName:String) : NodeSprite
		{
			if (nodeName == null)
				throw new TypeError("Parameter nodeName must be non-null.");
			if (nodeName.length == 0)
				throw new TypeError("Parameter nodeName must be non-empty.");
			
			var nodeObject:Object = this._nodes[nodeName];
			if (nodeObject == null)
				return null;
			
			return nodeObject.node;
		}
		
		public function getNodes() : Array
		{
			var nodes:Array = new Array();
			var collectNodes:Function = function(node:NodeSprite) : void
			{
				nodes.push(node);
			};
			this._data.nodes.visit(collectNodes);
			return nodes;
		}
		
		public function addEdge(nodeName1:String, nodeName2:String) : EdgeSprite
		{
			if (nodeName1 == null)
				throw new TypeError("Parameter nodeName1 must be non-null.");
			if (nodeName1.length == 0)
				throw new TypeError("Parameter nodeName1 must be non-empty.");
			if (nodeName2 == null)
				throw new TypeError("Parameter nodeName2 must be non-null.");
			if (nodeName2.length == 0)
				throw new TypeError("Parameter nodeName2 must be non-empty.");
			
			var nodeObject1:Object = this._nodes[nodeName1];
			if (nodeObject1 == null)
				return null;
			
			var nodeObject2:Object = this._nodes[nodeName2];
			if (nodeObject2 == null)
				return null;
			
			var edge:EdgeSprite = nodeObject1.edgesTo[nodeName2];
			if (edge != null)
				return edge;
			
			edge = this._data.addEdgeFor(nodeObject1.node, nodeObject2.node, true, {});
			this._applyEdgeRules(edge);
			
			nodeObject1.edgesTo[nodeName2] = edge;
			nodeObject2.edgesFrom[nodeName1] = edge;
			
			this.update();
			
			return edge;
		}
		
		public function removeEdge(nodeName1:String, nodeName2:String) : EdgeSprite
		{
			if (nodeName1 == null)
				throw new TypeError("Parameter nodeName1 must be non-null.");
			if (nodeName1.length == 0)
				throw new TypeError("Parameter nodeName1 must be non-empty.");
			if (nodeName2 == null)
				throw new TypeError("Parameter nodeName2 must be non-null.");
			if (nodeName2.length == 0)
				throw new TypeError("Parameter nodeName2 must be non-empty.");
			
			var nodeObject1:Object = this._nodes[nodeName1];
			if (nodeObject1 == null)
				return null;
			
			var nodeObject2:Object = this._nodes[nodeName2];
			if (nodeObject2 == null)
				return null;
			
			var edge:EdgeSprite = nodeObject1.edgesTo[nodeName2];
			if (edge == null)
				return null;
			
			this._data.removeEdge(edge);
			
			delete nodeObject1.edgesTo[nodeName2];
			delete nodeObject2.edgesFrom[nodeName1];
			
			this.update();
			
			return edge;
		}
		
		public function getEdge(nodeName1:String, nodeName2:String) : EdgeSprite
		{
			if (nodeName1 == null)
				throw new TypeError("Parameter nodeName1 must be non-null.");
			if (nodeName1.length == 0)
				throw new TypeError("Parameter nodeName1 must be non-empty.");
			if (nodeName2 == null)
				throw new TypeError("Parameter nodeName2 must be non-null.");
			if (nodeName2.length == 0)
				throw new TypeError("Parameter nodeName2 must be non-empty.");
			
			var nodeObject1:Object = this._nodes[nodeName1];
			if (nodeObject1 == null)
				return null;
			
			var edge:EdgeSprite = nodeObject1.edgesTo[nodeName2];
			if (edge == null)
				return null;
			
			return edge;
		}
		
		public function getEdges() : Array
		{
			var edges:Array = new Array();
			var collectEdges:Function = function(edge:EdgeSprite) : void
			{
				edges.push(edge);
			};
			this._data.edges.visit(collectEdges);
			return edges;
		}
		
		public function clear() : void
		{
			this._nodes = new Object();
			this._data.clear();
		}
		
		public function update() : void
		{
			this._transitioner.stop();
			this._transitioner.reset();
			this._vis.update(this._transitioner);
			this._transitioner.play();
		}
		
		// Private Methods
		
		private function _copyData(data:Object, sprite:DataSprite) : void
		{
			var spriteData:Object = sprite.data;
			for (var p:String in data)
				spriteData[p] = data[p];
		}
		
		private function _applyRules(sprite:DataSprite) : void
		{
			var node:NodeSprite = sprite as NodeSprite;
			if (node != null)
			{
				this._applyNodeRules(node);
				return;
			}
			
			var edge:EdgeSprite = sprite as EdgeSprite;
			if (edge != null)
			{
				this._applyEdgeRules(edge);
				return;
			}
		}
		
		private function _applyNodeRules(node:NodeSprite) : void
		{
			for each (var rule:Rule in this._nodeRules)
			{
				if (rule.apply(node))
					return;
			}
			node.renderer = this._defaultNodeRenderer;
			node.props.action = this._defaultNodeAction;
		}
		
		private function _applyEdgeRules(edge:EdgeSprite) : void
		{
			for each (var rule:Rule in this._edgeRules)
			{
				if (rule.apply(edge))
					return;
			}
			edge.renderer = this._defaultEdgeRenderer;
			edge.props.action = this._defaultEdgeAction;
		}
		
		private function _vis_click(e:MouseEvent) : void
		{
			var sprite:DataSprite = e.target as DataSprite;
			if (sprite != null)
			{
				var action:IAction = sprite.props.action as IAction;
				if (action != null)
					action.exec(sprite);
			}
		}
		
	}
	
}
