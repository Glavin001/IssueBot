###
# Example issues from https://github.com/Glavin001/atom-beautify/
# Issues with label `duplicates`
###

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import pairwise_distances

import json
from pprint import pprint
import sys
import os
# Relative imports
# Cite: http://stackoverflow.com/a/4655793/2578205
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src', 'classifier'))
import classifier

# vect = TfidfVectorizer(min_df=1)
# tfidf = vect.fit_transform(["I'd like an apple",
# "An apple a day keeps the doctor away",
# "Never compare an apple to an orange",
# "I prefer scikit-learn to Orange"])
#
# print( (tfidf * tfidf.T).A )

# issue191 = """atom.workspaceView is no longer available.
# In most cases you will not need the view. See the Workspace docs for
# alternatives: https://atom.io/docs/api/latest/Workspace.
# If you do need the view, please use `atom.views.getView(atom.workspace)`,
# which returns an HTMLElement.
# ```
# Atom.Object.defineProperty.get (c:\Users\Andy\AppData\Local\atom\app-0.175.0\resources\app\src\atom.js:55:11)
# LoadingView.module.exports.LoadingView.show (c:\Users\Andy\.atom\packages\atom-beautify\lib\loading-view.coffee:38:11)
# ```
# """
#
# issue198 = """atom.workspaceView is no longer available.
# In most cases you will not need the view. See the Workspace docs for
# alternatives: https://atom.io/docs/api/latest/Workspace.
# If you do need the view, please use `atom.views.getView(atom.workspace)`,
# which returns an HTMLElement.
# ```
# Atom.Object.defineProperty.get (/Applications/Atom.app/Contents/Resources/app/src/atom.js:53:11)
# LoadingView.module.exports.LoadingView.show (/Users/davide/.atom/packages/atom-beautify/lib/loading-view.coffee:38:11)
# ```
# """
#
# issue208 = """atom.workspaceView is no longer available.
# In most cases you will not need the view. See the Workspace docs for
# alternatives: https://atom.io/docs/api/latest/Workspace.
# If you do need the view, please use `atom.views.getView(atom.workspace)`,
# which returns an HTMLElement.
# ```
# Atom.Object.defineProperty.get (C:\Users\Andy\AppData\Local\atom\app-0.177.0\resources\app\src\atom.js:54:11)
# LoadingView.module.exports.LoadingView.show (C:\Users\Andy\.atom\packages\atom-beautify\lib\loading-view.coffee:38:11)
# ```
# """
#
# issue205 = """atom.workspaceView is no longer available.
# In most cases you will not need the view. See the Workspace docs for
# alternatives: https://atom.io/docs/api/latest/Workspace.
# If you do need the view, please use `atom.views.getView(atom.workspace)`,
# which returns an HTMLElement.
# ```
# Atom.Object.defineProperty.get (C:\Users\Nolan\AppData\Local\atom\app-0.177.0\resources\app\src\atom.js:54:11)
# LoadingView.module.exports.LoadingView.show (C:\Users\Nolan\.atom\packages\atom-beautify\lib\loading-view.coffee:38:11)
# ```
# """
#
# issue210 = """atom.workspaceView is no longer available.
# In most cases you will not need the view. See the Workspace docs for
# alternatives: https://atom.io/docs/api/latest/Workspace.
# If you do need the view, please use `atom.views.getView(atom.workspace)`,
# which returns an HTMLElement.
# ```
# Atom.Object.defineProperty.get (/Applications/Atom.app/Contents/Resources/app/src/atom.js:54:11)
# LoadingView.module.exports.LoadingView.show (/Users/davide/.atom/packages/atom-beautify/lib/loading-view.coffee:38:11)
# ```
# """
#
# issue212 = """atom.workspaceView is no longer available.
# In most cases you will not need the view. See the Workspace docs for
# alternatives: https://atom.io/docs/api/latest/Workspace.
# If you do need the view, please use `atom.views.getView(atom.workspace)`,
# which returns an HTMLElement.
# ```
# Atom.Object.defineProperty.get (C:\Users\Laurent\AppData\Local\atom\app-0.179.0\resources\app\src\atom.js:54:11)
# LoadingView.module.exports.LoadingView.show (C:\Users\Laurent\.atom\packages\atom-beautify\lib\loading-view.coffee:38:11)
# ```
# """
#
# # vect = TfidfVectorizer(min_df=1)
# # tfidf = vect.fit_transform([issue191, issue198, issue208, issue205, issue210, issue212])
# #
# # print("Duplicate Bug:")
# # print( (tfidf * tfidf.T).A )
#
#
# issue161 = """Hello, any chance you will be adding lua as a supported language?"""
# issue185 = """Currently atom-beautify don't support lua language."""
#
# # vect = TfidfVectorizer(min_df=1)
# vect = TfidfVectorizer(min_df=0, ngram_range=(1,3))
# tfidf = vect.fit_transform([issue161, issue185])
#
# matrix = (tfidf * tfidf.T).A
# print("Feature request:")
# print( matrix )
# print( matrix[0] )


# Get JSON data
user = "Glavin001"
repo = "atom-beautify"
# repo = "test-issues"
# user = "reactjs" #"Glavin001"
# repo = "redux" #"atom-beautify"
# user = "nodejs"
# repo = "node"
repoPath = './data/'+user+'/'+repo+'/'

# ignore_labels = ['duplicate', 'in-progress', 'pending-publication', 'published', 'waiting-for-user-information', 'high priority']

def similarity(tfidf):
    matrix = (tfidf * tfidf.T).A
    # matrix = pairwise_distances(tfidf, metric='cosine')
    # matrix = pairwise_distances(tfidf, metric='euclidean')
    return matrix

with open(repoPath+'issues.json') as data_file:
    issues = json.load(data_file)

    issues = [classifier.transform_issue(issue) for issue in issues]
    # issue = (number, text, labels)
    issueTexts = [issue[1] for issue in issues]

    vect = TfidfVectorizer(min_df=0, ngram_range=(1,10))
    tfidf = vect.fit_transform(issueTexts)
    print(tfidf)

    matrix = similarity(tfidf)
    # print(matrix)

    # for issue in issues:
    for i in xrange(0, len(issues)):
        issue = issues[i]
        number = issue[0]
        labels = issue[2]
        similarity = list(matrix[i])
        # Delete itself
        del similarity[i]
        closestValue = max(similarity)
        if closestValue >= 0.8:

            if "duplicate" in set(labels):
                print ("Issue "+str(number)+" (index "+str(i)+") is a duplicate: ", labels)
            else:
                # continue;
                print ("Issue "+str(number)+" (index "+str(i)+") is not (yet) a duplicate: ", labels)

            closestIndex = similarity.index(closestValue)
            if closestIndex >= i:
                closestIndex += 1 # fix index for removed current issue
            closestIssue = issues[closestIndex]
            print ("Most similar issue is "+str(closestIssue[0])+" with score of "+str(closestValue))
            # print matrix[i]


    #     print '%s => %s' % (item, ', '.join(labels))
    # with open(repoPath+'duplicates.json', 'w') as out_file:
    #     json.dump(results, out_file, indent=4)

