Git Help
=======

New Repo:

    1. make repository from git account (example: abc)
    2. git remote add origin git@github.com:<username>/abc.git
    3. git pull origin master (getting update from main source in chitresh branch)

Branch:

    git branch (list branches)
    git branch chitresh (create branch chitresh)

Add and Commit:

    git add .
    git commit -m "message"

Push in branch:

    git push origin master (if need to checkin in master branch)
  or
    git push origin chitresh (if need to checkin in chitresh branch)

Merge:
    
    git merge chitresh (branch cleanup )

Delete Branch:

    git push origin :chitresh (delete branch chitresh)




Switch to master branch and update source code:

    git checkout master  (Switched to branch 'master')
    git pull origin master (getting update in main source)

Merge master & chitresh branch:
    git merge --no-ff chitresh (merged master & chitresh)
    git push origin master (checkin in master code)


Suppose Conflicts:

    git add filename.rb ( you can use "git add ." also)
    git commit -m "my changes"
      --CONFLICT (content): Merge conflict in filename.rb
      --Automatic merge failed; fix conflicts and then commit the result.

Resolve Conflicts:
    git mergetool
      --Just to use my changes... no
      --their changes...

    git checkout --ours filename.rb
    git checkout --theirs filename.rb
    git add filename.rb
    git commit -m "using theirs"
    git pull origin branch_name

Revert Changes:

    git revert commitnumber
    git merge master
    git add .
    git commit -m "revert files"
    git push origin master
