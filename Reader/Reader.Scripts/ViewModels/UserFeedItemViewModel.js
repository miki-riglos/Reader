define(['knockout', 'DataService/readerDataService'], function(ko, readerDataService) {

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
                updateUserFeedItem(userFeedItem);
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
            var userFeedItem = {
                userFeedItemId: self.userFeedItemId,
                isRead: isRead
            };
            return updateUserFeedItem(userFeedItem);
        }

        function updateUserFeedItem(userFeedItem) {
            return readerDataService.updateUserFeedItem(userFeedItem)
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

    return UserFeedItemViewModel;
});