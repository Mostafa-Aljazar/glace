#!/bin/bash
# Direct curl test of the OTP send/verify endpoints, bypassing the browser/UI entirely.
# Usage:
#   ./otp-curl.sh send 0592106078
#   ./otp-curl.sh verify 0592106078 123456
set -e

API_BASE="https://back.glaceelameer.com/api"
ACTION="$1"
PHONE="$2"
CODE="$3"

if [ "$ACTION" = "send" ]; then
  echo "POST $API_BASE/auth/otp/send  {phone: \"$PHONE\"}"
  curl -s -i -X POST "$API_BASE/auth/otp/send" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"phone\":\"$PHONE\"}"
elif [ "$ACTION" = "verify" ]; then
  echo "POST $API_BASE/auth/otp/verify  {phone: \"$PHONE\", code: \"$CODE\"}"
  curl -s -i -X POST "$API_BASE/auth/otp/verify" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "{\"phone\":\"$PHONE\",\"code\":\"$CODE\"}"
else
  echo "Usage: $0 send <phone>"
  echo "       $0 verify <phone> <code>"
  exit 1
fi
echo
