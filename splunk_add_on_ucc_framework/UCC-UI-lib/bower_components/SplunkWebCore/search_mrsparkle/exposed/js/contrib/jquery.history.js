
(function(window,undefined){"use strict";
var
console=window.console||undefined,
document=window.document,
navigator=window.navigator,
sessionStorage=window.sessionStorage||false,
setTimeout=window.setTimeout,
clearTimeout=window.clearTimeout,
setInterval=window.setInterval,
clearInterval=window.clearInterval,
JSON=window.JSON,
alert=window.alert,
History=window.History=window.History||{},
history=window.history;
JSON.stringify=JSON.stringify||JSON.encode;
JSON.parse=JSON.parse||JSON.decode;
if(typeof History.init!=='undefined'){
throw new Error('History.js Core has already been loaded...');}
History.init=function(){
if(typeof History.Adapter==='undefined'){
return false;}
if(typeof History.initCore!=='undefined'){
History.initCore();}
if(typeof History.initHtml4!=='undefined'){
History.initHtml4();}
return true;};
History.initCore=function(){
if(typeof History.initCore.initialized!=='undefined'){
return false;}
else{
History.initCore.initialized=true;}
History.options=History.options||{};
History.options.hashChangeInterval=History.options.hashChangeInterval||100;
History.options.safariPollInterval=History.options.safariPollInterval||500;
History.options.doubleCheckInterval=History.options.doubleCheckInterval||500;
History.options.storeInterval=History.options.storeInterval||1000;
History.options.busyDelay=History.options.busyDelay||250;
History.options.debug=History.options.debug||false;
History.options.initialTitle=History.options.initialTitle||document.title;
History.intervalList=[];
History.clearAllIntervals=function(){
var i,il=History.intervalList;
if(typeof il!=="undefined"&&il!==null){
for(i=0;i<il.length;i++){
clearInterval(il[i]);}
History.intervalList=null;}};
History.debug=function(){
if((History.options.debug||false)){
History.log.apply(History,arguments);}};
History.log=function(){
var
consoleExists=!(typeof console==='undefined'||typeof console.log==='undefined'||typeof console.log.apply==='undefined'),
textarea=document.getElementById('log'),
message,
i,n,
args,arg;
if(consoleExists){
args=Array.prototype.slice.call(arguments);
message=args.shift();
if(typeof console.debug!=='undefined'){
console.debug.apply(console,[message,args]);}
else{
console.log.apply(console,[message,args]);}}
else{
message=("\n"+arguments[0]+"\n");}
for(i=1,n=arguments.length;i<n;++i){
arg=arguments[i];
if(typeof arg==='object'&&typeof JSON!=='undefined'){
try{
arg=JSON.stringify(arg);}
catch(Exception){}}
message+="\n"+arg+"\n";}
if(textarea){
textarea.value+=message+"\n-----\n";
textarea.scrollTop=textarea.scrollHeight-textarea.clientHeight;}
else if(!consoleExists){
alert(message);}
return true;};
History.getInternetExplorerMajorVersion=function(){
var result=History.getInternetExplorerMajorVersion.cached=
(typeof History.getInternetExplorerMajorVersion.cached!=='undefined')?History.getInternetExplorerMajorVersion.cached:(function(){
var v=3,
div=document.createElement('div'),
all=div.getElementsByTagName('i');
while((div.innerHTML='<!--[if gt IE '+(++v)+']><i></i><![endif]-->')&&all[0]){}
return(v>4)?v:false;})();
return result;};
History.isInternetExplorer=function(){
var result=
History.isInternetExplorer.cached=
(typeof History.isInternetExplorer.cached!=='undefined')?History.isInternetExplorer.cached:Boolean(History.getInternetExplorerMajorVersion());
return result;};
History.emulated={
pushState:!Boolean(
window.history&&window.history.pushState&&window.history.replaceState&&!(
(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent)||(/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent))),
hashChange:Boolean(!(('onhashchange'in window)||('onhashchange'in document))||
(History.isInternetExplorer()&&History.getInternetExplorerMajorVersion()<8))};
History.enabled=!History.emulated.pushState;
History.bugs={
setHash:Boolean(!History.emulated.pushState&&navigator.vendor==='Apple Computer, Inc.'&&/AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),
safariPoll:Boolean(!History.emulated.pushState&&navigator.vendor==='Apple Computer, Inc.'&&/AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),
ieDoubleCheck:Boolean(History.isInternetExplorer()&&History.getInternetExplorerMajorVersion()<8),
hashEscape:Boolean(History.isInternetExplorer()&&History.getInternetExplorerMajorVersion()<7)};
History.isEmptyObject=function(obj){
for(var name in obj){
return false;}
return true;};
History.cloneObject=function(obj){
var hash,newObj;
if(obj){
hash=JSON.stringify(obj);
newObj=JSON.parse(hash);}
else{
newObj={};}
return newObj;};
History.getRootUrl=function(){
var rootUrl=document.location.protocol+'//'+(document.location.hostname||document.location.host);
if(document.location.port||false){
rootUrl+=':'+document.location.port;}
rootUrl+='/';
return rootUrl;};
History.getBaseHref=function(){
var
baseElements=document.getElementsByTagName('base'),
baseElement=null,
baseHref='';
if(baseElements.length===1){
baseElement=baseElements[0];
baseHref=baseElement.href.replace(/[^\/]+$/,'');}
baseHref=baseHref.replace(/\/+$/,'');
if(baseHref)baseHref+='/';
return baseHref;};
History.getBaseUrl=function(){
var baseUrl=History.getBaseHref()||History.getBasePageUrl()||History.getRootUrl();
return baseUrl;};
History.getPageUrl=function(){
var
State=History.getState(false,false),
stateUrl=(State||{}).url||document.location.href,
pageUrl;
pageUrl=stateUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(part,index,string){
return(/\./).test(part)?part:part+'/';});
return pageUrl;};
History.getBasePageUrl=function(){
var basePageUrl=document.location.href.replace(/[#\?].*/,'').replace(/[^\/]+$/,function(part,index,string){
return(/[^\/]$/).test(part)?'':part;}).replace(/\/+$/,'')+'/';
return basePageUrl;};
History.getFullUrl=function(url,allowBaseHref){
var fullUrl=url,firstChar=url.substring(0,1);
allowBaseHref=(typeof allowBaseHref==='undefined')?true:allowBaseHref;
if(/[a-z]+\:\/\//.test(url)){}
else if(firstChar==='/'){
fullUrl=History.getRootUrl()+url.replace(/^\/+/,'');}
else if(firstChar==='#'){
fullUrl=History.getPageUrl().replace(/#.*/,'')+url;}
else if(firstChar==='?'){
fullUrl=History.getPageUrl().replace(/[\?#].*/,'')+url;}
else{
if(allowBaseHref){
fullUrl=History.getBaseUrl()+url.replace(/^(\.\/)+/,'');}else{
fullUrl=History.getBasePageUrl()+url.replace(/^(\.\/)+/,'');}}
return fullUrl.replace(/\#$/,'');};
History.getShortUrl=function(url){
var shortUrl=url,baseUrl=History.getBaseUrl(),rootUrl=History.getRootUrl();
if(History.emulated.pushState){
shortUrl=shortUrl.replace(baseUrl,'');}
shortUrl=shortUrl.replace(rootUrl,'/');
if(History.isTraditionalAnchor(shortUrl)){
shortUrl='./'+shortUrl;}
shortUrl=shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');
return shortUrl;};
History.store={};
History.idToState=History.idToState||{};
History.stateToId=History.stateToId||{};
History.urlToId=History.urlToId||{};
History.storedStates=History.storedStates||[];
History.savedStates=History.savedStates||[];
History.normalizeStore=function(){
History.store.idToState=History.store.idToState||{};
History.store.urlToId=History.store.urlToId||{};
History.store.stateToId=History.store.stateToId||{};};
History.getState=function(friendly,create){
if(typeof friendly==='undefined'){friendly=true;}
if(typeof create==='undefined'){create=true;}
var State=History.getLastSavedState();
if(!State&&create){
State=History.createStateObject();}
if(friendly){
State=History.cloneObject(State);
State.url=State.cleanUrl||State.url;}
return State;};
History.getIdByState=function(newState){
var id=History.extractId(newState.url),
str;
if(!id){
str=History.getStateString(newState);
if(typeof History.stateToId[str]!=='undefined'){
id=History.stateToId[str];}
else if(typeof History.store.stateToId[str]!=='undefined'){
id=History.store.stateToId[str];}
else{
while(true){
id=(new Date()).getTime()+String(Math.random()).replace(/\D/g,'');
if(typeof History.idToState[id]==='undefined'&&typeof History.store.idToState[id]==='undefined'){
break;}}
History.stateToId[str]=id;
History.idToState[id]=newState;}}
return id;};
History.normalizeState=function(oldState){
var newState,dataNotEmpty;
if(!oldState||(typeof oldState!=='object')){
oldState={};}
if(typeof oldState.normalized!=='undefined'){
return oldState;}
if(!oldState.data||(typeof oldState.data!=='object')){
oldState.data={};}
newState={};
newState.normalized=true;
newState.title=oldState.title||'';
newState.url=History.getFullUrl(History.unescapeString(oldState.url||document.location.href));
newState.hash=History.getShortUrl(newState.url);
newState.data=History.cloneObject(oldState.data);
newState.id=History.getIdByState(newState);
newState.cleanUrl=newState.url.replace(/\??\&_suid.*/,'');
newState.url=newState.cleanUrl;
dataNotEmpty=!History.isEmptyObject(newState.data);
if(newState.title||dataNotEmpty){
newState.hash=History.getShortUrl(newState.url).replace(/\??\&_suid.*/,'');
if(!/\?/.test(newState.hash)){
newState.hash+='?';}
newState.hash+='&_suid='+newState.id;}
newState.hashedUrl=History.getFullUrl(newState.hash);
if((History.emulated.pushState||History.bugs.safariPoll)&&History.hasUrlDuplicate(newState)){
newState.url=newState.hashedUrl;}
return newState;};
History.createStateObject=function(data,title,url){
var State={'data':data,'title':title,'url':url};
State=History.normalizeState(State);
return State;};
History.getStateById=function(id){
id=String(id);
var State=History.idToState[id]||History.store.idToState[id]||undefined;
return State;};
History.getStateString=function(passedState){
var State,cleanedState,str;
State=History.normalizeState(passedState);
cleanedState={
data:State.data,
title:passedState.title,
url:passedState.url};
str=JSON.stringify(cleanedState);
return str;};
History.getStateId=function(passedState){
var State,id;
State=History.normalizeState(passedState);
id=State.id;
return id;};
History.getHashByState=function(passedState){
var State,hash;
State=History.normalizeState(passedState);
hash=State.hash;
return hash;};
History.extractId=function(url_or_hash){
var id,parts,url;
parts=/(.*)\&_suid=([0-9]+)$/.exec(url_or_hash);
url=parts?(parts[1]||url_or_hash):url_or_hash;
id=parts?String(parts[2]||''):'';
return id||false;};
History.isTraditionalAnchor=function(url_or_hash){
var isTraditional=!(/[\/\?\.]/.test(url_or_hash));
return isTraditional;};
History.extractState=function(url_or_hash,create){
var State=null,id,url;
create=create||false;
id=History.extractId(url_or_hash);
if(id){
State=History.getStateById(id);}
if(!State){
url=History.getFullUrl(url_or_hash);
id=History.getIdByUrl(url)||false;
if(id){
State=History.getStateById(id);}
if(!State&&create&&!History.isTraditionalAnchor(url_or_hash)){
State=History.createStateObject(null,null,url);}}
return State;};
History.getIdByUrl=function(url){
var id=History.urlToId[url]||History.store.urlToId[url]||undefined;
return id;};
History.getLastSavedState=function(){
return History.savedStates[History.savedStates.length-1]||undefined;};
History.getLastStoredState=function(){
return History.storedStates[History.storedStates.length-1]||undefined;};
History.hasUrlDuplicate=function(newState){
var hasDuplicate=false,
oldState;
oldState=History.extractState(newState.url);
hasDuplicate=oldState&&oldState.id!==newState.id;
return hasDuplicate;};
History.storeState=function(newState){
History.urlToId[newState.url]=newState.id;
History.storedStates.push(History.cloneObject(newState));
return newState;};
History.isLastSavedState=function(newState){
var isLast=false,
newId,oldState,oldId;
if(History.savedStates.length){
newId=newState.id;
oldState=History.getLastSavedState();
oldId=oldState.id;
isLast=(newId===oldId);}
return isLast;};
History.saveState=function(newState){
if(History.isLastSavedState(newState)){
return false;}
History.savedStates.push(History.cloneObject(newState));
return true;};
History.getStateByIndex=function(index){
var State=null;
if(typeof index==='undefined'){
State=History.savedStates[History.savedStates.length-1];}
else if(index<0){
State=History.savedStates[History.savedStates.length+index];}
else{
State=History.savedStates[index];}
return State;};
History.getHash=function(){
return History.unescapeHash(window.location.href.split("#")[1]||"");};
History.unescapeString=function(str){
return str;};
History.unescapeHash=function(hash){
var result=History.normalizeHash(hash);
result=History.unescapeString(result);
return result;};
History.normalizeHash=function(hash){
var result=hash.replace(/[^#]*#/,'').replace(/#.*/,'');
return result;};
History.setHash=function(hash,queue){
var adjustedHash,State,pageUrl;
if(queue!==false&&History.busy()){
History.pushQueue({
scope:History,
callback:History.setHash,
args:arguments,
queue:queue});
return false;}
adjustedHash=History.escapeHash(hash);
History.busy(true);
State=History.extractState(hash,true);
if(State&&!History.emulated.pushState){
History.pushState(State.data,State.title,State.url,false);}
else if(History.getHash()!==adjustedHash){
if(History.bugs.setHash){
pageUrl=History.getPageUrl();
History.pushState(null,null,pageUrl+'#'+adjustedHash,false);}
else{
document.location.hash=adjustedHash;}}
return History;};
History.escapeHash=function(hash){
return History.normalizeHash(hash);};
History.getHashByUrl=function(url){
var hash=String(url).replace(/([^#]*)#?([^#]*)#?(.*)/,'$2');
hash=History.unescapeHash(hash);
return hash;};
History.setTitle=function(newState){
var title=newState.title,
firstState;
if(!title){
firstState=History.getStateByIndex(0);
if(firstState&&firstState.url===newState.url){
title=firstState.title||History.options.initialTitle;}}
try{
document.getElementsByTagName('title')[0].innerHTML=title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');}
catch(Exception){}
document.title=title;
return History;};
History.queues=[];
History.busy=function(value){
if(typeof value!=='undefined'){
History.busy.flag=value;}
else if(typeof History.busy.flag==='undefined'){
History.busy.flag=false;}
if(!History.busy.flag){
clearTimeout(History.busy.timeout);
var fireNext=function(){
var i,queue,item;
if(History.busy.flag)return;
for(i=History.queues.length-1;i>=0;--i){
queue=History.queues[i];
if(queue.length===0)continue;
item=queue.shift();
History.fireQueueItem(item);
History.busy.timeout=setTimeout(fireNext,History.options.busyDelay);}};
History.busy.timeout=setTimeout(fireNext,History.options.busyDelay);}
return History.busy.flag;};
History.busy.flag=false;
History.fireQueueItem=function(item){
return item.callback.apply(item.scope||History,item.args||[]);};
History.pushQueue=function(item){
History.queues[item.queue||0]=History.queues[item.queue||0]||[];
History.queues[item.queue||0].push(item);
return History;};
History.queue=function(item,queue){
if(typeof item==='function'){
item={
callback:item};}
if(typeof queue!=='undefined'){
item.queue=queue;}
if(History.busy()){
History.pushQueue(item);}else{
History.fireQueueItem(item);}
return History;};
History.clearQueue=function(){
History.busy.flag=false;
History.queues=[];
return History;};
History.stateChanged=false;
History.doubleChecker=false;
History.doubleCheckComplete=function(){
History.stateChanged=true;
History.doubleCheckClear();
return History;};
History.doubleCheckClear=function(){
if(History.doubleChecker){
clearTimeout(History.doubleChecker);
History.doubleChecker=false;}
return History;};
History.doubleCheck=function(tryAgain){
History.stateChanged=false;
History.doubleCheckClear();
if(History.bugs.ieDoubleCheck){
History.doubleChecker=setTimeout(
function(){
History.doubleCheckClear();
if(!History.stateChanged){
tryAgain();}
return true;},
History.options.doubleCheckInterval);}
return History;};
History.safariStatePoll=function(){
var
urlState=History.extractState(document.location.href),
newState;
if(!History.isLastSavedState(urlState)){
newState=urlState;}
else{
return;}
if(!newState){
newState=History.createStateObject();}
History.Adapter.trigger(window,'popstate');
return History;};
History.back=function(queue){
if(queue!==false&&History.busy()){
History.pushQueue({
scope:History,
callback:History.back,
args:arguments,
queue:queue});
return false;}
History.busy(true);
History.doubleCheck(function(){
History.back(false);});
history.go(-1);
return true;};
History.forward=function(queue){
if(queue!==false&&History.busy()){
History.pushQueue({
scope:History,
callback:History.forward,
args:arguments,
queue:queue});
return false;}
History.busy(true);
History.doubleCheck(function(){
History.forward(false);});
history.go(1);
return true;};
History.go=function(index,queue){
var i;
if(index>0){
for(i=1;i<=index;++i){
History.forward(queue);}}
else if(index<0){
for(i=-1;i>=index;--i){
History.back(queue);}}
else{
throw new Error('History.go: History.go requires a positive or negative integer passed.');}
return History;};
if(History.emulated.pushState){
var emptyFunction=function(){};
History.pushState=History.pushState||emptyFunction;
History.replaceState=History.replaceState||emptyFunction;}
else{
History.onPopState=function(event,extra){
var stateId=false,newState=false,currentHash,currentState;
History.doubleCheckComplete();
currentHash=History.getHash();
if(currentHash){
currentState=History.extractState(currentHash||document.location.href,true);
if(currentState){
History.replaceState(currentState.data,currentState.title,currentState.url,false);}
else{
History.Adapter.trigger(window,'anchorchange');
History.busy(false);}
History.expectedStateId=false;
return false;}
stateId=History.Adapter.extractEventData('state',event,extra)||false;
if(stateId){
newState=History.getStateById(stateId);}
else if(History.expectedStateId){
newState=History.getStateById(History.expectedStateId);}
else{
newState=History.extractState(document.location.href);}
if(!newState){
newState=History.createStateObject(null,null,document.location.href);}
History.expectedStateId=false;
if(History.isLastSavedState(newState)){
History.busy(false);
return false;}
History.storeState(newState);
History.saveState(newState);
History.setTitle(newState);
History.Adapter.trigger(window,'statechange');
History.busy(false);
return true;};
History.Adapter.bind(window,'popstate',History.onPopState);
History.pushState=function(data,title,url,queue){
if(History.getHashByUrl(url)&&History.emulated.pushState){
throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');}
if(queue!==false&&History.busy()){
History.pushQueue({
scope:History,
callback:History.pushState,
args:arguments,
queue:queue});
return false;}
History.busy(true);
var newState=History.createStateObject(data,title,url);
if(History.isLastSavedState(newState)){
History.busy(false);}
else{
History.storeState(newState);
History.expectedStateId=newState.id;
history.pushState(newState.id,newState.title,newState.url);
History.Adapter.trigger(window,'popstate');}
return true;};
History.replaceState=function(data,title,url,queue){
if(History.getHashByUrl(url)&&History.emulated.pushState){
throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');}
if(queue!==false&&History.busy()){
History.pushQueue({
scope:History,
callback:History.replaceState,
args:arguments,
queue:queue});
return false;}
History.busy(true);
var newState=History.createStateObject(data,title,url);
if(History.isLastSavedState(newState)){
History.busy(false);}
else{
History.storeState(newState);
History.expectedStateId=newState.id;
history.replaceState(newState.id,newState.title,newState.url);
History.Adapter.trigger(window,'popstate');}
return true;};}
if(sessionStorage){
try{
History.store=JSON.parse(sessionStorage.getItem('History.store'))||{};}
catch(err){
History.store={};}
History.normalizeStore();}
else{
History.store={};
History.normalizeStore();}
History.Adapter.bind(window,"beforeunload",History.clearAllIntervals);
History.Adapter.bind(window,"unload",History.clearAllIntervals);
History.saveState(History.storeState(History.extractState(document.location.href,true)));
if(sessionStorage){
History.onUnload=function(){
var currentStore,item;
try{
currentStore=JSON.parse(sessionStorage.getItem('History.store'))||{};}
catch(err){
currentStore={};}
currentStore.idToState=currentStore.idToState||{};
currentStore.urlToId=currentStore.urlToId||{};
currentStore.stateToId=currentStore.stateToId||{};
for(item in History.idToState){
if(!History.idToState.hasOwnProperty(item)){
continue;}
currentStore.idToState[item]=History.idToState[item];}
for(item in History.urlToId){
if(!History.urlToId.hasOwnProperty(item)){
continue;}
currentStore.urlToId[item]=History.urlToId[item];}
for(item in History.stateToId){
if(!History.stateToId.hasOwnProperty(item)){
continue;}
currentStore.stateToId[item]=History.stateToId[item];}
History.store=currentStore;
History.normalizeStore();
sessionStorage.setItem('History.store',JSON.stringify(currentStore));};
History.intervalList.push(setInterval(History.onUnload,History.options.storeInterval));
History.Adapter.bind(window,'beforeunload',History.onUnload);
History.Adapter.bind(window,'unload',History.onUnload);}
if(!History.emulated.pushState){
if(History.bugs.safariPoll){
History.intervalList.push(setInterval(History.safariStatePoll,History.options.safariPollInterval));}
if(navigator.vendor==='Apple Computer, Inc.'||(navigator.appCodeName||'')==='Mozilla'){
History.Adapter.bind(window,'hashchange',function(){
History.Adapter.trigger(window,'popstate');});
if(History.getHash()){
History.Adapter.onDomLoad(function(){
History.Adapter.trigger(window,'hashchange');});}}}};
History.init();})(window);
(function(window,undefined){"use strict";
var
document=window.document,
setTimeout=window.setTimeout||setTimeout,
clearTimeout=window.clearTimeout||clearTimeout,
setInterval=window.setInterval||setInterval,
History=window.History=window.History||{};
if(typeof History.initHtml4!=='undefined'){
throw new Error('History.js HTML4 Support has already been loaded...');}
History.initHtml4=function(){
if(typeof History.initHtml4.initialized!=='undefined'){
return false;}
else{
History.initHtml4.initialized=true;}
History.enabled=true;
History.savedHashes=[];
History.isLastHash=function(newHash){
var oldHash=History.getHashByIndex(),
isLast;
isLast=newHash===oldHash;
return isLast;};
History.saveHash=function(newHash){
if(History.isLastHash(newHash)){
return false;}
History.savedHashes.push(newHash);
return true;};
History.getHashByIndex=function(index){
var hash=null;
if(typeof index==='undefined'){
hash=History.savedHashes[History.savedHashes.length-1];}
else if(index<0){
hash=History.savedHashes[History.savedHashes.length+index];}
else{
hash=History.savedHashes[index];}
return hash;};
History.discardedHashes={};
History.discardedStates={};
History.discardState=function(discardedState,forwardState,backState){
var discardedStateHash=History.getHashByState(discardedState),
discardObject;
discardObject={'discardedState':discardedState,'backState':backState,'forwardState':forwardState};
History.discardedStates[discardedStateHash]=discardObject;
return true;};
History.discardHash=function(discardedHash,forwardState,backState){
var discardObject={'discardedHash':discardedHash,'backState':backState,'forwardState':forwardState};
History.discardedHashes[discardedHash]=discardObject;
return true;};
History.discardedState=function(State){
var StateHash=History.getHashByState(State),
discarded;
discarded=History.discardedStates[StateHash]||false;
return discarded;};
History.discardedHash=function(hash){
var discarded=History.discardedHashes[hash]||false;
return discarded;};
History.recycleState=function(State){
var StateHash=History.getHashByState(State);
if(History.discardedState(State)){
delete History.discardedStates[StateHash];}
return true;};
if(History.emulated.hashChange){
History.hashChangeInit=function(){
History.checkerFunction=null;
var lastDocumentHash='',
iframeId,iframe,
lastIframeHash,checkerRunning;
if(History.isInternetExplorer()){
iframeId='historyjs-iframe';
iframe=document.createElement('iframe');
iframe.setAttribute('id',iframeId);
iframe.style.display='none';
document.body.appendChild(iframe);
iframe.contentWindow.document.open();
iframe.contentWindow.document.close();
lastIframeHash='';
checkerRunning=false;
History.checkerFunction=function(){
if(checkerRunning){
return false;}
checkerRunning=true;
var documentHash=History.getHash()||'',
iframeHash=History.unescapeHash(iframe.contentWindow.document.location.href.split("#")[1]||'')||'';
if(documentHash!==lastDocumentHash){
lastDocumentHash=documentHash;
if(iframeHash!==documentHash){
lastIframeHash=iframeHash=documentHash;
iframe.contentWindow.document.open();
iframe.contentWindow.document.close();
iframe.contentWindow.document.location.hash=History.escapeHash(documentHash);}
History.Adapter.trigger(window,'hashchange');}
else if(iframeHash!==lastIframeHash){
lastIframeHash=iframeHash;
History.setHash(iframeHash,false);}
checkerRunning=false;
return true;};}
else{
History.checkerFunction=function(){
var documentHash=History.getHash();
if(documentHash!==lastDocumentHash){
lastDocumentHash=documentHash;
History.Adapter.trigger(window,'hashchange');}
return true;};}
History.intervalList.push(setInterval(History.checkerFunction,History.options.hashChangeInterval));
return true;};
History.Adapter.onDomLoad(History.hashChangeInit);}
if(History.emulated.pushState){
History.onHashChange=function(event){
var currentUrl=((event&&event.newURL)||document.location.href),
currentHash=History.getHashByUrl(currentUrl),
currentState=null,
currentStateHash=null,
currentStateHashExits=null,
discardObject;
if(History.isLastHash(currentHash)){
History.busy(false);
return false;}
History.doubleCheckComplete();
History.saveHash(currentHash);
if(currentHash&&History.isTraditionalAnchor(currentHash)){
History.Adapter.trigger(window,'anchorchange');
History.busy(false);
return false;}
currentState=History.extractState(History.getFullUrl(currentHash||document.location.href,false),true);
if(History.isLastSavedState(currentState)){
History.busy(false);
return false;}
currentStateHash=History.getHashByState(currentState);
discardObject=History.discardedState(currentState);
if(discardObject){
if(History.getHashByIndex(-2)===History.getHashByState(discardObject.forwardState)){
History.back(false);}else{
History.forward(false);}
return false;}
History.pushState(currentState.data,currentState.title,currentState.url,false);
return true;};
History.Adapter.bind(window,'hashchange',History.onHashChange);
History.pushState=function(data,title,url,queue){
if(History.getHashByUrl(url)){
throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');}
if(queue!==false&&History.busy()){
History.pushQueue({
scope:History,
callback:History.pushState,
args:arguments,
queue:queue});
return false;}
History.busy(true);
var newState=History.createStateObject(data,title,url),
newStateHash=History.getHashByState(newState),
oldState=History.getState(false),
oldStateHash=History.getHashByState(oldState),
html4Hash=History.getHash();
History.storeState(newState);
History.expectedStateId=newState.id;
History.recycleState(newState);
History.setTitle(newState);
if(newStateHash===oldStateHash){
History.busy(false);
return false;}
if(newStateHash!==html4Hash&&newStateHash!==History.getShortUrl(document.location.href)){
History.setHash(newStateHash,false);
return false;}
History.saveState(newState);
History.Adapter.trigger(window,'statechange');
History.busy(false);
return true;};
History.replaceState=function(data,title,url,queue){
if(History.getHashByUrl(url)){
throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');}
if(queue!==false&&History.busy()){
History.pushQueue({
scope:History,
callback:History.replaceState,
args:arguments,
queue:queue});
return false;}
History.busy(true);
var newState=History.createStateObject(data,title,url),
oldState=History.getState(false),
previousState=History.getStateByIndex(-2);
History.discardState(oldState,newState,previousState);
History.pushState(newState.data,newState.title,newState.url,false);
return true;};}
if(History.emulated.pushState){
if(History.getHash()&&!History.emulated.hashChange){
History.Adapter.onDomLoad(function(){
History.Adapter.trigger(window,'hashchange');});}}};
if(typeof History.init!=='undefined'){
History.init();}})(window);
(function(window,undefined){"use strict";
var
History=window.History=window.History||{},
jQuery=window.jQuery;
if(typeof History.Adapter!=='undefined'){
throw new Error('History.js Adapter has already been loaded...');}
History.Adapter={
bind:function(el,event,callback){
jQuery(el).bind(event,callback);},
trigger:function(el,event,extra){
jQuery(el).trigger(event,extra);},
extractEventData:function(key,event,extra){
var result=(event&&event.originalEvent&&event.originalEvent[key])||(extra&&extra[key])||undefined;
return result;},
onDomLoad:function(callback){
jQuery(callback);}};
if(typeof History.init!=='undefined'){
History.init();}})(window);