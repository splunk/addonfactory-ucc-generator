import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.types.DirSet;
import org.apache.tools.ant.types.FileSet;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Matcher;

public class SplunkValidationCallback implements
		SplunkValidationCallbackInterface {

	/*
	 * Constructors and logging.
	 */
	protected static enum Logging {
		DEBUG("DEBUG"), 
		INFO("INFO"), 
		WARN("WARNING"), 
		ERROR("ERROR");
		
		String description;
		
		Logging(String s) {
			this.description = s;
		}
		
		public String toString() {
			return this.description;
		}
	}

	protected Logging level;

	public SplunkValidationCallback() {
		this.setLogLevel("info");
	}

	public SplunkValidationCallback(String level) {
		this.setLogLevel(level);
	}

	public void setLogLevel(String level) {
		// Java < 1.7 can't switch on a String.	
		if (level.equalsIgnoreCase("debug")) {
			this.level = Logging.DEBUG;
		} else if (level.equalsIgnoreCase("warn")){
			this.level = Logging.WARN;
		} else if (level.equalsIgnoreCase("error")) {
			this.level = Logging.ERROR;
		} else if (level.equalsIgnoreCase("info")) {
			this.level = Logging.INFO;
		} else {
			// Should do something else here most likely.
			this.level = Logging.INFO;
		}
	}

	/* 
	 * Convenience methods for logging.
	 */
	protected void log(String s, Logging l) {
		if (l.compareTo(this.level) >= 0) {
			System.out.println(l + ": " + this.getClass().getName() + ": " + s);
		}
	}

	protected void debug(String s) {
		log(s, Logging.DEBUG);
	}
	
	protected void info(String s) {
		log(s, Logging.INFO);
	}

	protected void warn(String s) {
		log(s, Logging.WARN);
	}
	
	protected void error(String s) {
		log(s, Logging.ERROR);
	}

	/*
	 * Processing methods.
	 */

	public int preprocess_fileset(FileSet fs) throws BuildException {
		this.log("No fileset preprocessing actions specified.", Logging.DEBUG);
		return 0;
	}

	public int process_fileset(FileSet fs) throws BuildException {
		this.log("No file processing actions specified.", Logging.DEBUG);
		return 0;
	}

	public int preprocess_directory(DirSet ds) throws BuildException {
		this.log("No directory preprocessins actions specified.", Logging.DEBUG);
		return 0;
	}
	
	public int process_directory(DirSet ds) throws BuildException {
		this.log("No directory processing actions specified.", Logging.DEBUG);
		return 0;
	}

	// Print an initialization message for the task.
	public void printMessage(String s) {
		info(s);
	}

	/**
	 *  Return a scanner object for a file.
	 * @param filename
	 * @return
	 */
	protected Scanner getScanner(String filename) {
		// Do not change this to use the Scanner(File) constructor, as 
		// this will result in errant UTF-8 characters in the file 
		// causing parsing to stop when hasNextLine() incorrectly 
		// returns false.
		// Cf. http://stackoverflow.com/questions/9492520/

		// Initialize to prevent Eclipse from complaining.
		Scanner scanner = null;
		File file = new File(filename);
		if (file.exists()) {
			try {
				// Scanner objects returned by this function MUST be closed
				// outside the function or will leak memory.
				scanner = new Scanner(new FileInputStream(file));
			} catch (IOException e) {
				error("Could not open file " + filename);
				e.printStackTrace();
			}
		}
		return scanner;
	}

	/**
	 * Returns a list of files in DirSet ds matching the expressions given in
	 * includes.
	 * 
	 * @param ds
	 * @param includes
	 * @return String[] representing a list of filenames
	 *
	 */
	protected String[] scanFiles(DirSet ds, String includes, String excludes) {
		debug("Scanning for files:" + ds.getDir());
		
		// Build a DirectoryScanner using the list of included directories and
		// the files we want to include. There must be a better way.
		ArrayList<String> included = new ArrayList<String>();
		ArrayList<String> excluded = new ArrayList<String>();
		
		for (String includeDir: ds.mergeIncludes(ds.getProject())) {
			if (includes != null && includes != "") {
				for (String includeFile: includes.split(",")) {
					included.add(includeDir + includeFile);
					debug("    included pattern: " + includeDir + includeFile);
				}
			} else {
				included.add(includeDir + "**");
			}
		}

		// Excludes do not need to be specific to a particular directory.
		if (excludes != null && excludes != "") {
			for (String excludeFile: excludes.split(",")) {
				debug("    Excluded pattern: " + excludeFile);
				excluded.add(excludeFile);
			}
		}
		for (String excludeDir: ds.mergeExcludes(ds.getProject())) {
			debug("    Excluded pattern: " + excludeDir);
			excluded.add(excludeDir);
		}

		DirectoryScanner dsc = ds.getDirectoryScanner(ds.getProject());
		dsc.setIncludes(included.toArray(new String[included.size()]));
		dsc.setExcludes(excluded.toArray(new String[excluded.size()]));

		// Iterate over files in the directory
		dsc.scan();
		
		debug("Included directories after (DirectoryScanner): ");
		for (String s: dsc.getIncludedDirectories()) {
			debug("    " + s);
		}
		debug("END");

		debug("Excluded directories after (DirectoryScanner): ");
		for (String s: dsc.getExcludedDirectories()) {
			debug("    " + s);
		}
		debug("END");

		debug("Included files after (DirectoryScanner): ");
		for (String s: dsc.getIncludedFiles()) {
			debug("    " + s);
		}
		debug("END");
		debug("Excluded files after (DirectoryScanner): ");
		for (String s: dsc.getExcludedFiles()) {
			debug("    " + s);
		}
		debug("END");

		return dsc.getIncludedFiles();
		
	}
	
	/**
	 * Return a HashMap of SplunkregexMatch objects for the 
	 * @param ds - a DirSet
	 * @param includes - a list of files to be included from the DirSet
	 * @param excludes - a list of files to be excluded from the DirSet
	 * @param matchers - a set of Matchers to be used to scan the included files
	 * @return
	 */
	protected HashMap<String, ArrayList<SplunkRegexMatch>> getMatches(
			DirSet ds, String includes, String excludes, ArrayList<Matcher> matchers) {
		// Returns a HashMap of SplunkRegexMatch(es). Each contains
		// the matched text, start, length, and line number.
		//
		// Multiple matches can occur per line, but each lineno is of course unique.
		//
		// My kingdom for a native Tuple type in the JDK.

		String line = "";

		File basedir = ds.getDir();

		// Ignore comments for specific file types.
		HashMap<String, String> excludePatterns = new HashMap<String, String>();
		excludePatterns.put("py", "^\\S*#.*$");
		excludePatterns.put("conf", "^\\S*#.*$");
		
		HashMap<String, ArrayList<SplunkRegexMatch>> matches = new HashMap<String, ArrayList<SplunkRegexMatch>>();

		Boolean skip = false;
		
		for (String filename : this.scanFiles(ds, includes, excludes)) {
			int lineno = 0;

			// Run matches for the input file name.
			debug("Analyzing: " + filename);
			Scanner scanner = this.getScanner(basedir + "/" + filename);
			ArrayList<SplunkRegexMatch> substrings = new ArrayList<SplunkRegexMatch>();

			if (scanner != null) {
				while (scanner.hasNextLine()) {
					line = scanner.nextLine();
					lineno += 1;

					// Check if the line is a comment appropriate to this file
					// or blank, in which case, skip processing.
					skip = line.matches("^\\S*$") ? true : false;
					for (String s : excludePatterns.keySet()) {
						if (filename.trim().endsWith(s)
								&& line.matches(excludePatterns.get(s))) {
							// debug("SKIPPED: " + filename + " : " + line);
							skip = true;
						}
					}
					
					if (!skip) {
						for (int i = 0; i < matchers.size(); i++) {
							// debug("PROCESSED: " + filename + " : " + line);
							Matcher m = matchers.get(i);
							m.reset(line);
							while (m.find()) {
								substrings
										.add(new SplunkRegexMatch(m.group(),
												lineno, m.start(), m.end()
														- m.start()));
							}
						}
					}
				}
			}

			// Scanners live in vain.
			scanner.close();

			// Add to output.
			matches.put(filename, substrings);

		}
		
		return matches;

	}
	
};
