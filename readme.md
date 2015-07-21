Chrome Time Log
===============

A simple chrome extension that logs how long you spend on a web domain. Each visited site gets logged and presented to the user in the UI popup under the clock icon, in order of time spent on that domain.

Implementation
--------------
I used an event page to run the eventListener logic. Chrome event pages run in the background and 'spin up' when events are detected. This way system resource use is kept to a minimum. Since I persist the data in Chrome's built-in storage, I could access the data from a UI js page without needing to send the data manually from the event page. This vastly simplified the build. Having data in one location is really the only way to code. Finally, I built out a simple UI for displaying the data stored from my event page. 





