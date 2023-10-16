#!/bin/bash
cd /home/ec2-user/gunfight-ui
pm2 stop "gunfight-ui"
pm2 delete "gunfight-ui"
pm2 start npm --name "gunfight-ui" -- start
pm2 startup
pm2 save
pm2 restart all
