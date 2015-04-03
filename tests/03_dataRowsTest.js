/* global beforeEach, afterEach */
describe('Filterable jQuery with data rows', function(){
    var $table,
        $controls,
        $searchBox;

    beforeEach(function(){
        loadFixtures('trDataAtrributes.html');
        $table = $('#testTable');
        $controls = $('#filterControls');
        $searchBox = $('#searchControls');
    });

    describe('When a checkbox refers to "data-filter-data-attr", the plugin...', function(){

        it('should filter the table using the data-filter-data-attr value on the tr', function(){
            $table.filterable();

            $('#filterReleased [value="yes"]', $controls).trigger('click');

            expect(visibleRows($table).length).toBeLessThan(6);
            expect(visibleRows($table)).toBeMatchedBy($('tbody', $table).find('[data-released="no"]'));
        });
    });

    describe('When the table row data is a comma separated list of values, the plugin...', function(){

        it('should handle that data like a normal array column', function(){
            $table.filterable({
                arrayData: {
                    'genres' : {
                        separator: ', ',
                        exclusive: false
                    }
                }
            });

            $('[value="fps"], [value="adventure"]', $controls).trigger('click');

            expect(visibleRows($table).length).toBe(4);
        });
    });
});
