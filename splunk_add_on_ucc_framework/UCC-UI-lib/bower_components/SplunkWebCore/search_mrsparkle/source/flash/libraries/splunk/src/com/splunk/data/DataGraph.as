package com.splunk.data
{

	import com.jasongatt.core.ChangedEvent;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public class DataGraph extends EventDispatcher implements IDataGraph
	{

		// Private Properties

		private var _nodeData:GraphDataMap;
		private var _edgeData:GraphDataMap;

		private var _nodes:Dictionary;
		private var _edges:Dictionary;

		// Constructor

		public function DataGraph()
		{
			this._nodeData = new GraphDataMap();
			this._nodeData.addEventListener(ChangedEvent.CHANGED, this._graphDataMap_changed, false, int.MIN_VALUE);

			this._edgeData = new GraphDataMap();
			this._edgeData.addEventListener(ChangedEvent.CHANGED, this._graphDataMap_changed, false, int.MIN_VALUE);

			this._nodes = new Dictionary();
			this._edges = new Dictionary();
		}

		// Public Getters/Setters

		public function get nodeData() : IDataMap
		{
			return this._nodeData;
		}

		public function get edgeData() : IDataMap
		{
			return this._edgeData;
		}

		// Public Methods

		public function addNode(node:*) : void
		{
			if (node == null)
				throw new TypeError("Parameter node must be non-null.");

			var nodes:Dictionary = this._nodes;
			if (nodes[node])
				throw new ArgumentError("The supplied node is already contained in this graph.");

			nodes[node] = new NodeInfo();

			this._nodeData.internalAddKey(node);

			this.dispatchEvent(new DataGraphChangedEvent(ChangedEvent.CHANGED, false, false, this, DataGraphChangedEvent.ADD, node));
		}

		public function addEdge(edge:*, sourceNode:*, targetNode:*, isDirected:Boolean = true) : void
		{
			if (edge == null)
				throw new TypeError("Parameter edge must be non-null.");
			if (sourceNode == null)
				throw new TypeError("Parameter sourceNode must be non-null.");
			if (targetNode == null)
				throw new TypeError("Parameter targetNode must be non-null.");

			var edges:Dictionary = this._edges;
			if (edges[edge])
				throw new ArgumentError("The supplied edge is already contained in this graph.");

			var nodes:Dictionary = this._nodes;

			var sourceNodeInfo:NodeInfo = nodes[sourceNode];
			if (!sourceNodeInfo)
			{
				this.addNode(sourceNode);
				sourceNodeInfo = nodes[sourceNode];
			}

			var targetNodeInfo:NodeInfo = nodes[targetNode];
			if (!targetNodeInfo)
			{
				this.addNode(targetNode);
				targetNodeInfo = nodes[targetNode];
			}

			edges[edge] = new EdgeInfo(sourceNode, targetNode, isDirected);

			sourceNodeInfo.outEdges[edge] = edge;
			targetNodeInfo.inEdges[edge] = edge;

			if (!isDirected)
			{
				sourceNodeInfo.inEdges[edge] = edge;
				targetNodeInfo.outEdges[edge] = edge;
			}

			this._edgeData.internalAddKey(edge);

			this.dispatchEvent(new DataGraphChangedEvent(ChangedEvent.CHANGED, false, false, this, DataGraphChangedEvent.ADD, null, edge));
		}

		public function removeNode(node:*) : void
		{
			if (node == null)
				throw new TypeError("Parameter node must be non-null.");

			var nodes:Dictionary = this._nodes;
			var nodeInfo:NodeInfo = nodes[node];
			if (!nodeInfo)
				throw new ArgumentError("The supplied node must be contained in this graph.");

			var edge:*;
			var removeEdges:Array;

			removeEdges = new Array();
			for (edge in nodeInfo.inEdges)
				removeEdges.push(edge);
			for each (edge in removeEdges)
				this.removeEdge(edge);

			removeEdges = new Array();
			for (edge in nodeInfo.outEdges)
				removeEdges.push(edge);
			for each (edge in removeEdges)
				this.removeEdge(edge);

			delete nodes[node];

			this._nodeData.internalRemoveKey(node);

			this.dispatchEvent(new DataGraphChangedEvent(ChangedEvent.CHANGED, false, false, this, DataGraphChangedEvent.REMOVE, node));
		}

		public function removeEdge(edge:*) : void
		{
			if (edge == null)
				throw new TypeError("Parameter edge must be non-null.");

			var edges:Dictionary = this._edges;
			var edgeInfo:EdgeInfo = edges[edge];
			if (!edgeInfo)
				throw new ArgumentError("The supplied edge must be contained in this graph.");

			var nodes:Dictionary = this._nodes;
			var sourceNodeInfo:NodeInfo = nodes[edgeInfo.sourceNode];
			var targetNodeInfo:NodeInfo = nodes[edgeInfo.targetNode];

			delete sourceNodeInfo.outEdges[edge];
			delete targetNodeInfo.inEdges[edge];

			if (!edgeInfo.isDirected)
			{
				delete sourceNodeInfo.inEdges[edge];
				delete targetNodeInfo.outEdges[edge];
			}

			delete edges[edge];

			this._edgeData.internalRemoveKey(edge);

			this.dispatchEvent(new DataGraphChangedEvent(ChangedEvent.CHANGED, false, false, this, DataGraphChangedEvent.REMOVE, null, edge));
		}

		public function containsNode(node:*) : Boolean
		{
			if (node == null)
				throw new TypeError("Parameter node must be non-null.");

			return (this._nodes[node] != null);
		}

		public function containsEdge(edge:*) : Boolean
		{
			if (edge == null)
				throw new TypeError("Parameter edge must be non-null.");

			return (this._edges[edge] != null);
		}

		public function getNodes() : Array
		{
			var nodes:Array = new Array();
			for (var node:* in this._nodes)
				nodes.push(node);
			return nodes;
		}

		public function getEdges() : Array
		{
			var edges:Array = new Array();
			for (var edge:* in this._edges)
				edges.push(edge);
			return edges;
		}

		public function getInEdges(node:*) : Array
		{
			if (node == null)
				throw new TypeError("Parameter node must be non-null.");

			var nodeInfo:NodeInfo = this._nodes[node];
			if (!nodeInfo)
				throw new ArgumentError("The supplied node must be contained in this graph.");

			var edges:Array = new Array();
			for (var edge:* in nodeInfo.inEdges)
				edges.push(edge);
			return edges;
		}

		public function getOutEdges(node:*) : Array
		{
			if (node == null)
				throw new TypeError("Parameter node must be non-null.");

			var nodeInfo:NodeInfo = this._nodes[node];
			if (!nodeInfo)
				throw new ArgumentError("The supplied node must be contained in this graph.");

			var edges:Array = new Array();
			for (var edge:* in nodeInfo.outEdges)
				edges.push(edge);
			return edges;
		}

		public function getSourceNode(edge:*) : *
		{
			if (edge == null)
				throw new TypeError("Parameter edge must be non-null.");

			var edgeInfo:EdgeInfo = this._edges[edge];
			if (!edgeInfo)
				throw new ArgumentError("The supplied edge must be contained in this graph.");

			return edgeInfo.sourceNode;
		}

		public function getTargetNode(edge:*) : *
		{
			if (edge == null)
				throw new TypeError("Parameter edge must be non-null.");

			var edgeInfo:EdgeInfo = this._edges[edge];
			if (!edgeInfo)
				throw new ArgumentError("The supplied edge must be contained in this graph.");

			return edgeInfo.targetNode;
		}

		public function isDirected(edge:*) : Boolean
		{
			if (edge == null)
				throw new TypeError("Parameter edge must be non-null.");

			var edgeInfo:EdgeInfo = this._edges[edge];
			if (!edgeInfo)
				throw new ArgumentError("The supplied edge must be contained in this graph.");

			return edgeInfo.isDirected;
		}

		// Private Methods

		private function _graphDataMap_changed(e:ChangedEvent) : void
		{
			if (this.hasEventListener(e.type))
				this.dispatchEvent(e);
		}

	}

}

import com.splunk.data.DataMap;
import flash.errors.IllegalOperationError;
import flash.utils.Dictionary;

class GraphDataMap extends DataMap
{

	// Constructor

	public function GraphDataMap()
	{
	}

	// Public Methods

	public override function addKey(key:*) : void
	{
		throw new IllegalOperationError("Unsupported method addKey.");
	}

	public override function removeKey(key:*) : void
	{
		throw new IllegalOperationError("Unsupported method removeKey.");
	}

	// Internal Methods

	internal function internalAddKey(key:*) : void
	{
		super.addKey(key);
	}

	internal function internalRemoveKey(key:*) : void
	{
		super.removeKey(key);
	}

}

class NodeInfo
{

	// Public Properties

	public var inEdges:Dictionary;
	public var outEdges:Dictionary;

	// Constructor

	public function NodeInfo()
	{
		this.inEdges = new Dictionary();
		this.outEdges = new Dictionary();
	}

}

class EdgeInfo
{

	// Public Properties

	public var sourceNode:*;
	public var targetNode:*;
	public var isDirected:Boolean;

	// Constructor

	public function EdgeInfo(sourceNode:*, targetNode:*, isDirected:Boolean)
	{
		this.sourceNode = sourceNode;
		this.targetNode = targetNode;
		this.isDirected = isDirected;
	}

}
