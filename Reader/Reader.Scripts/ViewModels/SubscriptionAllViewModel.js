define(['knockout'], function(ko) {

    function SubscriptionAllViewModel(subscriptions) {
        var self = this;
        self.subscriptionId = null;
        self.title = 'ALL';
        self.imageUrl = null;

        self.items = ko.computed({
            read: function() {
                var allItems = [];
                subscriptions().forEach(function(subscription) {
                    if (subscription.subscriptionId) {
                        allItems = allItems.concat(subscription.items());
                    }
                });
                allItems.sort(function(itemLeft, itemRight) { return itemLeft.publishDate > itemRight.publishDate ? -1 : itemLeft.publishDate < itemRight.publishDate ? 1 : 0; });
                return allItems;
            },
            deferEvaluation: true
        });

        self.unreadQuantity = ko.computed({
            read: function() {
                var allUnreadQuantity = 0;
                subscriptions().forEach(function(subscription) {
                    if (subscription.subscriptionId) {
                        allUnreadQuantity += subscription.unreadQuantity();
                    }
                });
                return allUnreadQuantity;
            },
            deferEvaluation: true
        });

        self.showFeedTitle = true;
    }

    return SubscriptionAllViewModel;
});