import org.apache.tools.ant.Task;

import org.apache.tools.ant.types.DirSet;
import org.apache.tools.ant.BuildException;
import java.io.*;
import java.util.regex.*;
import java.util.*;

import java.nio.channels.FileChannel;

/**
 * 
 * Compilation instructions: javac <this_file>.java -classpath
 * <path_to_ant_jar>/ant.jar
 * 
 * @author jervin
 * 
 */

public class SplunkValidateMacroSyntaxTask extends Task {

	// This Ant task performs the following functions:
	// 1. Checks that macro names are composed of the following character set:
	// [A-Za-z0-9_-].
	// 2. Checks that the number of macro arguments correspond to the
	// definition.
	// 3. Checks that unquoted formal macro arguments are composed of the
	// following character set: [A-Za-z0-9_-]
	// 4. Checks that macro names referenced in all files where macros may
	// appear actually exist.
	// 5. Validates that there are no duplicated macros across all apps.
	// TODO 6. Validates that for all XML files in the scope, macro references
	// are correct.

	// Error messages
	private String MSG_UNQUOTED_MACRO_ACTUAL_ARGUMENT = "UNQUOTED MACRO ACTUAL ARGUMENT";
	private String MSG_UNQUOTED_MACRO_FORMAL_ARGUMENT = "UNQUOTED MACRO FORMAL ARGUMENT";
	private String MSG_UNUSED_MACRO_ARGUMENT = "UNUSED MACRO ARGUMENT";
	private String MSG_INVALID_MACRO_DEFINITION = "INVALID MACRO DEFINITION";
	private String MSG_INVALID_MACRO_ARGUMENTS = "INVALID MACRO ARGUMENTS";
	private String MSG_DUPLICATE_MACRO = "DUPLICATED MACRO DEFINITION";
	private String MSG_INVALID_NESTED_MACRO_INVOCATION = "INVALID NESTED MACRO INVOCATION";

	// Constants
	private String INVALID_MACRO_IDENTIFIER = "INVALID";

	// Shared regular expressions
	private Pattern macroInvocationPattern = Pattern
			.compile("(?:\\`([^\\`]+)\\`)");
	// Old version: 20120622 jervin
	//	private Pattern macroInvocationArgumentPattern = Pattern
	//			.compile("([A-Za-z0-9_-]+)(?:\\((.*)\\)){0,1}");
	private Pattern macroInvocationArgumentPattern = Pattern
			.compile("([^\\(]+)(?:\\((.*)\\)){0,1}");
	private Pattern macroInterpolationPattern = Pattern
			.compile("(?:\\$([A-Za-z0-9_-]+)\\$)");
	private Pattern macroDefinitionPattern = Pattern
			.compile("^\\[([A-Za-z0-9_-]+){1}(\\((\\d+)\\)){0,1}\\]");

	// Non-alphanumeric macro arguments which are acceptable.
	private HashSet<String> permittedArgs = new HashSet<String>();

	// Error counts
	private HashMap<String, Integer> errorMap = new HashMap<String, Integer>();

	// Filename constants
	private String MACRO_FILENAME = "macros.conf";

	// Directories to be checked
	private Vector<DirSet> dirset = new Vector<DirSet>();

	// Output property
	private String outputProperty = null;

	// Debugging
	private Boolean debug;

	// Array of all macros.
	private ArrayList<HashMap<String, String>> allMacros = new ArrayList<HashMap<String, String>>();

	// Array of all macro names.
	private HashSet<String> macroNames = new HashSet<String>();

	// Reverse HashMap of argument counts --> names
	private HashMap<Integer, ArrayList<String>> macroArgs = new HashMap<Integer, ArrayList<String>>();

	public void execute() throws BuildException {

		// Initialize the error map.
		this.initErrorMap();

		// Initialize the list of permitted macro arguments.
		this.initPermittedArgs();

		// 1. Populate globals:
		//    a. allMacros
		//    b. macroArgs.
		// 2. Check macro name and argument character sets. Invalid macro 
		//    definitions are excluded from further processing.
		this.collectAllMacros();

		// 3. Check for duplicate macros.
		this.checkDuplicateMacros();

		// Debugging
		if (this.debug == true) {
			this.debugPrintMacroArgs(this.macroArgs);
		}

		// 3. Validate all macro definitions.
		//    a. Validate that macro signatures are correct
		//    b. Validate that macro string interpolations are correct.
		this.validateMacroArguments();

		// 4. Validate nested macro invocations
		//    a. Validate that the invoked macro exists.
		//    b. Validate that the nested macro is invoked with
		//       the appropriate argument count.
		this.validateNestedMacroInvocations();

		// Get total errors
		int totalErrors = 0;
		for (int i : errorMap.values()) {
			totalErrors += i;
		}

		// Set the property if errors were found
		if (outputProperty != null && totalErrors > 0) {
			getProject().setNewProperty(outputProperty,
					Integer.toString(totalErrors));
		}

		// Throw an exception if a property was not defined
		else if (totalErrors > 0) {
			throw new BuildException("" + totalErrors
					+ " errors in macros.conf files.");
		}

	}

	private void initPermittedArgs() {

		// TODO: Add capability to accept a list of permittedArgs in build.xml
		// this.permittedArgs.add("WOOT");
		;

	}

	private void initErrorMap() {

		// Maintain counts of all errors found.
		this.errorMap.put(MSG_UNQUOTED_MACRO_ACTUAL_ARGUMENT, 0);
		this.errorMap.put(MSG_UNUSED_MACRO_ARGUMENT, 0);
		this.errorMap.put(MSG_INVALID_MACRO_DEFINITION, 0);
		this.errorMap.put(MSG_UNQUOTED_MACRO_ACTUAL_ARGUMENT, 0);
		this.errorMap.put(MSG_INVALID_MACRO_ARGUMENTS, 0);
		this.errorMap.put(MSG_DUPLICATE_MACRO, 0);
		this.errorMap.put(MSG_INVALID_NESTED_MACRO_INVOCATION, 0);

	}

	private ArrayList<HashMap<String, String>> findInstances(String macroName,
			Integer argc) {
		// Return the macro stanzas corresponding to a name and argument count.

		ArrayList<HashMap<String, String>> instances = new ArrayList<HashMap<String, String>>();
		for (HashMap<String, String> macro : this.allMacros) {
			if (macro.get("name").contentEquals(macroName)
					&& argc == Integer.parseInt(macro.get("argc"))) {
				instances.add(macro);
			}
		}

		return instances;

	}

	private void checkDuplicateMacros() {

		// TODO: Reduce redundancy in this code: jervin 2012/05/22

		// A hash set of short names used to detect duplicate
		// occurrences of a macro.
		HashSet<String> shortnames = new HashSet<String>();

		// The set of duplicated macros.
		ArrayList<HashMap<String, String>> instances = new ArrayList<HashMap<String, String>>();

		for (Integer argc : this.macroArgs.keySet()) {

			for (String macro : this.macroArgs.get(argc)) {
				instances.clear();

				if (!shortnames.add(macro + "_" + argc)) {
					instances = this.findInstances(macro, argc);
					for (HashMap<String, String> i : instances) {
						this.error(this.MSG_DUPLICATE_MACRO, i,
								"macro may be duplicated in multiple apps.");
					}
				}
			}
		}

	}

	private void validateMacroArguments() {

		// The arguments defined in the macro signature.
		ArrayList<String> args = new ArrayList<String>();

		// The arguments actually used in the macro.
		HashSet<String> usedArgs = new HashSet<String>();

		// The argument count as defined in the macro declaration.
		int argc = 0;

		for (HashMap<String, String> macro : this.allMacros) {

			// 1. Validate macro argument counts correspond to declarations.

			// Initialize arrays of arguments and count of arguments for this
			// stanza.
			args.clear();
			usedArgs.clear();
			argc = 0;

			// Get the argument count as calculated from the declaration.
			if (macro.containsKey("argc")) {
				argc = Integer.parseInt(macro.get("argc"));
			}

			// Get the actual arguments as defined in the "args" parameter.
			if (macro.containsKey("args")) {
				for (String s : macro.get("args").split(",")) {
					args.add(s.trim());
				}
			}

			// split will return an empty string if args is present in the
			// stanza but not defined, so remove any blank instances.
			args.removeAll(Arrays.asList(""));

			// If the number of actual arguments does not match the
			// declaration, increment error count and warn of the error.
			if (args.size() != argc) {
				this.error(this.MSG_INVALID_MACRO_ARGUMENTS, macro,
						"argument declaration does not match actual argument count");
			}

			// 2. Validate macro string interpolation is correct.
			// Each <arg> should be represented in interpolated $<arg>$
			// strings, and non-<arg> strings should not be used
			// in interpolations. Alert on these conditions:
			//
			// a) Non-argument string used in interpolation.
			// b) Macro argument not used in interpolation.

			String currentInterpolation = new String();

			Matcher interpolationMatch = macroInterpolationPattern
					.matcher(macro.get("definition").trim());

			while (interpolationMatch.find()) {

				// Indices of capturing groups start at 1, not 0.
				// Index 0 refers to the entire expression, 1..n to subsequent
				// groups.
				currentInterpolation = interpolationMatch.group(1);

				usedArgs.add(currentInterpolation);

				if (!args.contains(currentInterpolation)) {
					this.error(this.MSG_INVALID_MACRO_DEFINITION, macro,
							" definition contains an invalid interpolation ("
									+ currentInterpolation + ")");

				}
			}

			if (!usedArgs.containsAll(args)) {
				this.error(this.MSG_UNUSED_MACRO_ARGUMENT, macro,
						"definition contains unused macro arguments");
			}
		}
	}

	private void validateMacroInvocation(HashMap<String, String> stanza,
			String currentInvocation) {

		// TODO: Improve comments here.
		String currentInvocationName = new String();

		ArrayList<String> invokedArgs = new ArrayList<String>();
		Integer numArgs = 0;

		Matcher invocationArgumentMatch = macroInvocationArgumentPattern
				.matcher(currentInvocation.trim());

		if (invocationArgumentMatch.find()) {
			currentInvocationName = invocationArgumentMatch.group(1);
			if (invocationArgumentMatch.group(2) != null) {

				for (String s : invocationArgumentMatch.group(2).split(",")) {
					invokedArgs.add(s.trim());
					numArgs += 1;
				}
			}
		} else {
			// Zero-argument invocation.
			currentInvocationName = currentInvocation;
		}

		// Raise alert if an unquoted nested macro's argument is not one of the following:
		// a) An interpolated $<arg>$ string (note that we already caught invalid
		//    interpolations in validateMacroArguments())
		// b) An valid macro argument name composed from character set [0-9A-Za-z_-].
		// c) A string plus a valid interpolation argument (weak verification).
		//    For instance, settags_$domain$. Arguments have already been verified,
		//    so while we can't verify that this macro will work after interpolation,
		//    we can validate that it is "correct" syntactically.
		
		for (String s : invokedArgs) {
			if (s.matches("[A-Za-z0-9_-]+")
					|| s.matches("\\$([A-Za-z0-9_-]+)\\$_([A-Za-z0-9_-]+)")
					|| s.matches("([A-Za-z0-9_-]+)_\\$([A-Za-z0-9_-]+)\\$")
					|| (s.startsWith("$") && s.endsWith("$"))
					|| (s.startsWith("\"") && s.endsWith("\""))) {
				;
			} else {
				if (!this.permittedArgs.contains(s)) {
					// TODO: Enable check for unquoted macro arguments.
					// error(MSG_INVALID_NESTED_MACRO_INVOCATION, stanza,
					//		"contains an invalid unquoted macro argument: " + s);
					;
				}
			}
		}

		// Raise alert if invocation is to an nonexistent macro.
		// Permit exceptions for macros which have $<arg>$ substitutions in their names.
		// (weak verification again).

		if (!this.macroNames.contains(currentInvocationName)) {
			if 	(!currentInvocationName.matches("\\$([A-Za-z0-9_-]+)\\$_([A-Za-z0-9_-]+)")
					&& !currentInvocationName.matches("([A-Za-z0-9_-]+)_\\$([A-Za-z0-9_-]+)\\$")) {
			error(MSG_INVALID_NESTED_MACRO_INVOCATION, stanza,
					"invokes a nonexistent macro: " + currentInvocationName);
			}
		} else {
			// Raise alert if nested macro exists, but has too many arguments.

			if (!this.macroArgs.containsKey(numArgs)) {
				error(MSG_INVALID_NESTED_MACRO_INVOCATION, stanza,
						"invokes a nested macro `" + currentInvocationName
								+ "` with too many arguments (" + numArgs
								+ ").");
			} else {
				// Raise alert if nested macro has invalid number of arguments.
				if (!this.macroArgs.get(numArgs)
						.contains(currentInvocationName)) {
					error(MSG_INVALID_NESTED_MACRO_INVOCATION, stanza,
							"invokes a nested macro `" + currentInvocationName
									+ "` with invalid number of arguments ("
									+ numArgs + ").");
				}
			}
		}
	}

	private void validateNestedMacroInvocations() {

		// Validate that a nested macro invocation is correct.
		// Alert on the following conditions:
		//
		//   a) Nested invocation of macro with incorrect number of arguments.
		//   b) Nested invocation of nonexistent macro.
		//   c) Nested invocation with non-quoted argument which is not 
		//      alphanumeric. Handle common exceptions.

		// TODO: Extend this to allow XML and savedsearches.conf parsing.
		for (HashMap<String, String> macro : this.allMacros) {

			Matcher invocationMatch = macroInvocationPattern.matcher(macro.get(
					"definition").trim());

			while (invocationMatch.find()) {

				// Indices of capturing groups start at 1, not 0.
				// Index 0 refers to the entire expression, 1..n to subsequent
				// groups.
				this.validateMacroInvocation(macro, invocationMatch.group(1));
			}
		}
	}

	private void collectAllMacros() {

		for (DirSet ds : this.dirset) {
			String base = ds.getDir().getPath();

			if (debug == true) {
				System.out.println("CHECKING all macros.conf files under: "
						+ base);
			}

			List<String> dirs = Arrays.asList(ds.getDirectoryScanner()
					.getIncludedDirectories());

			for (String dir : dirs) {

				ArrayList<HashMap<String, String>> current = new ArrayList<HashMap<String, String>>();
				current = this.collectMacrosFromFile(base + "/" + dir);

				// Add complete stanza to the list.
				this.allMacros.addAll(current);

				if (this.debug) {
					System.out.println(base + "/" + dir + ": " + current.size()
							+ " macros");
				}

				// Add the macro names and arguments to the collection of valid
				// macros.
				for (HashMap<String, String> macro : current) {

					this.macroNames.add(macro.get("name"));

					Integer argc = Integer.parseInt(macro.get("argc"));
					if (this.macroArgs.containsKey(argc)) {
						this.macroArgs.get(argc).add(macro.get("name"));
					} else {
						this.macroArgs.put(
								argc,
								new ArrayList<String>(Arrays.asList(macro
										.get("name"))));
					}
				}
			}
		}
	}

	private void debugPrintMacroArgs(
			HashMap<Integer, ArrayList<String>> macroArgs) {
		// Print out the macro argument index.
		for (Integer i : macroArgs.keySet()) {
			System.out.println("ARGUMENT COUNT: " + i);
			for (String s : macroArgs.get(i)) {
				System.out.println("    " + s);
			}
		}
	}

	// Enable/disable debugging if requested in build file.
	public void setDebug(Boolean b) {
		this.debug = b;
	}

	// Add the dirset provided as nested element.
	public void addDirset(DirSet d) {
		this.dirset.add(d);
	}

	// Set the output property.
	public void setOutputProperty(String outputProperty) {
		this.outputProperty = outputProperty;
	}

	private void error(String msg, HashMap<String, String> macro, String errtext) {

		// Increment error count
		this.errorMap.put(msg, this.errorMap.get(msg) + 1);

		// Maintain consistent output format
		if (!this.INVALID_MACRO_IDENTIFIER.contentEquals(macro.get("name"))) {
			System.out.println(msg + "\n\t" + macro.get("file") + ":"
					+ macro.get("name") + "(" + macro.get("argc") + ")"
					+ "\n\t" + errtext);
		} else {
			System.out.println(msg + "\n\t" + macro.get("file") + ":" + "\n\t"
					+ errtext);

		}
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
				System.out.println("Could not open file " + filename);
				e.printStackTrace();
			}
		}
		return scanner;
	}

	private ArrayList<HashMap<String, String>> collectMacrosFromFile(
			String dirname) {

		String conf = dirname + "/" + this.MACRO_FILENAME;
		String line = new String();

		String macroName = new String();
		String macroArgC = new String();
		ArrayList<String> element = new ArrayList<String>();

		// Read in macro file.
		ArrayList<HashMap<String, String>> macros = new ArrayList<HashMap<String, String>>();
		HashMap<String, String> stanza = null;

		Scanner scanner = getScanner(conf);
		if (scanner != null) {

			while (scanner.hasNextLine()) {

				line = scanner.nextLine();

				// Ignore comments and blank lines
				if (line.startsWith("#") || line.matches("^\\s*$")) {
					continue;
				} else if (line.startsWith("[")) {

					// Push previous stanza onto the vector.
					if (stanza != null) {
						macros.add(stanza);
					}

					// Begin a new macro stanza.
					stanza = new HashMap<String, String>();

					// Get macro name and number of arguments.
					Matcher macroDefinitionMatch = macroDefinitionPattern
							.matcher(line);

					if (macroDefinitionMatch.find()) {
						// Indices of capturing groups start at 1, not 0.
						// Index 0 refers to the entire expression.
						macroName = macroDefinitionMatch.group(1);
						if (macroDefinitionMatch.group(3) != null) {
							// macroArgC =
							// Integer.parseInt(macroDefinitionMatch.group(3));
							macroArgC = macroDefinitionMatch.group(3);
						} else {
							macroArgC = "0";
						}
						stanza.put("name", macroName);
						stanza.put("file", conf);
						stanza.put("argc", macroArgC);

						if (this.debug == true) {
							System.out.println(macroName + " " + macroArgC);
						}
					} else {
						// A failed regex match indicates an invalid macro name
						// or argument count.
						stanza.put("file", conf);
						stanza.put("name", this.INVALID_MACRO_IDENTIFIER);
						this.error(this.MSG_INVALID_MACRO_DEFINITION, stanza,
								line + " is not a valid macro definition.");
					}
				} else {
					element = new ArrayList<String>(Arrays.asList(line.split(
							"=", 2)));
					if (element.size() == 2) {
						stanza.put(element.get(0).trim(), element.get(1).trim());
					} else {
						stanza.put(element.get(0).trim(), "");
					}
				}
			}

			// Close Scanners to prevent resource leaks.
			scanner.close();

		}

		// Push last stanza.
		if (stanza != null) {
			macros.add(stanza);
		}

		// Drop any invalid stanzas
		ArrayList<HashMap<String, String>> validMacros = new ArrayList<HashMap<String, String>>();
		for (HashMap<String, String> tmpStanza : macros) {
			if (!tmpStanza.get("name").contentEquals(
					this.INVALID_MACRO_IDENTIFIER)) {
				validMacros.add(tmpStanza);
			}
		}

		// Return the macros for future processing.
		return validMacros;
	}
}