package
{
	
	import com.splunk.nodegraph.*;
	import com.splunk.nodegraph.actions.*;
	import com.splunk.nodegraph.expressions.*;
	import com.splunk.nodegraph.renderers.*;
	import com.splunk.services.SplunkService;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.properties.ConfigFile;
	import com.splunk.services.properties.Key;
	import com.splunk.services.properties.Stanza;
	import com.splunk.services.search.SearchJob;
	import com.splunk.services.search.SearchJobResults;
	import com.splunk.services.search.data.ResultsData;
	
	import flare.vis.data.render.IRenderer;
	
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.MouseEvent;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	
	[SWF(backgroundColor=0xFFFFFF, frameRate=30)]
	
	public class nodegraph extends Sprite
	{
		
		// Private Properties
		
		private var _labelHost:TextField;
		private var _labelUsername:TextField;
		private var _labelPassword:TextField;
		private var _labelSearch:TextField;
		
		private var _inputHost:TextField;
		private var _inputUsername:TextField;
		private var _inputPassword:TextField;
		private var _inputSearch:TextField;
		
		private var _outputService:TextField;
		private var _outputConfig:TextField;
		private var _outputJob:TextField;
		private var _outputResults:TextField;
		
		private var _buttonLogin:Sprite;
		private var _buttonLogout:Sprite;
		private var _buttonDispatchSearch:Sprite;
		private var _buttonCancelSearch:Sprite;
		private var _buttonResultsFirst:Sprite;
		private var _buttonResultsPrev:Sprite;
		private var _buttonResultsPlay:Sprite;
		private var _buttonResultsNext:Sprite;
		private var _buttonResultsLast:Sprite;
		private var _buttonResultsClose:Sprite;
		private var _buttonClear:Sprite;
		
		private var _service:SplunkService;
		private var _config:ConfigFile;
		private var _job:SearchJob;
		private var _results:SearchJobResults;
		
		private var _rendererClasses:Object;
		private var _actionClasses:Object;
		private var _expressionClasses:Object;
		private var _renderers:Object;
		private var _actions:Object;
		private var _nodeGraph:NodeGraph;
		private var _numStanzas:int = 0;
		private var _numStanzasLoaded:int = 0;
		private var _resultIndex:int = -1;
		
		// Constructor
		
		public function nodegraph()
		{
			this.stage.align = StageAlign.TOP_LEFT;
			this.stage.scaleMode = StageScaleMode.NO_SCALE;
			this.stage.showDefaultContextMenu = false;
			
			this._rendererClasses = new Object();
			this._rendererClasses["DefaultNodeRenderer"] = DefaultNodeRenderer;
			this._rendererClasses["DefaultEdgeRenderer"] = DefaultEdgeRenderer;
			
			this._actionClasses = new Object();
			this._actionClasses["TraceAction"] = TraceAction;
			
			this._expressionClasses = new Object();
			this._expressionClasses["equal"] = Equal;
			this._expressionClasses["notEqual"] = NotEqual;
			this._expressionClasses["strictEqual"] = StrictEqual;
			this._expressionClasses["strictNotEqual"] = StrictNotEqual;
			this._expressionClasses["greaterThan"] = GreaterThan;
			this._expressionClasses["greaterThanEqual"] = GreaterThanEqual;
			this._expressionClasses["lessThan"] = LessThan;
			this._expressionClasses["lessThanEqual"] = LessThanEqual;
			
			this._renderers = new Object();
			this._actions = new Object();
			
			this._nodeGraph = this.addChild(new NodeGraph()) as NodeGraph;
			this._nodeGraph.x = 10;
			this._nodeGraph.y = 200;
			
			this._labelHost = this._createLabelField("Host", 10, 10);
			this._labelUsername = this._createLabelField("Username", 170, 10);
			this._labelPassword = this._createLabelField("Password", 330, 10);
			this._labelSearch = this._createLabelField("Search", 10, 60);
			
			this._inputHost = this._createInputField(10, 30, 150);
			this._inputUsername = this._createInputField(170, 30, 150);
			this._inputPassword = this._createInputField(330, 30, 150, true);
			this._inputSearch = this._createInputField(10, 80, 470);
			
			this._outputService = this._createOutputField(610, 30);
			this._outputConfig = this._createOutputField(610, 50);
			this._outputJob = this._createOutputField(610, 80);
			this._outputResults = this._createOutputField(610, 130);
			
			this._buttonLogin = this._createButton("Login", this._buttonLogin_click, 490, 30, 50);
			this._buttonLogout = this._createButton("Logout", this._buttonLogout_click, 550, 30, 50);
			this._buttonDispatchSearch = this._createButton("Search", this._buttonDispatchSearch_click, 490, 80, 50);
			this._buttonCancelSearch = this._createButton("Cancel", this._buttonCancelSearch_click, 550, 80, 50);
			this._buttonResultsFirst = this._createButton("|<", this._buttonResultsFirst_click, 390, 130, 20);
			this._buttonResultsPrev = this._createButton("<<", this._buttonResultsPrev_click, 420, 130, 20);
			this._buttonResultsPlay = this._createButton(">", this._buttonResultsPlay_click, 450, 130, 20);
			this._buttonResultsNext = this._createButton(">>", this._buttonResultsNext_click, 480, 130, 20);
			this._buttonResultsLast = this._createButton(">|", this._buttonResultsLast_click, 510, 130, 20);
			this._buttonResultsClose = this._createButton("Close", this._buttonResultsClose_click, 550, 130, 50);
			this._buttonClear = this._createButton("Clear Nodegraph", this._buttonClear_click, 490, 180, 110);
			
			var host:String = this.stage.loaderInfo.url;
			if (host.indexOf("http") == 0)
				host = host.substring(0, host.indexOf("/", 7));
			else
				host = "http://localhost:8000";
			this._inputHost.text = host;
			this._inputUsername.text = "admin";
			this._inputPassword.text = "changeme";
		}
		
		// Public Methods
		
		public function login(hostPath:String, username:String, password:String) : void
		{
			this.logout();
			
			try
			{
				this._debugService("Service connecting ...");
				
				this._service = new SplunkService(hostPath);
				this._service.addEventListener(ServiceEvent.CONNECT, this._service_connect);
				this._service.addEventListener(ServiceEvent.CLOSE, this._service_close);
				this._service.addEventListener(ServiceErrorEvent.ERROR, this._service_error);
				this._service.authenticate(username, password);
			}
			catch (e:Error)
			{
				this._errorService(e.message);
			}
		}
		
		public function logout() : void
		{
			this.cancelSearch();
			this.closeConfig();
			
			if (this._service != null)
			{
				this._service.close();
				this._service = null;
				
				this._debugService("Service closed.");
			}
		}
		
		public function loadConfig() : void
		{
			this.closeConfig();
			
			if (this._service == null)
				return;
			
			try
			{
				this._debugConfig("Config file loading ...");
				
				this._numStanzas = 0;
				this._numStanzasLoaded = 0;
				
				this._config = new ConfigFile(this._service, "nodegraph");
				this._config.addEventListener(ServiceEvent.COMPLETE, this._config_complete);
				this._config.addEventListener(ServiceEvent.CLOSE, this._config_close);
				this._config.addEventListener(ServiceErrorEvent.ERROR, this._config_error);
				this._config.load();
			}
			catch (e:Error)
			{
				this._errorConfig(e.message);
			}
		}
		
		public function closeConfig() : void
		{
			if (this._config != null)
			{
				this._config.close();
				this._config = null;
				
				this._debugConfig("Config file closed.");
			}
		}
		
		public function dispatchSearch(searchString:String) : void
		{
			this.cancelSearch();
			
			if (this._service == null)
				return;
			
			try
			{
				this._debugJob("Job dispatching ...");
				
				this._job = new SearchJob(this._service);
				this._job.addEventListener(ServiceEvent.CONNECT, this._job_connect);
				this._job.addEventListener(ServiceEvent.STATUS, this._job_status);
				this._job.addEventListener(ServiceEvent.DONE, this._job_done);
				this._job.addEventListener(ServiceEvent.CLOSE, this._job_close);
				this._job.addEventListener(ServiceErrorEvent.ERROR, this._job_error);
				this._job.dispatch(searchString);
			}
			catch (e:Error)
			{
				this._errorJob(e.message);
			}
		}
		
		public function cancelSearch() : void
		{
			this.closeResults();
			this._resultIndex = -1;
			
			if (this._job != null)
			{
				this._job.cancel();
				this._job.close();
				this._job = null;
				
				this._debugJob("Job closed.");
			}
		}
		
		public function loadResults(offset:int = 0, count:int = 0) : void
		{
			this.closeResults();
			
			if ((this._job == null) || (offset < 0) || (offset >= this._job.resultCount))
				return;
			
			try
			{
				this._debugResults("Results loading ...");
				
				this._results = new SearchJobResults(this._job);
				this._results.maxCount = 1;
				this._results.addEventListener(ServiceEvent.COMPLETE, this._results_complete);
				this._results.addEventListener(ServiceEvent.CLOSE, this._results_close);
				this._results.addEventListener(ServiceErrorEvent.ERROR, this._results_error);
				this._results.load(offset, count);
			}
			catch (e:Error)
			{
				this._errorResults(e.message);
			}
		}
		
		public function closeResults() : void
		{
			if (this._results != null)
			{
				this._results.close();
				this._results = null;
				
				this._debugResults("Results closed.");
			}
		}
		
		public function playResults() : void
		{
			this.loadResults(this._resultIndex + 1);
		}
		
		public function nextResult() : void
		{
			this.loadResults(this._resultIndex + 1, 1);
		}
		
		public function prevResult() : void
		{
			this.loadResults(this._resultIndex - 1, 1);
		}
		
		public function firstResult() : void
		{
			this.closeResults();
			this._resultIndex = -1;
		}
		
		public function lastResult() : void
		{
			this.closeResults();
			if ((this._job != null) && (this._job.resultCount > 0))
				this._resultIndex = this._job.resultCount;
			else
				this._resultIndex = -1;
		}
		
		public function clearNodeGraph() : void
		{
			this._nodeGraph.clear();
		}
		
		// Private Methods
		
		private function _createLabelField(name:String, x:Number = 0, y:Number = 0) : TextField
		{
			var labelField:TextField = new TextField();
			labelField.selectable = false;
			labelField.autoSize = TextFieldAutoSize.LEFT;
			labelField.defaultTextFormat = new TextFormat("_sans", 12, 0x000000);
			labelField.text = name;
			labelField.x = x;
			labelField.y = y;
			
			this.addChild(labelField);
			
			return labelField;
		}
		
		private function _createInputField(x:Number = 0, y:Number = 0, width:Number = 100, isPassword:Boolean = false) : TextField
		{
			var height:Number = 20;
			
			var inputField:TextField = new TextField();
			inputField.type = TextFieldType.INPUT;
			inputField.border = true;
			inputField.background = true;
			inputField.displayAsPassword = isPassword;
			inputField.defaultTextFormat = new TextFormat("_sans", 12, 0x000000);
			inputField.x = x;
			inputField.y = y;
			inputField.width = width;
			inputField.height = height;
			
			this.addChild(inputField);
			
			return inputField;
		}
		
		private function _createOutputField(x:Number = 0, y:Number = 0) : TextField
		{
			var outputField:TextField = new TextField();
			outputField.autoSize = TextFieldAutoSize.LEFT;
			outputField.multiline = true;
			outputField.defaultTextFormat = new TextFormat("_sans", 12, 0x000000);
			outputField.x = x;
			outputField.y = y;
			
			this.addChild(outputField);
			
			return outputField;
		}
		
		private function _createButton(name:String, onClick:Function, x:Number = 0, y:Number = 0, width:Number = 0) : Sprite
		{
			var height:Number = 20;
			
			var nameField:TextField = new TextField();
			nameField.selectable = false;
			nameField.autoSize = TextFieldAutoSize.LEFT;
			nameField.defaultTextFormat = new TextFormat("_sans", 12, 0x000000);
			nameField.text = name;
			
			if (width == 0)
				width = Math.ceil(nameField.width);
			
			nameField.x = Math.round((width - nameField.width) / 2);
			nameField.y = Math.round((height - nameField.height) / 2);
			
			var button:Sprite = new Sprite();
			button.buttonMode = true;
			button.mouseChildren = false;
			button.tabChildren = false;
			button.x = x;
			button.y = y;
			button.addChild(nameField);
			button.addEventListener(MouseEvent.CLICK, onClick);
			
			var g:Graphics = button.graphics;
			g.lineStyle(1, 0x000000, 1);
			g.beginFill(0xFFFFFF, 1);
			g.drawRect(0, 0, width, height);
			
			this.addChild(button);
			
			return button;
		}
		
		private function _debugService(o:*) : void
		{
			this._outputService.textColor = 0x000000;
			this._outputService.text = String(o);
		}
		
		private function _errorService(o:*) : void
		{
			this._outputService.textColor = 0xFF0000;
			this._outputService.text = "SERVICE ERROR: " + String(o);
		}
		
		private function _debugConfig(o:*) : void
		{
			this._outputConfig.textColor = 0x000000;
			this._outputConfig.text = String(o);
		}
		
		private function _errorConfig(o:*) : void
		{
			this._outputConfig.textColor = 0xFF0000;
			this._outputConfig.text = "CONFIG ERROR: " + String(o);
		}
		
		private function _debugJob(o:*) : void
		{
			this._outputJob.textColor = 0x000000;
			this._outputJob.text = String(o);
		}
		
		private function _errorJob(o:*) : void
		{
			this._outputJob.textColor = 0xFF0000;
			this._outputJob.text = "JOB ERROR: " + String(o);
		}
		
		private function _debugResults(o:*) : void
		{
			this._outputResults.textColor = 0x000000;
			this._outputResults.text = String(o);
		}
		
		private function _errorResults(o:*) : void
		{
			this._outputResults.textColor = 0xFF0000;
			this._outputResults.text = "RESULTS ERROR: " + String(o);
		}
		
		private function _parseConfig(config:ConfigFile) : void
		{
			var rendererStanzas:Array = new Array();
			var actionStanzas:Array = new Array();
			var noderuleStanzas:Array = new Array();
			var edgeruleStanzas:Array = new Array();
			
			var stanza:Stanza;
			var stanzaName:String;
			for each (stanza in config.stanzas)
			{
				stanzaName = stanza.name;
				switch (stanzaName.substring(0, stanzaName.indexOf(":")))
				{
					case "renderer":
						rendererStanzas.push(stanza);
						break;
					case "action":
						actionStanzas.push(stanza);
						break;
					case "noderule":
						noderuleStanzas.push(stanza);
						break;
					case "edgerule":
						edgeruleStanzas.push(stanza);
						break;
				}
			}
			
			for each (stanza in rendererStanzas)
			{
				stanzaName = stanza.name;
				this._renderers[stanzaName.substring(stanzaName.indexOf(":") + 1, stanzaName.length)] = this._parseRenderer(stanza);
			}
			
			for each (stanza in actionStanzas)
			{
				stanzaName = stanza.name;
				this._actions[stanzaName.substring(stanzaName.indexOf(":") + 1, stanzaName.length)] = this._parseAction(stanza);
			}
			
			var nodeRules:Array = new Array();
			noderuleStanzas.sort(this._ruleStanzaSorter);
			for each (stanza in noderuleStanzas)
				nodeRules.push(this._parseRule(stanza));
			
			var edgeRules:Array = new Array();
			edgeruleStanzas.sort(this._ruleStanzaSorter);
			for each (stanza in edgeruleStanzas)
				edgeRules.push(this._parseRule(stanza));
			
			this._nodeGraph.nodeRules = nodeRules;
			this._nodeGraph.edgeRules = edgeRules;
		}
		
		private function _parseRenderer(stanza:Stanza) : IRenderer
		{
			var typeKey:Key = stanza.keys.type;
			if (typeKey == null)
				throw new ConfigError("Renderer must have a type.");
			
			var rendererType:String = typeKey.value;
			
			var rendererClass:Class = this._rendererClasses[rendererType] as Class;
			if (rendererClass == null)
				throw new ConfigError("Renderer type '" + rendererType + "' not found.");
			
			var renderer:IRenderer = new rendererClass() as IRenderer;
			if (renderer == null)
				throw new ConfigError("Renderer could not be instantiated.");
			
			try
			{
				var keyName:String;
				for each (var key:Key in stanza.keys)
				{
					keyName = key.name;
					if ((keyName != "type") && (keyName != "_raw"))
						renderer[keyName] = key.value;
				}
			}
			catch (e:Error)
			{
				throw new ConfigError(e.message);
			}
			
			return renderer;
		}
		
		private function _parseAction(stanza:Stanza) : IAction
		{
			var typeKey:Key = stanza.keys.type;
			if (typeKey == null)
				throw new ConfigError("Action must have a type.");
			
			var actionType:String = typeKey.value;
			
			var actionClass:Class = this._actionClasses[actionType] as Class;
			if (actionClass == null)
				throw new ConfigError("Action type '" + actionType + "' not found.")
			
			var action:IAction = new actionClass() as IAction;
			if (action == null)
				throw new ConfigError("Action could not be instantiated.");
			
			try
			{
				var keyName:String;
				for each (var key:Key in stanza.keys)
				{
					keyName = key.name;
					if ((keyName != "type") && (keyName != "_raw"))
						action[keyName] = key.value;
				}
			}
			catch (e:Error)
			{
				throw new ConfigError(e.message);
			}
			
			return action;
		}
		
		private function _parseRule(stanza:Stanza) : Rule
		{
			var fields:Object = new Object();
			var conditions:Array = new Array();
			var renderer:IRenderer;
			var action:IAction;
			
			var keyName:Array;
			var condition:Object;
			for each (var key:Key in stanza.keys)
			{
				keyName = key.name.split(".");
				switch (keyName[0])
				{
					case "field":
						fields[keyName[1]] = key.value;
						break;
					case "condition":
						condition = new Object();
						condition.type = keyName[2];
						condition.field = keyName[1];
						condition.value = key.value;
						conditions.push(condition);
						break;
					case "renderer":
						renderer = this._renderers[key.value];
						break;
					case "action":
					action = this._actions[key.value];
					break;
				}
			}
			
			var andExpression:And = new And();
			var expressionType:String;
			var expressionClass:Class;
			var expression:AbstractExpression;
			for each (condition in conditions)
			{
					expressionType = condition.type;
					
					expressionClass = this._expressionClasses[expressionType] as Class;
					if (expressionClass == null)
						throw new ConfigError("Expression type '" + expressionType + "' not found.");
					
					expression = new expressionClass() as AbstractExpression;
					if (expression == null)
						throw new ConfigError("Expression could not be instantiated.");
					
					expression.addChild(new Variable(fields[condition.field]));
					expression.addChild(new Literal(condition.value));
					
					andExpression.addChild(expression);
			}
			
			var rule:Rule;
			if (andExpression.numChildren == 1)
				rule = new Rule(andExpression.getChildAt(0), renderer, action);
			else
				rule = new Rule(andExpression, renderer, action);
			
			try
			{
				rule.condition.eval(new Object());
			}
			catch (e:Error)
			{
				throw new ConfigError(e.message);
			}
			
			return rule;
		}
		
		private function _ruleStanzaSorter(stanza1:Stanza, stanza2:Stanza) : Number
		{
			var name1:String = stanza1.name;
			var name2:String = stanza2.name;
			
			var num1:Number = Number(name1.substring(name1.indexOf(":") + 1, name1.length));
			var num2:Number = Number(name2.substring(name2.indexOf(":") + 1, name2.length));
			
			if (num1 < num2)
				return -1;
			if (num1 > num2)
				return 1;
			return 0;
		}
		
		private function _parseResults(results:Array) : void
		{
			for each (var result:Object in results)
			{
				switch (result.action)
				{
					case "CONNECT":
						this._parseConnectResult(result);
						break;
					case "DISCONNECT":
						this._parseDisconnectResult(result);
						break;
					case "SET":
						this._parseSetResult(result);
						break;
				}
			}
		}
		
		private function _parseConnectResult(result:Object) : void
		{
			this._nodeGraph.connectNodes(result.start_node, result.end_node);
		}
		
		private function _parseDisconnectResult(result:Object) : void
		{
			this._nodeGraph.disconnectNodes(result.start_node, result.end_node);
		}
		
		private function _parseSetResult(result:Object) : void
		{
			var data:Object = new Object();
			for (var p:String in result)
			{
				if ((p != "action") && (p != "start_node") && (p != "end_node"))
					data[p] = result[p];
			}
			this._nodeGraph.setData(data, result.start_node, result.end_node);
		}
		
		// Event Handler Methods
		
		private function _buttonLogin_click(e:MouseEvent) : void
		{
			//http://75.101.151.83:8000
			//http://spacecake:48100
			
			this.login(this._inputHost.text, this._inputUsername.text, this._inputPassword.text);
		}
		
		private function _buttonLogout_click(e:MouseEvent) : void
		{
			this.logout();
		}
		
		private function _buttonDispatchSearch_click(e:MouseEvent) : void
		{
			//mocknodegraph nodecount=50 levelcount=4
			//mocknodegraph nodecount=50 levelcount=4 maxsiblings=10 seed=17
			//search index=_internal "statusee=tcpoutputprocessor" connect_done | dedup host | nodegraph start host, sourcePort end destIp, destPort connection_field=eventType
			//search index=_internal metrics "group=tcpin_connections" | nodegraph start sourceIp, sourcePort end host, destPort set tcp_bps, tcp_eps
			
			this.dispatchSearch(this._inputSearch.text);
		}
		
		private function _buttonCancelSearch_click(e:MouseEvent) : void
		{
			this.cancelSearch();
		}
		
		private function _buttonResultsFirst_click(e:MouseEvent) : void
		{
			this.firstResult();
		}
		
		private function _buttonResultsPrev_click(e:MouseEvent) : void
		{
			this.prevResult();
		}
		
		private function _buttonResultsPlay_click(e:MouseEvent) : void
		{
			this.playResults();
		}
		
		private function _buttonResultsNext_click(e:MouseEvent) : void
		{
			this.nextResult();
		}
		
		private function _buttonResultsLast_click(e:MouseEvent) : void
		{
			this.lastResult();
		}
		
		private function _buttonResultsClose_click(e:MouseEvent) : void
		{
			this.closeResults();
		}
		
		private function _buttonClear_click(e:MouseEvent) : void
		{
			this.clearNodeGraph();
		}
		
		private function _service_connect(e:ServiceEvent) : void
		{
			this._debugService("Service connected.");
			
			this.loadConfig();
		}
		
		private function _service_close(e:ServiceEvent) : void
		{
			this._debugService("Service closed.");
		}
		
		private function _service_error(e:ServiceErrorEvent) : void
		{
			this._errorService(e.text);
		}
		
		private function _config_complete(e:ServiceEvent) : void
		{
			this._debugConfig("Config file loaded.");
			
			for each (var stanza:Stanza in this._config.stanzas)
			{
				this._numStanzas++;
				stanza.addEventListener(ServiceEvent.COMPLETE, this._stanza_complete);
				stanza.addEventListener(ServiceErrorEvent.ERROR, this._stanza_error);
				stanza.load();
			}
		}
		
		private function _config_close(e:ServiceEvent) : void
		{
			this._debugConfig("Config file closed.");
		}
		
		private function _config_error(e:ServiceErrorEvent) : void
		{
			this._errorConfig(e.text);
		}
		
		private function _stanza_complete(e:ServiceEvent) : void
		{
			this._numStanzasLoaded++;
			if (this._numStanzasLoaded == this._numStanzas)
			{
				this._parseConfig(this._config);
				this._debugConfig("Config file parsed.");
			}
		}
		
		private function _stanza_error(e:ServiceErrorEvent) : void
		{
			this._errorConfig(e.text);
		}
		
		private function _job_connect(e:ServiceEvent) : void
		{
			this._debugJob("Job running ...");
		}
		
		private function _job_status(e:ServiceEvent) : void
		{
			this._debugJob("Job running ... " + this._job.resultCount + " results found."); 
		}
		
		private function _job_done(e:ServiceEvent) : void
		{
			this._debugJob("Job done: " + this._job.resultCount + " results found.");
			
			//this.loadResults();
		}
		
		private function _job_close(e:ServiceEvent) : void
		{
			this._debugJob("Job closed.");
		}
		
		private function _job_error(e:ServiceErrorEvent) : void
		{
			this._errorJob(e.text);
		}
		
		private function _results_complete(e:ServiceEvent) : void
		{
			var resultsData:ResultsData = this._results.resultsData;
			
			var debugString:String = "Result loaded: " + (resultsData.offset + 1) + " of " + this._job.resultCount;
			var hasAction:Boolean;
			var hasStartNode:Boolean;
			var hasEndNode:Boolean;
			var props:Array;
			var p:String;
			for each (var result:Object in resultsData.results)
			{
				hasAction = false;
				hasStartNode = false;
				hasEndNode = false;
				props = new Array();
				for (p in result)
				{
					if (p == "action")
						hasAction = true;
					else if (p == "start_node")
						hasStartNode = true;
					else if (p == "end_node")
						hasEndNode = true;
					else
						props.push(p);
				}
				props.sort();
				if (hasEndNode)
					props.unshift("end_node");
				if (hasStartNode)
					props.unshift("start_node");
				if (hasAction)
					props.unshift("action");
				
				debugString += "\n";
				for each (p in props)
					debugString += "\n" + p + "=" + result[p];
			}
			this._debugResults(debugString);
			
			this._parseResults(resultsData.results);
			
			this._resultIndex = resultsData.offset + resultsData.count - 1;
		}
		
		private function _results_close(e:ServiceEvent) : void
		{
			this._debugResults("Results closed.");
		}
		
		private function _results_error(e:ServiceErrorEvent) : void
		{
			this._errorResults(e.text);
		}
		
	}
	
}
