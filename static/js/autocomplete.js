(function ($) {
    const $d = $(document);

    let methods = {
        init: function (options) {

            //Настройки
            let settings = $.extend({
                min: 1,
                ajaxMethod: 'GET',
                ajaxWait: 600,
                ajaxUrl: undefined,
                defaultList: undefined
            }, options);

            return this.each(function() {
                const $input = $(this);
                let timer;

                if ($input[0].tagName !== 'INPUT') {
                    console.error('Попытка привязать autoComplete не к input тэгу');
                    return;
                }

                $input.attr('autocomplete', 'off');

                if (settings.defaultList) {
                    // Сконвертируем список значений по умолчанию, в список объектов с полем name, если нам передан список строк
                    const convertedList = [];
                    settings.defaultList.forEach(function(entry) {
                        if (typeof entry === 'string' || entry instanceof String) {
                            convertedList.push({
                                name: entry
                            });
                        } else {
                            convertedList.push(entry);
                        }
                    });
                    settings.defaultList = convertedList;
                }

                const ul = '<ul class="ac__list hidden"></ul>';
                $input.after(ul);

                $input.click(function () {
                    const val = $input.val();
                    if (val.length === 0 && settings.defaultList !== undefined) {
                        newList($input, settings.defaultList);
                    }
                });

                $input.keyup(function (e) {
                    const val = $input.val();

                    if (val.length === 0) {
                        if (settings.defaultList) {
                            if (timer) {
                                clearTimeout(timer);
                                timer = undefined;
                            }
                            newList($input, settings.defaultList);
                        } else {
                            if (timer) clearTimeout(timer);
                            timer = setTimeout(onTimer, settings.ajaxWait);
                        }
                    } else if (e.keyCode === 8 || e.keyCode === 46) {
                        if (timer) clearTimeout(timer);
                        timer = setTimeout(onTimer, settings.ajaxWait);
                    } else {
                        filter($input);

                        if (timer) clearTimeout(timer);
                        timer = setTimeout(onTimer, settings.ajaxWait);
                    }
                });

                $d.on('click', '.ac__item', function () {
                    const $this = $(this);
                    $input.val($this.text());
                    $this.closest('.ac__list').addClass('hidden');
                });

                function buildItem(item) {
                    if (!item || !item.name) return undefined;

                    let result = '<li class="ac__item"';
                    for (let key in item) {
                        if (item.hasOwnProperty(key) && key !== 'name') {
                            result = result + ' data-' + key + '="' + item[key] + '"';
                        }
                    }
                    result += '>';
                    result += (item.name + '</li>');

                    return result;
                }

                function newList(input, arr) {
                    let el, li;
                    let newList = [];
                    for (el of arr) {
                        li = buildItem(el);
                        if (li) newList += li;
                    }
                    input.siblings('.ac__list').removeClass('hidden').html(newList);
                }

                function filter(element) {
                    let value = $(element).val();

                    $(".ac__list > li").each(function() {
                        const $this = $(this);

                        if ($this.text().toLowerCase().search(value.toLowerCase()) > -1) {
                            $this.show();
                        } else {
                            $this.hide();
                        }
                    });
                }

                function onTimer() {
                    const val = $input.val();

                    if (val.length < settings.min) return;
                    if (!settings.ajaxUrl) return;

                    ajax(settings.ajaxMethod, settings.ajaxUrl, {s: val}, 'json', function (response) {
                        onAjaxSuccess(response);
                    }, function (xhr) {
                        onAjaxFailure(xhr);
                    });
                }

                function onAjaxSuccess(response) {
                    if (response && response.list) {
                        newList($input, response.list);
                    } else {
                        $input.siblings('.ac__list').find('li').remove();
                    }
                }

                function onAjaxFailure(xhr) {

                }
            });
        },

        destroy: function () {
            return this.each(function() {
                const $this = $(this);
                //console.log('autoComplete - destroyed');
            });
        }
    };

    $.fn.autoComplete = function(method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.autoComplete');
        }

    };

})(jQuery);