define(['knockout'], function(ko) {

    function UserFeedAllViewModel(userFeeds) {
        var self = this;
        self.userFeedId = null;
        self.title = 'ALL';
        self.imageUrl = null;

        self.items = ko.computed({
            read: function() {
                var allItems = [];
                userFeeds().forEach(function(userFeed) {
                    if (userFeed.userFeedId) {
                        allItems = allItems.concat(userFeed.items());
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
                userFeeds().forEach(function(userFeed) {
                    if (userFeed.userFeedId) {
                        allUnreadQuantity += userFeed.unreadQuantity();
                    }
                });
                return allUnreadQuantity;
            },
            deferEvaluation: true
        });

        self.showFeedTitle = true;
    }

    return UserFeedAllViewModel;
});