#!/bin/sh

if [ $# -eq 0 ]
then
    echo
    echo '############################################################'
    echo '# Usage   : submodule_updater.sh <repo_folders>            #'
    echo '# Example : submodule_updater.sh ../../ta-*                #'
    echo '#           submodule_updater.sh ../../ta-box              #'
    echo '#           submodule_updater.sh ../../ta-box ../../ta-jmx #'
    echo '############################################################'
    echo
    exit
fi

curr_path=`pwd`

echo
for var in "$@"
do
    echo "$var"
done
echo

read -p "> Do you wish to update common/contrib in the above folders? [Y/N] " yn
if [ $yn != "Y" -a $yn != "y" ]; then
    exit
fi

echo "> Yeah, I'll get right on it."
echo

for directory in "$@"
do
    if test -d $directory
    then
        echo '> Updating ' $directory
        cd $directory
        echo '> Checkout develop branch and pull from remove'
        git checkout develop
        git pull >/dev/null
        echo
        if test -d contrib/common
        then
            echo '> Get latest contrib/common'
            cd contrib/common 
            git checkout master
            git pull >/dev/null
            cd ../..
            git add contrib/common && git commit -m "Update submodule contrib/common."
        fi
        
        current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')
        echo
        echo '> Pushing the changes' $current_branch ' ====3===3===3'
        if [ $current_branch != "master" ]
        then
            git push
        else
            echo '> Pushing to ' $current_branch 'Is this really necessary?'
        fi
        
        cd $curr_path
        echo
        echo '> Updating' $directory 'complete!'
        echo
    else
        echo '>' $directory 'is not a valid path, please check again ...'
        echo
    fi
done
