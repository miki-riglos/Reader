define(['request'], function(request) {

    var BASE_URI = '../api/';

    function addFeed(feedUrl) {
        var data = {
            feedUrl: feedUrl
        };
        var promise = request(BASE_URI + 'AddFeed', 'POST', JSON.stringify(data));
        return promise;
    }

    return {
        addFeed: addFeed
    };
});