define(['Q', 'knockout', './SubscriptionViewModel', './SubscriptionAllViewModel', 'DataService/readerDataService'], function(Q, ko, SubscriptionViewModel, SubscriptionAllViewModel, readerDataService) {

    function ReaderViewModel(readerData) {
        var self = this;

        self.DEFAULT_IMAGE_URL = './Content/feed.png';

        // subscriptions
        self.subscriptions = ko.observableArray([]);
        readerData.subscriptions.forEach(function(subscriptionData) {
            self.subscriptions.push(new SubscriptionViewModel(subscriptionData, self));
        });
        var subscriptionAll = new SubscriptionAllViewModel(self.subscriptions, self);
        self.subscriptions.unshift(subscriptionAll);

        self.selectedSubscription = ko.observable(subscriptionAll);

        // new feed subscription
        self.newFeedUrl = ko.observable(null);
        self.addSubscription = function() {
            self.addSubscription.isEnabled(false);
            readerDataService.addSubscription(self.newFeedUrl())
                .then(function(data) {
                    self.subscriptions.push(new SubscriptionViewModel(data, self));
                    self.newFeedUrl(null);
                })
                .catch(function(err) {
                    self.addAlert('New feed URL: ' + err.message);
                })
                .finally(function() {
                    self.addSubscription.isEnabled(true);
                });
        };
        self.addSubscription.isEnabled = ko.observable(true);

        // alerts
        self.alerts = ko.observableArray([]);
        self.addAlert = function(message) {
            self.alerts.push({ message: message });
        };
        self.removeAlert = function(alert) { self.alerts.remove(alert); };

        // responsive methods
        self.isSmall = ko.observable();

        self.selectingFeedInSmall = ko.observable(false);
        self.toggleSelectingFeedInSmall = function() {
            self.selectingFeedInSmall(!self.selectingFeedInSmall());
        };

        self.selectedSubscription.subscribe(function() {
            if (self.selectingFeedInSmall()) {
                self.toggleSelectingFeedInSmall();
            }
        });

        // refresh all subscriptions in parallel
        subscriptionAll.refresh();
    }

    return ReaderViewModel;
});