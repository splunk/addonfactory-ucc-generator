package com.splunk.data
{

	import com.jasongatt.core.IObservable;

	public interface IDataGraph extends IObservable
	{

		// Getters/Setters

		function get nodeData() : IDataMap;
		function get edgeData() : IDataMap;

		// Methods

		function addNode(node:*) : void;
		function addEdge(edge:*, sourceNode:*, targetNode:*, isDirected:Boolean = true) : void;
		function removeNode(node:*) : void;
		function removeEdge(edge:*) : void;
		function containsNode(node:*) : Boolean;
		function containsEdge(edge:*) : Boolean;
		function getNodes() : Array;
		function getEdges() : Array;
		function getInEdges(node:*) : Array;
		function getOutEdges(node:*) : Array;
		function getSourceNode(edge:*) : *;
		function getTargetNode(edge:*) : *;
		function isDirected(edge:*) : Boolean;

	}

}
