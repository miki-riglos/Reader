define(['Q', 'knockout', './SubscriptionViewModel', './SubscriptionAllViewModel', 'DataService/readerDataService'], function(Q, ko, SubscriptionViewModel, SubscriptionAllViewModel, readerDataService) {

    function ReaderViewModel(readerData) {
        var self = this;

        // subscriptions
        self.subscriptions = ko.observableArray([]);
        readerData.subscriptions.forEach(function(subscriptionData) {
            self.subscriptions.push(new SubscriptionViewModel(subscriptionData, self));
        });
        self.subscriptions.unshift(new SubscriptionAllViewModel(self.subscriptions));

        self.selectedSubscription = ko.observable(self.subscriptions()[0]);

        // edit mode
        self.editMode = ko.observable(false);
        self.toggleEditMode = function() {
            self.editMode(!self.editMode());
        };

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

        // refresh all subscriptions in parallel
        self.refreshAllSubscriptions = function() {
            self.subscriptions().forEach(function(subscription) {
                if (subscription.subscriptionId) {
                    subscription.refresh();
                }
            });
        };
        self.refreshAllSubscriptions();
    }

    return ReaderViewModel;
});