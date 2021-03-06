jQuery(function ($, undefined) {

    "use strict";
    var imgsData = $.parseJSON(localStorage.getItem('imgsData'));
    var pathToImages = 'app/imgs/gallery/';
    var imgObjectData = '';
    var imagesPositionsConst = {
        top: [0, 210, 420, 210, 420, 0, 0, 210, 420],
        left: [0, 0, 0, 246, 246, 492, 738, 738, 738]
    };

    /*
     * Checks the availability of image URLs in localstrage.
     * And renders images from localstorage or generate default image URLs, adds its to localstorage and renders.
     */
    if (imgsData) {
        renderImages(null);
    } else {
        addDefaultImages();
    }

    /*
     * Counts the number of screens with images.
     *
     * @param {imageCount} Count of all image objects.
     * @returns {Number} Counts of all screens with images.
     */
    function getScreenCount(imageCount) {
        return Math.floor((imageCount - (imageCount % 9)) / 9);
    }

    /*
     * Create new image Object with name and default properties.
     *
     * @param {string} Image name with file extension.
     * @returns {Number} Image Object with name and default properties
     */
    function getNewImgObject(imageName) {
        return {
            'imageUrl': imageName,
            'like': 0,
            'dislike': 0,
            'comments': []
        };
    }

    /*
     *  Adds default image URLs to localstorage and renders its.
     */
    function addDefaultImages() {
        var initial_image_count = 8;
        imgsData = [];

        for (var i = 0; i < initial_image_count; i++) {
            imgsData[i] = getNewImgObject('slide' + (i + 1) + '.jpg');
        }

        localStorage.setItem('imgsData', JSON.stringify(imgsData));
        renderImages();
    }

    /*
     *  Render images and file upload block.
     */
    function renderImages() {
        $('.gallery').append(getHtmlTemplate('imageDivs', false) + getHtmlTemplate('fileDiv', false));
    }

    /*
     * Create and return HTML templates.
     *
     * @param {string} template - Name of template.
     * @param {boolean} newImage - New or default image.
     * @returns {String} HTML template.
     */
    function getHtmlTemplate(template, newImage) {
        var outputDataHtml = '';
        var imagesPositions = getImagesPositions(true);
        var i;

        switch (template) {
            case 'imageDivs':
                for (i = 0; i < imgsData.length; i++) {
                    outputDataHtml += '<div class=\"img\" style=\"' +
                        'background-image:url(\'' + pathToImages + imgsData[i].imageUrl + '\');' +
                        'top:' + imagesPositions[i].top + 'px;' +
                        'left:' + imagesPositions[i].left + 'px;' +
                        '\" data-img-id= \"' + i + '\">' + getHtmlTemplate('commentsBlock', false) + '</div>';
                }
                break;

            case 'fileDiv':
                var imgsDataLength = 0;
                newImage ? imagesPositions = getImagesPositions(false) : imgsDataLength = imgsData.length;

                outputDataHtml = '<div class=\"img file_input\" style=\"' +
                    'top:' + imagesPositions[imgsDataLength].top + 'px;' +
                    'left:' + imagesPositions[imgsDataLength].left + 'px;' +
                    '\"><input  type=\"file\" accept="image/*" id=\"addImage\">' +
                    '<div class=\"add_image\"><i class=\"fa fa-plus\" aria-hidden=\"true\"></i><p>Add your Picture</p></div>' +
                    '</div>';
                break;

            case 'popupComment':
                for (i = 0; i < imgObjectData.comments.length; i++) {
                    outputDataHtml += '' +
                        '<div class="single_comment">' +
                            '<div>' +
                                '<p class="author">' + imgObjectData.comments[i].author + '</p>' +
                                '<p class="date">' + timeSince(imgObjectData.comments[i].time) + '</p>' +
                            '</div>' +
                            '<p class="text">' + imgObjectData.comments[i].text + '</p>' +
                        '</div>';
                }
                break;

            case 'commentsBlock':
                outputDataHtml = '' +
                    '<div class="img_info">' +
                        '<div class="comments"><p></p></div>' +
                        '<div class="likes"><p></p></div>' +
                        '<div class="dislikes"><p></p></div>' +
                    '</div>';
                break;
        }
        return outputDataHtml;
    }

    /*
     * Calculates images positions using imagesPositionsConst array with position constants.
     *
     * @param {boolean} Current images positions or position of new single image.
     * @returns {Array} Array with image positions.
     */
    function getImagesPositions(isInitialLoad) {
        var screenCount;
        var imagesPositions = [];

        if (isInitialLoad) {
            var counter = 0;
            screenCount = getScreenCount(imgsData.length);

            for (var i = 0; i <= screenCount; i++) {
                for (var j = 0; j < 9 && counter <= imgsData.length; j++) {
                    imagesPositions[counter++] = {
                        'top': imagesPositionsConst.top[j],
                        'left': (i * 1024) + imagesPositionsConst.left[j]
                    };
                }
            }
        } else {
            imgsData = $.parseJSON(localStorage.getItem('imgsData'));
            screenCount = getScreenCount(imgsData.length + 1);
            var newBlockPosition = (imgsData.length + 1) % 9;

            imagesPositions.push({
                'top': imagesPositionsConst.top[newBlockPosition],
                'left': (screenCount * 1024) + imagesPositionsConst.left[newBlockPosition]
            });
        }
        return imagesPositions;
    }

    /*
     * Return date in "ago" format.
     *
     * @param {Number} Image adding date in Timestamp format.
     * @returns {Array} Date in "ago" format.
     */
    function timeSince(date) {
        var seconds = Math.floor((new Date() - date) / 1000);

        var interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
            return interval + " years";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + " days";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + " hours";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }

    $('#img_popup').dialog({
        autoOpen: false,
        resizable: false,
        width: 812,
        height: 595,
        modal: true,
        position: {my: "center", at: "center", of: ".gallery"},
        appendTo: $('.gallery_overlay')
    });

/*Event Handlers*/

    $('.gallery').on("change", '#addImage', function () {
        var filename;

        /* Check if a new image file is selected. */
        if (($(this).val().trim()).length !== 0) {
            filename = $(this).val().split('\\').pop();
        } else {
            return;
        }

        /* Set image on parent, remove fileupload input and add comments block. */
        $(this).parent()
            .css("background-image", 'url(\'' + pathToImages + filename + "\')")
            .removeClass('file_input')
            .append(getHtmlTemplate('commentsBlock', false))
            .data('imgId', ($.parseJSON(localStorage.getItem('imgsData')).length))
            .find('.add_image').remove()
            .off('click');
        $(this).remove();

        /* Add new fileupload block. */
        $('.gallery').append(getHtmlTemplate('fileDiv', true));
        imgsData.push(getNewImgObject(filename));
        localStorage.setItem("imgsData", JSON.stringify(imgsData));
    });

    /* Stop propagation on file upload input, for prevent events loop */
    $('.gallery').on("click", 'input[type=file]', function(e) {
        e.stopPropagation();
    });

    $('.gallery').on({
        mouseenter: function () {
            if ($(this).hasClass('file_input')) {
                return;
            }

            var allImgsData = $.parseJSON(localStorage.getItem('imgsData'));
            var imgId = $(this).data().imgId;

            $(this).find('.comments p').text(allImgsData[imgId].comments.length);
            $(this).find('.likes p').text(allImgsData[imgId].like);
            $(this).find('.dislikes p').text(allImgsData[imgId].dislike);
        },
        click: function (imgObject) {
            if ($(this).hasClass('file_input')) {
                $("input[type='file']").trigger('click');
                return;
            }

            var imgId = $(this).data().imgId;
            imgObjectData = $.parseJSON(localStorage.getItem('imgsData'))[imgId];

            $("#img_popup")
                .data('imgId', $(this).data().imgId)
                .dialog("open");

            $("#img_popup").find('.imageBox').css({'background-image': 'url(' + pathToImages + imgObjectData.imageUrl + ')'});
            $("#img_popup").find('.likes p').text(imgObjectData.like);
            $("#img_popup").find('.dislikes p').text(imgObjectData.dislike);
            $("#img_popup").find('h3').text('Comments: ' + imgObjectData.comments.length);
            $("#img_popup").find('.comments').html('');
            $("#img_popup").find('.comments').append(getHtmlTemplate('popupComment'));
        }
    }, '.img');

    $('.dialog-titlebar-close').on('click', function () {
            $("#img_popup").dialog("close");
    });
    
    $('#newComment').on('keypress', function (e) {
        if (e.which === 13) {
            $('#newComment').submit();
            return false;
        }
    });

    $('#newComment div i').on({
        click: function () {
            $("#newComment").submit();
        }
    });

    $("#newComment").submit(function (event) {

        var commentAuthor = $('#newComment').find('input[type="text"]').val();
        var commentText = $('#newComment').find('input[type="textarea"]').val();

        if ((commentAuthor !== 0) && (commentText !== 0)) {
            imgsData = $.parseJSON(localStorage.getItem('imgsData'));
            var commentsList = imgsData[$('#img_popup').data().imgId].comments;

            commentsList.push({
                author: commentAuthor,
                text: commentText,
                time: $.now()
            });

            localStorage.setItem("imgsData", JSON.stringify(imgsData));

            $('#newComment').find('input[type="text"]').val('');
            $('#newComment').find('input[type="textarea"]').val('');

            var imgId = $('#img_popup').data().imgId;
            imgObjectData = $.parseJSON(localStorage.getItem('imgsData'))[imgId];

            $("#img_popup").find('h3').text('Comments: ' + imgObjectData.comments.length);
            $("#img_popup").find('.comments').html('');
            $("#img_popup").find('.comments').append(getHtmlTemplate('popupComment'));

        } else {
            alert('Add nickname and comment text!');
        }
        event.preventDefault();
    });

    $('.imageBox .likes, .imageBox .dislikes').on({
        click: function () {
            imgsData = $.parseJSON(localStorage.getItem('imgsData'));

            if ($(this).hasClass('likes')) {
                imgsData[$('#img_popup').data().imgId].like++;
                $(this).find('p').text(imgsData[$('#img_popup').data().imgId].like);
            } else {
                imgsData[$('#img_popup').data().imgId].dislike++;
                $(this).find('p').text(imgsData[$('#img_popup').data().imgId].dislike);
            }

            localStorage.setItem("imgsData", JSON.stringify(imgsData));
        }
    });

});