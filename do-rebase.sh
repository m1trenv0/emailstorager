#!/bin/bash

# Interactive rebase script to clean up commit history

echo "Starting interactive rebase..."
echo "This will rewrite the entire commit history."
echo ""

# Create a temporary rebase script
cat > /tmp/rebase-script.sh << 'EOF'
#!/bin/bash
# This script will be used as GIT_SEQUENCE_EDITOR

# Replace the second line (init 2) with squash
sed -i '2s/^pick/squash/' "$1"

# Find and fix specific commits
# Fix "credintals" typo
sed -i 's/Fixed updating UI after update credintals/fix: update UI after credential changes/' "$1"

# Shorten long commit messages
sed -i 's/feat: Refactor service and filter forms with modern UI improvements.*/refactor: improve service and filter forms with modern UI/' "$1"
sed -i 's/feat(auth): implement authFetch for automatic token refresh.*/feat: implement authFetch with token refresh/' "$1"
sed -i 's/feat: Implement initial account and alias management.*/feat: add account and alias management/' "$1"

# Mark duplicate commit for drop
sed -i '/12151d5.*feat: add advanced filter tab system/s/^pick/drop/' "$1"

EOF

chmod +x /tmp/rebase-script.sh

# Run the rebase
GIT_SEQUENCE_EDITOR="/tmp/rebase-script.sh" git rebase -i --root

echo "Rebase complete!"

