Intellectual Scalability - Solving a Large Problem With Multiple Cooperating Rails Apps
=======================================================================================

This is the code that I demoed at RailsConf Europe. You can download the slides from http://en.oreilly.com/railseurope2008/public/schedule/detail/3557


This is rough and ready: there are almost certainly details which should be pushed out of the library (widgets.js) and into the apps we wrote. This package is also missing the unit tests for this library as well as documentation and examples.

We plan to do all this work in the near future and release this in a nice clean form but wanted to make this available in the mean time.

Comments, questions and feedback of all kind is available. You're of course free to hack around with this demo but bear in mind that this is a throwaway project destined to be replaced in the near future.

Rake Tasks
==========

Three rake tasks are available:

* rake start\_all #Starts all the servers on appropriate ports
* rake stop\_all #Kills them all
* rake migrate\_all #Runs the migrations in each app

Running the Sample
===================

1. Create the appropriate hosts

  You'll need 1 host: container.demo.local
  On *nix like systems add this to /etc/hosts:
  
  127.0.0.1       container.demo.local
  
  On windows machine add it to c:\windows\system32\drivers\etc\hosts
  
2. Setup Apache
  The demo.conf file at the root of this project contains an example configuration. On Mac OS X 10.5 you can just drop this in /etc/apache2/other
  Don't forget to restart apache afterwards!

3. Create the databases
  run rake migrate_all

4. Start the servers
  * The container application should run on port 8000
  * The content application should run on port 8001
  * The comment application should run on port 8002
  
  You can start these by hand or run rake start\_all
  
5. Point your browser at container.demo.local

What is Where
=============

* container/public/javascripts/widgets.js: the javascript library
* container/public/javascripts/portal.js: javascript initializer file: creates the widgets initially visible
* content/public/javascripts/content.js: javascript provided by the content application
* comment/public/javascripts/comment.js: javascript provided by the comment application
* shared\_plugins: plugins loaded by all the applications


This software is released under the MIT License. (c) Re5ult Ltd 2008
