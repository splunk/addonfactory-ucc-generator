#!/usr/bin/python

from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import os
from stat import *
import re
import sys
import getopt
import json
import marshal
import shutil
from tarfile import TarFile, TarInfo, DIRTYPE
from gzip import GzipFile
import gzip
import StringIO
import tempfile
import string
import random

def usage():
    print """
    Builds a Splunk application from source code into an archive that can be installed.
    
    Usage:
        buildit.py [ -v | -h ]
        
            -h, --help: Display this help message
        
            -v, --verbose: Display more detailed messages about the script's activity
            
            -t, --target: Build the target specified (otherwise, all targets will be built)
            
            -s, --syncdir: Instead of building an archive, export the files to the given directory
            
            -b, --buildtype: The type of build to create (one of tar.gz, tar, zip)
            
            -l, --logfile: Send the results to the given log file instead of to standard output and standard error
    
    Copyright (C) 2009-2012 Splunk Inc. All Rights Reserved.
    
    Author: Luke Murphey, Splunk, Inc.
    """

def file_transform_to_unix_endlines( file_string, **kwargs ):
    return re.sub(r'(\r\n|\r|\n)', '\n', file_string)

def file_transform_to_windows_endlines( file_string, **kwargs ):
    return re.sub("\r?\n", "\r\n", file_string)

def file_transform_substitute( file_string, **kwargs ):
    """Takes an input and performs variable substitution to replace variables with the value of the same name in the provided properties dictionary"""
    
    properties = kwargs['properties']
    
    for k in properties:
        file_string = file_string.replace("${" + str(k) + "}", str(properties[k]))
    
    return file_string

def get_file_transform_macro( name ):
    return get_file_transform_macro.func_globals[ "file_transform_" + name]

def handle_recursions(filename):
    """Removes the .. references in order to resolve the final file path"""
    filename = os.path.normpath(filename)
    
    parts = filename.split(os.sep)
    result = ""
    
    up_dir = 0
    
    for p in parts:
        if p == "..":
            up_dir = up_dir + 1
        elif up_dir > 0:
            up_dir = up_dir - 1
        else:
            result = result + os.sep + p
    
    return result

def get_extension( filename ):
    filename = os.path.basename(filename)
    
    extension_start = filename.find(".")
    
    if extension_start <= -1:
        return None
    else:
        filename[filename.find("."):]
        
def has_extension( filename ):
    if get_extension(filename) is None:
        return False
    else:
        return True

def output_warning( message, log_file = None ):
    if log_file is not None:
        try:
            f = open(log_file, 'a')
            f.write("Warning: " + message + "\n")
            f.close()
        except Exception, e:
            sys.stderr.write('Build failed: could not open output log file, %s' % e )
            sys.exit(3)
    else:
        sys.stderr.write("Warning: " + message + "\n")
    
def output_error( message, log_file = None ):
    if log_file is not None:
        try:
            f = open(log_file, 'a')
            f.write("Error: " + message + "\n")
            f.close()
        except Exception, e:
            sys.stderr.write('Build failed: could not open output log file, %s' % e )
            sys.exit(3)
    else:
        sys.stderr.write("Error: " + message + "\n")
        
def output_info( message, log_file = None ):
    if log_file is not None:
        try:
            f = open(log_file, 'a')
            f.write("Info: " + message + "\n")
            f.close()
        except Exception, e:
            sys.stderr.write('Build failed: could not open output log file, %s' % e )
            sys.exit(3)
    else:
        print message
    
def remove_last_extension( filename ):
    filename = os.path.basename(filename)
    
    extension_start = filename.find(".")
    
    if extension_start <= -1:
        return filename
    else:
        return filename[:extension_start]

class BuildDelegate(object):
    path = None
    target = None
    prefix = None
    
    def __init__(self, target, path, prefix = None):
        self.target = target
        self.path = path
        self.prefix = prefix

class BuildRecipe(object):
    
    manifest = None
    properties = None
    imports = []
    delegates = []
    
    def __init__(self, manifest, properties, imports, delegates = []):
        self.manifest = manifest
        self.properties = properties
        self.imports = imports
        self.delegates = delegates

class Builder(object):
    
    output_file_name = None
    prefix = None #This prefix will be applied to all filenames and is used when a build script delegates to another build script
    
    def write(self, file_to_add, filename):
        pass
    
    def writestr(self, str, filename, original_file_path):
        pass
    
    def close(self):
        pass
    
    def namelist(self):
        pass
    
    def add_directory(self):
        pass
    
    def get_delegate_filename(self, filename):
        if self.prefix is None:
            return filename
        elif filename is None:
            return None
        else:
            return self.prefix + filename
    
class TarBuilder(Builder):
    builder_type = "tar"
    
    
    def __init__(self, archive_filename, gzip = False, add_extension = True):
        self.tarfile = None
        self.gzip = gzip
        
        if add_extension:
            self.output_file_name = archive_filename + ".tar"
        else:
            self.output_file_name = archive_filename
        
        self.tmp_dir = None
        
        if self.gzip:
            self.tmp_dir = tempfile.mkdtemp() #Store the location of the temporary directory so that we can destroy it
            tmp_filename = ''.join(random.choice(string.letters) for i in xrange(8))
            self.tarfile = TarFile(self.tmp_dir + os.sep + tmp_filename + ".tar", 'w')
            
            if add_extension:
                self.output_file_name = self.output_file_name + ".gz"
        else:
            self.tarfile = TarFile(self.output_file_name, 'w')
        
    def write(self, file_to_add, filename = None):
        if filename is None:
            final_filename = file_to_add
        else:
            final_filename = filename
        
        info = self.tarfile.gettarinfo(file_to_add, final_filename)
        
        # Set the file permissions
        file_attr = os.stat(original_file_path)[ST_MODE]
        info.mode = file_attr
        
        # Set the file date/times
        info.mtime = os.stat(original_file_path)[ST_MTIME]
        
        self.tarfile.addfile(info)
    
    def writestr(self, file_string, filename, original_file_path):
        
        string = StringIO.StringIO()
        string.write(file_string)
        string.seek(0)

        info = TarInfo(name=filename)
        info.size=len(string.buf)
        
        # Set the file permissions
        file_attr = os.stat(original_file_path)[ST_MODE]
        info.mode = file_attr
        
        # Set the file date/times
        info.mtime = os.stat(original_file_path)[ST_MTIME]
        
        self.tarfile.addfile(tarinfo=info, fileobj=string)
    
    def close(self):
        self.tarfile.close()
        
        #Now gzip the tarfile
        if self.gzip:
            output_f = open(self.output_file_name, "wb")
            gzip_f = gzip.GzipFile(remove_last_extension(self.output_file_name) + ".tar", 'wb', 9, output_f)
            
            tar_f = open(self.tarfile.name, "rb")
            chunksize = 8192
            
            try:
                
                bytes = tar_f.read(chunksize)
                while len(bytes) > 0:
                    gzip_f.write(bytes)
                    bytes = tar_f.read(chunksize)
                
            finally:
                
                gzip_f.close()
                tar_f.close()
                output_f.close()
                
                # Remove the temporary file
                os.remove( self.tarfile.name )
            
                # Remove the temporary directory
                if self.tmp_dir is not None:
                    os.rmdir(self.tmp_dir)
            
    def namelist(self):
        return self.tarfile.getnames()
    
    def add_directory( self, directory_name ):
        ti = TarInfo(name=directory_name)
        ti.type = DIRTYPE
        ti.mode = 493 #Decimal of octal 755
        
        self.tarfile.addfile(tarinfo=ti)
        
class TarGzipBuilder(TarBuilder):
    
    builder_type = "tar.gz"
    
    def __init__(self, archive_filename, add_extension=True):
        super(TarGzipBuilder, self).__init__(archive_filename, True, add_extension)

class SplBuilder(TarGzipBuilder):
    
    builder_type = "spl"
    
    def __init__(self, archive_filename):
        super(TarGzipBuilder, self).__init__(archive_filename + ".spl", True, False)

class ZipBuilder(Builder):
    
    zipfile = None
    builder_type = "zip"
    
    def __init__(self, archive_filename):
        self.output_file_name = archive_filename + ".zip"
        self.zipfile = ZipFile(self.output_file_name, 'w', ZIP_DEFLATED)
        
    def write(self, file_to_add, filename = None):
        if filename is None:
            final_filename = file_to_add
        else:
            final_filename = filename
        
        zi = ZipInfo(file_to_add)
        file_attr = os.stat(file_to_add)[ST_MODE]
        zi.external_attr = file_attr << 16L
        zi.compress_type = ZIP_DEFLATED
        
        self.zipfile.write(zi, final_filename)
    
    def writestr(self, file_string, filename, original_file_path):
        
        zi = ZipInfo(filename)
        file_attr = os.stat(original_file_path)[ST_MODE]
        zi.external_attr = file_attr << 16L
        zi.compress_type = ZIP_DEFLATED
        
        self.zipfile.writestr(zi, file_string)
    
    def close(self):
        self.zipfile.close()
    
    def namelist(self):
        return self.zipfile.namelist()
    
    def add_directory( self, directory_name):
        """Adding an empty directory to a zip file is awkward. This function uses the best method available."""
        
        # Directories must have a trailing slash, add if it does not have it already
        if directory_name[:-1] != "/":
            directory_name = directory_name + "/"
        
        # Create the entry
        zinfo = ZipInfo(directory_name)
        zinfo.external_attr = 0755 << 16L #See http://stackoverflow.com/questions/279945/set-permissions-on-a-compressed-file-in-python and http://www.smipple.net/snippet/IanLewis/Adding%20empty%20directory%20to%20a%20zip%20file
        self.zipfile.writestr(zinfo, "")
    
"""Below is a list of the builders that are available. Note that the first builder will be the default"""
builders = [ZipBuilder, TarBuilder, TarGzipBuilder, SplBuilder]
    
class CopyToBuilder(Builder):
    
    file_namelist = []
    copy_to_dir = None
    force_writable = True #Remove read-only permissions
    
    def __init__(self, copy_to_dir):
        self.copy_to_dir = copy_to_dir
        self.output_file_name = self.copy_to_dir
        
        # Normalize the path and add the trailing slash if necessary
        self.copy_to_dir = os.path.normpath(self.copy_to_dir) + os.sep
        
        # Make sure the output directory actually exists
        if os.path.exists(self.copy_to_dir) == False:
            raise BuildError("The directory to send the file to does not exist (" + self.copy_to_dir + ")")
        
    def get_final_filename(self, filename, filename_override = None):
        
        if filename_override is not None:
            final_filename = filename_override
        else:
            final_filename = filename
            
        return self.copy_to_dir + os.path.normpath( final_filename )
        
    def make_writable(self, filename ):
        """Make the given file writable if it exists"""
        
        if self.force_writable and os.path.exists( filename ):
            file_attr = os.stat(filename)[ST_MODE]
            
            if True or os.access(filename, os.W_OK) == False:
                os.chmod(filename, file_attr | S_IWRITE)
        
    def write(self, file_to_add, filename = None):
        final_filename = self.get_final_filename(file_to_add, filename)
        
        self.add_file_directory_if_needed(final_filename)
        
        self.make_writable(final_filename)
        
        # Copy the file contents
        shutil.copyfile(file_to_add, final_filename)
        
        # Copy over the user's permissions (note: we cannot copy over all meta-data since OS-X has a locked flag that cannot be changed in Python)
        file_attr = os.stat(file_to_add)[ST_MODE]
        os.chmod(final_filename, file_attr)
        
        self.file_namelist.append(final_filename)
    
    def writestr(self, file_string, filename, original_file_path):
        final_filename = self.get_final_filename(filename)
        
        self.make_writable(final_filename)
        self.add_file_directory_if_needed(final_filename)
        
        f = open( final_filename, 'w+')
        f.write(file_string)
        f.close()
        
        # Copy over the user's permissions (note: we cannot copy over all meta-data since OS-X has a locked flag that cannot be changed in Python)
        file_attr = os.stat(original_file_path)[ST_MODE]
        os.chmod(final_filename, file_attr)
        
        self.file_namelist.append(filename)
    
    def close(self):
        pass #Nothing to do this case
    
    def namelist(self):
        return self.file_namelist
    
    def add_file_directory_if_needed(self, filename):
        """Makes the intermediate directories necessary for the given file. This assumes the filename is included (i.e. the last entry is a file)."""
        dir = filename
        dirs = os.sep.join( os.path.normpath(dir).split(os.sep)[0:-1] )
        
        try:
            os.makedirs( dirs )
        except os.error:
            pass #The last directory already existed, ignore
    
    def add_directory(self, directory_name):
        try:
            os.makedirs( self.copy_to_dir + directory_name )
        except os.error:
            pass #The last directory already existed, ignore

def properties_file_to_dict( properties_file ):
    """Return a dictionary with the values from the given property file"""
    
    propFile = file( properties_file, "rU" )
    propDict = dict()
    
    # Process each line the file
    for propLine in propFile:
        
        # Get rid of ignorable whitespace
        propDef = propLine.strip()
        
        # Ignore this line if it is empty
        if len(propDef) == 0:
            continue
        
        # Ignore this line if it is a comment
        if propDef[0] in ( '!', '#' ):
            continue
        
        # Find the complete name/value separator character
        punctuation = [ propDef.find(c) for c in ':= ' ] + [ len(propDef) ]
        
        # Determine the first separator character
        found = min( [ pos for pos in punctuation if pos != -1 ] )
        
        # Get the name
        name = propDef[:found].rstrip()
        
        # Get the value
        value = propDef[found:].lstrip(":= ").rstrip()
        propDict[name] = value
        
    # Close the file
    propFile.close()
    
    # Return the dictionary
    return propDict

    
def load_properties(log_file=None):
    """Load the configuration from the local and default properties files"""
    
    # Load the default and local properties files and merge them (with local overriding default)
    default_props = properties_file_to_dict("default.build.properties")
    
    if os.path.exists("local.build.properties"):
        local_props = properties_file_to_dict("local.build.properties")
    
        default_props.update(local_props)
    else:
        output_info("Note: a local properties file was not loaded. Create a local.properties file if you want to override the default values (from default.properties)", log_file)
    
    return default_props

class FileInclusionPolicy:
    """Represents a description of a file or set of files that may be included in the build"""
    
    def __init__(self, file_match_re):
        self.name = None
        self.include = True
        self.file_match_re = None
        self.prefix = None
        self.suffix = None
        self.file_name = None
        self.file_transforms = []
        self.directory = None
        self.stop_after = False
        self.import_path = None
        
        self.file_match_re = file_match_re
    
    def __str__(self):
        res = ""
        
        if self.file_match_re is not None:
            res = str(self.file_match_re.pattern)
            
        if self.file_name is not None:
            res = str(self.file_name)
            
        if self.directory is not None:
            res = str(self.directory) + "(directory)"
            
        return res
    
    def matches_file_name(self, file_name ):
        
        if self.file_match_re is not None and FileInclusionPolicy.matches_all( self.file_match_re, file_name):
            return True
        else:
            return False
        
    def resulting_file_name(self, file_name, vars_array = None):
        
        result = file_name
        
        # Get the variables for substitution purposes
        m = self.file_match_re.match(file_name)
        vars_array = m.groups()
        
        # Use the file name if provided
        if self.file_name is not None:
            return self.do_substitution(self.file_name, vars_array )
        
        # Insert the prefix if provided
        if self.prefix is not None:
            result = self.prefix + result
            
        # Append the suffix if provided
        if self.suffix is not None:
            result = self.suffix + result
            
        return result
    
    def do_substitution(self, file_name, vars_array):
        
        if vars_array is not None:
            i = 0
            d = {}
            
            for v in vars_array:
                i = i + 1
                file_name = file_name.replace( "${" + str(i) + "}", v)
                file_name = file_name.replace( "$" + str(i), v)
                
        # Determine if any variables are left
        if file_name.find("$") >= 0:
            raise BuildError("Some variables did not get substituted, resulting path is: " + file_name)
        
        return file_name
        
    def resulting_file_name_if_match(self, file_name):
        if self.matches_file_name(file_name):
            m = self.file_match_re.match(file_name)
            return self.get_resulting_file_name(file_name, m.groups())
        else:
            return None
    
    @staticmethod
    def matches_all( regex, string ):
        """Returns true if the regex provided matches the entire string"""
        
        m = regex.match( string )
        
        if m is None:
            return False
        elif (m.end() - m.start()) >= len(string):
            return True
        
        return False

class BuildError(Exception):
    
    def __init__(self, value):
        self.value = value
        
    def __str__(self):
        return repr(self.value)

def load_recipe( target ):
    """Loads the file inclusion policies and the properties from the build associated with the given target"""
    
    # 1 -- Load the file
    if not os.path.exists( target + ".build.recipe" ):
        raise BuildError("Build recipe for target " + target + " does not exist")
    else:
        recipe = open( target + ".build.recipe", 'r' )
        
    # 2 -- Deserialize the file policy
    recipe_json = json.load( recipe )
    
    # 3 -- Load the properties
    if 'properties' in recipe_json:
        properties = recipe_json['properties']
    else:
        properties = {}
        
    # 4 -- Load the local properties file
    if os.path.exists(target + ".local.build.properties"):
        local_props = properties_file_to_dict(target + ".local.build.properties")
        properties.update(local_props)
    
    # 5 -- Load the file policies
    file_policies = []
    imports = []
    delegates = []
    
    for p in recipe_json['manifest']:
        
        if 'file' in p:
            # Perform variable substitution on the file name
            file_name = substitute_variables_str(p['file'], properties)
            
            # Raise an error if some of the variables were not replaced
            if file_name.find("$") > -1:
                raise BuildError("The filename contains template arguments that were not replaced with a variable (" + file_name +"); the resuling file name is invalid")
            
            policy = FileInclusionPolicy( re.compile( re.escape(file_name) ) )
        elif 'file_re' in p:
            policy = FileInclusionPolicy( re.compile(p['file_re']) )
        elif 'directory' in p:
            policy = FileInclusionPolicy( None )
            policy.directory = p['directory']
        elif 'delegate' in p:
            
            if 'path' in p:
                path = p['path']
            else:
                path = None
                
            if 'prefix' in p:
                prefix = p['prefix']
            else:
                prefix = None
                
            delegates.append( BuildDelegate(p['delegate'], path, prefix) )
            continue
        elif 'import' in p:
            # We will add the import statement later. For now, note that the policy is intended to
            # be blank (you can include a policy along with an import statement, but the user did
            # not do that in this case).
            policy = None
        else:
            raise BuildError("No file or file_re, directory or import object in the build policy")

        # If the policy includes an import, then add it
        if 'import' in p:
            # Add the import statement
            imports.append(p['import'])
            
            # If no policy is defined in the same line, then move to the next item
            if policy is None: 
                continue

        # Determine if the policy is designed to include the file
        if 'include' in p:
            policy.include = p['include']
        else:
            # By default, each policy will be assumed to include the matching files
            policy.include = True
            
        # Determine if the policy is designed to stop execution once this entry is done
        if 'stop_after' in p:
            policy.stop_after = p['stop_after']
        else:
            # By default, each we don't stop after executing this rule
            policy.stop_after = False
            
        # Add the file prefix
        if 'prefix' in p:
            policy.prefix = p['prefix']
            
        # Add the file suffix
        if 'suffix' in p:
            policy.suffix = p['suffix']
        
        # Add the file name
        if 'filename' in p:
            policy.file_name = p['filename']
            
        # Add the file_transform
        if 'file_transform' in p:
            
            # Append each transform
            if isinstance(p['file_transform'], list):
                for transform in p['file_transform']:
                    policy.file_transforms.append(transform)
            
            else:
                policy.file_transforms.append(p['file_transform'])
        
        # Add the policy
        if policy is not None:
            file_policies.append(policy)
    
    # 5 -- Return the result
    recipe = BuildRecipe(file_policies, properties, imports, delegates)
    return recipe

def perform_file_transforms( file_name, transforms, properties, verbose = True, log_file = None ):
    """Take the given file and execute the function (whose name is specified in transform) and return the results"""
    
    # Get the file contents as a string
    file_string = open(file_name).read()
    
    for t in transforms:
    
        # Get the transformation function
        transform_func = get_file_transform_macro(t)
                                    
        if verbose:
            output_info("Performing transform \"" + t + "\" on "  + file_name, log_file)
        
        # Get the resulting contents
        file_string = transform_func( file_string, properties=properties )
    
    # Return the result
    return file_string

def process_file( builder, f, manifest, props, verbose=True, log_file=None ):
     """Adds the given file to the builder per the manifest"""
     
     files_created = 0
     
     for m in manifest:
        
        # Does the manifest entry match this file?... 
        if m.file_match_re is not None and m.matches_file_name( f ):
            
            # If the manifest says to reject the file, then move on to the next file without doing anything
            if m.include == False:
                return files_created # Moving on to the next file...
            else:
                # The manifest says to include this file, let's figure out the final file name and location
                final_filename = m.resulting_file_name( f )
                final_filename = builder.get_delegate_filename(final_filename)
                
                # Do not add a file with a trailing slash as it will prevent the archive from being opened on some de-archivers
                if final_filename[-1:] in ['/', '\\']:
                    raise BuildError("Cannot add a file with a trailing slash, this will result in a corrupt archive")
                
                # Make sure the file does not already exist
                if final_filename in builder.namelist():
                    output_warning( final_filename + " is already in the build. The file will be skipped to avoid duplicates", log_file )
                    continue

                # Print a message if the verbose setting is enabled 
                if verbose:
                    output_info("Adding file: " + final_filename, log_file)
                
                # Execute the transformations (if defined)
                if m.file_transforms is not None:
                    results = perform_file_transforms(f, m.file_transforms, props, verbose)
                    
                    builder.writestr(results, final_filename, f)
                    
                else:
                    # Add the file with the given filename
                    if ends_with(f, ".template"): #This is a template file, so perform the substitution on it and add it to the build
                        substitute_and_add_file(builder, f, final_filename, props)
                    else:
                        builder.write(f, final_filename)
                
                # Increment the number of files written
                files_created = files_created + 1
                
            if m.stop_after:
                return files_created #Move on to the next file
            
     return files_created

def process_files( builder, directory, manifest, props, verbose=True, log_file=None ):
    """Adds the files in the given directory to the builder per the manifest"""
    
    # Get a list of the file in the directory
    if directory is not None and os.path.isfile(directory):
        return process_file( builder, directory, manifest, props, verbose=True, log_file=None )
    if directory is not None:
        list = os.listdir(directory)
    else:
        list = os.listdir(".") # If the directory was not provided, then assume the local directory
        directory = ""
    
    # Track the number of files written
    files_created = 0      
    
    # Add each file to the directory
    for entity in list:
        
        # Get the complete path
        if directory is None:
            f = entity
        else:
            f = os.path.join(directory, entity)
        
        # Strip the forward dot-slash indicating the current directory (which is implied)
        if len(f) > 2 and f[0:2] == "./":
            f = f[2:]
        
        # If the entity is a file, then add the file
        if os.path.isfile(f):
            files_created = files_created + process_file( builder, f, manifest, props, verbose, log_file)
        
        else:
            # If the entity is a directory, then recurse
            files_created_dir = process_files(builder, f, manifest, props, verbose, log_file)
            files_created = files_created + files_created_dir
            
            # If no files were created for the given directory, then create an empty directory
            if files_created_dir == 0:
                
                # See if the manifest says it should be included
                for m in manifest:
                    
                    # Does the manifest entry match this file?...
                    if m.matches_file_name( f ):
                        
                        # If the manifest says to reject the file, then move on to the next file without doing anything
                        if m.include == False:
                            break # Moving on to the next file...
                        else:
                            # The manifest says to include this file, let's figure out the final file name and location
                            final_filename = m.resulting_file_name( f )
                            final_filename = builder.get_delegate_filename(final_filename)
                            
                            # Make sure the file does not already exist
                            if final_filename in builder.namelist():
                                continue
                            
                            # Print a message if the verbose setting is enabled 
                            if verbose:
                                output_info("Adding empty directory: " + final_filename, log_file)
                            
                            # Add the file with the given filename
                            builder.add_directory( final_filename )
                    
                            # Increment the number of files written
                            files_created = files_created + 1
            
    return files_created

def ends_with(filename, ending):
    """Determines if the filename ends with the given string"""
    
    if filename[-(len(ending)):] == ending:
        return True
    else:
        return False
    
def strip_last_extension( filename ):
    """Removes the last file extension"""
    
    return os.path.splitext( filename )[0]
    
def make_filename( target, properties ):
    """Create a file name for the current build target from the version information"""
    
    if 'package.output.filename' in properties:
        filename_template = properties['package.output.filename']
        
        return substitute_variables_str( filename_template, properties)
    
    else:
        name = target
        
        if 'version.major' in properties:
            name = name + "-" + str(properties['version.major'])
            
            if 'version.minor' in properties:
                name = name + "." + str(properties['version.minor'])
            
                if 'version.revision' in properties:
                    name = name + "." + str(properties['version.revision'])
                    
        if 'version.status' in properties:
            name = name + "-" + str(properties['version.status'])
            
        if 'version.build' in properties:
            name = name + "-" + str(properties['version.build'])  
        
        return name
    
def do_build(recipe, builder, verbose=False, log_file=None, close_when_done=True):
    """Create the application archive (for installers)"""
    
    # 1 -- Add any directories requested
    for m in recipe.manifest:
        if m.directory is not None:
            
            # Print a message if the verbose setting is enabled 
            if verbose:
                output_info("Adding directory: " + m.directory, log_file)
            
            builder.add_directory( m.directory )
    
    try:
        # 2 -- Add the apps directories
        files_created = process_files(builder, ".", recipe.manifest, recipe.properties, verbose, log_file )
        
        # 3 -- Process the imports
        for i in recipe.imports:
            
            # Import names can be substituted. Derive the final filename:
            import_substituted = substitute_variables_str(i, recipe.properties)
            
            # Print a message noting that an import is being performed
            if verbose:
                if i != import_substituted:
                    output_info("Importing from " + i + " (" + import_substituted + ")", log_file)
                else:
                    output_info("Importing from " + i, log_file)
            
            # Make sure the import exists
            if os.path.exists(import_substituted) == False:
                raise BuildError("Import does not exist: " + str(import_substituted) )
            elif os.path.isfile(import_substituted):
                created_by_import = process_files(builder, import_substituted, recipe.manifest, recipe.properties, verbose, log_file )
            else:
                # Change to the path and run the rules again
                prev_cwd = os.getcwd()
                os.chdir( import_substituted )
                created_by_import = process_files(builder, ".", recipe.manifest, recipe.properties, verbose, log_file )
                os.chdir( prev_cwd )
                
            # Log an error if no files were imported by the rule
            if created_by_import == 0:
                raise BuildError("No files matched by the import from " + str(i) )
            
            files_created = files_created + created_by_import
        
        # 4 -- Print a message noting that the archive was created (or not)
        if files_created == 0:
            raise BuildError("No files matched any of the rules")
    
        # 5 -- Execute the delegates
        current_path = os.getcwd()
        current_prefix = builder.prefix
        
        for delegate in recipe.delegates:
            
            # Note the delegate is about to run
            output_info("Executing build delegate: '" + delegate.target + "' in path \"" + delegate.path + "\"", log_file)
            
            # Change to the path defined by the delegate
            if delegate.path is not None:
                os.chdir(delegate.path)
            else:
                os.chdir(current_path)
            
            # Change to the path defined by the delegate
            if delegate.prefix is not None:
                builder.prefix = delegate.prefix
            else:
                builder.prefix = current_prefix
            
            # Load the recipe
            delegate_recipe = load_recipe(delegate.target)
            
            # Run the build
            do_build(delegate_recipe, builder, verbose, log_file, False)
        
        # Return to the previous current working directory
        os.chdir(current_path)
    
    finally:
        if builder is not None and close_when_done:
            builder.close()
            output_info("Build successfully completed: " + builder.output_file_name, log_file)
    
    
def substitute_and_add_file( builder, original_file, filename, properties ):
    """Performs substitution on the contents of the file and adds the file to the build"""
    
    file_str = substitute_variables(original_file, properties)
    
    builder.writestr(file_str, filename, original_file)
    
def substitute_variables_str( template_string, properties, do_legacy_substitute = False ):
    """Takes a string and performs variable substitution to replace variables with the value of the same name in the provided properties dictionary"""
    
    for k in properties:
        template_string = template_string.replace("${" + str(k) + "}", str(properties[k]))
        
        if do_legacy_substitute:
            template_string = template_string.replace("$" + str(k), str(properties[k]))
    
    return template_string
    
def substitute_variables( input_file_name, properties ):
    """Takes an input and performs variable substitution to replace variables with the value of the same name in the provided properties dictionary"""
    
    output = ""
    i = None
    
    try:
        i = open(input_file_name)
    
        for line in i:
            for k in properties:
                line = line.replace("${" + str(k) + "}", str(properties[k]))
        
            output = output + line
        
    finally:
        if i is not None:
            i.close()
            
    return output

def get_perforce_info( path, p4_path ):
    """Gets information about the perforce depot using the p4 CLI client for the given path"""
    
    # Remove the trailing slash, it is not allowed by perforce
    if path[-1:] == '/' or path[-1:] == "\\":
        path = path[0:-1]
    
    fP4 = os.popen(p4_path + ' -G ' + (' files %s/...' % (path) ), 'rb')
    
    # Stop if p4 could not be executed
    if fP4 is None:
        raise BuildError("p4 could not be executed; unable to get the changeset number")   
 
    max_changeset = 0
    max_changetime = 0

    while 1:
        try:
            d = marshal.load(fP4)
            
            if 'change' in d and int(d['change']) > max_changeset:
                max_changeset = int(d['change'])
                max_changetime = int(d['time'])
                
        except EOFError:
            break
        
    # Throw an exception if we could not get a changeset number
    if max_changeset == 0:
        raise BuildError("Unable to get the latest p4 changelist")

    return max_changeset, max_changetime

def build( target, verbose=True, sync_dir = False, build_type = None, log_file = None ):
    """Builds the given target (if the file exists)"""
    
    output_info("Building target \"%s\"" % (target), log_file)
    
    recipe = load_recipe( target )
    
    # Get the perforce information (if available)
    if 'perforce.root' in recipe.properties and 'perforce.cli_client' in recipe.properties:
        perforce_changeset, perforce_time = get_perforce_info( recipe.properties['perforce.root'], recipe.properties['perforce.cli_client'] )
        
        recipe.properties['version.build'] = perforce_changeset
    
    # Determine if an archive should be created or if a directory should be synchronized
    if sync_dir:
        
        # Make sure splunk is defined
        if 'splunkhome' not in recipe.properties:
            raise BuildError("splunkhome is not defined, define it in your build.properties file")
        
        builder = CopyToBuilder( recipe.properties['splunkhome'] )
    else:
        
        output_dir = recipe.properties['package.output.directory']
        
        # Add the separator to the file name if it does not already exist
        if len(output_dir) > 0 and output_dir[-1] != os.sep:
            output_dir = output_dir + os.sep
            
        # Create the output file name
        output_file_name = make_filename(target, recipe.properties)
        output_file = output_dir + output_file_name
        
        # Determine which builder to use
        builder = None
        
        # If the build type was not supplied then determine if the build type is in the properties
        if build_type is None and 'build.type' in recipe.properties:
            build_type = recipe.properties['build.type']            

        # Find the actual build class that will perform the build
        if build_type is not None:
            for b in builders:
                if b.builder_type == build_type:
                    builder = b( output_file )
                    break
            
            # Uh oh, could not find the appropriate builder
            if builder is None:
                raise BuildError("No builder found for " + recipe.properties['build.type'])
            
        else:
            # Use the default builder since none was specified
            builder = builders[0]
            builder = b( output_file )
    
    # Start the actual build
    do_build( recipe, builder, verbose, log_file )

def build_all( verbose=True, sync_dir = False, build_type = None, log_file = None ):
    """Build all targets found in the local directory"""
    
    list = os.listdir(".")
    
    # Find each build target
    for entity in list:
        
        if entity[-12:] == "build.recipe": 
            target = entity[0:entity.find("build.recipe")-1]
            
            build( target, verbose, sync_dir, build_type, log_file )

def main():
    # Parse the arguments
    verbose = False
    target = None
    sync_dir = False
    build_type = None
    log_file = None  # Output will be sent to this log file (instead of to standard out)
    
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hvt:sb:l:", ["help", "verbose", "target=", "syncdir", "buildtype=", "logfile"])
    except getopt.GetoptError:        
        usage()                   
        sys.exit(2)
        
    # Process the arguments
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()               
        elif opt in ("-v", "--verbose"):
            verbose = True
        elif opt in ("-t", "--target"):
            target = arg
        elif opt in ("-s", "--syncdir"):
            sync_dir = True
        elif opt in ("-b", "--buildtype"):
            build_type = arg
        elif opt in ("-l", "--logfile"):
            log_file = os.path.abspath(arg)
    
    # Clear the existing file
    if log_file is not None:
        try:
            f = open(log_file, 'w')
            f.write("")
            f.close()
        except Exception, e:
            output_error( 'Build failed: could not open output log file, %s' % e, log_file )
            sys.exit(3)
    
    # Process the specific target if supplied
    try:
        if target is None:
            build_all(verbose, sync_dir, build_type, log_file)
        else:
            build(target, verbose, sync_dir, build_type, log_file)
    except BuildError, e:
        output_error( 'Build failed: %s' % e, log_file )

# If the script is being called directly, then initiate the main function
if __name__ == "__main__":
    main()
