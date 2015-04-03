function rowsContainingText($table, value){
    return $('td', $table).filter(function(){
        return $(this).text() === value;
    }).closest('tr');
}

function visibleRows($table){
    return $('tbody tr:visible', $table);
}
