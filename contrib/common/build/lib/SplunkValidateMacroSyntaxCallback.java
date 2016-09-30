import org.apache.tools.ant.types.DirSet;
import org.apache.tools.ant.types.PatternSet;

import java.io.File;
import java.util.regex.*;
import java.util.*;

public class SplunkValidateMacroSyntaxCallback extends SplunkValidationCallback {

	// This Ant task validates that all macros defined in macros.conf in a Splunk 
	// installation have the following characteristics:
	// 1. Are composed of only the following character set: [A-Za-z0-9_-].
	// 2. Have a number of arguments corresponding to the macro definition.
	// 3. If unquoted formal macro arguments are used, that they are composed of the
	// following character set: [A-Za-z0-9_-]
	// 4. Are not duplicated across or within apps.

	// Additionally, the following validations are performed on macro invocations:
	// 1. Macro invocations must correspond to defined macros.

	// Info, Warning, and Error messages initialized statically.
	protected static enum Message {

		// Error messages
		ERR_UNUSED_MACRO_ARGUMENT					(Logging.ERROR, "UNUSED MACRO ARGUMENT"),
		ERR_INVALID_MACRO_DEFINITION				(Logging.ERROR, "INVALID MACRO DEFINITION"), 
		ERR_INVALID_MACRO_ARGUMENT					(Logging.ERROR, "INVALID MACRO ARGUMENT"), 
		ERR_INVALID_MACRO_ARGUMENT_COUNT			(Logging.ERROR, "INVALID MACRO ARGUMENT_COUNT"), 
		ERR_DUPLICATE_MACRO							(Logging.ERROR, "DUPLICATED MACRO DEFINITION"), 
		ERR_INVALID_MACRO_INVOCATION				(Logging.ERROR, "INVALID MACRO INVOCATION"), 
		ERR_INVALID_MACRO_INVOCATION_IN_DEFINITION	(Logging.ERROR, "INVALID MACRO INVOCATION IN DEFINITION"), 
		ERR_UNPARSEABLE_MACRO_INVOCATION			(Logging.ERROR, "UNPARSEABLE MACRO INVOCATION"),

		// Warning messages.
		WARN_ARGUMENT_INTERPOLATION_IN_MACRO_DEFINITION		(Logging.WARN, "MACRO DEFINITION USES INTERPOLATED ARGUMENT"), 
		WARN_ARGUMENT_INTERPOLATION_IN_MACRO_INVOCATION 	(Logging.WARN, "MACRO INVOCATION USES INTERPOLATED ARGUMENT"), 
		WARN_INVALID_ARGUMENT_IN_MACRO_DEFINITION			(Logging.WARN, "MACRO DEFINITION USES INVALID ARGUMENT"),
		WARN_INVALID_ARGUMENT_IN_MACRO_INVOCATION			(Logging.WARN, "MACRO INVOCATION USES INVALID ARGUMENT"),
		WARN_INDETERMINATE_MACRO_COUNT						(Logging.WARN, "INDETERMINATE MACRO COUNT"),
		WARN_UNUSED_MACRO									(Logging.WARN, "UNUSED MACRO");

		// Private members
		private final String description;
		private final Logging level;

		Message(Logging l, String s) {
			level = l;
			description = s;
		}

		public String toString() {
			return this.description;
		}

		public Logging getLevel() {
			return this.level;
		}

	}

	// Constants
	private String INVALID_MACRO_IDENTIFIER = "INVALID";

	// Shared regular expressions
	private Pattern macroInvocationPattern = Pattern
			.compile("(?:\\`([^\\`]+)\\`)");
	private Pattern macroInvocationArgumentPattern = Pattern
			.compile("(?:\\`{0,1})([^\\(\\`]+)(?:\\((.*)\\)){0,1}(?:\\`{0,1})");

	// The next pattern is partly explained on "Mastering Regular Expressions, 3rd. Edition pp.217,
	// and extended to:
	// 1. Allow enclosing whitespace around macro arguments, which is common
	//    for improving readability.
	// 2. Include the enclosing quotation marks, since we may perform additional
	//    validation on a macro argument if it is not quoted (in which case it 
	//    will most commonly be a field name or an eval command.
	// This regex is intended to handle Excel-format CSV syntax, which is
	// similar to the way we invoke macros.
	//
	// Note this may not work on Unicode, see below for details:
	// http://stackoverflow.com/questions/4731055/whitespace-matching-regex-java
	// Sample argument syntax:
	//
	//		`mymacro(fieldarg, "quoted arg", "$quoted_interpolated_arg$", "csv,arg,value")`
	//
	private Pattern macroInvocationArgumentSplitterPattern = Pattern
			.compile("\\G(?:^|,)(?:\\s*(\"(?:[^\"]++|\"\")++\")\\s*|(\\s*[^\",]+\\s*))");

	private Pattern macroInterpolationPattern = Pattern
			.compile("(?:\\$([A-Za-z0-9_-]+)\\$)");
	private Pattern macroDefinitionPattern = Pattern
			.compile("^\\[([A-Za-z0-9_-]+){1}(\\((\\d+)\\)){0,1}\\]");
	private Pattern argumentDefinitionPattern = Pattern
			.compile("^([A-Za-z0-9_-]+){1}$");

	private Pattern interpolatedArgumentPrefix = Pattern
			.compile("\\$([A-Za-z0-9_-]+)\\$_([A-Za-z0-9_-]+)");
	private Pattern interpolatedArgumentPostfix = Pattern
			.compile("([A-Za-z0-9_-]+)_\\$([A-Za-z0-9_-]+)\\$");

	// Files that include macros.
	String includeMacros = null; // populated from build.xml
	// Files that will not be validated.
	String excludeMacros = null; // populated from build.xml
	// Files that define macros.
	String defineMacros = "**/macros.conf";

	// Acceptable non-alphanumeric macro arguments.
	private HashSet<String> permittedArgs = new HashSet<String>();

	// Message counts.
	private HashMap<Message, Integer> messages = new HashMap<Message, Integer>();

	// Data structures for macro analysis.

	// 1. Array of all macros.
	private HashMap< HashMap<String, String>, Integer> allMacros = new HashMap<HashMap<String, String>, Integer>();

	// 2. Array of all macro names.
	private HashSet<String> macroNames = new HashSet<String>();

	// 3. Reverse HashMap of argument counts --> names
	private HashMap<Integer, ArrayList<String>> macroArgs = new HashMap<Integer, ArrayList<String>>();

	/**
	 * Default constructor.
	 */
	public SplunkValidateMacroSyntaxCallback() {
		this("info", null, null);
	}

	/**
	 * Primary constructor
	 * @param level
	 * @param includePatterns
	 * @param excludePatterns
	 */
	public SplunkValidateMacroSyntaxCallback(String level,
			String includePatterns, String excludePatterns) {
		super(level);
		// Initialize the list of permitted macro arguments.
		this.initPermittedArgs();
		// Initialize the error map.
		this.initErrorMap();
		// Assign includes and excludes.
		this.includeMacros = includePatterns;
		this.excludeMacros = excludePatterns;
	}

	public int preprocess_directory(DirSet ds) {

		debug("Begin preprocessing:" + ds.getDir());

		// Traverse the directory tree and collect macro definitions.
		// 1. Populate globals:
		//    a. allMacros
		//    b. macroArgs.
		// 2. Check macro name character sets. Any invalid macro 
		//    definitions are excluded from additional processing.
		this.getMacros(ds);

		// Debugging
		if (this.level == Logging.DEBUG) {
			this.debugPrintMacroArgs(this.macroArgs);
		}

		debug("End preprocessing:" + ds.getDir());
		return 0;
	}

	public int process_directory(DirSet ds) {

		debug("Begin processing:" + ds.getDir());

		// 1. Check for duplicate macros (should only happen once).
		this.checkDuplicateMacros();

		// 2. Validate all macro definitions.
		//    a. Validate that macro signatures are correct (number of arguments)
		//    b. Validate that macro string interpolations are correct.
		//    c. Validate macro argument name character sets.
		this.validateMacroArguments();

		// 3. Validate nested macro invocations in macro definitions.
		//    a. Validate that the invoked macro exists.
		//    b. Validate that the nested macro is invoked with
		//       the appropriate argument count.
		this.validateNestedMacroInvocations();

		// 4. Validate macro invocations in files. Note that validating nesting 
		//    is not necessary here since we have already validated the definitions.
		ArrayList<Matcher> matchers = new ArrayList<Matcher>();
		matchers.add(macroInvocationPattern.matcher(""));
		this.validateMacroInvocations(ds, matchers);

		// 5. Raise warnings for macros that are never invoked.
		for (HashMap<String, String> m: allMacros.keySet()) {
			if (allMacros.get(m) == 0) {
				this.formatMacroMsg(Message.WARN_UNUSED_MACRO, m,
						"This macro and argument count combination is never used.");
			}
		}
		
		debug("End processing:" + ds.getDir());

		// Return the number of matches as the total error count.
		return this.getMessageCounts(Logging.ERROR);

	}
	
	// ----------------------
	// Private setup routines
	// ----------------------

	/**
	 * Initializes ArrayList of arguments which are permitted as exceptions to
	 * standard macro argument validation.
	 */
	private void initPermittedArgs() {

		// TODO: Add capability to accept a list of permittedArgs directly from build.xml
		this.permittedArgs.add("time()");

	}

	/**
	 * Initializes hashmap of error strings.
	 */
	private void initErrorMap() {

		for (Message m : Message.values()) {
			this.messages.put(m, 0);
		}
	}

	// ---------------------------------
	// Private macro processing routines
	// ---------------------------------

	/**
	 * Discover all macros defined in macros.conf files found in a DirSet.
	 * 
	 * @param ds
	 */
	private void getMacros(DirSet ds) {

		File base = ds.getDir();

		for (String file : this.scanFiles(ds, defineMacros, null)) {
			ArrayList<HashMap<String, String>> current = new ArrayList<HashMap<String, String>>();

			if (this.level == Logging.DEBUG) {
				System.out.println("Processing: " + base + "/" + file);
			}

			// Collect the valid macros in the file.
			current = this.collectMacrosFromFile(base + "/" + file);

			// Add complete stanza to the list.
//			this.allMacros.addAll(current);
			for (HashMap<String, String> macro: current) {
				this.allMacros.put(macro, new Integer(0));
			}

			if (this.level == Logging.DEBUG) {
				System.out.println(base + "/" + file + ": " + current.size()
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

	/**
	 * Discover all macros defined in a single macros.conf file.
	 * 
	 * @param file
	 * @return
	 */
	private ArrayList<HashMap<String, String>> collectMacrosFromFile(String file) {

		String line = new String();
		ArrayList<String> element = new ArrayList<String>();

		// Read in macro file.
		ArrayList<HashMap<String, String>> macros = new ArrayList<HashMap<String, String>>();
		HashMap<String, String> stanza = null;

		Scanner scanner = this.getScanner(file);

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
					stanza = parseMacroDefinition(line, file);

				} else {
					// Populate the existing stanza with additional attributes.
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

	/**
	 * Detects duplicate macros.
	 */
	private void checkDuplicateMacros() {

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
						this.formatMacroMsg(Message.ERR_DUPLICATE_MACRO, i,
								"macro may be duplicated in multiple apps.");
					}
				}
			}
		}

	}

	/**
	 * Finds instances of a macro corresponding to a name and argument count.
	 * 
	 * @param macroName
	 * @param argc
	 * @return
	 * 
	 */
	private ArrayList<HashMap<String, String>> findInstances(String macroName,
			Integer argc) {
		// Return the macro stanzas corresponding to a name and argument count.
		// Only useful after allMacros is populated.

		ArrayList<HashMap<String, String>> instances = new ArrayList<HashMap<String, String>>();
		for (HashMap<String, String> macro : this.allMacros.keySet()) {
			if (macro.get("name").contentEquals(macroName)
					&& argc == Integer.parseInt(macro.get("argc"))) {
				instances.add(macro);
			}
		}

		return instances;

	}

	private void validateMacroArguments() {

		// The arguments defined in the macro signature.
		ArrayList<String> args = new ArrayList<String>();

		// The arguments actually used in the macro.
		HashSet<String> usedArgs = new HashSet<String>();

		// The argument count as defined in the macro declaration.
		int argc = 0;

		for (HashMap<String, String> macro : this.allMacros.keySet()) {

			// 1. Validate that macro argument counts correspond to declarations.

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
				Matcher argMatcher = macroInvocationArgumentSplitterPattern
						.matcher(macro.get("args"));
				while (argMatcher.find()) {
					if (argMatcher.start(2) >= 0) {
						args.add(argMatcher.group(2).trim());
					} else {
						args.add(argMatcher.group(1).trim());
					}
				}
			}

			// split will return an empty string if args is present in the
			// stanza but not defined, so remove any blank instances.
			args.removeAll(Arrays.asList(""));

			// If the number of actual arguments does not match the
			// declaration, increment error count and warn of the error.
			if (args.size() != argc) {
				this.formatMacroMsg(Message.ERR_INVALID_MACRO_ARGUMENT_COUNT,
						macro,
						"argument declaration does not match actual argument count");
			}

			// 2. Validate macro arguments are of the correct character set.
			for (String arg : args) {
				Matcher argumentMatch = argumentDefinitionPattern.matcher(arg
						.trim());
				if (!argumentMatch.find()) {
					this.formatMacroMsg(Message.ERR_INVALID_MACRO_ARGUMENT,
							macro, " has an invalid macro argument.");
				}
			}

			// 3. Validate macro string interpolation is correct.
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
					this.formatMacroMsg(Message.ERR_INVALID_MACRO_DEFINITION,
							macro,
							" definition contains an invalid interpolation ("
									+ currentInterpolation + ")");

				}
			}

			if (!usedArgs.containsAll(args)) {
				this.formatMacroMsg(Message.ERR_UNUSED_MACRO_ARGUMENT, macro,
						"definition contains unused macro arguments");
			}
		}
	}

	private void validateMacroInvocationInDefinition(
			HashMap<String, String> stanza, String currentInvocation) {

		// Invocation is a list of strings:
		//    invocation[0] = the macro name
		//    invocation[n>1] = macro arguments
		currentInvocation = currentInvocation.trim();
		ArrayList<String> invocation = parseMacroInvocation(currentInvocation);
		// Order is important in next two lines.
		Integer numArgs = (invocation.size() > 1) ? invocation.size() - 1 : 0;
		String currentInvocationName = (invocation.size() > 0) ? invocation
				.remove(0) : new String();

		ArrayList<HashMap<String, String>> instances = this.findInstances(currentInvocationName, numArgs);
		if (!instances.isEmpty()) {
			// Found a valid macro invocation. Update the count.
			if (instances.size() == 1) {
				HashMap<String, String> first = instances.get(0);
				this.allMacros.put(first, this.allMacros.get(first) + 1);
			} else {
				// Do nothing - macro will be validated below. All we care 
				// about at this point is updating the macro count.
				;
			}
		}
				
				
		// Raise alert if an unquoted nested macro's argument is not one of the following:
		// a) An interpolated $<arg>$ string (note that we already caught invalid
		//    interpolations in validateMacroArguments())
		// b) An valid macro argument name composed from character set [0-9A-Za-z_-].
		// c) A string plus a valid interpolation argument (weak verification).
		//    For instance, settags_$domain$. Arguments have already been verified,
		//    so while we can't verify that this macro will work after interpolation,
		//    we can validate that it is "correct" syntactically.
		// d) The empty string (indicating that the macro argument was a quoted empty 
		//    string, including the null string "".
		for (String s : invocation) {
			if (!(isValidMacroArgument(s) || this.permittedArgs.contains(s))) {
				formatMacroMsg( Message.WARN_INVALID_ARGUMENT_IN_MACRO_DEFINITION,
						stanza, "contains a possibly invalid macro argument: " + s);
			}
		}

		// Raise alert if invocation is to an nonexistent macro.
		// Permit exceptions for macros which have $<arg>$ substitutions in their names.
		// (weak verification).
		if (!this.macroNames.contains(currentInvocationName)) {
			if (interpolatedArgumentPrefix.matcher(currentInvocationName)
					.matches()
					|| interpolatedArgumentPostfix.matcher(
							currentInvocationName).matches()) {
				formatMacroMsg(
						Message.WARN_ARGUMENT_INTERPOLATION_IN_MACRO_DEFINITION,
						stanza,
						"uses $argument$ interpolation in a macro definition: "
								+ currentInvocationName);
			} else {
				this.formatMacroMsg(
						Message.ERR_INVALID_MACRO_INVOCATION_IN_DEFINITION,
						stanza, "invokes a nonexistent macro: "
								+ currentInvocationName);
			}
		} else {
			// Raise alert if nested macro exists, but has too many arguments.
			if (!this.macroArgs.containsKey(numArgs)) {
				this.formatMacroMsg(
						Message.ERR_INVALID_MACRO_INVOCATION_IN_DEFINITION,
						stanza, "invokes a nested macro `"
								+ currentInvocationName
								+ "` with too many arguments (" + numArgs
								+ ").");
			} else {
				// Raise alert if nested macro has invalid number of arguments.
				if (!this.macroArgs.get(numArgs)
						.contains(currentInvocationName)) {
					this.formatMacroMsg(
							Message.ERR_INVALID_MACRO_INVOCATION_IN_DEFINITION,
							stanza, "invokes a nested macro `"
									+ currentInvocationName
									+ "` with invalid number of arguments ("
									+ numArgs + ").");
				}
			}
		}
	}

	private void validateMacroInvocations(DirSet ds, ArrayList<Matcher> matchers) {
		// Validate that all macro invocations in a specific file are correct.
		// This validation is slightly different than validating nested invocations
		// in macro definitions, since all we need to do here is:
		//
		// a. Validate that a macro exists with the name and argument count.
		// b. Validate that the arguments are correctly formatted.

		HashMap<String, ArrayList<SplunkRegexMatch>> matches = this.getMatches(
				ds, this.includeMacros, this.excludeMacros, matchers);

		for (String filename : matches.keySet()) {
			debug("Analyzing macros in: " + filename);
			for (SplunkRegexMatch invocationMatch : matches.get(filename)) {
				// debug("    MACRO:" + invocationMatch.matched);
				ArrayList<String> invocation = parseMacroInvocation(invocationMatch.matched);
				// 1. Check to see whether macro could even be parsed.
				if (invocation.size() == 0) {
					this.formatInvocationMsg(
							Message.ERR_UNPARSEABLE_MACRO_INVOCATION,
							invocationMatch, "macro could not be parsed",
							filename);
				} else {
					// Pop the macro name. Order is important for the next two lines.
					String name = invocation.remove(0);
					Integer argc = invocation.size();
					// 2. Check for existence of macro by name and count.
					ArrayList<HashMap<String, String>> instances = this.findInstances(name, argc);
					if (instances.isEmpty()) {
						// Check to see if we failed to find it because
						// the invocation uses an interpolated string.
						if (interpolatedArgumentPrefix.matcher(name).matches()
								|| interpolatedArgumentPostfix.matcher(name)
										.matches()) {
							this.formatInvocationMsg(
									Message.WARN_ARGUMENT_INTERPOLATION_IN_MACRO_INVOCATION,
									invocationMatch,
									"uses $argument$ interpolation in a macro invocation",
									filename);
						} else {
							this.formatInvocationMsg(
									Message.ERR_INVALID_MACRO_INVOCATION,
									invocationMatch,
									"invokes a nonexistent macro", filename);
						}
					} else {
						// Found a valid macro invocation. Update the count.
						if (instances.size() == 1) {
							Integer curr = this.allMacros.get(instances.get(0));
							if (curr != null) {
								// debug("    Updating usage count: " + instances.get(0).get("name"));
								this.allMacros.put(instances.get(0), curr + 1);								
							}
						} else {
							// This should be a no-op since duplicate detection 
							// has already been performed, but may raise a cascading error.
							formatInvocationMsg(Message.WARN_INDETERMINATE_MACRO_COUNT,
									invocationMatch, "incorrect macro count found (possible duplicates): " + name,
									filename);
						}
							
						// 3. Check macro arguments for correctness.
						for (String arg : invocation) {
							if (!(isValidMacroArgument(arg) || this.permittedArgs.contains(arg))) {
								formatInvocationMsg(Message.WARN_INVALID_ARGUMENT_IN_MACRO_INVOCATION,
										invocationMatch, "contains a possibly invalid macro argument: " + arg,
										filename);
							}
						}
					}
				}
			}
		}
	}

	/**
	 * Validate a macro argument.
	 * 
	 * @param arg
	 *            - A macro argument, possibly quoted.
	 */
	private Boolean isValidMacroArgument(String arg) {
		return (arg.matches("[A-Za-z0-9_-]+") || arg.matches("^\\s*$")
				|| interpolatedArgumentPrefix.matcher(arg).matches()
				|| interpolatedArgumentPostfix.matcher(arg).matches()
				|| (arg.startsWith("$") && arg.endsWith("$")) 
				|| (arg.startsWith("\"") && arg.endsWith("\"")));
	}

	/**
	 * Get the macro and argument count from a Splunk macro definition such as
	 * [mymacro(1)]
	 * 
	 * @param definitionStr
	 *            - The macro definition string.
	 * @return
	 * 
	 */
	private HashMap<String, String> parseMacroDefinition(String definitionStr,
			String filename) {

		HashMap<String, String> stanza = new HashMap<String, String>();
		stanza.put("file", filename);
		String macroName = null;
		String macroArgC = null;

		// Get macro name and number of arguments.
		Matcher macroDefinitionMatch = macroDefinitionPattern
				.matcher(definitionStr);

		if (macroDefinitionMatch.find()) {
			// Indices of capturing groups start at 1, not 0.
			// Index 0 refers to the entire expression.
			macroName = macroDefinitionMatch.group(1);
			if (macroDefinitionMatch.group(3) != null) {
				macroArgC = macroDefinitionMatch.group(3);
			} else {
				macroArgC = "0";
			}
			stanza.put("name", macroName);
			stanza.put("argc", macroArgC);

			if (this.level == Logging.DEBUG) {
				System.out.println(macroName + " " + macroArgC);
			}

		} else {
			// A failed regex match indicates an invalid macro name
			// or argument count.
			stanza.put("file", filename);
			stanza.put("name", this.INVALID_MACRO_IDENTIFIER);
			this.formatMacroMsg(Message.ERR_INVALID_MACRO_DEFINITION, stanza,
					definitionStr + " is not a valid macro definition.");
		}

		return stanza;
	}

	/**
	 * Get the macro and argument count from a Splunk macro INVOCATION such as
	 * `mymacro(arg1, arg2)`
	 * 
	 * @param invocationStr
	 * @param filename
	 * @return Arraylist<String> representing the macro and arguments.
	 * 
	 */
	private ArrayList<String> parseMacroInvocation(String invocationStr) {

		// System.out.println("DEBUG: " + invocationStr);
		ArrayList<String> invocation = new ArrayList<String>();

		Matcher invocationArgumentMatch = macroInvocationArgumentPattern
				.matcher(invocationStr.trim());

		if (invocationArgumentMatch.find()) {
			// Add the macro name.
			// System.out.println("DEBUG: macro name: " + invocationArgumentMatch.group(1));

			invocation.add(invocationArgumentMatch.group(1));
			if (invocationArgumentMatch.group(2) != null) {

				// Add the macro arguments. Note that it is not sufficient to
				// simply split by the comma character here, because we may use 
				// a delimited quoted macro argument such as `mymacro("abc,def")`
				Matcher argMatcher = macroInvocationArgumentSplitterPattern
						.matcher(invocationArgumentMatch.group(2));
				while (argMatcher.find()) {
					if (argMatcher.start(2) >= 0) {
						invocation.add(argMatcher.group(2).trim());
					} else {
						invocation.add(argMatcher.group(1).trim());
					}
				}
			}
		} else {
			// Zero-argument invocation.
			invocation.add(invocationStr);
		}

		return invocation;

	}

	private void validateNestedMacroInvocations() {

		// Validate that a nested macro invocation is correct.
		// Alert on the following conditions:
		//
		//   a) Nested invocation of macro with incorrect number of arguments.
		//   b) Nested invocation of nonexistent macro.
		//   c) Nested invocation with non-quoted argument which is not 
		//      alphanumeric. Handle common exceptions.

		// Note that since we iterate over all macros, we don't need to handle
		// this recursively - it is sufficient to check each macro individually
		// for one level of nesting.

		for (HashMap<String, String> macro : this.allMacros.keySet()) {

			Matcher invocationMatch = macroInvocationPattern.matcher(macro.get(
					"definition").trim());

			while (invocationMatch.find()) {

				// Indices of capturing groups start at 1, not 0.
				// Index 0 refers to the entire expression, 1..n to subsequent
				// groups.
				this.validateMacroInvocationInDefinition(macro,
						invocationMatch.group(1));
			}
		}
	}

	// ------------------------
	// Private utility routines
	// ------------------------

	/**
	 * Returns the total count of errors found.
	 * @return
	 */
	private int getMessageCounts(Logging level) {
		int total = 0;
		for (Message m: messages.keySet()) {
			if (m.getLevel() == Logging.ERROR) {
				total += messages.get(m);				
			}
		}
		return total;
	}
	
	/**
	 * Prints a formatted error message for a macro definition at the
	 * appropriate logging level, and increments the message count.
	 * 
	 * @param msg
	 * @param macro
	 * @param errtext
	 * @return
	 * 
	 */
	private void formatMacroMsg(Message msg, HashMap<String, String> macro,
			String errtext) {

		// Increment message count
		this.messages.put(msg, this.messages.get(msg) + 1);

		String text;

		// Maintain consistent output format
		if (!this.INVALID_MACRO_IDENTIFIER.contentEquals(macro.get("name"))) {
			text = msg + "\n\t" + macro.get("file") + ": " + macro.get("name")
					+ "(" + macro.get("argc") + ")" + "\n\t" + errtext;
		} else {
			text = msg + "\n\t" + macro.get("file") + ":" + "\n\t" + errtext;
		}

		log(text, msg.getLevel());

	}

	/**
	 * Returns a formatted error message for a macro invocation, and increments
	 * the error count for the error indicated by "msg".
	 * 
	 * @param msg
	 * @param macro
	 * @param errtext
	 * @return
	 * 
	 */
	private void formatInvocationMsg(Message msg, SplunkRegexMatch match,
			String errtext, String filename) {

		// Increment error count
		this.messages.put(msg, this.messages.get(msg) + 1);

		log(String.format(
				"%s\n\tfile:%s|lineno:%s|begin:%s|length:%s\n\t%s: %s", msg,
				filename, match.lineno, match.begin, match.length, errtext,
				match.matched), msg.getLevel());
	}

	private void debugPrintMacroArgs(
			HashMap<Integer, ArrayList<String>> macroArgs) {
		// Print out the macro argument index.
		for (Integer i : macroArgs.keySet()) {
			System.out.println("ARGUMENT COUNT: " + i);
			ArrayList<String> macrosOfArgCount = macroArgs.get(i);
			Collections.sort(macrosOfArgCount);
			for (String s : macrosOfArgCount) {
				System.out.println("    " + s);
			}
		}
	}

};
