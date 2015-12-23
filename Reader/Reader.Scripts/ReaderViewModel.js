define(['knockout', 'readerDataService'], function(ko, readerDataService) {

    function UserFeedItemViewModel(userFeedItemData, feedTitle) {
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
                var userFeedItem = {
                    userFeedItemId: self.userFeedItemId,
                    isRead: !_isRead()
                };
                readerDataService.updateUserFeedItem(userFeedItem)
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
            if (!_isRead()) {
                self.isRead(true);
            }
            return true;    // don't prevent default, allow click on anchor
        };
    }

    function UserFeedViewModel(userFeedData) {
        var self = this;
        self.userFeedId = userFeedData.userFeedId;
        self.title = userFeedData.title;
        self.imageUrl = userFeedData.imageUrl;
        
        self.items = ko.observableArray();
        userFeedData.items.forEach(function(itemData) {
            self.items.push(new UserFeedItemViewModel(itemData, userFeedData.title));
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

    function UserFeedAllViewModel(feeds) {
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

        // user feeds
        self.userFeeds = ko.observableArray([]);
        readerData.userFeeds.forEach(function(userFeedData) {
            self.userFeeds.push(new UserFeedViewModel(userFeedData));
        });
        self.userFeeds.unshift(new UserFeedAllViewModel(self.userFeeds));

        self.selectedUserFeed = ko.observable(self.userFeeds()[0]);

        // new feed
        self.newUserFeedUrl = ko.observable(null);
        self.addUserFeed = function() {
            self.alert(null);
            self.addUserFeed.isEnabled(false);
            readerDataService.addUserFeed(self.newUserFeedUrl())
                .then(function(data) {
                    self.userFeeds.push(new UserFeedViewModel(data));
                    self.newUserFeedUrl(null);
                })
                .catch(function(err) {
                    self.alert(err.message);
                })
                .finally(function() {
                    self.addUserFeed.isEnabled(true);
                });
        };
        self.addUserFeed.isEnabled = ko.observable(true);

        // delete feed
        self.deleteUserFeed = function() {
            self.alert(null);
            self.deleteUserFeed.isEnabled(false);
            var userFeedToDelete = self.selectedUserFeed();
            readerDataService.deleteUserFeed(userFeedToDelete.userFeedId)
                .then(function(data) {
                    self.selectedUserFeed(self.userFeeds()[0]);
                    self.userFeeds.remove(userFeedToDelete);
                })
                .catch(function(err) {
                    self.alert(err.message);
                })
                .finally(function() {
                    self.deleteUserFeed.isEnabled(true);
                });
        };
        self.deleteUserFeed.isEnabled = ko.observable(true);

        // alert
        self.alert = ko.observable(null);
        self.clearAlert = function() {
            self.alert(null);
        };
    }

    return ReaderViewModel;
});