package com.splunk.properties
{

	import flash.errors.IllegalOperationError;
	import flash.events.Event;
	import flash.events.EventDispatcher;

	[Event(name="propertyMapChanged", type="flash.events.Event")]

	public class PropertyManager extends EventDispatcher
	{

		// Public Static Constants

		public static const PROPERTY_MAP_CHANGED:String = "propertyMapChanged";

		// Private Properties

		private var _isParsing:Boolean = false;

		private var _referenceToken:String;
		private var _cloneToken:String;
		private var _namespaceObject:Object;
		private var _namespaceArray:Array;
		private var _defaultNamespace:NamespaceDescriptor;
		private var _currentNamespace:NamespaceDescriptor;
		private var _propertyDescriptors:PropertyDescriptor;
		private var _mergedPropertyDescriptors:PropertyDescriptor;
		private var _isMergedPropertyDescriptorsValid:Boolean = false;
		private var _valueDescriptors:ValueDescriptor;
		private var _parsingStack:Array;
		private var _parsedValueDescriptors:Array;

		// Constructor

		public function PropertyManager(referenceToken:String = "@", cloneToken:String = "#")
		{
			if (!referenceToken || (referenceToken.length != 1))
				throw new ArgumentError("Parameter referenceToken must be a single character.");
			if (referenceToken == ".")
				throw new ArgumentError("Parameter referenceToken cannot be a dot(\".\").");
			if (!cloneToken || (cloneToken.length != 1))
				throw new ArgumentError("Parameter cloneToken must be a single character.");
			if (cloneToken == ".")
				throw new ArgumentError("Parameter cloneToken cannot be a dot(\".\").");
			if (referenceToken == cloneToken)
				throw new ArgumentError("Parameters referenceToken and cloneToken must not be equal.");

			this._referenceToken = referenceToken;
			this._cloneToken = cloneToken;
			this._namespaceObject = new Object();
			this._namespaceArray = new Array();
			this._defaultNamespace = new NamespaceDescriptor();
			this._valueDescriptors = new ValueDescriptor();
			this._parsingStack = new Array();

			this.setNamespace();
		}

		// Public Getters/Setters

		public function get isParsing() : Boolean
		{
			return this._isParsing;
		}

		// Public Methods

		public function addNamespace(name:String, priority:Number = 0) : void
		{
			if (this._isParsing)
				throw new IllegalOperationError("endParse() must be called before this method.");
			if (!name)
				throw new TypeError("Parameter name must be non-null.");

			var namespaceDescriptor:NamespaceDescriptor = this._namespaceObject[name];
			if (!namespaceDescriptor)
			{
				namespaceDescriptor = this._namespaceObject[name] = new NamespaceDescriptor(name, priority);

				var added:Boolean = false;
				var namespaceArray:Array = this._namespaceArray;
				var numNamespaces:int = namespaceArray.length;
				for (var i:int = 0; i < numNamespaces; i++)
				{
					if (namespaceDescriptor.priority >= namespaceArray[i].priority)
					{
						namespaceArray.splice(i, 0, namespaceDescriptor);
						added = true;
						break;
					}
				}
				if (!added)
					namespaceArray.push(namespaceDescriptor);
			}
		}

		public function removeNamespace(name:String) : void
		{
			if (this._isParsing)
				throw new IllegalOperationError("endParse() must be called before this method.");
			if (!name)
				throw new TypeError("Parameter name must be non-null.");

			var namespaceDescriptor:NamespaceDescriptor = this._namespaceObject[name];
			if (namespaceDescriptor)
			{
				var namespaceArray:Array = this._namespaceArray;
				var numNamespaces:int = namespaceArray.length;
				for (var i:int = 0; i < numNamespaces; i++)
				{
					if (namespaceArray[i] == namespaceDescriptor)
					{
						namespaceArray.splice(i, 1);
						break;
					}
				}

				delete this._namespaceObject[name];

				if (namespaceDescriptor == this._currentNamespace)
					this.setNamespace();

				if (namespaceDescriptor.propertyDescriptors.clearAll())
					this._propertyMapChanged();
			}
		}

		public function setNamespace(name:String = null) : void
		{
			if (this._isParsing)
				throw new IllegalOperationError("endParse() must be called before this method.");

			var namespaceDescriptor:NamespaceDescriptor = name ? this._namespaceObject[name] : this._defaultNamespace;
			if (!namespaceDescriptor)
				throw new ArgumentError("The supplied namespace does not exist.");

			this._currentNamespace = namespaceDescriptor;
			this._propertyDescriptors = namespaceDescriptor.propertyDescriptors;
		}

		public function getValue(propertyPath:String, level:int = 0) : String
		{
			var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
			if (!parsedPropertyPath)
				throw new ArgumentError("Parameter propertyPath must be a valid path.");

			var propertyDescriptor:PropertyDescriptor;
			var valueDescriptor:ValueDescriptor;
			var assignmentDescriptor:AssignmentDescriptor;
			var propertyName:String;
			var parentPath:Array;
			var parentDescriptor:ValueDescriptor;

			switch (level)
			{
				case 0:
					propertyName = parsedPropertyPath[parsedPropertyPath.length - 1];
					parentPath = parsedPropertyPath.slice(0, parsedPropertyPath.length - 1);
					parentDescriptor = (parentPath.length == 0) ? this._valueDescriptors : this._valueDescriptors.getDescendant(parentPath);
					if (parentDescriptor)
					{
						valueDescriptor = parentDescriptor.getChild(propertyName);
						if (valueDescriptor && valueDescriptor.hasValue)
							return valueDescriptor.parser.valueToString(this, valueDescriptor.parsedValue);
						if (parentDescriptor.reference)
							parentDescriptor = parentDescriptor.reference;
						assignmentDescriptor = parentDescriptor.getChildAssignment(propertyName);
						if (assignmentDescriptor && assignmentDescriptor.hasGetter)
							return assignmentDescriptor.parser.valueToString(this, assignmentDescriptor.getValue());
					}
					propertyDescriptor = this._getMergedPropertyDescriptors().getDescendant(parsedPropertyPath);
					if (propertyDescriptor && propertyDescriptor.hasValue)
						return propertyDescriptor.value;
					return null;
				case 1:  // current namespace
					propertyDescriptor = this._propertyDescriptors.getDescendant(parsedPropertyPath);
					if (propertyDescriptor && propertyDescriptor.hasValue)
						return propertyDescriptor.value;
					return null;
				case 2:  // effective
					propertyDescriptor = this._getMergedPropertyDescriptors().getDescendant(parsedPropertyPath);
					if (propertyDescriptor && propertyDescriptor.hasValue)
						return propertyDescriptor.value;
					return null;
				case 3:  // assigned
					valueDescriptor = this._valueDescriptors.getDescendant(parsedPropertyPath);
					if (valueDescriptor && valueDescriptor.hasValue)
						return valueDescriptor.value;
					return null;
				case 4:  // parsed
					propertyName = parsedPropertyPath[parsedPropertyPath.length - 1];
					parentPath = parsedPropertyPath.slice(0, parsedPropertyPath.length - 1);
					parentDescriptor = (parentPath.length == 0) ? this._valueDescriptors : this._valueDescriptors.getDescendant(parentPath);
					if (parentDescriptor)
					{
						valueDescriptor = parentDescriptor.getChild(propertyName);
						if (valueDescriptor && valueDescriptor.hasValue)
							return valueDescriptor.parser.valueToString(this, valueDescriptor.parsedValue);
					}
					return null;
				case 5:  // actual
					propertyName = parsedPropertyPath[parsedPropertyPath.length - 1];
					parentPath = parsedPropertyPath.slice(0, parsedPropertyPath.length - 1);
					parentDescriptor = (parentPath.length == 0) ? this._valueDescriptors : this._valueDescriptors.getDescendant(parentPath);
					if (parentDescriptor)
					{
						valueDescriptor = parentDescriptor.getChild(propertyName);
						if (valueDescriptor && valueDescriptor.hasValue)
							return valueDescriptor.parser.valueToString(this, valueDescriptor.parsedValue);
						if (parentDescriptor.reference)
							parentDescriptor = parentDescriptor.reference;
						assignmentDescriptor = parentDescriptor.getChildAssignment(propertyName);
						if (assignmentDescriptor && assignmentDescriptor.hasGetter)
							return assignmentDescriptor.parser.valueToString(this, assignmentDescriptor.getValue());
					}
					return null;
				default:
					return null;
			}
		}

		public function getAll(propertyPath:String = null) : Object
		{
			var propertyDescriptor:PropertyDescriptor;
			if (propertyPath)
			{
				var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
				if (!parsedPropertyPath)
					throw new ArgumentError("Parameter propertyPath must be a valid path.");

				propertyDescriptor = this._propertyDescriptors.getDescendant(parsedPropertyPath);
			}
			else
			{
				propertyDescriptor = this._propertyDescriptors;
			}

			if (!propertyDescriptor)
				return null;

			var properties:Object = new Object();
			this._copyProperties(propertyDescriptor, propertyPath, properties);
			return properties;
		}

		public function setValue(propertyPath:String, propertyValue:String) : void
		{
			if (this._isParsing)
				throw new IllegalOperationError("endParse() must be called before this method.");
			var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
			if (!parsedPropertyPath)
				throw new ArgumentError("Parameter propertyPath must be a valid path.");

			var propertyDescriptor:PropertyDescriptor = this._propertyDescriptors.createDescendant(parsedPropertyPath);
			if (propertyDescriptor.setValue(propertyValue))
				this._propertyMapChanged();
		}

		public function clearValue(propertyPath:String) : void
		{
			if (this._isParsing)
				throw new IllegalOperationError("endParse() must be called before this method.");
			var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
			if (!parsedPropertyPath)
				throw new ArgumentError("Parameter propertyPath must be a valid path.");

			if (this._propertyDescriptors.clearDescendant(parsedPropertyPath))
				this._propertyMapChanged();
		}

		public function clearAll(propertyPath:String = null) : void
		{
			if (this._isParsing)
				throw new IllegalOperationError("endParse() must be called before this method.");

			var propertyDescriptor:PropertyDescriptor;
			if (propertyPath)
			{
				var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
				if (!parsedPropertyPath)
					throw new ArgumentError("Parameter propertyPath must be a valid path.");

				propertyDescriptor = this._propertyDescriptors.getDescendant(parsedPropertyPath);
			}
			else
			{
				propertyDescriptor = this._propertyDescriptors;
			}

			if (propertyDescriptor && propertyDescriptor.clearAll())
				this._propertyMapChanged();
		}

		public function beginParse() : void
		{
			if (this._isParsing)
				throw new IllegalOperationError("endParse() must be called before this method.");

			this._isParsing = true;

			this._parsedValueDescriptors = new Array();

			this._propertyDescriptors = this._getMergedPropertyDescriptors();

			this._valueDescriptors.prepareToParse();
		}

		public function endParse() : void
		{
			if (!this._isParsing)
				throw new IllegalOperationError("beginParse() must be called before this method.");

			var parsedValueDescriptors:Array = this._parsedValueDescriptors;
			var parsedValueDescriptor:ValueDescriptor;
			for (var i:int = 0; i < parsedValueDescriptors.length; i++)
			{
				parsedValueDescriptor = parsedValueDescriptors[i];
				this._parseChildProperties(parsedValueDescriptor);
			}

			this._valueDescriptors.clearNotParsed();

			this._propertyDescriptors = this._currentNamespace.propertyDescriptors;

			this._isParsing = false;
		}

		public function parseValue(value:String, propertyParser:IPropertyParser) : *
		{
			if (!this._isParsing)
				throw new IllegalOperationError("beginParse() must be called before this method.");
			if (!propertyParser)
				throw new TypeError("Parameter propertyParser must be non-null.");

			var propertyPath:Array = this._referenceToPath(value);
			if (propertyPath)
			{
				var valueDescriptor:ValueDescriptor = this._parseProperty(propertyPath, propertyParser, null, null, true);
				return (valueDescriptor.isParsed && (valueDescriptor.parser == propertyParser)) ? valueDescriptor.parsedValue : null;
			}
			else
			{
				return propertyParser.stringToValue(this, this._escapeValue(value));
			}
		}

		public function parseProperty(propertyPath:String, propertyParser:IPropertyParser, defaultValue:String = null) : *
		{
			if (!this._isParsing)
				throw new IllegalOperationError("beginParse() must be called before this method.");
			var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
			if (!parsedPropertyPath)
				throw new ArgumentError("Parameter propertyPath must be a valid path.");
			if (!propertyParser)
				throw new TypeError("Parameter propertyParser must be non-null.");

			var valueDescriptor:ValueDescriptor = this._parseProperty(parsedPropertyPath, propertyParser, defaultValue, null, true);
			return (valueDescriptor.isParsed && (valueDescriptor.parser == propertyParser)) ? valueDescriptor.parsedValue : null;
		}

		public function parsePropertyAs(propertyPath:String, propertyParser:IPropertyParser, value:String) : *
		{
			if (!this._isParsing)
				throw new IllegalOperationError("beginParse() must be called before this method.");
			var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
			if (!parsedPropertyPath)
				throw new ArgumentError("Parameter propertyPath must be a valid path.");
			if (!propertyParser)
				throw new TypeError("Parameter propertyParser must be non-null.");
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			var valueDescriptor:ValueDescriptor = this._parseProperty(parsedPropertyPath, propertyParser, null, value, true);
			return (valueDescriptor.isParsed && (valueDescriptor.parser == propertyParser)) ? valueDescriptor.parsedValue : null;
		}

		public function parseChildProperty(parsedValue:*, propertyPath:String, propertyParser:IPropertyParser, defaultValue:String = null) : *
		{
			if (!this._isParsing)
				throw new IllegalOperationError("beginParse() must be called before this method.");
			var valueDescriptor:ValueDescriptor = this._valueDescriptors.getDescendantByValue(parsedValue);
			if (!valueDescriptor || !valueDescriptor.isParsed)
				throw new ArgumentError("Parameter parsedValue must be an object that was instantiated by the PropertyManager.");
			var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
			if (!parsedPropertyPath)
				throw new ArgumentError("Parameter propertyPath must be a valid path.");
			if (!propertyParser)
				throw new TypeError("Parameter propertyParser must be non-null.");

			parsedPropertyPath = valueDescriptor.path.concat(parsedPropertyPath);

			valueDescriptor = this._parseProperty(parsedPropertyPath, propertyParser, defaultValue, null, true);
			return (valueDescriptor.isParsed && (valueDescriptor.parser == propertyParser)) ? valueDescriptor.parsedValue : null;
		}

		public function parseChildPropertyAs(parsedValue:*, propertyPath:String, propertyParser:IPropertyParser, value:String) : *
		{
			if (!this._isParsing)
				throw new IllegalOperationError("beginParse() must be called before this method.");
			var valueDescriptor:ValueDescriptor = this._valueDescriptors.getDescendantByValue(parsedValue);
			if (!valueDescriptor || !valueDescriptor.isParsed)
				throw new ArgumentError("Parameter parsedValue must be an object that was instantiated by the PropertyManager.");
			var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
			if (!parsedPropertyPath)
				throw new ArgumentError("Parameter propertyPath must be a valid path.");
			if (!propertyParser)
				throw new TypeError("Parameter propertyParser must be non-null.");
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			parsedPropertyPath = valueDescriptor.path.concat(parsedPropertyPath);

			valueDescriptor = this._parseProperty(parsedPropertyPath, propertyParser, null, value, true);
			return (valueDescriptor.isParsed && (valueDescriptor.parser == propertyParser)) ? valueDescriptor.parsedValue : null;
		}

		public function parseChildProperties(parsedValue:*) : void
		{
			if (!this._isParsing)
				throw new IllegalOperationError("beginParse() must be called before this method.");
			var valueDescriptor:ValueDescriptor = this._valueDescriptors.getDescendantByValue(parsedValue);
			if (!valueDescriptor || !valueDescriptor.isParsed)
				throw new ArgumentError("Parameter parsedValue must be an object that was instantiated by the PropertyManager.");

			this._parseChildProperties(valueDescriptor);
		}

		public function inheritProperties(parsedValue:*, propertyPath:String) : void
		{
			if (!this._isParsing)
				throw new IllegalOperationError("beginParse() must be called before this method.");
			var valueDescriptor:ValueDescriptor = this._valueDescriptors.getDescendantByValue(parsedValue);
			if (!valueDescriptor || !valueDescriptor.isParsed)
				throw new ArgumentError("Parameter parsedValue must be an object that was instantiated by the PropertyManager.");
			var parsedPropertyPath:Array = this._declarationToPath(propertyPath);
			if (!parsedPropertyPath)
				throw new ArgumentError("Parameter propertyPath must be a valid path.");

			valueDescriptor.inheritProperties(parsedPropertyPath);
		}

		public function getPropertyPath(parsedValue:*) : String
		{
			var valueDescriptor:ValueDescriptor = this._valueDescriptors.getDescendantByValue(parsedValue);
			if (!valueDescriptor || !valueDescriptor.isParsed)
				return null;

			return this._pathToDeclaration(valueDescriptor.path);
		}

		public function registerProperty(propertyName:String, propertyParser:IPropertyParser, propertyGetter:Function = null, propertySetter:Function = null) : void
		{
			var parsingStack:Array = this._parsingStack;
			var parsingStackLength:int = parsingStack.length;

			if (parsingStackLength == 0)
				throw new IllegalOperationError("This method must be called from within the registerProperties() method of an IPropertyParser instance.");
			if (!propertyName)
				throw new TypeError("Parameter propertyName must be non-null.");
			if (propertyName.indexOf(".") >= 0)
				throw new ArgumentError("Parameter propertyName must not contain a dot.");
			if (!propertyParser)
				throw new TypeError("Parameter propertyParser must be non-null.");

			var valueDescriptor:ValueDescriptor = parsingStack[parsingStackLength - 1];
			valueDescriptor.registerProperty(propertyName, propertyParser, propertyGetter, propertySetter);
		}

		// Private Methods

		private function _copyProperties(propertyDescriptor:PropertyDescriptor, propertyPath:String, properties:Object) : void
		{
			if (propertyDescriptor.hasValue && propertyPath)
				properties[propertyPath] = propertyDescriptor.value;

			propertyPath = propertyPath ? propertyPath + "." : "";

			var childPropertyDescriptors:Array = propertyDescriptor.getChildren();
			var childPropertyDescriptor:PropertyDescriptor;
			for each (childPropertyDescriptor in childPropertyDescriptors)
				this._copyProperties(childPropertyDescriptor, propertyPath + childPropertyDescriptor.name, properties);
		}

		private function _getMergedPropertyDescriptors() : PropertyDescriptor
		{
			if (!this._isMergedPropertyDescriptorsValid)
			{
				var mergedPropertyDescriptors:PropertyDescriptor = this._mergedPropertyDescriptors = new PropertyDescriptor();
				this._mergePropertyDescriptors(mergedPropertyDescriptors, this._defaultNamespace.propertyDescriptors);
				for each (var namespaceDescriptor:NamespaceDescriptor in this._namespaceArray)
					this._mergePropertyDescriptors(mergedPropertyDescriptors, namespaceDescriptor.propertyDescriptors);

				this._isMergedPropertyDescriptorsValid = true;
			}

			return this._mergedPropertyDescriptors;
		}

		private function _mergePropertyDescriptors(propertyDescriptor1:PropertyDescriptor, propertyDescriptor2:PropertyDescriptor) : void
		{
			var childPropertyDescriptors2:Array = propertyDescriptor2.getChildren();
			var childPropertyDescriptor2:PropertyDescriptor;
			var childPropertyDescriptor1:PropertyDescriptor;
			for each (childPropertyDescriptor2 in childPropertyDescriptors2)
			{
				childPropertyDescriptor1 = propertyDescriptor1.createChild(childPropertyDescriptor2.name);
				if (childPropertyDescriptor2.hasValue && !childPropertyDescriptor1.hasValue)
					childPropertyDescriptor1.setValue(childPropertyDescriptor2.value);
				if (childPropertyDescriptor2.numChildren > 0)
					this._mergePropertyDescriptors(childPropertyDescriptor1, childPropertyDescriptor2);
			}
		}

		private function _parseProperty(propertyPath:Array, propertyParser:IPropertyParser, defaultValue:String = null, overrideValue:String = null, registerReference:Boolean = false) : ValueDescriptor
		{
			var valueDescriptor:ValueDescriptor = this._valueDescriptors.createDescendant(propertyPath);

			var parsingStack:Array = this._parsingStack;

			if (registerReference)
			{
				var parsingStackLength:int = parsingStack.length;
				if (parsingStackLength > 0)
				{
					var parsingValueDescriptor:ValueDescriptor = parsingStack[parsingStackLength - 1];
					parsingValueDescriptor.registerParsedValueReference(valueDescriptor);
				}
			}

			if (valueDescriptor.isParsed || valueDescriptor.isParsing)
				return valueDescriptor;

			try
			{
				valueDescriptor.isParsing = true;
				parsingStack.push(valueDescriptor);

				var propertyValue:String;
				var hasValue:Boolean = false;

				if (overrideValue != null)
				{
					propertyValue = overrideValue;
					hasValue = true;
				}
				else
				{
					var propertyDescriptor:PropertyDescriptor = this._propertyDescriptors.getDescendant(propertyPath);
					if (propertyDescriptor && propertyDescriptor.hasValue)
					{
						propertyValue = propertyDescriptor.value;
						hasValue = true;
					}
					else
					{
						var parentValueDescriptor:ValueDescriptor = valueDescriptor.parent;
						if (parentValueDescriptor && parentValueDescriptor.isParsed)
						{
							var propertyName:String = valueDescriptor.name;
							var assignmentDescriptor:AssignmentDescriptor = parentValueDescriptor.getChildAssignment(propertyName);
							if (assignmentDescriptor && assignmentDescriptor.hasSetter)
							{
								var inheritedValueDescriptor:ValueDescriptor;
								var inheritedPropertyDescriptor:PropertyDescriptor;
								for each (var inheritedPath:Array in parentValueDescriptor.getInheritedPaths())
								{
									inheritedPath = inheritedPath.concat(propertyName);

									inheritedValueDescriptor = this._valueDescriptors.getDescendant(inheritedPath);
									if (inheritedValueDescriptor && inheritedValueDescriptor.isParsed)
									{
										propertyValue = this._pathToReference(inheritedPath);
										hasValue = true;
										break;
									}

									inheritedPropertyDescriptor = this._propertyDescriptors.getDescendant(inheritedPath);
									if (inheritedPropertyDescriptor && inheritedPropertyDescriptor.hasValue)
									{
										propertyValue = this._pathToReference(inheritedPath);
										hasValue = true;
										break;
									}
								}
							}
						}
					}
				}

				if (!hasValue)
					propertyValue = defaultValue;

				var referencePath:Array = this._referenceToPath(propertyValue);
				if (referencePath)
				{
					this._parseReference(valueDescriptor, referencePath, propertyValue, propertyParser, defaultValue);
					return valueDescriptor;
				}

				var clonePath:Array = this._cloneToPath(propertyValue);
				if (clonePath)
				{
					this._parseClone(valueDescriptor, clonePath, propertyParser, defaultValue);
					return valueDescriptor;
				}

				propertyValue = this._escapeValue(propertyValue);
				this._parseValue(valueDescriptor, propertyValue, propertyParser);
				return valueDescriptor;
			}
			finally
			{
				parsingStack.pop();
				valueDescriptor.isParsing = false;
			}

			return valueDescriptor;
		}

		private function _parseReference(valueDescriptor:ValueDescriptor, referencePath:Array, propertyValue:String, propertyParser:IPropertyParser, defaultValue:String) : void
		{
			var referenceDescriptor:ValueDescriptor = this._parseProperty(referencePath, propertyParser, defaultValue);
			if (!referenceDescriptor.isParsed || (referenceDescriptor.parser != propertyParser))
			{
				this._parseValue(valueDescriptor, null, propertyParser);
				return;
			}

			valueDescriptor.setReference(propertyValue, referenceDescriptor);

			valueDescriptor.isParsed = true;
		}

		private function _parseClone(valueDescriptor:ValueDescriptor, clonePath:Array, propertyParser:IPropertyParser, defaultValue:String) : void
		{
			var cloneDescriptor:ValueDescriptor = this._parseProperty(clonePath, propertyParser, defaultValue);
			if (!cloneDescriptor.isParsed)
			{
				this._parseValue(valueDescriptor, null, propertyParser);
				return;
			}

			if (cloneDescriptor.reference)
				cloneDescriptor = cloneDescriptor.reference;

			if (cloneDescriptor.parser == propertyParser)
				valueDescriptor.inheritProperties(cloneDescriptor.path);

			this._parseValue(valueDescriptor, cloneDescriptor.value, propertyParser);
		}

		private function _parseValue(valueDescriptor:ValueDescriptor, propertyValue:String, propertyParser:IPropertyParser) : void
		{
			var needsSetValue:Boolean = false;

			if (valueDescriptor.hasValue && (valueDescriptor.value == propertyValue) && (valueDescriptor.parser == propertyParser))
			{
				for each (var parsedValueReference:ValueDescriptor in valueDescriptor.parsedValueReferences)
				{
					this._parseProperty(parsedValueReference.path, parsedValueReference.parser);
					if (parsedValueReference.changed)
						needsSetValue = true;
				}
			}
			else
			{
				needsSetValue = true;
			}

			if (needsSetValue)
				valueDescriptor.setValue(propertyValue, propertyParser, this);
			else
				valueDescriptor.updateAssignment();

			valueDescriptor.isParsed = true;

			valueDescriptor.updateChildAssignments();

			this._parsedValueDescriptors.push(valueDescriptor);
		}

		private function _parseChildProperties(valueDescriptor:ValueDescriptor) : void
		{
			if (valueDescriptor.isChildrenParsed || !valueDescriptor.isParsed)
				return;

			valueDescriptor.isChildrenParsed = true;

			var childPropertyNames:Object = new Object();
			var childPropertyName:String;

			var propertyPath:Array = valueDescriptor.path;
			var propertyDescriptor:PropertyDescriptor = this._propertyDescriptors.getDescendant(propertyPath);
			var childPropertyDescriptors:Array;
			var childPropertyDescriptor:PropertyDescriptor;
			if (propertyDescriptor)
			{
				childPropertyDescriptors = propertyDescriptor.getChildren();
				for each (childPropertyDescriptor in childPropertyDescriptors)
				{
					if (childPropertyDescriptor.hasValue)
						childPropertyNames[childPropertyDescriptor.name] = true;
				}
			}

			var childValueDescriptors:Array;
			var childValueDescriptor:ValueDescriptor;
			var inheritedValueDescriptor:ValueDescriptor;
			var inheritedPropertyDescriptor:PropertyDescriptor;
			for each (var inheritedPath:Array in valueDescriptor.getInheritedPaths())
			{
				inheritedValueDescriptor = this._valueDescriptors.getDescendant(inheritedPath);
				if (inheritedValueDescriptor)
				{
					childValueDescriptors = inheritedValueDescriptor.getChildren();
					for each (childValueDescriptor in childValueDescriptors)
					{
						if (childValueDescriptor.isParsed)
							childPropertyNames[childValueDescriptor.name] = true;
					}
				}

				inheritedPropertyDescriptor = this._propertyDescriptors.getDescendant(inheritedPath);
				if (inheritedPropertyDescriptor)
				{
					childPropertyDescriptors = inheritedPropertyDescriptor.getChildren();
					for each (childPropertyDescriptor in childPropertyDescriptors)
					{
						if (childPropertyDescriptor.hasValue)
							childPropertyNames[childPropertyDescriptor.name] = true;
					}
				}
			}

			var childAssignmentDescriptor:AssignmentDescriptor;
			for (childPropertyName in childPropertyNames)
			{
				childAssignmentDescriptor = valueDescriptor.getChildAssignment(childPropertyName);
				if (childAssignmentDescriptor && childAssignmentDescriptor.hasSetter && !childAssignmentDescriptor.isSet)
					this._parseProperty(propertyPath.concat(childPropertyName), childAssignmentDescriptor.parser);
			}
		}

		private function _declarationToPath(propertyDeclaration:String) : Array
		{
			if (!propertyDeclaration)
				return null;

			var char0:String = propertyDeclaration.charAt(0);
			if ((char0 == this._referenceToken) || (char0 == this._cloneToken))
				return null;

			var propertyPath:Array = propertyDeclaration.split(".");
			if (propertyPath.indexOf("") >= 0)
				return null;

			return propertyPath;
		}

		private function _pathToDeclaration(propertyPath:Array) : String
		{
			if (!propertyPath)
				return null;

			return propertyPath.join(".");
		}

		private function _referenceToPath(propertyReference:String) : Array
		{
			if (!propertyReference)
				return null;
			if (propertyReference.length < 2)
				return null;
			if (propertyReference.charAt(0) != this._referenceToken)
				return null;
			if (propertyReference.charAt(1) == this._referenceToken)
				return null;

			propertyReference = propertyReference.substring(1);

			var propertyPath:Array = propertyReference.split(".");
			if (propertyPath.indexOf("") >= 0)
				return null;

			return propertyPath;
		}

		private function _pathToReference(propertyPath:Array) : String
		{
			if (!propertyPath)
				return null;

			return this._referenceToken + propertyPath.join(".");
		}

		private function _cloneToPath(propertyClone:String) : Array
		{
			if (!propertyClone)
				return null;
			if (propertyClone.length < 2)
				return null;
			if (propertyClone.charAt(0) != this._cloneToken)
				return null;
			if (propertyClone.charAt(1) == this._cloneToken)
				return null;

			propertyClone = propertyClone.substring(1);

			var propertyPath:Array = propertyClone.split(".");
			if (propertyPath.indexOf("") >= 0)
				return null;

			return propertyPath;
		}

		private function _pathToClone(propertyPath:Array) : String
		{
			if (!propertyPath)
				return null;

			return this._cloneToken + propertyPath.join(".");
		}

		private function _escapeValue(value:String) : String
		{
			if (!value)
				return value;
			if (value.length < 2)
				return value;
			var char0:String = value.charAt(0);
			if ((char0 != this._referenceToken) && (char0 != this._cloneToken))
				return value;
			if (value.charAt(1) != char0)
				return value;
			return value.substring(1);
		}

		private function _propertyMapChanged() : void
		{
			this._isMergedPropertyDescriptorsValid = false;
			this.dispatchEvent(new Event(PropertyManager.PROPERTY_MAP_CHANGED));
		}

	}

}

import com.splunk.properties.IPropertyParser;
import com.splunk.properties.PropertyManager;
import flash.utils.Dictionary;

class NamespaceDescriptor
{

	// Private Properties

	private var _name:String;
	private var _priority:Number;
	private var _propertyDescriptors:PropertyDescriptor;

	// Constructor

	public function NamespaceDescriptor(name:String = null, priority:Number = 0)
	{
		this._name = name;
		this._priority = priority;
		this._propertyDescriptors = new PropertyDescriptor();
	}

	// Public Getters/Setters

	public function get name() : String
	{
		return this._name;
	}

	public function get priority() : Number
	{
		return this._priority;
	}

	public function get propertyDescriptors() : PropertyDescriptor
	{
		return this._propertyDescriptors;
	}

}

class PropertyDescriptor
{

	// Private Properties

	private var _name:String;
	private var _path:Array;
	private var _parent:PropertyDescriptor;
	private var _children:Object;
	private var _numChildren:int = 0;

	private var _hasValue:Boolean = false;
	private var _value:String;

	// Constructor

	public function PropertyDescriptor(name:String = null, parent:PropertyDescriptor = null)
	{
		this._name = name;
		if (parent)
			this._path = parent.path.concat(name);
		else if (name)
			this._path = [ name ];
		else
			this._path = [];
		this._parent = parent;
		this._children = new Object();
	}

	// Public Getters/Setters

	public function get name() : String
	{
		return this._name;
	}

	public function get path() : Array
	{
		return this._path.concat();
	}

	public function get parent() : PropertyDescriptor
	{
		return this._parent;
	}

	public function get numChildren() : int
	{
		return this._numChildren;
	}

	public function get hasValue() : Boolean
	{
		return this._hasValue;
	}

	public function get value() : String
	{
		return this._value;
	}

	// Public Methods

	public function getChildren() : Array
	{
		var children:Array = new Array();
		for each (var childDescriptor:PropertyDescriptor in this._children)
			children.push(childDescriptor);
		return children;
	}

	public function getChild(childName:String) : PropertyDescriptor
	{
		if (!childName)
			return null;

		var childDescriptor:PropertyDescriptor = this._children[childName];
		if (!childDescriptor)
			return null;

		return childDescriptor;
	}

	public function createChild(childName:String) : PropertyDescriptor
	{
		if (!childName)
			return null;

		var childDescriptor:PropertyDescriptor = this._children[childName];
		if (!childDescriptor)
		{
			childDescriptor = this._children[childName] = new PropertyDescriptor(childName, this);
			this._numChildren++;
		}

		return childDescriptor;
	}

	public function clearChild(childName:String) : Boolean
	{
		if (!childName)
			return false;

		var childDescriptor:PropertyDescriptor = this._children[childName];
		if (!childDescriptor)
			return false;

		var valueCleared:Boolean = childDescriptor.clearValue();
		if (childDescriptor.numChildren == 0)
		{
			delete this._children[childName];
			this._numChildren--;
			if (this._parent && !this._hasValue && (this._numChildren == 0))
				this._parent.clearChild(this._name);
		}

		return valueCleared;
	}

	public function getDescendant(descendantPath:Array) : PropertyDescriptor
	{
		if (!descendantPath)
			return null;

		var descendantPathLength:int = descendantPath.length;
		if (descendantPathLength == 0)
			return null;

		var descendantDescriptor:PropertyDescriptor = this.getChild(descendantPath[0]);
		if (descendantDescriptor && (descendantPathLength > 1))
			descendantDescriptor = descendantDescriptor.getDescendant(descendantPath.slice(1));

		return descendantDescriptor;
	}

	public function createDescendant(descendantPath:Array) : PropertyDescriptor
	{
		if (!descendantPath)
			return null;

		var descendantPathLength:int = descendantPath.length;
		if (descendantPathLength == 0)
			return null;

		var descendantDescriptor:PropertyDescriptor = this.createChild(descendantPath[0]);
		if (descendantDescriptor && (descendantPathLength > 1))
			descendantDescriptor = descendantDescriptor.createDescendant(descendantPath.slice(1));

		return descendantDescriptor;
	}

	public function clearDescendant(descendantPath:Array) : Boolean
	{
		if (!descendantPath)
			return false;

		var descendantPathLength:int = descendantPath.length;
		if (descendantPathLength == 0)
			return false;

		if (descendantPathLength == 1)
			return this.clearChild(descendantPath[0]);

		var descendantDescriptor:PropertyDescriptor = this.getChild(descendantPath[0]);
		if (!descendantDescriptor)
			return false;

		return descendantDescriptor.clearDescendant(descendantPath.slice(1));
	}

	public function setValue(value:String) : Boolean
	{
		if (this._hasValue && (this._value == value))
			return false;

		this._value = value;
		this._hasValue = true;

		return true;
	}

	public function clearValue() : Boolean
	{
		if (!this._hasValue)
			return false;

		this._value = null;
		this._hasValue = false;

		return true;
	}

	public function clearAll() : Boolean
	{
		var cleared:Boolean = false;

		if (this._numChildren > 0)
		{
			this._children = new Object();
			this._numChildren = 0;

			cleared = true;
		}

		if (this._parent)
			cleared = this._parent.clearChild(this._name) || cleared;

		return cleared;
	}

}

class ValueDescriptor
{

	// Public Properties

	public var isParsing:Boolean = false;
	public var isParsed:Boolean = false;
	public var isChildrenParsed:Boolean = false;

	// Private Properties

	private var _name:String;
	private var _path:Array;
	private var _parent:ValueDescriptor;
	private var _children:Object;
	private var _numChildren:int = 0;

	private var _hasValue:Boolean = false;
	private var _value:String;
	private var _parser:IPropertyParser;
	private var _parsedValue:* = null;
	private var _parsedValueReferences:Dictionary;
	private var _reference:ValueDescriptor;
	private var _changed:Boolean = false;

	private var _inheritedPaths:Array;
	private var _inheritedPathsMap:Object;
	private var _childAssignments:Object;

	private var _valueMap:Dictionary;

	// Constructor

	public function ValueDescriptor(name:String = null, parent:ValueDescriptor = null)
	{
		this._name = name;
		if (parent)
			this._path = parent.path.concat(name);
		else if (name)
			this._path = [ name ];
		else
			this._path = [];
		this._parent = parent;
		this._children = new Object();

		this._valueMap = parent ? parent._valueMap : new Dictionary();
	}

	// Public Getters/Setters

	public function get name() : String
	{
		return this._name;
	}

	public function get path() : Array
	{
		return this._path.concat();
	}

	public function get parent() : ValueDescriptor
	{
		return this._parent;
	}

	public function get numChildren() : int
	{
		return this._numChildren;
	}

	public function get hasValue() : Boolean
	{
		return this._hasValue;
	}

	public function get value() : String
	{
		return this._value;
	}

	public function get parser() : IPropertyParser
	{
		return this._parser;
	}

	public function get parsedValue() : *
	{
		return this._parsedValue;
	}

	public function get parsedValueReferences() : Array
	{
		var references:Array = new Array();
		for each (var reference:ValueDescriptor in this._parsedValueReferences)
			references.push(reference);
		return references;
	}

	public function get reference() : ValueDescriptor
	{
		return this._reference;
	}

	public function get changed() : Boolean
	{
		return this._changed;
	}

	// Public Methods

	public function getChildren() : Array
	{
		var children:Array = new Array();
		for each (var childDescriptor:ValueDescriptor in this._children)
			children.push(childDescriptor);
		return children;
	}

	public function getChild(childName:String) : ValueDescriptor
	{
		if (!childName)
			return null;

		var childDescriptor:ValueDescriptor = this._children[childName];
		if (!childDescriptor)
			return null;

		return childDescriptor;
	}

	public function createChild(childName:String) : ValueDescriptor
	{
		if (!childName)
			return null;

		var childDescriptor:ValueDescriptor = this._children[childName];
		if (!childDescriptor)
		{
			childDescriptor = this._children[childName] = new ValueDescriptor(childName, this);
			this._numChildren++;
		}

		return childDescriptor;
	}

	public function getDescendant(descendantPath:Array) : ValueDescriptor
	{
		if (!descendantPath)
			return null;

		var descendantPathLength:int = descendantPath.length;
		if (descendantPathLength == 0)
			return null;

		var descendantDescriptor:ValueDescriptor = this.getChild(descendantPath[0]);
		if (descendantDescriptor && (descendantPathLength > 1))
			descendantDescriptor = descendantDescriptor.getDescendant(descendantPath.slice(1));

		return descendantDescriptor;
	}

	public function getDescendantByValue(parsedValue:*) : ValueDescriptor
	{
		var descendantDescriptor:ValueDescriptor = this._valueMap[parsedValue];
		if (!descendantDescriptor)
			return null;

		return descendantDescriptor;
	}

	public function createDescendant(descendantPath:Array) : ValueDescriptor
	{
		if (!descendantPath)
			return null;

		var descendantPathLength:int = descendantPath.length;
		if (descendantPathLength == 0)
			return null;

		var descendantDescriptor:ValueDescriptor = this.createChild(descendantPath[0]);
		if (descendantDescriptor && (descendantPathLength > 1))
			descendantDescriptor = descendantDescriptor.createDescendant(descendantPath.slice(1));

		return descendantDescriptor;
	}

	public function setValue(propertyValue:String, propertyParser:IPropertyParser, propertyManager:PropertyManager) : void
	{
		this._parsedValueReferences = new Dictionary();

		var parsedValue:* = propertyParser.stringToValue(propertyManager, propertyValue);

		this._changed = !this._hasValue || this._reference || (this._parsedValue != parsedValue);

		this._hasValue = true;
		this._value = propertyValue;
		this._parser = propertyParser;
		this._reference = null;

		if (!this._changed)
		{
			this.updateAssignment();
			return;
		}

		var oldParsedValue:* = this._parsedValue;
		var oldChildAssignments:Object = this._childAssignments;

		this._parsedValue = parsedValue;
		this._childAssignments = new Object();

		if (this._valueMap[oldParsedValue] == this)
			delete this._valueMap[oldParsedValue];
		if (!((parsedValue == null) || (parsedValue is Boolean) || (parsedValue is Number) || (parsedValue is String)))
			this._valueMap[parsedValue] = this;

		propertyParser.registerProperties(propertyManager, parsedValue);

		this.updateAssignment();

		for each (var childAssignment:AssignmentDescriptor in oldChildAssignments)
			childAssignment.clearValue();
	}

	public function setReference(propertyValue:String, propertyReference:ValueDescriptor) : void
	{
		this._parsedValueReferences = null;

		var parsedValue:* = propertyReference.parsedValue;

		this._changed = !this._hasValue || !this._reference || (this._parsedValue != parsedValue);

		this._hasValue = true;
		this._value = propertyValue;
		this._parser = propertyReference.parser;
		this._reference = propertyReference.reference;
		if (!this._reference)
			this._reference = propertyReference;

		if (!this._changed)
		{
			this.updateAssignment();
			return;
		}

		var oldParsedValue:* = this._parsedValue;
		var oldChildAssignments:Object = this._childAssignments;

		this._parsedValue = parsedValue;
		this._childAssignments = null;

		if (this._valueMap[oldParsedValue] == this)
			delete this._valueMap[oldParsedValue];

		this.updateAssignment();

		for each (var childAssignment:AssignmentDescriptor in oldChildAssignments)
			childAssignment.clearValue();
	}

	public function clearValue() : void
	{
		this._parsedValueReferences = null;

		this._changed = false;

		this._hasValue = false;
		this._value = null;
		this._parser = null;
		this._reference = null;

		var oldParsedValue:* = this._parsedValue;
		var oldChildAssignments:Object = this._childAssignments;

		this._parsedValue = null;
		this._childAssignments = null;

		if (this._valueMap[oldParsedValue] == this)
			delete this._valueMap[oldParsedValue];

		this.updateAssignment();

		for each (var childAssignment:AssignmentDescriptor in oldChildAssignments)
			childAssignment.clearValue();
	}

	public function updateAssignment() : void
	{
		var parent:ValueDescriptor = this._parent;
		if (!parent)
			return;

		var assignment:AssignmentDescriptor = parent.getChildAssignment(this._name);
		if (!assignment || !assignment.hasSetter || assignment.isSet)
			return;

		if (!this._hasValue)
		{
			assignment.clearValue();
			return;
		}

		if (!parent.isParsed || (assignment.parser != this._parser))
			return;

		assignment.isSet = true;

		if (!this._changed && !parent.changed)
			return;

		assignment.setValue(this._parsedValue);
	}

	public function updateChildAssignments() : void
	{
		if (!this.isParsed)
			return;

		for each (var childDescriptor:ValueDescriptor in this._children)
		{
			if (childDescriptor.isParsed)
				childDescriptor.updateAssignment();
		}
	}

	public function registerParsedValueReference(valueDescriptor:ValueDescriptor) : void
	{
		if (!this._parsedValueReferences)
			return;

		this._parsedValueReferences[valueDescriptor] = valueDescriptor;
	}

	public function registerProperty(propertyName:String, propertyParser:IPropertyParser, propertyGetter:Function = null, propertySetter:Function = null) : void
	{
		if (!this._childAssignments)
			return;

		this._childAssignments[propertyName] = new AssignmentDescriptor(this._parsedValue, propertyName, propertyParser, propertyGetter, propertySetter);
	}

	public function inheritProperties(propertyPath:Array) : void
	{
		if (!propertyPath || (propertyPath.length == 0))
			return;

		var propertyPathKey:String = propertyPath.join(".");
		if (this._inheritedPathsMap && this._inheritedPathsMap[propertyPathKey])
			return;

		var pathKey:String = this._path.join(".");
		if (propertyPathKey == pathKey)
			return;

		if (!this._inheritedPathsMap)
		{
			this._inheritedPathsMap = new Object();
			this._inheritedPaths = new Array();
		}

		this._inheritedPathsMap[propertyPathKey] = true;
		this._inheritedPaths.push(propertyPath);
	}

	public function getInheritedPaths() : Array
	{
		var inhertiedPaths:Array = this._inheritedPaths ? this._inheritedPaths.concat() : new Array();

		var inhertiedPathsMap:Object = new Object();
		var inhertiedPath:Array;
		var inhertiedPathKey:String;

		for each (inhertiedPath in inhertiedPaths)
		{
			inhertiedPathKey = inhertiedPath.join(".");
			inhertiedPathsMap[inhertiedPathKey] = true;
		}

		var parent:ValueDescriptor = this._parent;
		if (parent && parent.isParsed)
		{
			var assignment:AssignmentDescriptor = parent.getChildAssignment(this._name);
			if (assignment && assignment.hasSetter)
			{
				for each (inhertiedPath in parent.getInheritedPaths())
				{
					inhertiedPath = inhertiedPath.concat(this._name);
					inhertiedPathKey = inhertiedPath.join(".");
					if (!inhertiedPathsMap[inhertiedPathKey])
					{
						inhertiedPathsMap[inhertiedPathKey] = true;
						inhertiedPaths.push(inhertiedPath);
					}
				}
			}
		}

		return (inhertiedPaths.length > 0) ? inhertiedPaths : null;
	}

	public function getChildAssignment(propertyName:String) : AssignmentDescriptor
	{
		if (!this._childAssignments)
			return null;

		return this._childAssignments[propertyName];
	}

	public function prepareToParse() : void
	{
		this.isParsed = false;
		this.isChildrenParsed = false;
		this._changed = false;

		this._inheritedPathsMap = null;
		this._inheritedPaths = null;

		for each (var childAssignment:AssignmentDescriptor in this._childAssignments)
			childAssignment.isSet = false;

		for each (var childDescriptor:ValueDescriptor in this._children)
			childDescriptor.prepareToParse();
	}

	public function clearNotParsed() : void
	{
		var deleteChildren:Array = new Array();
		var children:Object = this._children;
		var childDescriptor:ValueDescriptor;

		for each (childDescriptor in children)
		{
			if (!childDescriptor.isParsed)
			{
				childDescriptor.clearValue();
				childDescriptor.clearNotParsed();
				if (childDescriptor.numChildren == 0)
					deleteChildren.push(childDescriptor);
			}
			else
			{
				childDescriptor.clearNotParsed();
			}
		}

		for each (childDescriptor in deleteChildren)
		{
			delete children[childDescriptor.name];
			this._numChildren--;
		}
	}

}

class AssignmentDescriptor
{

	// Public Properties

	public var isSet:Boolean = false;

	// Private Properties

	private var _target:*;
	private var _propertyName:String;
	private var _parser:IPropertyParser;
	private var _getter:Function;
	private var _setter:Function;

	private var _hasDefaultValue:Boolean = false;
	private var _defaultValue:*;

	// Constructor

	public function AssignmentDescriptor(target:*, propertyName:String, parser:IPropertyParser, getter:Function = null, setter:Function = null)
	{
		this._target = target;
		this._propertyName = propertyName;
		this._parser = parser;
		this._getter = getter;
		this._setter = setter;
	}

	// Public Getters/Setters

	public function get target() : *
	{
		return this._target;
	}

	public function get propertyName() : String
	{
		return this._propertyName;
	}

	public function get parser() : IPropertyParser
	{
		return this._parser;
	}

	public function get hasGetter() : Boolean
	{
		return (this._getter != null);
	}

	public function get hasSetter() : Boolean
	{
		return (this._setter != null);
	}

	// Public Methods

	public function getValue() : *
	{
		var value:*;

		if (this._getter == null)
			return value;

		try
		{
			value = this._getter(this._target, this._propertyName);
		}
		catch (e:Error)
		{
		}

		return value;
	}

	public function setValue(value:*) : void
	{
		if (this._setter == null)
			return;

		try
		{
			if (!this._hasDefaultValue && (this._getter != null))
			{
				this._defaultValue = this._getter(this._target, this._propertyName);
				this._hasDefaultValue = true;
			}
			this._setter(this._target, this._propertyName, value);
		}
		catch (e:Error)
		{
		}
	}

	public function clearValue() : void
	{
		if (!this._hasDefaultValue || (this._setter == null))
			return;

		var defaultValue:* = this._defaultValue;
		this._hasDefaultValue = false;
		this._defaultValue = null;

		try
		{
			this._setter(this._target, this._propertyName, defaultValue);
		}
		catch (e:Error)
		{
		}
	}

}
