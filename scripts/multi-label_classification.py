# Dependencies
import json
from pprint import pprint
import sys
import os
# Relative imports
# Cite: http://stackoverflow.com/a/4655793/2578205
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src', 'classifier'))
import classifier

# Get JSON data
# user = "Glavin001"
# repo = "test-issues"
# repo = "atom-beautify"
# repo = "atom-preview"
user = "reactjs"
repo = "redux"
# user = "nodejs"
# repo = "node"
repoPath = './data/'+user+'/'+repo+'/'

# ignore_labels = ['duplicate', 'in-progress', 'pending-publication', 'published', 'waiting-for-user-information', 'high priority']
ignore_labels = ['duplicate']
with open(repoPath+'issues.json') as data_file:
    issues = json.load(data_file)

    results = classifier.train_issues(user, repo, issues, ignore_labels)

    #     print '%s => %s' % (item, ', '.join(labels))
    with open(repoPath+'results.json', 'w') as out_file:
        json.dump(results, out_file, indent=4)

    # issues = issues[0:1]
    # results = classifier.predict_labels_for_issues(user, repo, issues)
    # print results