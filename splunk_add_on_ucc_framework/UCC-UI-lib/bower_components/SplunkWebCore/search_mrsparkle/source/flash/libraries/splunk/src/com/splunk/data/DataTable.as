package com.splunk.data
{

	import com.jasongatt.core.ChangedEvent;
	import com.splunk.data.converters.IValueConverter;
	import flash.events.EventDispatcher;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public class DataTable extends EventDispatcher implements IDataTable
	{

		// Private Properties

		private var _numRows:int = 0;
		private var _numColumns:int = 0;

		private var _rows:Array;
		private var _columns:Array;

		// Constructor

		public function DataTable()
		{
			this._rows = new Array();
			this._columns = new Array();
		}

		// Public Getters/Setters

		public function get numRows() : int
		{
			return this._numRows;
		}

		public function get numColumns() : int
		{
			return this._numColumns;
		}

		// Public Methods

		public function addRow() : void
		{
			this.insertRow(this._numRows);
		}

		public function addColumn(columnName:String = null, defaultValue:* = null, valueConverter:IValueConverter = null) : void
		{
			this.insertColumn(this._numColumns, columnName, defaultValue, valueConverter);
		}

		public function insertRow(rowIndex:int) : void
		{
			if ((rowIndex < 0) || (rowIndex > this._numRows))
				throw new RangeError("Parameter rowIndex is out of range.");

			this._rows.splice(rowIndex, 0, new RowInfo());
			this._numRows++;

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.ADD, rowIndex));
		}

		public function insertColumn(columnIndex:int, columnName:String = null, defaultValue:* = null, valueConverter:IValueConverter = null) : void
		{
			if ((columnIndex < 0) || (columnIndex > this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			this._columns.splice(columnIndex, 0, new ColumnInfo(columnName, defaultValue, valueConverter));
			this._numColumns++;

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.ADD, -1, columnIndex));
		}

		public function removeRow(rowIndex:int) : void
		{
			if ((rowIndex < 0) || (rowIndex >= this._numRows))
				throw new RangeError("Parameter rowIndex is out of range.");

			this._rows.splice(rowIndex, 1);
			this._numRows--;

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.REMOVE, rowIndex));
		}

		public function removeColumn(columnIndex:int) : void
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var columns:Array = this._columns;
			var columnInfo:ColumnInfo = columns[columnIndex];

			for each (var rowInfo:RowInfo in this._rows)
				delete rowInfo.values[columnInfo];

			columns.splice(columnIndex, 1);
			this._numColumns--;

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.REMOVE, -1, columnIndex));
		}

		public function getColumnName(columnIndex:int) : String
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var columnInfo:ColumnInfo = this._columns[columnIndex];
			return columnInfo.columnName;
		}

		public function getDefaultValue(columnIndex:int) : *
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var columnInfo:ColumnInfo = this._columns[columnIndex];
			if (!columnInfo.hasConvertedDefaultValue)
			{
				columnInfo.convertedDefaultValue = columnInfo.valueConverter ? columnInfo.valueConverter.convertFrom(columnInfo.defaultValue) : columnInfo.defaultValue;
				columnInfo.hasConvertedDefaultValue = true;
			}
			return columnInfo.convertedDefaultValue;
		}

		public function getValueConverter(columnIndex:int) : IValueConverter
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var columnInfo:ColumnInfo = this._columns[columnIndex];
			return columnInfo.valueConverter;
		}

		public function getValue(rowIndex:int, columnIndex:int) : *
		{
			if ((rowIndex < 0) || (rowIndex >= this._numRows))
				throw new RangeError("Parameter rowIndex is out of range.");
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var rowInfo:RowInfo = this._rows[rowIndex];
			var columnInfo:ColumnInfo = this._columns[columnIndex];

			var valueInfo:ValueInfo = rowInfo.values[columnInfo];
			if (!valueInfo)
			{
				if (!columnInfo.hasConvertedDefaultValue)
				{
					columnInfo.convertedDefaultValue = columnInfo.valueConverter ? columnInfo.valueConverter.convertFrom(columnInfo.defaultValue) : columnInfo.defaultValue;
					columnInfo.hasConvertedDefaultValue = true;
				}
				return columnInfo.convertedDefaultValue;
			}

			if (!valueInfo.hasConvertedValue || (valueInfo.valueConverter != columnInfo.valueConverter))
			{
				valueInfo.valueConverter = columnInfo.valueConverter;
				valueInfo.convertedValue = valueInfo.valueConverter ? valueInfo.valueConverter.convertFrom(valueInfo.value) : valueInfo.value;
				valueInfo.hasConvertedValue = true;
			}
			return valueInfo.convertedValue;
		}

		public function setColumnName(columnIndex:int, columnName:String) : void
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var columnInfo:ColumnInfo = this._columns[columnIndex];

			if (columnName == columnInfo.columnName)
				return;

			columnInfo.columnName = columnName;

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.NAME, -1, columnIndex));
		}

		public function setDefaultValue(columnIndex:int, defaultValue:*) : void
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var columnInfo:ColumnInfo = this._columns[columnIndex];

			if (defaultValue === columnInfo.defaultValue)
				return;

			columnInfo.defaultValue = defaultValue;
			columnInfo.convertedDefaultValue = null;
			columnInfo.hasConvertedDefaultValue = false;

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.VALUE, -1, columnIndex));
		}

		public function setValueConverter(columnIndex:int, valueConverter:IValueConverter) : void
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var columnInfo:ColumnInfo = this._columns[columnIndex];

			if (valueConverter == columnInfo.valueConverter)
				return;

			columnInfo.valueConverter = valueConverter;
			columnInfo.convertedDefaultValue = null;
			columnInfo.hasConvertedDefaultValue = false;

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.VALUE, -1, columnIndex));
		}

		public function setValue(rowIndex:int, columnIndex:int, value:*) : void
		{
			if ((rowIndex < 0) || (rowIndex >= this._numRows))
				throw new RangeError("Parameter rowIndex is out of range.");
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var rowInfo:RowInfo = this._rows[rowIndex];
			var columnInfo:ColumnInfo = this._columns[columnIndex];

			var valueInfo:ValueInfo = rowInfo.values[columnInfo];
			if (!valueInfo)
			{
				rowInfo.values[columnInfo] = new ValueInfo(value);

				if (columnInfo.defaultValue === value)
					return;
			}
			else
			{
				if (valueInfo.value === value)
					return;

				valueInfo.value = value;
				valueInfo.valueConverter = null;
				valueInfo.convertedValue = null;
				valueInfo.hasConvertedValue = false;
			}

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.VALUE, rowIndex, columnIndex));
		}

		public function clearValue(rowIndex:int, columnIndex:int) : void
		{
			if ((rowIndex < 0) || (rowIndex >= this._numRows))
				throw new RangeError("Parameter rowIndex is out of range.");
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			var rowInfo:RowInfo = this._rows[rowIndex];
			var columnInfo:ColumnInfo = this._columns[columnIndex];

			var valueInfo:ValueInfo = rowInfo.values[columnInfo];
			if (!valueInfo)
				return;

			delete rowInfo.values[columnInfo];

			if (valueInfo.value === columnInfo.defaultValue)
				return;

			this.dispatchEvent(new DataTableChangedEvent(ChangedEvent.CHANGED, false, false, this, DataTableChangedEvent.VALUE, rowIndex, columnIndex));
		}

		public function setData(data:Array, fields:Array) : void
		{
			var rows:Array = new Array();
			var columns:Array = new Array();

			var rowInfo:RowInfo;
			var columnInfo:ColumnInfo;
			var field:String;
			var obj:Object;
			var value:*;

			for each (field in fields)
			{
				columnInfo = new ColumnInfo(field, null, null);
				columns.push(columnInfo);
			}

			for each (obj in data)
			{
				rowInfo = new RowInfo();
				rows.push(rowInfo);

				for each (columnInfo in columns)
				{
					value = obj[columnInfo.columnName];
					if (value != null)
						rowInfo.values[columnInfo] = new ValueInfo(value);
				}
			}

			this._rows = rows;
			this._columns = columns;
			this._numRows = rows.length;
			this._numColumns = columns.length;

			this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this));
		}

	}

}

import com.splunk.data.converters.IValueConverter;
import flash.utils.Dictionary;

class RowInfo
{

	// Public Properties

	public var values:Dictionary;

	// Constructor

	public function RowInfo()
	{
		this.values = new Dictionary();
	}

}

class ColumnInfo
{

	// Public Properties

	public var columnName:String;
	public var defaultValue:*;
	public var valueConverter:IValueConverter;
	public var convertedDefaultValue:*;
	public var hasConvertedDefaultValue:Boolean = false;

	// Constructor

	public function ColumnInfo(columnName:String, defaultValue:*, valueConverter:IValueConverter)
	{
		this.columnName = columnName;
		this.defaultValue = defaultValue;
		this.valueConverter = valueConverter;
	}

}

class ValueInfo
{

	// Public Properties

	public var value:*;
	public var valueConverter:IValueConverter;
	public var convertedValue:*;
	public var hasConvertedValue:Boolean = false;

	// Constructor

	public function ValueInfo(value:*)
	{
		this.value = value;
	}

}
