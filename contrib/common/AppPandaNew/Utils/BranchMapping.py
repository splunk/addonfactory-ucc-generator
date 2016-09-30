import urllib2
from bs4 import BeautifulSoup
from decimal import Decimal

class BranchMapping:
    '''
    The class that provides a mapping for version and 
    branch of Splunk.
    '''
    def __init__(self, logger, version):
        self.logger             = logger

        self.pseudo_panda_wrapper = {'next' : '{current}',
                                     'cloud-tos' : '{cloud-tos}'}
        self.version = version

    def get_pseudo_panda_wrapper(self):
        '''
        Return the dictionary that contains the 
        mapping for version and branches.
        '''
        self.logger.info("CLI : Building Pseudo panda wrapper.")

        if self.version == 'next':
            return self.pseudo_panda_wrapper

        elif self.version == 'current_ga':
            self.current_ga()
            return self.pseudo_panda_wrapper

        elif self.version == 'previous_ga':
            self.previous_ga()
            return self.pseudo_panda_wrapper

        elif self.version == 'preprevious_ga':
            self.preprevious_ga()
            return self.pseudo_panda_wrapper

        elif self.version == 'current_nightly':
            self.current_nightly()
            return self.pseudo_panda_wrapper

        elif self.version == 'previous_nightly':
            self.previous_nightly()
            return self.pseudo_panda_wrapper

        elif self.version == 'preprevious_nightly':
            self.preprevious_nightly()
            return self.pseudo_panda_wrapper

        else:
            pass

        self.logger.info("The version given is %s and the Mapping is %s", self.version, self.pseudo_panda_wrapper)


    def get_major_splunk_version(self):
        '''
        From http://releases.splunk.com/released_builds parse the 
        directories and find the maximum major version.
        
        For example: if we have 6.2.1, 5.2.6 we return 6.
        '''
        major_versions = []
        releases_url    = urllib2.urlopen("http://releases.splunk.com/released_builds")
        releases_html   = releases_url.read()
        releases_soup   = BeautifulSoup(releases_html, 'html.parser')
        
        for link in releases_soup.find_all('a'):
            major_versions.append(link.text)
        
        major_versions = [x.strip('//') for x in major_versions]
        major_versions = {int(str(a)[0])  for a in major_versions if str(a)[0].isdigit()}
        
        return max(list(major_versions))
    
    def get_minor_splunk_version(self, major_version):
        '''
        From http://releases.splunk.com/released_builds parse the 
        directories and find the maximum major version.
        
        For example: if we have 6.2.1, 6.5.6 we return 5.
        '''
        minor_versions = []
        releases_url    = urllib2.urlopen("http://releases.splunk.com/released_builds")
        releases_html   = releases_url.read()
        releases_soup   = BeautifulSoup(releases_html, 'html.parser')
        
        for link in releases_soup.find_all('a'):
            minor_versions.append(link.text)
        
        minor_versions = [x.strip('//') for x in minor_versions]
        minor_versions = {int(str(a)[2])  for a in minor_versions if (len(str(a))>2 and str(a)[2].isdigit() and str(a)[0] == str(major_version))}
        
        return max(list(minor_versions))
    
    def get_splunk_version(self, major_version, minor_version):
        '''
        From http://releases.splunk.com/released_builds parse the 
        directories and find the maximum major version.
        
        For example: if we have 6.2.1, 6.2.4 we return 4.
        '''
        version = []
        releases_url    = urllib2.urlopen("http://releases.splunk.com/released_builds")
        releases_html   = releases_url.read()
        releases_soup   = BeautifulSoup(releases_html, 'html.parser')
        
        for link in releases_soup.find_all('a'):
            version.append(link.text)
        
        version = [x.strip('//') for x in version]
        version = {int(str(a)[4])  for a in version if (len(str(a))>3 and str(a)[0] == str(major_version) and str(a)[2] == str(minor_version))}
        
        return max(list(version))
    
    def current_ga(self):
        '''
        Return mapping to current_ga
        1. Current_ga is the maximum of the individuals of
         major_version
         minor_version
         revision
         We get these from the above defined methods.
        '''
        splunk_major_version = self.get_major_splunk_version()
        splunk_minor_version = self.get_minor_splunk_version(splunk_major_version)
        version_number       = self.get_splunk_version(splunk_major_version, splunk_minor_version)
        
        self.current_ga_build    = str(splunk_major_version) + "." + str(splunk_minor_version) + "." + str(version_number)
        self.pseudo_panda_wrapper['current_ga'] = self.current_ga_build
    
    def previous_ga(self):
        '''
        Return mapping to previous_ga
        Previous ga:
        First find the major and the minor versions for previous_ga:
        To find these get the current_ga version: Eg 6.2.3
        Now strip off the revision number:Eg : 6.2
        Now subtract 0.1 from this. Rg: 6.1
        Now use the major and minor versions from above to find the maximum revision available 
        in the directories: 6.1.7
        The final result is 6.1.7
        '''
        self.current_ga()
        current_ga = self.pseudo_panda_wrapper['current_ga']
        current_ga_build = str(current_ga[:3])
        
        splunk_major_minor = Decimal(current_ga_build) - Decimal('0.1')
        
        version_number  = self.get_splunk_version(str(splunk_major_minor)[0], str(splunk_major_minor)[2])
        
        self.previous_ga_build = str(splunk_major_minor) + "." + str(version_number)
        self.pseudo_panda_wrapper['previous_ga'] = self.previous_ga_build
    
    def preprevious_ga(self):
        '''
        Return mapping to pre-previous_ga
        Pre-Previous ga:
        First find the major and the minor versions for pre-previous_ga:
        To find these get the previous_ga version: Eg 6.1.7
        Now strip off the revision number:Eg : 6.1
        Now subtract 0.1 from this. Rg: 6.0
        Now use the major and minor versions from above to find the maximum revision available 
        in the directories: 6.0.8
        The final result is 6.0.8
        '''
        self.previous_ga()
        previous_ga = self.pseudo_panda_wrapper['previous_ga']
        previous_ga_build = str(previous_ga[:3])
        
        splunk_major_minor = Decimal(previous_ga_build) - Decimal('0.1')
        
        version_number  = self.get_splunk_version(str(splunk_major_minor)[0], str(splunk_major_minor)[2])
        
        self.preprevious_ga_build = str(splunk_major_minor) + "." + str(version_number)
        self.pseudo_panda_wrapper['preprevious_ga'] = self.preprevious_ga_build
    
    def current_nightly(self):
        
        all_builds  = self.get_nightly_builds_list()

        self.current_ga()
        current_ga      = self.pseudo_panda_wrapper['current_ga']
        current_nightly = str(int(''.join(current_ga.split('.'))) + 1)
        current_nightly = current_nightly[0] + "." + current_nightly[1] + "." + current_nightly[2]

        build_name1 = self.find_branch_names(all_builds, current_nightly)
        
        current_ga1      = self.pseudo_panda_wrapper['current_ga']
        current_nightly1 = str(int(''.join(current_ga1.split('.'))) + 2)
        current_nightly1 = current_nightly1[0] + "." + current_nightly1[1] + "." + current_nightly1[2]

        build_name2 = self.find_branch_names(all_builds, current_nightly1) + build_name1

        build_name2 = list(set(build_name2))

        for current_build in build_name2:
            current_build_name = (str(current_build).split("_"))[0]
            if current_build_name == current_nightly or current_build_name == current_nightly1:
                if current_build_name == current_nightly:
                    self.pseudo_panda_wrapper[current_nightly] = current_nightly
                elif current_build_name == current_nightly1:
                    self.pseudo_panda_wrapper[current_nightly1] = current_nightly1  
            else:
                self.pseudo_panda_wrapper['current_nightly'] = '{' + current_build_name + '}'

    def previous_nightly(self):

        all_builds  = self.get_nightly_builds_list()

        self.previous_ga()
        previous_ga      = self.pseudo_panda_wrapper['previous_ga']
        previous_nightly = str(int(''.join(previous_ga.split('.'))) + 1)
        previous_nightly = previous_nightly[0] + "." + previous_nightly[1] + "." + previous_nightly[2]
        
        build_name = self.find_branch_name(all_builds, previous_nightly)
        self.pseudo_panda_wrapper['previous_nightly'] = '{' + (str(build_name).split("_"))[0] + '}'

    def preprevious_nightly(self):

        all_builds  = self.get_nightly_builds_list()

        self.preprevious_ga()
        preprevious_ga      = self.pseudo_panda_wrapper['preprevious_ga']

        preprevious_nightly = str(int(preprevious_ga[4]) + 1)    
        preprevious_nightly = preprevious_ga[0:4] + preprevious_nightly

        build_name = self.find_branch_name(all_builds, preprevious_nightly)
        self.pseudo_panda_wrapper['preprevious_nightly'] = '{' + (str(build_name).split("_"))[0] + '}'
    
    def get_nightly_builds_list(self):

        all_builds  = []
        build_url   = urllib2.urlopen("http://releases.splunk.com/dl")
        builds_html   = build_url.read()
        builds_soup   = BeautifulSoup(builds_html, 'html.parser')
        ignore_builds = ['bugfix','current', 'cloud','datamodel', 'hunk', 'license', 'manual', 'mobile', 'scrum']

        ignore = False

        for link in builds_soup.find_all('a'):
            if not link.text[0].isdigit():
                for ignore_link in ignore_builds:
                        if link.text.startswith(ignore_link):
                            ignore = True
                if not ignore:
                    all_builds.append(link.text)

            ignore = False

        return all_builds

    def find_branch_name(self, all_builds, nightly_build):
        
        for build in all_builds:
            try:
                build_url   = urllib2.urlopen("http://releases.splunk.com/dl/" + build)
                builds_html   = build_url.read()
                builds_soup   = BeautifulSoup(builds_html, 'html.parser')
            
                for link in builds_soup.find_all('a'):
                    if link.text.find(nightly_build) != -1:
                        return build
            except:
                continue
            
    def find_branch_names(self, all_builds, nightly_build):
        result = []
        for build in all_builds:

            try:
                if build.find("SplunkLight_builds")!=-1:
                    continue
                build_url   = urllib2.urlopen("http://releases.splunk.com/dl/" + build)
                builds_html   = build_url.read()
                builds_soup   = BeautifulSoup(builds_html, 'html.parser')
            
                for link in builds_soup.find_all('a'):
                    if link.text.find(nightly_build) != -1:
                        result.append(build)
                        break
            except:
                continue
        return result