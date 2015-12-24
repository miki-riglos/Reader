define(['Q', 'knockout', 'readerDataService'], function(Q, ko, readerDataService) {

    function UserFeedItemViewModel(userFeedItemData, feedTitle, readerViewModel) {
        var self = this;
        self.userFeedItemId = userFeedItemData.userFeedItemId;
        self.fullUrl = userFeedItemData.fullUrl;
        self.title = userFeedItemData.title;
        self.publishDate = userFeedItemData.publishDate.split('T')[0];

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
                        readerViewModel.alert(err.message);
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

    function UserFeedViewModel(userFeedData, readerViewModel) {
        var self = this;
        self.userFeedId = userFeedData.userFeedId;
        self.title = ko.observable(userFeedData.title);
        self.imageUrl = ko.observable(userFeedData.imageUrl);

        self.items = ko.observableArray();
        userFeedData.items.forEach(function(itemData) {
            self.items.push(new UserFeedItemViewModel(itemData, userFeedData.title));
        });

        self.unreadQuantity = ko.computed(function() {
            return self.items().filter(function(item) { return !item.isRead(); }).length;
        });

        self.showFeedTitle = false;

        // refresh
        self.refresh = function() {
            readerViewModel.alert(null);
            self.refresh.isEnabled(false);
            return readerDataService.refreshUserFeed(self.userFeedId)
                .then(function(data) {
                    self.title(data.title);
                    self.imageUrl(data.imageUrl);
                    data.items.reverse().forEach(function(itemData) {
                        if (self.items().filter(function(item) { return item.userFeedItemId === itemData.userFeedItemId; }).length === 0) {
                            self.items.unshift(new UserFeedItemViewModel(itemData, userFeedData.title));
                        }
                    });
                })
                .catch(function(err) {
                    readerViewModel.alert(err.message);
                })
                .finally(function() {
                    self.refresh.isEnabled(true);
                });
        };
        self.refresh.isEnabled = ko.observable(true);

        // load more items
        self.loadItems = function() {
            readerViewModel.alert(null);
            self.loadItems.isEnabled(false);
            readerDataService.loadUserFeedItems(self.userFeedId, self.items().length)
                .then(function(data) {
                    data.forEach(function(itemData) {
                        self.items.push(new UserFeedItemViewModel(itemData, self.title));
                    });
                })
                .catch(function(err) {
                    readerViewModel.alert(err.message);
                })
                .finally(function() {
                    self.loadItems.isEnabled(true);
                });
        };
        self.loadItems.isEnabled = ko.observable(true);

        // delete
        self.remove = function() {
            readerViewModel.alert(null);
            self.remove.isEnabled(false);
            readerDataService.deleteUserFeed(self.userFeedId)
                .then(function(data) {
                    readerViewModel.selectedUserFeed(readerViewModel.userFeeds()[0]);
                    readerViewModel.userFeeds.remove(self);
                })
                .catch(function(err) {
                    readerViewModel.alert(err.message);
                })
                .finally(function() {
                    self.remove.isEnabled(true);
                });
        };
        self.remove.isEnabled = ko.observable(true);
    }

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

    function ReaderViewModel(readerData) {
        var self = this;

        // user feeds
        self.userFeeds = ko.observableArray([]);
        readerData.userFeeds.forEach(function(userFeedData) {
            self.userFeeds.push(new UserFeedViewModel(userFeedData, self));
        });
        self.userFeeds.unshift(new UserFeedAllViewModel(self.userFeeds));

        self.selectedUserFeed = ko.observable(self.userFeeds()[0]);

        // edit mode
        self.editMode = ko.observable(false);
        self.toggleEditMode = function() {
            self.editMode(!self.editMode());
        };

        // new feed
        self.newUserFeedUrl = ko.observable(null);
        self.addUserFeed = function() {
            self.alert(null);
            self.addUserFeed.isEnabled(false);
            readerDataService.addUserFeed(self.newUserFeedUrl())
                .then(function(data) {
                    self.userFeeds.push(new UserFeedViewModel(data, self));
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

        // alert
        self.alert = ko.observable(null);
        self.clearAlert = function() {
            self.alert(null);
        };

        // refresh all feeds sequentially
        self.refreshAllUserFeeds = function() {
            var promise = Q();
            self.userFeeds().forEach(function(userFeed) {
                if (userFeed.userFeedId) {
                    promise = promise.then(function() {
                        return userFeed.refresh();
                    });
                }
            });
        };
        self.refreshAllUserFeeds();
    }

    return ReaderViewModel;
});