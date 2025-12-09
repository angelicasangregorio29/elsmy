#!/bin/bash
# Test script for ELSMY /upload endpoint
# Usage: bash test-upload.sh <file-to-upload>
# Example: bash test-upload.sh test-audio.webm

SERVER_URL="http://localhost:3000"
FILE="${1:-test.wav}"

if [ ! -f "$FILE" ]; then
  echo "Error: File '$FILE' not found."
  echo "Usage: bash test-upload.sh <file-to-upload>"
  exit 1
fi

echo "Testing upload to $SERVER_URL/upload..."
echo "File: $FILE"
echo ""

RESPONSE=$(curl -X POST \
  -F "file=@$FILE" \
  "$SERVER_URL/upload" \
  -s \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response body:"
echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✓ Upload successful!"
  if echo "$BODY" | grep -q '"url"'; then
    URL=$(echo "$BODY" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    echo "  File URL: $URL"
    echo "  Access at: $SERVER_URL$URL"
  fi
else
  echo "✗ Upload failed with status $HTTP_CODE"
  exit 1
fi
