import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.types.DirSet;
import org.apache.tools.ant.types.FileSet;
import java.util.Vector;

interface SplunkValidationCallbackInterface {
	/* Abstract class for static validation tasks of a Splunk build,
	 * usually located in a staging directory.
	 * 
	 * Validation tasks can operate on the following:
	 * 
	 *		- a vector of DirSets
	 *		- a vector of FileSets
	 * 
	 * In either case, the validation is broken into three stages:
	 * 
	 * 	1. A preprocessing pass to collect any intelligence about the
	 * 	   installation. For instance, to validate a macro's syntax, it
	 *     is first necessary to collect information about ALL macros on
	 *     the system, since macro invocations can be nested. 
	 *  2. A processing pass.
	 *  3. A postprocessing pass.
	 *
	 * 
	 */
	
	// Preprocessing task for DirSet.
	int preprocess_directory(DirSet ds) throws BuildException;

	// Run the task on an individual DirSet; return error count.
	int process_directory(DirSet ds) throws BuildException;

	// Preprocessing task for FileSet.
	int preprocess_fileset(FileSet fs) throws BuildException;
	
	// Run a task on an individual FileSet; return error count.
	int process_fileset(FileSet fs) throws BuildException;


};
