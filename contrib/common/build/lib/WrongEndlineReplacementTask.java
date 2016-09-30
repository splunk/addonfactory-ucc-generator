import org.apache.tools.ant.Task;
import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.types.*;
import org.apache.tools.ant.BuildException;
import java.io.*;
import java.util.regex.*;
import java.util.*;
import java.util.Vector;

import java.nio.channels.FileChannel;
import java.nio.charset.Charset;
import java.nio.CharBuffer;
import java.nio.ByteBuffer;


/**
 * This class replaces line-endings that do not match the platform with correct line-endings. This is useful for handling cases
 * where someone submits a file to Perforce with the wrong line-endings; this can cause people who download the
 * files from the repository to get the wrong line-endings (see http://jira.splunk.com:8080/browse/SOLNESS-546).
 * @author dzakharov
 *
 */
public class WrongEndlineReplacementTask extends Task {
	
	// The file sets we are going to examine
	private Vector<FileSet> filesets = new Vector<FileSet>();
	
	// The property to set if we find problems
	private String outputProperty = null;
	
	// How far to look in the files
	private int depth = 4096;
	
	/**
	 * Set the property that will be defined if we find problems
	 */
    public void setOutputProperty(String outputProperty) {
        this.outputProperty = outputProperty;
    }
    
	/**
	 * Set how deep into the files we will go.
	 */
    public void setDepth(int depth) {
        this.depth = depth;
    }
    
    /**
     * Execute the task
     */
    public void execute() throws BuildException {
    	
    	// The number of problems found and replacements made
    	int replacements = 0;
    	
    	// Iterate through the files
        for(Iterator itFSets = filesets.iterator(); itFSets.hasNext(); ) {
        	
        	// Get the next file set
            FileSet fs = (FileSet)itFSets.next();
            
            // Create a scanner to look at the files
            DirectoryScanner ds = fs.getDirectoryScanner(getProject());
            
            // Get a list of the included files
            String[] includedFiles = ds.getIncludedFiles();
            
            // Review each file
            for(int i=0; i<includedFiles.length; i++) {
            	
            	// Get a reference to the file
                File base  = ds.getBasedir();
                File file = new File(base, includedFiles[i]);
                
                // Analyze the file
                try{
                	replacements = replacements + replaceFileLineEndings( file );
                }
                catch(IOException e ){
			        System.out.println("Unable to read the file: " + file.getPath() + " " + e.toString() );
			        e.printStackTrace();
                }
            }
        }
        
        // Set the property if errors were found
        if (outputProperty != null && replacements > 0){
            getProject().setNewProperty(outputProperty, Integer.toString(replacements) );
        }
        
        // Throw an exception if a property was not defined
        else if( replacements > 0 ){
    		throw new BuildException("" + replacements + " files with endlines that do not match the platform");
    	}
    }
    
    /**
     * Add a fileset
     */
    public void addFileset(FileSet fileset) {
        filesets.add(fileset);
    }
    
    /**
     * Load a byte-buffer for the given file.
     */
    private ByteBuffer fromFile(File file, int maxBytes) throws IOException {
    	
        FileInputStream fis = new FileInputStream(file);
        FileChannel fc = fis.getChannel();

        // Create a read-only CharBuffer on the file
        int depth = (int)fc.size();
        
        if( depth > maxBytes ){
        	depth = maxBytes;
        }
        
        ByteBuffer bbuf = fc.map(FileChannel.MapMode.READ_ONLY, 0, depth);

        return bbuf;
    }
    
    /**
     * Load the given file into a sequence
     */
    private CharSequence fromFileChr(File file, int maxBytes) throws IOException {
    	
    	ByteBuffer bbuf = fromFile(file, maxBytes);
        CharBuffer cbuf = Charset.forName("ISO-8859-1").newDecoder().decode(bbuf);
        
        return cbuf;
    }
    
    /**
     * Count the number of matches of the given pattern in the file.
     */
    private int countMatches( CharSequence fileContents, Pattern pattern){
    	Matcher matcher = pattern.matcher(fileContents);
    	
    	int matches = 0;
    	
        while (matcher.find()) {
        	matches = matches + 1;
        }
        
        return matches;
    }

    /**
     * Count the number of matches of the given byte in the file.
     */
    private int countMatches( ByteBuffer fileContents, Byte b){
    	fileContents.rewind();
    	
    	int matches = 0;
    	
    	while ( fileContents.hasRemaining() ){
    		if( fileContents.get() == b){
    			matches = matches + 1;
    		}
    	}
        
        return matches;
    }

    /**
     * Replace line-endings in the given file.
     */
    private int replaceFileLineEndings( File file ) throws IOException{
    	
		String sep = System.getProperty("line.separator");
		
		CharSequence fileContents = fromFileChr( file, depth);
		
		int mac_endlines = countMatches(fileContents, Pattern.compile("\r[^\n]"));
		int unix_endlines = countMatches(fileContents, Pattern.compile("[^\r]\n"));
		int win_endlines = countMatches(fileContents, Pattern.compile("\r\n"));

		if( sep.equals("\r\n") && (mac_endlines > 1 || unix_endlines > 1)){
			System.out.println("The following file has end-lines that do not match the platform, replacing with correct ones...: " + file.toString());
                        normalizeFile(file);
			return 1;
		}
		else if( sep.equals("\n") && (mac_endlines > 1 || win_endlines > 1) ){
			System.out.println("The following file has end-lines that do not match the platform, replacing with correct ones...: " + file.toString());
                        normalizeFile(file);
			return 1;
		}
		else if( sep.equals("\r") && (win_endlines > 1 || unix_endlines > 1) ){
			System.out.println("The following file has end-lines that do not match the platform, replacing with correct ones...: " + file.toString());
                        normalizeFile(file);
			return 1;
		}
    	
    	return 0;
    }

    /**
     * Replace line-endings in the given file with ones matching the OS where JVM runs. Borrowed from http://stackoverflow.com/questions/3776923/how-can-i-normalize-the-eol-character-in-java
     */
    private void normalizeFile(File f) {      
    		File temp = null;
    		BufferedReader bufferIn = null;
    		BufferedWriter bufferOut = null;        

    		try {           
        		if(f.exists()) {
            			// Create a new temp file to write to
            			temp = new File(f.getAbsolutePath() + ".normalized");
            			temp.createNewFile();

            			// Get a stream to read from the file un-normalized file
            			FileInputStream fileIn = new FileInputStream(f);
            			DataInputStream dataIn = new DataInputStream(fileIn);
            			bufferIn = new BufferedReader(new InputStreamReader(dataIn));

            			// Get a stream to write to the normalized file
            			FileOutputStream fileOut = new FileOutputStream(temp);
            			DataOutputStream dataOut = new DataOutputStream(fileOut);
            			bufferOut = new BufferedWriter(new OutputStreamWriter(dataOut));

            			// For each line in the un-normalized file
            			String line;
            			while ((line = bufferIn.readLine()) != null) {
                			// Write the original line plus the operating-system dependent newline
                			bufferOut.write(line);
                			bufferOut.newLine();                                
            			}

            			bufferIn.close();
            			bufferOut.close();

            			// Remove the original file
            			f.delete();

            			// And rename the original file to the new one
            			temp.renameTo(f);
        		} else {
            			// If the file doesn't exist...
            			System.out.println("Could not find file to open: " + f.getAbsolutePath());
   		     	}
    		} catch (Exception e) {
        		System.out.println("Exception thrown: " + e.getMessage());
                        e.printStackTrace();
    		} finally {
        		// Clean up, temp should never exist
        		temp.delete();
                        try {
        		    	bufferIn.close();
        			bufferOut.close();
			} catch (IOException e) {
				System.out.println("Exception thrown: " + e.getMessage());
				e.printStackTrace();
			}
    		}
	}

}
