define(['Q', 'knockout', './UserFeedViewModel', './UserFeedAllViewModel', 'DataService/readerDataService'], function(Q, ko, UserFeedViewModel, UserFeedAllViewModel, readerDataService) {

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

        // refresh all feeds in parallel
        self.refreshAllUserFeeds = function() {
            self.userFeeds().forEach(function(userFeed) {
                if (userFeed.userFeedId) {
                    userFeed.refresh();
                }
            });
        };
        self.refreshAllUserFeeds();
    }

    return ReaderViewModel;
});