var app = null;
var map = null;
var map_markers = [];
var places = [{
    name: 'Taco Ocho',
    yelp_id: 'taco-ocho-richardson',
    yelp_data: null,
    lat: 32.974799,
    lng: -96.709017
},{
    name: 'Olive Burger',
    yelp_id: 'olive-burger-richardson-richardson',
    yelp_data: null,
    lat: 32.960417,
    lng: -96.734356
},{
    name: 'Ye Ole Butcher Shop',
    yelp_id: 'ye-ole-butcher-shop-plano',
    yelp_data: null,
    lat: 33.020294,
    lng: -96.704346
},{
    name: 'El Pueblito',
    yelp_id: 'el-pueblito-mexican-cocina-plano',
    yelp_data: null,
    lat: 33.056949,
    lng: -96.710714
},{
    name: "Del's Charcoal Burgers",
    yelp_id: 'dels-charcoal-burgers-richardson',
    yelp_data: null,
    lat: 32.948137,
    lng: -96.731356
}];

function AppViewModel(){
    var self = this;

    this.places_list = ko.observableArray(places);

    this.selected_place = ko.observable(null);

    this.search = ko.observable('');

    // returns filtered list of places based on search observable
    this.filtered_places = function(){
        var query = new RegExp(self.search(), 'i');

        return places.filter(function(place){
            return place.name.search(query) >= 0;
        });
    };

    // update places_list based on filtered list
    // also clears selected place if not in filtered list
    this.search.subscribe(function(){
        var filtered_places = self.filtered_places();
        var selected_place = self.selected_place();

        self.places_list(filtered_places);

        if(filtered_places.indexOf(selected_place) < 0){
            self.selected_place(null);
        }
    });

    // animate Google Map Marker upon selection
    this.selected_place.subscribe(renderMarkers);

    // add Google Map Markers based on filtered list of places
    this.search.subscribe(renderMarkers);
 }

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 33.002564,lng: -96.708245},
        zoom: 11
    });

    // notify search subscribers to render map markers
    app.search.notifySubscribers();
}

function renderMarkers(){
    // do not do anything if the map has not been initialized
    if(!map){
        return;
    }

    // clear all existing map markers
    map_markers.forEach(function(marker){
        marker.setMap(null);
    });
    map_markers = [];

    // append markers for each filtered_place into map_markers
    var filtered_places = app.filtered_places();
    filtered_places.forEach(function(place){
        var animation = null;
        var info_window = null;

        // add animation if place is selected
        // also builds an info window to be displayed
        if(place == app.selected_place()){
            animation = google.maps.Animation.BOUNCE;

            var html = '<h5>' + place.name + '</h5>';
            // if yelp data hasn't loaded yet, link the yelp page
            if(place.yelp_data === null){
                html += '<p>Still retrieving Yelp Data. Please try again soon or visit: ' +
                    '<a href="https://www.yelp.com/biz/' + place.yelp_id + '">Its Yelp Page</a>' +
                    '</p>';
            }
            // if something went wrong w/ the yelp request, link to the yelp page
            else if(place.yelp_data.error){
                html += '<p>Error retrieving Yelp Data. Please visit: ' +
                    '<a href="https://www.yelp.com/biz/' + place.yelp_id + '">Its Yelp Page</a>' +
                    '</p>';
            }
            // if all went right, show rating and review counts
            else{
                html += '<p>Rating: ' + place.yelp_data.rating + '</p>' +
                    '<p>Reviews: ' + place.yelp_data.review_count + '</p>' +
                    '<p><a href="https://www.yelp.com/biz/' + place.yelp_id + '">Its Yelp Page</a></p>';
            }

            info_window = new google.maps.InfoWindow({
                content: html
            });
        }

        var marker = new google.maps.Marker({
            position: {lat: place.lat, lng: place.lng},
            map: map,
            title: place.name,
            animation: animation
        });

        // Update selected_place when a marker is clicked
        marker.addListener('click', function(){
            app.selected_place(place);
        });

        map_markers.push(marker);

        // display the info window if it's defined
        if(info_window !== null){
            info_window.open(map, marker);

            // deselect the place when closing the info window
            info_window.addListener('closeclick', function(){
                info_window.marker = null;
                app.selected_place(null);
            });
        }
    });
}

// function gets Yelp data for all places
function getYelpData(){
    places.forEach(function(place){
        $.getJSON('http://udacity-fsnd-proj4.my.to/yelp_data/' + place.yelp_id, function(data){
            place.yelp_data = data;
        }).fail(function(){
            place.yelp_data = {error: true};
        });
    });
}

app = new AppViewModel();
ko.applyBindings(app);

// only run when DOM is ready
$(function(){
    getYelpData();
});
