define(['knockout', './UserFeedItemViewModel', 'DataService/readerDataService'], function(ko, UserFeedItemViewModel, readerDataService) {

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

    return UserFeedViewModel;
});