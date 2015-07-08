;
(function() {
    var self = skyshares.share = {
        //
        //
        //
        header_font: 'bold 24px "Open Sans", Helvetica, Arial, sans-serif',
        credit_font: 'normal 12px "Open Sans", Helvetica, Arial, sans-serif',
        credits: 'Generated by SkyShares ',
        style: undefined,
        getstyleelement: function () {
            var self = skyshares.share;
            if (!self.style) {
                var c3_rules = {};
                for (var i = 0; i < document.styleSheets.length; i++) {
                    var rules = document.styleSheets[i].rules;
                    for (var j = 0; rules && j < rules.length; j++) {
                        if (rules[j].type == 1) {
                            var selectors = rules[j].selectorText.split(','); // split multiple declarations
                            selectors.forEach(function (s) {
                                var selector = s.trim();
                                if (selector.indexOf('.c3') >= 0) {
                                    if (c3_rules[selector]) {
                                        //
                                        // merge declarations
                                        //
                                        var style = rules[j].style;
                                        for (var k = 0; k < style.length; k++) {
                                            var name = style.item(k);
                                            c3_rules[selector].setProperty(name, style.getPropertyValue(name), style.getPropertyPriority(name));
                                        }
                                    } else {
                                        c3_rules[selector] = rules[j].style;
                                    }

                                }
                            });
                        }
                    }
                }
                self.style = document.createElement("style");
                for (var rule in c3_rules) {
                    self.style.textContent += (rule + " { " + c3_rules[rule].cssText + " }\n");
                }
                self.style.setAttribute('type', 'text/css');
            }
            return self.style;
        },
        sharechart: function (svg, id, options) {
            var self = skyshares.share;
            options = options || {};
            //
            //
            //
            window.open('share/chart', 'skyshares.share', 'width=640,height=480,modal=yes');
            //
            // duplicate svg
            //
            var svg_copy = svg.cloneNode(true);
            svg_copy.setAttribute('class', 'c3');
            //
            // insert CSS from containing document.
            //
            svg_copy.getElementsByTagName("defs")[0].appendChild(self.getstyleelement());
            //
            //
            //
            var svg_xml = new XMLSerializer().serializeToString(svg_copy);
            //
            // render to canvas
            //
            var scale = options.scale || 2.0;
            var canvas = document.createElement('canvas');
            var width = parseInt(svg.getAttribute('width')) * scale;
            var height = parseInt(svg.getAttribute('height')) * scale;
            var margin_top = options.margin || 0;
            var margin_bottom = options.margin || 0;
            var margin_left = options.margin || 0;
            var margin_right = options.margin || 0;
            if (options.title) {
                margin_top += 48;
            }
            canvas.width = width + margin_left + margin_right;
            canvas.height = height + margin_top + margin_bottom + 12;
            var context = canvas.getContext('2d');
            //
            // clear to background colour
            //
            context.fillStyle = options.background_colour || 'rgb( 128, 128, 128 )';
            context.fillRect(0, 0, canvas.width, canvas.height);
            //
            // draw svg
            //
            context.drawSvg(svg_xml, margin_left, margin_top, width, height);
            //
            // optional title
            //
            if (options.title) {
                context.save();
                context.font = self.header_font;
                context.fillStyle = options.header_colour || 'rgb( 255, 255, 255 )';
                context.textAlign = 'center';
                context.textBaseline = 'top';
                context.fillText(options.title, canvas.width / 2., options.margin || 0);
                context.restore();
            }
            //
            // credits
            //
			context.save();
			context.font = self.credit_font;
			context.fillStyle = 'rgb( 255, 255, 255 )';
			context.textAlign = 'left';
			context.textBaseline = 'bottom';
			context.fillText(self.credits, margin_left, canvas.height - margin_bottom);
			context.restore();
            //
            //
            //
            setTimeout(function () {
                localStorage.setItem('skyshares.share-png', canvas.toDataURL("image/png"));
                localStorage.setItem('skyshares.share-hash', skyshares.controller.getoptionshash()+id);
                if ( options.title ) localStorage.setItem('skyshares.share-title', options.title);
            }, 400);
        },
        sharetable: function( table, options ) {
            //
            // convert to svg
            //

            //
            // convert to png
            //

            //
            // convert to csv
            //
            var csv = [];
            //
            // convert to xls
            //

        },
        twitter: {
            //
            //
            //
            post: function () {
                var media = document.querySelector('#preview-image').src;
                if (media) {
                    var data = {
                    	hash: localStorage.getItem('skyshares.share-hash'),
                        media: media
                    }
                    skyshares.rest.post('/media', data, {
                        onloadend: function (e) {
                            var response = skyshares.rest.parseresponse(e);
                            var text = document.querySelector('#post-text').value;
                            if ( text.length == 0 ) {
                            	text = '#skyshares';
                            }
                            location = '/twitter/commitmedia/' + response.id + '/' + encodeURIComponent(text);
                        },
                        onerror: function (e) {
                            console.log('error');
                        },
                        onprogress: function (e) {
                            if (e.lengthComputable) {
                                var progress = e.loaded / e.total;
                                console.log('progress:' + progress);
                            } else {
                                console.log('progress: unknown');
                            }
                        },
                    });
                }
            }
        },
        facebook: {
            //
            //
            //
            post: function () {
                var media = document.querySelector('#preview-image').src;
                if (media) {
                    var data = {
                    	hash: localStorage.getItem('skyshares.share-hash'),
                        media: media
                    }
                    skyshares.rest.post('/media', data, {
                        onloadend: function (e) {
                            var response = skyshares.rest.parseresponse(e);
                            var url = 'https://www.facebook.com/dialog/feed?app_id=771729846278358&display=page';
  							url += '&caption=' + encodeURIComponent(localStorage.getItem('skyshares.share-title') || 'SkyShares' ); 
  							url += '&picture=' + encodeURIComponent('http://skyshares-soda.rhcloud.com/media/' + response.id);
  							url += '&description=' + encodeURIComponent(document.querySelector('#post-text').value);
  							url += '&redirect_uri=' + encodeURIComponent(location);
  							location = url;
                        },
                        onerror: function (e) {
                            console.log('error');
                        },
                        onprogress: function (e) {
                            if (e.lengthComputable) {
                                var progress = e.loaded / e.total;
                                console.log('progress:' + progress);
                            } else {
                                console.log('progress: unknown');
                            }
                        },
                    });
                }
            }
        },
        googleplus: {
            //
            //
            //
            post: function () {
                var media = document.querySelector('#preview-image').src;
                if (media) {
                    var data = {
                    	hash: localStorage.getItem('skyshares.share-hash'),
                        media: media
                    }
                    skyshares.rest.post('/media', data, {
                        onloadend: function (e) {
                            var response = skyshares.rest.parseresponse(e);
                            var url = 'http://skyshares-soda.rhcloud.com/googleplus';
                            url += '/' + encodeURIComponent(response.id);
  							url += '/' + encodeURIComponent(localStorage.getItem('skyshares.share-title') || 'SkyShares' ); 
  							var description = document.querySelector('#post-text').value;
  							if ( description.length == 0 ) {
  								description = 'Generated by SkyShares http://skyshares-soda.rhcloud.com';
  							}
  							url += '/' + encodeURIComponent(description);
  							location = 'https://plus.google.com/share?url=' + encodeURIComponent(url);
                        },
                        onerror: function (e) {
                            console.log('error');
                        },
                        onprogress: function (e) {
                            if (e.lengthComputable) {
                                var progress = e.loaded / e.total;
                                console.log('progress:' + progress);
                            } else {
                                console.log('progress: unknown');
                            }
                        },
                    });
                }
            }
        },
        file: {
            download: function (data, filename) {
                if (navigator.msSaveBlob) { // IE 10+
                    function dataURLtoBlob(dataurl) { // TODO: move this to utility
                        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        return new Blob([u8arr], { type: mime });
                    }
                    navigator.msSaveBlob(dataURLtoBlob(data), filename);
                } else {
                    var a = document.createElement('a');
                    a.setAttribute('download', filename);
                    a.setAttribute('href', data);
                    a.innerHTML = 'testing';
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            },
            topng: function () {
                var self = skyshares.share.file;
                var filename = 'test.png';
                var data = localStorage.getItem('skyshares.share-png');
                if (filename && data) {
                    self.download(data, filename);
                }
            },
            tosvg: function () {
                var self = skyshares.share.file;
                var filename = 'test.svg';
                var data = localStorage.getItem('skyshares.share-svg');
                if (filename && data) {
                    self.download(data, filename);
                }
            },
            tocsv: function () {
                var self = skyshares.share.file;
                var filename = 'test.csv';
                var data = localStorage.getItem('skyshares.share-csv');
                if (filename && data) {
                    self.download(data, filename);
                }
            },
            toxls: function () {
                var self = skyshares.share.file;
                var filename = 'test.xls';
                var data = localStorage.getItem('skyshares.share-xls');
                if (filename && data) {
                    self.download(data, filename);
                }
            }
        },
        utility: {
            //
            // utility functions
            //
            nonce: function (length) {
                var text = "";
                var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < length; i++) {
                    text += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return text;
            },
            buildauthheader: function (parameters) {          
                //
                // sort parameters
                //
                parameters.sort(function (a, b) {
                    if (a.name > b.name) {
                        return 1;
                    }
                    if (a.name < b.name) {
                        return -1;
                    }
                    return 0;
                });
                //
                //
                //
                var header = 'oAuth ';
                for (var i = 0; i < parameters.length; i++ ) {
                    header += escape(parameters[i].name) + '="' + escape(parameters[i].value) + '"';
                    if (i < parameters.length - 1) header += ', ';
                }
                return header;
            }
            //
            // 
            //
        }
    }
})();