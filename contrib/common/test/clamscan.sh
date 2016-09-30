#!/bin/sh

pushd /usr/local/share/clamav
echo "Updating AntiVirus databases..."
rm -rf *
wget http://db.local.clamav.net/main.cvd
wget http://db.local.clamav.net/daily.cvd
wget http://db.local.clamav.net/bytecode.cvd
wget http://db.local.clamav.net/safebrowsing.cvd
echo "AntiVirus databases have been updated."
popd

echo "Running AntiVirus scan on "$1
/usr/local/bin/clamscan $1
