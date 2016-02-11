define(['knockout', 'DataService/readerDataService'], function(ko, readerDataService) {

    function SubscriptionItemViewModel(subscriptionItemData, feedTitle, readerViewModel) {
        var self = this;
        self.subscriptionItemId = subscriptionItemData.subscriptionItemId;
        self.fullUrl = subscriptionItemData.fullUrl;
        self.title = subscriptionItemData.title;
        self.publishDate = subscriptionItemData.publishDate.split('T')[0];
        self.isRead = ko.observable(subscriptionItemData.isRead);

        self.feedTitle = feedTitle;

        self.markAsRead = function() {
            if (!self.isRead()) {
                self.toggleIsRead();
            }
            return true;    // don't prevent default, allow click on anchor
        };

        self.toggleIsRead = function() {
            var subscriptionItem = {
                subscriptionItemId: self.subscriptionItemId,
                isRead: !self.isRead()
            };
            self.toggleIsRead.isEnabled(false);
            return readerDataService.updateSubscriptionItem(subscriptionItem)
                    .then(function(data) {
                        self.isRead(data.isRead);
                    })
                    .catch(function(err) {
                        readerViewModel.addAlert(self.title + ': ' + err.message);
                    })
                    .finally(function() {
                        self.toggleIsRead.isEnabled(true);
                    });
        };
        self.toggleIsRead.isEnabled = ko.observable(true);
    }

    return SubscriptionItemViewModel;
});