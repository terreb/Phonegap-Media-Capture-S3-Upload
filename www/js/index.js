/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Global vars
var bucket = 'YOUR_BUCKET';
var access = 'YOUR_ACCESS_KEY';
var secret = 'YOUR_SECRET_KEY';
var region = 'YOUR_REGION';

// See the Configuring section to configure credentials in the SDK
//AWS.config.credentials = ...;
AWS.config.update({
    accessKeyId: access,
    secretAccessKey: secret
});

// Configure your region
AWS.config.region = region;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    captureSuccess: function (mediaFiles) {
        console.log('uploading...');
        var i, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            app.uploadFile(mediaFiles[i]);
        }
    },

    captureError: function (error) {
        var msg = 'An error occurred during capture: ' + error.code;
        console.log('capture error: ', msg);
    },

    captureVideo: function () {
        console.log('capturing...');
        if (navigator.device && navigator.device.capture) {
            navigator.device.capture.captureVideo(this.captureSuccess, this.captureError);
        }
    },

    uploadFile: function (file) {
        var //path = file.fullPath,
            path = file.localURL,
            name = file.name,
            type = file.type;

        console.log(path, name, type);

        var s3 = new AWS.S3(),
            s3_params = {
            Bucket: bucket,
            Key: name,
            Expires: 6000
            //ContentType: type,
            //ACL: 'public-read'
        };

        s3.getSignedUrl('putObject', s3_params, function(err, data){
            if(err){
                console.log(err);
            }
            else{
                var ft = new FileTransfer(),
                    url = encodeURI(data);
                console.log(data);
                ft.onprogress = function(progressEvent) {
                    if (progressEvent.lengthComputable) {
                        console.log(progressEvent.loaded / progressEvent.total);
                    } else {
                        console.log(progressEvent);
                    }
                };

                ft.upload(
                    path,
                    url,
                    function(result) {
                        console.log('Upload success: ' + result.responseCode);
                        console.log(result.bytesSent + ' bytes sent');
                    },
                    function(error) {
                        console.log('Error uploading file ' + path + ': ' + error.code);
                    },
                    {
                         httpMethod  : 'PUT',
                         fileName    :  name,
                         mimeType    :  type,
                         chunkedMode :  false,
                         headers: {
                             'Content-Type' :  type,
                             'x-amz-acl'    : 'public-read'
                         }
                    }
                );
            }
        });
    }
};
