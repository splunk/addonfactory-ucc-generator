'''
Copyright (C) 2009-2012 Splunk Inc. All Rights Reserved.
'''
import xml.dom.minidom
import os
import sys
import re

class Macro:
    definition = None
    definition_dereferenced = None
    arg_count = 0
    short_name = None
    name = None
    tags = []
    fields = []
    
    is_populated = False
    
    UNLIMITED = 999
    
    def __init__( self, name, definition ):
        self.definition = definition
        
        d = Macro.parse_declaration( name )
        
        self.short_name = d['name']
        
        if d['args'] is not None:
            self.arg_count = int(d['args'])
        else:
            self.arg_count = 0
        
        self.name = name
    
    def complete_name(self):
        if self.arg_count == Macro.UNLIMITED:
            return self.short_name + "(*)"
        elif self.arg_count <= 0:
            return self.short_name #+ "()"
        else:
            return self.short_name + "(" + str(self.arg_count) + ")"
    
    def __str__(self):
        return self.complete_name() + ": " + self.definition
    
    def populate(self, macros):
        #sys.stderr.write( "    Populating " + self.name )
        self.dereference(macros)
        #self.extract_tags()
        #self.extract_macros(macros)
    
    def extract_macros(self, macros):
        definition = self.definition
        
        regex = re.compile("`(\w*(\([\w ,]*\))?)`")
        
        sub_macros = regex.findall(self.definition)
        
        for m in sub_macros:
            m = Macro.parse_name( m[0] )
            
            # if the sub-macro is called with * then it is taking all of the arguments passed to the parent macro 
            if m[1] == Macro.UNLIMITED:
                m[1] = self.args
                
            # Find the relevant sub-macro
            for macro in macros:
                if macro.short_name == m[0] and macro.arg_count == m[1]:
                    if macro.is_populated == False:
                        macro.populate( macros )
                        
                    for tag in macro.tags:
                        self.tags.append( tag )
                        
        self.tags = unique(self.tags)
    
    def dereference(self, macros):
        
        definition = self.definition
        
        regex = re.compile("`(\w*(\([\w ,]*\))?)`")
        
        sub_macros = regex.findall(self.definition)
        
        for m in sub_macros:
            
            m = Macro.parse_name( m[0] )
            
            # if the sub-macro is called with * then it is taking all of the arguments passed to the parent macro 
            if m[1] == Macro.UNLIMITED:
                m[1] = self.args
                
            # Find the relevant sub-macro
            for macro in macros:
                
                if macro.short_name == m[0] and macro.arg_count == m[1]:
                    if macro.is_populated == False:
                        macro.populate( macros )
                        
                    print("\nreplacing: " + definition + " with " + macro.definition_dereferenced)
                    definition = macro.replace_references(definition)
               
        #sys.stderr.write( "\n    Dereferenced " + self.name + "::" + definition )
        self.definition_dereferenced = definition
        return definition
                    
            
    @staticmethod
    def parse_declaration(name):
        regex = re.compile("(?P<name>\w+)(\((?P<args>[0-9]+)\))?")
        
        r = regex.search(name)
        
        return r.groupdict()
        
    def replace_references(self, definition_orig):
        
        if self.arg_count > 0:
            regex = self.short_name + "(\(([\w -]+([ ]*[,]?[ ]*)?){" + str(self.arg_count) + "," + str(self.arg_count) +"}\))"
        else:
            regex = self.short_name
        
        return re.sub(regex, self.definition_dereferenced, definition_orig) 
        
    @staticmethod
    def parse_name(macro_name):
        
        # Get the name of the macro
        nameregex = re.compile("(\w*)\(?")
        nameregex = nameregex.findall(macro_name)
        
        name = nameregex[0]
        
        # Get the argument count
        regex = re.compile("[(, ]+([\w$*]+)")
        args = regex.findall(macro_name)
        
        if len(args) == 0:
            return (name, len(args), name + "()")
        elif len(args) == 1 and args[0] == "*":
            return (name, Macro.UNLIMITED, name + "(*)")
        else:
            return (name, len(args), name + "(" + str(len(args)) + ")" )
    
    def extract_tags(self, macros = None):
        
        before_bar_regex = re.compile("([^|]*)")
        partial_def = before_bar_regex.search(self.definition)
        partial_def = partial_def.groups()[0]
        
        self.tags = []
        # Get all of the direct tags
        regex = re.compile("tag\s*=\s*([\w_]*)")
        temp_tags = regex.findall( partial_def )
        
        for t in temp_tags:
            if t not in ['', 'if']:
                self.tags.append(t)
        temp_tags = []
        
    def extractFields(self):
        pass

class Search:
    text = None
    tags = {}
    fields = []
    
    def __init__( self, search ):
        self.text = search

class Dashboard:
    filename = None
    label = None
    searches = []
    
    def __str__(self):
        if self.filename is not None:
            return self.label + "(" + self.filename + ")"
        else:
            return self.label

dashboards = []
macros = []

def test():
    print Macro.parse_name("test($birch$, $maple$)")
    print Macro.parse_name("test( *   )")

def getList( dir ):
    
    # 1 -- Populate the dashboard list
    dirwalker = DirWalker()
    
    dirwalker.walk( dir, processDashboards )
        
    # 2 -- Get the macro definitions
    dirwalker.walk( dir, processMacros )
    
    for m in macros:
        if m.is_populated == False:
            m.populate(macros)
        
        #print m.name + " :: " + str(m.tags)
    
    # 3 -- Loop through the dashboards and dereference the macros 
    
    
    #outputDashboards(dashboards)

def outputDashboards(dashboards):
    import csv
    f = open('dashboards.csv', 'wb')
    #writer = csv.writer(f)
    writer = csv.writer(sys.stdout)
    writer.writerow( ["dashboard", "file", "search"] )
    
    for d in dashboards:
        for s in d.searches:
            writer.writerow( [d.label, d.filename, s.text] )
            
    f.close()

def getText(nodelist):
    rc = []
    for node in nodelist:
        if node.nodeType == node.TEXT_NODE:
            rc.append(node.data)
    return ''.join(rc)
        
def getAttr( node, name):
    try:
        attr = node.attributes["name"]
        
        if attr is not None:
            return attr.value
    except KeyError:
        return None

def unique(seq, idfun=None):
    if idfun is None:
        def idfun(x): return x
    
    seen = {}
    result = []
    for item in seq:
        marker = idfun(item)
        # in old Python versions:
        # if seen.has_key(marker)
        # but in new ones:
        if marker in seen: continue
        seen[marker] = 1
        result.append(item)
    
    return result

def processMacros( file ):
    import ConfigParser
    
    if file[-11:] == "macros.conf":
        
        try:
            config = ConfigParser.RawConfigParser()
            config.read(file)
            
            for section in config.sections():
                
                try:
                    definition = config.get(section, 'definition')
                    
                    macro = Macro(section, definition)
                
                    macros.append(macro)
                
                except ConfigParser.NoOptionError:
                    pass
        
        except ConfigParser.ParsingError, err:
            sys.stderr.write( str(err) )

def processDashboards( file ):
    
    dashboard = Dashboard()
    dashboard.filename = file
    
    if file[-4:] == ".xml" and file.find("default/data/ui/views"):
        f = open(file, 'r')
        document = f.read()
        f.close()
        dom = xml.dom.minidom.parseString(document)
        
        # Get the label
        label = dom.getElementsByTagName("label")
        
        if label is not None and len(label) > 0:
            dashboard.label= getText(label[0].childNodes)
        else:
            return
        
        # Get all of the modules
        modules = dom.getElementsByTagName("module")
        
        for module in modules:
            #print getAttr(module, "name")
            if getAttr(module, "name") == "HiddenSearch":
            
                params = module.getElementsByTagName("param")
            
                for param in params:
                    param_name = getAttr(param, "name")
                    if param_name is not None and param_name == "search":
                        search = getText(param.childNodes)
                        
                        already_exists = False
                        
                        for existing_search in dashboard.searches:
                            if existing_search.text == search:
                                already_exists = True
                            
                        if already_exists == False: 
                            dashboard.searches.append( Search(search) )
                
        dashboards.append(dashboard)

def searchID(search):
    return search

def processTranforms( file ):
    return None
        
class DirWalker(object):

    def walk(self,dir,meth):
        """ walks a directory, and executes a callback on each file """
        dir = os.path.abspath(dir)
        for file in [file for file in os.listdir(dir) if not file in [".",".."]]:
            nfile = os.path.join(dir,file)
            meth(nfile)
            if os.path.isdir(nfile):
                self.walk(nfile,meth)        
                
getList( "." )