

/*
    this is here to fill in the dictionary cause we dont actually pull down the /config URL,
    so that we can get a more stable ground truth of config. 
*/
if (!window.$C) {
    window.$C = {};
}
window.$C["SERVER_ZONEINFO"] = "### SERIALIZED TIMEZONE FORMAT 1.0;Y-25200 YW 50 44 54;Y-28800 NW 50 53 54;Y-25200 YW 50 57 54;Y-25200 YG 50 50 54;@-1633269600 0;@-1615129200 1;@-1601820000 0;@-1583679600 1;@-880207200 2;@-769395600 3;@-765385200 1;@-687967200 0;@-662655600 1;@-620834400 0;@-608137200 1;@-589384800 0;@-576082800 1;@-557935200 0;@-544633200 1;@-526485600 0;@-513183600 1;@-495036000 0;@-481734000 1;@-463586400 0;@-450284400 1;@-431532000 0;@-418230000 1;@-400082400 0;@-386780400 1;@-368632800 0;@-355330800 1;@-337183200 0;@-323881200 1;@-305733600 0;@-292431600 1;@-273679200 0;@-260982000 1;@-242229600 0;@-226508400 1;@-210780000 0;@-195058800 1;@-179330400 0;@-163609200 1;@-147880800 0;@-131554800 1;@-116431200 0;@-100105200 1;@-84376800 0;@-68655600 1;@-52927200 0;@-37206000 1;@-21477600 0;@-5756400 1;@9972000 0;@25693200 1;@41421600 0;@57747600 1;@73476000 0;@89197200 1;@104925600 0;@120646800 1;@126698400 0;@152096400 1;@162381600 0;@183546000 1;@199274400 0;@215600400 1;@230724000 0;@247050000 1;@262778400 0;@278499600 1;@294228000 0;@309949200 1;@325677600 0;@341398800 1;@357127200 0;@372848400 1;@388576800 0;@404902800 1;@420026400 0;@436352400 1;@452080800 0;@467802000 1;@483530400 0;@499251600 1;@514980000 0;@530701200 1;@544615200 0;@562150800 1;@576064800 0;@594205200 1;@607514400 0;@625654800 1;@638964000 0;@657104400 1;@671018400 0;@688554000 1;@702468000 0;@720003600 1;@733917600 0;@752058000 1;@765367200 0;@783507600 1;@796816800 0;@814957200 1;@828871200 0;@846406800 1;@860320800 0;@877856400 1;@891770400 0;@909306000 1;@923220000 0;@941360400 1;@954669600 0;@972810000 1;@986119200 0;@1004259600 1;@1018173600 0;@1035709200 1;@1049623200 0;@1067158800 1;@1081072800 0;@1099213200 1;@1112522400 0;@1130662800 1;@1143972000 0;@1162112400 1;@1173607200 0;@1194166800 1;@1205056800 0;@1225616400 1;@1236506400 0;@1257066000 1;@1268560800 0;@1289120400 1;@1300010400 0;@1320570000 1;@1331460000 0;@1352019600 1;@1362909600 0;@1383469200 1;@1394359200 0;@1414918800 1;@1425808800 0;@1446368400 1;@1457863200 0;@1478422800 1;@1489312800 0;@1509872400 1;@1520762400 0;@1541322000 1;@1552212000 0;@1572771600 1;@1583661600 0;@1604221200 1;@1615716000 0;@1636275600 1;@1647165600 0;@1667725200 1;@1678615200 0;@1699174800 1;@1710064800 0;@1730624400 1;@1741514400 0;@1762074000 1;@1772964000 0;@1793523600 1;@1805018400 0;@1825578000 1;@1836468000 0;@1857027600 1;@1867917600 0;@1888477200 1;@1899367200 0;@1919926800 1;@1930816800 0;@1951376400 1;@1962871200 0;@1983430800 1;@1994320800 0;@2014880400 1;@2025770400 0;@2046330000 1;@2057220000 0;@2077779600 1;@2088669600 0;@2109229200 1;@2120119200 0;@2140678800 1;$";
window.$C["SYSTEM_NAMESPACE"] = "system";
window.$C["LOCALE"] = "en-US";
window.$C["SERVER_TIMEZONE_OFFSET"] = 25200;
window.$C["FLASH_MAJOR_VERSION"] = "9";
window.$C["FLASH_MINOR_VERSION"] = "0";
window.$C["FLASH_REVISION_VERSION"] = "0";

// for some reason util.make_url has hardcoded references to window.$C
window.$C['BUILD_NUMBER'] = 600000;
window.$C['BUILD_PUSH_NUMBER'] = 0;

// CURRENTLY NOT SUPPORTED. CODE WILL CALL $.extend(true, {}, obj) ON IT, WHICH WILL FAIL.
//var genericObject = function() {
//    this.foo = null;
//}

var mockClonableObject = function() {
    this.foo = null;
};
mockClonableObject.prototype.clone = function() {
    var myClone = new mockClonableObject();
    myClone.foo = this.foo;
    return myClone;
};


function getModuleTypes() {
    var moduleTypes = [];
    for (var name in Splunk.Module) {
        if (Splunk.Module.hasOwnProperty(name) 
            && Splunk.Module[name] && Splunk.Module[name].hasOwnProperty("superclass")
            && name != "Paginator" // terrible hack, I know, but this module can not be tested
            && !Splunk.Module[name].isAbstract) 
        {
            moduleTypes.push(name);
        }
    }
    return moduleTypes;
}

/**
 * Useful method that will run the given function once for every module class.
 */
function callForEachModule(func, generateArgs) {
    for (var i=0, lim=moduleTypes.length; i<lim; i++) {
        var className = moduleTypes[i];
        var moduleUnderTest = generateInstance(className, generateArgs);
        func(moduleUnderTest);
    }
}
/**
 * Useful method that will run the given function once for every combination of parentClass and childClass.
 */
function callForEachCombination(func, safely) {
    
    for (var i=0, lim=moduleTypes.length; i<lim; i++) {
        var moduleOneClassName = moduleTypes[i];
    
        for (var j=0, lim2=moduleTypes.length; j<lim2; j++) {    
            var moduleTwoClassName = moduleTypes[j];
            var moduleOne  = generateInstance(moduleOneClassName);
            var moduleTwo  = generateInstance(moduleTwoClassName);
                
            func(moduleOne, moduleTwo);
        }
    }
}

function checkChildVisibilities(moduleUnderTest, caseTitle, visibilityArr) {
    for (var i=0; i<visibilityArr.length; i++) {
        // PITA - using jquery's is:visible method doesnt work. Possibly cause we're not adding the elements to the DOM here.
        var expected = (visibilityArr[i] == 1) ? "block" : "none";
        var received = moduleUnderTest._children[i].container[0].style.display;
        // a null display property is as good as display block
        if (received == "" && expected=="block") expected = "";
        assertEquals(caseTitle + ", child #" + i + " should have display " + expected, expected, received);
    }
}

function addMockParent(moduleUnderTest) {
    var mockParent = new Splunk.Module($("<div>"));
    mockParent.addChild(moduleUnderTest);
    mockParent.moduleType = "mockParentModule";
    return mockParent;    
}
function addMockChildren(moduleUnderTest, n) {
    var mockChildren = [];
    for (var i=0;i<n; i++) {
        child = new Splunk.Module($("<div>"));
        child.moduleType = "mockChildModule";
        child._params["group"] = "group " + i;
        child._onContextChangeCounter  = 0;
        child.onContextChange = function() {this._onContextChangeCounter++;}.bind(child);
        mockChildren[i] = child;
        moduleUnderTest.addChild(child);
        child.setLoadState(Splunk.util.moduleLoadStates.HAS_CONTEXT);
    }
    return mockChildren;
}

/**
 * Adds a chain of modules as a child of the moduleUnderTest.
 * addMockChain(Parent, 3) would produce:
 * 
 * Parent
 *  ||
 * Child
 *  ||
 * Child
 *  ||
 * Child
 * 
 */
function addMockChain(moduleUnderTest, n) {
    var chain = [moduleUnderTest];
    for (var i=0; i<n; i++) {
    	var link = chain[i];
    	var children = addMockChildren(link, 1);
        chain.push(children[0]);
    }
    return chain;
}

function addMockContext(module, firstId, reDispatchedId) {
    var mockContext = new Splunk.Context();
    var mockSearch  = new Splunk.Search("foo bar");
    
    mockSearch._dispatchJobCounter = 0;
    mockSearch._absorbIntentionsCounter = 0;
    

    // a bit risky as this may change behaviour, but we cant have the clone() method unmocking our context.
    mockSearch.clone = function(){return this;}.bind(mockSearch);
    
    // mock the dispatchJob method. 
    // make sure if the job is dispatched at any point by the framework, it gets the second id.
    mockSearch.dispatchJob = function(onSuccess) { 
        this._dispatchJobCounter++;
        if (!reDispatchedId) reDispatchedId = "reDispatchedId not specified in testUtils addMockContext()";
        this.job.setSearchId(reDispatchedId);
        onSuccess(this);
    }.bind(mockSearch);
    
    // mock the absorbIntentions method to just immediately call onSuccess()
    mockSearch.absorbIntentions = function(onSuccess, onFailure) { 
        this._absorbIntentionsCounter++;
        onSuccess(this.toString());
    }.bind(mockSearch);

    if (firstId) {
        mockSearch.job.setSearchId(firstId);
    }
    mockContext.set("search", mockSearch);
    module.baseContext = mockContext;
    return mockContext;
}

function generateContextWithIntention(intention) {
    var context = new Splunk.Context();
    var search  = new Splunk.Search("*");
    search.addIntention(intention);
    context.set("search", search);
    return context;
}
