package com.splunk.charting.labels
{

	import com.jasongatt.core.ObservableProperty;
	import com.splunk.charting.axes.CategoryAxis;
	import com.splunk.charting.axes.IAxis;

	public class CategoryAxisLabels extends AbstractAxisLabels
	{

		// Constructor

		public function CategoryAxisLabels()
		{
		}

		// Public Getters/Setters

		public override function set majorLabelAlignment(value:String) : void
		{
			super.majorLabelAlignment = value;
			this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
		}

		public override function set majorLabelVisibility(value:String) : void
		{
			super.majorLabelVisibility = value;
			this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
		}

		public override function set minorLabelAlignment(value:String) : void
		{
			super.minorLabelAlignment = value;
			this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
		}

		public override function set minorLabelVisibility(value:String) : void
		{
			super.minorLabelVisibility = value;
			this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
		}

		// Protected Methods

		protected override function updateAxisExtendedRangeOverride(axis:IAxis) : Array
		{
			var categoryAxis:CategoryAxis = axis as CategoryAxis;
			if (!categoryAxis)
				return null;

			var needsMinimumPadding:Boolean = false;
			var needsMaximumPadding:Boolean = false;

			if (super.majorLabelVisibility != LabelVisibility.HIDE)
			{
				switch (super.majorLabelAlignment)
				{
					case LabelAlignment.AFTER_TICK:
						needsMaximumPadding = true;
						break;
					case LabelAlignment.BEFORE_TICK:
						needsMinimumPadding = true;
						break;
				}
			}

			if (super.minorLabelVisibility != LabelVisibility.HIDE)
			{
				switch (super.minorLabelAlignment)
				{
					case LabelAlignment.AFTER_TICK:
						needsMaximumPadding = true;
						break;
					case LabelAlignment.BEFORE_TICK:
						needsMinimumPadding = true;
						break;
				}
			}

			if (needsMinimumPadding && needsMaximumPadding)
				return [ -1, categoryAxis.actualCategories.length ];
			else if (needsMinimumPadding)
				return [ -1 ];
			else if (needsMaximumPadding)
				return [ categoryAxis.actualCategories.length ];
			else
				return null;
		}

		protected override function computeTickAbsolutesOverride(axis:IAxis, majorTickAbsolutes:Array, minorTickAbsolutes:Array) : void
		{
			var maxMajorUnits:int = 50;

			var categoryAxis:CategoryAxis = axis as CategoryAxis;
			if (!categoryAxis)
				return;

			var majorUnit:int = 1;

			var categories:Array = categoryAxis.actualCategories;

			var numMajorUnits:int;
			var majorValue:String;
			var absolute:Number;

			if (categories.length == 0)
				return;

			// scale majorUnit if numMajorUnits is greater than maxMajorUnits
			numMajorUnits = categories.length;
			majorUnit *= Math.ceil(numMajorUnits / maxMajorUnits);

			// compute major absolutes
			for (var i:int = 0; i < numMajorUnits; i += majorUnit)
			{
				majorValue = categories[i];
				absolute = categoryAxis.valueToAbsolute(majorValue);
				majorTickAbsolutes.push(absolute);
			}
		}

		protected override function absoluteToValue(axis:IAxis, absolute:Number) : *
		{
			if (!(axis is CategoryAxis))
				return null;
			return super.absoluteToValue(axis, absolute);
		}

	}

}
