# Dependencies
import sys, json
import classifier

ignore_labels = ['duplicate', 'in-progress', 'pending-publication', 'published', 'waiting-for-user-information', 'high priority']

# simple JSON echo script
for line in sys.stdin:
    payload = json.loads(line)
    ( action, params ) = payload
    results = {}
    if action == "train_labels":
        ( user, repo, issues, ignore_labels ) = params
        results = classifier.train_issues(user, repo, issues, ignore_labels)
    elif action == "predict_labels":
        ( user, repo, issues ) = params
        results = classifier.predict_labels_for_issues(user, repo, issues)
    elif action == "similarity":
        issues = params[0]
        results = classifier.issue_similarity(issues)

    print json.dumps(results)
