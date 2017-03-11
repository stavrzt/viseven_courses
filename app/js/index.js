jQuery(function ($, undefined) {

    var imageUrls = $.parseJSON(localStorage.getItem('imageUrls'));
    var pathToImages = 'app/imgs/';
    var imagesPositionsConst = {
        top: [0, 210, 420, 210, 420, 0, 0, 210, 420],
        left: [0, 0, 0, 246, 246, 492, 738, 738, 738]
    };


    function getScreenCount(imageCount){

        screenCount = Math.floor((imageCount - (imageCount % 9)) / 9);

        // if(imageCount % 9 == 0 && imageCount != 9){
        //     screenCount = screenCount - 1;
        // }

        return screenCount
    }

    var checkAvailabilityUrls = function () {
        imageUrls ? renderImages(null) : addDefaultImages();
    };

    checkAvailabilityUrls();

    function addDefaultImages() {

        var initial_image_count = 8;
        imageUrls = Array();

        for (var i = 1; i <= initial_image_count; i++) {
            imageUrls[i - 1] = 'slide' + i + '.jpg';
        }

        localStorage.setItem("imageUrls", JSON.stringify(imageUrls));
        renderImages();
    }

    function renderImages() {
        if (!imageUrls) {
            imageUrls = $.parseJSON(imageUrls);
        } else {
            imageUrls = $.parseJSON(localStorage.getItem("imageUrls"));
        }

        $('.gallery').append(getHtmlTemplate('imageDivs', false) + getHtmlTemplate('fileDiv', false));
    }

    function getHtmlTemplate(template, newImage){
        var outputDataHtml = '';
        var imagesPositions = getImagesPositions(true);

        switch (template) {
            case 'imageDivs':
                for (var i = 0; i < imageUrls.length; i++) {
                    outputDataHtml += '<div class=\"img\" style=\"' +
                        'background-image:url(\'' + pathToImages + imageUrls[i] + '\');' +
                        'top:' + imagesPositions[i]['top'] + 'px;' +
                        'left:' + imagesPositions[i]['left'] + 'px;' +
                        '\"></div>';
                }
                break;

            case 'fileDiv':
                var imageUrlsLength = 0;
                newImage ? (imagesPositions = getImagesPositions(false)) : imageUrlsLength = imageUrls.length;

                // console.log(imageUrlsLength + ' lol');
                // console.log(imagesPositions);

                outputDataHtml = '<div class=\"img file_input\" style=\"' +
                    'top:' + imagesPositions[imageUrlsLength]['top'] + 'px;' +
                    'left:' + imagesPositions[imageUrlsLength]['left'] + 'px;' +
                    '\"><input  type=\"file\" accept="image/*" id=\"addImage\"></div>';
                break;
        }
        return outputDataHtml;
    }

    function getImagesPositions(isDefaultLoad) {

        var screenCount;
        var imagesPositions = Array();

        if (isDefaultLoad) {
            var counter = 0;

            screenCount = getScreenCount(imageUrls.length);

            for (var i = 0; i <= screenCount; i++) {
                for (var j = 0; j < 9 && counter <= imageUrls.length; j++) {
                    // console.log(imagesPositionsConst['top'][j] + ' jjjjjjjjjjjj');
                    // console.log(imagesPositionsConst['left'][j]);

                    imagesPositions[counter++] = {
                        'top': imagesPositionsConst['top'][j],
                        'left': (i * 1024) + imagesPositionsConst['left'][j]
                    }
                }
            }
        } else {
            imageUrls = $.parseJSON(localStorage.getItem('imageUrls'));
            //console.log('imageUrls.length = ' + imageUrls.length);
            //console.log(imageUrls);
            screenCount = getScreenCount(imageUrls.length + 1);
            //console.log('screenCount = ' + screenCount);
            var newBlockPosition = (imageUrls.length+1)%9;
            //console.log('newBlockPosition = ' + newBlockPosition);

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

        $(this).parent().css("background-image", 'url(\'' + pathToImages + filename + "\')");
        $(this).parent().removeClass('file_input');
        $(this).remove();

        $('.gallery').append(getHtmlTemplate('fileDiv', true));
        imageUrls.push(filename);
        localStorage.setItem("imageUrls", JSON.stringify(imageUrls));
        $('#addImage').on('change', previewFile);
    }




})






