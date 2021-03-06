/**
 * Created by ezgoing on 14/9/2014.
 */

"use strict";
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    var cropbox = function(options, el) {
        var el = el || $(options.imageBox),
            obj = {
                state: {},
                ratio: 1,
                options: options,
                imageBox: el,
                thumbBox: el.find(options.thumbBox),
                spinner: el.find(options.spinner),
                image: new Image(),
                getDataURL: function() {
                    var width = this.thumbBox.width(),
                        height = this.thumbBox.height(),
                        canvas = document.createElement("canvas"),
                        dim = el.css('background-position').split(' '),
                        size = el.css('background-size').split(' '),
                        dx = parseInt(dim[0]) - el.width() / 2 + width / 2,
                        dy = parseInt(dim[1]) - el.height() / 2 + height / 2,
                        dw = parseInt(size[0]),
                        dh = parseInt(size[1]),
                        sh = parseInt(this.image.height),
                        sw = parseInt(this.image.width);

                    canvas.width = width;
                    canvas.height = height;
                    var context = canvas.getContext("2d");
                    context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
                    var imageData = canvas.toDataURL('image/png');
                    return imageData;
                },
                getBlob: function() {
                    var imageData = this.getDataURL(),
                        b64 = imageData.replace('data:image/png;base64,', ''),
                        binary = atob(b64),
                        array = [];
                    for (var i = 0; i < binary.length; i++) {
                        array.push(binary.charCodeAt(i));
                    }
                    return new Blob([new Uint8Array(array)], {
                        type: 'image/png'
                    });
                },
                zoomIn: function() {
                    this.ratio *= 1.1;
                    setBackground();
                },
                zoomOut: function() {
                    this.ratio *= 0.9;
                    setBackground();
                }
            },
            setBackground = function() {
                var w = parseInt(obj.image.width) * obj.ratio,
                    h = parseInt(obj.image.height) * obj.ratio,
                    thumbBoxWidth = obj.thumbBox.width(),
                    thumbBoxHeight = obj.thumbBox.height();

                if (w < thumbBoxWidth) {
                    w = thumbBoxWidth;
                    h = thumbBoxWidth * parseInt(obj.image.height) / parseInt(obj.image.width);
                    obj.ratio = thumbBoxWidth / parseInt(obj.image.width);
                }
                if (h < thumbBoxHeight) {
                    h = thumbBoxHeight;
                    w = thumbBoxHeight * parseInt(obj.image.width) / parseInt(obj.image.height);
                    obj.ratio = thumbBoxHeight / parseInt(obj.image.height);
                }

                var pw = (el.width() - w) / 2,
                    ph = (el.height() - h) / 2;

                el.css({
                    'background-image': 'url(' + obj.image.src + ')',
                    'background-size': w + 'px ' + h + 'px',
                    'background-position': pw + 'px ' + ph + 'px',
                    'background-repeat': 'no-repeat'
                });
            },
            imgMouseDown = function(e) {
                e.stopImmediatePropagation();
                obj.state.dragable = true;
                obj.state.mouseX = e.clientX;
                obj.state.mouseY = e.clientY;
            },
            imgMouseMove = function(e) {
                e.stopImmediatePropagation();

                if (obj.state.dragable) {
                    var x = e.clientX - obj.state.mouseX,
                        y = e.clientY - obj.state.mouseY,
                        bg = el.css('background-position').split(' '),
                        bgSize = el.css('background-size').split(' '),
                        bgX = x + parseInt(bg[0]),
                        bgY = y + parseInt(bg[1]),
                        w = parseInt(bgSize[0]),
                        h = parseInt(bgSize[1]),
                        halfWidth = (el.width() - obj.thumbBox.width()) / 2,
                        halfHeight = (el.height() - obj.thumbBox.height()) / 2,
                        thumbBoxWidth = obj.thumbBox.width(),
                        thumbBoxHeight = obj.thumbBox.height();

                    if (bgX > halfWidth) bgX = halfWidth;
                    if (bgX < (halfWidth + thumbBoxWidth - w)) bgX = (halfWidth + thumbBoxWidth - w);
                    if (bgY > halfHeight) bgY = halfHeight;
                    if (bgY < (halfHeight + thumbBoxHeight - h)) bgY = (halfHeight + thumbBoxHeight - h);

                    el.css('background-position', bgX + 'px ' + bgY + 'px');

                    obj.state.mouseX = e.clientX;
                    obj.state.mouseY = e.clientY;
                }
            },
            imgMouseUp = function(e) {
                e.stopImmediatePropagation();
                obj.state.dragable = false;
            },
            zoomImage = function(e) {
                e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? obj.ratio *= 1.1 : obj.ratio *= 0.9;
                setBackground();
            }

        obj.spinner.show();
        obj.image.onload = function() {
            obj.spinner.hide();
            setBackground();

            el.bind('mousedown', imgMouseDown);
            el.bind('mousemove', imgMouseMove);
            $(window).bind('mouseup', imgMouseUp);
            el.bind('mousewheel DOMMouseScroll', zoomImage);
        };
        obj.image.src = options.imgSrc;
        el.on('remove', function() {
            $(window).unbind('mouseup', imgMouseUp)
        });

        return obj;
    };

    jQuery.fn.cropbox = function(options) {
        return new cropbox(options, this);
    };
}));
