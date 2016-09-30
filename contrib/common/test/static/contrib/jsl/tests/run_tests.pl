#!/usr/bin/perl

use strict;
use File::Find;
use File::Spec;
use FindBin;

# require a path to jsl
#
if (scalar(@ARGV) != 1) {
    die("Usage: run_tests.pl <path to jsl>\n");
}
my $jsl_path = File::Spec->rel2abs($ARGV[0]);
my $tests_path = $FindBin::Bin;

my $num_tests = 0;
my $num_passed = 0;
sub TestFile {
    /\.(js|htm|html)$/ or return;
    my $filename = $_;
    my $pretty_name = $File::Find::name;

    my $conf_file = ".jsl.conf";

    # open the path being validated
    open(FILE, $filename) or die("Could not open $filename: $!");
    my @contents = <FILE>;

    # look for special configuration directives
    my @conf = grep(s/\/\*conf:(([^*]|(\*[^\/]))*)\*\//\1\n/g, @contents);
    open(FILE, ">$conf_file") or die("Could not open configuration file $conf_file: $!");
    print FILE join("",@conf);
    close FILE;

    my $this_passed = 1;

    # look for expected configuration error
    my @all_conf_errors = grep(s/\/\*conf_error:(([^*]|(\*[^\/]))*)\*\//\1/g, @contents);
    my $conf_error;
    if (scalar(@all_conf_errors) > 1) {
        print "Only one conf_error allowed per script.";
        $this_passed = 0;
    }
    elsif (scalar(@all_conf_errors) == 1) {
        $conf_error = $all_conf_errors[0];
        unless ($conf_error) {
            print "Missing conf_error text.";
            $this_passed = 0;
        }
    }

    # run the lint
    print "Testing $pretty_name...\n";
    my $results = `$jsl_path --conf $conf_file --process $filename --nologo --nofilelisting --nocontext --nosummary -output-format __LINE__,__ERROR_NAME__`;
    my $exit_code = $? >> 8;
    unlink $conf_file;
    die "Error executing $jsl_path" unless defined $results;

    if ($conf_error) {
        unless ($exit_code == 2) {
            print "Expected exit code: $exit_code\n";
            $this_passed = 0;
        }
        unless (index($results, "configuration error: $conf_error") > 0) {
            print "Expected configuration error: $conf_error";
            print "Got configuration error: $results";
            $this_passed = 0;
        }
    }
    elsif ($exit_code == 2) {
        print "Usage or configuration error:\n$results";
        $this_passed = 0;
    }

    foreach my $result (split("\n", $results)) {
        my ($line, $error) = split(",", $result);
        next unless $error; # for now, skip blank errors (such as inability to open file)

        # some warnings point beyond the end of the file
        $line = scalar(@contents) if $line > scalar(@contents);

        unless ($contents[$line-1] =~ s/\/\*warning:$error\*\///) {
            print "Error in $filename, line $line: $error\n";
            $this_passed = 0;
        }
    }
    for (my $i = 1; $i <= scalar(@contents); $i++) {
        if ($contents[$i-1] =~ /\/\*warning:([^*]*)\*\//) {
            print "Error in $filename, line $i: no $1 warning\n";
            $this_passed = 0;
        }
    }
    close(FILE);

    $num_tests++;
    $num_passed++ if $this_passed;
}

# locate all files in the test folder
#
my @dirs;
push(@dirs, $tests_path);
print "Searching $tests_path...\n";
find( sub{TestFile}, '.');

print "Passed $num_passed of $num_tests tests\n";
