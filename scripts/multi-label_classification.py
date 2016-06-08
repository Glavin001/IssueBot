# Dependencies
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import LinearSVC
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.multiclass import OneVsRestClassifier
from sklearn import preprocessing
import json
from pprint import pprint

lb = preprocessing.MultiLabelBinarizer()


def train_classifier(X_train, y_train_text):

    Y = lb.fit_transform(y_train_text)

    classifier = Pipeline([
        ('vectorizer', CountVectorizer()),
        ('tfidf', TfidfTransformer()),
        ('clf', OneVsRestClassifier(LinearSVC()))])

    classifier.fit(X_train, Y)
    return classifier

def predict_with_classifier(classifier, X_test):
    predicted = classifier.predict(X_test)
    all_labels = lb.inverse_transform(predicted)

    return zip(X_test, all_labels)

def filter_labels(labels, ignore_labels):
    for ignore in ignore_labels:
        try:
            labels.remove(ignore)
        except:
            pass
    return labels

# Get JSON data
# user = "reactjs" #"Glavin001"
# repo = "redux" #"atom-beautify"
user = "nodejs"
repo = "node"
repoPath = './data/'+user+'/'+repo+'/'
ignore_labels = ['duplicate', 'in-progress', 'pending-publication', 'published', 'waiting-for-user-information']
with open(repoPath+'issues.json') as data_file:
    issues = json.load(data_file)

    x_train = []
    y_train = []
    x_test = []
    y_test = []
    for issue in issues:
        # Ignore Pull Requests
        if issue.has_key('pull_request'):
            pass
        labels = filter_labels(issue['labels'], ignore_labels)
        text = issue['text'].replace("\n"," ").replace('\r', ' ')
        if len(labels) > 0: # and issue['state'] == 'closed':
            x_train.append(text)
            y_train.append(labels)
        else:
            x_test.append(text)
            y_test.append(labels)

    # X_train = np.array(["new york is a hell of a town",
    #                     "new york was originally dutch",
    #                     "the big apple is great",
    #                     "new york is also called the big apple",
    #                     "nyc is nice",
    #                     "people abbreviate new york city as nyc",
    #                     "the capital of great britain is london",
    #                     "london is in the uk",
    #                     "london is in england",
    #                     "london is in great britain",
    #                     "it rains a lot in london",
    #                     "london hosts the british museum",
    #                     "new york is great and so is london",
    #                     "i like london better than new york"])
    # y_train_text = [["new york"],["new york"],["new york"],["new york"],["new york"],
    #                 ["new york"],["london"],["london"],["london"],["london"],
    #                 ["london"],["london"],["new york","london"],["new york","london"]]

    X_train = np.array(x_train)
    y_train_text = y_train

    classifier = train_classifier(X_train, y_train_text)

    # x_test = np.array(['nice day in nyc',
    #                    'welcome to london',
    #                    'london is rainy',
    #                    'it is raining in britian',
    #                    'it is raining in britian and the big apple',
    #                    'it is raining in britian and nyc',
    #                    'hello welcome to new york. enjoy it here and london too'])
    # target_names = ['New York', 'London']

    predicted_train = predict_with_classifier(classifier, X_train)
    wrong = 0
    for i in xrange(0, len(X_train)):
        if set(predicted_train[i][1]) != set(y_train[i]):
            wrong+=1
            print("Expected ",y_train[i]," got ",predicted_train[i][1], " for ",predicted_train[i][0])

    print("Wrong ", wrong)
    print("Out of ", len(X_train))
    print("Percentage: ", wrong/len(X_train))

    predicted_test = predict_with_classifier(classifier, x_test)

    print(len(x_train), len(x_test))
    results = []
    for item, labels in predicted_test:
        results.append({
            "text": item,
            "labels": labels
        })
    #     print '%s => %s' % (item, ', '.join(labels))
    with open(repoPath+'results.json', 'w') as out_file:
        json.dump(results, out_file, indent=4)
