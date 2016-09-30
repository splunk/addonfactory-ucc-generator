import os
import csv

from xml.dom import minidom
from xml.dom.minidom import parse, parseString

class ModuleUse:
    
    def __init__(self, app, module):
        self.count = 1
        self.app = app
        self.module = module
    
    def is_match(self, app, module):
        return self.app == app and self.module == module
        
    def increment(self):
        self.count = self.count + 1

class ModuleStats:
    
    @staticmethod
    def add_entry(app, module, modules_list):
        
        # Find the entry
        for entry in modules_list:
            
            if entry.is_match( app, module ):
                entry.increment()
                return
            
        modules_list.append( ModuleUse(app, module) )
        
    @staticmethod
    def get_app( split_path ):
        for p in split_path:
            
            if p.startswith("TA-") or p.startswith("SA-") or p.startswith("DA-") or p in ['SplunkPCIComplianceSuite', 'SplunkEnterpriseSecuritySuite', 'splunk_for_vmware', 'webintelligence', 'unix', 'hadoopops']:
                #print p
                return p
            
        
    @staticmethod
    def should_include( split_path ):
        
        if 'mainline' not in split_path and 'barolo' not in split_path:
            return False
        
        if not split_path[-1].endswith(".xml"):
            return False
        
        app = ModuleStats.get_app(split_path)
        
        return app is not None
        
    @staticmethod
    def analyze_file( file_name, modules_list = None ):
        
        # Initialize the modules list if one was not provided
        if modules_list is None:
            modules_list = []
        
        # Parse the file
        doc = parse(file_name)
        
        # Get the module elements
        modules = doc.getElementsByTagName("module")
        
        # Get the app
        split_path = ModuleStats.split_path( file_name )
        app = ModuleStats.get_app(split_path)
        
        for module in modules:
            if "name" in module.attributes.keys():
                ModuleStats.add_entry(app, module.attributes["name"].value, modules_list)
        
        # Return the list modules observed
        return modules_list
    
    @staticmethod
    def split_path( path ):
         
        folders=[]
            
        while 1:
            path, folder=os.path.split(path)
            
            if folder!="":
                folders.append(folder)
            else:
                if path!="":
                    folders.append(path)
            
                break
            
        folders.reverse()
            
        return folders
    
    @staticmethod
    def analyze_directory( directory, modules_list=None, dont_stop_on_errors=False, selection_fx=None ):
        
        if selection_fx is None:
            selection_fx = ModuleStats.should_include
        
        # Indicates the number of files analyzed
        files_analyzed = 0
        
        # Initialize the modules list if one was not provided
        if modules_list is None:
            modules_list = []
        
        for root, dirs, files in os.walk(directory):
        
                # Process each file
                for f in files:
                    try:
                        split_path = ModuleStats.split_path( os.path.join( root, f) )
                        
                        if selection_fx( split_path ):
                            
                            #print "Analyzing file", f, split_path
                            ModuleStats.analyze_file( os.path.join( root, f), modules_list )
                            files_analyzed = files_analyzed + 1
    
                    except Exception:
                        #logger.exception('Exception generated when attempting to analyze file="%s"', f)
                        print 'Exception generated when attempting to analyze file="%s"' % f
                        
                        if not dont_stop_on_errors:
                            raise
                        
        # Return the list modules observed
        return modules_list
                        

#  Get the path to run against
import sys

if len(sys.argv) < 2:
    print "You must provide the solutions Perforce path to analyze as an argument (e.g. /Users/lmurphey/Perforce/perforce_1666/lmurphey-mbp17-juno/splunk/solutions)"
    exit(-1)

path = sys.argv[1] #e.g. "/Users/lmurphey/Perforce/perforce_1666/lmurphey-mbp17-juno/splunk/solutions"

modules = ModuleStats.analyze_directory(path, dont_stop_on_errors=True)

outfile = "modules_used.csv"

with open(outfile,'wt') as fou:
    
    writer = csv.writer(fou)
    writer.writerow( ('module', 'app', 'count') )
    
    for entry in modules:
        writer.writerow( (entry.module, entry.app, entry.count ) )
        
    print "Module information written to", outfile
    