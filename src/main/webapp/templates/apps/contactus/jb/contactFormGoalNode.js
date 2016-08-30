JBNodes['contactFormGoal'] = {
    title: '<i class="fa fa-trophy"></i> <span class="node-type">Contact Form Goal</span>',
    previewUrl: '/theme/apps/contactus/jb/contactFormGoalNode.png',
    ports: {
        nextNodeId: {
            label: 'then',
            title: 'When completed',
            maxConnections: 1
        },
        timeoutNode: {
            label: 'timeout',
            title: 'When timeout',
            maxConnections: 1
        }
    },

    settingEnabled: true,

    initSettingForm: function (form) {
        form.append(
            '<div class="form-group">' +
            '    <div class="col-md-12">' +
            '        <label>Website</label>' +
            '        <select class="form-control websiteName"></select>' +
            '    </div>' +
            '</div>' +
            '<div class="form-group">' +
            '    <div class="col-md-12">' +
            '        <label>Contact form path</label>' +
            '        <input type="text" class="form-control contactFormPath" value="" />' +
            '    </div>' +
            '</div>' +
            '<div class="form-group">' +
            '    <div class="col-md-12">' +
            '        <label>Stage</label>' +
            '        <select class="form-control stageName"></select>' +
            '    </div>' +
            '</div>' +
            '<div class="form-group">' +
            '    <div class="col-md-12">' +
            '        <label>Timeout</label>' +
            '        <div class="input-group">' +
            '            <input type="number" class="form-control timeout-multiples numeric" />' +
            '            <div class="input-group-btn">' +
            '                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="timeout-units-preview"></span>' +
            '                    <span class="caret"></span>' +
            '                </button>' +
            '                <input type="hidden" class="timeout-units" value="" />' +
            '                <ul class="dropdown-menu dropdown-menu-right timeout-units-selector">' +
            '                    <li><a href="#" data-value="y">Years</a></li>' +
            '                    <li><a href="#" data-value="M">Months</a></li>' +
            '                    <li><a href="#" data-value="w">Weeks</a></li>' +
            '                    <li><a href="#" data-value="d">Days</a></li>' +
            '                    <li><a href="#" data-value="h">Hours</a></li>' +
            '                    <li><a href="#" data-value="m">Minutes</a></li>' +
            '                </ul>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>'
        );

        form.find('.timeout-units-selector li').on('click', function (e) {
            e.preventDefault();

            var a = $(this).find('a');
            var text = a.text().trim();
            var value = a.attr('data-value');

            form.find('.timeout-units').val(value);
            form.find('.timeout-units-preview').html(text);
        });

        $.ajax({
            url: '/websites/_DAV/PROPFIND?fields=name',
            type: 'get',
            dataType: 'json',
            success: function (resp) {
                var optionsStr = '<option value="">[No website selected]</option>';
                for (var i = 1; i < resp.length; i++) {
                    optionsStr += '<option value="' + resp[i].name + '">' + resp[i].name+ '</option>';
                }

                form.find('.websiteName').html(optionsStr);
            }
        });

        form.forms({
            allowPostForm: false,
            onValid: function () {
                var timeoutUnits = form.find('.timeout-units').val();
                var timeoutMultiples = form.find('.timeout-multiples').val();
                var contactFormPath = form.find('.contactFormPath').val();
                var websiteName = form.find('.websiteName').val();
                var stageName = form.find('.stageName').val();

                JBApp.currentSettingNode.timeoutUnits = timeoutUnits || null;
                JBApp.currentSettingNode.timeoutMultiples = timeoutMultiples || null;
                JBApp.currentSettingNode.contactFormPath = contactFormPath || null;
                JBApp.currentSettingNode.websiteName = websiteName || null;
                JBApp.currentSettingNode.stageName = stageName || null;

                JBApp.saveFunnel('Funnel is saved');
                JBApp.hideSettingPanel();
            }
        });
    },

    showSettingForm: function (form, node) {
        if (node.timeoutUnits !== null) {
            form.find('.timeout-units-selector li a').filter('[data-value=' + node.timeoutUnits + ']').trigger('click');
        } else {
            form.find('.timeout-units').val('');
            form.find('.timeout-units-preview').html('');
        }

        var stagesOptionStr = '<option value="">[No stage selected]</option>';
        if (JBApp.funnel.stages && $.isArray(JBApp.funnel.stages)) {
            for (var i = 0; i < JBApp.funnel.stages.length; i++) {
                stagesOptionStr += '<option value="' + JBApp.funnel.stages[i].name + '">' + JBApp.funnel.stages[i].desc + '</option>';
            }
        }
        form.find('.stageName').html(stagesOptionStr).val(node.timeoutMultiples !== null ? node.timeoutMultiples : '');

        form.find('.timeout-multiples').val(node.timeoutMultiples !== null ? node.timeoutMultiples : '');
        form.find('.contactFormPath').val(node.contactFormPath || '');
        form.find('.websiteName').val(node.websiteName || '');

        JBApp.showSettingPanel(node);
    }
};
