from argparse import ArgumentParser

class CherryPickerArgParser:
	'''
	Class used for parsing command line arguments for CherryPicker.
	'''
	def __init__(self):

		self.arg_options = ArgumentParser()
		self.arg_options.add_argument("--repo_path", "-repo_path", dest="repo_path")
		self.arg_options.add_argument("--merge_hash", "-merge_hash", dest="merge_hash")
		self.arg_options.add_argument("--merged_into_branch", "-merged_into_branch", dest="merged_into_branch", default="develop")
		self.arg_options.add_argument("--dest_branch", "-dest_branch", dest="dest_branch")

	def parse_cherry_picker_args(self):
		
		return self.arg_options.parse_args()

