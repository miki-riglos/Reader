define(['Q', 'knockout'], function(Q, ko) {

    function SubscriptionAllViewModel(subscriptions, readerViewModel) {
        var self = this;
        self.subscriptionId = null;
        self.title = 'ALL';
        self.imageUrl = readerViewModel.DEFAULT_IMAGE_URL;

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

        self.isSubscriptionAll = true;

        // edit mode
        self.editMode = ko.observable(false);
        self.toggleEditMode = function() {
            self.editMode(!self.editMode());
        };

        // refresh
        self.refresh = function() {
            var promises = [];
            self.refresh.isEnabled(false);
            subscriptions().forEach(function(subscription) {
                if (subscription.subscriptionId) {
                    promises.push(subscription.refresh());
                }
            });
            Q.allSettled(promises).finally(function() {
                self.refresh.isEnabled(true);
            });
        };
        self.refresh.isEnabled = ko.observable(true);

        // update all items as read in parallel
        self.updateItemsAsRead = function() {
            var promises = [];
            self.updateItemsAsRead.isEnabled(false);
            subscriptions().forEach(function(subscription) {
                if (subscription.subscriptionId) {
                    promises.push(subscription.updateItemsAsRead());
                }
            });
            Q.allSettled(promises).finally(function() {
                self.updateItemsAsRead.isEnabled(true);
            });
        };
        self.updateItemsAsRead.isEnabled = ko.observable(true);
    }

    return SubscriptionAllViewModel;
});