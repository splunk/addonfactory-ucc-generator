import setuptools

setuptools.setup(
    name='splunk-neptune',
    version='0.1.0.0',
    description='A useful tool to generate testing data automatically on SAAS platforms.',
    packages=setuptools.find_packages(),
    # package_data={'': ['configs/config.yaml', 'test.lic', 'examples/create_aws_stack.sh']},
    # test_suite='tests',
    author='Aaron Zhang, Jeffrey Cai, Clara Chen',
    author_email='azhang@splunk.com, jcai@splunk.com, dchen@splunk.com',
    install_requires=['boto3', 'boto', 'boxsdk', 'okta', 'google-api-python-client', 'azure', 'servicenow'],
    provides=['neptune'],
    url='https://git.splunk.com/projects/SOLN/repos/common/browse/neptune/clouddatamakr',
    entry_points={
        'console_scripts': [
            'neptune = neptune._neptune:main',
        ]
    }
)
