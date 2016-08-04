/*
 * Custom Clean Blog JavaScript
 */
$(function () {
    $('a[href="#search"]').on('click', function (event) {
        event.stopPropagation();
        event.preventDefault();
        $('#search').addClass('open');
        $('#form-search').find('input[type="search"]').focus();
    });

    $('#search, #search button.close').on('click keyup', function (event) {
        if (event.target == this || event.target.className == 'close' || event.keyCode == 27) {
            $(this).removeClass('open');
        }
    });

    $('#form-search').submit(function (event) {
        event.stopPropagation();
        event.preventDefault();
        var formSearch = $(this);
        var searchName = formSearch.find('input[type="search"]').val();
        if (searchName) {
            searchName = searchName.replace(/\s+/g, '+').toLowerCase();
            searchName = encodeURIComponent(searchName);
            window.location.href = formSearch.attr('action') + searchName + '/';
        }
        return false;
    })
});