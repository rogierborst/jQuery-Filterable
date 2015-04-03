/* global beforeEach, afterEach */
describe('Filterable jQuery with array columns', function() {
    var $table,
        $controls,
        $searchBox;

    beforeEach(function () {
        loadFixtures('testTable.html');
        $table = $('#testTable');
        $controls = $('#filterControls');
        $searchBox = $('#searchControls');
    });

    describe('In non-exclusive mode, the plugin...', function () {

        beforeEach(function () {
            $table.filterable({
                arrayData: {
                    3: {
                        separator: ', ',
                        exclusive: false
                    }
                }
            });
        });

        it('should hide rows that match all unchecked filters', function () {
            $(':checkbox', $controls).filter(function () {
                return $(this).val() === 'fps' || $(this).val() === 'adventure';
            }).trigger('click');

            expect(visibleRows($table).length).toBe(4);
            expect(rowsContainingText($table, 'fps, adventure')).toBeHidden();
        });

        it('should not hide rows that don\'t match all unchecked filters', function () {
            // click the 'puzzle' checkbox
            $('#filterGenre :checkbox', $controls).eq(3).trigger('click');

            expect(visibleRows($table).length).toBe(5);
            expect(rowsContainingText($table, 'puzzle')).toBeHidden();
            expect(rowsContainingText($table, 'fps, puzzle')).toBeVisible();
        });
    });

    describe('In exclusive mode, the plugin...', function () {
        beforeEach(function () {
            $table.filterable({
                arrayData: {
                    3: {
                        separator: ', ',
                        exclusive: true
                    }
                }
            });
        });

        it('should hide rows that match any of the unchecked filters', function () {
            // click the 'puzzle' checkbox
            $('#filterGenre :checkbox', $controls).eq(3).trigger('click');

            expect(visibleRows($table).length).toBe(3);
            expect(rowsContainingText($table, 'WoW')).toBeVisible();
            expect(rowsContainingText($table, 'GTA V')).toBeVisible();
            expect(rowsContainingText($table, 'FC 4')).toBeVisible();
        });
    });

    describe('When working with checkbox values that differ from corresponding cell contents, the plugin', function() {
        beforeEach(function () {
            loadFixtures('complexArrayColumns.html');
            $table = $('#testTable');
            $controls = $('#filterControls');
        });

        it('should handle array columns correctly', function(){
            $table.filterable({
                arrayData: {
                    3: {
                        separator: ', '
                    }
                }
            });
            $('input[value="first-person-shooter"]', $controls).trigger('click');
            $('input[value="adventure"]', $controls).trigger('click');

            expect(visibleRows($table).length).not.toBe(6);
            expect(visibleRows($table).length).toBe(4);
            expect(rowsContainingText($table, 'fps, adventure')).toBeHidden();
        });

    });
});
