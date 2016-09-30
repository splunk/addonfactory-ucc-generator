#!/usr/bin/env python

import os.path as op
from setuptools import setup

version = "1.0.6"

setup(
    name='elixir-datahub',
    description='Used collect bamboo build and test plan data, and then commit to splunk',
    version=version,
    author='Eric Guo',
    author_email='eguo@splunk.com',
    packages=['datahub'],
    scripts=['elixir_datahub.py'],
    install_requires=['pytz', 'xmltodict>=0.10.1', 'requests>=2.10.0', 'beautifulsoup4>=4.4.1', 'walkdir>=0.4.1', 'psutil>=4.1.0'],
    url="ssh://git@git.splunk.com:7999/soln/common.git",
    classifiers=[
        'Programming Language :: Python',
        'Development Status :: 1 - Alpha',
        'Environment :: Other Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: Apache Software License',
        'Operating System :: OS Independent',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: Software Development :: Libraries :: Application Frameworks'
    ]
)
