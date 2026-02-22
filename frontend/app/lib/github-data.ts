export interface GitLesson {
    id: string;
    title: string;
    description: string;
    command: string;
    explanation: React.ReactNode | string;
    expectedOutput: string;
}

export const GIT_LESSONS: GitLesson[] = [
    {
        id: 'init',
        title: 'Initialize a Repository',
        description: 'Start tracking your project with Git.',
        command: 'git init',
        explanation: 'Before Git can track your changes, you need to initialize a repository in your project folder. Running this command creates a hidden `.git` directory that stores all version control data.',
        expectedOutput: 'Initialized empty Git repository in /Users/developer/project/.git/'
    },
    {
        id: 'add',
        title: 'Staging Files',
        description: 'Prepare your changes to be saved.',
        command: 'git add .',
        explanation: 'Git doesn\'t automatically save everything. You must explicitly tell it which files to include in your next commit. The `.` means "add all changed files in the current directory."',
        expectedOutput: '' // Typically no output for success
    },
    {
        id: 'commit',
        title: 'Committing Changes',
        description: 'Save a snapshot of your project.',
        command: 'git commit -m "Initial commit"',
        explanation: 'A commit is like taking a photograph of your project at a specific point in time. The `-m` flag allows you to attach a descriptive message so you remember what changes were made.',
        expectedOutput: '[main (root-commit) 4a7c8f1] Initial commit\n 3 files changed, 142 insertions(+)\n create mode 100644 index.html\n create mode 100644 styles.css\n create mode 100644 app.js'
    },
    {
        id: 'branch',
        title: 'Creating Branches',
        description: 'Work on features safely.',
        command: 'git branch feature-login',
        explanation: 'Branches allow you to work on new features without breaking the main codebase. This command creates a new parallel universe (branch) called `feature-login`, but you stay on your current branch.',
        expectedOutput: ''
    },
    {
        id: 'checkout_b',
        title: 'Create & Switch Branch',
        description: 'The faster way to branch.',
        command: 'git checkout -b feature-checkout',
        explanation: 'This is a shortcut that combines `git branch` and `git checkout`. It creates a new branch and instantly moves you over to it so you can start working immediately.',
        expectedOutput: 'Switched to a new branch \'feature-checkout\''
    },
    {
        id: 'status',
        title: 'Checking Status',
        description: 'See what has changed.',
        command: 'git status',
        explanation: 'The most important command in Git. It tells you exactly what branch you are on, which files are modified, and which files are staged ready for a commit.',
        expectedOutput: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   app/page.tsx\n\nno changes added to commit (use "git add" and/or "git commit -a")'
    },
    {
        id: 'remote',
        title: 'Link to GitHub',
        description: 'Connect local code to the cloud.',
        command: 'git remote add origin https://github.com/user/repo.git',
        explanation: 'To collaborate or backup your code, you need to connect your local repository to a remote server (like GitHub). `origin` is just the standard nickname for your primary remote repository.',
        expectedOutput: ''
    },
    {
        id: 'push',
        title: 'Pushing Code',
        description: 'Upload your commits.',
        command: 'git push -u origin main',
        explanation: 'Push takes the commits you\'ve made locally and uploads them to the GitHub server. The `-u` flag links your local `main` branch to the remote `main` branch so future pushes just require typing `git push`.',
        expectedOutput: 'Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nDelta compression using up to 8 threads\nCompressing objects: 100% (3/3), done.\nWriting objects: 100% (5/5), 4.52 KiB | 4.52 MiB/s, done.\nTotal 5 (delta 0), reused 0 (delta 0), pack-reused 0\nTo https://github.com/user/repo.git\n * [new branch]      main -> main\nBranch \'main\' set up to track remote branch \'main\' from \'origin\'.'
    },
    {
        id: 'pull',
        title: 'Pulling Updates',
        description: 'Download changes from others.',
        command: 'git pull origin main',
        explanation: 'When working on a team, someone else might push code to the repository. `git pull` downloads their new commits and automatically integrates them into your local files.',
        expectedOutput: 'remote: Enumerating objects: 4, done.\nremote: Counting objects: 100% (4/4), done.\nremote: Compressing objects: 100% (2/2), done.\nremote: Total 3 (delta 1), reused 0 (delta 0), pack-reused 0\nUnpacking objects: 100% (3/3), 1024 bytes | 1024.00 KiB/s, done.\nFrom https://github.com/user/repo\n * branch            main       -> FETCH_HEAD\n   4a7c8f1..9b2e3c4  main       -> origin/main\nUpdating 4a7c8f1..9b2e3c4\nFast-forward\n components/Header.tsx | 15 +++++++++++++++\n 1 file changed, 15 insertions(+)'
    },
    {
        id: 'log',
        title: 'Viewing History',
        description: 'See the commit timeline.',
        command: 'git log --oneline',
        explanation: 'Displays a history of all commits made in the repository. The `--oneline` flag condenses the output to show just the commit hash and message, making it much easier to read.',
        expectedOutput: '9b2e3c4 (HEAD -> main, origin/main) Add responsive header component\n4a7c8f1 Initial commit'
    },
    {
        id: 'merge',
        title: 'Merging Branches',
        description: 'Combine work together.',
        command: 'git merge feature-login',
        explanation: 'Once you finish building a feature on a separate branch, you use `git merge` (while on the `main` branch) to combine the feature branch\'s commits into your primary codebase.',
        expectedOutput: 'Updating 9b2e3c4..f1d2s3a\nFast-forward\n app/login/page.tsx | 120 +++++++++++++++++++++++++++++++++++++++++++++++++++++\n 1 file changed, 120 insertions(+)\n create mode 100644 app/login/page.tsx'
    },
    {
        id: 'stash',
        title: 'Stashing Changes',
        description: 'Temporarily shelve your incomplete work.',
        command: 'git stash',
        explanation: 'If you need to switch branches but your current work isn\'t ready for a commit, `git stash` safely hides your modifications. You can retrieve them later with `git stash pop`.',
        expectedOutput: 'Saved working directory and index state WIP on main: 9b2e3c4 Add responsive header component'
    },
    {
        id: 'rebase',
        title: 'Rebasing',
        description: 'Creating a linear project history.',
        command: 'git rebase main',
        explanation: 'Rebasing moves your branch\'s base commit to the tip of `main`, effectively applying your changes on top of everyone else\'s. This creates a much cleaner, linear history compared to merging, but should not be used on public branches.',
        expectedOutput: 'Successfully rebased and updated refs/heads/feature-login.'
    },
    {
        id: 'reset',
        title: 'Undo Commits (Reset)',
        description: 'Erase history (Use with caution).',
        command: 'git reset --hard HEAD~1',
        explanation: 'Reset moves the branch pointer backward. The `--hard` flag tells Git to completely obliterate any uncommitted changes and the last commit (`HEAD~1`). Highly destructive!',
        expectedOutput: 'HEAD is now at 9b2e3c4 Add responsive header component'
    },
    {
        id: 'revert',
        title: 'Undo Safely (Revert)',
        description: 'Create a new commit that undoes the old one.',
        command: 'git revert HEAD',
        explanation: 'Unlike reset, revert does not erase history. Instead, it creates a brand new commit that perfectly negates the changes made in the specified commit (like `HEAD`). Safe for shared branches!',
        expectedOutput: '[main 8c4f2a1] Revert "Add responsive header component"\n 1 file changed, 15 deletions(-)'
    }
];
