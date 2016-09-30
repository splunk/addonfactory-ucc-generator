#!/usr/bin/python

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name='apppanda',
    version='3.0.0',
    author='Sasi Srinivas Vakkalanka',
    author_email='svakkalanka@splunk.com',
    install_requires=['requests', 'beautifulsoup4'],
    description=(
        'Multipurpose Tool'),
    packages=['AppUninstaller', 'AppInstaller', 'SplunkInstaller', 'Utils', 'osot', 'Genesis'],
    scripts=['appPandaCLI.py'],
)

