'use strict';

System.register(['app/core/core'], function (_export, _context) {
  "use strict";

  var appEvents, hostname, http, postgRestHost, influxHost, tasklistHostName, camundaHost, camundaRestApi, get, post, alert;
  return {
    setters: [function (_appCoreCore) {
      appEvents = _appCoreCore.appEvents;
    }],
    execute: function () {
      hostname = window.location.hostname;
      http = "http://";

      _export('postgRestHost', postgRestHost = http + hostname + ':5436/');

      _export('influxHost', influxHost = http + hostname + ':8086/');

      tasklistHostName = hostname;

      if (tasklistHostName === 'localhost') {
        tasklistHostName = '127.0.0.1';
      }

      _export('camundaHost', camundaHost = http + tasklistHostName + ':8080/camunda/app/tasklist');

      _export('camundaHost', camundaHost);

      _export('camundaRestApi', camundaRestApi = http + hostname + ':8080/engine-rest/');

      _export('camundaRestApi', camundaRestApi);

      _export('get', get = function get(url) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url);
          xhr.onreadystatechange = handleResponse;
          xhr.onerror = function (e) {
            return reject(e);
          };
          xhr.send();

          function handleResponse() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                var res = JSON.parse(xhr.responseText);
                resolve(res);
              } else {
                reject(this.statusText);
              }
            }
          }
        });
      });

      _export('post', post = function post(url, line) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.onreadystatechange = handleResponse;
          xhr.onerror = function (e) {
            return reject(e);
          };
          xhr.send(line);

          function handleResponse() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                // console.log('200');
                var res = JSON.parse(xhr.responseText);
                resolve(res);
              } else if (xhr.status === 204) {
                // console.log('204');
                res = xhr.responseText;
                resolve(res);
              } else {
                reject(this.statusText);
              }
            }
          }
        });
      });

      _export('alert', alert = function alert(type, title, msg) {
        appEvents.emit('alert-' + type, [title, msg]);
      });

      _export('get', get);

      _export('post', post);

      _export('influxHost', influxHost);

      _export('postgRestHost', postgRestHost);

      _export('alert', alert);
    }
  };
});
//# sourceMappingURL=utils.js.map
