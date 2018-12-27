from setuptools import setup, find_packages

setup(
    name='uccrestbuilder',
    description='The REST builder tool for Universal Configuration Console',
    version='{version}',
    author='Splunk, Inc.',
    author_email='Shanghai-TA-dev@splunk.com',
    license='http://www.apache.org/licenses/LICENSE-2.0',
    url='https://git.splunk.com/scm/soln/ta-ui-framework.git',
    packages=find_packages(exclude=['tests', 'examples']),
    package_data={'': ['LICENSE']},
    install_requires=[
        "solnlib>=1.0.17-dev",
        "splunktaucclib>=3.0.0-develop",
        "splunk-sdk>=1.6.0"
    ],
    classifiers=[
        'Programming Language :: Python',
        'Development Status :: 5 - Production/Stable',
        'Environment :: Other Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: Apache Software License',
        'Operating System :: OS Independent',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'Topic :: Software Development :: Libraries :: Application Frameworks']
)
