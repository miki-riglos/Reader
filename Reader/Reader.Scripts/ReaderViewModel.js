define(['knockout'], function(ko) {

    function FeedItemViewModel(userFeedItemData, feedTitle) {
        var self = this;
        self.userFeedItemId = userFeedItemData.userFeedItemId;
        self.fullUrl = userFeedItemData.fullUrl;
        self.title = userFeedItemData.title;
        self.publishDate = userFeedItemData.publishDate;
        self.isRead = ko.observable(userFeedItemData.isRead);

        self.feedTitle = feedTitle;

        self.markAsRead = function() {
            self.isRead(true);
            return true;    // don't prevent default, allow click on anchor
        };
    }

    function FeedViewModel(userFeedData) {
        var self = this;
        self.userFeedId = userFeedData.userFeedId;
        self.title = userFeedData.title;
        self.imageUrl = userFeedData.imageUrl;
        
        self.items = ko.observableArray();
        userFeedData.items.forEach(function(itemData) {
            self.items.push(new FeedItemViewModel(itemData, userFeedData.title));
        });

        self.loadTime = userFeedData.loadTime;

        self.unreadQuantity = ko.computed(function() {
            return self.items().filter(function(item) { return !item.isRead(); }).length;
        });

        self.showFeedTitle = false;
    }

    function FeedAllViewModel(feeds) {
        var self = this;
        self.userFeedId = null;
        self.title = 'ALL';
        self.imageUrl = null;

        self.items = ko.computed({
            read: function() {
                var allItems = [];
                feeds().forEach(function(feed) {
                    if (feed.userFeedId) {
                        allItems = allItems.concat(feed.items());
                    }
                });
                allItems.sort(function(itemLeft, itemRight) { return itemLeft.publishDate > itemRight.publishDate ? -1 : itemLeft.publishDate < itemRight.publishDate ? 1 : 0; });
                return allItems;
            },
            deferEvaluation: true
        });

        self.loadTime = null;

        self.unreadQuantity = ko.computed({
            read: function() {
                var allUnreadQuantity = 0;
                feeds().forEach(function(feed) {
                    if (feed.userFeedId) {
                        allUnreadQuantity += feed.unreadQuantity();
                    }
                });
                return allUnreadQuantity;
            },
            deferEvaluation: true
        });

        self.showFeedTitle = true;
    }

    function ReaderViewModel(readerData) {
        var self = this;

        self.feeds = ko.observableArray();
        readerData.feeds.forEach(function(feedData) {
            self.feeds.push(new FeedViewModel(feedData));
        });

        self.feeds.unshift(new FeedAllViewModel(self.feeds));

        self.selectedFeed = ko.observable(self.feeds()[0]);

        self.newFeedUrl = ko.observable();
        self.addFeed = function() {

        };
    }

    return ReaderViewModel;
});