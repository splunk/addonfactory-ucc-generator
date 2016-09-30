import org.apache.tools.ant.dispatch.DispatchTask;
import org.apache.tools.ant.types.DirSet;
import org.apache.tools.ant.types.FileSet;
import org.apache.tools.ant.types.Path;
import org.apache.tools.ant.types.PatternSet;
import org.apache.tools.ant.BuildException;

import java.util.*;

public class SplunkDirsetValidationTasks extends DispatchTask {

	/* This task is a generic wrapper for executing a validation
	 * routine on a list of lists of directories. */

	private Vector<DirSet> dirset = new Vector<DirSet>();  // Directories to be included.
	private String action = null;          // The action for this task.
	private String loglevel = "info";         // Logging level.
	private String outputProperty = null;  // The output property.
	private int totalErrors = 0;           // Error count returned by the invoked action.

	// Include and exclude patterns.
	private String includePatterns = null;
	private String excludePatterns = null;
	
	/* 
	 * CHILD ELEMENTS
	 *
	 * Child elements of the task definition are instantiated via the methods below.
	 * 
	 *		dirset - The directory set to be validated.
	 * 
	 */
	
	// Add the dirset provided as nested element.
	public void addDirset(DirSet d) {
		this.dirset.add(d);
	}
	
	/*  
	 *  ATTRIBUTES
	 *
	 * Attributes of the task definition are set via the setter methods below.
	 * 
	 *		action - The action for this validation task.
	 *		debug  - True or false.
	 *		outputProperty - The output property, usually for holding errors.
	 * 
	 */
	
	public void setAction(String s) {
		this.action = s;
	}

	public String getAction() {
		return new String(this.action);
	}
	
	public void setLoglevel(String s) {
			this.loglevel= s.toLowerCase();
	}

	public String getLoglevel() {
		return new String(this.loglevel);
	}
	
	// The (include|exclude)Patterns attributes are overloaded strings which 
	// are used to hold a comma-separated selection of regular expressions,
	// which will be applied to the DirectoryScanner created from the DirSet
	// object. This allows us to reuse the same DirSet in multiple verification
	// tasks, but to apply different inclusions/exclusions to them.
	public void setIncludePatterns(String s) {
		this.includePatterns = s;
	}

	public String getIncludePatterns() {
		return new String(this.includePatterns);
	}

	public void setExcludePatterns(String s) {
		this.excludePatterns = s;
	}

	public String getExcludePatterns() {
		return new String(this.excludePatterns);
	}
	
	
	public void setOutputProperty(String s) {
		this.outputProperty = s;
	}

	public String getOutputProperty() {
		return this.outputProperty;
	}

	
	/* 
	 * TASKS 
	 * 
	 * A task will be invoked by the presence of the attribute "action=<task>" in
	 * the build file. Absence of a action parameter will cause the "execute()" task
	 * to be invoked, which is essentially a no-op.
	 */

	public void execute() throws BuildException {
		System.out.println("No action was specified for this validation task.");
	}
	
	public void list() {
		SplunkDirectoryLister callback = new SplunkDirectoryLister(this.loglevel);
		this.iterateDirset(callback);
	}

	// TODO: Improve the dispatch mechanism here, if possible.
	public void validate_shp_paths() {
		SplunkValidateShpPathsCallback callback = new SplunkValidateShpPathsCallback(this.loglevel, this.includePatterns, this.excludePatterns);
		this.iterateDirset(callback);
	}

	public void validate_macros() {
		SplunkValidateMacroSyntaxCallback callback = new SplunkValidateMacroSyntaxCallback(this.loglevel, this.includePatterns, this.excludePatterns);
		this.preprocessDirsets(callback);
		this.iterateDirset(callback);
	}

	
	/*
	 * UTILITY FUNCTIONS
	 */
	
	public void preprocessDirsets(SplunkValidationCallback callback) {
		// Iterate over a list of dirsets, running the callback's
		// preprocessing method on each directory. This should only be done
		// if a validation task requires collecting information from
		// all directories before processing can begin (for instance, for 
		// purposes of duplicate detection).
		callback.printMessage("Running validation task: preprocessing.");
		for (Iterator<DirSet> itDirSets = this.dirset.iterator(); itDirSets
				.hasNext();) {
			DirSet ds = (DirSet) itDirSets.next();
			callback.preprocess_directory(ds);
		}
	}
	
	public void iterateDirset(SplunkValidationCallback callback) {
		// Iterate over a list of dirsets, running the callback on each directory.
		
		for (Iterator<DirSet> itDirSets = this.dirset.iterator(); itDirSets
				.hasNext();) {
			DirSet ds = (DirSet) itDirSets.next();
			callback.printMessage("Running validation task.");
			totalErrors += callback.process_directory(ds);
		}
				
		if (outputProperty != null && totalErrors > 0) {
			// Set the property if errors were found
			getProject().setNewProperty(outputProperty, Integer.toString(totalErrors));
		} else if (totalErrors > 0) {
			// Throw an exception if an output property was not defined
			throw new BuildException(String.format("%s errors found by task: ", getTaskName(), totalErrors));
		}

	}

}