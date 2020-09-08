package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.geom.Point;

	public class PolygonShape extends AbstractShape
	{

		// Private Properties

		private var _vertices:ObservableProperty;

		private var _cachedVertices:Array;

		// Constructor

		public function PolygonShape(vertices:Array = null)
		{
			vertices = vertices ? vertices.concat() : new Array();

			this._vertices = new ObservableProperty(this, "vertices", Array, vertices);

			this._cachedVertices = vertices;
		}

		// Public Getters/Setters

		public function get vertices() : Array
		{
			return this._vertices.value.concat();
		}
		public function set vertices(value:Array) : void
		{
			this._vertices.value = this._cachedVertices = value ? value.concat() : new Array();
		}

		// Protected Methods

		protected override function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
			var vertices:Array = this._cachedVertices;
			var numVertices:int = vertices.length;

			if (numVertices < 3)
				return;

			var vertex:Point;

			vertex = vertices[0];
			brush.moveTo(width * vertex.x, height * vertex.y);
			for (var i:int = 1; i < numVertices; i++)
			{
				vertex = vertices[i];
				brush.lineTo(width * vertex.x, height * vertex.y);
			}
			vertex = vertices[0];
			brush.lineTo(width * vertex.x, height * vertex.y);
		}

	}

}
