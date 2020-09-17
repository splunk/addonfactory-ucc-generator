package com.splunk.data
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.splunk.data.converters.IValueConverter;
	import flash.errors.IllegalOperationError;
	import flash.events.Event;
	import flash.events.EventDispatcher;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public class ViewDataTable extends EventDispatcher implements IDataTable
	{

		// Private Properties

		private var _table:ObservableProperty;
		private var _rows:ObservableProperty;
		private var _columns:ObservableProperty;
		private var _numRows:int;
		private var _numColumns:int;

		private var _cachedTable:IDataTable;
		private var _cachedRowMap:Array;
		private var _cachedColumnMap:Array;

		// Constructor

		public function ViewDataTable(table:IDataTable = null, rows:Array = null, columns:Array = null)
		{
			rows = rows ? rows.concat() : null;
			columns = columns ? columns.concat() : null;

			this._table = new ObservableProperty(this, "table", IDataTable, table, this._update);
			this._rows = new ObservableProperty(this, "rows", Array, rows, this._update);
			this._columns = new ObservableProperty(this, "columns", Array, columns, this._update);

			this._update();
		}

		// Public Getters/Setters

		public function get table() : IDataTable
		{
			return this._table.value;
		}
		public function set table(value:IDataTable) : void
		{
			this._table.value = value;
		}

		public function get rows() : Array
		{
			var value:Array = this._rows.value;
			return value ? value.concat() : null;
		}
		public function set rows(value:Array) : void
		{
			this._rows.value = value ? value.concat() : null;
		}

		public function get columns() : Array
		{
			var value:Array = this._columns.value;
			return value ? value.concat() : null;
		}
		public function set columns(value:Array) : void
		{
			this._columns.value = value ? value.concat() : null;
		}

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
			throw new IllegalOperationError("Unsupported method addRow.");
		}

		public function addColumn(columnName:String = null, defaultValue:* = null, valueConverter:IValueConverter = null) : void
		{
			throw new IllegalOperationError("Unsupported method addColumn.");
		}

		public function insertRow(rowIndex:int) : void
		{
			throw new IllegalOperationError("Unsupported method insertRow.");
		}

		public function insertColumn(columnIndex:int, columnName:String = null, defaultValue:* = null, valueConverter:IValueConverter = null) : void
		{
			throw new IllegalOperationError("Unsupported method insertColumn.");
		}

		public function removeRow(rowIndex:int) : void
		{
			throw new IllegalOperationError("Unsupported method removeRow.");
		}

		public function removeColumn(columnIndex:int) : void
		{
			throw new IllegalOperationError("Unsupported method removeColumn.");
		}

		public function getColumnName(columnIndex:int) : String
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			columnIndex = this._cachedColumnMap[columnIndex];

			return this._cachedTable.getColumnName(columnIndex);
		}

		public function getDefaultValue(columnIndex:int) : *
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			columnIndex = this._cachedColumnMap[columnIndex];

			return this._cachedTable.getDefaultValue(columnIndex);
		}

		public function getValueConverter(columnIndex:int) : IValueConverter
		{
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			columnIndex = this._cachedColumnMap[columnIndex];

			return this._cachedTable.getValueConverter(columnIndex);
		}

		public function getValue(rowIndex:int, columnIndex:int) : *
		{
			if ((rowIndex < 0) || (rowIndex >= this._numRows))
				throw new RangeError("Parameter rowIndex is out of range.");
			if ((columnIndex < 0) || (columnIndex >= this._numColumns))
				throw new RangeError("Parameter columnIndex is out of range.");

			rowIndex = this._cachedRowMap[rowIndex];
			columnIndex = this._cachedColumnMap[columnIndex];

			return this._cachedTable.getValue(rowIndex, columnIndex);
		}

		public function setColumnName(columnIndex:int, columnName:String) : void
		{
			throw new IllegalOperationError("Unsupported method setColumnName.");
		}

		public function setDefaultValue(columnIndex:int, defaultValue:*) : void
		{
			throw new IllegalOperationError("Unsupported method setDefaultValue.");
		}

		public function setValueConverter(columnIndex:int, valueConverter:IValueConverter) : void
		{
			throw new IllegalOperationError("Unsupported method setValueConverter.");
		}

		public function setValue(rowIndex:int, columnIndex:int, value:*) : void
		{
			throw new IllegalOperationError("Unsupported method setValue.");
		}

		public function clearValue(rowIndex:int, columnIndex:int) : void
		{
			throw new IllegalOperationError("Unsupported method clearValue.");
		}

		// Private Methods

		private function _update(e:Event = null) : void
		{
			var table:IDataTable = this._table.value;
			if (!table)
			{
				this._numRows = 0;
				this._numColumns = 0;
				this._cachedTable = null;
				this._cachedRowMap = null;
				this._cachedColumnMap = null;

				this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this));

				return;
			}

			var slice:Slice;
			var startIndex:int;
			var endIndex:int;

			startIndex = 0;

			var numRows:int = table.numRows;
			var rowMap:Array = new Array();
			var rows:Array = this._rows.value;
			if (rows)
			{
				for each (slice in rows)
				{
					if (slice.startIndex > startIndex)
						startIndex = slice.startIndex;

					if (slice.endIndex < 0)
						endIndex = numRows;
					else
						endIndex = Math.min(slice.endIndex + 1, numRows);

					for (startIndex; startIndex < endIndex; startIndex++)
						rowMap.push(startIndex);
				}
			}
			else
			{
				for (startIndex; startIndex < numRows; startIndex++)
					rowMap.push(startIndex);
			}

			startIndex = 0;

			var numColumns:int = table.numColumns;
			var columnMap:Array = new Array();
			var columns:Array = this._columns.value;
			if (columns)
			{
				for each (slice in columns)
				{
					if (slice.startIndex > startIndex)
						startIndex = slice.startIndex;

					if (slice.endIndex < 0)
						endIndex = numColumns;
					else
						endIndex = Math.min(slice.endIndex + 1, numColumns);

					for (startIndex; startIndex < endIndex; startIndex++)
						columnMap.push(startIndex);
				}
			}
			else
			{
				for (startIndex; startIndex < numColumns; startIndex++)
					columnMap.push(startIndex);
			}

			this._numRows = rowMap.length;
			this._numColumns = columnMap.length;
			this._cachedTable = table;
			this._cachedRowMap = rowMap;
			this._cachedColumnMap = columnMap;

			this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this));
		}

	}

}
