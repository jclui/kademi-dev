(function (w) {

    var searchOptions = {
        team: null,
        query: ''
    };

    var dataTable = null;

    function initDataTable(hits) {
        if (dataTable !== null) {
            dataTable.destroy(false);
        }

        var source = $("#lead-template").html();
        var template = Handlebars.compile(source);
        var t = template(hits);
        $('#leadBody').empty();
        $('#leadBody').html(t);

        dataTable = $('#leadTable').DataTable({
            paging: false,
            searching: false,
            destroy: true,
            info: false,
            order: [
                [7, 'desc']
            ],
            columns: [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                {"orderable": false}
            ]
        });
    }

    function initOrgSelect() {
        $('body').on('click', '.btn-select-org', function (e) {
            e.preventDefault();

            var btn = $(this);
            var b = btn.closest('div').find('.aggr-title');
            b.html(btn.html());

            var href = btn.attr('href');
            if (href === '#') {
                searchOptions.team = null;
            } else {
                searchOptions.team = href;
            }

            doSearch();
        });
    }

    function initSearchField() {
        $('body').on('change', '#leadQuery', function (e) {
            e.preventDefault();

            var inp = $(this);

            searchOptions.query = inp.val();

            doSearch();
        });
    }

    function doSearch() {
        $.ajax({
            url: window.location.pathname + '?sLead&' + $.param(searchOptions),
            dataType: 'JSON',
            success: function (data, textStatus, jqXHR) {
                $('#LeadTotal').html(data.hits.total);
                $('#LeadSumValue').html(data.aggregations.dealAmountTotal.value || 0);
                $('#leadAvgValue').html(data.aggregations.dealAmountAvg.value || 0);

                updateSourcesPie(data.aggregations.sources.buckets);
                updateStagesPie(data.aggregations.stages.buckets);
                initDataTable(data.hits);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                flog('error', jqXHR, textStatus, errorThrown);
            }
        });
    }

    function updateSourcesPie(buckets) {
        $('#stagesPie svg').empty();
        //Donut chart
        nv.addGraph(function () {
            var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.key;
                    })
                    .y(function (d) {
                        return d.doc_count;
                    })
                    .showLabels(false)
                    .showLegend(false)
                    .margin({
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    })
                    .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
                    .labelType("value")   //Configure what type of data to show in the label. Can be "key", "value" or "percent"
                    .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
                    .donutRatio(0.35)     //Configure how big you want the donut hole size to be.
                    ;

            d3.select("#stagesPie svg")
                    .datum(buckets)
                    .transition().duration(350)
                    .call(chart);

            return chart;
        });
    }

    function updateStagesPie(buckets) {
        $('#sourcesPie svg').empty();
        //Donut chart
        nv.addGraph(function () {
            var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.key;
                    })
                    .y(function (d) {
                        return d.doc_count;
                    })
                    .showLabels(false)
                    .showLegend(false)
                    .margin({
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    })
                    .labelThreshold(.05)  //Configure the minimum slice size for labels to show up
                    .labelType("value")   //Configure what type of data to show in the label. Can be "key", "value" or "percent"
                    .donut(true)          //Turn on Donut mode. Makes pie chart look tasty!
                    .donutRatio(0.35)     //Configure how big you want the donut hole size to be.
                    ;

            d3.select("#sourcesPie svg")
                    .datum(buckets)
                    .transition().duration(350)
                    .call(chart);

            return chart;
        });
    }

    w.initLeadManPage = function () {
        Handlebars.registerHelper('NotEmpty', function (conditional, options) {
            if (typeof conditional !== 'undefined' && typeof conditional.length !== 'undefined') {
                if (conditional.length > 0) {
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        });

        Handlebars.registerHelper('formatTime', function (object) {
            var d = new moment(object);

            return d.format('MMMM Do YYYY, h:mm:ss a');
        });

        initOrgSelect();
        initSearchField();
        doSearch();
    };
})(this);