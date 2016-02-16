require.config({
    paths: {
        'text': '../Scripts/text',
        'knockout': '../Scripts/knockout-3.4.0.debug',
        'Q': '../Scripts/q',
    }
});

define('jquery', function() { return jQuery; });    // already loaded in _layout.cshtml

require(['knockout', 'jquery', 'readerData', 'ViewModels/ReaderViewModel', 'Extensions/registerBindings'], function(ko, $, readerData, ReaderViewModel) {
    var readerViewModel = new ReaderViewModel(readerData);

    // small device
    var updateIsSmall = function() {
        readerViewModel.isSmall($('#selectFeedButton').is(':visible'));
    };
    // ... update when window resizes
    $(window).resize(updateIsSmall);
    updateIsSmall();

    // document title
    var baseDocumentTitle = document.title;
    var updateDocumentTitle = function(unreadQuantity) {
        document.title = baseDocumentTitle + (unreadQuantity ? ' (' + unreadQuantity + ')' : '');
    };

    // ... update title when unread quantity changes
    var subscriptionAll = readerViewModel.subscriptions()[0];
    subscriptionAll.unreadQuantity.subscribe(updateDocumentTitle);
    updateDocumentTitle(subscriptionAll.unreadQuantity());


    ko.applyBindings(readerViewModel, document.getElementById('readerApp'));
});
