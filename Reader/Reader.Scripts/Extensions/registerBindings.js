define(['knockout', 'jquery'], function(ko, $) {

    var duration = 300;

    // animatedForeach
    ko.bindingHandlers.animatedForeach = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var result = ko.bindingHandlers['foreach'].init(element, valueAccessor, allBindings, viewModel, bindingContext);
            return result;
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var newValueAccessor = function() {
                return {
                    data: ko.unwrap(valueAccessor()),
                    afterAdd: function(elem) {
                        if (elem.nodeType === 1) $(elem).hide().slideDown(duration);
                    },
                    beforeRemove: function(elem) {
                        if (elem.nodeType === 1) $(elem).slideUp(duration, function() { $(elem).remove(); });
                    }
                };
            };
            var result = ko.bindingHandlers['foreach'].update(element, newValueAccessor, allBindings, viewModel, bindingContext);
            return result;
        }
    };

    // animatedVisible
    ko.bindingHandlers.animatedVisible = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor());
            if (value) {
                $(element).show();
            } else {
                $(element).hide();
            }
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = ko.unwrap(valueAccessor());
            if (value) {
                $(element).slideDown(duration);
            } else {
                $(element).slideUp(duration);
            }
        }
    };
});
