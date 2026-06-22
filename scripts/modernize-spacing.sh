#!/bin/bash

# Modernize spacing variables in theyonepm.html
# Replaces Fibonacci-based naming (--g1 through --g8) with semantic tokens

FILE="theyonepm.html"

if [ ! -f "$FILE" ]; then
    echo "Error: $FILE not found"
    exit 1
fi

echo "Modernizing spacing variables in $FILE..."

# Create backup if it doesn't exist
if [ ! -f "$FILE.backup" ]; then
    cp "$FILE" "$FILE.backup"
    echo "✓ Created backup: $FILE.backup"
fi

# Replace all spacing variables with semantic names
# Mapping:
# --g1 (2px)   → --g-xxs
# --g2 (3px)   → --g-xs
# --g3 (5px)   → --g-sm
# --g4 (8px)   → --g-md
# --g5 (13px)  → --g-lg
# --g6 (21px)  → --g-xl
# --g7 (34px)  → --g-xxl
# --g8 (55px)  → --g-xxxl

echo "Replacing spacing variables..."

# Use sed with word boundaries to avoid partial matches
sed -i 's/var(--g1)/var(--g-xxs)/g' "$FILE"
sed -i 's/var(--g2)/var(--g-xs)/g' "$FILE"
sed -i 's/var(--g3)/var(--g-sm)/g' "$FILE"
sed -i 's/var(--g4)/var(--g-md)/g' "$FILE"
sed -i 's/var(--g5)/var(--g-lg)/g' "$FILE"
sed -i 's/var(--g6)/var(--g-xl)/g' "$FILE"
sed -i 's/var(--g7)/var(--g-xxl)/g' "$FILE"
sed -i 's/var(--g8)/var(--g-xxxl)/g' "$FILE"

echo "✓ All spacing variables replaced"

# Verify no old variables remain
REMAINING=$(grep -o 'var(--g[1-8])' "$FILE" | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "✓ Success! All old spacing variables have been replaced"
    echo ""
    echo "Summary of changes:"
    echo "  --g1  → --g-xxs (2px)"
    echo "  --g2  → --g-xs  (3px)"
    echo "  --g3  → --g-sm  (5px)"
    echo "  --g4  → --g-md  (8px)"
    echo "  --g5  → --g-lg  (13px)"
    echo "  --g6  → --g-xl  (21px)"
    echo "  --g7  → --g-xxl (34px)"
    echo "  --g8  → --g-xxxl (55px)"
else
    echo "⚠ Warning: $REMAINING old variable references still remain"
    grep -n 'var(--g[1-8])' "$FILE" | head -10
fi

echo ""
echo "Done!"