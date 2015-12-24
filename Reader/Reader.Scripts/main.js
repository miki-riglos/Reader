require.config({
    paths: {
        'text': '../Scripts/text',
        'knockout': '../Scripts/knockout-3.4.0.debug',
        'Q': '../Scripts/q',
    }
});

define('jquery', function() { return jQuery; });    // already loaded in _layout.cshtml

require(['knockout', 'readerData', 'ViewModels/ReaderViewModel'], function(ko, readerData, ReaderViewModel) {
    var readerViewModel = new ReaderViewModel(readerData);
    ko.applyBindings(readerViewModel, document.getElementById('readerApp'));
});
