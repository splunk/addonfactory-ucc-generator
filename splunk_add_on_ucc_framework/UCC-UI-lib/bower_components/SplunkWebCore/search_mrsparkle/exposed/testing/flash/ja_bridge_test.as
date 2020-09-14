package
{

	import com.splunk.external.JABridge;
	import fl.controls.*;
	import flash.display.*;
	import flash.events.*;
	import flash.ui.*;
	import flash.utils.*;

	public class ja_bridge_test extends Sprite
	{

		// Private Properties

		private var _prop1:Boolean = false;
		private var _prop2:Number = 123.456;
		private var _prop3:String = "hello world";
		private var _prop4:Array = [ 1, 2, 3, 4, 5 ];
		private var _prop5:Object = { a:1, b:2, c:3 };
		private var _prop6:String = "hello";
		private var _prop7:String = "world";

		private var _listeners:Object;

		private var _input:TextInput;
		private var _output:TextArea;

		// Constructor

		public function ja_bridge_test()
		{
			this.stage.align = StageAlign.TOP_LEFT;
			this.stage.scaleMode = StageScaleMode.NO_SCALE;
			this.stage.addEventListener(Event.RESIZE, this._stage_resize);

			this._listeners = new Object();

			this._input = new TextInput();
			this._input.addEventListener(KeyboardEvent.KEY_DOWN, this._input_keyDown);
			this.addChild(this._input);

			this._output = new TextArea();
			this._output.editable = false;
			this.addChild(this._output);

			JABridge.addProperty("prop1", this._getProp1, this._setProp1, "Boolean", "Description for property 1.");
			JABridge.addProperty("prop2", this._getProp2, this._setProp2, "Number", "Description for property 2.");
			JABridge.addProperty("prop3", this._getProp3, this._setProp3, "String", "Description for property 3.");
			JABridge.addProperty("prop4", this._getProp4, this._setProp4, "Array", "Description for property 4.");
			JABridge.addProperty("prop5", this._getProp5, this._setProp5, "Object", "Description for property 5.");
			JABridge.addProperty("prop6", this._getProp6, null, "String", "Description for property 6.");
			JABridge.addProperty("prop7", null, this._setProp7, "String", "Description for property 7.");
			JABridge.addProperty("bad1", this._getBad1, null, "String", "Multibyte string.");
			JABridge.addProperty("bad2", this._getBad2, null, "Object", "Object with complex property names.");
			JABridge.addProperty("bad3", this._getBad3, null, "Object", "Object with circular reference.");
			JABridge.addProperty("big", this._getBig, null, "*", "A big object.");
			JABridge.addProperty("用以打招呼或喚起注意", this._getBad1, null, "String", "Multibyte string as property name.");

			JABridge.addMethod("method1", this._method1, [], "void", "Description for method 1.");
			JABridge.addMethod("method2", this._method2, [ "arg1:Boolean", "arg2:Number", "arg3:String", "arg4:Array", "arg5:Object" ], "void", "Description for method 2.");
			JABridge.addMethod("method3", this._method3, [ "num:Number" ], "Number", "Description for method 3.");
			JABridge.addMethod("ping", this._ping, [ "value:*" ], "*", "Returns given value.");

			JABridge.addEvent("event1", [ "..." ], "Description for event 1.");
			JABridge.addEvent("event2", [ "..." ], "Description for event 2.");

			this.redraw();
		}

		// Public Methods

		public function redraw() : void
		{
			var width:Number = this.stage.stageWidth;
			var height:Number = this.stage.stageHeight;

			this._output.move(10, 10);
			this._output.setSize(Math.max(width - 20, 0), Math.max(height - 22 - 30, 0));

			this._input.move(10, this._output.y + this._output.height + 10);
			this._input.setSize(Math.max(width - 20, 0), 22);
		}

		public function execCommand(command:String = "") : void
		{
			if (!command)
				command = this._input.text;
			if (command.length == 0)
				return;

			this._input.text = "";

			this.outputCommand(command);

			try
			{
				var commandSplit:Array = command.split(" ");
				switch (commandSplit[0])
				{
					case "connect":
						this.execConnect();
						break;
					case "close":
						this.execClose();
						break;
					case "getInterface":
						this.execGetInterface();
						break;
					case "getProperty":
						this.execGetProperty(commandSplit.slice(1, commandSplit.length));
						break;
					case "setProperty":
						this.execSetProperty(commandSplit.slice(1, commandSplit.length));
						break;
					case "callMethod":
						this.execCallMethod(commandSplit.slice(1, commandSplit.length));
						break;
					case "dispatchEvent":
						this.execDispatchEvent(commandSplit.slice(1, commandSplit.length));
						break;
					case "addEventListener":
						this.execAddEventListener(commandSplit.slice(1, commandSplit.length));
						break;
					case "removeEventListener":
						this.execRemoveEventListener(commandSplit.slice(1, commandSplit.length));
						break;
					case "time":
						this.execTime(commandSplit.slice(1, commandSplit.length));
						break;
					case "clear":
						this.execClear();
						break;
					case "test1":
						this.execTest1();
						break;
					case "test2":
						this.execTest2();
						break;
					default:
						throw new Error("Unknown command.");
						break;
				}
			}
			catch (e:Error)
			{
				this.outputError(e);
			}
		}

		public function execConnect() : void
		{
			JABridge.connect(this._JABridge_connect, this._JABridge_close);
		}

		public function execClose() : void
		{
			JABridge.close();
		}

		public function execGetInterface() : void
		{
			var obj:Object = JABridge.getInterface();
			this.outputResult(obj);
		}

		public function execGetProperty(args:Array) : void
		{
			if (args.length < 1)
				throw new Error("Usage: getProperty &lt;name&gt;");

			var value:* = JABridge.getProperty(args[0]);
			this.outputResult(value);
		}

		public function execSetProperty(args:Array) : void
		{
			if (args.length < 2)
				throw new Error("Usage: setProperty &lt;name&gt; &lt;value&gt;");

			args[1] = this._parseArg(args[1]);

			JABridge.setProperty(args[0], args[1]);
		}

		public function execCallMethod(args:Array) : void
		{
			if (args.length < 1)
				throw new Error("Usage: callMethod &lt;name&gt; &lt;arg1&gt; &lt;arg2&gt; ...");

			var numArgs:int = args.length;
			for (var i:int = 1; i < numArgs; i++)
				args[i] = this._parseArg(args[i]);

			var result:* = JABridge.callMethod.apply(null, args);
			this.outputResult(result);
		}

		public function execDispatchEvent(args:Array) : void
		{
			if (args.length < 1)
				throw new Error("Usage: dispatchEvent &lt;name&gt; &lt;arg1&gt; &lt;arg2&gt; ...");

			var numArgs:int = args.length;
			for (var i:int = 1; i < numArgs; i++)
				args[i] = this._parseArg(args[i]);

			JABridge.dispatchEvent.apply(null, args);
		}

		public function execAddEventListener(args:Array) : void
		{
			if (args.length < 2)
				throw new Error("Usage: addEventListener &lt;eventName&gt; &lt;listenerID&gt;");

			var eventName:String = args[0];
			var listenerID:String = args[1];

			var listener:Function = this._listeners[listenerID];
			if (listener == null)
			{
				var self:ja_bridge_test = this;
				listener = this._listeners[listenerID] = function(...args) : void
				{
					self.outputText(listenerID + " " + args);
				};
			}

			JABridge.addEventListener(eventName, listener);
		}

		public function execRemoveEventListener(args:Array) : void
		{
			if (args.length < 2)
				throw new Error("Usage: removeEventListener &lt;eventName&gt; &lt;listenerID&gt;");

			var eventName:String = args[0];
			var listenerID:String = args[1];

			var listener:Function = this._listeners[listenerID];
			if (listener == null)
				return;

			JABridge.removeEventListener(eventName, listener);
		}

		public function execTime(args:Array) : void
		{
			var startTime:int = getTimer();
			this.execCommand(args.join(" "));
			var endTime:int = getTimer();
			this.outputText("execution time = " + (endTime - startTime) + " milliseconds");
		}

		public function execClear() : void
		{
			this._output.text = "";
		}

		public function execTest1() : void
		{
			var value:* = this._getBig();

			this.outputText("send: " + value);

			var startTime:int = getTimer();
			var result:* = JABridge.callMethod("ping", value);
			var endTime:int = getTimer();

			this.outputText("receive: " + result);
			this.outputText("equal: " + this._compare(value, result));
			this.outputText("execution time = " + (endTime - startTime) + " milliseconds");
		}

		public function execTest2() : void
		{
			var arr:Array = new Array();
			for (var i:int = 0; i < 10000; i++)
				arr.push(Math.round(Math.random() * 1000000));

			var value:* = arr;

			//this.outputText("send: " + value);

			var startTime:int = getTimer();
			var result:* = JABridge.callMethod("ping", value);
			var endTime:int = getTimer();

			//this.outputText("receive: " + result);
			this.outputText("equal: " + this._compare(value, result));
			this.outputText("execution time = " + (endTime - startTime) + " milliseconds");
		}

		public function outputCommand(command:String) : void
		{
			this._output.htmlText += "<FONT color=\"#0000FF\">" + command + "</FONT>\n";
			this._output.verticalScrollPosition = this._output.maxVerticalScrollPosition;
		}

		public function outputResult(value:*) : void
		{
			this._output.htmlText += "<FONT color=\"#00FF00\">" + value + "</FONT>\n";
			this._output.verticalScrollPosition = this._output.maxVerticalScrollPosition;
		}

		public function outputError(e:Error) : void
		{
			this._output.htmlText += "<FONT color=\"#FF0000\">" + e + "</FONT>\n";
			this._output.verticalScrollPosition = this._output.maxVerticalScrollPosition;
		}

		public function outputText(value:*) : void
		{
			this._output.htmlText += value + "\n";
			this._output.verticalScrollPosition = this._output.maxVerticalScrollPosition;
		}

		// Private Methods

		private function _parseArg(arg:String) : *
		{
			if (!arg)
				throw new Error("Cannot parse empty value.");

			if (arg == "bad1")
				return this._getBad1();
			if (arg == "bad2")
				return this._getBad2();
			if (arg == "bad3")
				return this._getBad3();
			if (arg == "big")
				return this._getBig();

			if (arg == "true")
				return true;

			if (arg == "false")
				return false;

			if ((arg.charAt(0) == "\"") || (arg.charAt(0) == "'"))
				return arg.substring(1, arg.length - 1);

			if (arg.charAt(0) == "[")
			{
				arg = arg.substring(1, arg.length - 1);
				var array:Array = (arg.indexOf(",") < 0) ? [] : arg.split(",");
				var length:int = array.length;
				for (var i:int = 0; i < length; i++)
					array[i] = this._parseArg(array[i]);
				return array;
			}

			if (arg.charAt(0) == "{")
			{
				arg = arg.substring(1, arg.length - 1);
				var props:Array = (arg.indexOf(",") < 0) ? [] : arg.split(",");
				var propSplit:Array;
				var obj:Object = new Object();
				for each (var prop:String in props)
				{
					propSplit = prop.split(":");
					obj[propSplit[0]] = this._parseArg(propSplit[1]);
				}
				return obj;
			}

			var num:Number = Number(arg);
			if (!isNaN(num))
				return num;

			throw new Error("Cannot parse: " + arg);
		}

		private function _stage_resize(e:Event) : void
		{
			this.redraw();
		}

		private function _input_keyDown(e:KeyboardEvent) : void
		{
			switch (e.keyCode)
			{
				case Keyboard.ENTER:
					this.execCommand();
					break;
			}
		}

		private function _JABridge_connect() : void
		{
			this.outputText("connected");
			this.outputText(JABridge.getInterface());
		}

		private function _JABridge_close() : void
		{
			this.outputText("closed");
		}

		private function _getProp1() : Boolean
		{
			return this._prop1;
		}
		private function _setProp1(value:Boolean) : void
		{
			this._prop1 = value;
			this.outputText("prop1 set to " + this._prop1);
		}

		private function _getProp2() : Number
		{
			return this._prop2;
		}
		private function _setProp2(value:Number) : void
		{
			this._prop2 = value;
			this.outputText("prop2 set to " + this._prop2);
		}

		private function _getProp3() : String
		{
			return this._prop3;
		}
		private function _setProp3(value:String) : void
		{
			this._prop3 = value;
			this.outputText("prop3 set to " + this._prop3);
		}

		private function _getProp4() : Array
		{
			return this._prop4;
		}
		private function _setProp4(value:Array) : void
		{
			this._prop4 = value;
			this.outputText("prop4 set to " + this._prop4);
		}

		private function _getProp5() : Object
		{
			return this._prop5;
		}
		private function _setProp5(value:Object) : void
		{
			this._prop5 = value;
			this.outputText("prop5 set to " + this._prop5);
		}

		private function _getProp6() : String
		{
			return this._prop6;
		}

		private function _setProp7(value:String) : void
		{
			this._prop7 = value;
			this.outputText("prop7 set to " + this._prop7);
		}

		private function _getBad1() : String
		{
			return "用以打招呼或喚起注意";
		}

		private function _getBad2() : Object
		{
			var obj:Object = new Object();
			obj["foo.bar"] = "hello";
			return obj;
		}

		private function _getBad3() : Object
		{
			var obj:Object = new Object();
			obj.self = obj;
			return obj;
		}

		private function _getBig(breadth:int = 10, depth:int = 4) : *
		{
			if (depth <= 0)
				return Math.round(Math.random() * 1000000);

			var obj:Object = new Object();
			for (var i:int = 0; i < breadth; i++)
				obj["prop" + i] = this._getBig(breadth, depth - 1);
			return obj;
		}

		private function _method1() : void
		{
			this.outputText("method1 called");
		}

		private function _method2(arg1:Boolean, arg2:Number, arg3:String, arg4:Array, arg5:Object) : void
		{
			this.outputText("method2 called");
			this.outputText("  arg1=" + arg1);
			this.outputText("  arg2=" + arg2);
			this.outputText("  arg3=" + arg3);
			this.outputText("  arg4=" + arg4);
			this.outputText("  arg5=" + arg5);
		}

		private function _method3(num:Number) : Number
		{
			this.outputText("method3 called");
			this.outputText("  num=" + num);
			return num + 1;
		}

		private function _ping(value:*) : *
		{
			return value;
		}

		private function _compare(val1:*, val2:*) : Boolean
		{
			var type1:String = typeof(val1);
			var type2:String = typeof(val2);
			if (type1 != type2)
				return false;

			switch (type1)
			{
				case "number":
				case "boolean":
				case "string":
					return (val1 == val2);
				default:
					var props:Object = new Object();
					var p:String;
					for (p in val1)
					{
						props[p] = 1;
					}
					for (p in val2)
					{
						if (props[p] != 1)
							return false;
						props[p] = 2;
					}
					for (p in props)
					{
						if (props[p] != 2)
							return false;
					}
					for (p in props)
					{
						if (!this._compare(val1[p], val2[p]))
							return false;
					}
					return true;
			}
		}

	}

}
