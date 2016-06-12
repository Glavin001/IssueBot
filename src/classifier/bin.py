# Dependencies
import sys, json
import classifier

ignore_labels = ['duplicate', 'in-progress', 'pending-publication', 'published', 'waiting-for-user-information', 'high priority']

# simple JSON echo script
for line in sys.stdin:
    payload = json.loads(line)
    ( action, params ) = payload
    if action == "train":
        ( user, repo, issues, ignore_labels ) = params
        results = classifier.train_issues(user, repo, issues, ignore_labels)
    elif action == "predict_labels":
        ( user, repo, issue ) = params
        results = classifier.predict_issue_labels(user, repo, issue)
    else:
        result = None
    print json.dumps(results)
