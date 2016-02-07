define(['knockout', 'DataService/readerDataService'], function(ko, readerDataService) {

    function SubscriptionItemViewModel(subscriptionItemData, feedTitle, readerViewModel) {
        var self = this;
        self.subscriptionItemId = subscriptionItemData.subscriptionItemId;
        self.fullUrl = subscriptionItemData.fullUrl;
        self.title = subscriptionItemData.title;
        self.publishDate = subscriptionItemData.publishDate.split('T')[0];

        var _isRead = ko.observable(subscriptionItemData.isRead);
        self.isRead = ko.computed({
            read: _isRead,
            write: function() {
                self.isRead.isEnabled(false);
                var subscriptionItem = {
                    subscriptionItemId: self.subscriptionItemId,
                    isRead: !_isRead()
                };
                updateSubscriptionItem(subscriptionItem);
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

        self.updateIsRead = function(isRead) {
            var subscriptionItem = {
                subscriptionItemId: self.subscriptionItemId,
                isRead: isRead
            };
            return updateSubscriptionItem(subscriptionItem);
        }

        function updateSubscriptionItem(subscriptionItem) {
            return readerDataService.updateSubscriptionItem(subscriptionItem)
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
    }

    return SubscriptionItemViewModel;
});