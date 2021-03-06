/**
 * Data grid is a simple widget designed to list the filtered records, providing
 * a simple way to define how the items are displayed.
 *
 *
 * Note: Formerly the data grid chart (and data table) used the {@link dc.dataGrid#group group} attribute as a
 * keying function for {@link https://github.com/d3/d3-collection/blob/master/README.md#nest nesting} the data
 * together in sections.  This was confusing so it has been renamed to `section`, although `group` still works.
 *
 * Examples:
 * - {@link http://europarl.me/dc.js/web/ep/index.html List of members of the european parliament}
 * @class dataGrid
 * @memberof dc
 * @mixes dc.baseMixin
 * @param {String|node|d3.selection} parent - Any valid
 * {@link https://github.com/d3/d3-selection/blob/master/README.md#select d3 single selector} specifying
 * a dom block element such as a div; or a dom element or d3 selection.
 * @param {String} [chartGroup] - The name of the chart group this chart instance should be placed in.
 * Interaction with a chart will only trigger events and redraws within the chart's group.
 * @returns {dc.dataGrid}
 */
dc.dataGrid = function (parent, chartGroup) {
    var LABEL_CSS_CLASS = 'dc-grid-label';
    var ITEM_CSS_CLASS = 'dc-grid-item';
    var SECTION_CSS_CLASS = 'dc-grid-section dc-grid-group';
    var GRID_CSS_CLASS = 'dc-grid-top';

    var _chart = dc.baseMixin({});

    var _section = null;
    var _size = 999; // shouldn't be needed, but you might
    var _html = function (d) { return 'you need to provide an html() handling param:  ' + JSON.stringify(d); };
    var _sortBy = function (d) {
        return d;
    };
    var _order = d3.ascending;
    var _beginSlice = 0, _endSlice;

    var _htmlSection = function (d) {
        return '<div class=\'' + SECTION_CSS_CLASS + '\'><h1 class=\'' + LABEL_CSS_CLASS + '\'>' +
            _chart.keyAccessor()(d) + '</h1></div>';
    };

    _chart._mandatoryAttributes(['dimension', 'section']);

    _chart._doRender = function () {
        _chart.selectAll('div.' + GRID_CSS_CLASS).remove();

        renderItems(renderSections());

        return _chart;
    };

    function renderSections () {
        var sections = _chart.root().selectAll('div.' + GRID_CSS_CLASS)
                .data(nestEntries(), function (d) {
                    return _chart.keyAccessor()(d);
                });

        var itemSection = sections
                .enter()
                .append('div')
                .attr('class', GRID_CSS_CLASS);

        if (_htmlSection) {
            itemSection
                .html(function (d) {
                    return _htmlSection(d);
                });
        }

        sections.exit().remove();
        return itemSection;
    }

    function nestEntries () {
        var entries = _chart.dimension().top(_size);

        return d3.nest()
            .key(_chart.section())
            .sortKeys(_order)
            .entries(entries.sort(function (a, b) {
                return _order(_sortBy(a), _sortBy(b));
            }).slice(_beginSlice, _endSlice));
    }

    function renderItems (sections) {
        var items = sections.order()
                .selectAll('div.' + ITEM_CSS_CLASS)
                .data(function (d) {
                    return d.values;
                });

        items.exit().remove();

        items = items
            .enter()
                .append('div')
                .attr('class', ITEM_CSS_CLASS)
                .html(function (d) {
                    return _html(d);
                })
            .merge(items);

        return items;
    }

    _chart._doRedraw = function () {
        return _chart._doRender();
    };

    /**
     * Get or set the section function for the data grid. The section function takes a data row and
     * returns the key to specify to {@link https://github.com/d3/d3-collection/blob/master/README.md#nest d3.nest}
     * to split rows into sections.
     *
     * Do not pass in a crossfilter section as this will not work.
     * @method section
     * @memberof dc.dataGrid
     * @instance
     * @example
     * // section rows by the value of their field
     * chart
     *     .section(function(d) { return d.field; })
     * @param {Function} section Function taking a row of data and returning the nest key.
     * @returns {Function|dc.dataGrid}
     */
    _chart.section = function (section) {
        if (!arguments.length) {
            return _section;
        }
        _section = section;
        return _chart;
    };

    /**
     * Backward-compatible synonym for {@link dc.dataGrid#section section}.
     *
     * @method group
     * @memberof dc.dataGrid
     * @instance
     * @param {Function} groupFunction Function taking a row of data and returning the nest key.
     * @returns {Function|dc.dataGrid}
     */
    _chart.group = dc.logger.annotate(_chart.section,
                                      'consider using dataGrid.section instead of dataGrid.group for clarity');

    /**
     * Get or set the index of the beginning slice which determines which entries get displayed by the widget.
     * Useful when implementing pagination.
     * @method beginSlice
     * @memberof dc.dataGrid
     * @instance
     * @param {Number} [beginSlice=0]
     * @returns {Number|dc.dataGrid}
     */
    _chart.beginSlice = function (beginSlice) {
        if (!arguments.length) {
            return _beginSlice;
        }
        _beginSlice = beginSlice;
        return _chart;
    };

    /**
     * Get or set the index of the end slice which determines which entries get displayed by the widget.
     * Useful when implementing pagination.
     * @method endSlice
     * @memberof dc.dataGrid
     * @instance
     * @param {Number} [endSlice]
     * @returns {Number|dc.dataGrid}
     */
    _chart.endSlice = function (endSlice) {
        if (!arguments.length) {
            return _endSlice;
        }
        _endSlice = endSlice;
        return _chart;
    };

    /**
     * Get or set the grid size which determines the number of items displayed by the widget.
     * @method size
     * @memberof dc.dataGrid
     * @instance
     * @param {Number} [size=999]
     * @returns {Number|dc.dataGrid}
     */
    _chart.size = function (size) {
        if (!arguments.length) {
            return _size;
        }
        _size = size;
        return _chart;
    };

    /**
     * Get or set the function that formats an item. The data grid widget uses a
     * function to generate dynamic html. Use your favourite templating engine or
     * generate the string directly.
     * @method html
     * @memberof dc.dataGrid
     * @instance
     * @example
     * chart.html(function (d) { return '<div class='item '+data.exampleCategory+''>'+data.exampleString+'</div>';});
     * @param {Function} [html]
     * @returns {Function|dc.dataGrid}
     */
    _chart.html = function (html) {
        if (!arguments.length) {
            return _html;
        }
        _html = html;
        return _chart;
    };

    /**
     * Get or set the function that formats a section label.
     * @method htmlSection
     * @memberof dc.dataGrid
     * @instance
     * @example
     * chart.htmlSection (function (d) { return '<h2>'.d.key . 'with ' . d.values.length .' items</h2>'});
     * @param {Function} [htmlSection]
     * @returns {Function|dc.dataGrid}
     */
    _chart.htmlSection = function (htmlSection) {
        if (!arguments.length) {
            return _htmlSection;
        }
        _htmlSection = htmlSection;
        return _chart;
    };

    /**
     * Backward-compatible synonym for {@link dc.dataGrid#htmlSection htmlSection}.
     * @method htmlGroup
     * @memberof dc.dataGrid
     * @instance
     * @param {Function} [htmlGroup]
     * @returns {Function|dc.dataGrid}
     */
    _chart.htmlGroup = dc.logger.annotate(_chart.htmlSection,
                                          'consider using dataGrid.htmlSection instead of dataGrid.htmlGroup for clarity');

    /**
     * Get or set sort-by function. This function works as a value accessor at the item
     * level and returns a particular field to be sorted.
     * @method sortBy
     * @memberof dc.dataGrid
     * @instance
     * @example
     * chart.sortBy(function(d) {
     *     return d.date;
     * });
     * @param {Function} [sortByFunction]
     * @returns {Function|dc.dataGrid}
     */
    _chart.sortBy = function (sortByFunction) {
        if (!arguments.length) {
            return _sortBy;
        }
        _sortBy = sortByFunction;
        return _chart;
    };

    /**
     * Get or set sort the order function.
     * @method order
     * @memberof dc.dataGrid
     * @instance
     * @see {@link https://github.com/d3/d3-array/blob/master/README.md#ascending d3.ascending}
     * @see {@link https://github.com/d3/d3-array/blob/master/README.md#descending d3.descending}
     * @example
     * chart.order(d3.descending);
     * @param {Function} [order=d3.ascending]
     * @returns {Function|dc.dataGrid}
     */
    _chart.order = function (order) {
        if (!arguments.length) {
            return _order;
        }
        _order = order;
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};
