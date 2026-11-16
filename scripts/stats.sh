#!/usr/bin/env bash
# Is anyone finding the pack? Stars, forks, and GitHub's last-14-day views and clones.
# Needs the GitHub CLI signed in with push access to the repo (traffic data is owner-only). Read-only.
set -euo pipefail
repo="${1:-moa0101/idea-to-launch}"
gh api "repos/$repo" --jq '"stars \(.stargazers_count) · forks \(.forks_count) · open issues \(.open_issues_count)"'
gh api "repos/$repo/traffic/views" --jq '"views (14 d) \(.count) · unique visitors \(.uniques)"'
gh api "repos/$repo/traffic/clones" --jq '"clones (14 d) \(.count) · unique cloners \(.uniques)"'
echo "top referrers (14 d):"
gh api "repos/$repo/traffic/popular/referrers" --jq '.[] | "  \(.referrer)  \(.count) views, \(.uniques) unique"'
