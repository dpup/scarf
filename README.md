# Scarf - Yet Another GPlus RSS Feed Generator

This is a simple [nodejs](nodejs.org) server for generating RSS feeds for your
[public Google+ posts](https://developers.google.com/+/api/latest/activities).

I primarily built this so I could have G+ posts as inputs into [IFTTT](http://ifttt.com).  Due to
API limits I'm not going to try running this as a service, but feel free to fork the code and run
your own version.  You can get it up and running with Heroku really quickly.


## Set up

You need to request an API key from the [Google APIs Console](https://code.google.com/apis/console),
it will have a limit of 10,000 requests per day.  The server can read the API key from the
environment variable `G_API_KEY` or from a `api-key` file in the package root.


## Running manually

```
npm install
npm start
# OR
node lib/server.js --port [XXXX] --host [hostname]
```

The server defaults to running on port 5051.


## Running on Heroku

Read the [Heroku Quickstart Guide](https://devcenter.heroku.com/articles/quickstart) then:

```
git clone git@github.com:dpup/scarf.git
cd scarf
heroku create
git push heroku master
heroku config:add G_API_KEY=[your-api-key]
```

Author
------

[Dan Pupius](https://github.com/dpup) ([personal website](http://pupius.co.uk/))


## Licence

The MIT License (MIT)

Copyright (c) 2011 Daniel Pupius, http://pupius.co.uk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
