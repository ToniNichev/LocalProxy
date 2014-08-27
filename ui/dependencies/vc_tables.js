function vc_tables() {
	this.tableContainer = '';

    this.init = function(tableContainer) {
    	this.tableContainer = tableContainer;
        this.resizeHeaders();
        var self = this;
        $(window).resize(
            function() {
                self.resizeHeaders();
            }
        );
    }

    this.resizeHeaders = function() {

        var tableColumns = 0;
        var c = 0;
        var sizes = [];


        $(this.tableContainer + '>table>thead>tr>th').each(
            function() {
                tableColumns ++;
            }
        );

        var r = $(this.tableContainer + '>table>tbody>tr>td').each(
            function() {
                if(c < tableColumns) {
                    sizes[c] = $(this).css('width');
                }
                c ++;
            }
        )


        c = 0;
        var r = $(this.tableContainer + '>table>thead>tr>th').each(
            function() {
                if(c < tableColumns) {
                    $(this).css('width', sizes[c]);
                }
                c++;
            }
        )
    }

}
