try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup
import sys

VERSION = '0.3.13'

setup(name='artifactory-tool',
        version=VERSION,
        author='Splunk, Inc.',
        # Release Engineering team
        author_email='KChaseStaff@splunk.com',
        url='https://git.splunk.com/scm/soln/common.git',
        description='Splunk Apps specific library for working with Artifactory.',
        packages=['artifactory_tool'],
        zip_safe=False,
        classifiers = [
            "Programming Language :: Python",
            "Development Status :: 1 - Alpha",
            "Environment :: Other Environment",
            "Intended Audience :: Developers",
            "Operating System :: OS Independent",
            "Topic :: Software Development :: Libraries :: Python Modules",
            "Topic :: Software Development :: Libraries :: Application Frameworks",
        ],
)
