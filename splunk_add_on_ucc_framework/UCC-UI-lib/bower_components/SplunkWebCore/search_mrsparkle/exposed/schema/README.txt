Overview
========

This directory contains XML schema files for the various UI assets like:

-- advanced view XML
-- simple form XML
-- simple dashboard XML
-- app nav XML
-- manager XML
-- app setup XML

These schema files are written in RelaxNG compact syntax (*.rnc).  Conversion
to other formats can be automated by Trang (http://www.thaiopensource.com/relaxng/trang.html).

By default, matching *.rng files are included for all *.rnc files.

Sample
=======

Sample usage for converting *.rnc -> *.rng

    java -jar trang.jar -O rng all.rnc all.rng
     
We use the RelaxNG validator exposed in the lxml library.  A simple python
snippet looks like:

    import lxml.etree as et
    import os

    # first read in the schema file
    f = open('all.rng', 'r')
    schema = et.parse(f)
    relaxng = et.RelaxNG(schema)
    f.close()

    # then open the target XML file for validation
    f = open('somexmldata.xml', 'r')
    rootNode = et.parse(f)
    isValid = relaxng.validate(rootNode)
    if isValid:
        print 'OK'
    else:
        print relaxng.error_log


Files
=====

all.rnc
    This schema file serves as a single entry point for all of the registered
    RelaxNG schemas.  All of the schemas are written in RelaxNG compact syntax
    and are auto converted to the full RelaxNG schema via Trang.

view.rnc
    This schema covers all 3 forms of view XML.
    
nav.rnc
    This schema covers the app nav XML.
    
manager.rnc
setup.rnc
    These are placeholder schemas for management XML files.
    
validate_all.py
    This script will inspect all of the UI XML files present in the current
    Splunk /etc/ directory.  This must be run in the Splunk env:
    
        $SPLUNK_HOME/bin/splunk cmd python validate_all.py
        
