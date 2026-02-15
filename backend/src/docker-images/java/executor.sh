#!/usr/bin/env sh
set -e

SOURCE_FILE="/app/temp/Solution.java"

if [ ! -f "$SOURCE_FILE" ]; then
  echo "Error reading solution file" >&2
  exit 1
fi

mkdir -p /app/temp/build

# Compile
javac -d /app/temp/build "$SOURCE_FILE"

# Run with stdin passthrough
java -cp /app/temp/build Solution
