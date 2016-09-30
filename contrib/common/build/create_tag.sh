#!/bin/bash

WORK_DIR=$(cd $(dirname $0)/../../../; pwd)

echo $WORK_DIR
echo "execute git pull"
git checkout develop
git pull

echo "switch to release branch $1"
git checkout $1
git pull
version=`cat build.json | jq -r ".version"`

git checkout master
git pull
git merge $1 --no-ff
git push

git tag -a $version -m "create tag $version"
git push --tags

git checkout develop
git merge $version --no-ff
git push

