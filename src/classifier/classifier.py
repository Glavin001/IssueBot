# Dependencies
import sys
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer

from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB, BernoulliNB

from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.multiclass import OneVsRestClassifier, OneVsOneClassifier
from sklearn import preprocessing
from sklearn import metrics
import json
from pprint import pprint
from sklearn.externals import joblib
import os

def train_classifier(x, y, lb):
    # Convert to binary array
    # http://stackoverflow.com/a/34276057/2578205
    Y = lb.fit_transform(y)

    classifier = Pipeline([
        ('vectorizer', CountVectorizer(ngram_range=(1,3))),
        ('tfidf', TfidfTransformer()),
        # ('clf', OneVsOneClassifier(LinearSVC()))
        ('clf', OneVsRestClassifier(LinearSVC()))
        # ('clf', RandomForestClassifier())
        # ('clf', MultinomialNB()) # Does not work
        # ('clf', BernoulliNB(binarize=0.0)) # Does not work
        ])

    # print(x,Y)
    classifier.fit(x, Y)
    return classifier

def predict_with_classifier(classifier, x, lb):
    predicted = classifier.predict(x)
    all_labels = lb.inverse_transform(predicted)

    return (predicted, all_labels, zip(x, all_labels))

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
    return (text, labels)

# simple JSON echo script
def train_issues(owner, repo, issues, ignore_labels = []):

    x_train = []
    y_train = []
    x_test = []
    y_test = []
    for issue in issues:
        # Ignore Pull Requests
        if issue.has_key('pull_request'):
            pass

        (text, labels) = transform_issue(issue, ignore_labels)

        if len(labels) > 0: # and issue['state'] == 'closed':
        # if milestone != None:
            x_train.append(text)
            y_train.append(labels)
            # y_train.append([milestone])
        else:
            x_test.append(text)
            y_test.append(labels)
            # y_test.append([milestone])

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

    (pred_train, all_labels_train, predicted_train) = predict_with_classifier(classifier, X_train, lb)
    wrong = 0
    wrong_results = []
    correct_results = []
    for i in xrange(0, len(X_train)):
        if set(all_labels_train[i]) != set(y_train[i]):
            wrong+=1
            # print("Expected ",y_train[i]," got ",predicted_train[i][1], " for ",predicted_train[i][0])
            wrong_results.append({
                "text": predicted_train[i][0],
                "labels": y_train[i],
                "predicted_labels": all_labels_train[i]
            })
        else:
            correct_results.append({
                "text": predicted_train[i][0],
                "labels": y_train[i],
                "predicted_labels": all_labels_train[i]
            })

    Y = lb.fit_transform(y_train)
    score = metrics.accuracy_score(pred_train, Y)
    # cm = metrics.confusion_matrix(pred_train, Y)
    # print("Wrong ", wrong)
    # print("Out of ", len(X_train))
    # print("Percentage: ", wrong/len(X_train))
    # target_names = list(lb.classes_)
    # print(target_names)
    # print(Y)
    # print(pred_train)
    # report = str(metrics.classification_report(Y, pred_train, target_names))

    (pred_test, all_labels_test, predicted_test) = predict_with_classifier(classifier, x_test, lb)

    # print(len(x_train), len(x_test))
    results = []
    newly_labeled_issues = []
    for item, labels in predicted_test:
        results.append({
            "text": item,
            "labels": labels
        })
        if len(labels) > 0:
            newly_labeled_issues.append({
                "text": item,
                "labels": labels
            })

    #     print '%s => %s' % (item, ', '.join(labels))
    return ({
        # "report": report,
        "score": score,
        # "confusion_matrix": cm,
        "wrong": wrong,
        "wrong_issues": wrong_results,
        "correct_issues": correct_results,
        "total": len(X_train),
        "percentage": 1.0 * wrong / len(X_train),
        "new_issues": results,
        "newly_labeled_issues": newly_labeled_issues
    })

def predict_issue_labels(owner, repo, issue):
    # Load Model
    modelPath = os.path.abspath(os.path.join('./data',owner,repo,'issues-model.pkl'))
    binarizer_path = os.path.abspath(os.path.join('./data',owner,repo,'issues-binarizer.pkl'))
    classifier = joblib.load(modelPath)
    lb = joblib.load(binarizer_path)

    # Predict label of issue
    (text, _) = transform_issue(issue)

    x = np.array([text])
    (_, labels, _) = predict_with_classifier(classifier, x, lb)

    return labels


