/* global beforeEach, afterEach */
describe('Filterable jQuery', function(){
    var $table,
        $controls,
        $searchBox;

    beforeEach(function(){
        loadFixtures('testTable.html');
        $table = $('#testTable');
        $controls = $('#filterControls');
        $searchBox = $('#searchControls');
    });

    describe('On initialization the plugin...', function(){

        it('should be chainable', function(){
            $table.filterable().addClass('classified');

            expect($table).toHaveClass('classified');
        });

        it('should store the plugin instance on the DOM element', function(){
            $table.filterable();

            expect($table).toHaveData('plugin_filterable');
            expect($table.data('plugin_filterable')).toEqual(jasmine.any(Object));
        });

        it('should connect the table to the filter controls', function(){
            var intendedControls = $('#filterControls');

            $table.filterable();

            var plugin = $table.data('plugin_filterable');
            expect(plugin.$controls).toEqual(intendedControls);
        });

        it('should connect the table to the search controls', function(){
            var intendedControls = $('#searchControls');

            $table.filterable();

            var plugin = $table.data('plugin_filterable');
            expect(plugin.$searchBox).toEqual(intendedControls);
        });

        it('should check all checkboxes in the filter controls if instructed to do so in the options', function(){
            $(':checkbox', $controls).each(function(){
                $(this).prop('checked', false);
            });
            $('<input type="checkbox">')
                .addClass('notInControls')
                .insertAfter('#filterControls');

            $table.filterable({
                tickCheckboxesAtStart: true
            });

            expect($(':checked', $controls).length).toBe(9);
            expect($('.notInControls')).not.toBeChecked();
        });

        it('should clear the search box if instructed to do so in the options', function(){
            $searchBox.val('GTA');

            $table.filterable({
                clearSearchBoxAtStart: true
            });

            expect($searchBox.val()).toBe('');
            expect($('tbody tr:visible', $table).length).toBe(6);
        });

        it('should immediately filter if any checkboxes are unchecked at page load', function(){
            $('#filterReleased :checkbox').eq(0).prop('checked', false);

            $table.filterable();

            expect($('tbody tr:visible', $table).length).not.toBe(6);
        });

        it('should immediately filter if the search box contains text', function(){
            $searchBox.val('GTA');

            $table.filterable();

            expect($('tbody tr:visible', $table).length).toBe(1);
        });
    });

    describe('When playing with checkboxes, the plugin...', function(){

        it('should hide rows when unchecking checkboxes', function(){
            $table.filterable();

            $('#filterProducer input').eq(0).trigger('click');

            expect($('tbody tr:visible', $table).length).toBe(4);
            expect(rowsContainingText($table, 'Blizzard')).not.toBeVisible();
        });

        it('should show rows again when re-checking checkboxes', function(){
            var $uncheckedBox = $('#filterProducer :checkbox').eq(0);
            $uncheckedBox.prop('checked', false);

            $table.filterable();
            expect(rowsContainingText($table, 'Blizzard')).not.toBeVisible();

            $uncheckedBox.trigger('click');
            expect(rowsContainingText($table, 'Blizzard')).toBeVisible();
        });

        it('should apply a class to odd rows after filtering when set so in options', function(){
            $table.filterable({
                oddRowClass: 'is-odd'
            });
            $(':checkbox[value="Blizzard"]', $controls).trigger('click');

            expect($('tbody tr:visible').eq(0)).toHaveClass('is-odd');
            expect($('tbody tr:visible').eq(2)).toHaveClass('is-odd');
        });

        it('should apply a class to even rows after filtering when set so in options', function(){
            $table.filterable({
                evenRowClass: 'is-even'
            });
            $(':checkbox[value="Blizzard"]', $controls).trigger('click');

            expect($('tbody tr:visible').eq(1)).toHaveClass('is-even');
            expect($('tbody tr:visible').eq(3)).toHaveClass('is-even');
        });

        it('should remove odd / even classes before adding them again', function(){
            $table.filterable({
                oddRowClass: 'is-odd',
                evenRowClass: 'is-even'
            });

            $(':checkbox[value="Blizzard"]', $controls).trigger('click');

            expect(rowsContainingText($table, 'GTA V')).toHaveClass('is-odd');

            $(':checkbox[value="Blizzard"]', $controls).trigger('click');

            expect(rowsContainingText($table, 'GTA V')).not.toHaveClass('is-odd');
            expect(rowsContainingText($table, 'GTA V')).toHaveClass('is-even');
        });

        it('should be case sensitive in its filtering when set so in options', function(){
            var $blizzardBox = $(':checkbox', $controls).eq(2);
            $blizzardBox.val('blizzard');
            $table.filterable({
                caseSensitiveFilter: true
            });

            $blizzardBox.trigger('click');

            expect(rowsContainingText($table, 'Blizzard')).toBeVisible();
        });

        it('should appropriately hide rows that have extra white-space around their text', function(){
            $('td:contains("Blizzard")', $table).text('   Blizzard       ');
            $table.filterable();

            $(':checkbox', $controls).eq(2).trigger('click');

            expect(rowsContainingText($table, '   Blizzard       ')).toBeHidden();
        });

        it('should show a customizable message when all rows are hidden', function(){
            $table.filterable({
                emptyTableMessage: '<p class="error">No records found matching criteria</p>'
            });

            $(':checked', $controls).trigger('click');

            var visibleRow = $('tbody tr:visible', $table);
            expect(visibleRow.length).toBe(1);
            expect($('td', visibleRow).length).toBe(1);
            expect($('td', visibleRow)).toHaveProp('colspan', 4);
            expect($('td p', visibleRow)).toHaveClass('error');
            expect($('td p', visibleRow).text()).toBe('No records found matching criteria');
        });

        it('should hide the message when some rows are shown again', function(){
            $table.filterable({
                emptyTableMessage: 'no records found',
                emptyTableMessageClass: 'should-be-hidden'
            });

            $(':checked', $controls).trigger('click');
            $(':checkbox', $controls).trigger('click');

            expect($('.should-be-hidden')).not.toBeVisible();
        });
    });

    describe('When working with array columns', function(){

        describe('in non-exclusive mode, the plugin...', function(){

            beforeEach(function(){
                $table.filterable({
                    arrayColumns: {
                        3: {
                            separator: ', ',
                            exclusive: false
                        }
                    }
                });
            });

            it('should hide rows that match all unchecked filters', function(){
                $(':checkbox', $controls).filter(function(){
                    return $(this).val() === 'fps' || $(this).val() === 'adventure';
                }).trigger('click');

                expect(visibleRows($table).length).toBe(4);
                expect(rowsContainingText($table, 'fps, adventure')).toBeHidden();
            });

            it('should not hide rows that don\'t match all unchecked filters', function(){
                // click the 'puzzle' checkbox
                $('#filterGenre :checkbox', $controls).eq(3).trigger('click');

                expect(visibleRows($table).length).toBe(5);
                expect(rowsContainingText($table, 'puzzle')).toBeHidden();
                expect(rowsContainingText($table, 'fps, puzzle')).toBeVisible();
            });
        });

        describe('in exclusive mode, the plugin...', function(){
            beforeEach(function(){
                $table.filterable({
                    arrayColumns: {
                        3: {
                            separator: ', ',
                            exclusive: true
                        }
                    }
                });
            });

            it('should hide rows that match any of the unchecked filters', function(){
                // click the 'puzzle' checkbox
                $('#filterGenre :checkbox', $controls).eq(3).trigger('click');

                expect(visibleRows($table).length).toBe(3);
                expect(rowsContainingText($table, 'WoW')).toBeVisible();
                expect(rowsContainingText($table, 'GTA V')).toBeVisible();
                expect(rowsContainingText($table, 'FC 4')).toBeVisible();
            });
        });
    });

    describe('When working with checkbox values that differ from corresponding cell contents, the plugin', function(){
        beforeEach(function(){
            loadFixtures('complexArrayColumns.html');
            $table = $('#testTable');
            $controls = $('#filterControls');
        });

        it('should allow that checkbox value to be translated to cell contents with data properties', function(){
            $table.filterable();
            $('#filterProducer :checkbox', $controls).eq(2).trigger('click');

            expect(visibleRows($table).length).toBe(4);
            expect($(':contains(Ubisoft)')).toBeHidden();
        });

        it('should handle array columns the same way', function(){
            $table.filterable({
                arrayColumns: {
                    3: {
                        separator: ', '
                    }
                }
            });
            $('input[value="first-person-shooter"]', $controls).trigger('click');
            $('input[value="adventure"]', $controls).trigger('click');

            expect(visibleRows($table).length).not.toBe(6);
            expect(rowsContainingText($table, 'fps, adventure')).toBeHidden();
        });
    });

    describe('When using the search box, the plugin...', function(){

        it('should hide rows that do not match search criteria', function(){
            var searchTerm = 'Blizzard';
            $table.filterable();

            $searchBox.val(searchTerm).trigger('keyup');

            expect(visibleRows($table).length).toBe(2);
            expect(rowsContainingText($table, 'Blizzard')).toBeVisible();
            expect(rowsContainingText($table, 'Blizzard')).toEqual($('tbody tr:visible'));
        });

        it('should not be case sensitive by default', function(){
            $table.filterable();

            $searchBox.val('uBiSOft').trigger('keyup');

            expect(visibleRows($table).length).toBe(2);
            expect(visibleRows($table)).toEqual(rowsContainingText($table, 'Ubisoft'));
        });

        it('should be case sensitive if said so in the options', function(){
            $table.filterable({
                caseSensitiveSearch: true
            });

            $searchBox.val('uBiSOft').trigger('keyup');

            expect(visibleRows($table).length).toBe(0);
        });

        it('should show all rows again when the search box is emptied', function(){
            $table.filterable();

            $searchBox.val('rockstar').trigger('keyup');
            $searchBox.val('').trigger('keyup');

            expect(visibleRows($table).length).toBe(6);
        });
    });

    xdescribe('When turning on search highlighting, the plugin...', function(){

        it('should highlight the search term inside the table when configured to do so', function(){
            $table.filterable({
                searchHighlighting: true,
                searchHighlightingClass: 'is-highlighted'
            });

            $searchBox.val('ubi').trigger('keyup');

            expect($('.is-highlighted').length).toBe(2);
        });
    });
});

function rowsContainingText($table, value){
    return $('td', $table).filter(function(){
        return $(this).text() === value;
    }).closest('tr');
}

function visibleRows($table){
    return $('tbody tr:visible', $table);
}
