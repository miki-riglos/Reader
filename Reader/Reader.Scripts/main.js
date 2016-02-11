require.config({
    paths: {
        'text': '../Scripts/text',
        'knockout': '../Scripts/knockout-3.4.0.debug',
        'Q': '../Scripts/q',
    }
});

define('jquery', function() { return jQuery; });    // already loaded in _layout.cshtml

require(['knockout', 'readerData', 'ViewModels/ReaderViewModel'], function(ko, readerData, ReaderViewModel) {
    var baseDocumentTitle = document.title;
    var updateDocumentTitle = function(unreadQuantity) {
        document.title = baseDocumentTitle + (unreadQuantity ? ' (' + unreadQuantity + ')' : '');
    };

    var readerViewModel = new ReaderViewModel(readerData);
    // update document title when unread quantity changes
    var subscriptionAll = readerViewModel.subscriptions()[0];
    subscriptionAll.unreadQuantity.subscribe(updateDocumentTitle);
    // ... force 1st time
    updateDocumentTitle(subscriptionAll.unreadQuantity());

    ko.applyBindings(readerViewModel, document.getElementById('readerApp'));
});
