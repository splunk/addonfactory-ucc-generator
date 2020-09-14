#!/bin/bash

p4 edit *.rng
java -jar trang.jar -I rnc -O rng all.rnc all.rng
