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
user = "Glavin001"
repo = "atom-beautify"
# user = "reactjs" #"Glavin001"
# repo = "redux" #"atom-beautify"
# user = "nodejs"
# repo = "node"
repoPath = './data/'+user+'/'+repo+'/'

ignore_labels = ['duplicate', 'in-progress', 'pending-publication', 'published', 'waiting-for-user-information', 'high priority']

with open(repoPath+'issues.json') as data_file:
    issues = json.load(data_file)

    results = classifier.train_issues(user, repo, issues, ignore_labels)

    #     print '%s => %s' % (item, ', '.join(labels))
    with open(repoPath+'results.json', 'w') as out_file:
        json.dump(results, out_file, indent=4)


    issue = issues[0]
    labels = classifier.predict_issue_labels(user, repo, issue)
    print (labels, issue)
