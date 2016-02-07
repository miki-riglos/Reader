define(['Transfer/request'], function(request) {

    var BASE_URI = '../api/';

    function addSubscription(feedUrl) {
        var data = { feedUrl: feedUrl };
        var promise = request(BASE_URI + 'Subscription', 'POST', JSON.stringify(data));
        return promise;
    }

    function refreshSubscription(subscriptionId) {
        var promise = request(BASE_URI + 'Subscription/' + subscriptionId + '/refresh', 'POST');
        return promise;
    }

    function loadSubscriptionItems(subscriptionId, skip) {
        var data = { skip: skip };
        var promise = request(BASE_URI + 'Subscription/' + subscriptionId + '/items', 'GET', data);
        return promise;
    }

    function deleteSubscription(subscriptionId) {
        var promise = request(BASE_URI + 'Subscription/' + subscriptionId, 'DELETE');
        return promise;
    }

    function updateSubscriptionItem(subscriptionItem) {
        var data = subscriptionItem;
        var promise = request(BASE_URI + 'SubscriptionItem', 'PUT', JSON.stringify(data));
        return promise;
    }

    return {
        addSubscription: addSubscription,
        refreshSubscription: refreshSubscription,
        loadSubscriptionItems: loadSubscriptionItems,
        deleteSubscription: deleteSubscription,
        updateSubscriptionItem: updateSubscriptionItem
    };
});