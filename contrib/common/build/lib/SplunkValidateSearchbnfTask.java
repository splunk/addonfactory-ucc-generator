import org.apache.tools.ant.Task;
import org.apache.tools.ant.types.DirSet;
import org.apache.tools.ant.BuildException;
import java.io.*;
import java.util.regex.*;
import java.util.*;
import java.util.Vector;

import java.nio.channels.FileChannel;

/**
 * 
 * Compilation instructions: javac <this_file>.java -classpath
 * <path_to_this_file>/ant.jar
 * 
 * @author jervin
 * 
 */
public class SplunkValidateSearchbnfTask extends Task {

	// TODO:20120419:jervin:Add a debug parameter for more verbose output.

	// Error messages.
	private String MSG_MISSING_SEARCHBNF_CONF_STANZA = "MISSING CONFIGURATION STANZA IN searchbnf.conf";
	private String MSG_MISSING_COMMANDS_CONF_STANZA = "MISSING CONFIGURATION STANZA IN commands.conf";
	private String MSG_MISSING_SCRIPT_FILE = "MISSING SCRIPT FILE";
	private String MSG_MISSING_CONFIG_FILE = "MISSING CONFIGURATION FILE";

	// Regular expressions
	private Pattern commandPattern = Pattern.compile("^\\[([^\\]]+)\\]");
	private Pattern productionPattern = Pattern.compile("^\\[(.*)-command\\]");
	private Pattern filenamePattern = Pattern
			.compile("^filename\\s*=\\s*([^\\s]+)");

	// Filename constants
	private String BNF_FILENAME = "searchbnf.conf";
	private String CMD_FILENAME = "commands.conf";

	// Directories to be checked
	private Vector<DirSet> dirset = new Vector<DirSet>();

	// Output property
	private String outputProperty = null;

	// Variables for collecting errors
	private int missingConfigs = 0;
	private int missingScripts = 0;
	private int missingStanzas = 0;
	private int totalErrors = 0;

	public void execute() throws BuildException {

		for (Iterator<DirSet> itDirSets = this.dirset.iterator(); itDirSets
				.hasNext();) {
			DirSet ds = (DirSet) itDirSets.next();
			String base = ds.getDir().getPath();
			System.out
					.println("CHECKING all searchbnf.conf and commands.conf files under: "
							+ base);
			List<String> dirs = Arrays.asList(ds.getDirectoryScanner()
					.getIncludedDirectories());
			for (Iterator<String> itDirs = dirs.iterator(); itDirs.hasNext();) {
				String dir = base + "/" + itDirs.next();
				checkMissingConfigStanzas(dir);
			}
		}

		// Set the property if errors were found
		this.totalErrors = missingConfigs + missingScripts + missingStanzas;
		if (outputProperty != null && totalErrors > 0) {
			getProject().setNewProperty(outputProperty,
					Integer.toString(totalErrors));
		}

		// Throw an exception if a property was not defined
		else if (totalErrors > 0) {
			throw new BuildException("" + totalErrors
					+ " errors in searchbnf.conf and commands.conf.");
		}

	}

	// Add the dirset provided as nested element.
	public void addDirset(DirSet d) {
		this.dirset.add(d);
	}

	// Set the output property.
	public void setOutputProperty(String outputProperty) {
		this.outputProperty = outputProperty;
	}

	// Wrapper for consistent error output.
	private void error(String msg) {
		System.out.println("ERROR: " + msg);
	}

	// Check for missing configuration files;
	// e.g., searchbnf.conf without commands.conf OR vice-versa.
	private boolean checkMissingConfigFiles(String dirname) {

		String bnf = dirname + "/" + this.BNF_FILENAME;
		String cmd = dirname + "/" + this.CMD_FILENAME;

		File searchbnf = new File(bnf);
		File commands = new File(cmd);

		boolean rv = false;

		if (searchbnf.exists() ^ commands.exists()) {
			if (searchbnf.exists()) {
				error(this.MSG_MISSING_CONFIG_FILE + ": " + cmd);
			} else {
				error(this.MSG_MISSING_CONFIG_FILE + ": " + bnf);
			}
			this.missingConfigs += 1;
			rv = true;
		} else if (!(searchbnf.exists() && commands.exists())) {
			// Neither file exists; return true but don't increment
			// error count.
			rv = true;
		} else {
			// Both files exist.
			;
		}

		return rv;
	}

	// Return scanner object for a file.
	// TODO:20120419:jervin:Improve handling of Scanner objects to prevent
	// memory leaks.
	private Scanner getScanner(String filename) {

		// Initialize to prevent Eclipse from complaining.
		Scanner scanner = null;
		File file = new File(filename);
		if (file.exists()) {
			try {
				// Scanner objects returned by this function MUST be closed
				// outside the function or will leak memory.
				FileInputStream fstream = new FileInputStream(file);
				FileChannel fchannel = fstream.getChannel();
				scanner = new Scanner(fchannel);
			} catch (IOException e) {
				error("Could not open file " + filename);
				e.printStackTrace();
			}
		}
		return scanner;
	}

	// Check for the following errors:
	// - commands.conf stanzas wihout corresponding searchbnf.conf stanzas
	// - commands.conf stanzas referring to non-existent script files
	private void checkMissingConfigStanzas(String dirname) {

		String bnf = dirname + "/" + this.BNF_FILENAME;
		String cmd = dirname + "/" + this.CMD_FILENAME;

		// Used to hold nextLine() output
		String line = new String();
		
		// Commands found in commands.conf
		HashSet<String> commandSet = new HashSet<String>();

		// Scripts found in commands.conf
		HashSet<String> scriptSet = new HashSet<String>();

		// Productions found in searchbnf.conf
		HashSet<String> productionSet = new HashSet<String>();

		// Check for missing files.
		// If both commands.conf and searchbnf.conf exist,
		// proceed to check syntax and existence of scripts.
		if (!checkMissingConfigFiles(dirname)) {

			// Get scanners for both files.
			Scanner searchbnf = getScanner(bnf);
			Scanner commands = getScanner(cmd);

			while (commands.hasNextLine()) {
				line = commands.nextLine();

				// Build list of stanzas in commands.conf.
				Matcher commandMatch = this.commandPattern.matcher(line);
				while (commandMatch.find()) {
					commandSet.add(line.substring(commandMatch.start(1),
							commandMatch.end(1)));
				}

				// Build list of filenames in commands.conf.
				Matcher filenameMatch = this.filenamePattern.matcher(line);
				while (filenameMatch.find()) {
					scriptSet.add(line.substring(filenameMatch.start(1),
							filenameMatch.end(1)));
				}

			}

			// Clear line.
			line = "";

			while (searchbnf.hasNextLine()) {
				line = searchbnf.nextLine();

				// Build list of productions in searchbnf.conf.
				Matcher productionMatch = this.productionPattern.matcher(line);
				while (productionMatch.find()) {
					productionSet.add(line.substring(productionMatch.start(1),
							productionMatch.end(1)));
				}

			}

			// Close Scanners to prevent resource leaks.
			commands.close();
			searchbnf.close();
		}

		// Check that all stanzas in commands.conf correspond to productions in
		// searchbnf.conf, and vice-versa.

		String tmp;

		for (Iterator<String> itCommands = commandSet.iterator(); itCommands
				.hasNext();) {
			tmp = itCommands.next();
			if (!productionSet.contains(tmp)) {
				this.missingStanzas += 1;
				error(this.MSG_MISSING_SEARCHBNF_CONF_STANZA + ": " + bnf + "|"
						+ tmp);
			}
		}

		for (Iterator<String> itCommands = productionSet.iterator(); itCommands
				.hasNext();) {
			tmp = itCommands.next();
			if (!commandSet.contains(tmp)) {
				this.missingStanzas += 1;
				error(this.MSG_MISSING_COMMANDS_CONF_STANZA + ": " + cmd + "|"
						+ tmp);
			}
		}

		// Check that files referred to in commands.conf actually exist in the same app.
		for (Iterator<String> itScriptFiles = scriptSet.iterator(); itScriptFiles
				.hasNext();) {
			String scriptPath = dirname.substring(0, dirname.lastIndexOf("/"))
					+ "/bin/" + itScriptFiles.next();
			File scriptFile = new File(scriptPath);

			if (!scriptFile.exists()) {
				this.missingScripts += 1;
				error(this.MSG_MISSING_SCRIPT_FILE + ": " + bnf + "|"
						+ scriptFile.getName());
			}
		}
	}
}