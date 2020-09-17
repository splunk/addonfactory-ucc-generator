package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.display.Graphics;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;
	import flash.geom.Point;

	public /*abstract*/ class AbstractShape extends ObservableObject implements IShape
	{

		// Private Static Properties

		private static var _passThroughBrush:PassThroughBrush;
		private static var _offsetBrush:OffsetBrush;
		private static var _matrixBrush:MatrixBrush;

		// Private Properties

		private var _snap:ObservableProperty;

		// Constructor

		public function AbstractShape()
		{
			if (!AbstractShape._passThroughBrush)
			{
				AbstractShape._passThroughBrush = new PassThroughBrush();
				AbstractShape._offsetBrush = new OffsetBrush();
				AbstractShape._matrixBrush = new MatrixBrush();
			}

			this._snap = new ObservableProperty(this, "snap", Boolean, false);
		}

		// Public Getters/Setters

		public function get snap() : Boolean
		{
			return this._snap.value;
		}
		public function set snap(value:Boolean) : void
		{
			this._snap.value = value;
		}

		// Public Methods

		public function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, brush:IBrush = null, matrix:Matrix = null, bounds:Array = null) : void
		{
			if (!graphics)
				throw new TypeError("Parameter graphics must be non-null.");

			if (!brush)
				brush = AbstractShape._passThroughBrush;

			if (matrix)
				matrix = matrix.clone();

			if (width < 0)
			{
				x += width;
				width = -width;
				if (!matrix)
					matrix = new Matrix();
				matrix.scale(-1, 1);
			}

			if (height < 0)
			{
				y += height;
				height = -height;
				if (!matrix)
					matrix = new Matrix();
				matrix.scale(1, -1);
			}

			if (matrix)
			{
				var p1:Point = new Point(0, 0);
				var p2:Point = new Point(width, 0);
				var p3:Point = new Point(width, height);
				var p4:Point = new Point(0, height);

				p1 = matrix.transformPoint(p1);
				p2 = matrix.transformPoint(p2);
				p3 = matrix.transformPoint(p3);
				p4 = matrix.transformPoint(p4);

				var left:Number = Math.min(p1.x, p2.x, p3.x, p4.x);
				var top:Number = Math.min(p1.y, p2.y, p3.y, p4.y);

				matrix.translate(x - left, y - top);

				var matrixBrush:MatrixBrush = AbstractShape._matrixBrush;
				matrixBrush.brush = brush;
				matrixBrush.snap = this._snap.value;
				brush = matrixBrush;
			}
			else
			{
				var offsetBrush:OffsetBrush = AbstractShape._offsetBrush;
				offsetBrush.brush = brush;
				offsetBrush.offsetX = x;
				offsetBrush.offsetY = y;
				offsetBrush.snap = this._snap.value;
				brush = offsetBrush;
			}

			brush.beginBrush(graphics, matrix, bounds);
			this.drawOverride(width, height, brush);
			brush.endBrush();
		}

		// Protected Methods

		protected function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
		}

	}

}

import com.jasongatt.graphics.brushes.AbstractBrush;
import com.jasongatt.graphics.brushes.CurveToInstruction;
import com.jasongatt.graphics.brushes.IBrush;
import com.jasongatt.graphics.brushes.LineToInstruction;
import com.jasongatt.graphics.brushes.MoveToInstruction;
import flash.display.Graphics;
import flash.geom.Matrix;
import flash.geom.Point;

class PassThroughBrush extends AbstractBrush
{

	// Constructor

	public function PassThroughBrush()
	{
	}

	// Protected Methods

	protected override function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
	{
		for each (var instruction:* in instructions)
		{
			if (instruction is MoveToInstruction)
				graphics.moveTo(instruction.x, instruction.y);
			else if (instruction is LineToInstruction)
				graphics.lineTo(instruction.x, instruction.y);
			else if (instruction is CurveToInstruction)
				graphics.curveTo(instruction.controlX, instruction.controlY, instruction.anchorX, instruction.anchorY);
		}
	}

}

class OffsetBrush extends AbstractBrush
{

	// Public Properties

	public var brush:IBrush;
	public var offsetX:Number = 0;
	public var offsetY:Number = 0;
	public var snap:Boolean = false;

	// Constructor

	public function OffsetBrush()
	{
	}

	// Protected Methods

	protected override function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
	{
		var brush:IBrush = this.brush;
		if (!brush)
			return;

		var offsetX:Number = this.offsetX;
		var offsteY:Number = this.offsetY;
		var snap:Boolean = this.snap;

		brush.beginBrush(graphics, matrix, bounds);
		for each (var instruction:* in instructions)
		{
			if (instruction is MoveToInstruction)
			{
				if (snap)
					brush.moveTo(Math.round(offsetX + instruction.x), Math.round(offsetY + instruction.y));
				else
					brush.moveTo(offsetX + instruction.x, offsetY + instruction.y);
			}
			else if (instruction is LineToInstruction)
			{
				if (snap)
					brush.lineTo(Math.round(offsetX + instruction.x), Math.round(offsetY + instruction.y));
				else
					brush.lineTo(offsetX + instruction.x, offsetY + instruction.y);
			}
			else if (instruction is CurveToInstruction)
			{
				if (snap)
					brush.curveTo(Math.round(offsetX + instruction.controlX), Math.round(offsetY + instruction.controlY), Math.round(offsetX + instruction.anchorX), Math.round(offsetY + instruction.anchorY));
				else
					brush.curveTo(offsetX + instruction.controlX, offsetY + instruction.controlY, offsetX + instruction.anchorX, offsetY + instruction.anchorY);
			}
		}
		brush.endBrush();

		this.brush = null;
	}

}

class MatrixBrush extends AbstractBrush
{

	// Public Properties

	public var brush:IBrush;
	public var snap:Boolean = false;

	// Constructor

	public function MatrixBrush()
	{
	}

	// Protected Methods

	protected override function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
	{
		var brush:IBrush = this.brush;
		if (!brush)
			return;

		var snap:Boolean = this.snap;

		if (!matrix)
			matrix = new Matrix();

		var p1:Point;
		var p2:Point;

		brush.beginBrush(graphics, matrix, bounds);
		for each (var instruction:* in instructions)
		{
			if (instruction is MoveToInstruction)
			{
				p1 = matrix.transformPoint(new Point(instruction.x, instruction.y));
				if (snap)
					brush.moveTo(Math.round(p1.x), Math.round(p1.y));
				else
					brush.moveTo(p1.x, p1.y);
			}
			else if (instruction is LineToInstruction)
			{
				p1 = matrix.transformPoint(new Point(instruction.x, instruction.y));
				if (snap)
					brush.lineTo(Math.round(p1.x), Math.round(p1.y));
				else
					brush.lineTo(p1.x, p1.y);
			}
			else if (instruction is CurveToInstruction)
			{
				p1 = matrix.transformPoint(new Point(instruction.controlX, instruction.controlY));
				p2 = matrix.transformPoint(new Point(instruction.anchorX, instruction.anchorY));
				if (snap)
					brush.curveTo(Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y));
				else
					brush.curveTo(p1.x, p1.y, p2.x, p2.y);
			}
		}
		brush.endBrush();

		this.brush = null;
	}

}
