jQuery(function ($, undefined) {

    var imgsData = $.parseJSON(localStorage.getItem('imgsData'));
    var pathToImages = 'app/imgs/';
    var imgObjectData = '';
    var imagesPositionsConst = {
        top: [0, 210, 420, 210, 420, 0, 0, 210, 420],
        left: [0, 0, 0, 246, 246, 492, 738, 738, 738]
    };

    function getScreenCount(imageCount){
        screenCount = Math.floor((imageCount - (imageCount % 9)) / 9);
        return screenCount
    }

    var checkAvailabilityUrls = function () {
        imgsData ? renderImages(null) : addDefaultImages();
    };

    checkAvailabilityUrls();

    function getNewImgObject(imageName) {
        return {
            'imageUrl': imageName,
            'like': 0,
            'dislike': 0,
            'comments': []
        }
    }

    function addDefaultImages() {

        var initial_image_count = 8;
        imgsData = Array();

        for (var i = 0; i < initial_image_count; i++) {
            imgsData[i] = getNewImgObject('slide' + (i+1) + '.jpg');
        }

        localStorage.setItem("imgsData", JSON.stringify(imgsData));
        renderImages();
    }

    function renderImages() {
        if (!imgsData) {
            imgsData = $.parseJSON(imgsData);
        } else {
            imgsData = $.parseJSON(localStorage.getItem("imgsData"));
        }

        $('.gallery').append(getHtmlTemplate('imageDivs', false) + getHtmlTemplate('fileDiv', false));
    }

    function getCommentsBlockHtml() {

        return '' +
            '<div class="img_info">' +
                '<div class="comments"><p></p></div>' +
                '<div class="likes"><p></p></div>' +
                '<div class="dislikes"><p></p></div>' +
            '</div>';
    }

    function getHtmlTemplate(template, newImage){
        var outputDataHtml = '';
        var imagesPositions = getImagesPositions(true);

        switch (template) {
            case 'imageDivs':
                for (var i = 0; i < imgsData.length; i++) {
                    outputDataHtml += '<div class=\"img\" style=\"' +
                        'background-image:url(\'' + pathToImages + imgsData[i]["imageUrl"] + '\');' +
                        'top:' + imagesPositions[i]['top'] + 'px;' +
                        'left:' + imagesPositions[i]['left'] + 'px;' +
                        '\" data-img-id= \"' + i + '\">' + getCommentsBlockHtml() + '</div>';
                }
                break;

            case 'fileDiv':
                var imgsDataLength = 0;
                newImage ? (imagesPositions = getImagesPositions(false)) : imgsDataLength = imgsData.length;

                outputDataHtml = '<div class=\"img file_input\" style=\"' +
                    'top:' + imagesPositions[imgsDataLength]['top'] + 'px;' +
                    'left:' + imagesPositions[imgsDataLength]['left'] + 'px;' +
                    '\"><input  type=\"file\" accept="image/*" id=\"addImage\"></div>';
                break;

            case 'popupComment':
                for(var i=0; i<imgObjectData['comments'].length; i++){
                    outputDataHtml += '' +
                        '<div class="single_comment">' +
                            '<div>' +
                                '<p class="author">' + imgObjectData['comments'][i]['author'] + '</p>' +
                                '<p class="date">' + imgObjectData['comments'][i]['time'] + '</p>' +
                            '</div>' +
                            '<p class="text">' + imgObjectData['comments'][i]['text'] + '</p>' +
                        '</div>';
                }
                break;
        }
        return outputDataHtml;
    }

    function getImagesPositions(isDefaultLoad) {

        var screenCount;
        var imagesPositions = Array();

        if (isDefaultLoad) {
            var counter = 0;

            screenCount = getScreenCount(imgsData.length);

            for (var i = 0; i <= screenCount; i++) {
                for (var j = 0; j < 9 && counter <= imgsData.length; j++) {
                    imagesPositions[counter++] = {
                        'top': imagesPositionsConst['top'][j],
                        'left': (i * 1024) + imagesPositionsConst['left'][j]
                    }
                }
            }
        } else {
            imgsData = $.parseJSON(localStorage.getItem('imgsData'));
            screenCount = getScreenCount(imgsData.length + 1);
            var newBlockPosition = (imgsData.length+1)%9;

            imagesPositions.push({
                'top': imagesPositionsConst['top'][newBlockPosition],
                'left': (screenCount * 1024) + imagesPositionsConst['left'][newBlockPosition]
            });
        }
        return imagesPositions;
    }

    $('#addImage').on('change', previewFile);

    function previewFile() {

        if (($(this).val().trim()).length !== 0) {
            var filename = $(this).val().split('\\').pop();
        } else { return; }

        var parent = $(this).parent();
        $(this).parent()
            .css("background-image", 'url(\'' + pathToImages + filename + "\')")
            .removeClass('file_input')
            .append(getCommentsBlockHtml())
            .data('imgId', ($.parseJSON(localStorage.getItem('imgsData')).length));
        $(this).remove();

        $('.gallery').append(getHtmlTemplate('fileDiv', true));

        imgsData.push(getNewImgObject(filename));
        localStorage.setItem("imgsData", JSON.stringify(imgsData));
        $('#addImage').on('change', previewFile);
    }

    $('.img').on({
        mouseenter: function () {
            if($(this).hasClass('file_input')){return;}

            var allImgsData = $.parseJSON(localStorage.getItem('imgsData'));
            var imgId = $(this).data()['imgId'];

            $(this).find('.comments p').text(allImgsData[imgId]['comments'].length);
            $(this).find('.likes p').text(allImgsData[imgId]['like']);
            $(this).find('.dislikes p').text(allImgsData[imgId]['dislike']);
        },
        click:function (imgObject) {
            if($(this).hasClass('file_input')){return;}

            var imgId = $(this).data()['imgId'];

            imgObjectData = $.parseJSON(localStorage.getItem('imgsData'))[imgId];

            $("#img_popup")
                .data('imgId', $(this).data()['imgId'])
                .dialog( "open" );

            $("#img_popup").find('.imageBox').css({'background-image': 'url(' + pathToImages + imgObjectData['imageUrl'] + ')'});
            $("#img_popup").find('.likes p').text(imgObjectData['like']);
            $("#img_popup").find('.dislikes p').text(imgObjectData['dislike']);
            $("#img_popup").find('h3').text('Comments: ' + imgObjectData['comments'].length);

            $("#img_popup").find('.comments').append(getHtmlTemplate('popupComment'));
        }
    })

    $('#img_popup').dialog({
        autoOpen: false,
        resizable: false,
        width: 812,
        height: 595,
        modal: true,
        position: {my: "center", at: "center", of: ".gallery"},
        appendTo: $('.gallery')
    });

    $('.dialog-titlebar-close').on({
        click: function () {
            $("#img_popup").dialog("close");
        }
    });

    $('#newComment div i').on({
        click: function () {
            $("#newComment").submit();
        }
    });

    $( "#newComment" ).submit(function(event) {

        var commentAuthor = $('#newComment').find('input[type="text"]').val();
        var commentText = $('#newComment').find('input[type="textarea"]').val();

        if((commentAuthor != 0) && (commentText != 0)) {
            //console.log($('#img_popup').data()['imgId']);

            imgsData = $.parseJSON(localStorage.getItem('imgsData'));

            var commentsList = imgsData[$('#img_popup').data()['imgId']]['comments'];

            commentsList.push({
                author: commentAuthor,
                text: commentText,
                time: $.now()
            });

            localStorage.setItem("imgsData", JSON.stringify(imgsData));



            $('#newComment').find('input[type="text"]').val('');
            $('#newComment').find('input[type="textarea"]').val('');


        }else{
            alert('Add nickname and comment text!');
        }

        event.preventDefault();

    });


})






