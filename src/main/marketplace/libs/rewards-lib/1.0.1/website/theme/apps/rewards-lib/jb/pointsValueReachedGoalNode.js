JBNodes['pointsValueReachedGoal'] = {
    icon: 'fa fa-exclamation',
    title: 'Points Value Reached',
    type: JB_NODE_TYPE.GOAL,
    ports: {
        timeoutNode: {
            label: 'timeout',
            title: 'When timeout',
            maxConnections: 1
        },
        nextNodeId: {
            label: 'then',
            title: 'When entered',
            maxConnections: 1
        }
    },

    settingEnabled: true,

    initSettingForm: function (form) {
        form.append(
            '<div class="form-group">' +
            '    <div class="col-md-12">' +
            '        <label>Trigger name</label>' +
            '        <select class="form-control promoName"></select>' +
            '    </div>' +
            '</div>' + JBApp.standardGoalSettingControls
        );

        $.ajax({
            url: '/rewards/_DAV/PROPFIND?fields=name,milton:title',
            type: 'get',
            dataType: 'json',
            success: function (resp) {
                var optionsStr = '<option value="">[No promotion selected]</option>';
                for (var i = 1; i < resp.length; i++) {
                    if( resp[i].name != "points") {
                        console.log("name", resp[i].name);
                        optionsStr += '<option value="' + resp[i].name + '">' + resp[i].title + '</option>';
                    }
                }

                form.find('.promoName').html(optionsStr);
            }
        });

        JBApp.initStandardGoalSettingControls(form);

        form.forms({
            allowPostForm: false,
            onValid: function () {
                var promoName = form.find('.promoName').val();
                JBApp.currentSettingNode.promoName = promoName || null;

                JBApp.saveStandardGoalSetting(form);

                JBApp.saveFunnel('Funnel is saved');
                JBApp.hideSettingPanel();
            }
        });
    },

    showSettingForm: function (form, node) {
        JBApp.showStandardGoalSettingControls(form, node);
        form.find('.promoName').val(node.promoName !== null ? node.promoName : '');
        JBApp.showSettingPanel(node);
    }
};
