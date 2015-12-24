define(['Q', 'jquery'], function(Q, $) {

    function request(uri, method, data) {
        var deferred = Q.defer();
        $.ajax({
            type: method,
            url: uri,
            dataType: 'json',
            contentType: 'application/json',
            traditional: true,  // array serialization: arr[1,2] => arr=1&arr=2 (MVC default model binding)
            data: data,
            success: function(data, textStatus, jqXHR) {
                deferred.resolve(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                var err = { message: errorThrown || textStatus };
                if (jqXHR.responseJSON) {
                    err.message = jqXHR.responseJSON.exceptionMessage || jqXHR.responseJSON.message;
                }
                deferred.reject(err);
            }
        });
        return deferred.promise;
    }

    return request;
});
