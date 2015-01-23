;(function($, window, document, undefined){
    'use strict';

    var defaults = {
        caseSensitiveFilter: false,
        caseSensitiveSearch: false,
        arrayColumns: {}
    };

    function Filterable($table, options){
        var self = this;
        self.config = $.extend({}, defaults, options);
        self.$table = $table;
        self.activeFilter = {};
        self.activeFilterColumns = [];
        self.activeSearchTerm = '';

        self.init();
    }

    Filterable.prototype = {

        init: function(){
            var self = this;
            self.$controls = $(self.$table.data('filter-controls'));
            self.$searchBox = $(self.$table.data('search-controls'));

            // Listen for checkbox changes
            self.$controls.on('change', 'input[type=checkbox]', function(){
                self.updateFilter($(this).data('filter-col'), $(this).val());
                self.checkRows();
            });

            // Listen for changes in the search box
            self.$searchBox.on('keyup', function(){
                self.updateSearchTerm($(this).val());
                self.checkRows();
            });

        },

        // Loop through rows and hide or show them
        checkRows: function(){
            var self = this;

            self.$table.find('tbody tr').each(function(){
                if ( self.rowIsFiltered(this) || !self.rowContainsSearchItem(this) ){
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });
        },

        // Check if row should be hidden
        rowIsFiltered: function(row){
            var someCellFailsFilter = false;

            for ( var i in this.activeFilterColumns ){
                var currentFilteredColumn = this.activeFilterColumns[i],
                    textAtColumn = $($(row).find('td')[currentFilteredColumn]).text();

                // check if we are dealing with an arrayFilter
                if ( this.config.arrayColumns.hasOwnProperty(currentFilteredColumn) ) {
                    if ( this.checkArrayFilter(textAtColumn, currentFilteredColumn) ) {
                        someCellFailsFilter = true;
                        break;
                    }
                } else {
                    if ( this.checkSimpleFilter(textAtColumn, currentFilteredColumn) ){
                        someCellFailsFilter = true;
                        break;
                    }
                }
            }

            return someCellFailsFilter;
        },

        // Simple check if cell contains filtered text
        checkSimpleFilter: function(text, columnIndex){
            return $.inArray(text.toUpperCase(), this.activeFilter[columnIndex]) > -1;
        },

        // Check how multiple values in a cell compare to a filter
        checkArrayFilter: function(text, columnIndex){
            var separator = this.config.arrayColumns[columnIndex].separator,
                exclusive = this.config.arrayColumns[columnIndex].exclusive,
                textItems = text.split(separator);

            if ( ! this.config.caseSensitiveFilter ){
                textItems = $.map(textItems, function(text){
                    return text.toUpperCase();
                });
            }

            // For speed, we check if the cell contains more items than the filter.
            // If so, we know that some of those items are NOT filtered
            if ( ! exclusive && textItems.length > this.activeFilter[columnIndex].length ) {
                return false;
            }

            // Next we go over each each cell item and check if it is filtered.
            // The moment we find an item that is not in the filter, we know we
            // should show the row, so we break.

            if ( exclusive ) {
                var textIsInFilter = false;

                for ( var i in textItems ) {
                    if ($.inArray(textItems[i], this.activeFilter[columnIndex]) > - 1 ) {
                        textIsInFilter = true;
                    }
                }

                return textIsInFilter;
            }

            for ( var j in textItems ) {
                if ($.inArray(textItems[j], this.activeFilter[columnIndex]) === -1 ) {
                    return false;
                }
            }

            // Nothing made us decide the row should NOT be filtered, so we return
            // TRUE, meaning: yes, go ahead and hide this row.
            return true;
        },

        // Check if any cell in a row contains the current search term
        rowContainsSearchItem: function(row){
            if ( this.activeSearchTerm === '' ) {
                return true;
            }

            var self = this,
                aCellContainsSearchTerm = false;

            $(row).find('td').each(function(){
                var cellText = self.config.caseSensitiveSearch ? $(this).text() : $(this).text().toUpperCase();

                if ( cellText.indexOf(self.activeSearchTerm) > -1 ) {
                    aCellContainsSearchTerm = true;
                    return false;
                }
            });

            return aCellContainsSearchTerm;
        },

        updateFilter: function(columnIndex, value){
            value = this.config.caseSensitiveFilter ? value : value.toUpperCase();
            // create array for the filtered column values if it doesn't exist already
            this.activeFilter[columnIndex] = this.activeFilter[columnIndex] || [];

            var foundAtIndex = $.inArray(value, this.activeFilter[columnIndex]);

            if (foundAtIndex > -1) {
                // remove the value from the array if it already exists
                this.activeFilter[columnIndex].splice(foundAtIndex, 1);
            } else {
                // add the value if it doesn't exist yet
                this.activeFilter[columnIndex].push(value);
            }

            // Keep track if which columns actually have a filter active
            this.activeFilterColumns = $.map(this.activeFilter, $.proxy(function(value, key){
                if ( this.activeFilter[key].length ) {
                    return key;
                }
            }, this));

        },

        updateSearchTerm: function(searchTerm){
            this.activeSearchTerm = this.config.caseSensitiveSearch ? searchTerm : searchTerm.toUpperCase();
            console.log(this.activeSearchTerm);
        }
    };


    $.fn.filterable = function(options){
        return this.each(function(){
            new Filterable($(this), options);
            return this;
        });
    };
})(jQuery, window, document);
