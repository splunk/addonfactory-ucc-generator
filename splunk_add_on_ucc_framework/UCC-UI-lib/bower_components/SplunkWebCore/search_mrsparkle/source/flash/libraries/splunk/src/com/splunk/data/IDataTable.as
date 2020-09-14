package com.splunk.data
{

	import com.jasongatt.core.IObservable;
	import com.splunk.data.converters.IValueConverter;

	public interface IDataTable extends IObservable
	{

		// Getters/Setters

		function get numRows() : int;
		function get numColumns() : int;

		// Methods

		function addRow() : void;
		function addColumn(columnName:String = null, defaultValue:* = null, valueConverter:IValueConverter = null) : void;
		function insertRow(rowIndex:int) : void;
		function insertColumn(columnIndex:int, columnName:String = null, defaultValue:* = null, valueConverter:IValueConverter = null) : void;
		function removeRow(rowIndex:int) : void;
		function removeColumn(columnIndex:int) : void;
		function getColumnName(columnIndex:int) : String;
		function getDefaultValue(columnIndex:int) : *;
		function getValueConverter(columnIndex:int) : IValueConverter;
		function getValue(rowIndex:int, columnIndex:int) : *;
		function setColumnName(columnIndex:int, columnName:String) : void;
		function setDefaultValue(columnIndex:int, defaultValue:*) : void;
		function setValueConverter(columnIndex:int, valueConverter:IValueConverter) : void;
		function setValue(rowIndex:int, columnIndex:int, value:*) : void;
		function clearValue(rowIndex:int, columnIndex:int) : void;

	}

}
