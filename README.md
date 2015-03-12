A custom log drain sending Heroku logs to DataDog
=======

It is assumed you have at least one Heroku application and a DataDog account. Set this custom log drain up as its own application on Heroku.

## DataDog

To get the DataDog relay to run alongside the log-parsing code requires using the [DataDog build pack](https://github.com/miketheman/heroku-buildpack-datadog). Set the actual buildpack to be heroku-buildpack-multi and use a .buildpack file.

```
heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git
heroku config:set HEROKU_APP_NAME=<log drain app name>
heroku config:add DATADOG_API_KEY=<your API key>
```

## BasicAuth

To prevent anyone sending log files to your dyno we use basic auth.

```
heroku config:add BASIC_AUTH_USERNAME=<username>
heroku config:add BASIC_AUTH_PASSWORD=<password>
```

## Forward Logs

To have log files from one app forwarded on to your new log drain set up an [http/s drain](https://devcenter.heroku.com/articles/log-drains#http-s-drains) on any application you want to monitor.

```
heroku drains:add http://<username>:<password>@<log drain app name>.herokuapp.com/logs -a <app>
```
