$(function() {

    const $d = $(document);

    $.ajaxSetup({
        complete: function(xhr) {
            init();
        }
    });

    $d.on('mouseup', function (e){
        const $globEr = $('.global-error'),
            $modalEr = $('.errors-modal'),
            $modal = $('.st-modal__inner'),
            $modalLayer = $('.modal-layer');

        if (!$globEr.is(e.target) && $globEr.has(e.target).length === 0) {
            $modalEr.removeClass('opened');
            $globEr.remove();
        }
        if (!$modal.is(e.target) && $modal.has(e.target).length === 0) {
            $modalLayer.addClass('hidden');
        }

    });

    $d.on('click', '.st-btn__close', function (e) {
        e.preventDefault();
        const $this = $(this),
            $modal = $('.modal-layer');

        if ($this.closest($modal)) {
            $modal.addClass('hidden');

            if ($this.closest('#user-form')) {
                $('.user-companies__list li').remove();
                $('.user-companies__list input[type="hidden"]').remove();
                $('.user-companies').removeClass('hidden');
                $('.ac__list').addClass('hidden');
            }

        }

        if ($this.closest('#role-constructor-form')) {
            $this.find('.company').val('');
            $this.find('.partner').val('');
        }

        if ($this.closest('form').hasClass('st-modal__inner') === false) {
            $this.closest('form').addClass('hidden').find('.error-field, .global-error').remove();
            $this.closest('form')[0].reset();
        }

        if ($this.closest('#role-constructor-form')) {
            $('.list-item').remove();
        }

    });

    $d.on('change', '#middle-name-label', function () {
        const $this = $(this);
        let checked = $('#middle-name[type="checkbox"]').prop('checked');
        if (checked === true) {
            $this.closest('form').find('.middle-name').addClass('hidden').val('');
        } else if (checked === false){
            $this.closest('form').find('.middle-name').removeClass('hidden');
        }
    });

    $d.on('submit', '#change-pswd-form', function(e) {
        e.preventDefault();

        const $this = $(this);
        $this.find('.st-btn[type=submit]').prop('disabled', true).addClass('disabled');

        ajax('PUT', $this.attr('action'), $this.serialize(), 'json', function(response) {
            $this[0].reset();
            $this.find('.st-btn[type=submit]').prop('disabled', false).removeClass('disabled');
        }, function (xhr) {
            errorMessages(xhr, $this);
            $this.find('.st-btn[type=submit]').prop('disabled', false).removeClass('disabled');
        });

    });

    $d.on('click', '.global-error', function () {
        const $this = $(this);
        if ($this.parent().hasClass('errors-modal') === true) {
            $this.closest('.errors-modal').removeClass('opened');
        }
        $this.remove();
    });

    $d.on('submit', '.logout', function (e) {
        e.preventDefault();

        ajax('POST', '/logout', {}, 'json', function (response) {
            location.href = response.location;
        });
    });

    $d.on('click', '.document .st-card__menu .st-controls__menu-btn', function () {
        const $this = $(this);
        if ($this.siblings('.st-controls__menu-list').hasClass('opened') === false) {
            const docId = $this.attr('data-id');
            ajax("GET", '/docs/' + docId + '/actions', {}, 'html', function (response) {
                $this.siblings('.st-controls__menu-list')
                    .addClass('opened').show()
                    .find('.st-controls__wrapper').html(response);
            })
        } else {
            $this.siblings('.st-controls__menu-list').hide().removeClass('opened');
        }
    });

    $d.on('click', '.st-controls__menu-list button', function (e) {
        const $menu = $('.document .st-card__menu .st-controls__menu-btn');

        $menu.siblings('.st-controls__menu-list').hide();
        $menu.siblings('.st-controls__menu-list').removeClass('opened');
    });

    $d.on('click', '#doc-bind', function (e) {
        const $this = $(this);
        const $docLinkModal = $('#docLinkModal');

        const docId = $this.attr('data-docId');
        const data = {
            frag: true,
            excludeDocId: docId
        };

        $docLinkModal.removeClass('hidden');
        $docLinkModal.attr('data-docId', docId);

        ajax('GET', '/docs', data, 'html', function (response) {
            $('#binded-doc').html(response);
        });

    });

    $d.on('click', '.linkDocBtn', function (e) {
        const $this = $(this);
        e.preventDefault();

        const data = {
            firstDocument: $this.attr('data-sourceDocId'),
            secondDocument: $this.attr('data-docId')
        };

        ajax('POST', '/docLink', data, 'json', function () {
            $('#docLinkModal').addClass('hidden');
            alert('Документы успешно связаны');
        }, function (xhr) {
            errorMessages(xhr, $this);
        })
    });

});

function initGroup(elements, initer) {
    elements.each(function() {
        const $this = $(this);
        if ($this.data('inited')) return;

        initer($this);

        $this.data('inited', true);
    });
}

function init() {
    initGroup($('select'), function(e) {
        e.styler();
    });

    initGroup($('input[data-autocomplete]'), function (e) {
        if (e.hasClass('position')) {
            e.autoComplete({
                ajaxUrl: '/positions'
            });
        } else if (e.hasClass('position') === false && e.hasClass('bind-doc') === false) {
            e.autoComplete({
                defaultList: ['Директор', 'Генеральный директор']
            });
        } else if (e.hasClass('bind-doc') === true) {
            e.autoComplete({
                defaultList: ['Счёт', 'Счёт фактура']
            });
        }
    });

    initGroup($('input[data-mask]'), function (e) {
        e.inputmask({
            "mask": e.attr('data-mask'),
            "autoUnmask": true
        });
    });

    initGroup($('input[data-datepicker]'), function (e) {
        e.datepicker({
            timeFormat: e.attr('data-datepicker')
        })
    });

    initGroup($('input[data-dadata-type]'), function (e) {
        e.suggestions({
            token: "*",
            type: e.attr('data-dadata-type'),
            count: 5,
            onSelect: function (suggestion) {
                let data = suggestion.data;
                let sugValue = suggestion.value;
                if (!data) return;

                if(e.data('dadata-inn') !== '') {
                    let id = $("#"+ e.data('dadata-inn'));

                    if (data.inn) {
                        id.val(data.inn);
                    } else {
                        id.val('');
                    }
                }

                if (e.data('dadata-bic') !== '') {
                    let id = $("#"+ e.data('dadata-bic'));
                    if (data.bic) {
                        id.val(data.bic);
                    } else {
                        id.val('');
                    }
                }

                if (e.attr('id') === 'partner') {
                    let $fullAccess = $('#fullAccess');

                    e.siblings('.list').append('' +
                        '<li class="list-item">' +
                        '<p data-inn="' + data.inn + '">'+ sugValue +'</p>' +
                        '<span class="st-btn__clean"><i class="icon-cancel"></i></span>' +
                        '<input type="hidden" name="partnersRestriction" value="'+ data.inn +'">' +
                        '</li>');
                    e.val('');
                    if($fullAccess.prop('checked', true)) {
                        $fullAccess.prop('checked', false);
                    }
                } if (e.attr('id') === "party") {
                    $('.user-companies__list').append('' +
                        '<li>' +
                        '<div>' +
                        '<span>' + sugValue + '</span>' +
                        '<span>' + data.inn + '</span>' +
                        '<span>' + data.address.value + '</span>' +
                        '</div>' +
                        '<button class="st-btn st-btn__delete" title="Удалить"><i class="icon-trash"></i></button>' +
                        '<input type="hidden" name="companies" value="'+ data.inn + '">' +
                        '</li>');

                    $('.user-companies').val('');
                }
            }
        });
    });
}

//Ajax
function ajax(method, url, data, dataType, successHandler, failureHandler) {
    let processData = true;
    let contentType = 'application/x-www-form-urlencoded; charset=UTF-8';

    if (data instanceof FormData) {
        processData = false;
        contentType = false;
    } else if (method.toUpperCase() === 'DELETE') {
        if (data instanceof Object) {
            let newData = {};
            for (let prop in data) {
                if (data.hasOwnProperty(prop)) {
                    newData[prop] = data[prop];
                }
            }
            newData._method = 'DELETE';

            method = 'POST';
            data = newData;
        }
    }

    $.ajax({
        type: method,
        url: url,
        data: data,
        dataType: dataType,
        processData: processData,
        contentType: contentType,
        cache: false,
        success: function (response, textStatus, xhr) {
            if(xhr.responseText.indexOf('<!DOCTYPE html') === 0) {
                window.location.reload();
            } else {
                if (successHandler) successHandler(response);
            }
        },
        error: function (xhr) {
            if (failureHandler) {
                failureHandler(xhr);
            } else {
                alert('Системная ошибка, повторите операцию позже.');
            }
        }
    });
}

function errorMessages(xhr, form) {
    //удаляем предыдущие ошибки
    form.find('.error-field').fadeOut(200).remove();
    form.find('.global-error').fadeOut(200).remove();

    let response = xhr.responseJSON;

    if (response === undefined && xhr.responseText) {
        try {
            response = JSON.parse(xhr.responseText);
        } catch (e) {}
    }

    if (response && response.errors) {
        if (response.errors.global) {
            let global = response.errors.global;

            for (let key in global) {
                if (global.hasOwnProperty(key)){
                    let global = response.errors.global;
                    let globalErrorText = global[key].text;
                    let globalError = "<div class='global-error'>" + globalErrorText + "</div>";

                    form.append(globalError);
                    $('.global-error').fadeIn(300);
                }
            }
        }

        if (response.errors.field) {
            let field = response.errors.field;

            for (let key in field) {
                if (field.hasOwnProperty(key)) {
                    let formField = form.find("[name ='" + key + "']");

                    let errorText = field[key].text;

                    //формируем блок с текстом ошибки
                    let errorField = "<div class='error-field'>" + errorText + "</div>";

                    //Вставляем текст ошибки
                    formField.after(errorField);
                    $(".error-field").fadeIn(300);
                }
            }
        }

    }
}