#!/usr/bin/env bash
# Updates the Lightsail firewall so SSH (port 22) is allowed only from your
# current public IP. Ports 80 and 443 stay open. Asks for confirmation first.
set -euo pipefail

PROFILE="vyntics-lightsail"
REGION="us-east-1"
INSTANCE="vyntics-api"

MYIP="$(curl -s https://checkip.amazonaws.com | tr -d '[:space:]')"
echo "Your current public IP is $MYIP"
read -r -p "Allow SSH only from $MYIP/32? Type yes to continue: " answer
[ "$answer" = "yes" ] || { echo "Cancelled."; exit 1; }

aws lightsail put-instance-public-ports --profile "$PROFILE" --region "$REGION" \
  --instance-name "$INSTANCE" \
  --port-infos "fromPort=22,toPort=22,protocol=tcp,cidrs=$MYIP/32" \
               "fromPort=80,toPort=80,protocol=tcp" \
               "fromPort=443,toPort=443,protocol=tcp" \
  --query 'operation.status' --output text
