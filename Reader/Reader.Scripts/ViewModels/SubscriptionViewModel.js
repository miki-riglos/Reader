define(['Q', 'knockout', './SubscriptionItemViewModel', 'DataService/readerDataService'], function(Q, ko, SubscriptionItemViewModel, readerDataService) {

    function SubscriptionViewModel(subscriptionData, readerViewModel) {
        var self = this;
        self.subscriptionId = subscriptionData.subscriptionId;
        self.title = ko.observable(subscriptionData.title);
        self.imageUrl = ko.observable(subscriptionData.imageUrl);

        self.items = ko.observableArray();
        subscriptionData.items.forEach(function(itemData) {
            self.items.push(new SubscriptionItemViewModel(itemData, subscriptionData.title));
        });

        self.unreadQuantity = ko.computed(function() {
            return self.items().filter(function(item) { return !item.isRead(); }).length;
        });

        self.showFeedTitle = false;

        // refresh
        self.refresh = function() {
            readerViewModel.alert(null);
            self.refresh.isEnabled(false);
            return readerDataService.refreshSubscription(self.subscriptionId)
                .then(function(data) {
                    self.title(data.title);
                    self.imageUrl(data.imageUrl);
                    data.items.reverse().forEach(function(itemData) {
                        if (self.items().filter(function(item) { return item.subscriptionItemId === itemData.subscriptionItemId; }).length === 0) {
                            self.items.unshift(new SubscriptionItemViewModel(itemData, subscriptionData.title));
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

        // update all items as read sequentially
        self.updateItemsAsRead = function() {
            var promise = Q();
            readerViewModel.alert(null);
            self.updateItemsAsRead.isEnabled(false);
            self.items().forEach(function(item) {
                if (!item.isRead()) {
                    promise = promise.then(function() {
                        return item.updateIsRead(true);
                    });
                }
            });
            promise.then(function() {
                self.updateItemsAsRead.isEnabled(true);
            });
        };
        self.updateItemsAsRead.isEnabled = ko.observable(true);

        // load more items
        self.loadItems = function() {
            readerViewModel.alert(null);
            self.loadItems.isEnabled(false);
            readerDataService.loadSubscriptionItems(self.subscriptionId, self.items().length)
                .then(function(data) {
                    data.forEach(function(itemData) {
                        self.items.push(new SubscriptionItemViewModel(itemData, self.title));
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
            readerDataService.deleteSubscription(self.subscriptionId)
                .then(function(data) {
                    readerViewModel.selectedSubscription(readerViewModel.subscriptions()[0]);
                    readerViewModel.subscriptions.remove(self);
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

    return SubscriptionViewModel;
});