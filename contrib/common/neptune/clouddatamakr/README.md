# Neptune (CloudDataMakr) - Cloud Data Simulator/Ingestor

Neptune is a useful tool to generate testing data automatically on SAAS platforms. It is easy to use, flexible and scalable.

## Background and Challenges
1. Cloud TA need to fetch the data via API provided by Cloud Service 
2. Generate real data with enough coverage in Cloud is expensive
3. Eventgen data doesn’t fit for TA with modular input as it ingests data directly to Splunk
4. Searching and creating test data takes up to 30% time of testing cycle


## Why Neptune

1. Rich production data in short time, 50% faster than manual
2. More coverage by profiling and randomization
3. Test modular input from end-to-end
4. Quickly create large volume data for performance and longevity testing

## What is this tool exactly able to do?
* Flexible data generation on SAAS platforms
* Safe cleanup after generating
* Easy extension to new SAAS platforms

## Design Diagram
#### High level design
![Performance sizing process](https://confluence.splunk.com/download/attachments/35333813/Slide3.jpg?version=1&modificationDate=1447342430000&api=v2)

![Performance sizing process](https://confluence.splunk.com/download/attachments/35333813/Slide4.jpg?version=1&modificationDate=1447342430000&api=v2)

## Supported TA
* AWS: we support 7/10 inputs. billing, cloudtrail, cloudwatch, cloudwatchlogs, config, kinesis, s3.
* Box: support 3/4 inputs. folder, file, group, and the create action will bring events.
* GCP: support 3/3 inputs. monitoring, pubsub, storage. 
* Microsoft cloud: blob, table.
* Okta: group, user.
* ServiceNow: all the tables, including incident, ticket, task, problem and so on.


## Installation
* TODO

## Usage
### 1. Get Started
After all the installations completed, the tool is ready to use. Here introduce the basic usage and work flow of Clouddatamakr.

Take the billing feature of AWS as example. In terminal, type the following command:

* python clouddatamakr.py -p aws -s billing

The tool will get the config files from configs/aws.conf, and pass the properties into the billing generator. In the config file, some important properties are defined such as aws key_id and secret_key.

Then the generator will upload the corresponding data in aws/samples to the AWS server. If generation completed, there will be message as follows:

* Data ingestion done

Then login AWS S3, and you will find the data has been generated.

### 2. Config file
For each run, the application needs to read a config file. We have already supplied the templates for all the services and projects. All the config files are under folder named "configs". The file names are {project_name}.conf. Let's pick project AWS as an example. Obviously we can open configs/aws.conf and check the content.

Basically this is a standard file which can be analyzed by Python class ConfigParser(Details referred to ConfigParser). Here we explain more about the meaning of each section.

#### [general]

* This is the general section, the keys and values will be used for all the services followed. We usually leave some common  information here(such as the username and password needed by this project).
 
#### [logging]

* Here we defined the logging configuration. "level" means the logging level. "filename" is usually defined as {project_name}gen.log

#### [{service_name}]

* Under each section named by {service_name}, listed the configs needed by this service. For example, under [cloudtrail] we supplied region(which region the cloudtrail service is on), queue(the SQS queue name), event_number(how many events will be uploaded) and so on.
* It is worth to note that these configs will be merged with those defined in [general], and then all the configs will be sent to construct the corresponding Python class

### 3. CLI format
#### The structure of Neptune:

* python clouddatamakr.py [options]

#### option:

| option | description |
|:--------------:|:------------|
| -p, --product* |        configure the product name, eg. aws, okta, mscloud|
| -s, --service* |      configure the service name of the product, eg. billing, S3 | 
| -c, --config   |        configure the path of conf file of the product, the path will automatically generated if it is not provided | 
| -C, --cleanup  |          configure whether Neptune clean up the generated data before exit |
#### restargs:
You can add extra arguments to change the config flexiblly. Let's see this example:

* python clouddatamakr.py -p aws -s s3 s3_bucket another-test-bucket

Here we create the s3 file in the bucket named "another-test-bucket". This is the same to change the corresponding value under configs/aws.conf/[s3]



## Limitations & Notice

