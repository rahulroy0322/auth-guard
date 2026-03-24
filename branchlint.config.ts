import { IBranchLintConfig } from '@elsikora/git-branch-lint'

export default {
    branches: {
        feat: { title: "Feature", description: "New functionality" },
        bug: { title: "Bugfix", description: "Bug fixes" },
        hot: { title: "Hotfix", description: "Urgent fixes" },

    },
    ignore: ['dev'],
    rules: {
        "branch-pattern": ":type/:name",
        "branch-subject-pattern": "[a-z0-9-]+",
        "branch-prohibited": ["main", "master"],
        "branch-min-length": 5,
        "branch-max-length": 50,
    },
} satisfies IBranchLintConfig