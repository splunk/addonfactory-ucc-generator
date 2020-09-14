Splunk appserver resource directory
===================================

The files contained herein are default assets used by the Splunk appserver
and are not customer-modifiable.



/exposed
========

NOTICE:
All files in this directory are public.


Javascript events broadcast in the client:
	jobDispatched
	jobResurrected
	jobProgress
	jobPaused
	jobFinalized
	jobCanceled
	jobDone
	jobStatusChanged

	jobberTicketsRefreshed
	
		
/modules
========

For information on how modules work in Splunk Web, see this page:


For information on configuring your own modules, see this page:

http://www.splunk.com/doc/preview/DevModule


/source
=======

Source files.  Not packaged with standard install.



/templates
==========

template language:
http://www.makotemplates.org

convention:
./${controller}/${action}.html

global utilities:
./lib.html

controller action utilties:
./${controller}/_helpers.html

default layout*:
./layout/base.html

custom controller layout*:
./layout/base.html+
                  |
                  +-./layout/${controller}.html
                  
* http://www.makotemplates.org/docs/inheritance.html

