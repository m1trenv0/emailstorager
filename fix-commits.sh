#!/bin/bash

# Script to fix commit messages to follow Conventional Commits format

echo "Starting commit message fixes..."

# Create a mapping file for git filter-branch
cat > /tmp/commit-msg-map.txt << 'EOF'
Better status tracking|fix: improve status tracking
Package tracking integration|feat: integrate package tracking
Ability to auto-create aliexpress filter|feat: add auto-create for AliExpress filter
Fixed updating UI after update credintals|fix: update UI after credential changes
Fixed hydration mismatch in Tabs component by adding suppressHydrationWarning to TabsTrigger|fix: resolve hydration mismatch in Tabs
Fix logout button visibility on mobile by removing incorrect hidden wrapper|fix: logout button visibility on mobile
Add labels to theme and logout buttons on mobile: theme shows current mode, logout shows 'Log Out'|feat: add labels to theme and logout buttons
Move logout and theme buttons to replace description on mobile screens|refactor: move logout and theme buttons on mobile
Register/Autentification|feat: add authentication system
Fix Add Alias button positioning to be consistent at bottom of card|fix: Add Alias button positioning
Move add buttons to header for services and filters pages|refactor: move add buttons to header
remove logs|chore: remove debug logs
Implemented dark mode|feat: implement dark mode
Unification modal between services and filters|refactor: unify modal between services and filters
Better page switcher|feat: improve page switcher
Tabs fixed; Account details horizontal scrolling on mobile devices fixed|fix: tabs and horizontal scrolling on mobile
Modal update: better landing|refactor: improve modal landing
Fix ServiceFieldEditor save button state management|fix: ServiceFieldEditor save button state
EOF

# Use git filter-branch to rewrite commit messages
git filter-branch -f --msg-filter '
  msg=$(cat)
  while IFS="|" read -r old new; do
    if [ "$msg" = "$old" ]; then
      echo "$new"
      exit 0
    fi
  done < /tmp/commit-msg-map.txt
  echo "$msg"
' -- --all

echo "Commit messages fixed!"
echo "Run: git log --oneline to verify"

