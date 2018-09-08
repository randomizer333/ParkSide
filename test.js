var t = getTime();
console.log(t);
function getTime() {
        var timestamp = Date.now();     // Get current time in UNIX EPOC format
        var d = new Date(timestamp),	// Convert the passed timestamp to milliseconds
                yyyy = d.getFullYear(),
                mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
                dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
                hh = d.getHours(),
                h = hh,
                min = ('0' + d.getMinutes()).slice(-2);		// Add leading 0.
                s = "00";
                s = d.subString(d.length - 2);
                /*
                var id = "ctl03_Tabs1";
                var lastFive = id.substr(id.length - 5); // => "Tabs1"
 */
                ampm = 'AM',
                time = 0;
        /*if (hh > 12) {
                h = hh - 12;
                ampm = 'PM';
        } else if (hh === 12) {
                h = 12;
                ampm = 'PM';
        } else if (hh == 0) {
                h = 12;
        }*/
        // ie: 2013-02-18, 8:35 AM	
        //time = yyyy h + ':' + min + ampm + '-' + mm + '-' + dd + '. ' +  ' ' +;
        time = h + ':' + min + ':' + s + ' ' + dd + '.' + mm + '.' + yyyy;
        return time;
}