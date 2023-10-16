#!/bin/bash
cd /home/ec2-user/gunfight-ui
yarn install
yarn run build
npm install -g pm2
