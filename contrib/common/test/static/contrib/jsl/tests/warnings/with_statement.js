function with_statement() {
    var o = {};
    
    with (o) { /*warning:with_statement*/
        this.x = this.y;
    }
}
