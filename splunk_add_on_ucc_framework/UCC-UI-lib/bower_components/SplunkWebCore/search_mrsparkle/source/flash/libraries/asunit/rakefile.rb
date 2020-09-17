require 'sprout'
sprout 'as3'

ASUNIT_VERSION = '2.8'

##########################################
# To build from this file, install Ruby (http://ruby-lang.org)
# and RubyGems (http://rubygems.org/), then run:
#   gem install sprout
#   gem install rake
#   rake
# This should walk you through the installation
# of required gems, compilers and vms

##########################################
# Compile the Test Harness

desc "Compile the test harness"
mxmlc 'bin/AsUnitRunner.swf' do |t|
  t.default_size = '1000 600'
  t.source_path << 'src'
  t.input = 'test/AsUnitRunner.as'
end

##########################################
# Generate documentation

desc "Generate documentation"
asdoc 'doc' do |t|
  t.appended_args = '-examples-path=examples'
  t.source_path << 'src'
  t.doc_classes << 'AsUnit'

  # Include air swcs to avoid failures
  # on AirRunner:
  t.library_path << 'lib/airglobal.swc'
  t.library_path << 'lib/airframework.swc'
end

##########################################
# Launch the Test Harness

desc "Compile and run the test harness"
flashplayer :run => 'bin/AsUnitRunner.swf'

##########################################
# Package framework ZIPs and SWCs

archive = "bin/asunit3.#{ASUNIT_VERSION}.zip"

zip archive do |t|
  t.input = 'src/asunit'
  puts "Created zip archive at: #{archive}"
end

desc "Create zip archives"
task :zip => archive

##########################################
# Set up task wrappers

task :default => :run

desc "Alias to the default task"
task :test => :run
