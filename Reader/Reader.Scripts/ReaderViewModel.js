define(['knockout', 'readerDataService'], function(ko, readerDataService) {

    function FeedItemViewModel(userFeedItemData, feedTitle) {
        var self = this;
        self.userFeedItemId = userFeedItemData.userFeedItemId;
        self.fullUrl = userFeedItemData.fullUrl;
        self.title = userFeedItemData.title;
        // TODO: format date
        self.publishDate = userFeedItemData.publishDate;

        var _isRead = ko.observable(userFeedItemData.isRead);
        self.isRead = ko.computed({
            read: _isRead,
            write: function() {
                self.isRead.isEnabled(false);
                var feedItem = {
                    userFeedItemId: self.userFeedItemId,
                    isRead: !_isRead()
                }
                readerDataService.updateFeedItem(feedItem)
                    .then(function(data) {
                        _isRead(data.isRead);
                    })
                    .catch(function(err) {
                        console.log(err);
                    })
                    .finally(function() {
                        self.isRead.isEnabled(true);
                    });
            }
        });
        self.isRead.isEnabled = ko.observable(true);

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

        // update + refresh
        // load more items
        // delete
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

        // update + refresh all
    }

    function ReaderViewModel(readerData) {
        var self = this;

        // feeds
        self.feeds = ko.observableArray([]);
        readerData.feeds.forEach(function(feedData) {
            self.feeds.push(new FeedViewModel(feedData));
        });
        self.feeds.unshift(new FeedAllViewModel(self.feeds));

        self.selectedFeed = ko.observable(self.feeds()[0]);

        // new feed
        self.newFeedUrl = ko.observable(null);
        self.addFeed = function() {
            self.alert(null);
            self.addFeed.isEnabled(false);
            readerDataService.addFeed(self.newFeedUrl())
                .then(function(data) {
                    self.feeds.push(new FeedViewModel(data));
                    self.newFeedUrl(null);
                })
                .catch(function(err) {
                    self.alert(err.message);
                })
                .finally(function() {
                    self.addFeed.isEnabled(true);
                });
        };
        self.addFeed.isEnabled = ko.observable(true);

        // alert
        self.alert = ko.observable(null);
        self.clearAlert = function() {
            self.alert(null);
        };
    }

    return ReaderViewModel;
});