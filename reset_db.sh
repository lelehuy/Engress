#!/bin/bash

# Engress Database Reset Script
# This will remove all your data, including logs, vocabulary, and test date.

DATA_PATH="$HOME/Library/Application Support/Engress/data.json"

echo "ENGRESS: Focus Reset Protocol Initiated..."

if [ -f "$DATA_PATH" ]; then
    rm "$DATA_PATH"
    echo "✓ Success: Database has been wiped clean."
    echo "Please restart the application to begin a fresh mission."
else
    echo "○ Notice: No database file found. It’s already empty or not yet created."
fi
