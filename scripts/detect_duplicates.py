###
# Example issues from https://github.com/Glavin001/atom-beautify/
# Issues with label `duplicates`
###

from sklearn.feature_extraction.text import TfidfVectorizer

# vect = TfidfVectorizer(min_df=1)
# tfidf = vect.fit_transform(["I'd like an apple",
# "An apple a day keeps the doctor away",
# "Never compare an apple to an orange",
# "I prefer scikit-learn to Orange"])
#
# print( (tfidf * tfidf.T).A )


issue191 = """atom.workspaceView is no longer available.
In most cases you will not need the view. See the Workspace docs for
alternatives: https://atom.io/docs/api/latest/Workspace.
If you do need the view, please use `atom.views.getView(atom.workspace)`,
which returns an HTMLElement.
```
Atom.Object.defineProperty.get (c:\Users\Andy\AppData\Local\atom\app-0.175.0\resources\app\src\atom.js:55:11)
LoadingView.module.exports.LoadingView.show (c:\Users\Andy\.atom\packages\atom-beautify\lib\loading-view.coffee:38:11)
```
"""

issue198 = """atom.workspaceView is no longer available.
In most cases you will not need the view. See the Workspace docs for
alternatives: https://atom.io/docs/api/latest/Workspace.
If you do need the view, please use `atom.views.getView(atom.workspace)`,
which returns an HTMLElement.
```
Atom.Object.defineProperty.get (/Applications/Atom.app/Contents/Resources/app/src/atom.js:53:11)
LoadingView.module.exports.LoadingView.show (/Users/davide/.atom/packages/atom-beautify/lib/loading-view.coffee:38:11)
```
"""

issue208 = """atom.workspaceView is no longer available.
In most cases you will not need the view. See the Workspace docs for
alternatives: https://atom.io/docs/api/latest/Workspace.
If you do need the view, please use `atom.views.getView(atom.workspace)`,
which returns an HTMLElement.
```
Atom.Object.defineProperty.get (C:\Users\Andy\AppData\Local\atom\app-0.177.0\resources\app\src\atom.js:54:11)
LoadingView.module.exports.LoadingView.show (C:\Users\Andy\.atom\packages\atom-beautify\lib\loading-view.coffee:38:11)
```
"""

issue205 = """atom.workspaceView is no longer available.
In most cases you will not need the view. See the Workspace docs for
alternatives: https://atom.io/docs/api/latest/Workspace.
If you do need the view, please use `atom.views.getView(atom.workspace)`,
which returns an HTMLElement.
```
Atom.Object.defineProperty.get (C:\Users\Nolan\AppData\Local\atom\app-0.177.0\resources\app\src\atom.js:54:11)
LoadingView.module.exports.LoadingView.show (C:\Users\Nolan\.atom\packages\atom-beautify\lib\loading-view.coffee:38:11)
```
"""

issue210 = """atom.workspaceView is no longer available.
In most cases you will not need the view. See the Workspace docs for
alternatives: https://atom.io/docs/api/latest/Workspace.
If you do need the view, please use `atom.views.getView(atom.workspace)`,
which returns an HTMLElement.
```
Atom.Object.defineProperty.get (/Applications/Atom.app/Contents/Resources/app/src/atom.js:54:11)
LoadingView.module.exports.LoadingView.show (/Users/davide/.atom/packages/atom-beautify/lib/loading-view.coffee:38:11)
```
"""

issue212 = """atom.workspaceView is no longer available.
In most cases you will not need the view. See the Workspace docs for
alternatives: https://atom.io/docs/api/latest/Workspace.
If you do need the view, please use `atom.views.getView(atom.workspace)`,
which returns an HTMLElement.
```
Atom.Object.defineProperty.get (C:\Users\Laurent\AppData\Local\atom\app-0.179.0\resources\app\src\atom.js:54:11)
LoadingView.module.exports.LoadingView.show (C:\Users\Laurent\.atom\packages\atom-beautify\lib\loading-view.coffee:38:11)
```
"""

vect = TfidfVectorizer(min_df=1)
tfidf = vect.fit_transform([issue191, issue198, issue208, issue205, issue210, issue212])

print("Duplicate Bug:")
print( (tfidf * tfidf.T).A )


issue161 = """Hello, any chance you will be adding lua as a supported language?"""
issue185 = """Currently atom-beautify don't support Lua language."""

vect = TfidfVectorizer(min_df=1)
tfidf = vect.fit_transform([issue161, issue185])

print("Feature request:")
print( (tfidf * tfidf.T).A )
