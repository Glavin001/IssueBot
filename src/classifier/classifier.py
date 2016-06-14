# Dependencies
import sys
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer

from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB, BernoulliNB

from sklearn.calibration import CalibratedClassifierCV

from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.multiclass import OneVsRestClassifier, OneVsOneClassifier
from sklearn import preprocessing
from sklearn import metrics
import json
from pprint import pprint
from sklearn.externals import joblib
import os

# Constants
n_folds = 3 # n-fold cross-validation

# Cite: http://www.erogol.com/predict-probabilities-sklearn-linearsvc/
class LinearSVC_proba(LinearSVC):

    def __platt_func(self,x):
        return 1/(1+np.exp(-x))

    def predict_proba(self, X):
        f = np.vectorize(self.__platt_func)
        raw_predictions = self.decision_function(X)
        platt_predictions = f(raw_predictions)
        probs = platt_predictions / platt_predictions.sum(axis=1)[:, None]
        return probs

def train_classifier(x, y, lb):
    # Convert to binary array
    # http://stackoverflow.com/a/34276057/2578205
    Y = lb.fit_transform(y)

    if n_folds >= 2:
        clf = CalibratedClassifierCV(LinearSVC(), cv=n_folds, method='sigmoid')
    else:
        clf = LinearSVC()
    # clf = LinearSVC_proba()

    classifier = Pipeline([
        ('vectorizer', CountVectorizer(ngram_range=(1,3))),
        ('tfidf', TfidfTransformer()),
        # ('clf', OneVsOneClassifier(LinearSVC()))
        ('clf', OneVsRestClassifier(clf))
        # ('clf', RandomForestClassifier())
        # ('clf', MultinomialNB()) # Does not work
        # ('clf', BernoulliNB(binarize=0.0)) # Does not work
        ])

    # print(x,Y)
    classifier.fit(x, Y)
    return classifier

def score_classifier(x,y,lb,classifier):
    Y = lb.fit_transform(y)
    if n_folds >= 2:
        return classifier.score(x,Y)
    else:
        return 0.0
        # return classifier.decision_function(x)

def predict_proba(x, classifier):
    if n_folds >= 2:
        return classifier.predict_proba(x)
    else:
        return 0

def predict_with_classifier(classifier, x, lb):
    predicted = classifier.predict(x)
    predicted_labels = lb.inverse_transform(predicted)
    all_labels = list(lb.classes_)
    # print(all_labels)
    # predicted_labels_index = [all_labels.index(label) for label in predicted_labels]
    # print(predicted_labels_index)
    # d = classifier.decision_function(x)

    probs = predict_proba(x, classifier)
    # confidences = lb.inverse_transform(d)
    # confidences = [d[i][predicted_labels_index[i]] for i in xrange(0,len(x))]
    # confidences = [d[i][predicted[i]] for i in xrange(0,len(x))]
    confidences = [zip(lb.classes_, c) for c in probs]
    # confidences = [c if c[0] is predicted_labels[i] for ]
    # scores = []
    # for i in xrange(0,len(x)):
    #     con = confidences[i]
    #     label = predicted_labels[i]
    #     scores.append(None) # default
    #     for (c,v) in con:
    #         # print(i, c,v,label)
    #         if set(c) == set(label):
    #             scores[i] = v
    #             break
    # print(predicted)
    # print(all_labels)
    # print(d)
    # print(confidences)
    # print(scores)

    # return (predicted, predicted_labels, zip(x, predicted_labels, confidences))
    return zip(x, predicted_labels, confidences)

def filter_list(items, ignore_items):
    for ignore in ignore_items:
        try:
            items.remove(ignore)
        except:
            pass
    return items

def transform_issue(issue, ignore_labels=[]):
    labels = filter_list(issue['labels'], ignore_labels)
    milestone = issue['milestone'] if 'milestone' in issue else None
    title = (issue['title'] or "").encode('utf-8')
    body = (issue['body'] or "").encode('utf-8')
    text = (title + " " + body).replace("\n"," ").replace('\r', ' ')
    number = issue['number']
    return (number, text, labels)

# simple JSON echo script
def train_issues(owner, repo, issues, ignore_labels = []):

    # Filter issues
    # Ignore Pull Requests
    issues = [issue for issue in issues if not issue.has_key('pull_request')]

    # Transform issues
    issues = [transform_issue(issue, ignore_labels) for issue in issues]

    # n-fold cross-validation requires at least n examples for at least one class
    # Count occurances of labels
    label_counts = {}
    for issue in issues:
        (number, text, labels) = issue
        for label in labels:
            if label in label_counts:
                label_counts[label] += 1
            else:
                label_counts[label] = 1
    # Check for labels with insufficient number of examples
    remove_labels = []
    for label in label_counts.keys():
        if label_counts[label] < n_folds:
            remove_labels.append(label)

    # Check if we have enough different classes remaining!
    if len(label_counts.keys()) - len(remove_labels) <= 1:
        print("Not enough different classes!")
        return ({
            "ok": False,
            "error_message": "Not enough different labels.",
            "label_counts": label_counts,
            "all_labels": label_counts.keys(),
            "remove_labels": remove_labels
        })

    number_train = []
    x_train = []
    y_train = []
    number_test = []
    x_test = []
    y_test = []
    for issue in issues:

        (number, text, labels) = issue

        # Remove labels with insufficient number of examples
        for label in remove_labels:
            if label in labels:
                labels.remove(label)
                print("removed label ",label)

        if len(labels) > 0: # and issue['state'] == 'closed':
        # if milestone != None:
            number_train.append(number)
            x_train.append(text)
            y_train.append(labels)
            # y_train.append([milestone])
        else:
            number_test.append(number)
            x_test.append(text)
            y_test.append(labels)
            # y_test.append([milestone])

    # print("Issues", x_train, y_train)
    # Check if we have enough issues remaining!
    if len(x_train) < n_folds:
        print("Not enough issues!", len(x_train))
        return ({
            "ok": False,
            "error_message": "Not enough different labels.",
            "label_counts": label_counts,
            "all_labels": label_counts.keys(),
            "remove_labels": remove_labels
        })

    X_train = np.array(x_train)

    lb = preprocessing.MultiLabelBinarizer()

    classifier = train_classifier(X_train, y_train, lb)

    # Persist the model
    model_path = os.path.abspath(os.path.join('./data',owner,repo,'issues-model.pkl'))
    binarizer_path = os.path.abspath(os.path.join('./data',owner,repo,'issues-binarizer.pkl'))
    try:
        os.makedirs(os.path.dirname(model_path))
    except:
        pass
    joblib.dump(classifier, model_path)
    joblib.dump(lb, binarizer_path)

    # Score the model
    score = score_classifier(X_train, y_train, lb, classifier)

    predicted_train = predict_with_classifier(classifier, X_train, lb)
    wrong_issues = []
    correct_results = []
    for i in xrange(0, len(predicted_train)):
        (text, pred_labels, confidence) = predicted_train[i]
        number = number_train[i]
        if set(predicted_train[i][1]) != set(y_train[i]):
            # print("Expected ",y_train[i]," got ",predicted_train[i][1], " for ",predicted_train[i][0])
            wrong_issues.append({
                "number": number,
                "text": text,
                "labels": y_train[i],
                "predicted_labels": pred_labels,
                "confidence": confidence
            })
        else:
            correct_results.append({
                "text": text,
                "labels": y_train[i],
                "predicted_labels": pred_labels,
                "confidence": confidence
            })

    Y = lb.transform(y_train)
    # print(Y)
    # print(lb.classes_)
    pred_y = [p[1] for p in predicted_train]
    # print(pred_y)
    pred_y = lb.transform(pred_y)
    # print(pred_y)
    # score2 = metrics.accuracy_score(pred_y, Y)
    # print('score2', score2)
    # cm = metrics.confusion_matrix(pred_train, Y)
    # print("Wrong ", wrong)
    # print("Out of ", len(X_train))
    # print("Percentage: ", wrong/len(X_train))
    target_names = lb.classes_
    # print(target_names)
    # print(Y)
    # print(pred_train)
    report = str(metrics.classification_report(Y, pred_y, target_names=target_names))
    # print(report)
    # confusion_matrix = metrics.confusion_matrix(Y, pred_y)
    # print(confusion_matrix)

    predicted_test = predict_with_classifier(classifier, x_test, lb)

    # print(len(x_train), len(x_test))
    unlabeled_issues = []
    newly_labeled_issues = []
    for i in xrange(0, len(predicted_test)):
        (item, labels, confidence) = predicted_test[i]
        number = number_test[i]

        if len(labels) > 0:
            newly_labeled_issues.append({
                "number": number,
                "text": item,
                "labels": labels,
                "confidence": confidence
            })
        else:
            unlabeled_issues.append({
                "number": number,
                "text": item,
                "labels": labels,
                "confidence": confidence
            })

    return ({
        "ok": True,
        # "confusion_matrix": confusion_matrix,
        "metrics": {
            # "percentage": 1.0 - len(wrong_issues) / len(X_train),
            "score": score,
            "report": report,
            "recall": metrics.recall_score(Y, pred_y),
            "precision": metrics.precision_score(Y, pred_y),
            "f1": metrics.f1_score(Y, pred_y)
        },
        "params": {
            "n_folds": n_folds,
        },
        "issues": {
            "total": len(X_train),
            "wrong_issues_count": len(wrong_issues),
            "wrong_issues": wrong_issues,
            "correct_issues_count": len(correct_results),
            "correct_issues": correct_results,
            "unlabeled_issues_count": len(unlabeled_issues),
            "unlabeled_issues": unlabeled_issues,
            "newly_labeled_issues_count": len(newly_labeled_issues),
            "newly_labeled_issues": newly_labeled_issues,
        },
        "labels": {
            "label_counts": label_counts,
            "all_labels": label_counts.keys(),
            "remove_labels": remove_labels,
        },
    })

def predict_labels_for_issues(owner, repo, issues):
    # Load Model
    modelPath = os.path.abspath(os.path.join('./data',owner,repo,'issues-model.pkl'))
    binarizer_path = os.path.abspath(os.path.join('./data',owner,repo,'issues-binarizer.pkl'))
    classifier = joblib.load(modelPath)
    lb = joblib.load(binarizer_path)

    # Preprocess Issues
    issues = [transform_issue(issue) for issue in issues]
    issueNumbers = [i[0] for i in issues]
    issueTexts = [i[1] for i in issues]

    # Predict label of issue
    x = np.array(issueTexts)
    results = predict_with_classifier(classifier, x, lb)

    return zip(issueNumbers, results)


