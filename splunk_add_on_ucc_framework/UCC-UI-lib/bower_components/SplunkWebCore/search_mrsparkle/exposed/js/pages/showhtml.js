define(['jquery','prettify','routers/Base', './showhtml.pcss'], function ($, prettyPrint, BaseRouter, css) {

    $(function () {
        BaseRouter.prototype.setPageTitle($('h2').first().text());

        var sourceText = $('.prettyprint code').text(), selected = false;
        prettyPrint();

        $('.btn').click(function () {

            if (selected) {
                $('.btn').text('Select All');
                $('textarea').remove();
                $('.prettyprint').show();
            } else {
                $('.btn').text('Done');
                var pp = $('.prettyprint').hide();
                var txt = $('<textarea></textarea>').text(sourceText).insertAfter(pp);
                txt.css({ height: "1px" });
                txt.css({ height: (25+txt[0].scrollHeight)+"px" });
                txt.focus().select();
                document.scrollTop = 0;
            }
            selected = !selected;
        });

    });
});
