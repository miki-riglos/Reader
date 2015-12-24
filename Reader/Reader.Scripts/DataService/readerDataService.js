define(['Transfer/request'], function(request) {

    var BASE_URI = '../api/';

    function addUserFeed(feedUrl) {
        var data = { feedUrl: feedUrl };
        var promise = request(BASE_URI + 'UserFeed', 'POST', JSON.stringify(data));
        return promise;
    }

    function refreshUserFeed(userFeedId) {
        var promise = request(BASE_URI + 'UserFeed/' + userFeedId + '/refresh', 'POST');
        return promise;
    }

    function loadUserFeedItems(userFeedId, skip) {
        var data = { skip: skip };
        var promise = request(BASE_URI + 'UserFeed/' + userFeedId + '/items', 'GET', data);
        return promise;
    }

    function deleteUserFeed(userFeedId) {
        var promise = request(BASE_URI + 'UserFeed/' + userFeedId, 'DELETE');
        return promise;
    }

    function updateUserFeedItem(userFeedItem) {
        var data = userFeedItem;
        var promise = request(BASE_URI + 'UserFeedItem', 'PUT', JSON.stringify(data));
        return promise;
    }

    return {
        addUserFeed: addUserFeed,
        refreshUserFeed: refreshUserFeed,
        loadUserFeedItems: loadUserFeedItems,
        deleteUserFeed: deleteUserFeed,
        updateUserFeedItem: updateUserFeedItem
    };
});