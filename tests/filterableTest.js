/* global beforeEach, afterEach */
describe('Filterable jQuery', function(){
    describe('On initialization', function(){
        var $table,
            $controls

        beforeEach(function(){
            loadFixtures('testTable.html');
            $table = $('#testTable');
            $controls = $('#filterControls');
        });

        it('should be chainable', function(){
            $table.filterable().addClass('classified');

            expect($table).toHaveClass('classified');
        });
    });
});
