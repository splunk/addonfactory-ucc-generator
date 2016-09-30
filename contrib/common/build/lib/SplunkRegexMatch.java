class SplunkRegexMatch {
	public String matched;
	public int lineno;
	public int begin;
	public int length;

	SplunkRegexMatch() {
		matched = "";
		lineno = -1;
		begin = -1;
		length = -1;
	}

	SplunkRegexMatch(String s, int n, int b, int l) {
		matched = s;
		lineno = n;
		begin = b;
		length = l;
	}

}