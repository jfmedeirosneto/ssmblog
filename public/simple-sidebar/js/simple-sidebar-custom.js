/*
 * Custom Simple Sidebar JavaScript
 */

'use strict';

$(function () {
    $("a[id^='id_delete']").bind("click", function (event) {
        return confirm("Are you sure you want to delete?");
    });
    $("a[id^='id_publish']").bind("click", function (event) {
        return confirm("Are you sure you want to publish?");
    });
});
