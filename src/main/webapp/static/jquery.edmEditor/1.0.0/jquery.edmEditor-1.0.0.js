(function ($) {
    $.fn.edmEditor = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('[jquery.edmEditor] Method ' + method + ' does not exist on jquery.edmEditor');
        }
    };
    
    var edmEditor = {
        isDependenciesChecked: false,
        settingsHtml: '',
        defaultStyles: ''
    };
    
    edmEditor.DEFAULTS = {
        snippetsUrl: '',
        snippetsHandlersUrl: '',
        iframeMode: false,
        contentStyles: [],
        allGroups: [],
        edmBackground: '#fafafa',
        edmPaddingTop: '20',
        edmPaddingBottom: '20',
        edmPaddingLeft: '20',
        edmPaddingRight: '20',
        bodyBackground: '#ffffff',
        textColor: '#333333',
        linkColor: '#337ab7',
        fontFamily: 'Arial, Helvetica, san-serif',
        fontSize: '14',
        lineHeight: '1.42857143'
    };
    
    edmEditor.dependScripts = [
        '/static/jquery-ui/1.12.1-noui/jquery-ui.min.js',
        '/theme/toolbars.js',
        '/static/ckeditor456/ckeditor.js',
        '/static/ckeditor456/adapters/jquery.js',
        '/static/keditor/dist/js/keditor-0.0.0.min.js',
        '/static/keditor/dist/js/keditor-edm-components-0.0.0.js',
        '/static/jquery.mselect/1.1.0/jquery.mselect-1.1.0.js'
    ];
    
    edmEditor.dependStyles = [
        '/static/keditor/dist/css/keditor-0.0.0.min.css',
        '/static/keditor/dist/css/keditor-bootstrap-settings-0.0.0.min.css',
        '/static/keditor/dist/css/keditor-edm-components-0.0.0.min.css',
        '/static/font-awesome/4.7.0/css/font-awesome.min.css',
        '/static/jquery.edmEditor/1.0.0/jquery.edmEditor-1.0.0.css'
    ];
    
    edmEditor.checkDependencies = function (options, callback) {
        if (edmEditor.isDependenciesChecked) {
            callback();
        }
        
        if (options.iframeMode) {
            $.getStyleOnce(edmEditor.dependStyles[0]);
            if (!$.isArray(options.contentStyles)) {
                options.contentStyles = [];
            }
            
            $.each(edmEditor.dependStyles, function (i, style) {
                options.contentStyles.push({
                    href: style
                });
            });
        } else {
            $.each(edmEditor.dependStyles, function (i, style) {
                $.getStyleOnce(style);
            });
        }
        
        if (options.snippetsHandlersUrl) {
            edmEditor.dependScripts.push(options.snippetsHandlersUrl);
        }
        
        var requestSettings = $.ajax({
            url: '/static/jquery.edmEditor/1.0.0/jquery.edmEditorSettings-1.0.0.html',
            type: 'get',
            success: function (resp) {
                edmEditor.settingsHtml = resp;
            }
        });
        var requestStyles = $.ajax({
            url: '/static/jquery.edmEditor/1.0.0/jquery.edmEditorStyles-1.0.0.css',
            type: 'get',
            success: function (resp) {
                edmEditor.defaultStyles = resp;
            }
        });
        
        function loadScript(index) {
            $.getScriptOnce(edmEditor.dependScripts[index], function () {
                if (index === edmEditor.dependScripts.length - 1) {
                    $.when(requestSettings, requestStyles).done(function () {
                        edmEditor.isDependenciesChecked = true;
                        callback();
                    });
                } else {
                    loadScript(index + 1);
                }
            });
        }
        
        loadScript(0);
    };
    
    edmEditor.getPxValue = function (value) {
        if (value) {
            return value.replace('px', '');
        } else {
            return '';
        }
    };
    
    edmEditor.mergeStyleOptions = function (options, key, value) {
        if (value) {
            options[key] = value;
        }
    };
    
    edmEditor.processEdmContent = function (target, options) {
        var edmContent = target.is('textarea') ? target.val() : target.html();
        var fragment = $('<div />').html(edmContent);
        var edmHeaderContent = fragment.find('td#edm-header-td').html() || '';
        var edmBodyContent = fragment.find('td#edm-body-td').html() || '';
        var edmFooterContent = fragment.find('td#edm-footer-td').html() || '';
        
        var tdWrapper = fragment.find('td#edm-wrapper-td');
        edmEditor.mergeStyleOptions(options, 'edmBackground', tdWrapper.css('background-color'));
        edmEditor.mergeStyleOptions(options, 'edmPaddingTop', edmEditor.getPxValue(tdWrapper.css('padding-top')));
        edmEditor.mergeStyleOptions(options, 'edmPaddingBottom', edmEditor.getPxValue(tdWrapper.css('padding-bottom')));
        edmEditor.mergeStyleOptions(options, 'edmPaddingLeft', edmEditor.getPxValue(tdWrapper.css('padding-left')));
        edmEditor.mergeStyleOptions(options, 'edmPaddingRight', edmEditor.getPxValue(tdWrapper.css('padding-right')));
        
        var tdBody = fragment.find('td#edm-body-td');
        edmEditor.mergeStyleOptions(options, 'bodyBackground', tdBody.css('background-color'));
        
        var tableWrapper = fragment.find('table#edm-wrapper');
        edmEditor.mergeStyleOptions(options, 'fontFamily', tableWrapper.attr('data-font-family'));
        edmEditor.mergeStyleOptions(options, 'fontSize', tableWrapper.attr('data-font-size'));
        edmEditor.mergeStyleOptions(options, 'lineHeight', tableWrapper.attr('data-line-height'));
        edmEditor.mergeStyleOptions(options, 'textColor', tableWrapper.attr('data-text-color'));
        edmEditor.mergeStyleOptions(options, 'linkColor', tableWrapper.attr('data-link-color'));
        
        target[target.is('textarea') ? 'val' : 'html'](
            '<div id="edm-header">' + edmHeaderContent + '</div>' +
            '<div id="edm-body">' + edmBodyContent + '</div>' +
            '<div id="edm-footer">' + edmFooterContent + '</div>'
        );
        
        return fragment.find('style').html();
    };
    
    edmEditor.rgb2Hex = function (value) {
        var hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
        var hex = function (x) {
            return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
        }
        
        value = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return "#" + hex(value[1]) + hex(value[2]) + hex(value[3]);
    };
    
    edmEditor.initPaddingControl = function (target, onChange) {
        target.on('change', function () {
            var txt = $(this);
            var number = txt.val();
            if (isNaN(number) || +number < 0) {
                number = 0;
                this.value = number;
            }
            
            onChange.call(target, number);
        });
    };
    
    edmEditor.initSimpleColorPicker = function (target, onChange) {
        target.wrap('<div class="input-group"></div>');
        
        var previewer = $('<span class="input-group-addon" style="color: transparent;"><i class="fa fa-stop"></i></span>');
        target.before(previewer);
        previewer.css('color', target.val() || 'transparent');
        
        var getColor = function (color) {
            if (color) {
                previewer.css('color', color);
                color = edmEditor.rgb2Hex(previewer.css('color'));
            } else {
                previewer.css('color', 'transparent');
                color = '';
            }
            
            return color;
        };
        
        target.on({
            change: function () {
                var color = getColor(this.value);
    
                target.val(color);
    
                if (typeof onChange === 'function') {
                    onChange.call(target, color);
                }
            },
            update: function (e, color) {
                previewer.css('color', '');
                target.val(getColor(color));
            }
        });
    };
    
    /**
     * Avoid merging padding or margin values to shorthand or color converts to rgb
     * @param name
     * @param value
     * @param target
     */
    edmEditor.setStyles = function (name, value, target) {
        target.each(function () {
            var self = $(this);
            var styles = self.attr('style');
            styles = styles ? styles.split(';') : [];
            var isExisting = false;
            
            for (var i = 0; i < styles.length; i++) {
                var style = (styles[i] || '').trim();
                if (style.length > 0 && style.indexOf(':') !== -1) {
                    style = style.split(':');
                    
                    if (style[0].trim() === name) {
                        if (value) {
                            styles[i] = name + ':' + value;
                        } else {
                            styles.splice(i, 1);
                        }
                        
                        isExisting = true;
                    } else {
                        if (style[1].trim() === '') {
                            styles.splice(i, 1);
                        }
                    }
                } else {
                    styles.splice(i, 1);
                }
            }
            
            if (!isExisting && value) {
                styles.push(name + ':' + value);
            }
            
            self.attr('style', styles.join(';'));
        });
    };
    
    edmEditor.initDefaultComponentControls = function (form, keditor, options) {
        if (!options || !options.hidePadding) {
            form.prepend(
                '<div class="form-group">' +
                '   <div class="col-md-12">' +
                '       <label>Padding (in px)</label>' +
                '       <div class="row row-sm text-center">' +
                '           <div class="col-xs-4 col-xs-offset-4">' +
                '               <input type="number" value="" class="txt-padding form-control" data-css="padding-top" />' +
                '               <small>top</small>' +
                '           </div>' +
                '       </div>' +
                '       <div class="row row-sm text-center">' +
                '           <div class="col-xs-4">' +
                '               <input type="number" value="" class="txt-padding form-control" data-css="padding-left" />' +
                '               <small>left</small>' +
                '           </div>' +
                '           <div class="col-xs-4 col-xs-offset-4">' +
                '               <input type="number" value="" class="txt-padding form-control" data-css="padding-right" />' +
                '               <small>right</small>' +
                '           </div>' +
                '       </div>' +
                '       <div class="row row-sm text-center">' +
                '           <div class="col-xs-4 col-xs-offset-4">' +
                '               <input type="number" value="" class="txt-padding form-control" data-css="padding-bottom" />' +
                '               <small>bottom</small>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>'
            );
    
            form.find('.txt-padding').each(function () {
                var input = $(this);
                var dataCss = input.attr('data-css');
        
                edmEditor.initPaddingControl(input, function (value) {
                    var component = keditor.getSettingComponent();
            
                    if (options && options.dynamicComponent) {
                        var dynamicElement = component.find('[data-dynamic-href]');
                
                        component.attr('data-' + dataCss, value);
                        keditor.initDynamicContent(dynamicElement);
                    } else {
                        var tdWrapper = component.find('td.wrapper');
                        edmEditor.setStyles(dataCss, value + 'px', tdWrapper);
                    }
            
                    if (options && typeof options.onPaddingChanged === 'function') {
                        options.onPaddingChanged.call(this, dataCss, value);
                    }
                });
            });
        }
        
        form.prepend(
            '<div class="form-group">' +
            '   <div class="col-md-12">' +
            '       <label>Background</label>' +
            '       <input type="text" value="" class="txt-bg-color form-control simple-color-picker" />' +
            '   </div>' +
            '</div>'
        );
        
        edmEditor.initSimpleColorPicker(form.find('.txt-bg-color'), function (color) {
            var component = keditor.getSettingComponent();
            if (options && options.dynamicComponent) {
                var dynamicElement = component.find('[data-dynamic-href]');
                
                component.attr('data-background-color', color);
                keditor.initDynamicContent(dynamicElement);
            } else {
                var tdWrapper = component.find('td.wrapper');
                tdWrapper.attr('bgcolor', color);
            }
            
            if (options && typeof options.onColorChanged === 'function') {
                options.onColorChanged.call(this, color);
            }
        });
    };
    
    edmEditor.showDefaultComponentControls = function (form, component, keditor) {
        var tdWrapper = component.find('td.wrapper');
        form.find('.txt-padding').each(function () {
            var input = $(this);
            var dataCss = input.attr('data-css');
            
            input.val(
                edmEditor.getPxValue(tdWrapper.css(dataCss))
            );
        });
        
        form.find('.txt-bg-color').val(tdWrapper.attr('bgcolor') || '');
    };
    
    edmEditor.applySetting = function (keditor, input) {
        var body = keditor.body;
        var dataCss = input.attr('data-css');
        var dataTarget = input.attr('data-target');
        var dataUnit = input.attr('data-unit') || '';
        
        if (dataTarget === 'style') {
            var styleTags = keditor.iframeHead.find('style');
            var previewStyle = styleTags.filter('#preview-style');
            if (previewStyle.length === 0) {
                previewStyle = $('<style id="preview-style" type="text/css"></style>')
                keditor.iframeHead.append(previewStyle);
            }
            
            var styleInputs = body.find('#edm-setting').find('[data-target=style]');
            var fontSize = styleInputs.filter('[data-css="font-size"]').val();
            var fontFamily = styleInputs.filter('[data-css="font-family"]').val();
            var lineHeight = styleInputs.filter('[data-css="line-height"]').val();
            var textColor = styleInputs.filter('[data-css="color"]').val();
            var linkColor = styleInputs.filter('[data-css="a-color"]').val();
            var previewStyleStr = '';
            previewStyleStr += 'body {font-size:' + fontSize + 'px;color:' + textColor + ';font-family:' + fontFamily + ';line-height:' + lineHeight + '}';
            previewStyleStr += 'a {color:' + linkColor + ';text-decoration:none;}';
            
            previewStyle.html(previewStyleStr);
        } else {
            var target = dataTarget === 'body' ? body : body.find(dataTarget);
            edmEditor.setStyles(dataCss, input.val() + dataUnit, target);
        }
    };
    
    edmEditor.applySettings = function (keditor) {
        var body = keditor.body;
        var settingPanel = body.find('#edm-setting');
        
        settingPanel.find('input').each(function () {
            edmEditor.applySetting(keditor, $(this));
        });
    };
    
    edmEditor.initSettingPanel = function (keditor, options) {
        flog('initSettingPanel');
        
        var body = keditor.body;
        var settingPanel = body.find('#edm-setting');
        
        $.each(options, function (key, value) {
            settingPanel.find('.' + key).val(value);
        });
        
        settingPanel.find('.simple-color-picker').each(function () {
            edmEditor.initSimpleColorPicker($(this), function () {
                edmEditor.applySetting(keditor, $(this));
            });
        });
        
        var settingInputs = settingPanel.find('input');
        settingInputs.not('.simple-color-picker').on('change', function () {
            edmEditor.applySetting(keditor, $(this));
        });
        
        edmEditor.applySettings(keditor);
    };
    
    edmEditor.initContainerSettings = function (form, keditor) {
        $.ajax({
            url: '/static/jquery.edmEditor/1.0.0/jquery.edmEditorContainerSettings-1.0.0.html',
            type: 'get',
            success: function (resp) {
                form.html(resp);
                
                var groupsOptions = '';
                var allGroups = keditor.options.allGroups;
                if ($.isArray(allGroups)) {
                    for (var name in allGroups) {
                        groupsOptions += '<div class="checkbox">';
                        groupsOptions += '    <label><input type="checkbox" value="' + name + '" />' + allGroups[name] + '</label>';
                        groupsOptions += '</div>';
                    }
                }
                
                var selectGroups = form.find('.select-groups');
                selectGroups.html(groupsOptions);
                var selectGroupsItems = selectGroups.find('input[type=checkbox]');
                
                selectGroupsItems.on('click', function () {
                    var selectedGroups = [];
                    selectGroupsItems.each(function () {
                        if (this.checked) {
                            selectedGroups.push(this.value);
                        }
                    });
                    
                    var container = keditor.getSettingContainer();
                    var table = container.find('.keditor-container-inner > table');
                    table.attr('data-groups', selectedGroups ? selectedGroups.join(',') : '');
                });
                
                form.find('.columns-setting').on('change', '.txt-padding', function () {
                    var txt = $(this);
                    var dataCss = txt.attr('data-css');
                    var number = txt.val();
                    if (isNaN(number) || +number < 0) {
                        number = 0;
                        this.value = number;
                    }
                    
                    var index = +txt.attr('data-index');
                    var container = keditor.getSettingContainer();
                    var column = container.find('[data-type=container-content]').eq(index);
                    edmEditor.setStyles(dataCss, number + 'px', column);
                    
                    // Handle width when padding is changed
                    column.find('[data-type^=component]').each(function () {
                        var component = $(this);
                        var dynamicElements = component.find('[data-dynamic-href]');
                        var componentWidth = component.width();
                        
                        if (dynamicElements.length > 0) {
                            component.attr('data-width', componentWidth);
                            dynamicElements.each(function () {
                                keditor.initDynamicContent($(this));
                            });
                        } else {
                            var componentType = keditor.getComponentType(component);
                            var componentData = $.keditor.components[componentType];
                            
                            if (typeof componentData.onWithChanged === 'function') {
                                componentData.onWithChanged.call(componentData, component, width, keditor);
                            }
                        }
                    });
                });
                
                edmEditor.initSimpleColorPicker(form.find('.txt-bg-color'), function (color) {
                    var container = keditor.getSettingContainer();
                    var target = container.find('.keditor-container-inner > table');
                    target.attr('bgcolor', color);
                });
            }
        });
    };
    
    edmEditor.showContainerSettings = function (form, container, keditor) {
        var table = container.find('.keditor-container-inner > table');
        
        var selectGroups = form.find('.select-groups');
        var selectGroupsItems = selectGroups.find('input[type=checkbox]');
        var selectedGroups = (table.attr('data-groups') || '').split(',');
        selectGroupsItems.prop('checked', false);
        $.each(selectedGroups, function (i, group) {
            selectGroupsItems.filter('[value="' + group + '"]').prop('checked', true);
        });
        
        var columnsSettings = form.find('.columns-setting');
        columnsSettings.html('');
    
        form.find('.txt-bg-color').val(table.attr('bgcolor') || '').trigger('update');
        
        container.find('[data-type=container-content]').each(function (i) {
            var column = $(this);
            
            edmEditor.generateColumnSettings(columnsSettings, column, i);
        });
    };
    
    edmEditor.generateColumnSettings = function (columnsSettings, column, i) {
        var settingHtml = '';
        settingHtml += '<div class="form-group">';
        settingHtml += '   <div class="col-md-12">';
        settingHtml += '       <p>Padding (in px)</p>';
        settingHtml += '       <div class="row row-sm text-center">';
        settingHtml += '           <div class="col-xs-4 col-xs-offset-4">';
        settingHtml += '               <input type="number" value="' + (column.prop('style')['paddingTop'] || '').replace('px', '') + '" class="txt-padding form-control" data-css="padding-top" data-index="' + i + '" />';
        settingHtml += '               <small>top</small>';
        settingHtml += '           </div>';
        settingHtml += '       </div>';
        settingHtml += '       <div class="row row-sm text-center">';
        settingHtml += '           <div class="col-xs-4">';
        settingHtml += '               <input type="number" value="' + (column.prop('style')['paddingLeft'] || '').replace('px', '') + '" class="txt-padding form-control" data-css="padding-left" data-index="' + i + '" />';
        settingHtml += '               <small>left</small>';
        settingHtml += '           </div>';
        settingHtml += '           <div class="col-xs-4 col-xs-offset-4">';
        settingHtml += '               <input type="number" value="' + (column.prop('style')['paddingRight'] || '').replace('px', '') + '" class="txt-padding form-control" data-css="padding-right" data-index="' + i + '" />';
        settingHtml += '               <small>right</small>';
        settingHtml += '           </div>';
        settingHtml += '       </div>';
        settingHtml += '       <div class="row row-sm text-center">';
        settingHtml += '           <div class="col-xs-4 col-xs-offset-4">';
        settingHtml += '               <input type="number" value="' + (column.prop('style')['paddingBottom'] || '').replace('px', '') + '" class="txt-padding form-control" data-css="padding-bottom" data-index="' + i + '" />';
        settingHtml += '               <small>bottom</small>';
        settingHtml += '           </div>';
        settingHtml += '       </div>';
        settingHtml += '   </div>';
        settingHtml += '</div>';
        
        columnsSettings.append(
            (i > 0 ? '<hr />' : '') +
            '<div class="column-setting">' +
            '   <strong>Column #' + (i + 1) + '</strong>' + settingHtml +
            '</div>'
        );
    };
    
    var methods = {
        init: function (options) {
            options = $.extend({}, edmEditor.DEFAULTS, options);
            
            return $(this).each(function () {
                var target = $(this);
                var edmStyle = edmEditor.processEdmContent(target, options);
                
                edmEditor.checkDependencies(options, function () {
                    options.contentStyles.push({
                        id: 'edm-base-style',
                        content: edmStyle || edmEditor.defaultStyles
                    });
                    
                    target.keditor({
                        niceScrollEnabled: false,
                        tabContainersText: '<i class="fa fa-columns"></i>',
                        tabComponentsText: '<i class="fa fa-files-o"></i>',
                        snippetsUrl: options.snippetsUrl,
                        tabTooltipEnabled: false,
                        snippetsTooltipEnabled: false,
                        allGroups: options.allGroups,
                        iframeMode: options.iframeMode,
                        contentAreasSelector: '#edm-header, #edm-body, #edm-footer',
                        contentAreasWrapper: '<div id="edm-area"></div>',
                        contentStyles: options.contentStyles,
                        extraTabs: {
                            setting: {
                                text: '<i class="fa fa-cog"></i>',
                                title: 'Settings',
                                content: edmEditor.settingsHtml
                            }
                        },
                        onBeforeDynamicContentLoad: function (dynamicElement, component) {
                            var containerInner = dynamicElement.closest('[data-type=container-content]');
                            var width = containerInner.width();
                            
                            component.attr({
                                'data-width': width
                            });
                        },
                        onInitContentArea: function (contentArea) {
                            contentArea[contentArea.children().length === 0 ? 'addClass' : 'removeClass']('empty');
                            
                            return contentArea.find('> table');
                        },
                        onContentChanged: function (e, contentArea) {
                            var body = this.body;
                            
                            if (!body.hasClass('content-changed')) {
                                body.addClass('content-changed');
                            }
                            
                            contentArea[contentArea.children().length === 0 ? 'addClass' : 'removeClass']('empty');
                        },
                        onReady: function () {
                            edmEditor.initSettingPanel(this, options);
                        },
                        containerSettingEnabled: true,
                        containerSettingInitFunction: edmEditor.initContainerSettings,
                        containerSettingShowFunction: edmEditor.showContainerSettings
                    });
                });
            });
        },
        
        getContent: function () {
            var target = $(this);
            var keditor = target.data('keditor');
            var body = keditor.body;
            var edmHtml = target.keditor('getContent', true);
            var edmHeader = edmHtml[0];
            var edmBody = edmHtml[1];
            var edmFooter = edmHtml[2];
            
            var fragment = $('<div />').html(
                '<table cellpadding="0" cellspacing="0" border="0" width="100%" id="edm-wrapper">' +
                '    <tbody>' +
                '        <tr>' +
                '            <td id="edm-wrapper-td" align="center">' +
                '                <table cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;" id="edm-container">' +
                '                    <tbody>' +
                '                        <tr>' +
                '                            <td>' +
                '                                <table cellpadding="0" cellspacing="0" border="0" width="100%" id="edm-header" align="center">' +
                '                                    <tbody>' +
                '                                        <tr>' +
                '                                            <td id="edm-header-td">' + edmHeader + '</td>' +
                '                                        </tr>' +
                '                                    </tbody>' +
                '                                </table>' +
                '                                <table cellpadding="0" cellspacing="0" border="0" width="100%" id="edm-body" align="center">' +
                '                                    <tbody>' +
                '                                        <tr>' +
                '                                            <td id="edm-body-td">' + edmBody + '</td>' +
                '                                        </tr>' +
                '                                    </tbody>' +
                '                                </table>' +
                '                                <table cellpadding="0" cellspacing="0" border="0" width="100%" id="edm-footer" align="center">' +
                '                                    <tbody>' +
                '                                        <tr>' +
                '                                            <td id="edm-footer-td">' + edmFooter + '</td>' +
                '                                        </tr>' +
                '                                    </tbody>' +
                '                                </table>' +
                '                            </td>' +
                '                        </tr>' +
                '                    </tbody>' +
                '                </table>' +
                '            </td>' +
                '        </tr>' +
                '    </tbody>' +
                '</table>'
            );
            
            var fontFamily = body.find('#edm-font-family').val() || '';
            var fontSize = body.find('#edm-font-size').val() || '';
            var lineHeight = body.find('#edm-line-height').val() || '';
            var textColor = body.find('#edm-text-color').val() || '';
            var linkColor = body.find('#edm-link-color').val() || '';
            
            // Set background color for edm and store base styles in #edm-wrapper
            fragment.find('#edm-wrapper').attr({
                'data-font-family': fontFamily,
                'data-font-size': fontSize,
                'data-line-height': lineHeight,
                'data-text-color': textColor,
                'data-link-color': linkColor,
                'bgcolor': body.find('#edm-background').val()
            });
            
            // Set base styles for dynamic components
            fragment.find('[data-dynamic-href]').each(function () {
                $(this).closest('[data-type]').attr({
                    'data-font-family': fontFamily,
                    'data-font-size': fontSize,
                    'data-line-height': lineHeight,
                    'data-text-color': textColor,
                    'data-link-color': linkColor,
                });
            });
            
            // Set outer padding for edm
            var edmWrapperTd = fragment.find('#edm-wrapper-td');
            edmEditor.setStyles('padding-top', body.find('#edm-padding-top').val() + 'px', edmWrapperTd);
            edmEditor.setStyles('padding-bottom', body.find('#edm-padding-bottom').val() + 'px', edmWrapperTd);
            edmEditor.setStyles('padding-left', body.find('#edm-padding-left').val() + 'px', edmWrapperTd);
            edmEditor.setStyles('padding-right', body.find('#edm-padding-right').val() + 'px', edmWrapperTd);
            
            // Set background color for edm body
            fragment.find('#edm-body').attr({
                'bgcolor': body.find('#edm-body-background').val()
            });
            
            var styleInputs = body.find('#edm-setting').find('[data-target=style]');
            var fontSize = styleInputs.filter('[data-css="font-size"]').val();
            var fontFamily = styleInputs.filter('[data-css="font-family"]').val();
            var lineHeight = styleInputs.filter('[data-css="line-height"]').val();
            var textColor = styleInputs.filter('[data-css="color"]').val();
            var linkColor = styleInputs.filter('[data-css="a-color"]').val();
            
            fragment.find('td.text-wrapper').each(function () {
                var textWrapper = $(this);
                edmEditor.setStyles('font-size', fontSize + 'px', textWrapper);
                edmEditor.setStyles('color', textColor, textWrapper);
                edmEditor.setStyles('font-family', fontFamily, textWrapper);
                edmEditor.setStyles('line-height', lineHeight, textWrapper);
                
                var links = textWrapper.find('a');
                edmEditor.setStyles('text-decoration', 'none', links);
                edmEditor.setStyles('color', linkColor, links);
            });
            
            return (
                '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">' +
                '<html xmlns="http://www.w3.org/1999/xhtml">' +
                '    <head>' +
                '        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
                '        <meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
                '        <title>Kademi EDM Title</title>' +
                '        <style type="text/css">' + keditor.iframeHead.find('#edm-base-style').html() + '</style>' +
                '    </head>' +
                '    <body>' +
                '        <center>' + fragment.html() + '</center>' +
                '    </body>' +
                '</html>'
            );
        }
    };
    
    $.edmEditor = edmEditor;
    
})(jQuery);