
public class SplunkDirectoryLister extends SplunkValidationCallback {

	public SplunkDirectoryLister(String level) {
		super(level);
	}
	
	public int process_directory(String directory) {
		info("Traversing directory");
		return 0;
	}

};
