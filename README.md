# sms
a school management platform based on meteor.

<p>based on <a href="https://www.meteor.com/">meteor js</a></p>

#### Installation
1. first install meteor from www.meteor.com and create a new meteor project.
2. copy the files in this repository and overwrite the files in your new meteor project.
3. open the .meteor/packages file and replace it's contents with the code below. This will allow the necessary packages to be installed.
```
# Meteor packages used by this project, one per line.
# Check this file (and the other files in this directory) into your repository.
#
# 'meteor add' and 'meteor remove' will edit this file for you,
# but you can also edit it by hand.

meteor-base@1.0.4             # Packages every Meteor app needs to have
mobile-experience@1.0.4       # Packages for a great mobile UX
mongo@1.1.16                   # The database Meteor supports right now
blaze-html-templates@1.0.4 # Compile .html files into Meteor Blaze views
reactive-var@1.0.11            # Reactive variable for tracker
tracker@1.1.2                 # Meteor's client-side reactive programming library

standard-minifier-css@1.3.4   # CSS minifier run for production mode
standard-minifier-js@2.0.0    # JS minifier run for production mode
es5-shim@4.6.15                # ECMAScript 5 compatibility for older browsers.
ecmascript@0.7.2              # Enable ECMAScript2015+ syntax in app code
shell-server@0.2.3            # Server-side component of the `meteor shell` command

#autopublish@1.0.7             # Publish all data to the clients (for prototyping)
#insecure@1.0.7                # Allow all DB writes from clients (for prototyping)
fourseven:scss
raix:handlebar-helpers
aldeed:collection2
aldeed:autoform
fortawesome:fontawesome
abdj:autoform-google-places-input
kadira:flow-router
kadira:blaze-layout
erasaur:meteor-lodash
zimme:active-route
momentjs:moment
mrt:modernizr-meteor
mrt:moment-timezone
aldeed:simple-schema
cfs:autoform
cfs:standard-packages
cfs:gridfs
cfs:ui
shinn:autoform-file
cfs:filesystem
yogiben:autoform-map
dburles:google-maps
mdg:geolocation
aldeed:autoform-select2
session
themeteorchef:bert
templating
check
vazco:universe-autoform-select

twbs:bootstrap
mpowaga:autoform-summernote
summernote:standalone

```
4. Once done with that, go to the root folder of this project in terminal and run by typing in ```meteor```
